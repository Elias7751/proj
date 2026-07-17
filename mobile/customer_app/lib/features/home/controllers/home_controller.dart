import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class HomeController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var ads = [].obs;
  var categories = [].obs;
  var featuredStores = [].obs;
  var featuredProducts = [].obs;
  var offers = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchHomeData();
  }

  Future<void> fetchHomeData() async {
    try {
      isLoading.value = true;

      // جلب الإعلانات (home_banner)
      final adsResponse = await _apiClient.get('/ads/placements/home_banner');
      if (adsResponse.statusCode == 200) {
        ads.value = adsResponse.data['data'];
      }

      // جلب التصنيفات
      final categoriesResponse = await _apiClient.get('/categories');
      if (categoriesResponse.statusCode == 200) {
        categories.value = categoriesResponse.data['data'];
      }

      // جلب العروض النشطة
      final offersResponse = await _apiClient.get('/offers');
      if (offersResponse.statusCode == 200) {
        offers.value = offersResponse.data['data'] ?? [];
      }

      // جلب المتاجر المميزة أولاً
      var storesResponse = await _apiClient.get('/stores', queryParameters: {'isFeatured': 'true'});
      if (storesResponse.statusCode == 200 && (storesResponse.data['data'] as List).isNotEmpty) {
        featuredStores.value = storesResponse.data['data'];
      } else {
        // إذا لم توجد متاجر مميزة، نجلب آخر 5 متاجر نشطة كافتراضي
        storesResponse = await _apiClient.get('/stores');
        if (storesResponse.statusCode == 200) {
          List allStores = storesResponse.data['data'];
          featuredStores.value = allStores.take(5).toList();
        }
      }

      // جلب المنتجات المميزة (المرتبة حسب التقييم الأعلى - 5 نجوم)
      final productsResponse = await _apiClient.get('/products', queryParameters: {'sort': 'rating'});
      if (productsResponse.statusCode == 200) {
        List allProducts = productsResponse.data['data'];
        featuredProducts.value = allProducts.take(6).toList();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب البيانات');
    } finally {
      isLoading.value = false;
    }
  }
}
