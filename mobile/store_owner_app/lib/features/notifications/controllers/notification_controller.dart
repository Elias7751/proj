import 'package:get/get.dart';
import '../../../core/network/api_client.dart';

class NotificationController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = false.obs;
  var notifications = [].obs;
  var unreadCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
    fetchUnreadCount();
  }

  Future<void> fetchNotifications() async {
    try {
      isLoading.value = true;
      final response = await _apiClient.get('/notifications');
      if (response.statusCode == 200) {
        notifications.value = response.data['data'];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء جلب الإشعارات');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchUnreadCount() async {
    try {
      final response = await _apiClient.get('/notifications/unread-count');
      if (response.statusCode == 200) {
        unreadCount.value = response.data['data']['unreadCount'] ?? 0;
      }
    } catch (e) {
      // تجاهل الخطأ هنا
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      final response = await _apiClient.put('/notifications/$id/read');
      if (response.statusCode == 200) {
        // تحديث الإشعار محلياً
        final index = notifications.indexWhere((n) => n['id'] == id);
        if (index != -1) {
          final updated = Map<String, dynamic>.from(notifications[index]);
          updated['isRead'] = true;
          notifications[index] = updated;
          notifications.refresh();
        }
        fetchUnreadCount();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث حالة الإشعار');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final response = await _apiClient.put('/notifications/read-all');
      if (response.statusCode == 200) {
        for (int i = 0; i < notifications.length; i++) {
          final updated = Map<String, dynamic>.from(notifications[i]);
          updated['isRead'] = true;
          notifications[i] = updated;
        }
        notifications.refresh();
        unreadCount.value = 0;
        Get.snackbar('نجاح', 'تم تحديد جميع الإشعارات كمقروءة');
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث الإشعارات');
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      final response = await _apiClient.delete('/notifications/$id');
      if (response.statusCode == 200) {
        notifications.removeWhere((n) => n['id'] == id);
        fetchUnreadCount();
        Get.snackbar('نجاح', 'تم حذف الإشعار');
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء حذف الإشعار');
    }
  }
}
