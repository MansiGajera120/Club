import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../theme/app_colors.dart';
import '../../../theme/app_radius.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/google_logo.dart';

/// Google / Apple sign-in buttons plus an "or" divider.
class SocialAuthButtons extends StatelessWidget {
  final VoidCallback onGoogle;
  final VoidCallback onApple;
  final bool isBusy;

  const SocialAuthButtons({
    super.key,
    required this.onGoogle,
    required this.onApple,
    this.isBusy = false,
  });

  bool get _showApple => !kIsWeb && (Platform.isIOS || Platform.isMacOS);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Row(
          children: [
            const Expanded(child: Divider(color: AppColors.border)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Text(
                'or continue with',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ),
            const Expanded(child: Divider(color: AppColors.border)),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        _SocialButton(
          label: 'Continue with Google',
          leading: const GoogleLogo(size: 20),
          onPressed: isBusy ? null : onGoogle,
        ),
        if (_showApple) ...[
          const SizedBox(height: AppSpacing.md),
          _SocialButton(
            label: 'Continue with Apple',
            leading: const Icon(Icons.apple, size: 22, color: AppColors.textPrimary),
            onPressed: isBusy ? null : onApple,
          ),
        ],
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  final String label;
  final Widget leading;
  final VoidCallback? onPressed;

  const _SocialButton({
    required this.label,
    required this.leading,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final enabled = onPressed != null;

    return Material(
      color: AppColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.lgAll,
        side: const BorderSide(color: AppColors.borderStrong, width: 1.25),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed,
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: enabled ? 1 : 0.5,
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                leading,
                const SizedBox(width: AppSpacing.md),
                Text(
                  label,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
