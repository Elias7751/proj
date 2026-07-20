import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/notification_controller.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final NotificationController controller = Get.put(NotificationController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'تحديد الكل كمقروء',
            onPressed: () {
              controller.markAllAsRead();
            },
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        if (controller.notifications.isEmpty) {
          return RefreshIndicator(
            onRefresh: () => controller.fetchNotifications(),
            color: const Color(0xFF6366F1),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: SizedBox(
                height: MediaQuery.of(context).size.height - 200,
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 100, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'لا توجد إشعارات',
                        style: TextStyle(fontSize: 20, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => controller.fetchNotifications(),
          color: const Color(0xFF6366F1),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.notifications.length,
            itemBuilder: (context, index) {
              final notification = controller.notifications[index];
              final isRead = notification['isRead'] ?? false;

              return Dismissible(
                key: Key(notification['id'].toString()),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.only(left: 20.0),
                  color: Colors.red,
                  child: const Icon(Icons.delete, color: Colors.white),
                ),
                onDismissed: (direction) {
                  controller.deleteNotification(notification['id'].toString());
                },
                child: Card(
                  elevation: isRead ? 0 : 2,
                  color: isRead ? Colors.white : const Color(0xFFF0F5FF),
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isRead ? Colors.grey.shade200 : const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  ),
                  child: ListTile(
                    onTap: () {
                      if (!isRead) {
                        controller.markAsRead(notification['id'].toString());
                      }
                      // TODO: Navigate based on notification type if needed
                    },
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
                      child: const Icon(Icons.notifications, color: Color(0xFF6366F1)),
                    ),
                    title: Text(
                      notification['title'] ?? '',
                      style: TextStyle(
                        fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(notification['message'] ?? ''),
                        const SizedBox(height: 8),
                        Text(
                          notification['createdAt']?.substring(0, 10) ?? '',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
