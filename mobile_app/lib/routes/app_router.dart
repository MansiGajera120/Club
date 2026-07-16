import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/club_model.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/reset_password_screen.dart';
import '../screens/club/club_detail_screen.dart';
import '../screens/events/events_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/owner/club_form_screen.dart';
import '../screens/owner/event_form_screen.dart';
import '../screens/owner/my_clubs_screen.dart';
import '../screens/owner/owner_actions_screen.dart';
import '../screens/owner/owner_home_gate.dart';
import '../screens/owner/owner_events_screen.dart';
import '../screens/profile/change_password_screen.dart';
import '../screens/profile/contact_us_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/profile/legal_document_screen.dart';
import '../screens/profile/legal_content.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/shell/main_shell.dart';
import '../screens/splash/splash_screen.dart';
import 'route_names.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

class _RoleAwareHome extends ConsumerWidget {
  const _RoleAwareHome();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(authControllerProvider).user?.role;
    return role == UserRole.clubOwner
        ? const OwnerHomeGate()
        : const HomeScreen();
  }
}

class _RoleAwareSearch extends ConsumerWidget {
  const _RoleAwareSearch();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const SearchScreen();
  }
}

class _RoleAwareFavorites extends ConsumerWidget {
  const _RoleAwareFavorites();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(authControllerProvider).user?.role;
    return role == UserRole.clubOwner
        ? const OwnerActionsScreen()
        : const FavoritesScreen();
  }
}

class _RoleAwareEvents extends ConsumerWidget {
  const _RoleAwareEvents();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(authControllerProvider).user?.role;
    return role == UserRole.clubOwner
        ? const OwnerEventsScreen()
        : const EventsScreen();
  }
}

/// Auth-aware Go Router. While the session resolves the user stays on the
/// splash screen; once resolved they are routed to the auth flow or the
/// bottom-navigation shell. Detail/form screens push above the shell.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier(0);
  ref.listen(
    authControllerProvider.select((s) => s.status),
    (_, _) => refresh.value++,
  );
  ref.onDispose(refresh.dispose);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RouteNames.splashPath,
    refreshListenable: refresh,
    redirect: (context, state) {
      final status = ref.read(authControllerProvider).status;
      final location = state.matchedLocation;
      final isPublic = RouteNames.publicPaths.contains(location);
      final onSplash = location == RouteNames.splashPath;

      if (status == AuthStatus.unknown) {
        return onSplash ? null : RouteNames.splashPath;
      }
      if (status == AuthStatus.unauthenticated) {
        return isPublic ? null : RouteNames.loginPath;
      }
      if (onSplash) {
        return RouteNames.homePath;
      }
      // Signed-in users may still open password recovery (e.g. from change password).
      if (location == RouteNames.loginPath ||
          location == RouteNames.signupPath) {
        return RouteNames.homePath;
      }
      return null;
    },
    routes: [
      GoRoute(
        name: RouteNames.splash,
        path: RouteNames.splashPath,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        name: RouteNames.login,
        path: RouteNames.loginPath,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        name: RouteNames.signup,
        path: RouteNames.signupPath,
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        name: RouteNames.forgotPassword,
        path: RouteNames.forgotPasswordPath,
        builder: (context, state) => ForgotPasswordScreen(
          initialEmail: state.uri.queryParameters['email'],
        ),
      ),
      GoRoute(
        name: RouteNames.resetPassword,
        path: RouteNames.resetPasswordPath,
        builder: (context, state) =>
            ResetPasswordScreen(email: state.uri.queryParameters['email']),
      ),

      // Bottom-navigation shell
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              name: RouteNames.home,
              path: RouteNames.homePath,
              builder: (context, state) => const _RoleAwareHome(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              name: RouteNames.search,
              path: RouteNames.searchPath,
              builder: (context, state) => const _RoleAwareSearch(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              name: RouteNames.favorites,
              path: RouteNames.favoritesPath,
              builder: (context, state) => const _RoleAwareFavorites(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              name: RouteNames.events,
              path: RouteNames.eventsPath,
              builder: (context, state) => const _RoleAwareEvents(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              name: RouteNames.profile,
              path: RouteNames.profilePath,
              builder: (context, state) => const ProfileScreen(),
            ),
          ]),
        ],
      ),

      // Pushed above the shell (cover the bottom bar)
      GoRoute(
        name: RouteNames.clubDetail,
        path: RouteNames.clubDetailPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) =>
            ClubDetailScreen(clubId: state.pathParameters['id']!),
      ),
      GoRoute(
        name: RouteNames.myClubs,
        path: RouteNames.myClubsPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const MyClubsScreen(),
      ),
      GoRoute(
        name: RouteNames.clubForm,
        path: RouteNames.clubFormPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) =>
            ClubFormScreen(club: state.extra as Club?),
      ),
      GoRoute(
        name: RouteNames.eventForm,
        path: RouteNames.eventFormPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          if (extra is EventFormArgs) {
            return EventFormScreen(
              clubId: extra.clubId,
              event: extra.event,
            );
          }
          return EventFormScreen(clubId: extra as String);
        },
      ),
      GoRoute(
        name: RouteNames.editProfile,
        path: RouteNames.editProfilePath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        name: RouteNames.changePassword,
        path: RouteNames.changePasswordPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        name: RouteNames.contactUs,
        path: RouteNames.contactUsPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ContactUsScreen(),
      ),
      GoRoute(
        name: RouteNames.legalDocument,
        path: RouteNames.legalDocumentPath,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final typeName = state.pathParameters['type'] ?? '';
          LegalDocumentType? document;
          for (final type in LegalDocumentType.values) {
            if (type.name == typeName) {
              document = type;
              break;
            }
          }
          if (document == null) {
            return const Scaffold(
              body: Center(child: Text('Document not found')),
            );
          }
          return LegalDocumentScreen(document: document);
        },
      ),
    ],
  );
});
