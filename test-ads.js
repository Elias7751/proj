async function testAds() {
    try {
        // 1. تسجيل الدخول كصاحب متجر (Admin في حالتنا)
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

        // 2. طلب إعلان
        const createRes = await fetch('http://localhost:5000/api/v1/ads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                storeId: "412a8b56-8362-462b-a8b1-107b4dde8ba4", // ID متجر الشيباني
                title: "إعلان مطعم الشيباني",
                image: "https://example.com/ad-banner.jpg",
                link: "/stores/al-shaibani-restaurant",
                placement: "home_banner",
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)) // لمدة أسبوع
            })
        });
        const createData = await createRes.json();
        console.log('Create Ad Response:', createData);

        const adId = createData.data.id;

        // 3. الموافقة على الإعلان (Admin)
        const approveRes = await fetch(`http://localhost:5000/api/v1/ads/${adId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: "active"
            })
        });
        const approveData = await approveRes.json();
        console.log('Approve Ad Response:', approveData);

        // 4. جلب الإعلانات في الصفحة الرئيسية (سيزيد عدد المشاهدات)
        const getAdsRes = await fetch('http://localhost:5000/api/v1/ads/placements/home_banner');
        const getAdsData = await getAdsRes.json();
        console.log('Get Ads Response:', getAdsData);

        // 5. تسجيل نقرة على الإعلان
        const clickRes = await fetch(`http://localhost:5000/api/v1/ads/${adId}/click`, {
            method: 'POST'
        });
        const clickData = await clickRes.json();
        console.log('Click Ad Response:', clickData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAds();
