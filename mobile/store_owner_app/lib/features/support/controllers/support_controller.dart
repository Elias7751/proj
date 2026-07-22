import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../../core/services/storage_service.dart';

class SupportController extends GetxController {
  final StorageService _storageService = Get.find<StorageService>();
  
  var tickets = [].obs;
  var currentTicket = {}.obs;
  var isLoading = false.obs;
  var isReplying = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchMyTickets();
  }

  Future<void> fetchMyTickets() async {
    isLoading.value = true;
    try {
      final token = _storageService.getToken();
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        tickets.value = data['data'];
      }
    } catch (e) {
      print('Error fetching tickets: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchTicketDetails(String id) async {
    isLoading.value = true;
    try {
      final token = _storageService.getToken();
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        currentTicket.value = data['data'];
      }
    } catch (e) {
      print('Error fetching ticket details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> createTicket(String title, String description, String priority) async {
    isLoading.value = true;
    try {
      final token = _storageService.getToken();
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'title': title,
          'description': description,
          'priority': priority,
        }),
      );

      if (response.statusCode == 201) {
        Get.snackbar('نجاح', 'تم إنشاء التذكرة بنجاح',
            backgroundColor: Colors.green, colorText: Colors.white);
        fetchMyTickets();
        return true;
      } else {
        Get.snackbar('خطأ', 'حدث خطأ أثناء إنشاء التذكرة',
            backgroundColor: Colors.red, colorText: Colors.white);
        return false;
      }
    } catch (e) {
      print('Error creating ticket: $e');
      Get.snackbar('خطأ', 'حدث خطأ في الاتصال',
          backgroundColor: Colors.red, colorText: Colors.white);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> replyToTicket(String id, String message) async {
    isReplying.value = true;
    try {
      final token = _storageService.getToken();
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets/$id/reply'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'message': message,
        }),
      );

      if (response.statusCode == 201) {
        fetchTicketDetails(id);
        return true;
      } else {
        Get.snackbar('خطأ', 'حدث خطأ أثناء إرسال الرد',
            backgroundColor: Colors.red, colorText: Colors.white);
        return false;
      }
    } catch (e) {
      print('Error replying to ticket: $e');
      Get.snackbar('خطأ', 'حدث خطأ في الاتصال',
          backgroundColor: Colors.red, colorText: Colors.white);
      return false;
    } finally {
      isReplying.value = false;
    }
  }

  String translateStatus(String status) {
    switch (status) {
      case 'open': return 'مفتوحة';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'تم الحل';
      case 'closed': return 'مغلقة';
      default: return status;
    }
  }

  Color getStatusColor(String status) {
    switch (status) {
      case 'open': return Colors.blue;
      case 'in_progress': return Colors.orange;
      case 'resolved': return Colors.green;
      case 'closed': return Colors.red;
      default: return Colors.grey;
    }
  }
}
