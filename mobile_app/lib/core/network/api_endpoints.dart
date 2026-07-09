/// Centralized REST endpoint paths (relative to [AppConfig.apiBaseUrl]).
///
/// Kept as a single source of truth so paths never drift between features.
/// Feature endpoints are added as their APIs land (Phases 6–8).
class ApiEndpoints {
  const ApiEndpoints._();

  // Health
  static const String health = '/health';

  // Auth
  static const String login = '/auth/login';
  static const String signup = '/auth/signup';
  static const String logout = '/auth/logout';
  static const String refresh = '/auth/refresh';
  static const String verifyEmail = '/auth/verify-email';
  static const String verifyOtp = '/auth/verify-otp';
  static const String resendVerification = '/auth/resend-verification';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String googleLogin = '/auth/google';
  static const String appleLogin = '/auth/apple';

  // Users
  static const String me = '/users/me';

  // Clubs
  static const String clubs = '/clubs';
  static String club(String id) => '/clubs/$id';

  // Events
  static const String events = '/events';

  // Favorites
  static const String favorites = '/favorites';
}
