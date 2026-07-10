import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';

/// Profile tab: user header, appearance toggle, owner shortcut, and logout.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  String _roleLabel(UserRole role) {
    switch (role) {
      case UserRole.clubOwner:
        return 'Club Owner';
      case UserRole.admin:
        return 'Admin';
      case UserRole.parent:
        return 'User';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Profile'), centerTitle: false),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 100),
        children: [
          AppCard(
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: AppRadius.pillAll,
                  child: SizedBox(
                    width: 64,
                    height: 64,
                    child: CachedImage(
                      url: user?.avatarUrl,
                      placeholderIcon: Icons.person,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.name ?? '—',
                          style: Theme.of(context).textTheme.titleLarge),
                      Text(user?.email ?? '',
                          style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 4),
                      if (user != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: AppRadius.pillAll,
                          ),
                          child: Text(_roleLabel(user.role),
                              style: const TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _Tile(
            icon: Icons.edit_outlined,
            title: 'Edit profile',
            onTap: () => context.pushNamed(RouteNames.editProfile),
          ),
          if (user?.role == UserRole.clubOwner)
            _Tile(
              icon: Icons.storefront_outlined,
              title: 'My clubs',
              onTap: () => context.pushNamed(RouteNames.myClubs),
            ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Log out',
            icon: Icons.logout,
            variant: AppButtonVariant.outline,
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _Tile({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppCard(
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary),
            const SizedBox(width: AppSpacing.md),
            Expanded(
                child: Text(title,
                    style: Theme.of(context).textTheme.bodyLarge)),
            const Icon(Icons.chevron_right, size: 20),
          ],
        ),
      ),
    );
  }
}

