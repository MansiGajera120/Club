import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/club_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/owner_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/widgets.dart';
import 'club_form_screen.dart';
import 'owner_dashboard_screen.dart';

/// Gates the club-owner experience on their single club's lifecycle:
///
/// - **No club** → the registration form (shown right after email verification).
/// - **Pending / rejected / suspended / hidden** → a status screen (rejected
///   clubs can edit & resubmit, which re-enters moderation).
/// - **Approved** → the owner dashboard.
///
/// Owners can only ever have one club, so this is a linear onboarding funnel.
class OwnerHomeGate extends ConsumerWidget {
  const OwnerHomeGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubAsync = ref.watch(myClubProvider);

    return clubAsync.when(
      loading: () => const _GateScaffold(
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, _) => _GateScaffold(
        child: EmptyState(
          icon: Icons.wifi_off_rounded,
          title: 'Could not load your club',
          message: 'Please check your connection and try again.',
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(myClubsProvider),
        ),
      ),
      data: (club) {
        if (club == null) {
          // First-time owner: register the one club they'll manage.
          return const ClubFormScreen(embedded: true);
        }
        if (club.status == 'approved') {
          return const OwnerDashboardScreen();
        }
        return OwnerStatusScreen(club: club);
      },
    );
  }
}

/// Minimal scaffold used for the gate's loading/error states, with a logout
/// action so the owner is never trapped during onboarding.
class _GateScaffold extends ConsumerWidget {
  final Widget child;
  const _GateScaffold({required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('My club'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      body: child,
    );
  }
}

/// Shows the moderation status of the owner's club while it is not yet approved.
class OwnerStatusScreen extends ConsumerWidget {
  final Club club;
  const OwnerStatusScreen({super.key, required this.club});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final info = _statusInfo(club.status);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('My club'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh status',
            onPressed: () => ref.invalidate(myClubsProvider),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myClubsProvider);
          await ref.read(myClubProvider.future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.xl,
            AppSpacing.lg,
            AppSpacing.xl,
          ),
          children: [
            Center(
              child: Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: info.color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(info.icon, size: 40, color: info.color),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              club.name,
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: AppSpacing.sm),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: info.color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  info.badge,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: info.color,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              info.message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: AppColors.textSecondary),
            ),
            if (club.status == 'rejected' &&
                (club.rejectionReason?.trim().isNotEmpty ?? false)) ...[
              const SizedBox(height: AppSpacing.lg),
              AppCard(
                variant: AppCardVariant.outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Reason for rejection',
                      style: theme.textTheme.labelLarge
                          ?.copyWith(color: AppColors.danger),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(club.rejectionReason!.trim(),
                        style: theme.textTheme.bodyMedium),
                  ],
                ),
              ),
            ],
            const SizedBox(height: AppSpacing.xl),
            if (club.status == 'rejected')
              AppButton(
                label: 'Edit & resubmit',
                onPressed: () => _openEditForm(context),
              )
            else
              AppButton(
                label: 'Edit club details',
                variant: AppButtonVariant.outline,
                onPressed: () => _openEditForm(context),
              ),
          ],
        ),
      ),
    );
  }

  void _openEditForm(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ClubFormScreen(club: club)),
    );
  }

  _StatusInfo _statusInfo(String status) {
    switch (status) {
      case 'rejected':
        return _StatusInfo(
          icon: Icons.error_outline_rounded,
          color: AppColors.danger,
          badge: 'Rejected',
          message:
              'Your club was not approved. Review the reason below, update your '
              'details, and resubmit for another review.',
        );
      case 'suspended':
        return _StatusInfo(
          icon: Icons.pause_circle_outline_rounded,
          color: AppColors.danger,
          badge: 'Suspended',
          message:
              'Your club has been suspended by an administrator. Please contact '
              'support for more information.',
        );
      case 'hidden':
        return _StatusInfo(
          icon: Icons.visibility_off_outlined,
          color: AppColors.warning,
          badge: 'Hidden',
          message:
              'Your club is currently hidden and not visible to parents. An '
              'administrator can restore it.',
        );
      case 'pending':
      default:
        return _StatusInfo(
          icon: Icons.hourglass_top_rounded,
          color: AppColors.warning,
          badge: 'Under review',
          message:
              'Thanks for registering! Your club is being reviewed by our team. '
              'You\'ll get access to your dashboard once it\'s approved. Pull to '
              'refresh to check the latest status.',
        );
    }
  }
}

class _StatusInfo {
  final IconData icon;
  final Color color;
  final String badge;
  final String message;

  const _StatusInfo({
    required this.icon,
    required this.color,
    required this.badge,
    required this.message,
  });
}
