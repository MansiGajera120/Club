import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../theme/app_colors.dart';
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
        const SizedBox(height: AppSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _SocialCircleButton(
              leading: const GoogleLogo(size: 24),
              onPressed: isBusy ? null : onGoogle,
            ),
            if (_showApple) ...[
              const SizedBox(width: AppSpacing.md),
              _SocialCircleButton(
                leading: const Icon(
                  Icons.apple,
                  size: 26,
                  color: AppColors.textPrimary,
                ),
                onPressed: isBusy ? null : onApple,
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _SocialCircleButton extends StatelessWidget {
  final Widget leading;
  final VoidCallback? onPressed;

  const _SocialCircleButton({required this.leading, this.onPressed});

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;

    return Material(
      color: AppColors.card,
      shape: const CircleBorder(
        side: BorderSide(color: AppColors.borderStrong, width: 1.25),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed,
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: enabled ? 1 : 0.5,
          child: SizedBox(width: 52, height: 52, child: Center(child: leading)),
        ),
      ),
    );
  }
}
