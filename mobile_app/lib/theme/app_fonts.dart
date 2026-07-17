import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Font pairing: [display] = Outfit (headlines), [body] = DM Sans (UI & prose).
class AppFonts {
  const AppFonts._();

  static TextStyle display(TextStyle style) =>
      GoogleFonts.outfit(textStyle: style);

  static TextStyle body(TextStyle style) =>
      GoogleFonts.dmSans(textStyle: style);

  static TextStyle displayTextTheme(TextStyle style) => display(style);
  static TextStyle bodyTextTheme(TextStyle style) => body(style);
}
