import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/settings_controller.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final SettingsController settingsController =
        Get.find<SettingsController>();

    return Scaffold(
      appBar: AppBar(title: const Text('الاشتراكات والباقات')),
      body: Obx(() {
        final currentSub = settingsController.currentSubscription;
        final plans = settingsController.availablePlans;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // الاشتراك الحالي
              Text(
                'اشتراكك الحالي',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                color: const Color(0xFF4F46E5).withOpacity(0.1),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFF4F46E5)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            currentSub['plan']?['nameAr'] ?? 'باقة مجانية',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4F46E5),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: currentSub['status'] == 'active'
                                  ? Colors.green
                                  : Colors.orange,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              currentSub['status'] == 'active'
                                  ? 'نشط'
                                  : 'غير نشط',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'ينتهي في: ${currentSub['endDate']?.substring(0, 10) ?? 'غير محدد'}',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // الباقات المتاحة
              Text(
                'ترقية الباقة',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),

              if (plans.isEmpty)
                const Center(child: Text('لا توجد باقات متاحة حالياً'))
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: plans.length,
                  itemBuilder: (context, index) {
                    final plan = plans[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  plan['nameAr'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '${plan['price']} ريال / ${plan['durationDays']} يوم',
                                  style: const TextStyle(
                                    color: Color(0xFF4F46E5),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              plan['description'] ?? '',
                              style: TextStyle(color: Colors.grey[700]),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  _showUpgradeDialog(
                                    context,
                                    settingsController,
                                    plan,
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF4F46E5),
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text('اشترك الآن'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        );
      }),
    );
  }

  void _showUpgradeDialog(
    BuildContext context,
    SettingsController controller,
    Map<String, dynamic> plan,
  ) {
    Get.defaultDialog(
      title: 'تأكيد الاشتراك',
      content: Column(
        children: [
          Text('هل تريد الاشتراك في باقة ${plan['nameAr']}؟'),
          const SizedBox(height: 8),
          Text(
            'السعر: ${plan['price']} ريال',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text(
            'سيتم تحويلك لصفحة الدفع (أو إرسال طلب تحويل بنكي).',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
      textConfirm: 'تأكيد',
      textCancel: 'إلغاء',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFF4F46E5),
      onConfirm: () {
        Get.back();
        controller.upgradePlan(plan['id']);
      },
    );
  }
}
