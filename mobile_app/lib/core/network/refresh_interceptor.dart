import 'package:dio/dio.dart';

import '../../services/storage_service.dart';
import 'api_endpoints.dart';

/// Transparently refreshes an expired access token on a 401 and retries the
/// original request. Extends [QueuedInterceptor] so concurrent 401s queue and
/// share a single refresh instead of firing many in parallel.
///
/// A separate bare [Dio] ([_refreshDio], without this interceptor) is used for
/// the refresh call and the retry to avoid recursion. On refresh failure the
/// stored tokens are cleared so the app can fall back to the auth flow.
class RefreshInterceptor extends QueuedInterceptor {
  final StorageService _storage;
  final Dio _refreshDio;

  RefreshInterceptor(this._storage, this._refreshDio);

  bool _isAuthCall(String path) =>
      path.contains('/auth/login') ||
      path.contains('/auth/signup') ||
      path.contains('/auth/refresh') ||
      path.contains('/auth/google') ||
      path.contains('/auth/apple');

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final options = err.requestOptions;
    final alreadyRetried = options.extra['retried'] == true;

    if (err.response?.statusCode != 401 ||
        _isAuthCall(options.path) ||
        alreadyRetried) {
      return handler.next(err);
    }

    final refreshToken = await _storage.refreshToken;
    if (refreshToken == null || refreshToken.isEmpty) {
      return handler.next(err);
    }

    try {
      final res = await _refreshDio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
      );
      final data = res.data['data'] as Map<String, dynamic>;
      final newAccess = data['accessToken'] as String;
      final newRefresh = data['refreshToken'] as String;
      await _storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);

      // Retry the original request with the new token.
      options.headers['Authorization'] = 'Bearer $newAccess';
      options.extra['retried'] = true;
      final clone = await _refreshDio.fetch(options);
      return handler.resolve(clone);
    } catch (_) {
      await _storage.clearTokens();
      return handler.next(err);
    }
  }
}
