import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/support_controller.dart';

class TicketDetailsScreen extends StatefulWidget {
  const TicketDetailsScreen({super.key});

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  final SupportController controller = Get.find<SupportController>();
  final _replyController = TextEditingController();
  late String ticketId;

  @override
  void initState() {
    super.initState();
    final args = Get.arguments as Map<String, dynamic>;
    ticketId = args['ticketId'];
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchTicketDetails(ticketId);
    });
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  void _sendReply() async {
    if (_replyController.text.trim().isEmpty) return;
    
    final success = await controller.replyToTicket(ticketId, _replyController.text);
    if (success) {
      _replyController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تفاصيل التذكرة'),
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.currentTicket.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)));
        }

        final ticket = controller.currentTicket;
        if (ticket.isEmpty) {
          return const Center(child: Text('لم يتم العثور على التذكرة'));
        }

        final replies = ticket['replies'] as List? ?? [];

        return Column(
          children: [
            // Ticket Header
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          ticket['title'] ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: controller.getStatusColor(ticket['status']).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          controller.translateStatus(ticket['status']),
                          style: TextStyle(
                            color: controller.getStatusColor(ticket['status']),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    ticket['description'] ?? '',
                    style: TextStyle(fontSize: 15, color: Colors.grey[800]),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        ticket['createdAt']?.substring(0, 10) ?? '',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Replies List
            Expanded(
              child: Container(
                color: Colors.grey[50],
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: replies.length,
                  itemBuilder: (context, index) {
                    final reply = replies[index];
                    final isAdmin = reply['user']?['role'] == 'admin';

                    return Align(
                      alignment: isAdmin ? Alignment.centerLeft : Alignment.centerRight,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.8,
                        ),
                        decoration: BoxDecoration(
                          color: isAdmin ? Colors.white : const Color(0xFF4F46E5),
                          borderRadius: BorderRadius.circular(12),
                          border: isAdmin ? Border.all(color: Colors.grey[300]!) : null,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isAdmin ? Icons.support_agent : Icons.person,
                                  size: 14,
                                  color: isAdmin ? Colors.grey[600] : Colors.white70,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  isAdmin ? 'الدعم الفني' : 'أنت',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                    color: isAdmin ? Colors.grey[800] : Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              reply['message'] ?? '',
                              style: TextStyle(
                                fontSize: 15,
                                color: isAdmin ? Colors.black87 : Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Reply Input
            if (ticket['status'] != 'closed')
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _replyController,
                        decoration: InputDecoration(
                          hintText: 'اكتب ردك هنا...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.grey[100],
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        maxLines: null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Obx(() => CircleAvatar(
                      backgroundColor: const Color(0xFF4F46E5),
                      radius: 24,
                      child: controller.isReplying.value
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : IconButton(
                              icon: const Icon(Icons.send, color: Colors.white, size: 20),
                              onPressed: _sendReply,
                            ),
                    )),
                  ],
                ),
              ),
          ],
        );
      }),
    );
  }
}
