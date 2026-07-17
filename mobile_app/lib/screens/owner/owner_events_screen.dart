import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/error/exceptions.dart';
import '../../models/club_model.dart';
import '../../providers/event_providers.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_shadows.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';
import 'event_form_screen.dart';

/// Owner event hub: view all created events and add new ones per club.
class OwnerEventsScreen extends ConsumerWidget {
  const OwnerEventsScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(myClubsProvider);
    ref.invalidate(ownerEventsScreenProvider);
    ref.invalidate(ownerEventsProvider);
    await Future.wait([
      ref.read(myClubsProvider.future),
      ref.read(ownerEventsScreenProvider.future),
    ]);
  }

  Future<void> _deleteEvent(
    BuildContext context,
    WidgetRef ref,
    OwnerEventItem item,
  ) async {
    final confirmed = await showAppConfirmDialog(
      context,
      icon: Icons.delete_outline_rounded,
      title: 'Delete event?',
      message: 'Delete "${item.event.title}"? This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    );

    if (!confirmed || !context.mounted) return;

    try {
      await ref.read(eventRepositoryProvider).deleteEvent(item.event.id);
      ref.invalidate(ownerEventsScreenProvider);
      ref.invalidate(ownerEventsProvider);
      if (context.mounted) {
        AppToast.success('"${item.event.title}" deleted');
      }
    } catch (e) {
      AppToast.showError(e, fallback: 'Could not delete event');
    }
  }

  /// Start a new event. With a single approved club we go straight to the form;
  /// with several, the owner picks which club it belongs to first.
  Future<void> _addEvent(BuildContext context, List<Club> approvedClubs) async {
    if (approvedClubs.isEmpty) return;

    var club = approvedClubs.first;
    if (approvedClubs.length > 1) {
      final picked = await showModalBottomSheet<Club>(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (_) => _ClubPickerSheet(clubs: approvedClubs),
      );
      if (picked == null) return;
      club = picked;
    }
    if (!context.mounted) return;
    context.pushNamed(
      RouteNames.eventForm,
      extra: EventFormArgs(clubId: club.id),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenData = ref.watch(ownerEventsScreenProvider);

    // Read through the AsyncValue so the header can carry the add action itself
    // — that used to live on a second "Your events" heading further down, which
    // said the page's title twice.
    final approvedClubs =
        screenData.value?.clubs.where((c) => c.status == 'approved').toList() ??
        const <Club>[];

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => _refresh(ref),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: PageHero(
                overline: 'MANAGE',
                title: 'Your events',
                subtitle: 'Create, edit and keep your schedule up to date.',
                trailing: approvedClubs.isEmpty
                    ? null
                    : _AddEventButton(
                        onTap: () => _addEvent(context, approvedClubs),
                      ),
              ),
            ),
            ...screenData.when(
              loading: () => [const _EventsSkeleton()],
              error: (error, _) => [
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: EmptyState(
                    icon: Icons.event_busy_outlined,
                    title: 'Could not load events',
                    message: error is AppException
                        ? error.message
                        : error.toString(),
                    actionLabel: 'Retry',
                    onAction: () => _refresh(ref),
                  ),
                ),
              ],
              data: (data) {
                final approved = data.clubs
                    .where((c) => c.status == 'approved')
                    .toList();
                return _bodySlivers(
                  context: context,
                  ref: ref,
                  approvedClubs: approved,
                  events: data.events,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _bodySlivers({
    required BuildContext context,
    required WidgetRef ref,
    required List<Club> approvedClubs,
    required List<OwnerEventItem> events,
  }) {
    return [
      if (events.isEmpty)
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyState(
            icon: Icons.event_available_outlined,
            title: 'No events yet',
            message: approvedClubs.isEmpty
                ? 'Events can be created once your club is approved.'
                : 'Add your first event to get it in front of parents.',
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
          sliver: SliverList.separated(
            itemCount: events.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (_, i) {
              final item = events[i];
              return _CompactEventRow(
                item: item,
                onEdit: () => context.pushNamed(
                  RouteNames.eventForm,
                  extra: EventFormArgs(
                    clubId: item.event.club,
                    event: item.event,
                  ),
                ),
                onDelete: () => _deleteEvent(context, ref, item),
              );
            },
          ),
        ),
    ];
  }
}

/// "Add event" action in the section header. Carries the same brand gradient
/// and glow as [AppButton]'s filled variant, just at a height that sits
/// comfortably beside a section title.
class _AddEventButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddEventButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: AppRadius.lgAll,
          boxShadow: AppShadows.brand,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: AppRadius.lgAll,
          clipBehavior: Clip.antiAlias,
          child: Ink(
            decoration: BoxDecoration(
              gradient: AppGradients.brand,
              borderRadius: AppRadius.lgAll,
            ),
            child: InkWell(
              onTap: onTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.add_rounded,
                      size: 20,
                      color: Colors.white,
                    ),
                    const SizedBox(width: AppSpacing.sm - 2),
                    Text(
                      'Add event',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Club chooser shown only when an owner has more than one approved club.
class _ClubPickerSheet extends StatelessWidget {
  final List<Club> clubs;
  const _ClubPickerSheet({required this.clubs});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.lg),
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: theme.cardTheme.color ?? AppColors.card,
          borderRadius: AppRadius.xlAll,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Which club?', style: theme.textTheme.titleLarge),
            const SizedBox(height: AppSpacing.md),
            ...clubs.map(
              (c) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: ClipRRect(
                  borderRadius: AppRadius.mdAll,
                  child: CachedImage(url: c.logo, width: 40, height: 40),
                ),
                title: Text(c.name, style: theme.textTheme.titleSmall),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.pop(context, c),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EventsSkeleton extends StatelessWidget {
  const _EventsSkeleton();

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.xxl,
      ),
      sliver: SliverList.separated(
        itemCount: 5,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
        itemBuilder: (_, _) => const AppSkeleton(height: 92),
      ),
    );
  }
}

/// One event in the owner's list, with inline edit/delete.
class _CompactEventRow extends StatelessWidget {
  final OwnerEventItem item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _CompactEventRow({
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final event = item.event;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      variant: AppCardVariant.outlined,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // The event's own generated art, same as the card its attendees see —
          // which makes a schedule scannable by colour, not just by reading.
          ClipRRect(
            borderRadius: AppRadius.mdAll,
            child: SizedBox(
              width: 76,
              height: 76,
              child: (event.coverImage?.isNotEmpty ?? false)
                  ? CachedImage(
                      url: event.coverImage,
                      width: 76,
                      height: 76,
                      placeholderIcon: Icons.event,
                    )
                  : EventCoverArt(seed: event.id),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 6),
                _MetaLine(
                  icon: Icons.storefront_outlined,
                  text: item.club.name,
                ),
                const SizedBox(height: 3),
                _MetaLine(
                  icon: Icons.schedule_rounded,
                  text: Formatters.date(event.startDate),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Column(
            children: [
              IconButton(
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined, size: 20),
                color: AppColors.primary,
                tooltip: 'Edit',
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 40, minHeight: 38),
              ),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline, size: 20),
                color: theme.colorScheme.error,
                tooltip: 'Delete',
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 40, minHeight: 38),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// One line of event metadata: a muted icon and its label.
class _MetaLine extends StatelessWidget {
  final IconData icon;
  final String text;

  const _MetaLine({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.textTertiary),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}
