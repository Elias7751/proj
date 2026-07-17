import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/offers_controller.dart';
import '../../products/controllers/product_controller.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final OffersController _offersController = Get.put(OffersController());
  final ProductController _productController = Get.put(ProductController());

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // ==========================================
  // حوارات إضافة/تعديل الكوبونات
  // ==========================================
  void _showCouponDialog({Map<dynamic, dynamic>? coupon}) {
    final isEdit = coupon != null;
    final codeController = TextEditingController(text: isEdit ? coupon['code'] : '');
    final discountValueController = TextEditingController(text: isEdit ? coupon['discountValue']?.toString() : '');
    final maxDiscountController = TextEditingController(text: isEdit ? coupon['maxDiscount']?.toString() : '');
    final minOrderController = TextEditingController(text: isEdit ? coupon['minOrderAmount']?.toString() : '0');
    final usageLimitController = TextEditingController(text: isEdit ? coupon['usageLimit']?.toString() : '');

    String discountType = isEdit ? coupon['discountType'] : 'percentage';
    DateTime startDate = isEdit ? DateTime.parse(coupon['startDate']) : DateTime.now();
    DateTime endDate = isEdit ? DateTime.parse(coupon['endDate']) : DateTime.now().add(const Duration(days: 30));

    Get.dialog(
      StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: Text(
              isEdit ? 'تعديل الكوبون' : 'إضافة كوبون جديد',
              style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: codeController,
                    decoration: const InputDecoration(labelText: 'رمز الكوبون (مثال: SAVE20)'),
                    textCapitalization: TextCapitalization.characters,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: discountType,
                    decoration: const InputDecoration(labelText: 'نوع الخصم'),
                    items: const [
                      DropdownMenuItem(value: 'percentage', child: Text('نسبة مئوية (%)')),
                      DropdownMenuItem(value: 'fixed', child: Text('قيمة ثابتة (ريال)')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          discountType = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: discountValueController,
                    decoration: const InputDecoration(labelText: 'قيمة الخصم'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 12),
                  if (discountType == 'percentage')
                    TextFormField(
                      controller: maxDiscountController,
                      decoration: const InputDecoration(labelText: 'الحد الأقصى للخصم (اختياري)'),
                      keyboardType: TextInputType.number,
                    ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: minOrderController,
                    decoration: const InputDecoration(labelText: 'الحد الأدنى للطلب لاستخدام الكوبون'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: usageLimitController,
                    decoration: const InputDecoration(labelText: 'الحد الأقصى لعدد مرات الاستخدام (اختياري)'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: startDate,
                            firstDate: DateTime.now().subtract(const Duration(days: 365)),
                            lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
                          );
                          if (date != null) {
                            setState(() {
                              startDate = date;
                            });
                          }
                        },
                        child: Text('تاريخ البدء: ${startDate.toString().split(' ')[0]}'),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: endDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
                          );
                          if (date != null) {
                            setState(() {
                              endDate = date;
                            });
                          }
                        },
                        child: Text('تاريخ الانتهاء: ${endDate.toString().split(' ')[0]}'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('إلغاء'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (codeController.text.isEmpty || discountValueController.text.isEmpty) {
                    Get.snackbar('تنبيه', 'يرجى ملء الحقول الأساسية');
                    return;
                  }

                  final data = {
                    'code': codeController.text.toUpperCase(),
                    'discountType': discountType,
                    'discountValue': double.parse(discountValueController.text),
                    'maxDiscount': maxDiscountController.text.isNotEmpty ? double.parse(maxDiscountController.text) : null,
                    'minOrderAmount': double.parse(minOrderController.text),
                    'usageLimit': usageLimitController.text.isNotEmpty ? int.parse(usageLimitController.text) : null,
                    'startDate': startDate.toIso8601String(),
                    'endDate': endDate.toIso8601String(),
                  };

                  if (isEdit) {
                    _offersController.updateCoupon(coupon['id'], data);
                  } else {
                    _offersController.createCoupon(data);
                  }
                },
                child: Text(isEdit ? 'تحديث' : 'إضافة'),
              ),
            ],
          );
        },
      ),
    );
  }

  // ==========================================
  // حوارات إضافة/تعديل العروض
  // ==========================================
  void _showOfferDialog({Map<dynamic, dynamic>? offer}) {
    final isEdit = offer != null;
    final titleController = TextEditingController(text: isEdit ? offer['title'] : '');
    final descController = TextEditingController(text: isEdit ? offer['description'] : '');
    final discountValueController = TextEditingController(text: isEdit ? offer['discountValue']?.toString() : '');

    String discountType = isEdit ? offer['discountType'] : 'percentage';
    DateTime startDate = isEdit ? DateTime.parse(offer['startDate']) : DateTime.now();
    DateTime endDate = isEdit ? DateTime.parse(offer['endDate']) : DateTime.now().add(const Duration(days: 30));

    List<String> selectedProductIds = [];
    if (isEdit && offer['products'] != null) {
      selectedProductIds = List<String>.from((offer['products'] as List).map((p) => p['id'].toString()));
    }

    Get.dialog(
      StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: Text(
              isEdit ? 'تعديل العرض' : 'إضافة عرض جديد',
              style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: titleController,
                    decoration: const InputDecoration(labelText: 'عنوان العرض (مثال: خصم الصيف)'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: descController,
                    decoration: const InputDecoration(labelText: 'وصف العرض'),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: discountType,
                    decoration: const InputDecoration(labelText: 'نوع الخصم'),
                    items: const [
                      DropdownMenuItem(value: 'percentage', child: Text('نسبة مئوية (%)')),
                      DropdownMenuItem(value: 'fixed', child: Text('قيمة ثابتة (ريال)')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          discountType = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: discountValueController,
                    decoration: const InputDecoration(labelText: 'قيمة الخصم'),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  const Text('المنتجات المشمولة بالعرض (اختياري):', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ..._productController.myProducts.map((product) {
                    final isChecked = selectedProductIds.contains(product['id']);
                    return CheckboxListTile(
                      title: Text(product['name'] ?? ''),
                      value: isChecked,
                      onChanged: (val) {
                        setState(() {
                          if (val == true) {
                            selectedProductIds.add(product['id']);
                          } else {
                            selectedProductIds.remove(product['id']);
                          }
                        });
                      },
                    );
                  }),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: startDate,
                            firstDate: DateTime.now().subtract(const Duration(days: 365)),
                            lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
                          );
                          if (date != null) {
                            setState(() {
                              startDate = date;
                            });
                          }
                        },
                        child: Text('تاريخ البدء: ${startDate.toString().split(' ')[0]}'),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: endDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
                          );
                          if (date != null) {
                            setState(() {
                              endDate = date;
                            });
                          }
                        },
                        child: Text('تاريخ الانتهاء: ${endDate.toString().split(' ')[0]}'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('إلغاء'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (titleController.text.isEmpty || discountValueController.text.isEmpty) {
                    Get.snackbar('تنبيه', 'يرجى ملء الحقول الأساسية');
                    return;
                  }

                  final data = {
                    'title': titleController.text,
                    'description': descController.text,
                    'discountType': discountType,
                    'discountValue': double.parse(discountValueController.text),
                    'startDate': startDate.toIso8601String(),
                    'endDate': endDate.toIso8601String(),
                    'productIds': selectedProductIds.isNotEmpty ? selectedProductIds : null,
                  };

                  if (isEdit) {
                    _offersController.updateOffer(offer['id'], data);
                  } else {
                    _offersController.createOffer(data);
                  }
                },
                child: Text(isEdit ? 'تحديث' : 'إضافة'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'العروض والكوبونات',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'الكوبونات'),
            Tab(text: 'العروض'),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _offersController.fetchData(),
        color: const Color(0xFF4F46E5),
        child: Obx(() {
          if (_offersController.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          }

          return TabBarView(
            controller: _tabController,
            children: [
              // 1. واجهة الكوبونات
              _offersController.coupons.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 150),
                        Center(child: Text('لا توجد كوبونات حالياً')),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16.0),
                    itemCount: _offersController.coupons.length,
                    itemBuilder: (context, index) {
                      final coupon = _offersController.coupons[index];
                      final isPercentage = coupon['discountType'] == 'percentage';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'خصم ${coupon['discountValue']}${isPercentage ? '%' : ' ريال'}',
                                    style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 18),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: coupon['status'] == 'active' ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      coupon['status'] == 'active' ? 'نشط' : 'غير نشط',
                                      style: GoogleFonts.cairo(color: coupon['status'] == 'active' ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'كود الكوبون: ${coupon['code']}',
                                style: GoogleFonts.cairo(color: Colors.grey[700], fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'الحد الأدنى للطلب: ${coupon['minOrderAmount']} ريال',
                                style: GoogleFonts.cairo(color: Colors.grey[600], fontSize: 14),
                              ),
                              Text(
                                'ينتهي في: ${coupon['endDate'].toString().split('T')[0]}',
                                style: GoogleFonts.cairo(color: Colors.grey[500], fontSize: 14),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton.icon(
                                    onPressed: () => _showCouponDialog(coupon: coupon),
                                    icon: const Icon(Icons.edit, size: 18),
                                    label: Text('تعديل', style: GoogleFonts.cairo()),
                                  ),
                                  TextButton.icon(
                                    onPressed: () {
                                      Get.defaultDialog(
                                        title: 'تأكيد الحذف',
                                        middleText: 'هل أنت متأكد من حذف هذا الكوبون؟',
                                        textConfirm: 'حذف',
                                        textCancel: 'إلغاء',
                                        confirmTextColor: Colors.white,
                                        buttonColor: Colors.red,
                                        onConfirm: () {
                                          Get.back();
                                          _offersController.deleteCoupon(coupon['id']);
                                        },
                                      );
                                    },
                                    icon: const Icon(Icons.delete, size: 18, color: Colors.red),
                                    label: Text('حذف', style: GoogleFonts.cairo(color: Colors.red)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

            // 2. واجهة العروض
            _offersController.offers.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 150),
                      Center(child: Text('لا توجد عروض حالياً')),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16.0),
                    itemCount: _offersController.offers.length,
                    itemBuilder: (context, index) {
                      final offer = _offersController.offers[index];
                      final isPercentage = offer['discountType'] == 'percentage';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    offer['title'] ?? '',
                                    style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 18),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: offer['status'] == 'active' ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      offer['status'] == 'active' ? 'نشط' : 'غير نشط',
                                      style: GoogleFonts.cairo(color: offer['status'] == 'active' ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                offer['description'] ?? '',
                                style: GoogleFonts.cairo(color: Colors.grey[700], fontSize: 14),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'قيمة الخصم: ${offer['discountValue']}${isPercentage ? '%' : ' ريال'}',
                                style: GoogleFonts.cairo(color: Colors.blue.shade700, fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                'ينتهي في: ${offer['endDate'].toString().split('T')[0]}',
                                style: GoogleFonts.cairo(color: Colors.grey[500], fontSize: 14),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton.icon(
                                    onPressed: () => _showOfferDialog(offer: offer),
                                    icon: const Icon(Icons.edit, size: 18),
                                    label: Text('تعديل', style: GoogleFonts.cairo()),
                                  ),
                                  TextButton.icon(
                                    onPressed: () {
                                      Get.defaultDialog(
                                        title: 'تأكيد الحذف',
                                        middleText: 'هل أنت متأكد من حذف هذا العرض؟',
                                        textConfirm: 'حذف',
                                        textCancel: 'إلغاء',
                                        confirmTextColor: Colors.white,
                                        buttonColor: Colors.red,
                                        onConfirm: () {
                                          Get.back();
                                          _offersController.deleteOffer(offer['id']);
                                        },
                                      );
                                    },
                                    icon: const Icon(Icons.delete, size: 18, color: Colors.red),
                                    label: Text('حذف', style: GoogleFonts.cairo(color: Colors.red)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ],
        );
      })),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (_tabController.index == 0) {
            _showCouponDialog();
          } else {
            _showOfferDialog();
          }
        },
        backgroundColor: Theme.of(context).primaryColor,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'إضافة جديد',
          style: GoogleFonts.cairo(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
