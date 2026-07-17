import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class OrderController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var myOrders = [].obs;
  var currentOrder = {}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchMyOrders();
  }

  Future<void> fetchMyOrders() async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/orders/my');
      if (response.statusCode == 200) {
        myOrders.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب الطلبات');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchOrderDetails(String orderId) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/orders/$orderId');
      if (response.statusCode == 200) {
        currentOrder.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      isLoading.value = false;
    }
  }

  // دالة مساعدة لترجمة حالة الطلب
  String translateStatus(String status) {
    switch (status) {
      case 'pending':
      case 'new':
        return 'قيد المراجعة';
      case 'preparing':
        return 'جاري التجهيز';
      case 'on_the_way':
        return 'في الطريق';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }
}
