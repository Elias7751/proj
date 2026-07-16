async function testCoupon() {
    try {
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

        // إنشاء كوبون
        const createRes = await fetch('http://localhost:5000/api/v1/offers/coupons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: "WELCOME2026",
                discountType: "percentage",
                discountValue: 10, // 10%
                maxDiscount: 2000,
                minOrderAmount: 5000,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // بعد شهر
                usageLimit: 100
            })
        });
        const createData = await createRes.json();
        console.log('Create Coupon Response:', createData);

        // التحقق من الكوبون
        const validateRes = await fetch('http://localhost:5000/api/v1/offers/coupons/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: "WELCOME2026",
                orderAmount: 15000
            })
        });
        const validateData = await validateRes.json();
        console.log('Validate Coupon Response:', validateData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testCoupon();
