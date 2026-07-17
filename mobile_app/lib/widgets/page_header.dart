import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_gradients.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

/// Editorial page header used at the top of every tab, in place of an AppBar.
///
/// This is the app's page-title contract: a gradient wash carrying an overline,
/// the page title and an optional supporting line. It sits inside the scroll
/// view as content (via `SliverToBoxAdapter`) rather than as chrome, so the
/// header scrolls away with the page.
class PageHero extends StatelessWidget {
  /// Short all-caps kicker above the title, e.g. `'DISCOVER'`.
  final String overline;
  final String title;
  final String? subtitle;

  /// Optional action pinned to the right of the title (e.g. an icon button).
  final Widget? trailing;

  const PageHero({
    super.key,
    required this.overline,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Push the header below the status bar/notch, plus a little breathing room.
    final topInset = MediaQuery.paddingOf(context).top;

    final titleText = Text(title, style: theme.textTheme.headlineLarge);

    return Container(
      decoration: const BoxDecoration(gradient: AppGradients.heroWash),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        topInset + AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 22,
                height: 3,
                decoration: BoxDecoration(
                  gradient: AppGradients.brandHorizontal,
                  borderRadius: AppRadius.pillAll,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(overline, style: theme.textTheme.labelSmall),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          if (trailing == null)
            titleText
          else
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(child: titleText),
                const SizedBox(width: AppSpacing.sm),
                trailing!,
              ],
            ),
          if (subtitle != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(subtitle!, style: theme.textTheme.bodyMedium),
          ],
        ],
      ),
    );
  }
}

/// Heading that separates sections within a page: a brand accent bar, the
/// section title, and a fading tick on the right.
///
/// Pass [trailing] to swap the tick for an action (e.g. a "See all" button).
class SectionHeader extends StatelessWidget {
  /// Canonical page-level spacing: full gutters, generous lead-in, tight to the
  /// content it introduces.
  static const EdgeInsets defaultPadding = EdgeInsets.fromLTRB(
    AppSpacing.lg,
    AppSpacing.xl,
    AppSpacing.lg,
    AppSpacing.md,
  );

  final String title;
  final Widget? trailing;

  /// Override only when the header sits inside content that already has
  /// gutters; otherwise leave it so every page shares one rhythm.
  final EdgeInsetsGeometry? padding;

  const SectionHeader({
    super.key,
    required this.title,
    this.trailing,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: padding ?? defaultPadding,
      child: Row(
        children: [
          Container(
            width: 4,
            height: 20,
            decoration: BoxDecoration(
              gradient: AppGradients.brand,
              borderRadius: AppRadius.pillAll,
            ),
          ),
          const SizedBox(width: AppSpacing.sm + 2),
          Text(title, style: theme.textTheme.titleLarge),
          const Spacer(),
          trailing ??
              Container(
                width: 32,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.35),
                  borderRadius: AppRadius.pillAll,
                ),
              ),
        ],
      ),
    );
  }
}

/// Quiet inline message for an empty or failed sub-section — used instead of a
/// bare spinner or a full-screen [EmptyState] when only part of a page is
/// affected.
class InlineNote extends StatelessWidget {
  final String text;
  const InlineNote({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}
