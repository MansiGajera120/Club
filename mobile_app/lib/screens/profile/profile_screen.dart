import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/app_config.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../widgets/widgets.dart';
import 'legal_content.dart';

/// Profile tab for parents and club owners — account, support, legal,
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
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
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
    final isLocal = _isLocalAccount(user);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: CustomScrollView(
        slivers: [
          SliverPersistentHeader(
            delegate: _ProfileHeaderDelegate(
              user: user,
              roleLabel: user == null ? '—' : _roleLabel(user.role),
              roleIcon: user == null ? Icons.person_outline : _roleIcon(user.role),
              minHeight: 120 + MediaQuery.of(context).padding.top,
              maxHeight: 330,
            ),
            pinned: true,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.xl,
                AppSpacing.lg,
                AppSpacing.xxl,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _SectionTitle(title: 'Account'),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: AppRadius.xlAll,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _ProfileMenuItem(
                          icon: Icons.person_outline_rounded,
                          iconColor: const Color(0xFF6366F1), // Indigo
                          title: 'Edit Profile',
                          subtitle: 'Update your name and photo',
                          onTap: () => context.pushNamed(RouteNames.editProfile),
                        ),
                        const Divider(height: 1, indent: 64),
                        if (isLocal)
                          _ProfileMenuItem(
                            icon: Icons.lock_outline_rounded,
                            iconColor: const Color(0xFFF59E0B), // Amber
                            title: 'Change Password',
                            subtitle: 'Update your sign-in details',
                            onTap: () => context.pushNamed(RouteNames.changePassword),
                          )
                        else
                          _ProfileMenuItem(
                            icon: Icons.shield_outlined,
                            iconColor: const Color(0xFF10B981), // Emerald
                            title: 'Sign-in Method',
                            subtitle: _socialSignInLabel(user?.provider),
                            onTap: () => AppToast.info(
                              'This account uses social sign-in. Manage your password with ${_socialProviderName(user?.provider)}.',
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),
                  const _SectionTitle(title: 'Support & Legal'),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: AppRadius.xlAll,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _ProfileMenuItem(
                          icon: Icons.contact_support_outlined,
                          iconColor: const Color(0xFF3B82F6), // Blue
                          title: 'Contact Us',
                          subtitle: 'Get help from our team',
                          onTap: () => context.pushNamed(RouteNames.contactUs),
                        ),
                        const Divider(height: 1, indent: 64),
                        _ProfileMenuItem(
                          icon: Icons.privacy_tip_outlined,
                          iconColor: const Color(0xFF8B5CF6), // Violet
                          title: 'Privacy Policy',
                          subtitle: 'How we handle your data',
                          onTap: () => context.pushNamed(
                            RouteNames.legalDocument,
                            pathParameters: {'type': LegalDocumentType.privacy.name},
                          ),
                        ),
                        const Divider(height: 1, indent: 64),
                        _ProfileMenuItem(
                          icon: Icons.description_outlined,
                          iconColor: const Color(0xFFF43F5E), // Rose
                          title: 'Terms & Conditions',
                          subtitle: 'Rules for using the platform',
                          onTap: () => context.pushNamed(
                            RouteNames.legalDocument,
                            pathParameters: {'type': LegalDocumentType.terms.name},
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),
                  
                  // Logout Button
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: user == null ? null : () => _confirmLogout(context, ref),
                      borderRadius: AppRadius.xlAll,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        decoration: BoxDecoration(
                          color: AppColors.danger.withValues(alpha: 0.1),
                          borderRadius: AppRadius.xlAll,
                          border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.logout_rounded, color: AppColors.danger, size: 22),
                            const SizedBox(width: AppSpacing.sm),
                            Text(
                              'Sign Out',
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: AppColors.danger,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),
                  Center(
                    child: Text(
                      '${AppConfig.appName} · v1.0.0',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.textTertiary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
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
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 4),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: AppColors.textTertiary,
              letterSpacing: 1.2,
            ),
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: AppRadius.xlAll,
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: theme.dividerColor,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileHeaderDelegate extends SliverPersistentHeaderDelegate {
  final UserModel? user;
  final String roleLabel;
  final IconData roleIcon;
  final double minHeight;
  final double maxHeight;

  _ProfileHeaderDelegate({
    required this.user,
    required this.roleLabel,
    required this.roleIcon,
    required this.minHeight,
    required this.maxHeight,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    // 0.0 -> fully expanded, 1.0 -> fully shrunk
    final progress = shrinkOffset / (maxExtent - minExtent);
    final theme = Theme.of(context);

    // Avatar size shrinks from 100 to 40
    final avatarSize = 100 - (60 * progress);
    
    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background Gradient (shrinks perfectly with header)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFFFF5A5F),
                    Color(0xFFFF8469),
                  ],
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x33FF5A5F),
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
            ),
          ),
          
          // AppBar Title (fades in as it shrinks)
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 0,
            right: 0,
            child: Opacity(
              opacity: progress.clamp(0.0, 1.0),
              child: Text(
                user?.name ?? 'Profile',
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
          ),

          // Main Content (fades out slightly and moves up)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Opacity(
              opacity: (1 - progress * 1.5).clamp(0.0, 1.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.9), width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: SizedBox(
                        width: avatarSize,
                        height: avatarSize,
                        child: user?.avatarUrl?.isNotEmpty == true
                            ? CachedImage(
                                url: user!.avatarUrl,
                              )
                            : Container(
                                color: Colors.white.withValues(alpha: 0.2),
                                child: Icon(
                                  Icons.person,
                                  color: Colors.white,
                                  size: avatarSize * 0.5,
                                ),
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    user?.name ?? '—',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _Badge(
                        icon: roleIcon,
                        label: roleLabel,
                      ),
                      if (user?.isEmailVerified == true) ...[
                        const SizedBox(width: AppSpacing.sm),
                        const _Badge(
                          icon: Icons.verified_rounded,
                          label: 'Verified',
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _ProfileHeaderDelegate oldDelegate) {
    return oldDelegate.user != user ||
        oldDelegate.minHeight != minHeight ||
        oldDelegate.maxHeight != maxHeight;
  }
}

class _Badge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _Badge({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: AppRadius.pillAll,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.5),
          width: 0.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
