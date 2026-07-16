async function testAnalytics() {
    try {
        // 1. تسجيل الدخول كـ Admin (وهو أيضاً صاحب متجر الشيباني في بيانات الاختبار)
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777000000', // Admin
                password: 'adminpassword'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        // 2. جلب ملخص تحليلات المتجر
        const storeSummaryRes = await fetch('http://localhost:5000/api/v1/analytics/store/summary', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const storeSummaryData = await storeSummaryRes.json();
        console.log('Store Summary Response:', storeSummaryData);

        // 3. جلب أكثر المنتجات مبيعاً للمتجر
        const topProductsRes = await fetch('http://localhost:5000/api/v1/analytics/store/top-products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const topProductsData = await topProductsRes.json();
        console.log('Top Products Response:', JSON.stringify(topProductsData, null, 2));

        // 4. جلب ملخص تحليلات المنصة (Admin)
        const adminSummaryRes = await fetch('http://localhost:5000/api/v1/analytics/admin/summary', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const adminSummaryData = await adminSummaryRes.json();
        console.log('Admin Summary Response:', adminSummaryData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAnalytics();
