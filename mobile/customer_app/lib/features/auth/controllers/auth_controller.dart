import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../routes/app_pages.dart';

class AuthController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = false.obs;
  var currentUser = {}.obs;

  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }

  // التحقق مما إذا كان المستخدم مسجلاً للدخول مسبقاً
  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      // جلب بيانات المستخدم
      await fetchUserData();
    }
  }

  Future<bool> checkLoginStatusAndReturn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      await fetchUserData();
      return true;
    }
    return false;
  }

  // تسجيل الدخول
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

        // حفظ التوكن
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        currentUser.value = user;

        Get.snackbar('نجاح', 'تم تسجيل الدخول بنجاح');
        Get.offAllNamed(Routes.MAIN);
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

  // إنشاء حساب جديد
  Future<void> register(String fullName, String phone, String password) async {
    try {
      isLoading.value = true;

      final response = await _apiClient.post(
        '/auth/register',
        data: {
          'fullName': fullName,
          'phone': phone,
          'password': password,
          'role': 'customer', // تحديد الدور كعميل
        },
      );

      if (response.statusCode == 201) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        final data = responseData['data'];
        final token = data['token'];
        final user = data['user'];

        // حفظ التوكن
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        currentUser.value = user;

        Get.snackbar('نجاح', 'تم إنشاء الحساب بنجاح');
        Get.offAllNamed(Routes.MAIN);
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

  // جلب بيانات المستخدم الحالي
  Future<void> fetchUserData() async {
    try {
      final response = await _apiClient.get('/auth/me');
      if (response.statusCode == 200) {
        currentUser.value = response.data['data'];
        Get.offAllNamed(Routes.MAIN); // توجيه للرئيسية إذا كان التوكن صالحاً
      }
    } catch (e) {
      // إذا فشل جلب البيانات (مثلاً التوكن منتهي)، نقوم بتسجيل الخروج
      logout();
    }
  }

  // تسجيل الخروج
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    currentUser.value = {};
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
