import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/settings_controller.dart';
import '../../auth/controllers/auth_controller.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final SettingsController settingsController = Get.find<SettingsController>();
    final AuthController authController = Get.find<AuthController>();

    return Scaffold(
      appBar: AppBar(
        title: Text('الاشتراكات والخطط', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
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
                      final isFree = (double.tryParse(plan['price'].toString()) ?? 0) == 0;
                      
                      List<dynamic> features = [];
                      if (plan['features'] != null) {
                        if (plan['features'] is String) {
                          try {
                            features = List<dynamic>.from(jsonDecode(plan['features']));
                          } catch (e) {
                            features = [];
                          }
                        } else if (plan['features'] is List) {
                          features = plan['features'];
                        }
                      }

                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isFree ? Colors.grey.shade300 : const Color(0xFF4F46E5),
                            width: isFree ? 1 : 2,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    plan['nameAr'] ?? '',
                                    style: GoogleFonts.cairo(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: isFree ? Colors.black87 : const Color(0xFF4F46E5),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: isFree ? Colors.grey.shade200 : const Color(0xFF4F46E5).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      isFree ? 'مجاناً' : '${plan['price']} ريال / ${plan['durationDays']} يوم',
                                      style: GoogleFonts.cairo(
                                        color: isFree ? Colors.black87 : const Color(0xFF4F46E5),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                plan['descriptionAr'] ?? plan['description'] ?? '',
                                style: GoogleFonts.cairo(color: Colors.grey[700], fontSize: 14),
                              ),
                              const SizedBox(height: 16),
                              
                              if (features.isNotEmpty) ...[
                                const Divider(),
                                const SizedBox(height: 8),
                                ...features.map((feature) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle, color: Colors.green, size: 20),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          feature.toString(),
                                          style: GoogleFonts.cairo(fontSize: 14),
                                        ),
                                      ),
                                    ],
                                  ),
                                )).toList(),
                                const SizedBox(height: 16),
                              ],

                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () {
                                    if (isFree) {
                                      _showFreePlanDialog(context, settingsController, plan);
                                    } else {
                                      _showPaidPlanDialog(context, authController, plan);
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isFree ? Colors.black87 : const Color(0xFF4F46E5),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: Text(
                                    isFree ? 'تفعيل الخطة المجانية' : 'طلب اشتراك (عبر واتساب)',
                                    style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
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

  void _showFreePlanDialog(
    BuildContext context,
    SettingsController controller,
    Map<String, dynamic> plan,
  ) {
    Get.defaultDialog(
      title: 'تأكيد التفعيل',
      titleStyle: GoogleFonts.cairo(fontWeight: FontWeight.bold),
      content: Text(
        'هل تريد تفعيل ${plan['nameAr']}؟',
        style: GoogleFonts.cairo(),
        textAlign: TextAlign.center,
      ),
      textConfirm: 'تأكيد',
      textCancel: 'إلغاء',
      confirmTextColor: Colors.white,
      buttonColor: Colors.black87,
      onConfirm: () {
        Get.back();
        controller.upgradePlan(plan['id']);
      },
    );
  }

  void _showPaidPlanDialog(
    BuildContext context,
    AuthController authController,
    Map<String, dynamic> plan,
  ) {
    Get.defaultDialog(
      title: 'تفعيل الخطة المدفوعة',
      titleStyle: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: const Color(0xFF4F46E5)),
      content: Column(
        children: [
          Text(
            'لتفعيل ${plan['nameAr']}، يرجى التواصل مع خدمة العملاء لإتمام عملية الدفع.',
            style: GoogleFonts.cairo(fontSize: 14),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'السعر: ${plan['price']} ريال',
            style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ],
      ),
      textConfirm: 'تواصل عبر واتساب',
      textCancel: 'إلغاء',
      confirmTextColor: Colors.white,
      buttonColor: Colors.green,
      onConfirm: () async {
        Get.back();
        final storeName = authController.currentStore['nameAr'] ?? 'متجري';
        final message = 'مرحباً، أريد تفعيل "${plan['nameAr']}" لمتجري ($storeName).';
        final url = 'https://wa.me/967700000000?text=${Uri.encodeComponent(message)}';
        
        final Uri uri = Uri.parse(url);
        try {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } catch (e) {
          Get.snackbar('تنبيه', 'تعذر فتح تطبيق واتساب. تأكد من تثبيته على جهازك.');
        }
      },
    );
  }
}
