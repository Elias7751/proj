async function testReview() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777123456', // العميل
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        // تقييم المتجر
        const storeReviewRes = await fetch('http://localhost:5000/api/v1/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: "4de73cf2-d38d-4840-b9b3-cba2f5dc523d",
                targetType: "store",
                targetId: "412a8b56-8362-462b-a8b1-107b4dde8ba4", // ID متجر الشيباني
                rating: 5,
                comment: "مطعم ممتاز والأكل وصل ساخن ولذيذ جداً!"
            })
        });
        const storeReviewData = await storeReviewRes.json();
        console.log('Store Review Response:', storeReviewData);

        // تقييم المنتج
        const productReviewRes = await fetch('http://localhost:5000/api/v1/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: "4de73cf2-d38d-4840-b9b3-cba2f5dc523d",
                targetType: "product",
                targetId: "64ff5872-382e-437f-a1d9-a5d770cbafaa", // ID سلته لحم بلدي
                rating: 4,
                comment: "السلته ممتازة ولكن السحاوق كان قليل شوية"
            })
        });
        const productReviewData = await productReviewRes.json();
        console.log('Product Review Response:', productReviewData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testReview();
