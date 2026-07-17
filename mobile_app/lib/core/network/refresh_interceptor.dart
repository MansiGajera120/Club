import 'package:dio/dio.dart';

import '../../services/storage_service.dart';
import 'api_endpoints.dart';

/// Transparently refreshes an expired access token on a 401 and retries the
/// original request. Extends [QueuedInterceptor] so concurrent 401s queue and
/// share a single refresh instead of firing many in parallel.
///
/// A separate bare [Dio] ([_refreshDio], without this interceptor) is used for
/// the refresh call and the retry to avoid recursion. On refresh failure the
/// stored tokens are cleared and [_onSessionExpired] is invoked so the app can
/// drop the session and route back to sign-in.
class RefreshInterceptor extends QueuedInterceptor {
  final StorageService _storage;
  final Dio _refreshDio;
  final void Function()? onSessionExpired;

  RefreshInterceptor(
    this._storage,
    this._refreshDio, {
    this.onSessionExpired,
  });

  /// Endpoints that never carry (or must never refresh) an access token — a 401
  /// from these must not trigger a token refresh.
  bool _skipRefresh(String path) =>
      path.contains('/auth/login') ||
      path.contains('/auth/signup') ||
      path.contains('/auth/refresh') ||
      path.contains('/auth/google') ||
      path.contains('/auth/apple') ||
      path.contains('/auth/forgot-password') ||
      path.contains('/auth/reset-password') ||
      path.contains('/auth/verify-otp') ||
      path.contains('/auth/verify-email') ||
      path.contains('/auth/resend-verification') ||
      path.contains('/auth/logout');

  String? _bearerToken(RequestOptions options) {
    final auth = options.headers['Authorization'];
    if (auth is String && auth.startsWith('Bearer ')) {
      return auth.substring('Bearer '.length);
    }
    return null;
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final options = err.requestOptions;
    final alreadyRetried = options.extra['retried'] == true;

    if (err.response?.statusCode != 401 ||
        _skipRefresh(options.path) ||
        alreadyRetried) {
      return handler.next(err);
    }

    final refreshToken = await _storage.refreshToken;
    if (refreshToken == null || refreshToken.isEmpty) {
      return handler.next(err);
    }

    // If a prior queued 401 already refreshed the token while this request was
    // waiting, just retry with the fresh token instead of refreshing again.
    final sentAccess = _bearerToken(options);
    final currentAccess = await _storage.accessToken;
    if (sentAccess != null &&
        currentAccess != null &&
        currentAccess.isNotEmpty &&
        currentAccess != sentAccess) {
      return _retry(options, currentAccess, handler, err);
    }

    try {
      final res = await _refreshDio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
      );
      final data = res.data is Map ? res.data['data'] : null;
      final newAccess = data is Map ? data['accessToken'] as String? : null;
      final newRefresh = data is Map ? data['refreshToken'] as String? : null;
      if (newAccess == null ||
          newAccess.isEmpty ||
          newRefresh == null ||
          newRefresh.isEmpty) {
        throw StateError('Malformed refresh response');
      }
      await _storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);
      return _retry(options, newAccess, handler, err);
    } catch (_) {
      await _storage.clearTokens();
      onSessionExpired?.call();
      return handler.next(err);
    }
  }

  Future<void> _retry(
    RequestOptions options,
    String accessToken,
    ErrorInterceptorHandler handler,
    DioException original,
  ) async {
    options.headers['Authorization'] = 'Bearer $accessToken';
    options.extra['retried'] = true;
    try {
      final clone = await _refreshDio.fetch(options);
      return handler.resolve(clone);
    } on DioException catch (e) {
      return handler.next(e);
    } catch (_) {
      return handler.next(original);
    }
  }
}
