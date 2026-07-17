import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../routes/app_pages.dart';
import '../controllers/auth_controller.dart';
import '../../../core/theme/app_theme.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.put(AuthController(), permanent: true);
    final TextEditingController phoneController = TextEditingController();
    final TextEditingController passwordController = TextEditingController();

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // Logo
              Center(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryCyan.withOpacity(0.2),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(60),
                    child: Image.asset(
                      'assets/images/logo.jpg',
                      fit: BoxFit.cover,
                    ),
                  ),
                ).animate()
                 .scale(duration: 600.ms, curve: Curves.easeOutBack)
                 .fadeIn(duration: 600.ms),
              ),
              const SizedBox(height: 32),
              Text(
                'لوحة التاجر',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryDark,
                ),
                textAlign: TextAlign.center,
              ).animate().slideY(begin: 0.3, duration: 500.ms).fadeIn(),
              const SizedBox(height: 8),
              Text(
                'قم بتسجيل الدخول لإدارة متجرك',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppTheme.greyColor,
                ),
                textAlign: TextAlign.center,
              ).animate().slideY(begin: 0.3, duration: 500.ms, delay: 100.ms).fadeIn(),
              const SizedBox(height: 48),
              
              // Phone Input
              TextFormField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'رقم الهاتف',
                  prefixIcon: Icon(Icons.phone, color: AppTheme.primaryDark),
                ),
                keyboardType: TextInputType.phone,
              ).animate().slideX(begin: 0.1, duration: 500.ms, delay: 200.ms).fadeIn(),
              
              const SizedBox(height: 16),
              
              // Password Input
              TextFormField(
                controller: passwordController,
                decoration: const InputDecoration(
                  labelText: 'كلمة المرور',
                  prefixIcon: Icon(Icons.lock, color: AppTheme.primaryDark),
                  suffixIcon: Icon(Icons.visibility_off, color: AppTheme.greyColor),
                ),
                obscureText: true,
              ).animate().slideX(begin: 0.1, duration: 500.ms, delay: 300.ms).fadeIn(),
              
              const SizedBox(height: 32),
              
              // Login Button
              Obx(
                () => Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: AppTheme.primaryGradient,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGreen.withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: authController.isLoading.value
                        ? null
                        : () {
                            if (phoneController.text.isNotEmpty &&
                                passwordController.text.isNotEmpty) {
                              authController.login(
                                phoneController.text,
                                passwordController.text,
                              );
                            } else {
                              Get.snackbar(
                                'تنبيه',
                                'يرجى إدخال رقم الهاتف وكلمة المرور',
                                backgroundColor: Colors.redAccent,
                                colorText: Colors.white,
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: authController.isLoading.value
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Text(
                            'تسجيل الدخول',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              ).animate().scale(duration: 500.ms, delay: 400.ms).fadeIn(),
              
              const SizedBox(height: 24),
              
              TextButton(
                onPressed: () {
                  Get.toNamed(Routes.REGISTER_STORE);
                },
                style: TextButton.styleFrom(
                  foregroundColor: AppTheme.primaryDark,
                ),
                child: const Text(
                  'ليس لديك متجر؟ انضم إلينا كتاجر',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ).animate().fadeIn(duration: 500.ms, delay: 500.ms),
            ],
          ),
        ),
      ),
    );
  }
}
