const fs = require('fs');
let code = fs.readFileSync('admin_panel/src/App.jsx', 'utf8');

code = code.replace(
    "import Reviews from './pages/Reviews';",
    "import Reviews from './pages/Reviews';\nimport Coupons from './pages/Coupons';"
);

code = code.replace(
    '<Route path="/reviews" element={<Reviews />} />',
    '<Route path="/reviews" element={<Reviews />} />\n            <Route path="/coupons" element={<Coupons />} />'
);

fs.writeFileSync('admin_panel/src/App.jsx', code);
console.log('Updated App.jsx');
