import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/theme/app_theme.dart';
import 'routes/app_pages.dart';

import 'package:firebase_core/firebase_core.dart';
import 'core/services/firebase_messaging_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

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
