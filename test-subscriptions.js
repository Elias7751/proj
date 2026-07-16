async function testSubscriptions() {
    try {
        // 1. تسجيل الدخول كـ Admin لإنشاء الباقة
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

        // 2. إنشاء باقة ذهبية
        const createPlanRes = await fetch('http://localhost:5000/api/v1/plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                nameAr: "الباقة الذهبية",
                nameEn: "Gold Plan",
                monthlyPrice: 5000,
                yearlyPrice: 50000,
                maxProducts: -1, // غير محدود
                commissionRate: 3.00,
                freeAdsCount: 5,
                hasAdvancedReports: true,
                hasCustomColors: true,
                hasCustomDomain: true,
                hasPrioritySupport: true,
                hasSearchPriority: true
            })
        });
        const createPlanData = await createPlanRes.json();
        console.log('Create Plan Response:', createPlanData);

        const planId = createPlanData.data.id;

        // 3. الاشتراك في الباقة (صاحب المتجر هو نفسه الـ Admin في حالتنا للاختبار)
        const subscribeRes = await fetch('http://localhost:5000/api/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                storeId: "412a8b56-8362-462b-a8b1-107b4dde8ba4", // ID متجر الشيباني
                planId: planId,
                billingCycle: "yearly"
            })
        });
        const subscribeData = await subscribeRes.json();
        console.log('Subscribe Response:', subscribeData);

        // 4. جلب اشتراكي الحالي
        const getMySubRes = await fetch('http://localhost:5000/api/v1/subscriptions/my', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const getMySubData = await getMySubRes.json();
        console.log('Get My Subscription Response:', getMySubData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testSubscriptions();
