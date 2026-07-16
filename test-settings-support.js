async function testSettingsAndSupport() {
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

        // 2. تحديث الإعدادات (Admin)
        const updateSettingsRes = await fetch('http://localhost:5000/api/v1/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                platformNameAr: "السوق اليمني",
                platformNameEn: "Yemeni Market",
                defaultCommissionRate: 5.0,
                isMaintenanceMode: false,
                contactEmail: "support@yemenimarket.com"
            })
        });
        const updateSettingsData = await updateSettingsRes.json();
        console.log('Update Settings Response:', updateSettingsData);

        // 3. جلب الإعدادات (Public)
        const getSettingsRes = await fetch('http://localhost:5000/api/v1/settings');
        const getSettingsData = await getSettingsRes.json();
        console.log('Get Settings Response:', getSettingsData);

        // 4. تسجيل الدخول كعميل
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

        // 5. إنشاء تذكرة دعم (Customer)
        const createTicketRes = await fetch('http://localhost:5000/api/v1/support/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                title: "مشكلة في الدفع",
                description: "حاولت الدفع عبر واتساب ولكن الرابط لم يعمل.",
                priority: "high"
            })
        });
        const createTicketData = await createTicketRes.json();
        console.log('Create Ticket Response:', createTicketData);

        const ticketId = createTicketData.data.id;

        // 6. الرد على التذكرة (Admin)
        const replyTicketRes = await fetch(`http://localhost:5000/api/v1/support/tickets/${ticketId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                message: "نعتذر عن ذلك، جاري فحص المشكلة وسيتم حلها في أقرب وقت."
            })
        });
        const replyTicketData = await replyTicketRes.json();
        console.log('Reply Ticket Response:', replyTicketData);

        // 7. جلب تفاصيل التذكرة (Customer)
        const getTicketRes = await fetch(`http://localhost:5000/api/v1/support/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        const getTicketData = await getTicketRes.json();
        console.log('Get Ticket Details Response:', JSON.stringify(getTicketData, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testSettingsAndSupport();
