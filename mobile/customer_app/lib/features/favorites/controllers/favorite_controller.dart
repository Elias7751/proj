import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class FavoriteController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = true.obs;
  var myFavorites = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchFavorites();
  }

  Future<void> fetchFavorites() async {
    try {
      isLoading.value = true;
      final response = await _apiClient.get('/favorites');
      if (response.statusCode == 200) {
        myFavorites.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب المفضلات');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleFavorite(String productId) async {
    try {
      final response = await _apiClient.post('/favorites/$productId');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final isFavorite = response.data['data']['isFavorite'];
        if (isFavorite) {
          Get.snackbar('نجاح', 'تمت إضافة المنتج للمفضلة');
        } else {
          Get.snackbar('نجاح', 'تمت إزالة المنتج من المفضلة');
          // Remove from local list if we are on the favorites screen
          myFavorites.removeWhere((item) => item['id'] == productId);
        }
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث المفضلة');
    }
  }

  bool isFavorite(String productId) {
    return myFavorites.any((item) => item['id'] == productId);
  }
}
