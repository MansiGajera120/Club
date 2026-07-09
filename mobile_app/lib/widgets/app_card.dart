import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';

/// Visual style for [AppCard] surfaces.
enum AppCardVariant {
  /// White surface with soft shadow (default).
  elevated,

  /// Warm tinted background — good for hero / intro blocks.
  tinted,

  /// Flat white with a stronger outline, no shadow.
  outlined,
}

/// Surface container with rounded corners, border and optional accent stripe.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final AppCardVariant variant;
  final Color? accentColor;
  final bool accentTop;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.variant = AppCardVariant.elevated,
    this.accentColor,
    this.accentTop = false,
  });

  Color _background(ThemeData theme) {
    return switch (variant) {
      AppCardVariant.elevated => theme.cardTheme.color ?? AppColors.card,
      AppCardVariant.tinted => AppColors.cardTint,
      AppCardVariant.outlined => AppColors.card,
    };
  }

  // Always a UNIFORM border — a non-uniform Border combined with a
  // borderRadius is invalid in Flutter and fails to paint. The accent is drawn
  // as an overlay stripe instead (see build).
  Border _border() {
    final base = variant == AppCardVariant.outlined
        ? AppColors.borderStrong
        : AppColors.border;
    return Border.all(
      color: base,
      width: variant == AppCardVariant.outlined ? 1.25 : 1,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = accentColor;
    final shadows = variant == AppCardVariant.elevated ? AppShadows.sm : null;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: _background(theme),
        borderRadius: AppRadius.lgAll,
        border: _border(),
        boxShadow: shadows,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.lgAll,
        child: Stack(
          children: [
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                child: Padding(padding: padding, child: child),
              ),
            ),
            // Accent stripe overlay (top or left), clipped to the rounded card.
            if (accent != null)
              Positioned(
                top: 0,
                left: 0,
                right: accentTop ? 0 : null,
                bottom: accentTop ? null : 0,
                child: Container(
                  width: accentTop ? null : 4,
                  height: accentTop ? 3 : null,
                  color: accent,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Compact metric cell used inside grouped owner dashboard cards.
class AppMetricCell extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const AppMetricCell({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              color: valueColor ?? AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

/// Tappable row for owner quick-action lists (inside a single card).
class AppListTileCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool showDivider;

  const AppListTileCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.10),
                    borderRadius: AppRadius.mdAll,
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.18),
                    ),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: theme.textTheme.titleMedium),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textTertiary,
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          const Divider(
            height: 1,
            thickness: 1,
            indent: AppSpacing.lg,
            endIndent: AppSpacing.lg,
          ),
      ],
    );
  }
}
