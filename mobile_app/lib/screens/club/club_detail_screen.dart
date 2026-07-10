import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/club_model.dart';
import '../../providers/club_providers.dart';
import '../../providers/event_providers.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_radius.dart';
import '../../theme/app_spacing.dart';
import '../../utils/app_toast.dart';
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
        AppToast.error('Could not open link');
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final events = ref.watch(clubEventsProvider(club.id));
    final images = [if (club.logo != null) club.logo!, ...club.gallery];

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 260,
          pinned: true,
          actions: [
            ClubFavoriteButton(
              club: club,
              inactiveColor: theme.colorScheme.onSurface,
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
    final hasPhone = c?.phone != null && c!.phone!.isNotEmpty;
    final hasEmail = c?.email != null && c!.email!.isNotEmpty;

    final socials = <Widget>[
      if (c?.website != null && c!.website!.isNotEmpty)
        _SocialButton(
          icon: Icons.language_rounded,
          color: const Color(0xFF2563EB),
          label: 'Website',
          onTap: () => onWeb(c.website!),
        ),
      if (c?.instagram != null && c!.instagram!.isNotEmpty)
        _SocialButton(
          svgAsset: 'assets/icons/instagram.svg',
          label: 'Instagram',
          // Instagram's signature gradient for a branded look.
          gradient: const LinearGradient(
            begin: Alignment.bottomLeft,
            end: Alignment.topRight,
            colors: [
              Color(0xFFF58529),
              Color(0xFFDD2A7B),
              Color(0xFF8134AF),
            ],
          ),
          onTap: () => onWeb(c.instagram!),
        ),
      if (c?.tiktok != null && c!.tiktok!.isNotEmpty)
        _SocialButton(
          svgAsset: 'assets/icons/tiktok.svg',
          color: const Color(0xFF010101),
          label: 'TikTok',
          onTap: () => onWeb(c.tiktok!),
        ),
    ];

    if (!hasPhone && !hasEmail && socials.isEmpty) {
      return Text('No contact details provided',
          style: Theme.of(context).textTheme.bodyMedium);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasPhone)
          _ContactRow(
            icon: Icons.call_rounded,
            label: 'Call',
            value: c.phone!,
            onTap: () => onCall(c.phone!),
          ),
        if (hasEmail) ...[
          if (hasPhone) const SizedBox(height: AppSpacing.sm),
          _ContactRow(
            icon: Icons.email_rounded,
            label: 'Email',
            value: c.email!,
            onTap: () => onEmail(c.email!),
          ),
        ],
        if (socials.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          Wrap(
            spacing: AppSpacing.xl,
            runSpacing: AppSpacing.md,
            children: socials,
          ),
        ],
      ],
    );
  }
}

/// A tappable contact row showing the icon, a label, and the actual value
/// (phone number / email address) beside it.
class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  const _ContactRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: theme.cardTheme.color ?? theme.colorScheme.surface,
      borderRadius: AppRadius.lgAll,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: AppRadius.lgAll,
            border: Border.all(color: theme.dividerColor),
          ),
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: theme.textTheme.labelSmall
                            ?.copyWith(color: AppColors.textTertiary)),
                    Text(
                      value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyLarge
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.north_east, size: 16, color: AppColors.textTertiary),
            ],
          ),
        ),
      ),
    );
  }
}

/// Circular brand-styled button (with a label beneath) for website / Instagram
/// / TikTok links. The circle is filled with the brand [color] (or [gradient]
/// for Instagram) and holds a white glyph — either a Material [icon] or a
/// white brand [svgAsset].
class _SocialButton extends StatelessWidget {
  final IconData? icon;
  final String? svgAsset;
  final Color? color;
  final Gradient? gradient;
  final String label;
  final VoidCallback onTap;

  const _SocialButton({
    required this.label,
    required this.onTap,
    this.icon,
    this.svgAsset,
    this.color,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          color: Colors.transparent,
          shape: const CircleBorder(),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Ink(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: gradient,
                color: gradient == null ? color : null,
              ),
              child: Center(
                child: svgAsset != null
                    ? SvgPicture.asset(
                        svgAsset!,
                        width: 24,
                        height: 24,
                        colorFilter: const ColorFilter.mode(
                            Colors.white, BlendMode.srcIn),
                      )
                    : Icon(icon, size: 24, color: Colors.white),
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: theme.textTheme.labelSmall
              ?.copyWith(color: AppColors.textSecondary),
        ),
      ],
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
