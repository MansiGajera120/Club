import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/club_model.dart';
import '../../providers/club_providers.dart';
import '../../providers/event_providers.dart';
import '../../providers/favorite_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/formatters.dart';
import '../../widgets/widgets.dart';
import '../events/events_screen.dart' show EventCard;

/// Full club detail: gallery, info, contact/social actions, share, favorite,
/// registration link and the club's events.
class ClubDetailScreen extends ConsumerWidget {
  final String clubId;

  const ClubDetailScreen({super.key, required this.clubId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubAsync = ref.watch(clubDetailProvider(clubId));

    return Scaffold(
      body: clubAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => _ErrorView(
          onRetry: () => ref.invalidate(clubDetailProvider(clubId)),
        ),
        data: (club) => _ClubDetailView(club: club),
      ),
    );
  }
}

class _ClubDetailView extends ConsumerWidget {
  final Club club;
  const _ClubDetailView({required this.club});

  Future<void> _launch(BuildContext context, String? raw, {String? scheme}) async {
    if (raw == null || raw.isEmpty) return;
    final value = scheme != null ? '$scheme$raw' : raw;
    final uri = Uri.tryParse(value);
    if (uri == null ||
        !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final favorites = ref.watch(favoritesControllerProvider);
    final isFav =
        favorites.value?.any((c) => c.id == club.id) ?? club.isFavorite;
    final events = ref.watch(clubEventsProvider(club.id));
    final images = [if (club.logo != null) club.logo!, ...club.gallery];

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 260,
          pinned: true,
          actions: [
            IconButton(
              icon: Icon(isFav ? Icons.favorite : Icons.favorite_border,
                  color: isFav ? AppColors.danger : null),
              onPressed: () =>
                  ref.read(favoritesControllerProvider.notifier).toggle(club),
            ),
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () => SharePlus.instance.share(
                ShareParams(
                  text: 'Check out ${club.name} on Sports Club',
                ),
              ),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: _Gallery(images: images),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(club.name, style: theme.textTheme.headlineSmall),
                const SizedBox(height: 4),
                Text(
                  [
                    if (club.sport != null && club.sport!.isNotEmpty) club.sport,
                    if (club.city != null && club.city!.isNotEmpty) club.city,
                  ].join('  •  '),
                  style: theme.textTheme.bodyMedium
                      ?.copyWith(color: theme.textTheme.bodySmall?.color),
                ),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: [
                    _Tag(icon: Icons.people, label: Formatters.genderLabel(club.gender)),
                    _Tag(icon: Icons.cake_outlined, label: Formatters.ageRange(club.ageMin, club.ageMax)),
                    _Tag(
                      icon: Icons.payments_outlined,
                      label: Formatters.price(club.price, club.priceCurrency),
                    ),
                  ],
                ),
                if (club.description != null && club.description!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.lg),
                  Text('About', style: theme.textTheme.titleLarge),
                  const SizedBox(height: AppSpacing.sm),
                  Text(club.description!, style: theme.textTheme.bodyLarge),
                ],
                if (club.registrationLink != null &&
                    club.registrationLink!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: 'Register',
                    icon: Icons.how_to_reg,
                    onPressed: () => _launch(context, club.registrationLink),
                  ),
                ],
                const SizedBox(height: AppSpacing.lg),
                Text('Contact', style: theme.textTheme.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                _ContactActions(
                  contact: club.contact,
                  onCall: (v) => _launch(context, v, scheme: 'tel:'),
                  onEmail: (v) => _launch(context, v, scheme: 'mailto:'),
                  onWeb: (v) => _launch(context, v),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text('Events', style: theme.textTheme.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                events.when(
                  loading: () => const AppSkeleton(height: 100),
                  error: (_, _) => Text('Could not load events',
                      style: theme.textTheme.bodySmall),
                  data: (list) => list.isEmpty
                      ? Text('No events scheduled',
                          style: theme.textTheme.bodyMedium)
                      : Column(
                          children: list
                              .map((e) => Padding(
                                    padding: const EdgeInsets.only(
                                        bottom: AppSpacing.md),
                                    child: EventCard(event: e),
                                  ))
                              .toList(),
                        ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Gallery extends StatelessWidget {
  final List<String> images;
  const _Gallery({required this.images});

  @override
  Widget build(BuildContext context) {
    if (images.isEmpty) {
      return const CachedImage(url: null, fit: BoxFit.cover);
    }
    return PageView.builder(
      itemCount: images.length,
      itemBuilder: (_, i) => CachedImage(url: images[i], fit: BoxFit.cover),
    );
  }
}

class _Tag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _Tag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withValues(alpha: 0.08),
        borderRadius: AppRadius.pillAll,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(label,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _ContactActions extends StatelessWidget {
  final ClubContact? contact;
  final void Function(String) onCall;
  final void Function(String) onEmail;
  final void Function(String) onWeb;

  const _ContactActions({
    required this.contact,
    required this.onCall,
    required this.onEmail,
    required this.onWeb,
  });

  @override
  Widget build(BuildContext context) {
    final c = contact;
    final actions = <Widget>[
      if (c?.phone != null && c!.phone!.isNotEmpty)
        _ActionButton(icon: Icons.call, label: 'Call', onTap: () => onCall(c.phone!)),
      if (c?.email != null && c!.email!.isNotEmpty)
        _ActionButton(icon: Icons.email_outlined, label: 'Email', onTap: () => onEmail(c.email!)),
      if (c?.website != null && c!.website!.isNotEmpty)
        _ActionButton(icon: Icons.language, label: 'Website', onTap: () => onWeb(c.website!)),
      if (c?.instagram != null && c!.instagram!.isNotEmpty)
        _ActionButton(icon: Icons.camera_alt_outlined, label: 'Instagram', onTap: () => onWeb(c.instagram!)),
      if (c?.tiktok != null && c!.tiktok!.isNotEmpty)
        _ActionButton(icon: Icons.music_note, label: 'TikTok', onTap: () => onWeb(c.tiktok!)),
    ];

    if (actions.isEmpty) {
      return Text('No contact details provided',
          style: Theme.of(context).textTheme.bodyMedium);
    }
    return Wrap(spacing: AppSpacing.md, runSpacing: AppSpacing.md, children: actions);
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: OutlinedButton.styleFrom(minimumSize: const Size(0, 44)),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: EmptyState(
        icon: Icons.error_outline,
        title: 'Could not load club',
        message: 'Please try again.',
        actionLabel: 'Retry',
        onAction: onRetry,
      ),
    );
  }
}
