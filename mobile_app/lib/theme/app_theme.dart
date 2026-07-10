import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_colors.dart';
import 'app_fonts.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Light-only theme — "Sunrise Bloom" with Outfit headlines + DM Sans body.
class AppTheme {
  const AppTheme._();

  static ThemeData get light => _build();

  static TextStyle _display(TextStyle style) => AppFonts.display(style);
  static TextStyle _body(TextStyle style) => AppFonts.body(style);

  static TextTheme _buildTextTheme() {
    final base = AppTypography.buildTextTheme(
      primary: AppColors.textPrimary,
      secondary: AppColors.textSecondary,
      tertiary: AppColors.textTertiary,
    );

    return TextTheme(
      displayLarge: _display(base.displayLarge!),
      headlineLarge: _display(base.headlineLarge!),
      headlineMedium: _display(base.headlineMedium!),
      headlineSmall: _display(base.headlineSmall!),
      titleLarge: _display(base.titleLarge!),
      titleMedium: _body(base.titleMedium!),
      bodyLarge: _body(base.bodyLarge!),
      bodyMedium: _body(base.bodyMedium!),
      bodySmall: _body(base.bodySmall!),
      labelLarge: _body(base.labelLarge!),
      labelSmall: _body(base.labelSmall!),
    );
  }

  static ThemeData _build() {
    const textPrimary = AppColors.textPrimary;
    const textSecondary = AppColors.textSecondary;
    const border = AppColors.border;
    final textTheme = _buildTextTheme();

    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      primaryContainer: Color(0xFFFFE8E6),
      onPrimaryContainer: AppColors.primaryDark,
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      tertiary: AppColors.accent,
      error: AppColors.danger,
      onError: Colors.white,
      surface: AppColors.card,
      onSurface: textPrimary,
      surfaceContainerHighest: AppColors.surfaceMuted,
      outline: border,
      outlineVariant: border,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: scheme,
      scaffoldBackgroundColor: Colors.transparent,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      dividerColor: border,
      dividerTheme: const DividerThemeData(color: border, space: 1, thickness: 1),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        foregroundColor: textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        titleTextStyle:
            _display(AppTypography.title).copyWith(color: textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shadowColor: AppColors.shadow.withValues(alpha: 0.06),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.lgAll,
          side: const BorderSide(color: border),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          textStyle: _body(AppTypography.button),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          textStyle: _body(AppTypography.button),
          side: const BorderSide(color: border, width: 1.5),
          foregroundColor: textPrimary,
          backgroundColor: AppColors.card,
          shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          textStyle: _body(AppTypography.button),
          foregroundColor: AppColors.primary,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.card,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.lg,
        ),
        labelStyle: _body(AppTypography.bodySm).copyWith(
          color: textSecondary,
          fontWeight: FontWeight.w500,
        ),
        hintStyle: _body(AppTypography.body).copyWith(color: AppColors.textMuted),
        border: OutlineInputBorder(
          borderRadius: AppRadius.mdAll,
          borderSide: const BorderSide(color: AppColors.borderStrong),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.mdAll,
          borderSide: const BorderSide(color: AppColors.borderStrong, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.mdAll,
          borderSide: const BorderSide(color: AppColors.primary, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadius.mdAll,
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppRadius.mdAll,
          borderSide: const BorderSide(color: AppColors.danger, width: 1.8),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.primary.withValues(alpha: 0.08),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.pillAll),
        labelStyle: _body(AppTypography.caption).copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.transparent,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: textSecondary,
        selectedLabelStyle: _body(AppTypography.caption),
        unselectedLabelStyle: _body(AppTypography.caption),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        indicatorColor: AppColors.primary.withValues(alpha: 0.12),
        elevation: 0,
        height: 64,
        labelTextStyle: WidgetStatePropertyAll(_body(AppTypography.caption)),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 24);
          }
          return const IconThemeData(color: textSecondary, size: 24);
        }),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        elevation: 0,
        backgroundColor: Colors.transparent,
        contentTextStyle: _body(AppTypography.bodySm).copyWith(
          color: AppColors.textPrimary,
          fontWeight: AppTypography.semibold,
        ),
        shape: RoundedRectangleBorder(borderRadius: AppRadius.lgAll),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        titleTextStyle:
            _display(AppTypography.h3).copyWith(color: textPrimary),
        contentTextStyle:
            _body(AppTypography.bodySm).copyWith(color: textSecondary),
        shape: RoundedRectangleBorder(borderRadius: AppRadius.xlAll),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          textStyle: WidgetStatePropertyAll(_body(AppTypography.bodySm)),
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return AppColors.primary.withValues(alpha: 0.12);
            }
            return AppColors.surfaceMuted;
          }),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) return AppColors.primary;
            return textSecondary;
          }),
          side: WidgetStateProperty.all(const BorderSide(color: border)),
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(borderRadius: AppRadius.mdAll),
          ),
        ),
      ),
    );
  }
}
