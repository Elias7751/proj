async function testNotifications() {
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

        // 2. إرسال إشعار للعميل (777123456)
        const sendRes = await fetch('http://localhost:5000/api/v1/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                userId: "9bdefda5-e66b-4436-adba-20cf2a7f3317", // ID العميل
                title: "مرحباً بك!",
                message: "أهلاً بك في منصتنا، نتمنى لك تجربة تسوق ممتعة.",
                type: "system"
            })
        });
        const sendData = await sendRes.json();
        console.log('Send Notification Response:', sendData);

        // 3. تسجيل الدخول كعميل
        const userLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777123456', // العميل
                password: 'password123'
            })
        });
        const userLoginData = await userLoginRes.json();
        const userToken = userLoginData.data.token;

        // 4. جلب إشعارات العميل
        const getRes = await fetch('http://localhost:5000/api/v1/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        const getData = await getRes.json();
        console.log('Get Notifications Response:', getData);

        // 5. جلب عدد الإشعارات غير المقروءة
        const countRes = await fetch('http://localhost:5000/api/v1/notifications/unread-count', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        const countData = await countRes.json();
        console.log('Unread Count Response:', countData);

        // 6. تحديد الإشعار كمقروء
        const notifId = getData.data[0].id;
        const readRes = await fetch(`http://localhost:5000/api/v1/notifications/${notifId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        const readData = await readRes.json();
        console.log('Mark as Read Response:', readData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testNotifications();
