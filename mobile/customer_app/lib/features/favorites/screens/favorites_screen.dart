import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/favorite_controller.dart';
import '../../../routes/app_pages.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final FavoriteController favoriteController = Get.put(FavoriteController());

    return Scaffold(
      appBar: AppBar(
        title: Text('المفضلات', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Obx(() {
        if (favoriteController.isLoading.value) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
        }

        if (favoriteController.myFavorites.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.favorite_border, size: 100, color: Colors.grey),
                const SizedBox(height: 16),
                Text(
                  'لا توجد منتجات في المفضلة',
                  style: GoogleFonts.cairo(fontSize: 20, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => favoriteController.fetchFavorites(),
          color: const Color(0xFF6366F1),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: favoriteController.myFavorites.length,
            itemBuilder: (context, index) {
              final product = favoriteController.myFavorites[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: InkWell(
                  onTap: () {
                    Get.toNamed(Routes.PRODUCT_DETAILS, arguments: {'product': product});
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(8),
                            image: product['images'] != null && product['images'].isNotEmpty
                                ? DecorationImage(
                                    image: product['images'][0].startsWith('data:image')
                                        ? MemoryImage(base64Decode(product['images'][0].split(',')[1])) as ImageProvider
                                        : NetworkImage(product['images'][0]),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: product['images'] == null || product['images'].isEmpty
                              ? const Icon(Icons.image, color: Colors.grey)
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product['name'] ?? 'منتج',
                                style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${product['price']} ريال',
                                style: GoogleFonts.cairo(
                                  color: const Color(0xFF6366F1),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.favorite, color: Colors.red),
                          onPressed: () {
                            favoriteController.toggleFavorite(product['id']);
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
