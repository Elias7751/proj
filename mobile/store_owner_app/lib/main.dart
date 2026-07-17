import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/theme/app_theme.dart';
import 'routes/app_pages.dart';

void main() {
  runApp(const StoreOwnerApp());
}

class StoreOwnerApp extends StatelessWidget {
  const StoreOwnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Sellink Business',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: const Locale('ar', 'YE'), // اللغة الافتراضية العربية
      fallbackLocale: const Locale('ar', 'YE'),
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
    );
  }
}
