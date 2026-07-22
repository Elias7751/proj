const fs = require('fs');
let code = fs.readFileSync('admin_panel/src/components/Sidebar.jsx', 'utf8');

code = code.replace(
    "import { LayoutDashboard, Store, Users, Settings, LogOut, CreditCard, ShoppingBag, Package, Bell, Shield, FileText, Activity, Star, Image, ListTree, MapPin, MessageCircle, StarHalf } from 'lucide-react';",
    "import { LayoutDashboard, Store, Users, Settings, LogOut, CreditCard, ShoppingBag, Package, Bell, Shield, FileText, Activity, Star, Image, ListTree, MapPin, MessageCircle, StarHalf, Tag } from 'lucide-react';"
);

code = code.replace(
    '                <NavLink to="/reviews" className={({ isActive }) => isActive ? \'nav-link active\' : \'nav-link\'}>\n                    <StarHalf size={20} />\n                    <span>التقييمات والمراجعات</span>\n                </NavLink>\n            </nav>',
    '                <NavLink to="/reviews" className={({ isActive }) => isActive ? \'nav-link active\' : \'nav-link\'}>\n                    <StarHalf size={20} />\n                    <span>التقييمات والمراجعات</span>\n                </NavLink>\n                <NavLink to="/coupons" className={({ isActive }) => isActive ? \'nav-link active\' : \'nav-link\'}>\n                    <Tag size={20} />\n                    <span>الكوبونات والعروض</span>\n                </NavLink>\n            </nav>'
);

fs.writeFileSync('admin_panel/src/components/Sidebar.jsx', code);
console.log('Updated Sidebar.jsx');
