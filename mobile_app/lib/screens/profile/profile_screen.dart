import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/app_config.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
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
    final confirmed = await showAppConfirmDialog(
      context,
      icon: Icons.logout_rounded,
      title: 'Log out?',
      message: 'You will need to sign in again to access your account.',
      confirmLabel: 'Log out',
      destructive: true,
    );

    if (!confirmed || !context.mounted) return;

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
              minHeight: 66 + MediaQuery.of(context).padding.top,
              maxHeight: 312,
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
                  const SectionHeader(title: 'Account', padding: EdgeInsets.zero),
                  const SizedBox(height: AppSpacing.sm),
                  _SectionCard(
                    children: [
                      _ProfileMenuItem(
                        icon: Icons.person_outline_rounded,
                        iconColor: const Color(0xFF2563EB),
                        title: 'Edit Profile',
                        subtitle: 'Update your name and photo',
                        onTap: () => context.pushNamed(RouteNames.editProfile),
                      ),
                      const _MenuDivider(),
                      if (isLocal)
                        _ProfileMenuItem(
                          icon: Icons.lock_outline_rounded,
                          iconColor: const Color(0xFFF59E0B),
                          title: 'Change Password',
                          subtitle: 'Update your sign-in details',
                          onTap: () => context.pushNamed(RouteNames.changePassword),
                        )
                      else
                        _ProfileMenuItem(
                          icon: Icons.shield_outlined,
                          iconColor: const Color(0xFF16A34A),
                          title: 'Sign-in Method',
                          subtitle: _socialSignInLabel(user?.provider),
                          onTap: () => AppToast.info(
                            'This account uses social sign-in. Manage your password with ${_socialProviderName(user?.provider)}.',
                          ),
                        ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xl),
                  const SectionHeader(title: 'Support & Legal', padding: EdgeInsets.zero),
                  const SizedBox(height: AppSpacing.sm),
                  _SectionCard(
                    children: [
                      _ProfileMenuItem(
                        icon: Icons.contact_support_outlined,
                        iconColor: const Color(0xFF0EA5E9),
                        title: 'Contact Us',
                        subtitle: 'Get help from our team',
                        onTap: () => context.pushNamed(RouteNames.contactUs),
                      ),
                      const _MenuDivider(),
                      _ProfileMenuItem(
                        icon: Icons.privacy_tip_outlined,
                        iconColor: const Color(0xFF6366F1),
                        title: 'Privacy Policy',
                        subtitle: 'How we handle your data',
                        onTap: () => context.pushNamed(
                          RouteNames.legalDocument,
                          pathParameters: {'type': LegalDocumentType.privacy.name},
                        ),
                      ),
                      const _MenuDivider(),
                      _ProfileMenuItem(
                        icon: Icons.description_outlined,
                        iconColor: const Color(0xFF64748B),
                        title: 'Terms & Conditions',
                        subtitle: 'Rules for using the platform',
                        onTap: () => context.pushNamed(
                          RouteNames.legalDocument,
                          pathParameters: {'type': LegalDocumentType.terms.name},
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // Sign out — styled as a section card row for consistency.
                  _SignOutButton(
                    onTap:
                        user == null ? null : () => _confirmLogout(context, ref),
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

/// Grouped card wrapping a set of profile menu rows — crisp border, soft
/// shadow, and clipped corners so row ripples stay inside the rounding.
class _SectionCard extends StatelessWidget {
  final List<Widget> children;
  const _SectionCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.xlAll,
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.sm,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.xlAll,
        child: Column(children: children),
      ),
    );
  }
}

/// Hairline divider aligned to start after the menu-row icon tile.
class _MenuDivider extends StatelessWidget {
  const _MenuDivider();

  @override
  Widget build(BuildContext context) {
    return const Divider(
      height: 1,
      thickness: 1,
      indent: 68,
      endIndent: AppSpacing.lg,
      color: AppColors.border,
    );
  }
}

/// Sign-out action styled like a section-card row, with a red accent.
class _SignOutButton extends StatelessWidget {
  final VoidCallback? onTap;
  const _SignOutButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.xlAll,
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.22)),
        boxShadow: AppShadows.sm,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.xlAll,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            splashColor: AppColors.danger.withValues(alpha: 0.08),
            highlightColor: AppColors.danger.withValues(alpha: 0.05),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: 16,
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.danger.withValues(alpha: 0.12),
                      borderRadius: AppRadius.mdAll,
                      border: Border.all(
                        color: AppColors.danger.withValues(alpha: 0.16),
                      ),
                    ),
                    child: const Icon(
                      Icons.logout_rounded,
                      color: AppColors.danger,
                      size: 21,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sign Out',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: AppColors.danger,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Sign out of your account',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.danger.withValues(alpha: 0.5),
                    size: 22,
                  ),
                ],
              ),
            ),
          ),
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
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: AppRadius.mdAll,
                border: Border.all(color: iconColor.withValues(alpha: 0.16)),
              ),
              child: Icon(icon, color: iconColor, size: 21),
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
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textTertiary,
              size: 22,
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

    final topInset = MediaQuery.of(context).padding.top;
    // Expanded hero fades out early; the compact bar fades in near the end.
    final expandedOpacity = (1 - progress * 1.4).clamp(0.0, 1.0);
    final collapsedOpacity = ((progress - 0.45) / 0.55).clamp(0.0, 1.0);

    // Avatar used in both the hero and the collapsed bar.
    Widget avatar(double size, {double borderWidth = 3}) {
      return Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.9),
            width: borderWidth,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.14),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipOval(
          child: SizedBox(
            width: size,
            height: size,
            child: user?.avatarUrl?.isNotEmpty == true
                ? CachedImage(url: user!.avatarUrl)
                : Container(
                    color: Colors.white.withValues(alpha: 0.2),
                    child: Icon(Icons.person,
                        color: Colors.white, size: size * 0.5),
                  ),
          ),
        ),
      );
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        // Background gradient with a soft rounded base.
        const Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF2563EB), Color(0xFF38BDF8)],
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              boxShadow: [
                BoxShadow(
                  color: Color(0x332563EB),
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
          ),
        ),

        // Compact collapsed bar: small avatar + name.
        Positioned(
          top: topInset,
          left: AppSpacing.lg,
          right: AppSpacing.lg,
          height: minExtent - topInset,
          child: Opacity(
            opacity: collapsedOpacity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                avatar(34, borderWidth: 2),
                const SizedBox(width: AppSpacing.sm + 2),
                Flexible(
                  child: Text(
                    user?.name ?? 'Profile',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Expanded hero content.
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Opacity(
            opacity: expandedOpacity,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                avatar(92),
                const SizedBox(height: AppSpacing.md),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    user?.name ?? '—',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    user?.email ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                _Badge(icon: roleIcon, label: roleLabel),
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ],
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
