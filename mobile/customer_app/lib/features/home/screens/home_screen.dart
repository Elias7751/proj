import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../../routes/app_pages.dart';
import '../../notifications/controllers/notification_controller.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeController homeController = Get.put(HomeController());

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF6366F1), Color(0xFF00897B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: const Text(
          'Sellink',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 24),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {},
          ),
          Obx(() {
            final notificationController = Get.put(NotificationController());
            return Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                  onPressed: () {
                    Get.toNamed(Routes.NOTIFICATIONS);
                  },
                ),
                if (notificationController.unreadCount.value > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '${notificationController.unreadCount.value}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
      body: Obx(() {
        if (homeController.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          );
        }

        return RefreshIndicator(
          onRefresh: homeController.fetchHomeData,
          color: const Color(0xFF6366F1),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // التصنيفات (في الأعلى)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'التصنيفات',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () => Get.toNamed(Routes.STORES), 
                      child: const Text('عرض الكل')
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 110,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  itemCount: homeController.categories.isEmpty
                      ? 5
                      : homeController.categories.length,
                  itemBuilder: (context, index) {
                    final isDummy = homeController.categories.isEmpty;
                    final category = isDummy ? {} : homeController.categories[index];
                    
                    final dummyNames = ['إلكترونيات', 'ملابس', 'عطور', 'أحذية', 'أخرى'];
                    final dummyIcons = [Icons.phone_android, Icons.checkroom, Icons.local_florist, Icons.shopping_bag, Icons.more_horiz];

                    return InkWell(
                      onTap: () {
                        if (!isDummy) {
                          Get.toNamed(
                            Routes.STORES,
                            arguments: {
                              'categoryId': category['id'],
                              'categoryName': category['nameAr']
                            },
                          );
                        }
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 85,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        child: Column(
                          children: [
                            Container(
                              height: 70,
                              width: 70,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: isDummy || category['image'] == null
                                  ? Icon(
                                      isDummy ? dummyIcons[index] : Icons.category,
                                      color: const Color(0xFF6366F1),
                                      size: 30,
                                    )
                                  : ClipOval(
                                      child: Image.network(
                                        category['image'],
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              isDummy ? dummyNames[index] : (category['nameAr'] ?? 'تصنيف'),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // مساحة الإعلانات (Banner)
              Container(
                height: 160,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                  image: DecorationImage(
                    image: homeController.ads.isNotEmpty
                        ? NetworkImage(homeController.ads[0]['image'])
                        : const NetworkImage(
                            'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
                          ) as ImageProvider,
                    fit: BoxFit.cover,
                  ),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.7),
                      ],
                    ),
                  ),
                  alignment: Alignment.bottomRight,
                  padding: const EdgeInsets.all(16),
                  child: const Text(
                    'عروض حصرية تصل إلى 50%',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),



              // العروض الترويجية
              Obx(() {
                if (homeController.offers.isEmpty) {
                  return const SizedBox.shrink();
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      child: Text(
                        'العروض الترويجية',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    SizedBox(
                      height: 140,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        itemCount: homeController.offers.length,
                        itemBuilder: (context, index) {
                          final offer = homeController.offers[index];
                          final store = offer['store'] ?? {};
                          final isPercentage = offer['discountType'] == 'percentage';
                          
                          return Container(
                            width: 280,
                            margin: const EdgeInsets.symmetric(horizontal: 8),
                            child: Card(
                              elevation: 3,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  gradient: LinearGradient(
                                    colors: [Colors.orange.shade400, Colors.red.shade500],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            offer['title'] ?? '',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            'خصم ${offer['discountValue']}${isPercentage ? '%' : ' ريال'}',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      offer['description'] ?? '',
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.9),
                                        fontSize: 12,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          store['nameAr'] ?? '',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        ElevatedButton(
                                          onPressed: () {
                                            Get.toNamed(
                                              '/store-details',
                                              arguments: {'slug': store['slug'], 'storeId': offer['storeId']},
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.white,
                                            foregroundColor: Colors.red.shade600,
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                          ),
                                          child: const Text('تسوق الآن', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                );
              }),

              // المتاجر المميزة
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'المتاجر المميزة',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () => Get.toNamed(Routes.STORES), 
                      child: const Text('عرض الكل')
                    ),
                  ],
                ),
              ),
              if (homeController.featuredStores.isEmpty)
                SizedBox(
                  height: 180,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    itemCount: 3,
                    itemBuilder: (context, index) {
                      return Container(
                        width: 140,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        child: Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF6366F1).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.storefront, color: Color(0xFF6366F1), size: 30),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'متجر تجريبي ${index + 1}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                )
              else
                SizedBox(
                  height: 180,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    itemCount: homeController.featuredStores.length,
                    itemBuilder: (context, index) {
                      final store = homeController.featuredStores[index];
                      return Container(
                        width: 140,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        child: Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: InkWell(
                            onTap: () {
                              Get.toNamed(
                                '/store-details',
                                arguments: {'slug': store['slug'], 'storeId': store['id']},
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF6366F1).withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.storefront, color: Color(0xFF6366F1), size: 30),
                                ),
                                const SizedBox(height: 12),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                  child: Text(
                                    store['nameAr'] ?? 'اسم المتجر',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.star, color: Colors.amber, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      store['rating']?.toString() ?? '5.0',
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              
              const SizedBox(height: 16),

              // المنتجات المميزة (5 نجوم)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'المنتجات المميزة',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        // الانتقال لصفحة المنتجات (يمكن إضافتها لاحقاً)
                      }, 
                      child: const Text('عرض الكل')
                    ),
                  ],
                ),
              ),
              if (homeController.featuredProducts.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Center(child: Text('لا توجد منتجات مميزة حالياً')),
                )
              else
                SizedBox(
                  height: 200,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    itemCount: homeController.featuredProducts.length,
                    itemBuilder: (context, index) {
                      final product = homeController.featuredProducts[index];
                      return Container(
                        width: 150,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        child: Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: InkWell(
                            onTap: () {
                              Get.toNamed(
                                '/product-details',
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
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '${product['price']} ريال',
                                            style: const TextStyle(
                                              color: Color(0xFF6366F1),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              const Icon(Icons.star, color: Colors.amber, size: 12),
                                              Text(
                                                product['rating']?.toString() ?? '5.0',
                                                style: const TextStyle(fontSize: 10),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      );
    }),
    );
  }
}
