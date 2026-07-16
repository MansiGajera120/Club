import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../models/club_model.dart';
import '../../models/event_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/event_providers.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
import '../../theme/app_spacing.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';
import 'event_form_screen.dart';

/// Owner-first dashboard shown in the bottom-nav shell for club owners.
class OwnerDashboardScreen extends ConsumerWidget {
  const OwnerDashboardScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(myClubsProvider);
    ref.invalidate(ownerEventsScreenProvider);
    ref.invalidate(ownerEventsProvider);
    await Future.wait([
      ref.read(myClubsProvider.future),
      ref.read(ownerEventsScreenProvider.future),
    ]);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubsAsync = ref.watch(myClubsProvider);
    final eventsAsync = ref.watch(ownerEventsProvider);
    final user = ref.watch(authControllerProvider).user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: clubsAsync.when(
        loading: () => const _DashboardSkeleton(),
        error: (_, _) => EmptyState(
          icon: Icons.dashboard_customize_outlined,
          title: 'Could not load dashboard',
          message: 'Please try again in a moment.',
          actionLabel: 'Retry',
          onAction: () => _refresh(ref),
        ),
        data: (clubs) {
          final club = clubs.isEmpty ? null : clubs.first;
          final events = eventsAsync.maybeWhen(
            data: (list) => list,
            orElse: () => const <OwnerEventItem>[],
          );
          final upcoming = events
              .where((e) => e.event.startDate.isAfter(DateTime.now()))
              .toList()
            ..sort(
              (a, b) => a.event.startDate.compareTo(b.event.startDate),
            );

          return RefreshIndicator(
            onRefresh: () => _refresh(ref),
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: _WelcomeHeader(
                    ownerName: user?.name ?? 'Club owner',
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    child: club == null
                        ? _EmptyClubCard(
                            onRegister: () => context.go(RouteNames.searchPath),
                          )
                        : _ClubSpotlightCard(
                            club: club,
                            totalEvents: events.length,
                            upcomingCount: upcoming.length,
                          ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.xl,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    child: _SectionHeader(title: 'Quick actions'),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    child: _QuickActionGrid(
                      onClubProfile: () => context.pushNamed(RouteNames.editProfile),
                      onEvents: () => context.go(RouteNames.eventsPath),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.xl,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    child: _SectionHeader(
                      title: 'Upcoming schedule',
                      actionLabel: upcoming.isNotEmpty ? 'View all' : null,
                      onAction: upcoming.isNotEmpty
                          ? () => context.go(RouteNames.eventsPath)
                          : null,
                    ),
                  ),
                ),
                if (upcoming.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        0,
                        AppSpacing.lg,
                        AppSpacing.xl,
                      ),
                      child: _ScheduleEmptyState(
                        clubApproved: club?.status == 'approved',
                        onCreateEvent: club?.status == 'approved'
                            ? () => context.pushNamed(
                                  RouteNames.eventForm,
                                  extra: EventFormArgs(clubId: club!.id),
                                )
                            : null,
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.xl,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, i) {
                          final isLast =
                              i >= upcoming.length.clamp(0, 4) - 1;
                          return _TimelineEventRow(
                            event: upcoming[i].event,
                            isLast: isLast,
                            onTap: () => context.go(RouteNames.eventsPath),
                          );
                        },
                        childCount: upcoming.length.clamp(0, 4),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _WelcomeHeader extends StatelessWidget {
  final String ownerName;

  const _WelcomeHeader({required this.ownerName});

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final topInset = MediaQuery.paddingOf(context).top;
    final firstName = ownerName.trim().split(' ').first;
    final today = DateFormat('EEE, MMM d').format(DateTime.now());

    return Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        topInset + AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary.withValues(alpha: 0.10),
              AppColors.secondary.withValues(alpha: 0.06),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: AppRadius.xlAll,
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.12),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _greeting,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                firstName,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Your club command center',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: AppRadius.pillAll,
                  boxShadow: AppShadows.sm,
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  today,
                  style: theme.textTheme.labelSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ClubSpotlightCard extends StatelessWidget {
  final Club club;
  final int totalEvents;
  final int upcomingCount;
  const _ClubSpotlightCard({
    required this.club,
    required this.totalEvents,
    required this.upcomingCount,
  });

  String? get _coverUrl {
    if (club.gallery.isNotEmpty) return club.gallery.first;
    return club.logo;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = _StatusStyle.from(club.status);
    final cover = _coverUrl;

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: AppRadius.xlAll,
        boxShadow: AppShadows.lg,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.xlAll,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: 148,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (cover != null)
                    CachedImage(url: cover, fit: BoxFit.cover)
                  else
                    const DecoratedBox(
                      decoration: BoxDecoration(gradient: AppGradients.brand),
                    ),
                  const DecoratedBox(
                    decoration: BoxDecoration(gradient: AppGradients.imageOverlay),
                  ),
                  Positioned(
                    top: AppSpacing.md,
                    right: AppSpacing.md,
                    child: _StatusChip(label: status.label, color: status.color),
                  ),
                  Positioned(
                    left: AppSpacing.lg,
                    bottom: AppSpacing.lg,
                    right: AppSpacing.lg,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        DecoratedBox(
                          decoration: BoxDecoration(
                            borderRadius: AppRadius.lgAll,
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.85),
                              width: 2,
                            ),
                            boxShadow: AppShadows.md,
                          ),
                          child: ClipRRect(
                            borderRadius: AppRadius.lgAll,
                            child: CachedImage(
                              url: club.logo,
                              width: 64,
                              height: 64,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                club.name,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black.withValues(alpha: 0.35),
                                      blurRadius: 8,
                                    ),
                                  ],
                                ),
                              ),
                              if (_locationLine(club).isNotEmpty)
                                Text(
                                  _locationLine(club),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.92),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            ColoredBox(
              color: AppColors.card,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      status.hint,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: status.color,
                        fontWeight: FontWeight.w600,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricPill(
                            icon: Icons.event_note_rounded,
                            value: totalEvents.toString(),
                            label: 'Events',
                            tint: AppColors.info,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: _MetricPill(
                            icon: Icons.schedule_rounded,
                            value: upcomingCount.toString(),
                            label: 'Upcoming',
                            tint: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: _MetricPill(
                            icon: Icons.favorite_rounded,
                            value: club.favoritesCount.toString(),
                            label: 'Saves',
                            tint: AppColors.secondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _locationLine(Club club) {
    return [
      if (club.sport != null && club.sport!.isNotEmpty) club.sport,
      if (club.city != null && club.city!.isNotEmpty) club.city,
    ].join(' · ');
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final Color color;

  const _StatusChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        borderRadius: AppRadius.pillAll,
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricPill extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color tint;

  const _MetricPill({
    required this.icon,
    required this.value,
    required this.label,
    required this.tint,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: tint.withValues(alpha: 0.08),
        borderRadius: AppRadius.lgAll,
        border: Border.all(color: tint.withValues(alpha: 0.16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: tint),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: theme.textTheme.labelSmall?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionGrid extends StatelessWidget {
  final VoidCallback onClubProfile;
  final VoidCallback onEvents;

  const _QuickActionGrid({
    required this.onClubProfile,
    required this.onEvents,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _QuickActionTile(
            icon: Icons.storefront_rounded,
            title: 'Club profile',
            subtitle: 'Edit details',
            gradient: const [Color(0xFFFF5A5F), Color(0xFFFF7B7F)],
            onTap: onClubProfile,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _QuickActionTile(
            icon: Icons.event_available_rounded,
            title: 'Events hub',
            subtitle: 'Schedule & edit',
            gradient: const [Color(0xFF3B82F6), Color(0xFF60A5FA)],
            onTap: onEvents,
          ),
        ),
      ],
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _QuickActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: AppColors.card,
      elevation: 0,
      shadowColor: AppColors.shadow,
      borderRadius: AppRadius.lgAll,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.lgAll,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: AppRadius.lgAll,
            border: Border.all(color: AppColors.border),
            boxShadow: AppShadows.sm,
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: gradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: AppRadius.mdAll,
                    boxShadow: [
                      BoxShadow(
                        color: gradient.first.withValues(alpha: 0.35),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 22),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TimelineEventRow extends StatelessWidget {
  final Event event;
  final bool isLast;
  final VoidCallback onTap;

  const _TimelineEventRow({
    required this.event,
    required this.isLast,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final date = event.startDate.toLocal();
    final month = DateFormat('MMM').format(date).toUpperCase();

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 28,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.card, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.35),
                        blurRadius: 6,
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: AppColors.primary.withValues(alpha: 0.18),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : AppSpacing.md),
              child: AppCard(
                variant: AppCardVariant.elevated,
                padding: const EdgeInsets.all(AppSpacing.md),
                onTap: onTap,
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary.withValues(alpha: 0.14),
                            AppColors.secondary.withValues(alpha: 0.10),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: AppRadius.mdAll,
                      ),
                      child: Column(
                        children: [
                          Text(
                            month,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            '${date.day}',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              height: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            Formatters.date(date),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 14,
                      color: AppColors.textTertiary,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScheduleEmptyState extends StatelessWidget {
  final bool clubApproved;
  final VoidCallback? onCreateEvent;

  const _ScheduleEmptyState({
    required this.clubApproved,
    required this.onCreateEvent,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      variant: AppCardVariant.tinted,
      accentColor: AppColors.primary,
      accentTop: true,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withValues(alpha: 0.18),
                  AppColors.secondary.withValues(alpha: 0.12),
                ],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.event_available_outlined,
              color: AppColors.primary,
              size: 28,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'No upcoming events',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            clubApproved
                ? 'Publish your next event to stay visible to parents.'
                : 'Events can be published once your club is approved.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              height: 1.45,
            ),
          ),
          if (clubApproved && onCreateEvent != null) ...[
            const SizedBox(height: AppSpacing.lg),
            AppButton(
              label: 'Create event',
              icon: Icons.add_rounded,
              onPressed: onCreateEvent,
            ),
          ],
        ],
      ),
    );
  }
}

class _EmptyClubCard extends StatelessWidget {
  final VoidCallback onRegister;

  const _EmptyClubCard({required this.onRegister});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppCard(
      variant: AppCardVariant.tinted,
      accentColor: AppColors.primary,
      accentTop: true,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: AppColors.brandGradient,
              ),
              shape: BoxShape.circle,
              boxShadow: AppShadows.brand,
            ),
            child: const Icon(
              Icons.add_business_outlined,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Register your club',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Submit your club for review to unlock the full owner workspace.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              height: 1.45,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Get started',
            onPressed: onRegister,
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _SectionHeader({
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Text(
          title,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const Spacer(),
        if (actionLabel != null && onAction != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primary,
              textStyle: const TextStyle(fontWeight: FontWeight.w700),
            ),
            child: Text(actionLabel!),
          )
        else
          Container(
            width: 32,
            height: 3,
            decoration: BoxDecoration(
              gradient: AppGradients.brandHorizontal,
              borderRadius: AppRadius.pillAll,
            ),
          ),
      ],
    );
  }
}

class _DashboardSkeleton extends StatelessWidget {
  const _DashboardSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        MediaQuery.paddingOf(context).top + AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      children: [
        _ShimmerBox(height: 108, radius: AppRadius.xlAll),
        const SizedBox(height: AppSpacing.lg),
        _ShimmerBox(height: 280, radius: AppRadius.xlAll),
        const SizedBox(height: AppSpacing.xl),
        _ShimmerBox(height: 20, width: 140, radius: AppRadius.pillAll),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(child: _ShimmerBox(height: 120, radius: AppRadius.lgAll)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(child: _ShimmerBox(height: 120, radius: AppRadius.lgAll)),
          ],
        ),
      ],
    );
  }
}

class _ShimmerBox extends StatelessWidget {
  final double height;
  final double? width;
  final BorderRadius radius;

  _ShimmerBox({
    required this.height,
    this.width,
    BorderRadius? radius,
  }) : radius = radius ?? AppRadius.lgAll;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: radius,
        border: Border.all(color: AppColors.border),
      ),
    );
  }
}

class _StatusStyle {
  final String label;
  final String hint;
  final Color color;

  const _StatusStyle({
    required this.label,
    required this.hint,
    required this.color,
  });

  factory _StatusStyle.from(String status) {
    switch (status) {
      case 'approved':
        return const _StatusStyle(
          label: 'Live',
          hint: 'Your club is visible to parents in search and events.',
          color: AppColors.success,
        );
      case 'pending':
        return const _StatusStyle(
          label: 'In review',
          hint: 'Our team is reviewing your club. This usually takes 1–2 days.',
          color: AppColors.warning,
        );
      case 'rejected':
        return const _StatusStyle(
          label: 'Needs update',
          hint: 'Please review feedback and resubmit your club details.',
          color: AppColors.danger,
        );
      case 'suspended':
        return const _StatusStyle(
          label: 'Paused',
          hint: 'Contact support to restore your club listing.',
          color: AppColors.danger,
        );
      default:
        return const _StatusStyle(
          label: 'Draft',
          hint: 'Complete your club profile to submit for review.',
          color: AppColors.textSecondary,
        );
    }
  }
}
