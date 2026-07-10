import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/error/exceptions.dart';
import '../routes/route_names.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// Root messenger key — attach to [MaterialApp.scaffoldMessengerKey] so toasts
/// work from any screen, including pushed routes and the bottom-nav shell.
final rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

enum AppToastType { info, success, error }

/// App-wide floating toast/snackbar helper.
class AppToast {
  AppToast._();

  static const _shellTabPaths = {
    RouteNames.homePath,
    RouteNames.searchPath,
    RouteNames.favoritesPath,
    RouteNames.eventsPath,
    RouteNames.profilePath,
  };

  static ScaffoldMessengerState? get _messenger =>
      rootScaffoldMessengerKey.currentState;

  static String messageFrom(
    Object error, {
    String fallback = 'Something went wrong',
  }) {
    if (error is AppException) return error.message;
    return fallback;
  }

  static double _bottomOffset(BuildContext context) {
    final padding = MediaQuery.paddingOf(context);
    final location = GoRouter.maybeOf(context)?.state.matchedLocation ?? '';
    final onShellTab = _shellTabPaths.contains(location);

    if (onShellTab) {
      // Just above the floating bottom navigation bar.
      return padding.bottom + 92;
    }

    return padding.bottom + AppSpacing.xl;
  }

  static void show(
    String message, {
    AppToastType type = AppToastType.info,
    Duration? duration,
  }) {
    final messenger = _messenger;
    if (messenger == null || message.trim().isEmpty) return;

    final resolvedDuration = duration ??
        (type == AppToastType.error && message.contains('\n')
            ? const Duration(seconds: 5)
            : const Duration(seconds: 3));

    final bottom = _bottomOffset(messenger.context);

    messenger
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          elevation: 0,
          backgroundColor: Colors.transparent,
          padding: EdgeInsets.zero,
          margin: EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            bottom,
          ),
          behavior: SnackBarBehavior.floating,
          duration: resolvedDuration,
          dismissDirection: DismissDirection.horizontal,
          content: _AppToastCard(
            message: message.trim(),
            type: type,
          ),
        ),
      );
  }

  static void success(String message) =>
      show(message, type: AppToastType.success);

  static void error(String message) => show(message, type: AppToastType.error);

  static void info(String message) => show(message, type: AppToastType.info);

  static void showError(
    Object error, {
    String fallback = 'Something went wrong',
  }) =>
      show(messageFrom(error, fallback: fallback), type: AppToastType.error);
}

class _AppToastCard extends StatelessWidget {
  final String message;
  final AppToastType type;

  const _AppToastCard({
    required this.message,
    required this.type,
  });

  _ToastStyle get _style => switch (type) {
        AppToastType.success => const _ToastStyle(
            accent: AppColors.success,
            icon: Icons.check_rounded,
            label: 'Success',
          ),
        AppToastType.error => const _ToastStyle(
            accent: AppColors.danger,
            icon: Icons.error_outline_rounded,
            label: 'Error',
          ),
        AppToastType.info => const _ToastStyle(
            accent: AppColors.primary,
            icon: Icons.info_outline_rounded,
            label: 'Notice',
          ),
      };

  @override
  Widget build(BuildContext context) {
    final style = _style;

    return Material(
      color: Colors.transparent,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.lgAll,
          border: Border.all(
            color: style.accent.withValues(alpha: 0.22),
          ),
          boxShadow: AppShadows.float,
        ),
        child: ClipRRect(
          borderRadius: AppRadius.lgAll,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ColoredBox(
                  color: style.accent,
                  child: const SizedBox(width: 4),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      AppSpacing.md,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: style.accent.withValues(alpha: 0.12),
                            borderRadius: AppRadius.mdAll,
                          ),
                          child: Icon(
                            style.icon,
                            size: 20,
                            color: style.accent,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                style.label,
                                style: AppTypography.caption.copyWith(
                                  color: style.accent,
                                  fontWeight: AppTypography.bold,
                                  letterSpacing: 0.6,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                message,
                                style: AppTypography.bodySm.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: AppTypography.semibold,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
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

class _ToastStyle {
  final Color accent;
  final IconData icon;
  final String label;

  const _ToastStyle({
    required this.accent,
    required this.icon,
    required this.label,
  });
}
