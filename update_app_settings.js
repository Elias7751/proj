const fs = require('fs');
let code = fs.readFileSync('mobile/store_owner_app/lib/features/store_settings/screens/app_settings_screen.dart', 'utf8');

code = code.replace(
    "ListTile(\n                  leading: const Icon(Icons.support_agent, color: Colors.indigo),",
    "ListTile(\n                  leading: const Icon(Icons.forum, color: Colors.indigo),\n                  title: Text('تذاكر الدعم الفني', style: GoogleFonts.cairo()),\n                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),\n                  onTap: () {\n                    Get.toNamed(Routes.SUPPORT);\n                  },\n                ),\n                const Divider(height: 1),\n                ListTile(\n                  leading: const Icon(Icons.support_agent, color: Colors.green),"
);

fs.writeFileSync('mobile/store_owner_app/lib/features/store_settings/screens/app_settings_screen.dart', code);
console.log('Updated app_settings_screen.dart');
