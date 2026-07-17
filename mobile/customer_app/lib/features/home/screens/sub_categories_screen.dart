import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

class SubCategoriesScreen extends StatelessWidget {
  const SubCategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // We can get the category name and ID from arguments
    final String categoryName = Get.arguments?['name'] ?? 'التصنيفات الفرعية';

    // Dummy data for subcategories
    final List<Map<String, dynamic>> subCategories = [
      {'id': 1, 'name': 'أجهزة منزلية', 'icon': Icons.kitchen},
      {'id': 2, 'name': 'إلكترونيات', 'icon': Icons.tv},
      {'id': 3, 'name': 'ملابس', 'icon': Icons.checkroom},
      {'id': 4, 'name': 'أحذية', 'icon': Icons.snowshoeing},
      {'id': 5, 'name': 'عطور', 'icon': Icons.local_florist},
      {'id': 6, 'name': 'هواتف ذكية', 'icon': Icons.smartphone},
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          categoryName,
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.1,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: subCategories.length,
        itemBuilder: (context, index) {
          final subCat = subCategories[index];
          return InkWell(
            onTap: () {
              // Navigate to stores or products for this subcategory
              Get.toNamed('/stores', arguments: {'subCategoryId': subCat['id'], 'name': subCat['name']});
            },
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    subCat['icon'] as IconData,
                    size: 48,
                    color: Theme.of(context).primaryColor,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    subCat['name'] as String,
                    style: GoogleFonts.cairo(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
