import 'package:get/get.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';

class ProductController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var isSaving = false.obs;
  var myProducts = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchMyProducts();
  }

  // جلب منتجات المتجر الحالي
  Future<void> fetchMyProducts() async {
    try {
      isLoading.value = true;

      // نفترض أن الـ Backend لديه راوت لجلب منتجات المتجر الخاص بالتاجر المسجل
      final response = await _apiClient.get('/products/store/my');
      if (response.statusCode == 200) {
        myProducts.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      isLoading.value = false;
    }
  }

  // إضافة منتج جديد
  Future<void> addProduct(Map<String, dynamic> productData, {Function? onSuccessClear}) async {
    try {
      isSaving.value = true;

      final response = await _apiClient.post('/products', data: productData);
      if (response.statusCode == 201 || response.statusCode == 200) {
        fetchMyProducts(); // تحديث القائمة
        
        // إظهار حوار يسأل المستخدم
        Get.defaultDialog(
          title: 'تم بنجاح',
          middleText: 'تم إضافة المنتج بنجاح. هل تريد إضافة منتج آخر؟',
          textConfirm: 'إضافة منتج آخر',
          textCancel: 'العودة للقائمة',
          confirmTextColor: Color(0xFFFFFFFF),
          cancelTextColor: Color(0xFF4F46E5),
          buttonColor: Color(0xFF4F46E5),
          onConfirm: () {
            Get.back(); // إغلاق الحوار
            // سنقوم بتفريغ الحقول من الشاشة نفسها
            if (onSuccessClear != null) {
              onSuccessClear();
            }
          },
          onCancel: () {
            Get.back(); // إغلاق الحوار
            Get.back(); // إغلاق شاشة إضافة المنتج والعودة للقائمة
          },
        );
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء إضافة المنتج');
    } finally {
      isSaving.value = false;
    }
  }

  // تحديث منتج موجود
  Future<void> updateProduct(
    String productId,
    Map<String, dynamic> productData,
  ) async {
    try {
      isSaving.value = true;

      final response = await _apiClient.put(
        '/products/$productId',
        data: productData,
      );
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم تحديث المنتج بنجاح');
        fetchMyProducts(); // تحديث القائمة
        Get.back(); // العودة للشاشة السابقة
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      isSaving.value = false;
    }
  }

  // حذف منتج
  Future<void> deleteProduct(String productId) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.delete('/products/$productId');
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم حذف المنتج بنجاح');
        fetchMyProducts(); // تحديث القائمة
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء حذف المنتج');
    } finally {
      isLoading.value = false;
    }
  }
}
