import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Type scale. Display styles use Outfit; body/UI styles use DM Sans — applied
/// in [AppTheme]. Sizes and weights are fixed for consistency.
class AppTypography {
  const AppTypography._();

  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semibold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extraBold = FontWeight.w800;

  // ---- Display (Outfit) ----
  static const TextStyle displayLg = TextStyle(
    fontSize: 34,
    fontWeight: extraBold,
    height: 1.12,
    letterSpacing: -0.8,
  );
  static const TextStyle h1 = TextStyle(
    fontSize: 28,
    fontWeight: bold,
    height: 1.18,
    letterSpacing: -0.6,
  );
  static const TextStyle h2 = TextStyle(
    fontSize: 24,
    fontWeight: bold,
    height: 1.22,
    letterSpacing: -0.5,
  );
  static const TextStyle h3 = TextStyle(
    fontSize: 20,
    fontWeight: semibold,
    height: 1.28,
    letterSpacing: -0.3,
  );
  static const TextStyle title = TextStyle(
    fontSize: 18,
    fontWeight: semibold,
    height: 1.35,
    letterSpacing: -0.2,
  );

  /// The one contract for "title of a section" — the heading above a group of
  /// content, wherever it appears: `SectionHeader` on a page, `FormSection`
  /// inside a form.
  ///
  /// This is deliberately its own token rather than a `textTheme` slot. It used
  /// to borrow `titleLarge` (Outfit 18/w600) in one place and `titleMedium`
  /// (DM Sans 14/w700) in another, which is why section headings rendered in two
  /// different typefaces depending on the screen. Those slots are shared with
  /// dialogs, empty states and list rows, so they can't carry this weight.
  static const TextStyle sectionTitle = TextStyle(
    fontSize: 20,
    // Bold, not extraBold: at 20px Outfit's w800 turned form headings like
    // "Edit profile" into slabs that shouted over the fields beneath them.
    fontWeight: bold,
    height: 1.25,
    letterSpacing: -0.4,
  );

  // ---- Body (DM Sans) ----
  static const TextStyle body = TextStyle(
    fontSize: 16,
    fontWeight: regular,
    height: 1.55,
  );
  static const TextStyle bodySm = TextStyle(
    fontSize: 14,
    fontWeight: regular,
    height: 1.5,
  );
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0.2,
  );
  static const TextStyle overline = TextStyle(
    fontSize: 11,
    fontWeight: bold,
    height: 1.3,
    letterSpacing: 1.4,
  );
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: semibold,
    height: 1.2,
    letterSpacing: 0.15,
  );

  /// Build a [TextTheme] with a three-level text color hierarchy.
  static TextTheme buildTextTheme({
    required Color primary,
    required Color secondary,
    required Color tertiary,
  }) {
    return TextTheme(
      displayLarge: displayLg.copyWith(color: primary),
      headlineLarge: h1.copyWith(color: primary),
      headlineMedium: h2.copyWith(color: primary),
      headlineSmall: h3.copyWith(color: primary),
      titleLarge: title.copyWith(color: primary),
      titleMedium: bodySm.copyWith(
        color: primary,
        fontWeight: semibold,
        letterSpacing: -0.1,
      ),
      bodyLarge: body.copyWith(color: primary),
      bodyMedium: bodySm.copyWith(color: secondary),
      bodySmall: caption.copyWith(color: tertiary),
      labelLarge: button.copyWith(color: primary),
      labelSmall: overline.copyWith(color: AppColors.primary),
    );
  }
}
