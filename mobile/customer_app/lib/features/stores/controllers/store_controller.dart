import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class StoreController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var stores = [].obs;
  var currentStore = {}.obs;
  var storeProducts = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchStores();
  }

  // جلب كل المتاجر
  Future<void> fetchStores({String? categoryId, String? search}) async {
    try {
      isLoading.value = true;

      Map<String, dynamic> queryParams = {};
      if (categoryId != null) queryParams['categoryId'] = categoryId;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _apiClient.get(
        '/stores',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        stores.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب المتاجر');
    } finally {
      isLoading.value = false;
    }
  }

  // جلب تفاصيل متجر معين مع منتجاته
  Future<void> fetchStoreDetails(String slug, String storeId) async {
    try {
      isLoading.value = true;

      // جلب بيانات المتجر
      final storeResponse = await _apiClient.get('/stores/$slug');
      if (storeResponse.statusCode == 200) {
        currentStore.value = storeResponse.data['data'];
      }

      // جلب منتجات المتجر
      final productsResponse = await _apiClient.get(
        '/products',
        queryParameters: {'storeId': storeId},
      );
      if (productsResponse.statusCode == 200) {
        storeProducts.value = productsResponse.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب تفاصيل المتجر');
    } finally {
      isLoading.value = false;
    }
  }
}
