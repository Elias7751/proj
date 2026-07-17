import 'dart:convert';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class CartController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = false.obs;

  // السلة المحلية (Local Cart)
  var cartItems = [].obs;
  var currentStoreId = ''.obs;

  // إضافة منتج للسلة
  void addToCart(
    Map<String, dynamic> product,
    Map<String, dynamic> variant,
    int quantity,
  ) {
    // التحقق من أن المنتج من نفس المتجر
    if (cartItems.isNotEmpty && currentStoreId.value != product['storeId']) {
      Get.snackbar(
        'تنبيه',
        'لا يمكن إضافة منتجات من متاجر مختلفة في نفس السلة. يرجى إفراغ السلة أولاً.',
      );
      return;
    }

    currentStoreId.value = product['storeId'];

    // التحقق مما إذا كان المنتج موجوداً مسبقاً (بنفس الخاصية)
    int existingIndex = cartItems.indexWhere(
      (item) =>
          item['product']['id'] == product['id'] &&
          (variant.isEmpty || item['variant']['id'] == variant['id']),
    );

    if (existingIndex >= 0) {
      // تحديث الكمية
      cartItems[existingIndex]['quantity'] += quantity;
      cartItems.refresh();
    } else {
      // إضافة جديد
      cartItems.add({
        'product': product,
        'variant': variant,
        'quantity': quantity,
      });
    }

    Get.snackbar(
      'نجاح',
      'تمت إضافة المنتج إلى السلة',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  // إزالة منتج من السلة
  void removeFromCart(int index) {
    cartItems.removeAt(index);
    if (cartItems.isEmpty) {
      currentStoreId.value = '';
    }
  }

  // حساب الإجمالي الفرعي
  double get subTotal {
    double total = 0.0;
    for (var item in cartItems) {
      double basePrice =
          double.tryParse(item['product']['price'].toString()) ?? 0.0;
      if (item['variant'] != null && item['variant'].isNotEmpty) {
        basePrice +=
            double.tryParse(item['variant']['additionalPrice'].toString()) ??
            0.0;
      }
      total += basePrice * item['quantity'];
    }
    return total;
  }

  // متغيرات الكوبون
  var couponCode = ''.obs;
  var discountAmount = 0.0.obs;
  var isCouponApplied = false.obs;
  var couponError = ''.obs;
  var couponId = ''.obs;

  // التحقق من الكوبون وتطبيقه
  Future<void> validateAndApplyCoupon(String code) async {
    if (code.isEmpty) return;
    if (cartItems.isEmpty) {
      Get.snackbar('تنبيه', 'السلة فارغة');
      return;
    }

    try {
      isLoading.value = true;
      couponError.value = '';

      final response = await _apiClient.post(
        '/offers/coupons/validate',
        data: {
          'code': code.toUpperCase(),
          'orderAmount': subTotal,
          'storeId': currentStoreId.value,
        },
      );

      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final data = responseData['data'];
        
        couponCode.value = code.toUpperCase();
        discountAmount.value = double.tryParse(data['discountAmount'].toString()) ?? 0.0;
        couponId.value = data['couponId'].toString();
        isCouponApplied.value = true;
        couponError.value = '';

        Get.snackbar('نجاح', 'تم تطبيق الكوبون بنجاح');
      }
    } on DioException catch (e) {
      isCouponApplied.value = false;
      discountAmount.value = 0.0;
      couponCode.value = '';
      couponId.value = '';
      
      String errorMessage = 'الكوبون غير صالح';
      if (e.response?.data != null) {
        var responseData = e.response?.data;
        if (responseData is String) {
          try {
            responseData = jsonDecode(responseData);
          } catch (_) {}
        }
        if (responseData is Map) {
          errorMessage = responseData['message'] ?? errorMessage;
        }
      }
      couponError.value = errorMessage;
      Get.snackbar('خطأ', errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  // إزالة الكوبون
  void removeCoupon() {
    couponCode.value = '';
    discountAmount.value = 0.0;
    isCouponApplied.value = false;
    couponError.value = '';
    couponId.value = '';
  }

  // إتمام الطلب (Checkout)
  Future<void> checkout(
    Map<String, dynamic> deliveryAddress,
    String paymentMethod,
    String notes,
  ) async {
    if (cartItems.isEmpty) return;

    try {
      isLoading.value = true;

      // 1. تفريغ السلة في الـ Backend أولاً لتجنب تكرار الكميات
      try {
        await _apiClient.delete('/cart');
      } catch (_) {}

      // 2. إرسال المنتجات إلى السلة في الـ Backend
      for (var item in cartItems) {
        await _apiClient.post(
          '/cart',
          data: {
            'storeId': currentStoreId.value,
            'productId': item['product']['id'],
            'variantId': item['variant'] != null && item['variant'].isNotEmpty
                ? item['variant']['id']
                : null,
            'quantity': item['quantity'],
          },
        );
      }

      // 2. تحويل السلة إلى طلب
      final response = await _apiClient.post(
        '/orders',
        data: {
          'deliveryAddress': deliveryAddress,
          'paymentMethod': paymentMethod,
          'notes': notes,
          'couponCode': isCouponApplied.value ? couponCode.value : null,
        },
      );

      if (response.statusCode == 201) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final data = responseData['data'];
        final whatsappLink = data['whatsappLink'];

        // إفراغ السلة المحلية
        cartItems.clear();
        currentStoreId.value = '';
        removeCoupon();

        Get.snackbar('نجاح', 'تم إنشاء الطلب بنجاح');

        // فتح رابط واتساب
        if (whatsappLink != null) {
          final Uri url = Uri.parse(whatsappLink);
          try {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          } catch (e) {
            Get.snackbar('تنبيه', 'تعذر فتح تطبيق واتساب. تأكد من تثبيته على جهازك.');
          }
        }

        // الانتقال إلى شاشة الطلبات
        Get.offNamed('/orders');
      }
    } catch (e) {
      String errorMessage = 'حدث خطأ أثناء إنشاء الطلب';
      if (e is DioException && e.response != null) {
        var responseData = e.response?.data;
        if (responseData is String) {
          try {
            responseData = jsonDecode(responseData);
          } catch (_) {}
        }
        if (responseData is Map) {
          errorMessage = responseData['message'] ?? errorMessage;
        }
      }
      Get.snackbar('خطأ', errorMessage);
    } finally {
      isLoading.value = false;
    }
  }
}
