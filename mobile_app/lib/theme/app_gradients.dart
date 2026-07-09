import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Gradient tokens for backgrounds, surfaces and brand accents.
class AppGradients {
  const AppGradients._();

  static const LinearGradient brand = LinearGradient(
    colors: AppColors.brandGradient,
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient brandHorizontal = LinearGradient(
    colors: AppColors.brandGradient,
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  /// Soft fade over featured card images.
  static const LinearGradient imageOverlay = LinearGradient(
    colors: [Colors.transparent, Color(0xCC2A2A35)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0.45, 1.0],
  );

  /// Ambient warm mesh for the app background.
  static List<BoxDecoration> get mesh => [
        BoxDecoration(
          gradient: RadialGradient(
            center: const Alignment(1.0, -0.5),
            radius: 1.0,
            colors: [AppColors.meshRose, Colors.transparent],
          ),
        ),
        BoxDecoration(
          gradient: RadialGradient(
            center: const Alignment(-0.5, 1.0),
            radius: 0.85,
            colors: [AppColors.meshPeach, Colors.transparent],
          ),
        ),
      ];
}
