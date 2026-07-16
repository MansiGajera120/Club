import 'package:flutter/material.dart';

/// Refined text hierarchy for the cool "Ocean Blue" palette.
class AppColors {
  const AppColors._();

  // ---- Brand ----
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color secondary = Color(0xFF38BDF8);
  static const Color accent = Color(0xFF0EA5E9);

  static const List<Color> brandGradient = [Color(0xFF2563EB), Color(0xFF38BDF8)];

  // ---- Status ----
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ---- Surfaces ----
  static const Color background = Color(0xFFF7F9FC);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardGlass = Color(0xF8FFFFFF);
  static const Color surfaceMuted = Color(0xFFEEF3FB);
  static const Color border = Color(0xFFE4EAF2);
  static const Color borderStrong = Color(0xFFD2DCEA);
  static const Color cardTint = Color(0xFFF8FBFE);

  // ---- Text (cool ink hierarchy) ----
  static const Color textPrimary = Color(0xFF111827); // slate ink
  static const Color textSecondary = Color(0xFF566072); // cool slate-gray
  static const Color textTertiary = Color(0xFF8A93A3); // soft caption
  static const Color textMuted = Color(0xFFA7B0BF); // cool hints

  // ---- Shadow ----
  static const Color shadow = Color(0xFF0F172A);
  // Cool blue-tinted shadow tone for layered card depth.
  static const Color shadowTint = Color(0xFF1E3A5F);

  // ---- Mesh glow ----
  static const Color meshRose = Color(0x122563EB); // blue wash
  static const Color meshPeach = Color(0x0E38BDF8); // sky wash
}
