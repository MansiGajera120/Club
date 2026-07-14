import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/error/exceptions.dart';
import '../models/auth_response.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';
import '../services/social_auth_service.dart';
import 'core_providers.dart';

/// High-level authentication status used to drive routing.
enum AuthStatus { unknown, authenticated, unauthenticated }

/// Immutable auth state exposed to the UI and the router.
class AuthState {
  final AuthStatus status;
  final UserModel? user;

  const AuthState({this.status = AuthStatus.unknown, this.user});

  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({AuthStatus? status, UserModel? user}) =>
      AuthState(status: status ?? this.status, user: user ?? this.user);
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioProvider));
});

final socialAuthServiceProvider = Provider<SocialAuthService>((ref) {
  return SocialAuthService();
});

/// Owns the authenticated session. On construction it restores the session by
/// validating any stored token against `/auth/me`. Mutating methods throw on
/// failure so screens can surface a message; state updates drive the router.
class AuthController extends Notifier<AuthState> {
  late final AuthRepository _repo = ref.read(authRepositoryProvider);
  late final SocialAuthService _social = ref.read(socialAuthServiceProvider);

  /// Session created by signup but not yet activated: the user must confirm the
  /// emailed OTP before we persist these tokens and route them into the app.
  AuthResponse? _pendingSignup;

  /// Email awaiting OTP verification, if a signup is in progress.
  String? get pendingEmail => _pendingSignup?.user.email;

  @override
  AuthState build() {
    _bootstrap();
    return const AuthState(status: AuthStatus.unknown);
  }

  Future<void> _bootstrap() async {
    // Artificial minimum delay allowing the splash screen to present beautifully
    await Future.delayed(const Duration(milliseconds: 2500));
    final storage = ref.read(storageServiceProvider);
    final token = await storage.accessToken;
    if (token == null || token.isEmpty) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }
    try {
      final user = await _repo.getMe();
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } catch (_) {
      await storage.clearTokens();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> _persist(AuthResponse res) async {
    await ref.read(storageServiceProvider).saveTokens(
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        );
    state = AuthState(status: AuthStatus.authenticated, user: res.user);
  }

  Future<void> login({required String email, required String password}) async {
    await _persist(await _repo.login(email: email, password: password));
  }

  /// Step 1 of signup: create the account and trigger the verification OTP
  /// email. The session is held pending until [verifyPendingOtp] succeeds, so
  /// the router does NOT navigate into the app yet.
  Future<void> startSignup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    _pendingSignup = await _repo.signup(
      name: name,
      email: email,
      password: password,
      role: role,
    );
  }

  /// Step 2 of signup: confirm the emailed OTP, then activate the session.
  Future<void> verifyPendingOtp(String code) async {
    final pending = _pendingSignup;
    if (pending == null) {
      throw const AppException('Your signup session expired. Please sign up again.');
    }
    await _repo.verifyOtp(email: pending.user.email, code: code);
    _pendingSignup = null;
    await _persist(pending);
    // Reflect the now-verified user (best-effort).
    await refreshUser();
  }

  /// Re-send the verification OTP to the pending signup email.
  Future<void> resendPendingOtp() async {
    final email = _pendingSignup?.user.email;
    if (email == null) {
      throw const AppException('Your signup session expired. Please sign up again.');
    }
    await _repo.resendVerification(email);
  }

  /// Abandon an in-progress signup (e.g. user hit "back" to change email).
  void cancelPendingSignup() {
    _pendingSignup = null;
  }

  Future<void> loginWithGoogle() async {
    final idToken = await _social.signInWithGoogle();
    await _persist(await _repo.googleLogin(idToken));
  }

  Future<void> loginWithApple() async {
    final apple = await _social.signInWithApple();
    await _persist(
      await _repo.appleLogin(identityToken: apple.identityToken, name: apple.name),
    );
  }

  Future<void> logout() async {
    final storage = ref.read(storageServiceProvider);
    final refreshToken = await storage.refreshToken;
    try {
      await _repo.logout(refreshToken);
    } catch (_) {
      // ignore — clear the local session regardless
    }
    await storage.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Re-fetch the current user (e.g. after email verification).
  Future<void> refreshUser() async {
    try {
      state = state.copyWith(user: await _repo.getMe());
    } catch (_) {
      // keep current state on failure
    }
  }
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
