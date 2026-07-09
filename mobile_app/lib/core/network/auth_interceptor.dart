import 'package:dio/dio.dart';

import '../../services/storage_service.dart';

/// Attaches the bearer access token to outgoing requests.
///
/// Token refresh-on-401 is wired up in Phase 6 once the auth flow exists; the
/// hook is intentionally isolated here so that change is local.
class AuthInterceptor extends Interceptor {
  final StorageService _storage;

  AuthInterceptor(this._storage);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
