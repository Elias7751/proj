import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/main_controller.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import '../../orders/screens/orders_screen.dart';
import '../../products/screens/products_screen.dart';
import '../../store_settings/screens/app_settings_screen.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final MainController controller = Get.put(MainController());
    final AuthController authController = Get.find<AuthController>();

    final List<Widget> pages = [
      const DashboardScreen(),
      const OrdersScreen(),
      const ProductsScreen(),
      const AppSettingsScreen(),
    ];

    return Scaffold(
      body: Obx(() {
        final isPending = authController.currentStore['status'] == 'pending';
        return Column(
          children: [
            if (isPending)
              Container(
                color: Colors.amber.shade800,
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                child: SafeArea(
                  bottom: false,
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.white),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'متجرك قيد المراجعة حالياً. لن تتمكن من إضافة منتجات أو استقبال طلبات حتى يتم التفعيل.',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Get.dialog(
                            AlertDialog(
                              title: const Text('تواصل مع الدعم الفني'),
                              content: const Text(
                                'لتفعيل متجرك أو الاستفسار، يرجى التواصل مع الإدارة عبر الواتساب:\n\nرقم الدعم: 777777777',
                                style: TextStyle(fontSize: 15),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Get.back(),
                                  child: const Text('إغلاق'),
                                ),
                              ],
                            ),
                          );
                        },
                        child: const Text(
                          'تواصل معنا',
                          style: TextStyle(
                            color: Colors.white,
                            decoration: TextDecoration.underline,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            Expanded(child: pages[controller.currentIndex.value]),
          ],
        );
      }),
      bottomNavigationBar: Obx(
        () => Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: controller.currentIndex.value,
            onTap: controller.changePage,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: const Color(0xFF4F46E5),
            unselectedItemColor: Colors.grey.shade400,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
            elevation: 0,
            items: const [
              BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.dashboard_outlined),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.dashboard),
                ),
                label: 'الرئيسية',
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.receipt_long_outlined),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.receipt_long),
                ),
                label: 'الطلبات',
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.inventory_2_outlined),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.inventory_2),
                ),
                label: 'المنتجات',
              ),
              BottomNavigationBarItem(
                icon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.settings_outlined),
                ),
                activeIcon: Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Icon(Icons.settings),
                ),
                label: 'الإعدادات',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
