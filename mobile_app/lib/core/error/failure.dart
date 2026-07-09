/// Presentation-facing error type. Repositories translate exceptions into
/// [Failure]s so the UI never depends on transport details (Dio, sockets, …).
sealed class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection']);
}

class ServerFailure extends Failure {
  final int? statusCode;
  final List<Map<String, dynamic>> errors;
  const ServerFailure(
    super.message, {
    this.statusCode,
    this.errors = const [],
  });
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication required']);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Something went wrong']);
}
