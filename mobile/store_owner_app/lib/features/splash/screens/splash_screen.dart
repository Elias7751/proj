import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../routes/app_pages.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/sellink_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 3));
    final AuthController authController = Get.put(AuthController(), permanent: true);
    final prefs = await authController.checkLoginStatusAndReturn();
    if (!prefs) {
      Get.offAllNamed(Routes.LOGIN);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppTheme.primaryDark,
              Color(0xFF0A1128),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryCyan.withOpacity(0.2),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const SellinkLogo(size: 180),
              ).animate()
               .scale(duration: 800.ms, curve: Curves.easeOutBack)
               .fadeIn(duration: 800.ms),
              
              const SizedBox(height: 30),
              
              // App Name
              Text(
                'Sellink Business',
                style: GoogleFonts.outfit(
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 1.5,
                ),
              ).animate()
               .slideY(begin: 0.5, end: 0, duration: 600.ms, delay: 400.ms, curve: Curves.easeOutQuad)
               .fadeIn(duration: 600.ms, delay: 400.ms),
              
              const SizedBox(height: 10),
              
              // Subtitle
              Text(
                'لوحة تحكم وإدارة المتاجر',
                style: GoogleFonts.cairo(
                  fontSize: 16,
                  color: Colors.white70,
                  fontWeight: FontWeight.w500,
                ),
              ).animate()
               .slideY(begin: 0.5, end: 0, duration: 600.ms, delay: 600.ms, curve: Curves.easeOutQuad)
               .fadeIn(duration: 600.ms, delay: 600.ms),
              
              const SizedBox(height: 50),
              
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: AppTheme.primaryCyan,
                  strokeWidth: 2.5,
                ),
              ).animate()
               .fadeIn(duration: 600.ms, delay: 1000.ms),
            ],
          ),
        ),
      ),
    );
  }
}
