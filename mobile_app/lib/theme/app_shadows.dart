import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Soft, neutral elevation tokens — professional, not flashy.
class AppShadows {
  const AppShadows._();

  static List<BoxShadow> get sm => [
        BoxShadow(
          color: AppColors.shadow.withValues(alpha: 0.05),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get md => [
        BoxShadow(
          color: AppColors.shadow.withValues(alpha: 0.07),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get lg => [
        BoxShadow(
          color: AppColors.shadow.withValues(alpha: 0.10),
          blurRadius: 32,
          offset: const Offset(0, 12),
        ),
      ];

  /// Subtle lift for primary buttons.
  static List<BoxShadow> get brand => [
        BoxShadow(
          color: AppColors.primary.withValues(alpha: 0.25),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];

  /// Shadow for the floating bottom nav bar.
  static List<BoxShadow> get float => [
        BoxShadow(
          color: AppColors.shadow.withValues(alpha: 0.10),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
      ];
}
