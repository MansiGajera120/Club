import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/event_model.dart';
import '../../providers/event_providers.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';

/// Events tab: upcoming events across approved clubs.
class EventsScreen extends ConsumerWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final events = ref.watch(upcomingEventsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Events'), centerTitle: false),
      body: events.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => EmptyState(
          icon: Icons.event_busy,
          title: 'Could not load events',
          message: error.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(upcomingEventsProvider),
        ),
        data: (events) {
          if (events.isEmpty) {
            return const Center(
              child: EmptyState(
                icon: Icons.event_available,
                title: 'No upcoming events',
                message: 'New events from clubs will appear here.',
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(upcomingEventsProvider);
              await ref.read(upcomingEventsProvider.future);
            },
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 100),
              itemCount: events.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (_, i) => EventCard(event: events[i]),
            ),
          );
        },
      ),
    );
  }
}

/// Card used in the events feed and the club detail screen.
class EventCard extends StatelessWidget {
  final Event event;
  const EventCard({super.key, required this.event});

  Future<void> _openRegistration(BuildContext context) async {
    final link = event.registrationLink;
    if (link == null || link.isEmpty) return;
    final uri = Uri.tryParse(link);
    if (uri != null && !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open registration link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: theme.cardTheme.color ?? theme.colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.lgAll,
        side: BorderSide(color: theme.dividerColor),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (event.coverImage != null)
            CachedImage(
              url: event.coverImage,
              height: 130,
              width: double.infinity,
              placeholderIcon: Icons.event,
            ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(event.title, style: theme.textTheme.titleMedium),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.schedule, size: 16),
                    const SizedBox(width: 6),
                    Text(Formatters.dateTime(event.startDate),
                        style: theme.textTheme.bodySmall),
                  ],
                ),
                if (event.location != null && event.location!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(event.location!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall),
                      ),
                    ],
                  ),
                ],
                if (event.registrationLink != null &&
                    event.registrationLink!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.md),
                  AppButton(
                    label: 'Register',
                    icon: Icons.open_in_new,
                    onPressed: () => _openRegistration(context),
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
