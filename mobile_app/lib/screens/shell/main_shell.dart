import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/app_background.dart';

/// Bottom-navigation shell hosting the five primary tabs. Uses go_router's
/// [StatefulNavigationShell] so each tab keeps its own navigation state.
class MainShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(authControllerProvider).user?.role;
    final isOwner = role == UserRole.clubOwner;

    // During owner onboarding (no approved club yet) hide the bottom navigation
    // so the owner stays focused on the registration form / status screen. The
    // full owner tabs appear only once their club is approved.
    var ownerApproved = false;
    if (isOwner) {
      ownerApproved = ref.watch(myClubProvider).maybeWhen(
            data: (club) => club?.status == 'approved',
            orElse: () => false,
          );
    }
    final showNav = !isOwner || ownerApproved;

    final destinations = isOwner
        ? const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.storefront_outlined),
              selectedIcon: Icon(Icons.storefront_rounded),
              label: 'Clubs',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_business_outlined),
              selectedIcon: Icon(Icons.add_business_rounded),
              label: 'Tools',
            ),
            NavigationDestination(
              icon: Icon(Icons.event_outlined),
              selectedIcon: Icon(Icons.event_rounded),
              label: 'Events',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ]
        : const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_outlined),
              selectedIcon: Icon(Icons.search_rounded),
              label: 'Search',
            ),
            NavigationDestination(
              icon: Icon(Icons.favorite_border_rounded),
              selectedIcon: Icon(Icons.favorite_rounded),
              label: 'Favorites',
            ),
            NavigationDestination(
              icon: Icon(Icons.event_outlined),
              selectedIcon: Icon(Icons.event_rounded),
              label: 'Events',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ];

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: navigationShell,
      extendBody: true,
      bottomNavigationBar: showNav
          ? Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: GlassSurface(
                borderRadius: AppRadius.xlAll,
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                child: NavigationBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  height: 64,
                  selectedIndex: navigationShell.currentIndex,
                  onDestinationSelected: _onTap,
                  labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                  destinations: destinations,
                ),
              ),
            )
          : null,
    );
  }
}
