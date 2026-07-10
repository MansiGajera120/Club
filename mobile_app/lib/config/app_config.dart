import 'package:flutter/foundation.dart';

/// Application environment configuration.
///
/// API URL is chosen automatically in debug:
/// - **Android** (emulator) → `http://10.0.2.2:5000/api/v1`
///   (`10.0.2.2` is the emulator's alias for the host machine's `localhost`)
/// - **iOS simulator / web / desktop** → `http://localhost:5000/api/v1`
/// - **Release / prod** → `https://club-1r4i.onrender.com/api/v1`
///
/// Running on a **physical device**? `localhost`/`10.0.2.2` won't work — point
/// it at your computer's LAN IP:
///   `--dart-define=API_BASE_URL=http://<your-pc-ip>:5000/api/v1`
enum Environment { dev, staging, prod }

class AppConfig {
  const AppConfig._();

  // `10.0.2.2` reaches the host machine from inside the Android emulator;
  // every other local target can use plain `localhost`.
  static final String _localApiBaseUrl =
      (!kIsWeb && defaultTargetPlatform == TargetPlatform.android)
          ? 'http://10.0.2.2:5000/api/v1'
          : 'http://localhost:5000/api/v1';
  static const String _productionApiBaseUrl =
      'https://club-1r4i.onrender.com/api/v1';

  /// API version segment appended to the host when missing from overrides.
  static const String apiVersionPrefix = '/api/v1';

  /// Strips any `/api/v1` suffix and returns `scheme://host:port` only.
  /// Dio uses this as [baseUrl]; versioned paths live on [ApiEndpoints].
  static String normalizeApiOrigin(String raw) {
    var url = raw.trim();
    if (url.isEmpty) return url;

    // Defensive cleanup: strip stray brackets/quotes that can leak in from a
    // malformed `--dart-define=API_BASE_URL=…` override (e.g. a trailing `]`
    // pasted from a JSON array), which would otherwise survive as junk on the
    // path and produce broken doubled URLs like `…/api/v1]/api/v1/auth/google`.
    url = url.replaceAll(RegExp(r'''^[\s"'\[\]]+|[\s"'\[\]]+$'''), '');
    if (url.isEmpty) return url;

    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }

    final uri = Uri.tryParse(url);
    if (uri == null || !uri.hasScheme) return url;

    var path = uri.path;
    if (path.endsWith(apiVersionPrefix)) {
      path = path.substring(0, path.length - apiVersionPrefix.length);
    }
    if (path == apiVersionPrefix) path = '';

    final origin = Uri(
      scheme: uri.scheme,
      host: uri.host,
      port: uri.hasPort ? uri.port : null,
      path: path.isEmpty ? null : path,
    );

    var result = origin.toString();
    while (result.endsWith('/')) {
      result = result.substring(0, result.length - 1);
    }
    return result;
  }

  /// Full API root (`origin` + `/api/v1`) for display and media URL building.
  static String apiBaseUrlFromOrigin(String origin) =>
      '${normalizeApiOrigin(origin)}$apiVersionPrefix';

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

  /// Resolved API URL from dart-define or environment defaults.
  static String get _resolvedApiUrl {
    const override = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (override.isNotEmpty) return override;
    if (isProduction) return _productionApiBaseUrl;
    return _localApiBaseUrl;
  }

  /// Host origin for Dio (`http://host:port`) — no `/api/v1` suffix.
  static String get apiOrigin => normalizeApiOrigin(_resolvedApiUrl);

  /// Full API root (`origin` + `/api/v1`) for media URLs and debugging.
  static String get apiBaseUrl => apiBaseUrlFromOrigin(apiOrigin);

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
