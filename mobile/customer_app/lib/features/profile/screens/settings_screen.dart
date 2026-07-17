import 'package:flutter/material.dart';

import 'package:google_fonts/google_fonts.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'الإعدادات',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSectionHeader('عام'),
          _buildListTile(
            context,
            icon: Icons.language,
            title: 'اللغة',
            subtitle: 'العربية',
            onTap: () {
              // TODO: Change language
            },
          ),
          _buildListTile(
            context,
            icon: Icons.notifications_outlined,
            title: 'الإشعارات',
            onTap: () {
              // TODO: Notification settings
            },
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('المعلومات والدعم'),
          _buildListTile(
            context,
            icon: Icons.help_outline,
            title: 'الأسئلة الشائعة',
            onTap: () {
              // TODO: Navigate to FAQ
            },
          ),
          _buildListTile(
            context,
            icon: Icons.description_outlined,
            title: 'الشروط والأحكام',
            onTap: () {
              // TODO: Navigate to Terms
            },
          ),
          _buildListTile(
            context,
            icon: Icons.privacy_tip_outlined,
            title: 'سياسة الخصوصية',
            onTap: () {
              // TODO: Navigate to Privacy Policy
            },
          ),
          _buildListTile(
            context,
            icon: Icons.info_outline,
            title: 'عن التطبيق',
            subtitle: 'الإصدار 1.0.0',
            onTap: () {
              // Show about dialog
              showAboutDialog(
                context: context,
                applicationName: 'تطبيق العميل',
                applicationVersion: '1.0.0',
                applicationIcon: const Icon(
                  Icons.shopping_bag,
                  size: 48,
                  color: Color(0xFF6366F1),
                ),
                children: [
                  Text(
                    'تطبيق لتسوق المنتجات من مختلف المتاجر بسهولة وسرعة.',
                    style: GoogleFonts.cairo(),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, right: 8.0),
      child: Text(
        title,
        style: GoogleFonts.cairo(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.grey[600],
        ),
      ),
    );
  }

  Widget _buildListTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).primaryColor),
        title: Text(
          title,
          style: GoogleFonts.cairo(fontWeight: FontWeight.w600),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: GoogleFonts.cairo(fontSize: 12))
            : null,
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
