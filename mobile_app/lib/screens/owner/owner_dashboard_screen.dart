import 'dart:ui';

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
import '../../widgets/widgets.dart';
import 'event_form_screen.dart';

/// Owner-first dashboard shown in the bottom-nav shell for club owners.
///
/// Structure: a brand-gradient hero carrying the greeting and the club's live
/// numbers, then the club spotlight, quick actions and the upcoming schedule.
class OwnerDashboardScreen extends ConsumerWidget {
  const OwnerDashboardScreen({super.key});

  /// Re-fetch in place. `refresh` (rather than `invalidate` + `read`) keeps the
  /// previous value on the provider while the request is in flight, so the page
  /// stays on screen instead of collapsing back to a skeleton.
  Future<void> _refresh(WidgetRef ref) async {
    await Future.wait([
      ref.refresh(myClubsProvider.future),
      ref.refresh(ownerEventsScreenProvider.future),
    ]);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubsAsync = ref.watch(myClubsProvider);
    final eventsAsync = ref.watch(ownerEventsProvider);
    final user = ref.watch(authControllerProvider).user;

    // Stale-while-revalidate: only the very first load shows the skeleton. Once
    // there's data we keep rendering it through refreshes, so pull-to-refresh
    // never tears the page (and the RefreshIndicator) down and rebuilds it.
    final clubs = clubsAsync.value;

    if (clubs == null) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        body: clubsAsync.hasError
            ? EmptyState(
                icon: Icons.dashboard_customize_outlined,
                title: 'Could not load dashboard',
                message: 'Please try again in a moment.',
                actionLabel: 'Retry',
                onAction: () => _refresh(ref),
              )
            : const _DashboardSkeleton(),
      );
    }

    final club = clubs.isEmpty ? null : clubs.first;
    final events = eventsAsync.value ?? const <OwnerEventItem>[];
    final upcoming = events
        .where((e) => e.event.startDate.isAfter(DateTime.now()))
        .toList()
      ..sort((a, b) => a.event.startDate.compareTo(b.event.startDate));

    final approved = club?.status == 'approved';

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => _refresh(ref),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
                SliverToBoxAdapter(
                  child: _OwnerHero(
                    ownerName: user?.name ?? 'Club owner',
                    totalEvents: events.length,
                    upcomingCount: upcoming.length,
                    saves: club?.favoritesCount ?? 0,
                  ),
                ),

                if (club == null)
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.lg,
                      AppSpacing.lg,
                      0,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: _EmptyClubCard(
                        onRegister: () => context.go(RouteNames.searchPath),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.lg,
                      AppSpacing.lg,
                      0,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: _ClubSpotlightCard(
                        club: club,
                        onManage: () => context.pushNamed(RouteNames.editProfile),
                      ),
                    ),
                  ),

                const SliverToBoxAdapter(
                  child: SectionHeader(title: 'Quick actions'),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      children: [
                        Expanded(
                          child: _ActionTile(
                            icon: Icons.storefront_rounded,
                            title: 'Club profile',
                            subtitle: 'Edit details',
                            gradient: AppGradients.brand,
                            onTap: () =>
                                context.pushNamed(RouteNames.editProfile),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: _ActionTile(
                            icon: Icons.event_available_rounded,
                            title: 'Events hub',
                            subtitle: 'Schedule & edit',
                            gradient: const LinearGradient(
                              colors: [AppColors.accent, AppColors.secondary],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            onTap: () => context.go(RouteNames.eventsPath),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SliverToBoxAdapter(
                  child: SectionHeader(
                    title: 'Upcoming schedule',
                    trailing: upcoming.isEmpty
                        ? null
                        : TextButton(
                            onPressed: () => context.go(RouteNames.eventsPath),
                            child: const Text('View all'),
                          ),
                  ),
                ),
                if (upcoming.isEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.xxl,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: _ScheduleEmptyState(
                        clubApproved: approved,
                        onCreateEvent: approved
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
                      AppSpacing.xxl,
                    ),
                    sliver: SliverList.builder(
                      itemCount: upcoming.length.clamp(0, 4),
                      itemBuilder: (context, i) {
                        final shown = upcoming.length.clamp(0, 4);
                        return _TimelineRow(
                          event: upcoming[i].event,
                          isLast: i == shown - 1,
                          onTap: () => context.pushNamed(
                            RouteNames.eventDetail,
                            extra: upcoming[i].event,
                          ),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

/// Brand-gradient panel: greeting, owner avatar, and the three numbers an owner
/// actually cares about, rendered as glass tiles over the gradient.
class _OwnerHero extends StatelessWidget {
  final String ownerName;
  final int totalEvents;
  final int upcomingCount;
  final int saves;

  const _OwnerHero({
    required this.ownerName,
    required this.totalEvents,
    required this.upcomingCount,
    required this.saves,
  });

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
    final initial = firstName.isNotEmpty ? firstName[0].toUpperCase() : '?';
    final today = DateFormat('EEEE, MMM d').format(DateTime.now());

    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.brand,
        borderRadius: const BorderRadius.vertical(
          bottom: Radius.circular(AppRadius.xl),
        ),
        boxShadow: AppShadows.brand,
      ),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        topInset + AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      today.toUpperCase(),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      '$_greeting,',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                    Text(
                      firstName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        height: 1.15,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Container(
                width: 54,
                height: 54,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: AppShadows.sm,
                ),
                child: Text(
                  initial,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
          // IntrinsicHeight keeps all three tiles identical even though
          // "Upcoming events" wraps onto a second line.
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _GlassStat(
                  icon: Icons.event_rounded,
                  value: '$totalEvents',
                  label: 'Events',
                ),
                const SizedBox(width: AppSpacing.sm),
                _GlassStat(
                  icon: Icons.schedule_rounded,
                  value: '$upcomingCount',
                  label: 'Upcoming events',
                ),
                const SizedBox(width: AppSpacing.sm),
                _GlassStat(
                  icon: Icons.favorite_rounded,
                  value: '$saves',
                  label: 'Favourites',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Frosted stat tile reading over the hero's gradient: an icon chip, the number,
/// and its label. Real backdrop blur (rather than a flat white overlay) is what
/// stops these looking like plain boxes.
class _GlassStat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  const _GlassStat({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: ClipRRect(
        borderRadius: AppRadius.lgAll,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(
              vertical: AppSpacing.md,
              horizontal: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              // Darkened glass rather than a white wash: a subtle navy tint lets
              // the hero gradient read through and keeps the white for the
              // numbers, where it earns its contrast.
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF0B1220).withValues(alpha: 0.20),
                  const Color(0xFF0B1220).withValues(alpha: 0.10),
                ],
              ),
              borderRadius: AppRadius.lgAll,
              border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 16,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  value,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.85),
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

// ---------------------------------------------------------------------------
// Club spotlight
// ---------------------------------------------------------------------------

/// The owner's club as a cover-image card: identity, live status and a way in
/// to editing it.
class _ClubSpotlightCard extends StatelessWidget {
  final Club club;
  final VoidCallback onManage;
  const _ClubSpotlightCard({required this.club, required this.onManage});

  String? get _coverUrl => club.gallery.isNotEmpty ? club.gallery.first : club.logo;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = _StatusStyle.from(club.status);

    return PressableScale(
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: AppRadius.xlAll,
          boxShadow: AppShadows.md,
        ),
        child: Material(
          color: theme.cardTheme.color ?? AppColors.card,
          borderRadius: AppRadius.xlAll,
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onManage,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  height: 132,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // No scrim: nothing sits on the cover but the status pill,
                      // which carries its own white background — a gradient
                      // overlay here would only crush the artwork.
                      if (_coverUrl != null)
                        CachedImage(url: _coverUrl, fit: BoxFit.cover)
                      else
                        const DecoratedBox(
                          decoration: BoxDecoration(gradient: AppGradients.brand),
                        ),
                      Positioned(
                        top: AppSpacing.md,
                        right: AppSpacing.md,
                        child: _StatusPill(
                          label: status.label,
                          color: status.color,
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Row(
                    children: [
                      DecoratedBox(
                        decoration: BoxDecoration(
                          borderRadius: AppRadius.lgAll,
                          boxShadow: AppShadows.sm,
                        ),
                        child: ClipRRect(
                          borderRadius: AppRadius.lgAll,
                          child: CachedImage(
                            url: club.logo,
                            width: 56,
                            height: 56,
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
                              style: theme.textTheme.titleMedium,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              status.hint,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.textTertiary,
                      ),
                    ],
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

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusPill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs + 1,
      ),
      decoration: BoxDecoration(
        color: AppColors.card,
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
          const SizedBox(width: AppSpacing.sm - 2),
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .labelSmall
                ?.copyWith(color: color, letterSpacing: 0.2),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Gradient gradient;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return PressableScale(
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: AppRadius.lgAll,
          boxShadow: AppShadows.sm,
        ),
        child: Material(
          color: theme.cardTheme.color ?? AppColors.card,
          borderRadius: AppRadius.lgAll,
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: AppRadius.lgAll,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: gradient,
                      borderRadius: AppRadius.mdAll,
                    ),
                    child: Icon(icon, color: Colors.white, size: 22),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(title, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(subtitle, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

/// One upcoming event, threaded onto a vertical timeline.
class _TimelineRow extends StatelessWidget {
  final Event event;
  final bool isLast;
  final VoidCallback onTap;

  const _TimelineRow({
    required this.event,
    required this.isLast,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final date = event.startDate.toLocal();

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline rail
          SizedBox(
            width: 24,
            child: Column(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  margin: const EdgeInsets.only(top: AppSpacing.lg),
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
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
                padding: const EdgeInsets.all(AppSpacing.md),
                onTap: onTap,
                child: Row(
                  children: [
                    // Date block
                    Container(
                      width: 48,
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: AppRadius.mdAll,
                      ),
                      child: Column(
                        children: [
                          Text(
                            DateFormat('MMM').format(date).toUpperCase(),
                            style: theme.textTheme.labelSmall
                                ?.copyWith(color: AppColors.primary),
                          ),
                          Text(
                            DateFormat('d').format(date),
                            style: theme.textTheme.titleMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
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
                            style: theme.textTheme.titleSmall,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            DateFormat('h:mm a').format(date) +
                                (event.location != null &&
                                        event.location!.isNotEmpty
                                    ? ' · ${event.location}'
                                    : ''),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 20,
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

  const _ScheduleEmptyState({required this.clubApproved, this.onCreateEvent});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      variant: AppCardVariant.tinted,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: AppRadius.lgAll,
            ),
            child: const Icon(
              Icons.event_note_rounded,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            clubApproved ? 'Nothing scheduled yet' : 'Schedule opens once approved',
            style: theme.textTheme.titleSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            clubApproved
                ? 'Create your first event and it will show up here.'
                : 'We\'ll let you know as soon as your club is live.',
            style: theme.textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
          if (onCreateEvent != null) ...[
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
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              gradient: AppGradients.brand,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.storefront_rounded, color: Colors.white),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('No club yet', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Register your club to start publishing events.',
            style: theme.textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(label: 'Get started', onPressed: onRegister),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/// Shimmer placeholders shaped like the real dashboard, so the layout doesn't
/// jump when data lands.
class _DashboardSkeleton extends StatelessWidget {
  const _DashboardSkeleton();

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    return ListView(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        topInset + AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.xxl,
      ),
      children: [
        AppSkeleton(height: 148, borderRadius: AppRadius.xlAll),
        const SizedBox(height: AppSpacing.lg),
        AppSkeleton(height: 190, borderRadius: AppRadius.xlAll),
        const SizedBox(height: AppSpacing.xl),
        const AppSkeleton(height: 20, width: 140),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: AppSkeleton(height: 132, borderRadius: AppRadius.lgAll),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: AppSkeleton(height: 132, borderRadius: AppRadius.lgAll),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        const AppSkeleton(height: 20, width: 170),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < 3; i++) ...[
          AppSkeleton(height: 84, borderRadius: AppRadius.lgAll),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

/// Status → label/hint/colour for the club's review state.
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
          hint: 'Visible to parents in search and events.',
          color: AppColors.success,
        );
      case 'pending':
        return const _StatusStyle(
          label: 'In review',
          hint: 'Our team is reviewing your club — usually 1–2 days.',
          color: AppColors.warning,
        );
      case 'rejected':
        return const _StatusStyle(
          label: 'Needs update',
          hint: 'Review the feedback and resubmit your details.',
          color: AppColors.danger,
        );
      case 'suspended':
        return const _StatusStyle(
          label: 'Paused',
          hint: 'Contact support to restore your listing.',
          color: AppColors.danger,
        );
      default:
        return const _StatusStyle(
          label: 'Draft',
          hint: 'Complete your profile to submit for review.',
          color: AppColors.textSecondary,
        );
    }
  }
}
