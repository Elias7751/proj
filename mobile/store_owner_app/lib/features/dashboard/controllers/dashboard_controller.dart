import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class DashboardController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var summary = {}.obs;
  var recentOrders = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    try {
      isLoading.value = true;

      // جلب ملخص الإحصائيات
      final summaryResponse = await _apiClient.get('/analytics/store/summary');
      if (summaryResponse.statusCode == 200) {
        summary.value = summaryResponse.data['data'];
      }

      // جلب أحدث الطلبات
      final ordersResponse = await _apiClient.get('/orders/store');
      if (ordersResponse.statusCode == 200) {
        List allOrders = ordersResponse.data['data'];
        recentOrders.value = allOrders.take(5).toList(); // أحدث 5 طلبات
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب بيانات لوحة التحكم');
    } finally {
      isLoading.value = false;
    }
  }
}
