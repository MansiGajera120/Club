/// Low-level exceptions thrown by the data/network layer. These are caught in
/// repositories and converted into [Failure]s for the presentation layer.
class AppException implements Exception {
  final String message;
  final int? statusCode;

  const AppException(this.message, {this.statusCode});

  @override
  String toString() => 'AppException($statusCode): $message';
}

/// Network transport failure (timeout, no connection, cancelled).
class NetworkException extends AppException {
  const NetworkException(super.message);
}

/// The server responded with a non-2xx status.
class ServerException extends AppException {
  /// Optional field-level validation errors returned by the API.
  final List<Map<String, dynamic>> errors;

  const ServerException(
    super.message, {
    super.statusCode,
    this.errors = const [],
  });
}

/// Authentication/authorization failure (401/403).
class UnauthorizedException extends AppException {
  const UnauthorizedException(super.message, {super.statusCode});
}

/// Local cache/storage failure.
class CacheException extends AppException {
  const CacheException(super.message);
}
