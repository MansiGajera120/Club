import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/error/exceptions.dart';
import '../../models/club_model.dart';
import '../../providers/event_providers.dart';
import '../../providers/owner_providers.dart';
import '../../routes/route_names.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
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
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete event?'),
        content: Text(
          'Delete "${item.event.title}"? This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenData = ref.watch(ownerEventsScreenProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('My events')),
      body: screenData.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => EmptyState(
          icon: Icons.event_busy_outlined,
          title: 'Could not load events',
          message: error is AppException ? error.message : error.toString(),
          actionLabel: 'Retry',
          onAction: () => _refresh(ref),
        ),
        data: (data) => _EventsBody(
          clubs: data.clubs,
          events: data.events,
          onRefresh: () => _refresh(ref),
          onEdit: (item) => context.pushNamed(
            RouteNames.eventForm,
            extra: EventFormArgs(
              clubId: item.event.club,
              event: item.event,
            ),
          ),
          onDelete: (item) => _deleteEvent(context, ref, item),
        ),
      ),
    );
  }
}

class _EventsBody extends StatelessWidget {
  final List<Club> clubs;
  final List<OwnerEventItem> events;
  final Future<void> Function() onRefresh;
  final void Function(OwnerEventItem item) onEdit;
  final void Function(OwnerEventItem item) onDelete;

  const _EventsBody({
    required this.clubs,
    required this.events,
    required this.onRefresh,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final approvedClubs = clubs.where((c) => c.status == 'approved').toList();
    final theme = Theme.of(context);

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: onRefresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              children: [
                if (events.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Text(
                      'Your events (${events.length})',
                      style: theme.textTheme.titleMedium,
                    ),
                  ),
                if (events.isEmpty)
                  SizedBox(
                    height: MediaQuery.sizeOf(context).height * 0.28,
                    child: Center(
                      child: EmptyState(
                        icon: Icons.event_available_outlined,
                        title: 'No events yet',
                        message: approvedClubs.isEmpty
                            ? 'Approve a club first, then create an event below.'
                            : 'Tap a club below to create your first event.',
                      ),
                    ),
                  )
                else
                  ...events.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: _CompactEventRow(
                        item: item,
                        onEdit: () => onEdit(item),
                        onDelete: () => onDelete(item),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        if (approvedClubs.isNotEmpty)
          _QuickCreateStrip(clubs: approvedClubs)
        else if (clubs.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              0,
            ),
            child: Text(
              'Events can be created once a club is approved.',
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ),
        const SizedBox(height: 96),
      ],
    );
  }
}

/// Pinned bottom strip — pick a club to create an event (horizontal scroll).
class _QuickCreateStrip extends StatelessWidget {
  final List<Club> clubs;

  const _QuickCreateStrip({required this.clubs});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.cardTint,
        border: const Border(
          top: BorderSide(color: AppColors.borderStrong),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          0,
          AppSpacing.md,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Create event', style: theme.textTheme.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              height: 64,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(right: AppSpacing.lg),
                itemCount: clubs.length,
                separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                itemBuilder: (context, i) {
                  final club = clubs[i];
                  return Material(
                    color: AppColors.card,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.lgAll,
                      side: const BorderSide(color: AppColors.borderStrong),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: () => context.pushNamed(
                        RouteNames.eventForm,
                        extra: EventFormArgs(clubId: club.id),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: AppSpacing.xs,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            CachedImage(
                              url: club.logo,
                              width: 36,
                              height: 36,
                              borderRadius: AppRadius.smAll,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 100),
                              child: Text(
                                club.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.labelLarge,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.add_circle_outline,
                              size: 18,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                      ),
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

/// Compact single-line event row to fit more on screen.
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
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      variant: AppCardVariant.outlined,
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.10),
              borderRadius: AppRadius.mdAll,
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.16),
              ),
            ),
            child: const Icon(
              Icons.event_rounded,
              size: 18,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
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
                  '${item.club.name} · ${Formatters.date(event.startDate)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onEdit,
            icon: const Icon(Icons.edit_outlined, size: 20),
            color: AppColors.primary,
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          IconButton(
            onPressed: onDelete,
            icon: const Icon(Icons.delete_outline, size: 20),
            color: theme.colorScheme.error,
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
        ],
      ),
    );
  }
}
