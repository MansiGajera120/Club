/// Application environment configuration.
///
/// Values are provided at build/run time via `--dart-define` so the same code
/// ships to every environment without hardcoded URLs. Example:
///
/// ```
/// flutter run --dart-define=API_BASE_URL=https://api.sportsclub.app
/// ```
enum Environment { dev, staging, prod }

class AppConfig {
  const AppConfig._();

  /// Current environment. Defaults to dev for local development.
  static const String _envName =
      String.fromEnvironment('ENV', defaultValue: 'dev');

  static Environment get environment {
    switch (_envName) {
      case 'prod':
        return Environment.prod;
      case 'staging':
        return Environment.staging;
      default:
        return Environment.dev;
    }
  }

  static bool get isProduction => environment == Environment.prod;

  /// Base URL of the backend REST API, including the version prefix.
  ///
  /// Defaults to the host machine's LAN IP so a physical device on the same
  /// Wi-Fi can reach the backend. For the Android emulator use `10.0.2.2`, and
  /// for the iOS simulator use `localhost`. Override per environment (or when
  /// your LAN IP changes) with:
  ///   `--dart-define=API_BASE_URL=http://<host-ip>:5000/api/v1`
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.1.41:5000/api/v1',
  );

  /// Google OAuth **Web** client ID, used as the `serverClientId` for
  /// `google_sign_in`. On Android this is REQUIRED for the SDK to return an
  /// ID token — without it `idToken` is null and Google sign-in silently fails.
  /// It must be the *Web* OAuth client from Google Cloud Console (not the
  /// Android one), and must be listed in the backend's `GOOGLE_CLIENT_IDS`.
  /// Override with:
  ///   `--dart-define=GOOGLE_SERVER_CLIENT_ID=<web-client-id>.apps.googleusercontent.com`
  static const String googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    // MUST be the *Web application* OAuth client. The Android client
    // (…m3qrj…) authorizes the app via package+SHA-1 but is NOT used here.
    defaultValue:
        '1058602312076-4air92dg6n6fn627e3ev36kckm2pub8g.apps.googleusercontent.com',
  );

  /// Network timeouts.
  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 20);

  /// Human-readable app name.
  static const String appName = 'Sports Club';
}
