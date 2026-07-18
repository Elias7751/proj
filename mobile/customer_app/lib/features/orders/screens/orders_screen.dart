import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/order_controller.dart';
import '../../../routes/app_pages.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final OrderController orderController = Get.put(OrderController());

    return Scaffold(
      appBar: AppBar(title: const Text('طلباتي')),
      body: Obx(() {
        if (orderController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        if (orderController.myOrders.isEmpty) {
          return RefreshIndicator(
            onRefresh: () => orderController.fetchMyOrders(),
            color: const Color(0xFF6366F1),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: SizedBox(
                height: MediaQuery.of(context).size.height - 200,
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long, size: 100, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'لا توجد طلبات سابقة',
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
          onRefresh: () => orderController.fetchMyOrders(),
          color: const Color(0xFF6366F1),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: orderController.myOrders.length,
            itemBuilder: (context, index) {
              final order = orderController.myOrders[index];
              final store = order['store'];

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: () {
                    Get.toNamed(
                      Routes.ORDER_DETAILS,
                      arguments: {'orderId': order['id']},
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'طلب #${order['orderNumber']}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusColor(
                                  order['status'],
                                ).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                orderController.translateStatus(order['status']),
                                style: TextStyle(
                                  color: _getStatusColor(order['status']),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24),
                        Row(
                          children: [
                            const Icon(Icons.store, color: Colors.grey, size: 20),
                            const SizedBox(width: 8),
                            Text(store?['nameAr'] ?? 'المتجر'),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.calendar_today,
                              color: Colors.grey,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(order['createdAt']?.substring(0, 10) ?? ''),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'الإجمالي:',
                              style: TextStyle(color: Colors.grey),
                            ),
                            Text(
                              '${order['totalAmount']} ريال',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: Color(0xFF6366F1),
                              ),
                            ),
                          ],
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

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
      case 'new':
        return Colors.orange;
      case 'preparing':
        return Colors.blue;
      case 'on_the_way':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
