import 'package:get/get.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_store_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/auth/screens/pending_approval_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/products/screens/products_screen.dart';
import '../features/products/screens/add_edit_product_screen.dart';
import '../features/orders/screens/orders_screen.dart';
import '../features/orders/screens/order_details_screen.dart';
import '../features/store_settings/screens/store_settings_screen.dart';
import '../features/store_settings/screens/subscriptions_screen.dart';
import '../features/main/screens/main_screen.dart';
import '../features/offers_ads/screens/offers_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';
import '../features/splash/screens/splash_screen.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.SPLASH;

  static final routes = [
    GetPage(name: Routes.SPLASH, page: () => const SplashScreen()),
    GetPage(name: Routes.MAIN, page: () => const MainScreen()),
    GetPage(name: Routes.LOGIN, page: () => const LoginScreen()),
    GetPage(
      name: Routes.REGISTER_STORE,
      page: () => const RegisterStoreScreen(),
    ),
    GetPage(name: Routes.DASHBOARD, page: () => const DashboardScreen()),
    GetPage(name: Routes.PRODUCTS, page: () => const ProductsScreen()),
    GetPage(
      name: Routes.ADD_EDIT_PRODUCT,
      page: () => const AddEditProductScreen(),
    ),
    GetPage(name: Routes.ORDERS, page: () => const OrdersScreen()),
    GetPage(name: Routes.ORDER_DETAILS, page: () => const OrderDetailsScreen()),
    GetPage(
      name: Routes.STORE_SETTINGS,
      page: () => const StoreSettingsScreen(),
    ),
    GetPage(
      name: Routes.SUBSCRIPTIONS,
      page: () => const SubscriptionsScreen(),
    ),
    GetPage(name: Routes.OFFERS, page: () => const OffersScreen()),
    GetPage(name: Routes.ONBOARDING, page: () => const OnboardingScreen()),
    GetPage(name: Routes.PENDING_APPROVAL, page: () => const PendingApprovalScreen()),
    GetPage(name: Routes.NOTIFICATIONS, page: () => const NotificationsScreen()),
  ];
}
