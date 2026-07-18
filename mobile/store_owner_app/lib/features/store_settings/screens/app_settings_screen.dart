import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';
import 'policy_screen.dart';

class AppSettingsScreen extends StatelessWidget {
  const AppSettingsScreen({super.key});

  Future<void> _launchURL(String urlString) async {
    if (urlString.isEmpty) return;
    final Uri uri = Uri.parse(urlString);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      Get.snackbar('تنبيه', 'تعذر فتح الرابط');
    }
  }

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'الإعدادات',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // قسم الحساب والاشتراكات
          Text(
            'الحساب والاشتراكات',
            style: GoogleFonts.cairo(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(height: 8),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.store, color: Colors.blue),
                  title: Text('إعدادات المتجر', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => Get.toNamed(Routes.STORE_SETTINGS),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.card_membership, color: Colors.orange),
                  title: Text('إدارة الاشتراكات والخطط', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    final isPending = authController.currentStore['status'] == 'pending';
                    if (isPending) {
                      Get.snackbar('تنبيه', 'حسابك قيد المراجعة، لا يمكنك ترقية الاشتراك حالياً');
                    } else {
                      Get.toNamed(Routes.SUBSCRIPTIONS);
                    }
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.local_offer, color: Colors.green),
                  title: Text('العروض والكوبونات', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    final isPending = authController.currentStore['status'] == 'pending';
                    if (isPending) {
                      Get.snackbar('تنبيه', 'حسابك قيد المراجعة، لا يمكنك إضافة عروض حالياً');
                    } else {
                      Get.toNamed(Routes.OFFERS);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // قسم المنصة
          Text(
            'حول المنصة',
            style: GoogleFonts.cairo(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(height: 8),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.gavel, color: Colors.brown),
                  title: Text('شروط وأحكام المنصة', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Get.to(() => const PolicyScreen(
                      title: 'شروط وأحكام المنصة',
                      content: '1. يلتزم التاجر بتقديم منتجات مطابقة للوصف.\n\n'
                               '2. يمنع بيع المنتجات المحظورة قانونياً.\n\n'
                               '3. المنصة غير مسؤولة عن أي خلاف مالي بين التاجر والعميل خارج نطاق المنصة.\n\n'
                               '4. يحق للمنصة إيقاف أي متجر يخالف الشروط.',
                    ));
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.privacy_tip, color: Colors.teal),
                  title: Text('سياسة الخصوصية', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Get.to(() => const PolicyScreen(
                      title: 'سياسة الخصوصية',
                      content: 'نحن نحترم خصوصيتك. يتم تشفير بياناتك ولا يتم مشاركتها مع أي طرف ثالث بدون موافقتك. نستخدم بياناتك فقط لتحسين تجربتك في المنصة وتسهيل عمليات البيع والشراء.',
                    ));
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // قسم الدعم والمساعدة
          Text(
            'الدعم والمساعدة',
            style: GoogleFonts.cairo(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(height: 8),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.support_agent, color: Colors.indigo),
                  title: Text('الدعم الفني (واتساب)', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    // رقم الدعم الفني الافتراضي
                    _launchURL('https://wa.me/967700000000?text=مرحباً، أحتاج إلى مساعدة بخصوص متجري');
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.help_outline, color: Colors.blueGrey),
                  title: Text('الأسئلة الشائعة', style: GoogleFonts.cairo()),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Get.to(() => const PolicyScreen(
                      title: 'الأسئلة الشائعة',
                      content: 'س: كيف أضيف منتج؟\n'
                               'ج: من لوحة التحكم، اضغط على "المنتجات" ثم "إضافة منتج".\n\n'
                               'س: كيف أغير باقتي؟\n'
                               'ج: من الإعدادات > إدارة الاشتراكات والخطط.',
                    ));
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // تسجيل الخروج
          ElevatedButton.icon(
            onPressed: () {
              Get.dialog(
                AlertDialog(
                  title: Text('تسجيل الخروج', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                  content: Text('هل أنت متأكد أنك تريد تسجيل الخروج؟', style: GoogleFonts.cairo()),
                  actions: [
                    TextButton(
                      onPressed: () => Get.back(),
                      child: Text('إلغاء', style: GoogleFonts.cairo(color: Colors.grey)),
                    ),
                    TextButton(
                      onPressed: () {
                        Get.back();
                        authController.logout();
                      },
                      child: Text('تأكيد', style: GoogleFonts.cairo(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
            icon: const Icon(Icons.logout),
            label: Text(
              'تسجيل الخروج',
              style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade50,
              foregroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(vertical: 16),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.red.shade200),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: Text(
              'الإصدار 1.0.0',
              style: GoogleFonts.cairo(color: Colors.grey, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
