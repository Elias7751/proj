import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import 'routes/app_pages.dart';

void main() {
  runApp(const CustomerApp());
}

class CustomerApp extends StatelessWidget {
  const CustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Sellink',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // لون رئيسي (Indigo)
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFFEC4899), // لون ثانوي (Pink/Magenta)
          background: const Color(0xFFF8FAFC),
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.cairoTextTheme(Theme.of(context).textTheme),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          foregroundColor: Color(0xFF0F172A),
        ),
      ),
      locale: const Locale('ar', 'YE'), // اللغة الافتراضية العربية
      fallbackLocale: const Locale('ar', 'YE'),
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
    );
  }
}
