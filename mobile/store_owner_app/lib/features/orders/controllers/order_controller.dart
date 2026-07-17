import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class OrderController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var isUpdating = false.obs;
  var storeOrders = [].obs;
  var currentOrder = {}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchStoreOrders();
  }

  // جلب طلبات المتجر
  Future<void> fetchStoreOrders() async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/orders/store');
      if (response.statusCode == 200) {
        storeOrders.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب الطلبات');
    } finally {
      isLoading.value = false;
    }
  }

  // جلب تفاصيل طلب معين
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

  // تحديث حالة الطلب
  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    try {
      isUpdating.value = true;

      final response = await _apiClient.put(
        '/orders/$orderId/status',
        data: {'status': newStatus},
      );

      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم تحديث حالة الطلب بنجاح');
        // تحديث البيانات محلياً
        currentOrder['status'] = newStatus;
        currentOrder.refresh();
        fetchStoreOrders(); // تحديث القائمة الرئيسية
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      isUpdating.value = false;
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
