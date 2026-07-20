import 'package:get/get.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/home/screens/sub_categories_screen.dart';
import '../features/stores/screens/stores_screen.dart';
import '../features/stores/screens/store_details_screen.dart';
import '../features/products/screens/product_details_screen.dart';
import '../features/cart/screens/cart_screen.dart';
import '../features/cart/screens/checkout_screen.dart';
import '../features/orders/screens/orders_screen.dart';
import '../features/orders/screens/order_details_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/profile/screens/reviews_screen.dart';
import '../features/profile/screens/settings_screen.dart';
import '../features/profile/screens/tickets_screen.dart';
import '../features/profile/screens/create_ticket_screen.dart';
import '../features/splash/screens/splash_screen.dart';
import '../features/main/screens/main_screen.dart';
import '../features/favorites/screens/favorites_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.SPLASH;

  static final routes = [
    GetPage(name: Routes.SPLASH, page: () => const SplashScreen()),
    GetPage(name: Routes.MAIN, page: () => const MainScreen()),
    GetPage(name: Routes.LOGIN, page: () => const LoginScreen()),
    GetPage(name: Routes.REGISTER, page: () => const RegisterScreen()),
    GetPage(name: Routes.HOME, page: () => const HomeScreen()),
    GetPage(name: Routes.SUB_CATEGORIES, page: () => const SubCategoriesScreen()),
    GetPage(name: Routes.STORES, page: () => const StoresScreen()),
    GetPage(name: Routes.STORE_DETAILS, page: () => const StoreDetailsScreen()),
    GetPage(
      name: Routes.PRODUCT_DETAILS,
      page: () => const ProductDetailsScreen(),
    ),
    GetPage(name: Routes.CART, page: () => const CartScreen()),
    GetPage(name: Routes.CHECKOUT, page: () => const CheckoutScreen()),
    GetPage(name: Routes.ORDERS, page: () => const OrdersScreen()),
    GetPage(name: Routes.ORDER_DETAILS, page: () => const OrderDetailsScreen()),
    GetPage(name: Routes.PROFILE, page: () => const ProfileScreen()),
    GetPage(name: Routes.FAVORITES, page: () => const FavoritesScreen()),
    GetPage(name: Routes.REVIEWS, page: () => const ReviewsScreen()),
    GetPage(name: Routes.SETTINGS, page: () => const SettingsScreen()),
    GetPage(name: Routes.TICKETS, page: () => const TicketsScreen()),
    GetPage(name: Routes.CREATE_TICKET, page: () => const CreateTicketScreen()),
    GetPage(name: Routes.NOTIFICATIONS, page: () => const NotificationsScreen()),
  ];
}
