import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import '../controllers/dashboard_controller.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../main/controllers/main_controller.dart';
import '../../notifications/controllers/notification_controller.dart';
import '../../../routes/app_pages.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final DashboardController dashboardController = Get.put(DashboardController());
    final AuthController authController = Get.find<AuthController>();

    final NotificationController notificationController = Get.put(NotificationController());

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'لوحة التحكم',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          Obx(() {
            final count = notificationController.unreadCount.value;
            return Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications),
                  onPressed: () => Get.toNamed(Routes.NOTIFICATIONS),
                ),
                if (count > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '$count',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
      body: Obx(() {
        if (dashboardController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
          );
        }

        final summary = dashboardController.summary;
        final recentOrders = dashboardController.recentOrders;
        final List<dynamic> dailySales = summary['dailySales'] ?? [];

        // تحضير نقاط الرسم البياني
        final List<FlSpot> spots = [];
        final List<String> dates = [];
        double maxAmount = 100.0;

        for (int i = 0; i < dailySales.length; i++) {
          final sale = dailySales[i];
          final double amount = double.tryParse(sale['amount']?.toString() ?? '0') ?? 0.0;
          spots.add(FlSpot(i.toDouble(), amount));
          if (amount > maxAmount) {
            maxAmount = amount;
          }

          final String rawDate = sale['date'] ?? '';
          if (rawDate.length >= 10) {
            dates.add(rawDate.substring(8, 10) + '/' + rawDate.substring(5, 7)); // DD/MM
          } else {
            dates.add(rawDate);
          }
        }

        return RefreshIndicator(
          onRefresh: dashboardController.fetchDashboardData,
          color: const Color(0xFF4F46E5),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ملخص الأداء',
                  style: GoogleFonts.cairo(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'إجمالي المبيعات',
                        '${summary['totalSales'] ?? 0} ريال',
                        Icons.monetization_on,
                        Colors.green,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'الطلبات المكتملة',
                        '${summary['totalOrders'] ?? 0}',
                        Icons.check_circle,
                        Colors.blue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'إجمالي العملاء',
                        '${summary['uniqueCustomers'] ?? 0}',
                        Icons.people,
                        Colors.orange,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'إجمالي المنتجات',
                        '${summary['totalProducts'] ?? 0}',
                        Icons.inventory_2,
                        Colors.purple,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // قسم الرسم البياني للمبيعات
                Text(
                  'مخطط مبيعات آخر 7 أيام',
                  style: GoogleFonts.cairo(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  height: 220,
                  padding: const EdgeInsets.only(right: 16, left: 8, top: 16, bottom: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: spots.isEmpty
                      ? Center(
                          child: Text(
                            'لا توجد بيانات مبيعات كافية لعرض المخطط',
                            style: GoogleFonts.cairo(color: Colors.grey),
                          ),
                        )
                      : LineChart(
                          LineChartData(
                            gridData: const FlGridData(show: false),
                            titlesData: FlTitlesData(
                              show: true,
                              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    final int index = value.toInt();
                                    if (index >= 0 && index < dates.length) {
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 8.0),
                                        child: Text(
                                          dates[index],
                                          style: GoogleFonts.cairo(fontSize: 10, color: Colors.grey[600]),
                                        ),
                                      );
                                    }
                                    return const Text('');
                                  },
                                ),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 40,
                                  getTitlesWidget: (value, meta) {
                                    return Text(
                                      '${value.toInt()}',
                                      style: GoogleFonts.cairo(fontSize: 10, color: Colors.grey[600]),
                                    );
                                  },
                                ),
                              ),
                            ),
                            borderData: FlBorderData(show: false),
                            minX: 0,
                            maxX: (spots.length - 1).toDouble(),
                            minY: 0,
                            maxY: maxAmount * 1.2,
                            lineBarsData: [
                              LineChartBarData(
                                spots: spots,
                                isCurved: true,
                                color: const Color(0xFF4F46E5),
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: const FlDotData(show: true),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: const Color(0xFF4F46E5).withOpacity(0.1),
                                ),
                              ),
                            ],
                          ),
                        ),
                ),
                const SizedBox(height: 32),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'أحدث الطلبات',
                      style: GoogleFonts.cairo(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        // الانتقال لتبويب الطلبات (التبويب الثاني)
                        final mainController = Get.find<MainController>();
                        mainController.changePage(1);
                      },
                      child: Text(
                        'عرض الكل',
                        style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (recentOrders.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Text(
                        'لا توجد طلبات حديثة',
                        style: GoogleFonts.cairo(color: Colors.grey),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: recentOrders.length,
                    itemBuilder: (context, index) {
                      final order = recentOrders[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.blue.withOpacity(0.1),
                            child: const Icon(
                              Icons.receipt,
                              color: Colors.blue,
                            ),
                          ),
                          title: Text(
                            'طلب #${order['orderNumber']}',
                            style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            '${order['totalAmount']} ريال',
                            style: GoogleFonts.cairo(color: Colors.grey[600]),
                          ),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _translateStatus(order['status']),
                              style: GoogleFonts.cairo(
                                color: Colors.orange,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          onTap: () {
                            Get.toNamed(
                              Routes.ORDER_DETAILS,
                              arguments: {'orderId': order['id']},
                            );
                          },
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        );
      }),
    );
  }

  String _translateStatus(String? status) {
    switch (status) {
      case 'pending':
      case 'new':
        return 'جديد';
      case 'preparing':
        return 'جاري التجهيز';
      case 'on_the_way':
        return 'في الطريق';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status ?? '';
    }
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 12),
          Text(
            title,
            style: GoogleFonts.cairo(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ],
      ),
    );
  }
}
