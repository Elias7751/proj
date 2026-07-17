import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/settings_controller.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';

class StoreSettingsScreen extends StatefulWidget {
  const StoreSettingsScreen({super.key});

  @override
  State<StoreSettingsScreen> createState() => _StoreSettingsScreenState();
}

class _StoreSettingsScreenState extends State<StoreSettingsScreen> {
  final SettingsController settingsController = Get.put(SettingsController());
  final AuthController authController = Get.find<AuthController>();

  final TextEditingController nameArController = TextEditingController();
  final TextEditingController nameEnController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController minOrderController = TextEditingController();
  final TextEditingController deliveryFeeController = TextEditingController();
  final TextEditingController whatsappController = TextEditingController();
  final TextEditingController deliveryPolicyController = TextEditingController();

  final TextEditingController facebookController = TextEditingController();
  final TextEditingController instagramController = TextEditingController();
  final TextEditingController tiktokController = TextEditingController();
  final TextEditingController websiteController = TextEditingController();

  File? _selectedLogo;
  String? _base64Logo;
  String? _existingLogo;

  File? _selectedCover;
  String? _base64Cover;
  String? _existingCover;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickLogo() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 50,
      maxWidth: 400,
    );

    if (image != null) {
      setState(() {
        _selectedLogo = File(image.path);
      });
      final bytes = await _selectedLogo!.readAsBytes();
      _base64Logo = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    }
  }

  Future<void> _pickCover() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 50,
      maxWidth: 800,
    );

    if (image != null) {
      setState(() {
        _selectedCover = File(image.path);
      });
      final bytes = await _selectedCover!.readAsBytes();
      _base64Cover = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    }
  }

  void showPendingDialog() {
    Get.dialog(
      AlertDialog(
        title: Text(
          'حسابك قيد المراجعة',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        content: Text(
          'عذراً، يجب موافقة الإدارة على متجرك أولاً لتتمكن من استخدام هذه الميزة أو تعديل الإعدادات.',
          style: GoogleFonts.cairo(fontSize: 15),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('حسناً', style: GoogleFonts.cairo()),
          ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();

    // تعبئة الحقول بالبيانات الحالية بعد جلبها
    ever(settingsController.storeDetails, (store) {
      if (store.isNotEmpty) {
        nameArController.text = store['nameAr'] ?? '';
        nameEnController.text = store['nameEn'] ?? '';
        descriptionController.text = store['description'] ?? '';
        minOrderController.text = store['minOrderAmount']?.toString() ?? '0';
        deliveryFeeController.text = store['deliveryFee']?.toString() ?? '0';
        whatsappController.text = store['whatsappNumber'] ?? '';
        deliveryPolicyController.text = store['deliveryPolicy'] ?? '';
        
        _existingLogo = store['logo'];
        _existingCover = store['cover'];

        final social = store['socialLinks'] ?? {};
        facebookController.text = social['facebook'] ?? '';
        instagramController.text = social['instagram'] ?? '';
        tiktokController.text = social['tiktok'] ?? '';
        websiteController.text = social['website'] ?? '';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'إعدادات المتجر',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.local_offer),
            tooltip: 'العروض والكوبونات',
            onPressed: () {
              final isPending = authController.currentStore['status'] == 'pending';
              if (isPending) {
                showPendingDialog();
              } else {
                Get.toNamed(Routes.OFFERS);
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.card_membership),
            tooltip: 'الاشتراكات',
            onPressed: () {
              final isPending = authController.currentStore['status'] == 'pending';
              if (isPending) {
                showPendingDialog();
              } else {
                Get.toNamed(Routes.SUBSCRIPTIONS);
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await settingsController.fetchStoreDetails();
          await settingsController.fetchSubscriptionDetails();
        },
        color: const Color(0xFF4F46E5),
        child: Obx(() {
          if (settingsController.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
            );
          }

          return SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // غلاف المتجر (Cover Image)
                GestureDetector(
                  onTap: _pickCover,
                  child: Container(
                    height: 160,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[300]!),
                      image: _selectedCover != null
                          ? DecorationImage(
                              image: FileImage(_selectedCover!),
                              fit: BoxFit.cover,
                            )
                          : (_existingCover != null
                              ? DecorationImage(
                                  image: NetworkImage(_existingCover!),
                                  fit: BoxFit.cover,
                                )
                              : null),
                    ),
                    child: _selectedCover == null && _existingCover == null
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.add_photo_alternate, size: 40, color: Colors.grey),
                              const SizedBox(height: 8),
                              Text(
                                'إضافة غلاف المتجر (Cover)',
                                style: GoogleFonts.cairo(color: Colors.grey),
                              ),
                            ],
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 16),

                // شعار المتجر (Logo)
                Center(
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: _pickLogo,
                        child: Container(
                          width: 110,
                          height: 110,
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF4F46E5),
                              width: 3,
                            ),
                            image: _selectedLogo != null
                                ? DecorationImage(
                                    image: FileImage(_selectedLogo!),
                                    fit: BoxFit.cover,
                                  )
                                : (_existingLogo != null
                                    ? DecorationImage(
                                        image: NetworkImage(_existingLogo!),
                                        fit: BoxFit.cover,
                                      )
                                    : null),
                          ),
                          child: _selectedLogo == null && _existingLogo == null
                              ? const Icon(
                                  Icons.store,
                                  size: 50,
                                  color: Colors.grey,
                                )
                              : null,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _pickLogo,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFF4F46E5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                TextFormField(
                  controller: nameArController,
                  decoration: InputDecoration(
                    labelText: 'اسم المتجر (بالعربية)',
                    labelStyle: GoogleFonts.cairo(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: nameEnController,
                  decoration: InputDecoration(
                    labelText: 'اسم المتجر (بالإنجليزية)',
                    labelStyle: GoogleFonts.cairo(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: descriptionController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'وصف المتجر',
                    labelStyle: GoogleFonts.cairo(),
                    alignLabelWithHint: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: minOrderController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'الحد الأدنى للطلب (ريال)',
                    labelStyle: GoogleFonts.cairo(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: deliveryFeeController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'رسوم التوصيل (ريال)',
                    labelStyle: GoogleFonts.cairo(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: whatsappController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: 'رقم واتساب لاستقبال الطلبات',
                    labelStyle: GoogleFonts.cairo(),
                    prefixIcon: const Icon(Icons.chat),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: deliveryPolicyController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'سياسة التوصيل والاسترجاع الخاصة بالمتجر',
                    labelStyle: GoogleFonts.cairo(),
                    alignLabelWithHint: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // قسم روابط التواصل الاجتماعي
                Text(
                  'روابط التواصل الاجتماعي',
                  style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                TextFormField(
                  controller: facebookController,
                  decoration: InputDecoration(
                    labelText: 'رابط فيسبوك',
                    labelStyle: GoogleFonts.cairo(),
                    prefixIcon: const Icon(Icons.facebook, color: Colors.blue),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                TextFormField(
                  controller: instagramController,
                  decoration: InputDecoration(
                    labelText: 'رابط إنستغرام',
                    labelStyle: GoogleFonts.cairo(),
                    prefixIcon: const Icon(Icons.camera_alt, color: Colors.pink),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                TextFormField(
                  controller: tiktokController,
                  decoration: InputDecoration(
                    labelText: 'رابط تيك توك',
                    labelStyle: GoogleFonts.cairo(),
                    prefixIcon: const Icon(Icons.music_note, color: Colors.black),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                TextFormField(
                  controller: websiteController,
                  decoration: InputDecoration(
                    labelText: 'رابط موقع الويب الخاص بك',
                    labelStyle: GoogleFonts.cairo(),
                    prefixIcon: const Icon(Icons.language, color: Colors.teal),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: settingsController.isSaving.value
                      ? null
                      : () {
                          final isPending = authController.currentStore['status'] == 'pending';
                          if (isPending) {
                            showPendingDialog();
                          } else {
                            final Map<String, dynamic> updateData = {
                              'nameAr': nameArController.text,
                              'nameEn': nameEnController.text,
                              'description': descriptionController.text,
                              'whatsappNumber': whatsappController.text,
                              'deliveryPolicy': deliveryPolicyController.text,
                              'minOrderAmount': double.tryParse(minOrderController.text) ?? 0.0,
                              'deliveryFee': double.tryParse(deliveryFeeController.text) ?? 0.0,
                              'socialLinks': {
                                'facebook': facebookController.text,
                                'instagram': instagramController.text,
                                'tiktok': tiktokController.text,
                                'website': websiteController.text,
                              }
                            };

                            if (_base64Logo != null) {
                              updateData['logo'] = _base64Logo;
                            }
                            if (_base64Cover != null) {
                              updateData['cover'] = _base64Cover;
                            }

                            settingsController.updateStoreDetails(updateData);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: settingsController.isSaving.value
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'حفظ التعديلات',
                          style: GoogleFonts.cairo(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          );
        })),
    );
  }
}
