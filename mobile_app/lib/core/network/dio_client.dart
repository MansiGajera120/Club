import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../config/app_config.dart';
import '../../services/storage_service.dart';
import '../error/exceptions.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';

/// Configured [Dio] instance factory. Owns base options, interceptors and the
/// translation of [DioException]s into the app's typed [AppException]s.
class DioClient {
  final Dio dio;

  DioClient(StorageService storage, {void Function()? onSessionExpired})
    : dio = Dio() {
    final baseOptions = BaseOptions(
      baseUrl: AppConfig.apiOrigin,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      contentType: Headers.jsonContentType,
      responseType: ResponseType.json,
    );

    dio.options = baseOptions;

    // Bare client (no refresh interceptor) used to refresh + retry safely.
    final refreshDio = Dio()..options = baseOptions;

    dio.interceptors.add(AuthInterceptor(storage));
    dio.interceptors.add(
      RefreshInterceptor(
        storage,
        refreshDio,
        onSessionExpired: onSessionExpired,
      ),
    );

    if (!AppConfig.isProduction) {
      debugPrint('API origin: ${AppConfig.apiOrigin}');
      debugPrint('API base URL: ${AppConfig.apiBaseUrl}');
      dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => debugPrint(obj.toString()),
        ),
      );
    }
  }

  /// Convert a low-level [DioException] into a domain [AppException].
  static AppException mapError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkException('Connection timed out');
      case DioExceptionType.connectionError:
        return const NetworkException('Unable to reach the server');
      case DioExceptionType.cancel:
        return const NetworkException('Request cancelled');
      case DioExceptionType.badResponse:
        final status = e.response?.statusCode;
        final data = e.response?.data;
        var message = (data is Map && data['message'] is String)
            ? data['message'] as String
            : 'Request failed';
        // Backend 404s include the path — keep the human part only.
        if (message.contains('The requested route does not exist')) {
          message =
              'Could not reach the server API. Make sure the backend is running '
              'at ${AppConfig.apiBaseUrl}.';
        }
        final errors = (data is Map && data['errors'] is List)
            ? List<Map<String, dynamic>>.from(data['errors'] as List)
            : <Map<String, dynamic>>[];
        if (status == 401 || status == 403) {
          return UnauthorizedException(message, statusCode: status);
        }
        return ServerException(message, statusCode: status, errors: errors);
      default:
        return const NetworkException('Unexpected network error');
    }
  }
}
