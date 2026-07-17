import '../../config/app_config.dart';

/// Centralized REST endpoint paths (absolute from API host origin).
///
/// Paths always include [AppConfig.apiVersionPrefix] so Dio can use the host
/// origin as `baseUrl` without losing the version segment on requests.
class ApiEndpoints {
  const ApiEndpoints._();

  static const String _v1 = AppConfig.apiVersionPrefix;

  // Health
  static const String health = '$_v1/health';

  // Auth
  static const String login = '$_v1/auth/login';
  static const String signup = '$_v1/auth/signup';
  static const String logout = '$_v1/auth/logout';
  static const String refresh = '$_v1/auth/refresh';
  static const String verifyEmail = '$_v1/auth/verify-email';
  static const String verifyOtp = '$_v1/auth/verify-otp';
  static const String resendVerification = '$_v1/auth/resend-verification';
  static const String forgotPassword = '$_v1/auth/forgot-password';
  static const String verifyResetCode = '$_v1/auth/verify-reset-code';
  static const String resetPassword = '$_v1/auth/reset-password';
  static const String googleLogin = '$_v1/auth/google';
  static const String appleLogin = '$_v1/auth/apple';

  // Users
  static const String me = '$_v1/users/me';
  static const String changePassword = '$_v1/users/me/password';
  static const String verifyPassword = '$_v1/users/me/password/verify';

  // Clubs
  static const String clubs = '$_v1/clubs';
  static String club(String id) => '$_v1/clubs/$id';

  // Events
  static const String events = '$_v1/events';

  // Favorites
  static const String favorites = '$_v1/favorites';
}
