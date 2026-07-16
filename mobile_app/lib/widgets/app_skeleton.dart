import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';

/// Animated shimmer skeleton used as a loading placeholder.
class AppSkeleton extends StatefulWidget {
  final double? width;
  final double height;
  final BorderRadius? borderRadius;

  const AppSkeleton({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius,
  });

  factory AppSkeleton.circle(double size, {Key? key}) => AppSkeleton(
        key: key,
        width: size,
        height: size,
        borderRadius: BorderRadius.circular(size / 2),
      );

  @override
  State<AppSkeleton> createState() => _AppSkeletonState();
}

class _AppSkeletonState extends State<AppSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const base = Color(0xFFE4EAF2);
    const highlight = AppColors.surfaceMuted;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: widget.borderRadius ?? AppRadius.smAll,
            gradient: LinearGradient(
              begin: Alignment(-1 - 2 * _controller.value, 0),
              end: Alignment(1 - 2 * _controller.value, 0),
              colors: const [base, highlight, base],
              stops: const [0.35, 0.5, 0.65],
            ),
          ),
        );
      },
    );
  }
}
