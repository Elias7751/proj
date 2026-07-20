import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/firebase_messaging_service.dart';
import '../../../routes/app_pages.dart';

class AuthController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = false.obs;
  var currentUser = {}.obs;
  var currentStore = {}.obs;

  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
    
    // Initialize Firebase Messaging
    final messagingService = FirebaseMessagingService();
    messagingService.init();
  }

  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      await fetchUserData();
    }
  }

  Future<bool> checkLoginStatusAndReturn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      try {
        await fetchUserData();
        return currentUser.isNotEmpty;
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  Future<void> login(String phone, String password) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.post(
        '/auth/login',
        data: {'phone': phone, 'password': password},
      );

      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final data = responseData['data'];
        final token = data['token'];
        final user = data['user'];

        // التحقق من أن المستخدم تاجر
        if (user['role'] != 'store_owner' && user['role'] != 'admin') {
          Get.snackbar('خطأ', 'هذا الحساب ليس حساب تاجر');
          return;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        currentUser.value = user;

        Get.snackbar('نجاح', 'تم تسجيل الدخول بنجاح');
        await fetchStoreData();
      }
    } on DioException catch (e) {
      String errorMessage = 'حدث خطأ غير متوقع';
      if (e.response != null && e.response?.data != null) {
        var responseData = e.response?.data;
        if (responseData is String) {
          try {
            responseData = jsonDecode(responseData);
          } catch (_) {}
        }
        if (responseData is Map) {
          errorMessage = responseData['message'] ?? errorMessage;
        } else if (responseData is String) {
          errorMessage = responseData;
        }
      }
      Get.snackbar('خطأ', errorMessage, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  // تسجيل مستخدم جديد كتاجر
  Future<void> registerUser(
    String fullName,
    String phone,
    String password,
  ) async {
    try {
      isLoading.value = true;

      final registerResponse = await _apiClient.post(
        '/auth/register',
        data: {
          'fullName': fullName,
          'phone': phone,
          'password': password,
          'role': 'store_owner',
        },
      );

      if (registerResponse.statusCode == 201) {
        var registerData = registerResponse.data;
        if (registerData is String) {
          registerData = jsonDecode(registerData);
        }
        final data = registerData['data'];
        final token = data['token'];
        final user = data['user'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        currentUser.value = user;

        Get.snackbar('نجاح', 'تم إنشاء الحساب بنجاح. يرجى إكمال تهيئة المتجر.');
        Get.offAllNamed(Routes.ONBOARDING);
      }
    } on DioException catch (e) {
      String errorMessage = 'حدث خطأ غير متوقع';
      if (e.response != null && e.response?.data != null) {
        var responseData = e.response?.data;
        if (responseData is String) {
          try {
            responseData = jsonDecode(responseData);
          } catch (_) {}
        }
        if (responseData is Map) {
          errorMessage = responseData['message'] ?? errorMessage;
        } else if (responseData is String) {
          errorMessage = responseData;
        }
      }
      Get.snackbar('خطأ', errorMessage, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchUserData() async {
    try {
      final response = await _apiClient.get('/auth/me');
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final user = responseData['data'];
        if (user['role'] == 'store_owner' || user['role'] == 'admin') {
          currentUser.value = user;
          await fetchStoreData();
        } else {
          Get.snackbar('خطأ صلاحيات', 'هذا الحساب ليس حساب تاجر');
          logout();
        }
      }
    } on DioException catch (e) {
      Get.snackbar('خطأ في جلب بيانات المستخدم', 'الرمز: ${e.response?.statusCode}, الخطأ: ${e.response?.data}');
      logout();
    } catch (e) {
      Get.snackbar('خطأ غير متوقع', e.toString());
      logout();
    }
  }

  Future<void> fetchStoreData() async {
    try {
      final response = await _apiClient.get('/stores/my-store');
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        currentStore.value = responseData['data'];
        
        // التوجيه بناءً على حالة المتجر
        if (currentStore['status'] == 'blocked') {
          Get.snackbar('تنبيه', 'تم حظر متجرك من قبل الإدارة. يرجى التواصل مع الدعم.');
          logout();
        } else {
          Get.offAllNamed(Routes.MAIN);
        }
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // لا يوجد متجر مرتبط، التوجيه لصفحة التهيئة
        Get.offAllNamed(Routes.ONBOARDING);
      } else {
        Get.snackbar('خطأ في جلب بيانات المتجر', 'الرمز: ${e.response?.statusCode}, الخطأ: ${e.response?.data}');
        logout();
      }
    } catch (e) {
      Get.snackbar('خطأ غير متوقع في المتجر', e.toString());
      logout();
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    currentUser.value = {};
    currentStore.value = {};
    Get.offAllNamed(Routes.LOGIN);
  }

  // حذف الحساب
  Future<void> deleteAccount() async {
    try {
      isLoading.value = true;
      final response = await _apiClient.delete('/auth/delete-account');
      
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم حذف الحساب بنجاح');
        await logout();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'حدث خطأ أثناء حذف الحساب');
    } finally {
      isLoading.value = false;
    }
  }
}
