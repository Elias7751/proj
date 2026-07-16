const fs = require('fs');
const path = require('path');

const pages = [
    { name: 'Customers', title: 'العملاء' },
    { name: 'Products', title: 'المنتجات' },
    { name: 'Orders', title: 'الطلبات (Leads)' },
    { name: 'Notifications', title: 'الإشعارات' },
    { name: 'Reports', title: 'التقارير' },
    { name: 'Logs', title: 'سجل النشاطات' },
    { name: 'Admins', title: 'المشرفين والصلاحيات' },
    { name: 'Settings', title: 'إعدادات النظام' }
];

pages.forEach(page => {
    const content = `import React from 'react';

const ${page.name} = () => {
  return (
    <div>
      <h1>${page.title}</h1>
      <div className="glass-card">
        <p>جاري برمجة هذه الصفحة...</p>
      </div>
    </div>
  );
};

export default ${page.name};
`;
    fs.writeFileSync(path.join(__dirname, 'admin_panel', 'src', 'pages', `${page.name}.jsx`), content, 'utf8');
});

console.log('Files created successfully in UTF-8');
