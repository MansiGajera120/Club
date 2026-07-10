import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/app_config.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';
import 'legal_content.dart';

/// Profile tab for parents and club owners — account, owner shortcuts, legal,
/// and sign out.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  bool _isLocalAccount(UserModel? user) {
    final provider = user?.provider;
    return provider == null || provider == 'local';
  }

  String _roleLabel(UserRole role) {
    switch (role) {
      case UserRole.clubOwner:
        return 'Club owner';
      case UserRole.admin:
        return 'Admin';
      case UserRole.parent:
        return 'Parent';
    }
  }

  IconData _roleIcon(UserRole role) {
    switch (role) {
      case UserRole.clubOwner:
        return Icons.storefront_rounded;
      case UserRole.admin:
        return Icons.admin_panel_settings_outlined;
      case UserRole.parent:
        return Icons.family_restroom_rounded;
    }
  }

  Future<void> _launchEmail(BuildContext context) async {
    final uri = Uri(scheme: 'mailto', path: 'support@sportsclub.app');
    if (!await launchUrl(uri)) {
      AppToast.error('Could not open email app');
    }
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to sign in again to access your account.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    AppToast.info('Logging out…');
    await ref.read(authControllerProvider.notifier).logout();
    AppToast.success('Logged out successfully');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final theme = Theme.of(context);
    final isOwner = user?.role == UserRole.clubOwner;
    final isLocal = _isLocalAccount(user);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          100,
        ),
        children: [
          _ProfileHeader(
            user: user,
            roleLabel: user == null ? '—' : _roleLabel(user.role),
            roleIcon: user == null ? Icons.person_outline : _roleIcon(user.role),
          ),
          const SizedBox(height: AppSpacing.xl),
          _SectionTitle(title: 'Account'),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            padding: EdgeInsets.zero,
            variant: AppCardVariant.outlined,
            child: Column(
              children: [
                AppListTileCard(
                  icon: Icons.person_outline_rounded,
                  title: 'Edit profile',
                  subtitle: 'Update your name and profile photo',
                  onTap: () => context.pushNamed(RouteNames.editProfile),
                ),
                if (isLocal)
                  AppListTileCard(
                    icon: Icons.lock_outline_rounded,
                    title: 'Change password',
                    subtitle: 'Update your sign-in password',
                    onTap: () => context.pushNamed(RouteNames.changePassword),
                    showDivider: false,
                  )
                else
                  AppListTileCard(
                    icon: Icons.shield_outlined,
                    title: 'Sign-in method',
                    subtitle: _socialSignInLabel(user?.provider),
                    onTap: () => AppToast.info(
                      'This account uses social sign-in. Manage your password with ${_socialProviderName(user?.provider)}.',
                    ),
                    showDivider: false,
                  ),
              ],
            ),
          ),
          if (isOwner) ...[
            const SizedBox(height: AppSpacing.xl),
            _SectionTitle(title: 'Club owner'),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: EdgeInsets.zero,
              variant: AppCardVariant.outlined,
              child: Column(
                children: [
                  AppListTileCard(
                    icon: Icons.dashboard_outlined,
                    title: 'Owner dashboard',
                    subtitle: 'Overview of your club and activity',
                    onTap: () => context.go(RouteNames.homePath),
                  ),
                  AppListTileCard(
                    icon: Icons.storefront_outlined,
                    title: 'Manage my club',
                    subtitle: 'Edit club details and status',
                    onTap: () => context.go(RouteNames.searchPath),
                  ),
                  AppListTileCard(
                    icon: Icons.event_available_outlined,
                    title: 'My events',
                    subtitle: 'Create and manage club events',
                    onTap: () => context.go(RouteNames.eventsPath),
                    showDivider: false,
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          _SectionTitle(title: 'Support & legal'),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            padding: EdgeInsets.zero,
            variant: AppCardVariant.outlined,
            child: Column(
              children: [
                AppListTileCard(
                  icon: Icons.help_outline_rounded,
                  title: 'Help & support',
                  subtitle: 'Contact us for account or app issues',
                  onTap: () => _launchEmail(context),
                ),
                AppListTileCard(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy policy',
                  subtitle: 'How we handle your data',
                  onTap: () => context.pushNamed(
                    RouteNames.legalDocument,
                    pathParameters: {'type': LegalDocumentType.privacy.name},
                  ),
                ),
                AppListTileCard(
                  icon: Icons.description_outlined,
                  title: 'Terms & conditions',
                  subtitle: 'Rules for using Sports Club',
                  onTap: () => context.pushNamed(
                    RouteNames.legalDocument,
                    pathParameters: {'type': LegalDocumentType.terms.name},
                  ),
                  showDivider: false,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          AppButton(
            label: 'Log out',
            icon: Icons.logout_rounded,
            variant: AppButtonVariant.outline,
            onPressed: user == null
                ? null
                : () => _confirmLogout(context, ref),
          ),
          const SizedBox(height: AppSpacing.lg),
          Center(
            child: Text(
              '${AppConfig.appName} · v1.0.0',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _socialSignInLabel(String? provider) {
    return 'Signed in with ${_socialProviderName(provider)}';
  }

  String _socialProviderName(String? provider) {
    return switch (provider) {
      'google' => 'Google',
      'apple' => 'Apple',
      _ => 'social sign-in',
    };
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.titleMedium);
  }
}

class _ProfileHeader extends StatelessWidget {
  final UserModel? user;
  final String roleLabel;
  final IconData roleIcon;

  const _ProfileHeader({
    required this.user,
    required this.roleLabel,
    required this.roleIcon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final memberSince = user?.createdAt;

    return AppCard(
      variant: AppCardVariant.tinted,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.20),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipOval(
              child: SizedBox(
                width: 76,
                height: 76,
                child: CachedImage(
                  url: user?.avatarUrl,
                  placeholderIcon: Icons.person,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.name ?? '—',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.xs,
                  runSpacing: AppSpacing.xs,
                  children: [
                    _HeaderChip(
                      icon: roleIcon,
                      label: roleLabel,
                      color: AppColors.primary,
                    ),
                    if (user?.isEmailVerified == true)
                      const _HeaderChip(
                        icon: Icons.verified_rounded,
                        label: 'Verified',
                        color: AppColors.success,
                      ),
                  ],
                ),
                if (memberSince != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Member since ${Formatters.date(memberSince)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _HeaderChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: AppRadius.pillAll,
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
