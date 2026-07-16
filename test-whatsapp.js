async function testWhatsAppLink() {
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

        const linkRes = await fetch('http://localhost:5000/api/v1/orders/4de73cf2-d38d-4840-b9b3-cba2f5dc523d/whatsapp-link', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const linkData = await linkRes.json();
        console.log('WhatsApp Link:', linkData.data.whatsappLink);
    } catch (error) {
        console.error('Error:', error);
    }
}

testWhatsAppLink();
