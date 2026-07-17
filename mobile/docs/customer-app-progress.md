# تقدم تطبيق العميل (Customer App Progress)

هذا الملف يتتبع ما تم إنجازه وما هو متبقي في تطبيق العميل (Flutter).

## 🟢 ما تم إنجازه (Completed)
1. **تهيئة المشروع:**
   - إنشاء مشروع Flutter `customer_app`.
   - إضافة المكتبات الأساسية (`get`, `dio`, `shared_preferences`, `google_fonts`).
   - إعداد هيكلية المجلدات (Features, Core, Data).
   - إعداد `main.dart` مع الثيم (الألوان والخطوط العربية).
   - إعداد نظام التوجيه (Routing) باستخدام `GetX`.
2. **تصميم الشاشات الأساسية (UI Only):**
   - شاشة تسجيل الدخول (`LoginScreen`).
   - شاشة إنشاء الحساب (`RegisterScreen`).
   - الصفحة الرئيسية (`HomeScreen`) مع شريط التنقل السفلي.
3. **ربط المصادقة بالـ API (Auth Integration):**
   - إعداد `ApiClient` للاتصال بالخادم (`Dio`).
   - إنشاء `AuthController` لإدارة حالة تسجيل الدخول والتسجيل.
   - حفظ الـ Token باستخدام `SharedPreferences`.
   - ربط شاشات تسجيل الدخول والتسجيل مع الـ Controller.

4. **الرئيسية والتصنيفات (Home & Categories):**
   - إنشاء `HomeController` لجلب البيانات من الـ API.
   - جلب الإعلانات (Banners)، التصنيفات، والمتاجر المميزة وعرضها في `HomeScreen`.
5. **المتاجر والمنتجات (Stores & Products):**
   - إنشاء `StoreController` و `ProductController`.
   - شاشة قائمة المتاجر `StoresScreen` (مع الفلترة والبحث).
   - شاشة تفاصيل المتجر والمنتجات `StoreDetailsScreen`.
   - شاشة تفاصيل المنتج `ProductDetailsScreen` (مع الخصائص المتغيرة).

6. **السلة والطلبات (Cart & Orders):**
   - إنشاء `CartController` لإدارة السلة محلياً وإرسال الطلب للـ API.
   - شاشة السلة `CartScreen` مع إمكانية إتمام الطلب وتوليد رابط واتساب.
   - إنشاء `OrderController` لجلب الطلبات السابقة.
   - شاشة طلباتي `OrdersScreen` مع تتبع حالة الطلب.

7. **الملف الشخصي والدعم الفني (Profile & Support):**
   - إنشاء `ProfileController` لإدارة بيانات المستخدم وتذاكر الدعم الفني.
   - شاشة حسابي `ProfileScreen` لعرض البيانات وتسجيل الخروج.
   - شاشة تذاكر الدعم الفني `TicketsScreen` لعرض التذاكر السابقة.
   - شاشة إنشاء تذكرة جديدة `CreateTicketScreen`.

## 🟡 قيد التنفيذ (In Progress)
- لا يوجد.

## 🔴 المتبقي (Remaining)
- لا يوجد (تطبيق العميل مكتمل كأساس).
