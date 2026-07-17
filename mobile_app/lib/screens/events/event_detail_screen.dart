import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/event_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_gradients.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';
import 'events_screen.dart' show EventTypeBadge;

/// Full details for a single event, opened from a club's event list.
///
/// The [Event] is handed over via router `extra` — every entry point already
/// holds the loaded object, so there's no second fetch.
class EventDetailScreen extends StatelessWidget {
  final Event event;
  const EventDetailScreen({super.key, required this.event});

  bool get _hasLink =>
      event.registrationLink != null && event.registrationLink!.isNotEmpty;
  bool get _notYetOpen =>
      event.registrationStartDate != null &&
      DateTime.now().isBefore(event.registrationStartDate!);
  bool get _closed =>
      event.registrationEndDate != null &&
      DateTime.now().isAfter(event.registrationEndDate!);

  Future<void> _openRegistration() async {
    final link = event.registrationLink;
    if (link == null || link.isEmpty) return;
    final uri = Uri.tryParse(link);
    if (uri == null ||
        !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      AppToast.error('Could not open registration link');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasEnd = event.endDate != null;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            backgroundColor: theme.scaffoldBackgroundColor,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (event.coverImage?.isNotEmpty ?? false)
                    CachedImage(
                      url: event.coverImage,
                      placeholderIcon: Icons.event,
                    )
                  else
                    EventCoverArt(seed: event.id),
                  // Keep the back button legible over a bright cover image.
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: AppGradients.imageOverlay,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        event.title,
                        style: theme.textTheme.headlineSmall,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    EventTypeBadge(type: event.type),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                _DetailRow(
                  icon: Icons.schedule_rounded,
                  label: hasEnd ? 'Starts' : 'When',
                  value: Formatters.dateTime(event.startDate),
                ),
                if (hasEnd)
                  _DetailRow(
                    icon: Icons.event_available_rounded,
                    label: 'Ends',
                    value: Formatters.dateTime(event.endDate!),
                  ),
                if (event.location != null && event.location!.isNotEmpty)
                  _DetailRow(
                    icon: Icons.place_outlined,
                    label: 'Location',
                    value: event.location!,
                  ),
                _DetailRow(
                  icon: Icons.payments_outlined,
                  label: 'Price',
                  value: Formatters.price(event.price, event.priceCurrency),
                ),

                if (event.description != null &&
                    event.description!.isNotEmpty) ...[
                  const SectionHeader(
                    title: 'About this event',
                    padding: EdgeInsets.only(
                      top: AppSpacing.lg,
                      bottom: AppSpacing.md,
                    ),
                  ),
                  Text(event.description!, style: theme.textTheme.bodyLarge),
                ],

                const SectionHeader(
                  title: 'Registration',
                  padding: EdgeInsets.only(
                    top: AppSpacing.lg,
                    bottom: AppSpacing.md,
                  ),
                ),
                if (_windowText != null) ...[
                  _DetailRow(
                    icon: Icons.how_to_reg_outlined,
                    label: 'Window',
                    value: _windowText!,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (!_hasLink)
                  const _RegNotice(
                    label: 'No registration link provided',
                    icon: Icons.link_off_rounded,
                  )
                else if (_closed)
                  const _RegNotice(
                    label: 'Registration closed',
                    icon: Icons.lock_clock,
                  )
                else if (_notYetOpen)
                  _RegNotice(
                    label:
                        'Registration opens ${Formatters.date(event.registrationStartDate!)}',
                    icon: Icons.schedule,
                  )
                else
                  AppButton(
                    label: 'Register',
                    icon: Icons.open_in_new,
                    onPressed: _openRegistration,
                  ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  /// A human label for the registration window, or null when none is set.
  String? get _windowText {
    final start = event.registrationStartDate;
    final end = event.registrationEndDate;
    if (start != null && end != null) {
      return '${Formatters.date(start)} – ${Formatters.date(end)}';
    }
    if (end != null) return 'Closes ${Formatters.date(end)}';
    if (start != null) return 'Opens ${Formatters.date(start)}';
    return null;
  }
}

/// Labelled icon row used for the event's facts.
class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: AppRadius.mdAll,
            ),
            child: Icon(icon, size: 18, color: AppColors.primary),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: theme.textTheme.labelSmall),
                const SizedBox(height: 2),
                Text(value, style: theme.textTheme.bodyLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Muted, non-tappable notice shown instead of the Register button.
class _RegNotice extends StatelessWidget {
  final String label;
  final IconData icon;
  const _RegNotice({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm + 2,
      ),
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
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.disabledColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
