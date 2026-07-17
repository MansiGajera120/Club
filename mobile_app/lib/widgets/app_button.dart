import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_fonts.dart';
import '../theme/app_gradients.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_typography.dart';
import 'pressable.dart';

/// Visual variants for [AppButton].
enum AppButtonVariant { filled, tonal, outline, text }

/// Primary button primitive — solid teal with a subtle lift shadow.
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool fullWidth;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.filled,
    this.icon,
    this.isLoading = false,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveOnPressed = isLoading ? null : onPressed;

    if (variant == AppButtonVariant.filled) {
      return _PrimaryButton(
        label: label,
        icon: icon,
        isLoading: isLoading,
        fullWidth: fullWidth,
        onPressed: effectiveOnPressed,
      );
    }

    final child = _buildChild(context);
    final Widget button = switch (variant) {
      AppButtonVariant.tonal => FilledButton.tonal(
        onPressed: effectiveOnPressed,
        child: child,
      ),
      AppButtonVariant.outline => OutlinedButton(
        onPressed: effectiveOnPressed,
        child: child,
      ),
      AppButtonVariant.text => TextButton(
        onPressed: effectiveOnPressed,
        child: child,
      ),
      AppButtonVariant.filled => const SizedBox.shrink(),
    };

    return fullWidth ? SizedBox(width: double.infinity, child: button) : button;
  }

  Widget _buildChild(BuildContext context) {
    if (isLoading) {
      return const SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation(AppColors.primary),
        ),
      );
    }
    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [Icon(icon, size: 20), const SizedBox(width: 8), Text(label)],
      );
    }
    return Text(label);
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool isLoading;
  final bool fullWidth;
  final VoidCallback? onPressed;

  const _PrimaryButton({
    required this.label,
    required this.icon,
    required this.isLoading,
    required this.fullWidth,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;

    Widget content;
    if (isLoading) {
      content = const SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation(Colors.white),
        ),
      );
    } else if (icon != null) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20, color: Colors.white),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppFonts.body(
              AppTypography.button,
            ).copyWith(color: Colors.white),
          ),
        ],
      );
    } else {
      content = Text(
        label,
        style: AppFonts.body(
          AppTypography.button,
        ).copyWith(color: Colors.white),
      );
    }

    final button = DecoratedBox(
      decoration: BoxDecoration(
        gradient: AppGradients.brandHorizontal,
        borderRadius: AppRadius.lgAll,
        boxShadow: enabled ? AppShadows.brand : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: AppRadius.lgAll,
          // Faint highlight sweep across the top edge for a glossy lift.
          child: Ink(
            decoration: BoxDecoration(
              gradient: AppGradients.cardSheen,
              borderRadius: AppRadius.lgAll,
            ),
            child: Container(
              width: fullWidth ? double.infinity : null,
              height: 52,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: content,
            ),
          ),
        ),
      ),
    );

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 150),
      opacity: enabled ? 1 : 0.55,
      // Only the interactive (enabled, non-loading) button dips on press.
      child: enabled
          ? PressableScale(pressedScale: 0.98, child: button)
          : button,
    );
  }
}
