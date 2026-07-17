import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Soft, layered elevation tokens with a warm undertone — depth, not flash.
///
/// Each level pairs a tight contact shadow with a wider ambient one so surfaces
/// read as genuinely lifted off the background rather than outlined.
class AppShadows {
  const AppShadows._();

  static List<BoxShadow> get sm => [
    BoxShadow(
      color: AppColors.shadowTint.withValues(alpha: 0.06),
      blurRadius: 3,
      offset: const Offset(0, 1),
    ),
    BoxShadow(
      color: AppColors.shadow.withValues(alpha: 0.05),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get md => [
    BoxShadow(
      color: AppColors.shadowTint.withValues(alpha: 0.07),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
    BoxShadow(
      color: AppColors.shadow.withValues(alpha: 0.08),
      blurRadius: 22,
      offset: const Offset(0, 10),
    ),
  ];

  static List<BoxShadow> get lg => [
    BoxShadow(
      color: AppColors.shadowTint.withValues(alpha: 0.08),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: AppColors.shadow.withValues(alpha: 0.12),
      blurRadius: 40,
      offset: const Offset(0, 18),
    ),
  ];

  /// Glowing lift for primary buttons — the brand colour bleeds softly beneath.
  static List<BoxShadow> get brand => [
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.28),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.14),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
  ];

  /// Shadow for the floating bottom nav bar.
  static List<BoxShadow> get float => [
    BoxShadow(
      color: AppColors.shadowTint.withValues(alpha: 0.08),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
    BoxShadow(
      color: AppColors.shadow.withValues(alpha: 0.12),
      blurRadius: 28,
      offset: const Offset(0, 12),
    ),
  ];
}
