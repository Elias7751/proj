import 'dart:convert';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class OffersController extends GetxController {
  final ApiClient _apiClient = ApiClient();

  var isLoading = false.obs;
  var coupons = [].obs;
  var offers = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchData();
  }

  Future<void> fetchData() async {
    isLoading.value = true;
    await Future.wait([
      fetchCoupons(),
      fetchOffers(),
    ]);
    isLoading.value = false;
  }

  Future<void> fetchCoupons() async {
    try {
      final response = await _apiClient.get('/coupons/store');
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        coupons.value = responseData['data'] ?? [];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل جلب الكوبونات');
    }
  }

  Future<void> fetchOffers() async {
    try {
      final response = await _apiClient.get('/offers/my-offers');
      if (response.statusCode == 200) {
        var responseData = response.data;
        if (responseData is String) {
          responseData = jsonDecode(responseData);
        }
        offers.value = responseData['data'] ?? [];
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل جلب العروض');
    }
  }

  Future<void> createCoupon(Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.post('/coupons/store', data: data);
      if (response.statusCode == 201) {
        Get.snackbar('نجاح', 'تم إنشاء الكوبون بنجاح');
        await fetchCoupons();
        Get.back();
      }
    } on DioException catch (e) {
      String errorMessage = 'فشل إنشاء الكوبون';
      if (e.response?.data != null) {
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
      isLoading.value = false;
    }
  }

  Future<void> updateCoupon(String id, Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.put('/coupons/store/$id', data: data);
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم تحديث الكوبون بنجاح');
        await fetchCoupons();
        Get.back();
      }
    } on DioException catch (e) {
      String errorMessage = 'فشل تحديث الكوبون';
      if (e.response?.data != null) {
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
      isLoading.value = false;
    }
  }

  Future<void> deleteCoupon(String id) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.delete('/coupons/store/$id');
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم حذف الكوبون بنجاح');
        await fetchCoupons();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل حذف الكوبون');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createOffer(Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.post('/offers', data: data);
      if (response.statusCode == 201) {
        Get.snackbar('نجاح', 'تم إنشاء العرض بنجاح');
        await fetchOffers();
        Get.back();
      }
    } on DioException catch (e) {
      String errorMessage = 'فشل إنشاء العرض';
      if (e.response?.data != null) {
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
      isLoading.value = false;
    }
  }

  Future<void> updateOffer(String id, Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.put('/offers/$id', data: data);
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم تحديث العرض بنجاح');
        await fetchOffers();
        Get.back();
      }
    } on DioException catch (e) {
      String errorMessage = 'فشل تحديث العرض';
      if (e.response?.data != null) {
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
      isLoading.value = false;
    }
  }

  Future<void> deleteOffer(String id) async {
    try {
      isLoading.value = true;
      final response = await _apiClient.delete('/offers/$id');
      if (response.statusCode == 200) {
        Get.snackbar('نجاح', 'تم حذف العرض بنجاح');
        await fetchOffers();
      }
    } catch (e) {
      Get.snackbar('خطأ', 'فشل حذف العرض');
    } finally {
      isLoading.value = false;
    }
  }
}
