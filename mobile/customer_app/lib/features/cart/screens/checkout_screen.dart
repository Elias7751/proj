import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/cart_controller.dart';
import '../../../core/network/api_client.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final ApiClient _apiClient = ApiClient();
  final CartController cartController = Get.put(CartController(), permanent: true);

  final TextEditingController notesController = TextEditingController();
  final TextEditingController googleMapsController = TextEditingController();

  List<dynamic> _cities = [];
  List<dynamic> _areas = [];
  bool _isLoadingCities = false;

  String? _selectedCityId;
  String? _selectedAreaId;
  String? _selectedCityName;
  String? _selectedAreaName;
  double _deliveryFee = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchCities();
    _fetchStoreDetails();
  }

  Future<void> _fetchCities() async {
    setState(() {
      _isLoadingCities = true;
    });
    try {
      final response = await _apiClient.get('/cities');
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        setState(() {
          _cities = responseData['data'] ?? [];
        });
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل تحميل قائمة المدن');
    } finally {
      setState(() {
        _isLoadingCities = false;
      });
    }
  }

  Future<void> _fetchStoreDetails() async {
    final storeId = cartController.currentStoreId.value;
    if (storeId.isEmpty) return;

    try {
      final response = await _apiClient.get('/stores', queryParameters: {'id': storeId});
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final storesList = responseData['data'] ?? [];
        if (storesList.isNotEmpty) {
          final store = storesList[0];
          setState(() {
            _deliveryFee = double.tryParse(store['deliveryFee']?.toString() ?? '0') ?? 0.0;
          });
        }
      }
    } catch (e) {
      print('Error fetching store details: $e');
    }
  }

  void _onCityChanged(String? cityId) {
    setState(() {
      _selectedCityId = cityId;
      _selectedAreaId = null;
      _selectedAreaName = null;
      
      if (cityId != null) {
        final city = _cities.firstWhere((c) => c['id'].toString() == cityId);
        _selectedCityName = city['nameAr'];
        _areas = city['areas'] ?? [];
      } else {
        _selectedCityName = null;
        _areas = [];
      }
    });
  }

  void _onAreaChanged(String? areaId) {
    setState(() {
      _selectedAreaId = areaId;
      if (areaId != null) {
        final area = _areas.firstWhere((a) => a['id'].toString() == areaId);
        _selectedAreaName = area['nameAr'];
      } else {
        _selectedAreaName = null;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'إتمام الطلب',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _isLoadingCities
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'عنوان التوصيل',
                    style: GoogleFonts.cairo(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'المدينة',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    value: _selectedCityId,
                    items: _cities.map((city) {
                      return DropdownMenuItem(
                        value: city['id'].toString(),
                        child: Text(city['nameAr'] ?? '', style: GoogleFonts.cairo()),
                      );
                    }).toList(),
                    onChanged: _onCityChanged,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'المنطقة / الحي',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    value: _selectedAreaId,
                    items: _areas.map((area) {
                      return DropdownMenuItem(
                        value: area['id'].toString(),
                        child: Text(
                          area['nameAr'] ?? '',
                          style: GoogleFonts.cairo(),
                        ),
                      );
                    }).toList(),
                    onChanged: _onAreaChanged,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'رابط موقعك على الخريطة (اختياري)',
                    style: GoogleFonts.cairo(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'افتح خرائط جوجل، انسخ رابط موقعك وضعه هنا لمساعدة السائق في الوصول إليك بسرعة.',
                    style: GoogleFonts.cairo(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: googleMapsController,
                    decoration: InputDecoration(
                      hintText: 'أدخل رابط خرائط جوجل هنا (مثال: https://maps.app.goo.gl/...)',
                      prefixIcon: const Icon(Icons.location_on, color: Colors.red),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'ملاحظات إضافية (اختياري)',
                    style: GoogleFonts.cairo(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: notesController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'أضف أي ملاحظات حول الطلب أو التوصيل...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Obx(() {
                    final subTotal = cartController.subTotal;
                    final discount = cartController.discountAmount.value;
                    final total = subTotal + _deliveryFee - discount;

                    return Container(
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
                              Text('$subTotal ريال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('رسوم التوصيل', style: GoogleFonts.cairo()),
                              Text('$_deliveryFee ريال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          if (cartController.isCouponApplied.value) ...[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('الخصم (كوبون ${cartController.couponCode.value})', style: GoogleFonts.cairo(color: Colors.green)),
                                Text('-$discount ريال', style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: Colors.green)),
                              ],
                            ),
                          ],
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
                                '$total ريال',
                                style: GoogleFonts.cairo(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF6366F1),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Obx(() => ElevatedButton(
            onPressed: cartController.isLoading.value
                ? null
                : () {
                    if (_selectedCityName == null || _selectedAreaName == null) {
                      Get.snackbar('تنبيه', 'يرجى اختيار المدينة والمنطقة');
                      return;
                    }
                    final address = {
                      'city': _selectedCityName,
                      'area': _selectedAreaName,
                      'details': '',
                      'googleMapsLink': googleMapsController.text,
                    };
                    cartController.checkout(
                      address,
                      'cash_on_delivery',
                      notesController.text,
                    );
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: cartController.isLoading.value
                ? const CircularProgressIndicator(color: Colors.white)
                : Text(
                    'تأكيد الطلب عبر واتساب',
                    style: GoogleFonts.cairo(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          )),
        ),
      ),
    );
  }
}
