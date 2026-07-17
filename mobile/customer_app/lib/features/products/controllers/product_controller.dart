import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class ProductController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var currentProduct = {}.obs;

  // للتحكم في الخصائص المتغيرة (Variants)
  var selectedVariant = {}.obs;
  var quantity = 1.obs;

  // جلب تفاصيل المنتج
  Future<void> fetchProductDetails(String productId) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/products/$productId');
      if (response.statusCode == 200) {
        currentProduct.value = response.data['data'];

        // إذا كان هناك خصائص متغيرة، نختار الأولى افتراضياً
        if (currentProduct['variants'] != null &&
            currentProduct['variants'].isNotEmpty) {
          selectedVariant.value = currentProduct['variants'][0];
        }
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب تفاصيل المنتج');
    } finally {
      isLoading.value = false;
    }
  }

  void selectVariant(Map<String, dynamic> variant) {
    selectedVariant.value = variant;
  }

  void incrementQuantity() {
    quantity.value++;
  }

  void decrementQuantity() {
    if (quantity.value > 1) {
      quantity.value--;
    }
  }

  // حساب السعر الإجمالي بناءً على الخاصية المختارة والكمية
  double get totalPrice {
    if (currentProduct.isEmpty) return 0.0;

    double basePrice =
        double.tryParse(currentProduct['price'].toString()) ?? 0.0;

    if (selectedVariant.isNotEmpty) {
      double additionalPrice =
          double.tryParse(selectedVariant['additionalPrice'].toString()) ?? 0.0;
      basePrice += additionalPrice;
    }

    return basePrice * quantity.value;
  }

  // تسجيل طلب تواصل (Lead) في النظام
  Future<bool> createLead(String productId, int qty, Map<dynamic, dynamic> variant) async {
    try {
      Map<String, dynamic>? variantDetails;
      if (variant.isNotEmpty) {
        variantDetails = {
          'attributeName': variant['attributeName'],
          'attributeValue': variant['attributeValue'],
        };
      }

      final response = await _apiClient.post(
        '/orders/lead',
        data: {
          'productId': productId,
          'quantity': qty,
          'variantDetails': variantDetails,
        },
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Error creating lead: $e');
      return false;
    }
  }
}
