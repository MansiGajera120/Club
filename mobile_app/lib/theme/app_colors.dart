import 'package:flutter/material.dart';

/// Refined text hierarchy for the warm cream "Sunrise Bloom" palette.
class AppColors {
  const AppColors._();

  // ---- Brand ----
  static const Color primary = Color(0xFFFF5A5F);
  static const Color primaryDark = Color(0xFFE04E53);
  static const Color primaryLight = Color(0xFFFF7B7F);
  static const Color secondary = Color(0xFFFF8E6B);
  static const Color accent = Color(0xFFFFB347);

  static const List<Color> brandGradient = [Color(0xFFFF5A5F), Color(0xFFFF8E6B)];

  // ---- Status ----
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ---- Surfaces ----
  static const Color background = Color(0xFFFFFBF8);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardGlass = Color(0xF8FFFFFF);
  static const Color surfaceMuted = Color(0xFFFFF3F0);
  static const Color border = Color(0xFFF2E8E5);
  static const Color borderStrong = Color(0xFFE5D5D0);
  static const Color cardTint = Color(0xFFFFFAF8);

  // ---- Text (warm ink hierarchy) ----
  static const Color textPrimary = Color(0xFF1C1C28); // rich ink
  static const Color textSecondary = Color(0xFF64647A); // muted plum-gray
  static const Color textTertiary = Color(0xFF9898A8); // soft caption
  static const Color textMuted = Color(0xFFB0A8A4); // warm taupe hints

  // ---- Shadow ----
  static const Color shadow = Color(0xFF1C1C28);
  // Warm-tinted shadow tone for layered card depth on the cream palette.
  static const Color shadowWarm = Color(0xFF7A4A45);

  // ---- Mesh glow ----
  static const Color meshRose = Color(0x12FF5A5F);
  static const Color meshPeach = Color(0x10FFE8DC);
}
