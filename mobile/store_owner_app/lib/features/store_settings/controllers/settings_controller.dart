import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class SettingsController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var isSaving = false.obs;
  var storeDetails = {}.obs;
  var currentSubscription = {}.obs;
  var availablePlans = [].obs;
  var platformSettings = {}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchStoreDetails();
    fetchSubscriptionDetails();
    fetchPlatformSettings();
  }

  // جلب إعدادات المنصة (السياسات وغيرها)
  Future<void> fetchPlatformSettings() async {
    try {
      final response = await _apiClient.get('/settings');
      if (response.statusCode == 200) {
        platformSettings.value = response.data['data'];
      }
    } catch (e) {
      // تجاهل الأخطاء
    }
  }

  // جلب تفاصيل المتجر
  Future<void> fetchStoreDetails() async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/stores/my-store');
      if (response.statusCode == 200) {
        storeDetails.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب بيانات المتجر');
    } finally {
      isLoading.value = false;
    }
  }

  // تحديث بيانات المتجر
  Future<void> updateStoreDetails(Map<String, dynamic> data) async {
    try {
      isSaving.value = true;

      final response = await _apiClient.put('/stores/my-store', data: data);
      if (response.statusCode == 200) {
        storeDetails.value = response.data['data'];
        Get.snackbar('نجاح', 'تم تحديث بيانات المتجر بنجاح');
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث بيانات المتجر');
    } finally {
      isSaving.value = false;
    }
  }

  // جلب تفاصيل الاشتراك والباقات المتاحة
  Future<void> fetchSubscriptionDetails() async {
    try {
      // جلب الاشتراك الحالي
      final subResponse = await _apiClient.get('/subscriptions/my');
      if (subResponse.statusCode == 200 && subResponse.data['data'] != null) {
        currentSubscription.value = subResponse.data['data'];
      } else {
        currentSubscription.value = {};
      }
    } catch (e) {
      currentSubscription.value = {};
    }

    try {
      // جلب الباقات المتاحة
      final plansResponse = await _apiClient.get('/subscriptions/plans');
      if (plansResponse.statusCode == 200) {
        availablePlans.value = plansResponse.data['data'] ?? [];
      }
    } catch (e) {
      // تجاهل الأخطاء هنا مؤقتاً
    }
  }

  // ترقية الباقة
  Future<void> upgradePlan(String planId) async {
    try {
      isSaving.value = true;

      final response = await _apiClient.post(
        '/subscriptions/subscribe',
        data: {
          'planId': planId,
          'paymentMethod': 'bank_transfer', // مؤقتاً
        },
      );

      if (response.statusCode == 201) {
        Get.snackbar('نجاح', 'تم طلب الترقية بنجاح، بانتظار تأكيد الدفع');
        fetchSubscriptionDetails();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء طلب الترقية');
    } finally {
      isSaving.value = false;
    }
  }
}
