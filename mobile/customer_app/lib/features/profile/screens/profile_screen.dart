import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('حسابي'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Get.defaultDialog(
                title: 'تسجيل الخروج',
                middleText: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
                textConfirm: 'نعم',
                textCancel: 'إلغاء',
                confirmTextColor: Colors.white,
                onConfirm: () {
                  authController.logout();
                },
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await authController.checkLoginStatus();
        },
        color: const Color(0xFF6366F1),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // معلومات المستخدم
              Obx(() {
                final user = authController.currentUser;
                return Column(
                  children: [
                    const CircleAvatar(
                      radius: 50,
                      backgroundColor: Color(0xFF6366F1),
                      child: Icon(Icons.person, size: 50, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user['fullName'] ?? 'المستخدم',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user['phone'] ?? '',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  ],
                );
              }),
              const SizedBox(height: 32),

              // القائمة
              _buildListTile(
                icon: Icons.edit,
                title: 'تعديل البيانات',
                onTap: () {
                  // TODO: فتح شاشة تعديل البيانات
                },
              ),
              _buildListTile(
                icon: Icons.receipt_long,
                title: 'طلباتي',
                onTap: () {
                  Get.toNamed(Routes.ORDERS);
                },
              ),
              _buildListTile(
                icon: Icons.favorite_border,
                title: 'المفضلات',
                onTap: () {
                  Get.toNamed(Routes.FAVORITES);
                },
              ),
              _buildListTile(
                icon: Icons.star_outline,
                title: 'تقييماتي',
                onTap: () {
                  Get.toNamed(Routes.REVIEWS);
                },
              ),
              _buildListTile(
                icon: Icons.support_agent,
                title: 'الدعم الفني',
                onTap: () {
                  Get.toNamed(Routes.TICKETS);
                },
              ),
              _buildListTile(
                icon: Icons.settings_outlined,
                title: 'الإعدادات',
                onTap: () {
                  Get.toNamed(Routes.SETTINGS);
                },
              ),
              const SizedBox(height: 16),
              _buildListTile(
                icon: Icons.delete_forever,
                title: 'حذف الحساب',
                textColor: Colors.red,
                iconColor: Colors.red,
                onTap: () {
                  Get.defaultDialog(
                    title: 'حذف الحساب',
                    middleText: 'هل أنت متأكد أنك تريد حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
                    textConfirm: 'حذف نهائي',
                    textCancel: 'إلغاء',
                    confirmTextColor: Colors.white,
                    buttonColor: Colors.red,
                    onConfirm: () async {
                      Get.back();
                      await authController.deleteAccount();
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? textColor,
    Color? iconColor,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: (iconColor ?? const Color(0xFF6366F1)).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: iconColor ?? const Color(0xFF6366F1)),
        ),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
