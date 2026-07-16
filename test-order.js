async function testOrder() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777123456',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        const orderRes = await fetch('http://localhost:5000/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                deliveryAddress: {
                    city: "Sanaa",
                    area: "Tahrir",
                    street: "Ali Abdulmoghni St",
                    details: "Next to Post Office"
                },
                paymentMethod: "cash_on_delivery",
                notes: "Please deliver hot"
            })
        });

        const orderData = await orderRes.json();
        console.log('Response:', orderData);
    } catch (error) {
        console.error('Error:', error);
    }
}

testOrder();
