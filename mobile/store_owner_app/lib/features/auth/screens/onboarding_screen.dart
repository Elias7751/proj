import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../routes/app_pages.dart';
import '../controllers/auth_controller.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final ApiClient _apiClient = ApiClient();
  final AuthController _authController = Get.find<AuthController>();

  int _currentStep = 0;
  bool _isLoading = false;

  // Data lists
  List<dynamic> _plans = [];
  List<dynamic> _categories = [];
  List<dynamic> _cities = [];
  List<dynamic> _areas = [];

  // Selections
  String? _selectedPlanId;
  String? _selectedCategoryId;
  String? _selectedCityId;
  String? _selectedAreaId;

  // Controllers
  final TextEditingController _storeNameArController = TextEditingController();
  final TextEditingController _storeNameEnController = TextEditingController();
  final TextEditingController _whatsappController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
    });
    try {
      // 1. Fetch Plans
      final plansResponse = await _apiClient.get('/subscriptions/plans');
      if (plansResponse.statusCode == 200) {
        var data = plansResponse.data;
        if (data is String) data = jsonDecode(data);
        _plans = data['data'] ?? [];
      }

      // 2. Fetch Categories
      final catsResponse = await _apiClient.get('/categories');
      if (catsResponse.statusCode == 200) {
        var data = catsResponse.data;
        if (data is String) data = jsonDecode(data);
        _categories = data['data'] ?? [];
      }

      // 3. Fetch Cities
      final citiesResponse = await _apiClient.get('/cities');
      if (citiesResponse.statusCode == 200) {
        var data = citiesResponse.data;
        if (data is String) data = jsonDecode(data);
        _cities = data['data'] ?? [];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل تحميل البيانات التمهيدية');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onCityChanged(String? cityId) {
    setState(() {
      _selectedCityId = cityId;
      _selectedAreaId = null;
      if (cityId != null) {
        final city = _cities.firstWhere((c) => c['id'] == cityId);
        _areas = city['areas'] ?? [];
      } else {
        _areas = [];
      }
    });
  }

  Future<void> _submit() async {
    if (_storeNameArController.text.isEmpty ||
        _storeNameEnController.text.isEmpty ||
        _whatsappController.text.isEmpty ||
        _selectedCategoryId == null ||
        _selectedCityId == null ||
        _selectedAreaId == null ||
        _selectedPlanId == null) {
      Get.snackbar('تنبيه', 'يرجى إكمال جميع البيانات المطلوبة');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // 1. Create Store
      final storeResponse = await _apiClient.post(
        '/stores',
        data: {
          'nameAr': _storeNameArController.text,
          'nameEn': _storeNameEnController.text,
          'description': 'متجر جديد',
          'whatsappNumber': _whatsappController.text,
          'categoryId': _selectedCategoryId,
          'cityId': _selectedCityId,
          'areaId': _selectedAreaId,
        },
      );

      if (storeResponse.statusCode == 201) {
        var storeData = storeResponse.data;
        if (storeData is String) storeData = jsonDecode(storeData);
        final store = storeData['data'];

        // 2. Subscribe to Plan
        await _apiClient.post(
          '/subscriptions/subscribe',
          data: {
            'planId': _selectedPlanId,
          },
        );

        // Update current store in AuthController
        _authController.currentStore.value = store;

        Get.snackbar('نجاح', 'تم إنشاء المتجر بنجاح وبانتظار موافقة الإدارة');
        Get.offAllNamed(Routes.PENDING_APPROVAL);
      }
    } on DioException catch (e) {
      String errorMessage = 'حدث خطأ أثناء إنشاء المتجر';
      if (e.response != null && e.response?.data != null) {
        var responseData = e.response?.data;
        if (responseData is String) {
          try {
            responseData = jsonDecode(responseData);
          } catch (_) {}
        }
        if (responseData is Map) {
          errorMessage = responseData['message'] ?? errorMessage;
        }
      }
      Get.snackbar('خطأ', errorMessage);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تهيئة المتجر الجديد'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _authController.logout(),
          )
        ],
      ),
      body: _isLoading && _plans.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Stepper(
              type: StepperType.horizontal,
              currentStep: _currentStep,
              onStepContinue: () {
                if (_currentStep == 0) {
                  if (_selectedPlanId == null) {
                    Get.snackbar('تنبيه', 'يرجى اختيار خطة الاشتراك أولاً');
                    return;
                  }
                  setState(() {
                    _currentStep++;
                  });
                } else {
                  _submit();
                }
              },
              onStepCancel: () {
                if (_currentStep > 0) {
                  setState(() {
                    _currentStep--;
                  });
                }
              },
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 24.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: details.onStepContinue,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : Text(_currentStep == 0 ? 'التالي' : 'تأكيد وإنشاء المتجر'),
                        ),
                      ),
                      if (_currentStep > 0) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: details.onStepCancel,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text('السابق'),
                          ),
                        ),
                      ]
                    ],
                  ),
                );
              },
              steps: [
                Step(
                  title: const Text('الخطة'),
                  isActive: _currentStep >= 0,
                  state: _currentStep > 0 ? StepState.complete : StepState.editing,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'اختر خطة الاشتراك المناسبة لمتجرك:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      ..._plans.map((plan) {
                        final isSelected = _selectedPlanId == plan['id'];
                        final features = List<String>.from(plan['features'] ?? []);
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedPlanId = plan['id'];
                            });
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.blue.shade50 : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? Colors.blue : Colors.grey.shade300,
                                width: isSelected ? 2 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 6,
                                  offset: const Offset(0, 3),
                                )
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      plan['nameAr'] ?? '',
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      plan['price'] == 0 || plan['price'] == '0.00'
                                          ? 'مجاناً'
                                          : '${plan['price']} \$ / شهر',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue.shade700,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  plan['descriptionAr'] ?? '',
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                                ),
                                const Divider(height: 24),
                                ...features.map((feature) => Padding(
                                      padding: const EdgeInsets.only(bottom: 6.0),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.check_circle, color: Colors.green, size: 18),
                                          const SizedBox(width: 8),
                                          Text(feature, style: const TextStyle(fontSize: 13)),
                                        ],
                                      ),
                                    )),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                Step(
                  title: const Text('بيانات المتجر'),
                  isActive: _currentStep >= 1,
                  state: _currentStep == 1 ? StepState.editing : StepState.indexed,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'أدخل بيانات متجرك لبدء البيع:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _storeNameArController,
                        decoration: InputDecoration(
                          labelText: 'اسم المتجر (بالعربية)',
                          prefixIcon: const Icon(Icons.store),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _storeNameEnController,
                        decoration: InputDecoration(
                          labelText: 'اسم المتجر (بالإنجليزية)',
                          prefixIcon: const Icon(Icons.store_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _whatsappController,
                        decoration: InputDecoration(
                          labelText: 'رقم واتساب للتواصل',
                          prefixIcon: const Icon(Icons.phone),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _selectedCategoryId,
                        decoration: InputDecoration(
                          labelText: 'تصنيف المتجر',
                          prefixIcon: const Icon(Icons.category),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        items: _categories.map<DropdownMenuItem<String>>((cat) {
                          return DropdownMenuItem<String>(
                            value: cat['id'],
                            child: Text(cat['nameAr'] ?? ''),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setState(() {
                            _selectedCategoryId = val;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _selectedCityId,
                        decoration: InputDecoration(
                          labelText: 'المدينة',
                          prefixIcon: const Icon(Icons.location_city),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        items: _cities.map<DropdownMenuItem<String>>((city) {
                          return DropdownMenuItem<String>(
                            value: city['id'],
                            child: Text(city['nameAr'] ?? ''),
                          );
                        }).toList(),
                        onChanged: _onCityChanged,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _selectedAreaId,
                        decoration: InputDecoration(
                          labelText: 'المنطقة / الحي',
                          prefixIcon: const Icon(Icons.map),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        items: _areas.map<DropdownMenuItem<String>>((area) {
                          return DropdownMenuItem<String>(
                            value: area['id'],
                            child: Text(area['nameAr'] ?? ''),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setState(() {
                            _selectedAreaId = val;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
