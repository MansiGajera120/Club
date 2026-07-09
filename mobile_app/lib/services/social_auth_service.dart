import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../config/app_config.dart';
import '../core/error/exceptions.dart';

/// Obtains identity tokens from the platform social providers. The tokens are
/// sent to the backend, which verifies them and issues our own session tokens.
///
/// Requires platform configuration (Google client IDs, Apple Sign In
/// capability) to function on-device; the surface is stable so the auth flow is
/// wired today.
class SocialAuthService {
  final GoogleSignIn _google = GoogleSignIn.instance;
  bool _googleInitialized = false;

  /// Trigger Google Sign-In and return the ID token for the backend.
  ///
  /// [serverClientId] defaults to the configured Web client ID. On Android this
  /// must be supplied for Google to mint an ID token (otherwise `idToken` is
  /// null); the resulting token's audience is this Web client ID, which the
  /// backend accepts via its `GOOGLE_CLIENT_IDS` allow-list.
  Future<String> signInWithGoogle({String? serverClientId}) async {
    final resolvedServerClientId = serverClientId ??
        (AppConfig.googleServerClientId.isEmpty
            ? null
            : AppConfig.googleServerClientId);

    try {
      if (!_googleInitialized) {
        await _google.initialize(serverClientId: resolvedServerClientId);
        _googleInitialized = true;
      }

      final account =
          await _google.authenticate(scopeHint: const ['email', 'profile']);
      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw const AppException(
          'Google returned no ID token. Set GOOGLE_SERVER_CLIENT_ID to your Web '
          'OAuth client ID and register an Android OAuth client (package + SHA-1).',
        );
      }
      return idToken;
    } on GoogleSignInException catch (e) {
      // Surface the real reason instead of a generic error. The most common
      // Android failure is a misconfigured OAuth client (package name / SHA-1
      // not registered, or serverClientId is not a *Web* client).
      if (e.code == GoogleSignInExceptionCode.canceled) {
        throw const AppException('Google sign-in was cancelled');
      }
      final detail = e.description?.trim();
      throw AppException(
        'Google sign-in failed (${e.code.name})'
        '${detail != null && detail.isNotEmpty ? ': $detail' : ''}',
      );
    }
  }

  /// Trigger Sign in with Apple and return the identity token (+ name, only
  /// provided by Apple on the first authorization).
  Future<({String identityToken, String? name})> signInWithApple() async {
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: const [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );

    final token = credential.identityToken;
    if (token == null || token.isEmpty) {
      throw const AppException('Apple did not return an identity token');
    }

    final name = [credential.givenName, credential.familyName]
        .where((part) => part != null && part.isNotEmpty)
        .join(' ')
        .trim();

    return (identityToken: token, name: name.isEmpty ? null : name);
  }
}
