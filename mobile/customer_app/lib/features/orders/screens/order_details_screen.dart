import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../controllers/order_controller.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

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
    final args = Get.arguments as Map<String, dynamic>?;
    orderId = args?['orderId'] ?? '';

    if (orderId.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        orderController.fetchOrderDetails(orderId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'تفاصيل الطلب',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        if (orderController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        final order = orderController.currentOrder;
        if (order.isEmpty) {
          return const Center(child: Text('لم يتم العثور على الطلب'));
        }

        final items = order['items'] is List ? order['items'] as List : [];
        final status = order['status'] ?? 'pending';
        List statusHistory = [];
        if (order['statusHistory'] != null) {
          if (order['statusHistory'] is String) {
            try {
              statusHistory = jsonDecode(order['statusHistory']);
            } catch (_) {}
          } else if (order['statusHistory'] is List) {
            statusHistory = order['statusHistory'];
          }
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 5,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'رقم الطلب',
                          style: GoogleFonts.cairo(color: Colors.grey[600]),
                        ),
                        Text(
                          '#${order['orderNumber']}',
                          style: GoogleFonts.cairo(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        orderController.translateStatus(status),
                        style: GoogleFonts.cairo(
                          color: _getStatusColor(status),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Order Tracking
              Text(
                'تتبع الطلب',
                style: GoogleFonts.cairo(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildTrackingStep(
                context,
                title: 'تم استلام الطلب',
                date: _getDateForStatus(statusHistory, 'pending') ?? order['createdAt']?.substring(0, 10) ?? '',
                isCompleted: true,
                isLast: false,
              ),
              _buildTrackingStep(
                context,
                title: 'جاري التجهيز',
                date: _getDateForStatus(statusHistory, 'preparing') ?? 'قريباً',
                isCompleted: _isStatusReached(status, 'preparing'),
                isLast: false,
              ),
              _buildTrackingStep(
                context,
                title: 'في الطريق إليك',
                date: _getDateForStatus(statusHistory, 'on_the_way') ?? 'قريباً',
                isCompleted: _isStatusReached(status, 'on_the_way'),
                isLast: false,
              ),
              _buildTrackingStep(
                context,
                title: 'تم التوصيل',
                date: _getDateForStatus(statusHistory, 'delivered') ?? 'قريباً',
                isCompleted: _isStatusReached(status, 'delivered'),
                isLast: true,
              ),

              const SizedBox(height: 24),

              // Order Items
              Text(
                'المنتجات',
                style: GoogleFonts.cairo(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.image, color: Colors.grey),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['productName'] ?? 'منتج',
                                style: GoogleFonts.cairo(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'الكمية: ${item['quantity']}',
                                style: GoogleFonts.cairo(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${item['totalPrice']} ريال',
                          style: GoogleFonts.cairo(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              // Order Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('المجموع الفرعي', style: GoogleFonts.cairo()),
                        Text('${order['subTotal']} ريال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('رسوم التوصيل', style: GoogleFonts.cairo()),
                        Text('${order['deliveryFee']} ريال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'الإجمالي',
                          style: GoogleFonts.cairo(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${order['totalAmount']} ريال',
                          style: GoogleFonts.cairo(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (status == 'delivered') ...[
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => _showRatingDialog(context, order),
                  icon: const Icon(Icons.star_rate_rounded, color: Colors.white),
                  label: Text('تقييم المتجر والخدمة', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber[700],
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      }),
    );
  }

  void _showRatingDialog(BuildContext context, Map<dynamic, dynamic> order) {
    double selectedRating = 5.0;
    final TextEditingController commentController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text(
                'تقييم المتجر والخدمة',
                style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'كيف كانت تجربتك مع متجر ${order['store']?['nameAr'] ?? ''}؟',
                    style: GoogleFonts.cairo(fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starValue = index + 1.0;
                      return IconButton(
                        icon: Icon(
                          starValue <= selectedRating
                              ? Icons.star_rounded
                              : Icons.star_border_rounded,
                          color: Colors.amber,
                          size: 36,
                        ),
                        onPressed: () {
                          setState(() {
                            selectedRating = starValue;
                          });
                        },
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: commentController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'اكتب تعليقك هنا (اختياري)...',
                      hintStyle: GoogleFonts.cairo(fontSize: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    style: GoogleFonts.cairo(),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isSubmitting ? null : () => Navigator.pop(context),
                  child: Text('إلغاء', style: GoogleFonts.cairo(color: Colors.grey)),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          setState(() {
                            isSubmitting = true;
                          });

                          try {
                            final ApiClient apiClient = ApiClient();
                            final response = await apiClient.post(
                              '/reviews',
                              data: {
                                'orderId': order['id'],
                                'targetType': 'store',
                                'targetId': order['storeId'],
                                'rating': selectedRating,
                                'comment': commentController.text,
                              },
                            );

                            if (response.statusCode == 201) {
                              Get.snackbar('نجاح', 'شكراً لك على تقييمك!');
                              Navigator.pop(context);
                            }
                          } catch (e) {
                            String errorMsg = 'حدث خطأ أثناء إرسال التقييم';
                            if (e is DioException && e.response != null) {
                              errorMsg = e.response?.data['message'] ?? errorMsg;
                            }
                            Get.snackbar('خطأ', errorMsg);
                          } finally {
                            setState(() {
                              isSubmitting = false;
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text('إرسال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  bool _isStatusReached(String currentStatus, String targetStatus) {
    const statusOrder = ['pending', 'preparing', 'on_the_way', 'delivered'];
    final currentIndex = statusOrder.indexOf(currentStatus);
    final targetIndex = statusOrder.indexOf(targetStatus);
    
    if (currentIndex == -1 || targetIndex == -1) return false;
    return currentIndex >= targetIndex;
  }

  String? _getDateForStatus(List statusHistory, String status) {
    for (var history in statusHistory) {
      if (history['status'] == status) {
        return history['date']?.substring(0, 10);
      }
    }
    return null;
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

  Widget _buildTrackingStep(
    BuildContext context, {
    required String title,
    required String date,
    required bool isCompleted,
    required bool isLast,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isCompleted ? Theme.of(context).primaryColor : Colors.grey[300],
                shape: BoxShape.circle,
              ),
              child: isCompleted
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isCompleted ? Theme.of(context).primaryColor : Colors.grey[300],
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.cairo(
                  fontWeight: isCompleted ? FontWeight.bold : FontWeight.normal,
                  color: isCompleted ? Colors.black : Colors.grey,
                ),
              ),
              Text(
                date,
                style: GoogleFonts.cairo(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              if (!isLast) const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }
}
