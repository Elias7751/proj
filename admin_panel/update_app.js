const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
    "import Cities from './pages/Cities';",
    "import Cities from './pages/Cities';\nimport Tickets from './pages/Tickets';"
);

code = code.replace(
    '<Route path="/legal-settings" element={<LegalSettings />} />',
    '<Route path="/legal-settings" element={<LegalSettings />} />\n            <Route path="/tickets" element={<Tickets />} />'
);

fs.writeFileSync('src/App.jsx', code);
console.log('Updated App.jsx');
