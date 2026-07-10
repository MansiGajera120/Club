import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/club_model.dart';
import '../providers/favorite_providers.dart';
import '../theme/app_colors.dart';
import '../utils/app_toast.dart';

/// Heart toggle for saving/removing a club from favorites.
class ClubFavoriteButton extends ConsumerWidget {
  final Club club;
  final double iconSize;
  final EdgeInsetsGeometry? padding;
  final Color? activeColor;
  final Color? inactiveColor;

  const ClubFavoriteButton({
    super.key,
    required this.club,
    this.iconSize = 24,
    this.padding,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFavorite = ref.watch(
      clubIsFavoriteProvider((clubId: club.id, fallback: club.isFavorite)),
    );
    final isPending = ref.watch(clubFavoritePendingProvider(club.id));
    final active = activeColor ?? AppColors.danger;
    final inactive = inactiveColor ?? AppColors.textTertiary;

    return IconButton(
      padding: padding ?? EdgeInsets.zero,
      constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
      onPressed: isPending
          ? null
          : () async {
              try {
                final added = await ref
                    .read(favoritesControllerProvider.notifier)
                    .toggle(club);
                AppToast.success(
                  added ? 'Added to favorites' : 'Removed from favorites',
                );
              } catch (e) {
                AppToast.showError(
                  e,
                  fallback: 'Could not update favorite',
                );
              }
            },
      icon: isPending
          ? SizedBox(
              width: iconSize,
              height: iconSize,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: isFavorite ? active : inactive,
              ),
            )
          : Icon(
              isFavorite
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              size: iconSize,
              color: isFavorite ? active : inactive,
            ),
    );
  }
}
