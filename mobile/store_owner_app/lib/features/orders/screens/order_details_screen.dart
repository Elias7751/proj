import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:get/get.dart';
import '../controllers/order_controller.dart';

class OrderDetailsScreen extends StatefulWidget {
  const OrderDetailsScreen({super.key});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final OrderController orderController = Get.find<OrderController>();
  late String orderId;

  @override
  void initState() {
    super.initState();
    final args = Get.arguments as Map<String, dynamic>;
    orderId = args['orderId'];

    WidgetsBinding.instance.addPostFrameCallback((_) {
      orderController.fetchOrderDetails(orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الطلب')),
      body: Obx(() {
        if (orderController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
          );
        }

        final order = orderController.currentOrder;
        if (order.isEmpty) {
          return const Center(child: Text('لم يتم العثور على الطلب'));
        }

        final customer = order['user'];
        final items = order['items'] as List? ?? [];
        final reviews = order['reviews'] as List? ?? [];
        
        Map<String, dynamic> address = {};
        if (order['deliveryAddress'] != null) {
          if (order['deliveryAddress'] is String) {
            try {
              address = jsonDecode(order['deliveryAddress']);
            } catch (_) {}
          } else if (order['deliveryAddress'] is Map) {
            address = Map<String, dynamic>.from(order['deliveryAddress']);
          }
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // معلومات الطلب الأساسية
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'رقم الطلب',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                          Text(
                            '#${order['orderNumber']}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'تاريخ الطلب',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                          Text(order['createdAt']?.substring(0, 10) ?? ''),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'الإجمالي',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                          Text(
                            '${order['totalAmount']} ريال',
                            style: const TextStyle(
                              color: Color(0xFF4F46E5),
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // معلومات العميل
              Text(
                'معلومات العميل',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person)),
                  title: Text(customer?['fullName'] ?? 'غير معروف'),
                  subtitle: Text(customer?['phone'] ?? ''),
                  trailing: IconButton(
                    icon: const Icon(Icons.phone, color: Colors.green),
                    onPressed: () {
                      // TODO: الاتصال بالعميل
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // عنوان التوصيل
              Text(
                'عنوان التوصيل',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.red),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          address.isNotEmpty
                              ? '${address['city'] ?? ''} - ${address['area'] ?? ''}'
                              : 'لم يتم تحديد عنوان',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // المنتجات
              Text(
                'المنتجات',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  final product = item['product'];
                  final variant = item['variant'];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: Container(
                        width: 50,
                        height: 50,
                        color: Colors.grey[200],
                        child: const Icon(Icons.image, color: Colors.grey),
                      ),
                      title: Text(product?['name'] ?? 'منتج'),
                      subtitle: variant != null
                          ? Text(variant['attributeValue'] ?? '')
                          : null,
                      trailing: Text(
                        '${item['quantity']} x ${item['price']} ريال',
                      ),
                    ),
                  );
                },
              ),
              if (reviews.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text(
                  'تقييم العميل للمتجر',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Card(
                  color: Colors.amber[50],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.amber[200]!),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Row(
                              children: List.generate(5, (index) {
                                final ratingVal = reviews[0]['rating'] ?? 5;
                                return Icon(
                                  index < ratingVal
                                      ? Icons.star_rounded
                                      : Icons.star_border_rounded,
                                  color: Colors.amber[700],
                                  size: 24,
                                );
                              }),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '(${reviews[0]['rating']}.0)',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        if (reviews[0]['comment'] != null && reviews[0]['comment'].toString().isNotEmpty) ...[
                          const Divider(height: 24),
                          Text(
                            reviews[0]['comment'],
                            style: const TextStyle(fontSize: 15, height: 1.4),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),

              // تغيير حالة الطلب
              Text(
                'تحديث حالة الطلب',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: DropdownButtonFormField<String>(
                    value: order['status'],
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'pending',
                        child: Text('قيد المراجعة'),
                      ),
                      DropdownMenuItem(
                        value: 'new',
                        child: Text('قيد المراجعة'),
                      ),
                      DropdownMenuItem(
                        value: 'preparing',
                        child: Text('جاري التجهيز'),
                      ),
                      DropdownMenuItem(
                        value: 'on_the_way',
                        child: Text('في الطريق'),
                      ),
                      DropdownMenuItem(
                        value: 'delivered',
                        child: Text('تم التوصيل'),
                      ),
                      DropdownMenuItem(value: 'cancelled', child: Text('ملغي')),
                    ],
                    onChanged: (value) {
                      if (value != null && value != order['status']) {
                        orderController.updateOrderStatus(orderId, value);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        );
      }),
    );
  }
}
