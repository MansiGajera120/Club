import 'package:flutter/material.dart';

import '../models/club_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';
import '../utils/formatters.dart';
import 'cached_image.dart';
import 'club_favorite_button.dart';
import 'pressable.dart';

/// Club summary card used in lists and search results.
class ClubCard extends StatelessWidget {
  final Club club;
  final VoidCallback onTap;
  final bool showFavorite;

  const ClubCard({
    super.key,
    required this.club,
    required this.onTap,
    this.showFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PressableScale(
      child: DecoratedBox(
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: AppRadius.lgAll,
        border: Border.all(color: theme.dividerColor),
        boxShadow: AppShadows.sm,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.lgAll,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Ink(
            decoration: const BoxDecoration(gradient: AppGradients.cardSheen),
            child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: AppRadius.mdAll,
                    boxShadow: AppShadows.sm,
                  ),
                  child: CachedImage(
                    url: club.logo,
                    width: 72,
                    height: 72,
                    borderRadius: AppRadius.mdAll,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              club.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.titleMedium,
                            ),
                          ),
                          if (club.isFeatured) const _FeaturedBadge(),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        [
                          if (club.sport != null && club.sport!.isNotEmpty)
                            club.sport,
                          if (club.city != null && club.city!.isNotEmpty)
                            club.city,
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          // Pills take the remaining space and ellipsize if
                          // tight; the price keeps its natural width so a large
                          // value (e.g. ₹10,000) never overflows the row.
                          Expanded(
                            child: Row(
                              children: [
                                Flexible(
                                  child: _Pill(
                                      text:
                                          Formatters.genderLabel(club.gender)),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Flexible(
                                  child: _Pill(
                                      text: Formatters.ageRange(
                                          club.ageMin, club.ageMax)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            Formatters.price(club.price, club.priceCurrency),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.titleMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (showFavorite) ClubFavoriteButton(club: club),
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

class _Pill extends StatelessWidget {
  final String text;
  const _Pill({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: AppRadius.pillAll,
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        softWrap: false,
        style: const TextStyle(
          color: AppColors.primary,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _FeaturedBadge extends StatelessWidget {
  const _FeaturedBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: AppRadius.pillAll,
      ),
      child: const Text(
        'Featured',
        style: TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
