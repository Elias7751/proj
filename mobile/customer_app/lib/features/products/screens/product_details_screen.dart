import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/product_controller.dart';
import '../../favorites/controllers/favorite_controller.dart';
import '../../cart/controllers/cart_controller.dart' as import_cart_controller;

class ProductDetailsScreen extends StatefulWidget {
  const ProductDetailsScreen({super.key});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  final ProductController productController = Get.put(ProductController());
  final FavoriteController favoriteController = Get.put(FavoriteController());
  final cartController = Get.put(import_cart_controller.CartController());
  late String productId;

  @override
  void initState() {
    super.initState();
    final args = Get.arguments as Map<String, dynamic>;
    productId = args['productId'];

    WidgetsBinding.instance.addPostFrameCallback((_) {
      productController.fetchProductDetails(productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تفاصيل المنتج'),
        actions: [
          Obx(() {
            final isFav = favoriteController.isFavorite(productId);
            return IconButton(
              icon: Icon(
                isFav ? Icons.favorite : Icons.favorite_border,
                color: isFav ? Colors.red : Colors.grey,
              ),
              onPressed: () {
                favoriteController.toggleFavorite(productId);
              },
            );
          }),
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
        ],
      ),
      body: Obx(() {
        if (productController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        final product = productController.currentProduct;
        if (product.isEmpty) {
          return const Center(child: Text('لم يتم العثور على المنتج'));
        }

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // صورة المنتج
              Container(
                height: 250,
                width: double.infinity,
                color: Colors.grey[200],
                child: const Center(
                  child: Icon(Icons.image, size: 100, color: Colors.grey),
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // اسم المنتج والسعر
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            product['name'] ?? 'اسم المنتج',
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ),
                        Text(
                          '${product['price']} ريال',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6366F1),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // التقييم والمتجر
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          product['rating']?.toString() ?? '5.0',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Icon(Icons.store, color: Colors.grey, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          product['store']?['nameAr'] ?? 'المتجر',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // الوصف
                    Text(
                      'الوصف',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      product['description'] ?? 'لا يوجد وصف متاح.',
                      style: TextStyle(color: Colors.grey[700], height: 1.5),
                    ),
                    const SizedBox(height: 24),

                    // الخصائص المتغيرة (Variants)
                    if (product['variants'] != null &&
                        product['variants'].isNotEmpty) ...[
                      Text(
                        'الخيارات المتاحة',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8.0,
                        children: (product['variants'] as List).map((variant) {
                          final isSelected =
                              productController.selectedVariant['id'] ==
                              variant['id'];
                          return ChoiceChip(
                            label: Text(
                              '${variant['attributeValue']} (+${variant['additionalPrice']} ريال)',
                            ),
                            selected: isSelected,
                            selectedColor: const Color(
                              0xFF6366F1,
                            ).withOpacity(0.2),
                            labelStyle: TextStyle(
                              color: isSelected
                                  ? const Color(0xFF6366F1)
                                  : Colors.black,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                            onSelected: (selected) {
                              if (selected) {
                                productController.selectVariant(variant);
                              }
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // الكمية
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'الكمية',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove),
                                onPressed: productController.decrementQuantity,
                              ),
                              Text(
                                '${productController.quantity.value}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add),
                                onPressed: productController.incrementQuantity,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 100), // مساحة للزر السفلي
                  ],
                ),
              ),
            ],
          ),
        );
      }),

      // أزرار الإضافة للسلة والشراء المباشر
      bottomSheet: Obx(() {
        if (productController.isLoading.value ||
            productController.currentProduct.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.all(16),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'الإجمالي:',
                    style: GoogleFonts.cairo(fontSize: 16, color: Colors.grey[700]),
                  ),
                  Text(
                    '${productController.totalPrice} ريال',
                    style: GoogleFonts.cairo(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF6366F1),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        final product = productController.currentProduct;
                        cartController.addToCart(
                          Map<String, dynamic>.from(product),
                          Map<String, dynamic>.from(productController.selectedVariant),
                          productController.quantity.value,
                        );
                      },
                      icon: const Icon(Icons.add_shopping_cart, color: Color(0xFF6366F1)),
                      label: Text(
                        'إضافة للسلة',
                        style: GoogleFonts.cairo(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF6366F1),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF6366F1)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final product = productController.currentProduct;
                        final store = product['store'] ?? {};
                        final whatsapp = store['whatsappNumber'] ?? '';
                        
                        if (whatsapp.isEmpty) {
                          Get.snackbar('تنبيه', 'رقم واتساب التاجر غير متوفر');
                          return;
                        }

                        // 1. تسجيل الطلب (Lead) في النظام
                        final success = await productController.createLead(
                          product['id'],
                          productController.quantity.value,
                          productController.selectedVariant,
                        );

                        if (!success) {
                          Get.snackbar('تنبيه', 'فشل تسجيل الطلب في النظام، ولكن يمكنك التواصل عبر واتساب');
                        }

                        // 2. فتح الواتساب
                        final message = 'مرحباً، أريد شراء هذا المنتج:\n'
                            'اسم المنتج: ${product['name']}\n'
                            'السعر: ${productController.totalPrice} ريال\n'
                            'الكمية: ${productController.quantity.value}';
                        
                        final url = 'https://wa.me/$whatsapp?text=${Uri.encodeComponent(message)}';
                        
                        final Uri uri = Uri.parse(url);
                        try {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        } catch (e) {
                          Get.snackbar('تنبيه', 'تعذر فتح تطبيق واتساب. تأكد من تثبيته على جهازك.');
                        }
                      },
                      icon: const Icon(Icons.phone_android, color: Colors.white),
                      label: Text(
                        'شراء الآن',
                        style: GoogleFonts.cairo(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }
}
