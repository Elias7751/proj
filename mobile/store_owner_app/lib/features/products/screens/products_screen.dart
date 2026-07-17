import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/product_controller.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ProductController productController = Get.put(ProductController());
    final AuthController authController = Get.find<AuthController>();

    void showPendingDialog() {
      Get.dialog(
        AlertDialog(
          title: const Text('حسابك قيد المراجعة'),
          content: const Text(
            'عذراً، يجب موافقة الإدارة على متجرك أولاً لتتمكن من إضافة أو تعديل المنتجات.',
            style: TextStyle(fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () => Get.back(),
              child: const Text('حسناً'),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('إدارة المنتجات')),
      body: RefreshIndicator(
        onRefresh: () => productController.fetchMyProducts(),
        color: const Color(0xFF4F46E5),
        child: Obx(() {
          if (productController.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
            );
          }

          if (productController.myProducts.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 150),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inventory_2_outlined, size: 100, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'لا توجد منتجات مضافة',
                        style: TextStyle(fontSize: 20, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }

          return ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: productController.myProducts.length,
          itemBuilder: (context, index) {
            final product = productController.myProducts[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(8),
                leading: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.image, color: Colors.grey),
                ),
                title: Text(
                  product['name'] ?? 'اسم المنتج',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      '${product['price']} ريال',
                      style: const TextStyle(
                        color: Color(0xFF4F46E5),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: product['status'] == 'active'
                            ? Colors.green.withOpacity(0.1)
                            : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        product['status'] == 'active' ? 'نشط' : 'غير نشط',
                        style: TextStyle(
                          color: product['status'] == 'active'
                              ? Colors.green
                              : Colors.red,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.shopping_bag_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          'المبيعات: ${product['salesCount'] ?? 0}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const SizedBox(width: 16),
                        const Icon(Icons.remove_red_eye_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          'المشاهدات: ${product['viewsCount'] ?? 0}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
                trailing: PopupMenuButton<String>(
                  onSelected: (value) {
                    final isPending = authController.currentStore['status'] == 'pending';
                    if (isPending) {
                      showPendingDialog();
                      return;
                    }

                    if (value == 'edit') {
                      Get.toNamed(
                        Routes.ADD_EDIT_PRODUCT,
                        arguments: {'product': product},
                      );
                    } else if (value == 'delete') {
                      _showDeleteDialog(
                        context,
                        productController,
                        product['id'],
                      );
                    }
                  },
                  itemBuilder: (BuildContext context) =>
                      <PopupMenuEntry<String>>[
                        const PopupMenuItem<String>(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit, color: Colors.blue),
                              SizedBox(width: 8),
                              Text('تعديل'),
                            ],
                          ),
                        ),
                        const PopupMenuItem<String>(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete, color: Colors.red),
                              SizedBox(width: 8),
                              Text('حذف'),
                            ],
                          ),
                        ),
                      ],
                ),
              ),
            );
          },
        );
      })),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          final isPending = authController.currentStore['status'] == 'pending';
          if (isPending) {
            showPendingDialog();
          } else {
            Get.toNamed(Routes.ADD_EDIT_PRODUCT);
          }
        },
        backgroundColor: const Color(0xFF4F46E5),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showDeleteDialog(
    BuildContext context,
    ProductController controller,
    String productId,
  ) {
    Get.defaultDialog(
      title: 'تأكيد الحذف',
      middleText: 'هل أنت متأكد أنك تريد حذف هذا المنتج؟',
      textConfirm: 'حذف',
      textCancel: 'إلغاء',
      confirmTextColor: Colors.white,
      buttonColor: Colors.red,
      onConfirm: () {
        Get.back(); // إغلاق الحوار
        controller.deleteProduct(productId);
      },
    );
  }
}
