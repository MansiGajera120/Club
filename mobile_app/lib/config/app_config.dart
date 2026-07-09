import 'package:flutter/foundation.dart';

/// Application environment configuration.
///
/// API URL is chosen automatically:
/// - **Debug / dev** → `http://localhost:5000/api/v1`
/// - **Release / prod** → `https://club-1r4i.onrender.com/api/v1`
///
/// Override any time with `--dart-define=API_BASE_URL=...`
/// (Android emulator: `http://10.0.2.2:5000/api/v1`).
enum Environment { dev, staging, prod }

class AppConfig {
  const AppConfig._();

  static const String _localApiBaseUrl = 'http://localhost:5000/api/v1';
  static const String _productionApiBaseUrl =
      'https://club-1r4i.onrender.com/api/v1';

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

  /// True for release builds or when `ENV=prod`.
  static bool get isProduction =>
      kReleaseMode || environment == Environment.prod;

  /// Base URL of the backend REST API, including the version prefix.
  static String get apiBaseUrl {
    const override = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (override.isNotEmpty) return override;
    if (isProduction) return _productionApiBaseUrl;
    return _localApiBaseUrl;
  }

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
