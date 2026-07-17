/// Named routes and their paths. Referenced by the router and by any code that
/// navigates, so route strings live in exactly one place.
class RouteNames {
  const RouteNames._();

  static const String splash = 'splash';
  static const String splashPath = '/';

  static const String login = 'login';
  static const String loginPath = '/login';

  static const String signup = 'signup';
  static const String signupPath = '/signup';

  static const String forgotPassword = 'forgot-password';
  static const String forgotPasswordPath = '/forgot-password';

  static const String resetPassword = 'reset-password';
  static const String resetPasswordPath = '/reset-password';

  // Bottom-navigation tabs
  static const String home = 'home';
  static const String homePath = '/home';

  static const String search = 'search';
  static const String searchPath = '/search';

  static const String favorites = 'favorites';
  static const String favoritesPath = '/favorites';

  static const String events = 'events';
  static const String eventsPath = '/events';

  static const String profile = 'profile';
  static const String profilePath = '/profile';

  // Pushed above the shell
  static const String clubDetail = 'club-detail';
  static const String clubDetailPath = '/club/:id';

  static const String myClubs = 'my-clubs';
  static const String myClubsPath = '/my-clubs';

  static const String clubForm = 'club-form';
  static const String clubFormPath = '/club-form';

  static const String eventForm = 'event-form';
  static const String eventFormPath = '/event-form';

  static const String eventDetail = 'event-detail';
  static const String eventDetailPath = '/event-detail';

  static const String editProfile = 'edit-profile';
  static const String editProfilePath = '/edit-profile';

  static const String changePassword = 'change-password';
  static const String changePasswordPath = '/change-password';

  static const String contactUs = 'contact-us';
  static const String contactUsPath = '/contact-us';

  static const String legalDocument = 'legal-document';
  static const String legalDocumentPath = '/legal/:type';

  /// Paths reachable without authentication.
  static const Set<String> publicPaths = {
    loginPath,
    signupPath,
    forgotPasswordPath,
    resetPasswordPath,
  };
}
