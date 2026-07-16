async function testAdmin() {
    try {
        // 1. تسجيل الدخول كـ Admin
        const adminLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777000000', // Admin
                password: 'adminpassword'
            })
        });
        const adminLoginData = await adminLoginRes.json();
        const adminToken = adminLoginData.data.token;

        // 2. جلب المستخدمين
        const usersRes = await fetch('http://localhost:5000/api/v1/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const usersData = await usersRes.json();
        console.log('Admin Get Users Response:', usersData);

        // 3. جلب المتاجر
        const storesRes = await fetch('http://localhost:5000/api/v1/admin/stores', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const storesData = await storesRes.json();
        console.log('Admin Get Stores Response:', JSON.stringify(storesData, null, 2));

        // 4. جلب الطلبات
        const ordersRes = await fetch('http://localhost:5000/api/v1/admin/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const ordersData = await ordersRes.json();
        console.log('Admin Get Orders Response:', JSON.stringify(ordersData, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testAdmin();
