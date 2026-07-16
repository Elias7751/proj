async function testDeliverOrder() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777999888', // رقم المندوب
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        const updateRes = await fetch('http://localhost:5000/api/v1/delivery/db4cc6c8-0481-45aa-96de-189791d27d2f/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: "delivered",
                notes: "تم تسليم الطلب للعميل بنجاح"
            })
        });

        const updateData = await updateRes.json();
        console.log('Delivery Update Response:', updateData);
    } catch (error) {
        console.error('Error:', error);
    }
}

testDeliverOrder();
