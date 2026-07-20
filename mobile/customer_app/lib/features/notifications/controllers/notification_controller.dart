import 'dart:convert';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
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
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        notifications.value = responseData['data'];
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
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        unreadCount.value = responseData['data']['count'] ?? 0;
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      final response = await _apiClient.put('/notifications/$id/read');
      if (response.statusCode == 200) {
        // Update local state
        final index = notifications.indexWhere((n) => n['id'] == id);
        if (index != -1) {
          var notification = Map<String, dynamic>.from(notifications[index]);
          notification['isRead'] = true;
          notifications[index] = notification;
          if (unreadCount.value > 0) {
            unreadCount.value--;
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final response = await _apiClient.put('/notifications/read-all');
      if (response.statusCode == 200) {
        for (var i = 0; i < notifications.length; i++) {
          var notification = Map<String, dynamic>.from(notifications[i]);
          notification['isRead'] = true;
          notifications[i] = notification;
        }
        unreadCount.value = 0;
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء تحديث الإشعارات');
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      final response = await _apiClient.delete('/notifications/$id');
      if (response.statusCode == 200) {
        final index = notifications.indexWhere((n) => n['id'] == id);
        if (index != -1) {
          if (notifications[index]['isRead'] == false && unreadCount.value > 0) {
            unreadCount.value--;
          }
          notifications.removeAt(index);
        }
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء حذف الإشعار');
    }
  }
}
