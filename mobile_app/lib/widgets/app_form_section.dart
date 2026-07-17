import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_fonts.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// Groups related form fields inside a bordered, titled container.
///
/// The heading renders [AppTypography.sectionTitle], the same style
/// [SectionHeader] uses — these are both "the title of a section" and must not
/// drift apart.
class FormSection extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData? icon;
  final List<Widget> children;

  const FormSection({
    super.key,
    required this.title,
    this.subtitle,
    this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgAll,
        border: Border.all(color: AppColors.borderStrong, width: 1.25),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted.withValues(alpha: 0.55),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.lg),
              ),
              border: const Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                if (icon != null) ...[
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.10),
                      borderRadius: AppRadius.mdAll,
                      border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.16),
                      ),
                    ),
                    child: Icon(icon, size: 18, color: AppColors.primary),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppFonts.display(
                          AppTypography.sectionTitle,
                        ).copyWith(color: AppColors.textPrimary),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = 0; i < children.length; i++) ...[
                  if (i > 0) const SizedBox(height: AppSpacing.md),
                  children[i],
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Labeled dropdown styled to match [AppTextField].
class AppDropdownField<T> extends StatelessWidget {
  final String label;
  final T value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;

  const AppDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 0.1,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        DropdownButtonFormField<T>(
          initialValue: value,
          items: items,
          onChanged: onChanged,
          isExpanded: true,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.card,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md + 2,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: AppRadius.mdAll,
              borderSide: const BorderSide(color: AppColors.borderStrong),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: AppRadius.mdAll,
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.8,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Date/time picker row styled to match [AppTextField].
class AppPickerField extends StatelessWidget {
  final String label;
  final String value;
  final String placeholder;
  final VoidCallback onTap;
  final IconData icon;

  /// Validation message to show beneath the field.
  ///
  /// This isn't a [FormField], so it can't join a [Form]'s validate() pass —
  /// the owning screen decides when the value is missing and passes the message
  /// down. Without it a missing date could only be reported as a toast, far
  /// away from the field that was actually empty.
  final String? errorText;

  const AppPickerField({
    super.key,
    required this.label,
    required this.value,
    required this.onTap,
    this.placeholder = 'Tap to choose',
    this.icon = Icons.calendar_today_outlined,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasValue = value.isNotEmpty;
    final hasError = errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 0.1,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Material(
          color: AppColors.card,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.mdAll,
            side: BorderSide(
              color: hasError ? AppColors.danger : AppColors.borderStrong,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md + 2,
              ),
              child: Row(
                children: [
                  Icon(
                    icon,
                    size: 20,
                    color: hasValue
                        ? AppColors.primary
                        : AppColors.textTertiary,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      hasValue ? value : placeholder,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: hasValue
                            ? AppColors.textPrimary
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textTertiary,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 6),
          // Matches InputDecoration's error slot so a missing date reads the
          // same as a missing text field.
          Padding(
            padding: const EdgeInsets.only(left: AppSpacing.md),
            child: Text(
              errorText!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.danger,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
