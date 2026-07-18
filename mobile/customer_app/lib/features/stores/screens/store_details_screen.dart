import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../controllers/store_controller.dart';
import '../../../routes/app_pages.dart';

class StoreDetailsScreen extends StatefulWidget {
  const StoreDetailsScreen({super.key});

  @override
  State<StoreDetailsScreen> createState() => _StoreDetailsScreenState();
}

class _StoreDetailsScreenState extends State<StoreDetailsScreen> {
  final StoreController storeController = Get.put(StoreController());
  late String slug;
  late String storeId;

  @override
  void initState() {
    super.initState();
    // استلام المعاملات الممررة
    final args = Get.arguments as Map<String, dynamic>;
    slug = args['slug'];
    storeId = args['storeId'];

    // جلب بيانات المتجر
    WidgetsBinding.instance.addPostFrameCallback((_) {
      storeController.fetchStoreDetails(slug, storeId);
    });
  }

  Future<void> _launchURL(String urlString) async {
    if (urlString.isEmpty) return;
    final Uri uri = Uri.parse(urlString);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      Get.snackbar('تنبيه', 'تعذر فتح الرابط');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Obx(() {
        if (storeController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        final store = storeController.currentStore;
        final products = storeController.storeProducts;

        if (store.isEmpty) {
          return const Center(child: Text('لم يتم العثور على المتجر'));
        }

        final social = store['socialLinks'] ?? {};
        final hasSocial = social['facebook']?.isNotEmpty == true ||
            social['instagram']?.isNotEmpty == true ||
            social['tiktok']?.isNotEmpty == true ||
            social['website']?.isNotEmpty == true;

        return CustomScrollView(
          slivers: [
            // صورة المتجر في الأعلى (SliverAppBar)
            SliverAppBar(
              expandedHeight: 200.0,
              floating: false,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  store['nameAr'] ?? 'المتجر',
                  style: GoogleFonts.cairo(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    shadows: [const Shadow(color: Colors.black45, blurRadius: 10)],
                  ),
                ),
                background: store['cover'] != null
                    ? Image.network(
                        store['cover'],
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: Colors.grey[400],
                        child: const Center(
                          child: Icon(Icons.store, size: 80, color: Colors.white),
                        ),
                      ),
              ),
            ),

            // معلومات المتجر
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.star,
                              color: Colors.amber,
                              size: 24,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              store['rating']?.toString() ?? '5.0',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'الحد الأدنى للطلب: ${store['minOrderAmount'] ?? 0} ريال',
                            style: GoogleFonts.cairo(
                              color: const Color(0xFF6366F1),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // الشعار والاسم والوصف
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (store['logo'] != null) ...[
                          CircleAvatar(
                            radius: 30,
                            backgroundImage: NetworkImage(store['logo']),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'عن المتجر',
                                style: GoogleFonts.cairo(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                store['description'] ?? 'لا يوجد وصف متاح.',
                                style: GoogleFonts.cairo(
                                  color: Colors.grey[700],
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // سياسة التوصيل
                    if (store['deliveryPolicy']?.isNotEmpty == true) ...[
                      const Divider(),
                      const SizedBox(height: 8),
                      Text(
                        'سياسة التوصيل والاسترجاع',
                        style: GoogleFonts.cairo(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        store['deliveryPolicy'],
                        style: GoogleFonts.cairo(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],

                    // روابط التواصل الاجتماعي
                    if (hasSocial) ...[
                      const Divider(),
                      const SizedBox(height: 8),
                      Text(
                        'تواصل معنا',
                        style: GoogleFonts.cairo(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          if (social['facebook']?.isNotEmpty == true)
                            IconButton(
                              icon: const Icon(Icons.facebook, color: Colors.blue, size: 30),
                              onPressed: () => _launchURL(social['facebook']),
                            ),
                          if (social['instagram']?.isNotEmpty == true)
                            IconButton(
                              icon: const Icon(Icons.camera_alt, color: Colors.pink, size: 30),
                              onPressed: () => _launchURL(social['instagram']),
                            ),
                          if (social['tiktok']?.isNotEmpty == true)
                            IconButton(
                              icon: const Icon(Icons.music_note, color: Colors.black, size: 30),
                              onPressed: () => _launchURL(social['tiktok']),
                            ),
                          if (social['website']?.isNotEmpty == true)
                            IconButton(
                              icon: const Icon(Icons.language, color: Colors.teal, size: 30),
                              onPressed: () => _launchURL(social['website']),
                            ),
                        ],
                      ),
                    ],

                    const Divider(),
                    const SizedBox(height: 8),
                    Text(
                      'المنتجات',
                      style: GoogleFonts.cairo(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // قائمة المنتجات
            if (products.isEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Center(
                    child: Text(
                      'لا توجد منتجات في هذا المتجر حالياً',
                      style: GoogleFonts.cairo(color: Colors.grey),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16.0,
                    crossAxisSpacing: 16.0,
                    childAspectRatio: 0.75,
                  ),
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final product = products[index];
                    return Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: InkWell(
                        onTap: () {
                          Get.toNamed(
                            Routes.PRODUCT_DETAILS,
                            arguments: {'productId': product['id']},
                          );
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // صورة المنتج
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: const BorderRadius.vertical(
                                    top: Radius.circular(12),
                                  ),
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
                                    ? const Center(
                                        child: Icon(Icons.image, color: Colors.grey),
                                      )
                                    : null,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product['name'] ?? 'اسم المنتج',
                                    style: GoogleFonts.cairo(
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${product['price']} ريال',
                                        style: const TextStyle(
                                          color: Color(0xFF6366F1),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF6366F1),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.add,
                                          color: Colors.white,
                                          size: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }, childCount: products.length),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        );
      }),
    );
  }
}
