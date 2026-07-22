const fs = require('fs');
let code = fs.readFileSync('mobile/store_owner_app/lib/routes/app_pages.dart', 'utf8');

code = code.replace(
    "import '../features/splash/screens/splash_screen.dart';",
    "import '../features/splash/screens/splash_screen.dart';\nimport '../features/support/screens/support_screen.dart';\nimport '../features/support/screens/create_ticket_screen.dart';\nimport '../features/support/screens/ticket_details_screen.dart';"
);

code = code.replace(
    "GetPage(name: Routes.APP_SETTINGS, page: () => const AppSettingsScreen()),",
    "GetPage(name: Routes.APP_SETTINGS, page: () => const AppSettingsScreen()),\n    GetPage(name: Routes.SUPPORT, page: () => const SupportScreen()),\n    GetPage(name: Routes.CREATE_TICKET, page: () => const CreateTicketScreen()),\n    GetPage(name: Routes.TICKET_DETAILS, page: () => const TicketDetailsScreen()),"
);

fs.writeFileSync('mobile/store_owner_app/lib/routes/app_pages.dart', code);
console.log('Updated app_pages.dart');
