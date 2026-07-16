import 'dart:async';

import 'package:flutter/material.dart';

import '../core/error/exceptions.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// Root messenger key — attach to [MaterialApp.scaffoldMessengerKey].
final rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

/// Root navigator key — wired into the GoRouter so toasts can be shown in the
/// app's top-level overlay from anywhere (including pushed routes and the shell).
final rootNavigatorKey = GlobalKey<NavigatorState>();

enum AppToastType { info, success, error }

/// App-wide toast helper. Renders a floating banner at the TOP of the screen
/// (just below the status bar) via the root overlay, so it never overlaps the
/// bottom navigation bar, action buttons, or the keyboard.
class AppToast {
  AppToast._();

  static OverlayEntry? _currentEntry;

  static String messageFrom(
    Object error, {
    String fallback = 'Something went wrong',
  }) {
    if (error is AppException) return error.message;
    return fallback;
  }

  static void show(
    String message, {
    AppToastType type = AppToastType.info,
    Duration? duration,
  }) {
    final overlay = rootNavigatorKey.currentState?.overlay;
    final text = message.trim();
    if (overlay == null || text.isEmpty) return;

    final resolvedDuration = duration ??
        (type == AppToastType.error && text.contains('\n')
            ? const Duration(seconds: 5)
            : const Duration(seconds: 3));

    // Replace any toast currently on screen.
    _removeCurrent();

    late final OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) => _TopToast(
        message: text,
        type: type,
        duration: resolvedDuration,
        onDismissed: () {
          if (_currentEntry == entry) _currentEntry = null;
          if (entry.mounted) entry.remove();
        },
      ),
    );
    _currentEntry = entry;
    overlay.insert(entry);
  }

  static void _removeCurrent() {
    final prev = _currentEntry;
    _currentEntry = null;
    if (prev != null && prev.mounted) prev.remove();
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

/// Top-anchored, auto-dismissing banner with a slide + fade entrance. Tap to
/// dismiss early.
class _TopToast extends StatefulWidget {
  final String message;
  final AppToastType type;
  final Duration duration;
  final VoidCallback onDismissed;

  const _TopToast({
    required this.message,
    required this.type,
    required this.duration,
    required this.onDismissed,
  });

  @override
  State<_TopToast> createState() => _TopToastState();
}

class _TopToastState extends State<_TopToast>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 260),
  );
  late final Animation<double> _fade =
      CurvedAnimation(parent: _controller, curve: Curves.easeOut);
  late final Animation<Offset> _slide = Tween<Offset>(
    begin: const Offset(0, -0.35),
    end: Offset.zero,
  ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

  Timer? _timer;
  bool _dismissed = false;

  @override
  void initState() {
    super.initState();
    _controller.forward();
    _timer = Timer(widget.duration, _dismiss);
  }

  void _dismiss() {
    if (_dismissed) return;
    _dismissed = true;
    _timer?.cancel();
    _controller.reverse().then((_) {
      widget.onDismissed();
    }).catchError((_) {
      // Controller was disposed (a newer toast replaced this one) — ignore.
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;

    return Positioned(
      top: topInset + AppSpacing.sm,
      left: AppSpacing.lg,
      right: AppSpacing.lg,
      child: FadeTransition(
        opacity: _fade,
        child: SlideTransition(
          position: _slide,
          child: GestureDetector(
            onTap: _dismiss,
            child: _AppToastCard(message: widget.message, type: widget.type),
          ),
        ),
      ),
    );
  }
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
