import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/notification_controller.dart';
import '../../../routes/app_pages.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final NotificationController controller = Get.put(NotificationController());

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'الإشعارات',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          Obx(() {
            if (controller.unreadCount.value > 0) {
              return TextButton(
                onPressed: controller.markAllAsRead,
                child: Text(
                  'قراءة الكل',
                  style: GoogleFonts.cairo(
                    color: const Color(0xFF4F46E5),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await controller.fetchNotifications();
          await controller.fetchUnreadCount();
        },
        color: const Color(0xFF4F46E5),
        child: Obx(() {
          if (controller.isLoading.value && controller.notifications.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
            );
          }

          if (controller.notifications.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'لا توجد إشعارات حالياً',
                        style: GoogleFonts.cairo(color: Colors.grey, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }

          return ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: controller.notifications.length,
            itemBuilder: (context, index) {
              final notification = controller.notifications[index];
              final bool isRead = notification['isRead'] ?? false;

              return Dismissible(
                key: Key(notification['id']),
                direction: DismissDirection.endToStart,
                background: Container(
                  color: Colors.red,
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.only(left: 20),
                  child: const Icon(Icons.delete, color: Colors.white),
                ),
                onDismissed: (direction) {
                  controller.deleteNotification(notification['id']);
                },
                child: Container(
                  color: isRead ? Colors.transparent : Colors.blue.withOpacity(0.05),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getIconColor(notification['type']).withOpacity(0.1),
                      child: Icon(
                        _getIconData(notification['type']),
                        color: _getIconColor(notification['type']),
                      ),
                    ),
                    title: Text(
                      notification['title'] ?? '',
                      style: GoogleFonts.cairo(
                        fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          notification['message'] ?? '',
                          style: GoogleFonts.cairo(fontSize: 12, color: Colors.grey[700]),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDate(notification['createdAt']),
                          style: GoogleFonts.cairo(fontSize: 10, color: Colors.grey),
                        ),
                      ],
                    ),
                    onTap: () {
                      if (!isRead) {
                        controller.markAsRead(notification['id']);
                      }
                      
                      // الانتقال للرابط المرتبط بالإشعار إن وجد
                      final String? link = notification['link'];
                      if (link != null && link.startsWith('/orders/')) {
                        final orderId = link.replaceAll('/orders/', '');
                        Get.toNamed(
                          Routes.ORDER_DETAILS,
                          arguments: {'orderId': orderId},
                        );
                      }
                    },
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }

  IconData _getIconData(String? type) {
    switch (type) {
      case 'order':
        return Icons.shopping_bag_outlined;
      case 'offer':
        return Icons.local_offer_outlined;
      case 'payment':
        return Icons.payment_outlined;
      case 'review':
        return Icons.star_outline;
      case 'system':
      default:
        return Icons.notifications_none_outlined;
    }
  }

  Color _getIconColor(String? type) {
    switch (type) {
      case 'order':
        return Colors.blue;
      case 'offer':
        return Colors.orange;
      case 'payment':
        return Colors.green;
      case 'review':
        return Colors.amber;
      case 'system':
      default:
        return Colors.purple;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'الآن';
      } else if (difference.inMinutes < 60) {
        return 'قبل ${difference.inMinutes} دقيقة';
      } else if (difference.inHours < 24) {
        return 'قبل ${difference.inHours} ساعة';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return '';
    }
  }
}
