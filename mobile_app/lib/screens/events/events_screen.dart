import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/event_model.dart';
import '../../providers/event_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
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
      AppToast.error('Could not open registration link');
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(event.title, style: theme.textTheme.titleMedium),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    _TypeBadge(type: event.type),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.schedule, size: 16),
                    const SizedBox(width: 6),
                    Text(Formatters.date(event.startDate),
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
                if (_windowText != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.how_to_reg_outlined, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(_windowText!,
                            style: theme.textTheme.bodySmall),
                      ),
                    ],
                  ),
                ],
                if (_hasLink) ...[
                  const SizedBox(height: AppSpacing.md),
                  if (_closed)
                    const _RegStatus(
                        label: 'Registration closed', icon: Icons.lock_clock)
                  else if (_notYetOpen)
                    _RegStatus(
                      label: 'Registration opens ${Formatters.date(event.registrationStartDate!)}',
                      icon: Icons.schedule,
                    )
                  else
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

  bool get _hasLink =>
      event.registrationLink != null && event.registrationLink!.isNotEmpty;
  bool get _notYetOpen =>
      event.registrationStartDate != null &&
      DateTime.now().isBefore(event.registrationStartDate!);
  bool get _closed =>
      event.registrationEndDate != null &&
      DateTime.now().isAfter(event.registrationEndDate!);

  /// A human label for the registration window, or null when none is set.
  String? get _windowText {
    final start = event.registrationStartDate;
    final end = event.registrationEndDate;
    if (start != null && end != null) {
      return 'Registration: ${Formatters.date(start)} – ${Formatters.date(end)}';
    }
    if (end != null) return 'Registration closes ${Formatters.date(end)}';
    if (start != null) return 'Registration opens ${Formatters.date(start)}';
    return null;
  }
}

/// Muted, non-tappable status shown instead of the Register button when the
/// registration window is closed or hasn't opened yet.
class _RegStatus extends StatelessWidget {
  final String label;
  final IconData icon;
  const _RegStatus({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md, vertical: AppSpacing.sm + 2),
      decoration: BoxDecoration(
        color: theme.disabledColor.withValues(alpha: 0.08),
        borderRadius: AppRadius.mdAll,
        border: Border.all(color: theme.dividerColor),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: theme.disabledColor),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: theme.disabledColor, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _TypeBadge extends StatelessWidget {
  final String type;
  const _TypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final color = switch (type) {
      'Camps' => Colors.deepOrange,
      'Clinics' => Colors.teal,
      _ => AppColors.primary,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: AppRadius.pillAll,
        border: Border.all(color: color.withValues(alpha: 0.15), width: 0.8),
      ),
      child: Text(
        type,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

