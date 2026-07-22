const fs = require('fs');
let code = fs.readFileSync('admin_panel/src/App.jsx', 'utf8');

code = code.replace(
    "import Tickets from './pages/Tickets';",
    "import Tickets from './pages/Tickets';\nimport Reviews from './pages/Reviews';"
);

code = code.replace(
    '<Route path="/tickets" element={<Tickets />} />',
    '<Route path="/tickets" element={<Tickets />} />\n            <Route path="/reviews" element={<Reviews />} />'
);

fs.writeFileSync('admin_panel/src/App.jsx', code);
console.log('Updated App.jsx');
