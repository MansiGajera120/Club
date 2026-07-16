import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
import '../../theme/app_spacing.dart';

/// A single destination in the floating bottom bar.
class _NavItem {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  const _NavItem(this.icon, this.selectedIcon, this.label);
}

/// Bottom-navigation shell hosting the primary tabs. Uses go_router's
/// [StatefulNavigationShell] so each tab keeps its own navigation state.
class MainShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  void _onTap(WidgetRef ref, int index) {
    final role = ref.read(authControllerProvider).user?.role;
    final isOwner = role == UserRole.clubOwner;
    int targetBranch = index;
    if (isOwner) {
      if (index == 2) {
        targetBranch = 3;
      } else if (index == 3) {
        targetBranch = 4;
      }
    }
    navigationShell.goBranch(
      targetBranch,
      initialLocation: targetBranch == navigationShell.currentIndex,
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

    final items = isOwner
        ? const [
            _NavItem(Icons.dashboard_outlined, Icons.dashboard_rounded, 'Dashboard'),
            _NavItem(Icons.search_outlined, Icons.search_rounded, 'Search'),
            _NavItem(Icons.event_outlined, Icons.event_rounded, 'Events'),
            _NavItem(Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
          ]
        : const [
            _NavItem(Icons.home_outlined, Icons.home_rounded, 'Home'),
            _NavItem(Icons.search_outlined, Icons.search_rounded, 'Search'),
            _NavItem(Icons.favorite_border_rounded, Icons.favorite_rounded, 'Favorites'),
            _NavItem(Icons.event_outlined, Icons.event_rounded, 'Events'),
            _NavItem(Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
          ];

    int selectedIndex = navigationShell.currentIndex;
    if (isOwner) {
      if (navigationShell.currentIndex == 3) {
        selectedIndex = 2;
      } else if (navigationShell.currentIndex == 4) {
        selectedIndex = 3;
      } else if (navigationShell.currentIndex == 2) {
        selectedIndex = 0;
      }
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: navigationShell,
      // Keep the body ABOVE the floating bar (don't extend behind it) so list
      // content is never hidden underneath the nav — critical on phones with an
      // on-screen system button bar, where the nav footprint is taller.
      extendBody: false,
      bottomNavigationBar: showNav
          ? _FloatingNavBar(
              items: items,
              selectedIndex: selectedIndex,
              onTap: (idx) => _onTap(ref, idx),
            )
          : null,
    );
  }
}

/// Solid, softly-elevated floating navigation bar. Rebuilt from a custom row so
/// every tab renders identically regardless of device — no frosted-glass or
/// Material `NavigationBar` layout quirks — and each item animates on selection.
class _FloatingNavBar extends StatelessWidget {
  final List<_NavItem> items;
  final int selectedIndex;
  final ValueChanged<int> onTap;

  const _FloatingNavBar({
    required this.items,
    required this.selectedIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          0,
          AppSpacing.lg,
          AppSpacing.md,
        ),
        child: Container(
          height: 70,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.xlAll,
            border: Border.all(color: AppColors.border),
            boxShadow: AppShadows.float,
          ),
          child: Row(
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: _NavButton(
                    item: items[i],
                    selected: i == selectedIndex,
                    onTap: () => onTap(i),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.primary : AppColors.textTertiary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.lgAll,
        splashColor: AppColors.primary.withValues(alpha: 0.08),
        highlightColor: AppColors.primary.withValues(alpha: 0.05),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOut,
              padding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 5,
              ),
              decoration: BoxDecoration(
                color: selected
                    ? AppColors.primary.withValues(alpha: 0.12)
                    : Colors.transparent,
                borderRadius: AppRadius.pillAll,
              ),
              child: Icon(
                selected ? item.selectedIcon : item.icon,
                size: 23,
                color: color,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                height: 1.1,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
