import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // الألوان المستوحاة من اللوجو
  static const Color primaryDark = Color(0xFF0B132B); // لون الخلفية الداكن
  static const Color primaryCyan = Color(0xFF00E5FF); // لون التدرج الأول
  static const Color primaryGreen = Color(0xFF00E676); // لون التدرج الثاني
  static const Color backgroundLight = Color(0xFFF4F7F6);
  static const Color textDark = Color(0xFF0B132B);
  static const Color textLight = Colors.white;
  static const Color greyColor = Color(0xFF9E9E9E);

  // تدرج لوني (Gradient) للأزرار والعناصر
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryCyan, primaryGreen],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryDark,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primaryDark,
        secondary: primaryCyan,
        background: backgroundLight,
      ),
      textTheme: GoogleFonts.cairoTextTheme().copyWith(
        displayLarge: GoogleFonts.cairo(color: textDark, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.cairo(color: textDark, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.cairo(color: textDark),
        bodyMedium: GoogleFonts.cairo(color: textDark),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: primaryDark,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.cairo(
          color: textLight,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: const IconThemeData(color: textLight),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryDark,
          foregroundColor: textLight,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          textStyle: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryCyan),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 4,
        shadowColor: Colors.black.withOpacity(0.1),
      ),
    );
  }
}
