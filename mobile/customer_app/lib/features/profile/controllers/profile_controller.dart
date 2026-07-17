import 'package:get/get.dart';
import '../../../core/network/api_client.dart';
import '../../auth/controllers/auth_controller.dart';

class ProfileController extends GetxController {
  final ApiClient _apiClient = ApiClient();
  final AuthController authController = Get.find<AuthController>();

  var isLoading = false.obs;
  var myTickets = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchMyTickets();
  }

  // تحديث بيانات الملف الشخصي
  Future<void> updateProfile(String fullName, String phone) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.put(
        '/auth/update-details',
        data: {'fullName': fullName, 'phone': phone},
      );

      if (response.statusCode == 200) {
        // تحديث البيانات محلياً
        authController.currentUser.value = response.data['data'];
        Get.snackbar('نجاح', 'تم تحديث البيانات بنجاح');
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث البيانات');
    } finally {
      isLoading.value = false;
    }
  }

  // جلب تذاكر الدعم الفني
  Future<void> fetchMyTickets() async {
    try {
      isLoading.value = true;

      final response = await _apiClient.get('/support/tickets/my');
      if (response.statusCode == 200) {
        myTickets.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب التذاكر');
    } finally {
      isLoading.value = false;
    }
  }

  // إنشاء تذكرة جديدة
  Future<void> createTicket(String subject, String message) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.post(
        '/support/tickets',
        data: {'subject': subject, 'message': message},
      );

      if (response.statusCode == 201) {
        Get.snackbar('نجاح', 'تم إرسال التذكرة بنجاح');
        fetchMyTickets(); // تحديث القائمة
        Get.back(); // العودة للشاشة السابقة
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء إرسال التذكرة');
    } finally {
      isLoading.value = false;
    }
  }
}
