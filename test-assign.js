async function testAssign() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '777000000',
                password: 'adminpassword'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        const assignRes = await fetch('http://localhost:5000/api/v1/delivery/assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: "4de73cf2-d38d-4840-b9b3-cba2f5dc523d",
                driverId: "b136eb82-13d6-411e-b3f0-4cb5540656cb",
                deliveryFee: 1500.00
            })
        });

        const assignData = await assignRes.json();
        console.log('Response:', assignData);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAssign();
