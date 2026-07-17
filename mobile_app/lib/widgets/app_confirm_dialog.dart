import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';
import 'app_button.dart';
import 'pressable.dart';

/// Confirmation dialog styled to the app's design system, in place of a bare
/// Material [AlertDialog].
///
/// Returns `true` only when the user confirms; dismissing by tapping outside or
/// pressing back resolves to `false`.
///
/// Set [destructive] for irreversible actions — it tints the icon badge and the
/// confirm button with [AppColors.danger] so the weight of the action reads
/// before the label does.
Future<bool> showAppConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required IconData icon,
  String confirmLabel = 'Confirm',
  String cancelLabel = 'Cancel',
  bool destructive = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => _AppConfirmDialog(
      title: title,
      message: message,
      icon: icon,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
      destructive: destructive,
    ),
  );
  return result ?? false;
}

class _AppConfirmDialog extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final String confirmLabel;
  final String cancelLabel;
  final bool destructive;

  const _AppConfirmDialog({
    required this.title,
    required this.message,
    required this.icon,
    required this.confirmLabel,
    required this.cancelLabel,
    required this.destructive,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = destructive ? AppColors.danger : AppColors.primary;

    return Dialog(
      backgroundColor: theme.cardTheme.color ?? theme.colorScheme.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.xlAll,
        side: BorderSide(color: theme.dividerColor),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.10),
                borderRadius: AppRadius.xlAll,
              ),
              child: Icon(icon, size: 30, color: accent),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              title,
              style: theme.textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: cancelLabel,
                    variant: AppButtonVariant.outline,
                    onPressed: () => Navigator.pop(context, false),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: destructive
                      ? _DangerButton(
                          label: confirmLabel,
                          onPressed: () => Navigator.pop(context, true),
                        )
                      : AppButton(
                          label: confirmLabel,
                          onPressed: () => Navigator.pop(context, true),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Solid danger button matching [AppButton]'s filled shape and height, for
/// confirming destructive actions where the brand gradient would read as
/// encouragement.
class _DangerButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  const _DangerButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: AppRadius.lgAll,
          boxShadow: AppShadows.sm,
        ),
        child: Material(
          color: AppColors.danger,
          borderRadius: AppRadius.lgAll,
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onPressed,
            child: SizedBox(
              height: 52,
              child: Center(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
