# تقدم تطبيق التاجر (Store Owner App Progress)

هذا الملف يتتبع ما تم إنجازه وما هو متبقي في تطبيق التاجر (Flutter).

## 🟢 ما تم إنجازه (Completed)
1. **تهيئة المشروع:**
   - إنشاء مشروع Flutter `store_owner_app`.
   - إضافة المكتبات الأساسية (`get`, `dio`, `shared_preferences`, وغيرها).
   - إعداد هيكلية المجلدات و `main.dart` مع الثيم (اللون الأزرق).
2. **المصادقة (Auth):**
   - إنشاء `ApiClient` و `AuthController`.
   - شاشة تسجيل الدخول `LoginScreen`.
   - شاشة التسجيل كتاجر `RegisterStoreScreen` (إنشاء مستخدم + متجر).
3. **لوحة التحكم (Dashboard):**
   - إنشاء `DashboardController` لجلب الإحصائيات.
   - شاشة لوحة التحكم `DashboardScreen` مع القائمة الجانبية (Drawer) وعرض ملخص المبيعات والطلبات.
4. **المنتجات (Products):**
   - إنشاء `ProductController` لإدارة المنتجات.
   - شاشة قائمة المنتجات `ProductsScreen` مع إمكانية التعديل والحذف.
   - شاشة إضافة/تعديل منتج `AddEditProductScreen`.
5. **الطلبات (Orders):**
   - إنشاء `OrderController` لجلب طلبات المتجر وتحديث حالتها.
   - شاشة قائمة الطلبات `OrdersScreen`.
   - شاشة تفاصيل الطلب `OrderDetailsScreen` مع إمكانية تغيير الحالة (قيد التجهيز، في الطريق، تم التوصيل).

6. **إعدادات المتجر والاشتراكات (Store Settings & Subscriptions):**
   - إنشاء `SettingsController` لجلب وتحديث بيانات المتجر والاشتراكات.
   - شاشة إعدادات المتجر `StoreSettingsScreen` لتعديل الاسم والوصف والحد الأدنى للطلب.
   - شاشة الاشتراكات `SubscriptionsScreen` لعرض الباقة الحالية والباقات المتاحة للترقية.

## 🟡 قيد التنفيذ (In Progress)
- لا يوجد.

## 🔴 المتبقي (Remaining)
- لا يوجد (تطبيق التاجر مكتمل كأساس).
