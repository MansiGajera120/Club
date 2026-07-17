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

  /// Soft, three-stop fade over featured card images — keeps mid-tones clear
  /// while grounding text with a deeper, slightly warm base.
  static const LinearGradient imageOverlay = LinearGradient(
    colors: [Colors.transparent, Color(0x33222B3A), Color(0xE00B1220)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0.35, 0.68, 1.0],
  );

  /// Faint top-left sheen laid over surfaces to suggest a light source and add
  /// depth to otherwise flat cards.
  static const LinearGradient cardSheen = LinearGradient(
    colors: [Color(0x14FFFFFF), Colors.transparent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    stops: [0.0, 0.55],
  );

  /// Warm ambient wash for editorial hero areas.
  static const LinearGradient heroWash = LinearGradient(
    colors: [Color(0x142563EB), Color(0x0A38BDF8), Colors.transparent],
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
    stops: [0.0, 0.4, 1.0],
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
