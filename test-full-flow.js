// ------------------------------------------------------------
// Full‑flow integration test – الآن مع تحديث حالة المندوب
// ------------------------------------------------------------
const API_URL = 'http://localhost:5000/api/v1';

// Helper to generate a unique phone number for each run
function randomPhone() {
    // Generates a 9‑digit number starting with 770
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `770${suffix}`;
}

// Helper to generate a random suffix for unique names
function randomSuffix() {
    // 4‑digit random number
    return Math.floor(1000 + Math.random() * 9000);
}

/**
 * Helper – perform a request against the API.
 */
async function fetchApi(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify({ status: response.status, data }));
    }
    return data;
}

/**
 * Run the whole flow step‑by‑step.
 */
async function runTests() {
    console.log('🚀 Starting Full Flow Test...\n');

    try {
        // --------------------------------------------------------
        // 1️⃣ Register a Customer
        // --------------------------------------------------------
        console.log('1️⃣ Registering Customer...');
        const custRes = await fetchApi('/auth/register', 'POST', {
            fullName: 'Test Customer',
            phone: randomPhone(),
            password: 'password123',
            role: 'customer',
        });
        const customerToken = custRes.data.token;
        console.log('✅ Customer registered.\n');

        // --------------------------------------------------------
        // 2️⃣ Register an Admin & create a Category
        // --------------------------------------------------------
        console.log('2️⃣ Registering Admin...');
        const adminRes = await fetchApi('/auth/register', 'POST', {
            fullName: 'Test Admin',
            phone: randomPhone(),
            password: 'password123',
            role: 'admin',
        });
        const adminToken = adminRes.data.token;

        console.log('2️⃣ Creating Category...');
        const catRes = await fetchApi('/categories', 'POST', {
            // أسماء فريدة باستخدام randomSuffix
            nameAr: `تصنيف عام ${randomSuffix()}`,
            nameEn: `General Category ${randomSuffix()}`,
            description: 'General Category',
            isActive: true,
        }, adminToken);
        const categoryId = catRes.data.id;
        console.log(`✅ Category created (ID: ${categoryId}).\n`);

        // --------------------------------------------------------
        // 2.5️⃣ Register a Store Owner
        // --------------------------------------------------------
        console.log('2.5️⃣ Registering Store Owner...');
        const ownerRes = await fetchApi('/auth/register', 'POST', {
            fullName: 'Test Store Owner',
            phone: randomPhone(),
            password: 'password123',
            role: 'store_owner',
        });
        const storeOwnerToken = ownerRes.data.token;
        console.log('✅ Store Owner registered.\n');

        // --------------------------------------------------------
        // 3️⃣ Create a Store (needs whatsappNumber)
        // --------------------------------------------------------
        console.log('3️⃣ Creating Store...');
        const storeRes = await fetchApi('/stores', 'POST', {
            nameAr: `متجر الاختبار ${randomSuffix()}`,
            nameEn: `Test Store ${randomSuffix()}`,
            description: 'Test Description',
            categoryId,
            whatsappNumber: randomPhone(), // رقم فريد للواتساب
        }, storeOwnerToken);
        const storeId = storeRes.data.id;
        console.log(`✅ Store created (ID: ${storeId}).\n`);

        // --------------------------------------------------------
        // 4️⃣ Add a Product (include stock)
        // --------------------------------------------------------
        console.log('4️⃣ Adding Product...');
        const prodRes = await fetchApi(`/stores/${storeId}/products`, 'POST', {
            name: 'Test Product',
            description: 'Product Description',
            price: 1000,
            stock: 100,
            categoryId,
        }, storeOwnerToken);
        const productId = prodRes.data.id;
        console.log(`✅ Product added (ID: ${productId}).\n`);

        // --------------------------------------------------------
        // 5️⃣ Register a Delivery Driver (auth role)
        // --------------------------------------------------------
        console.log('5️⃣ Registering Delivery Driver (auth)...');
        const delAuthRes = await fetchApi('/auth/register', 'POST', {
            fullName: 'Test Delivery',
            phone: randomPhone(),
            password: 'password123',
            role: 'delivery',
        });
        const deliveryToken = delAuthRes.data.token;
        console.log('✅ Delivery driver authenticated.\n');

        // --------------------------------------------------------
        // 5️⃣ Register driver profile (creates pending_approval)
        // --------------------------------------------------------
        console.log('5️⃣ Registering Driver Profile...');
        const driverProfileRes = await fetchApi('/delivery/drivers/register', 'POST', {
            vehicleType: 'car',
            vehiclePlateNumber: 'XYZ-123',
            cityId: null,
            areaId: null,
        }, deliveryToken);
        const driverId = driverProfileRes.data.id;
        console.log(`✅ Driver profile created (ID: ${driverId}).\n`);

        // --------------------------------------------------------
        // 5.5️⃣ Approve driver – change status to "available"
        // --------------------------------------------------------
        console.log('5.5️⃣ Approving Driver (setting status to available)...');
        await fetchApi('/delivery/drivers/status', 'PUT', { status: 'available' }, deliveryToken);
        console.log('✅ Driver status set to available.\n');

        // --------------------------------------------------------
        // 6️⃣ Add product to Cart (customer)
        // --------------------------------------------------------
        console.log('6️⃣ Adding Product to Cart...');
        await fetchApi('/cart', 'POST', { productId, quantity: 2 }, customerToken);
        console.log('✅ Product added to cart.\n');

        // --------------------------------------------------------
        // 7️⃣ Create Order (customer)
        // --------------------------------------------------------
        console.log('7️⃣ Creating Order...');
        const orderRes = await fetchApi('/orders', 'POST', {
            deliveryAddress: JSON.stringify({
                city: 'Sanaa',
                area: 'Hadda',
                street: "Hadda St",
            }),
            paymentMethod: 'cash_on_delivery',
        }, customerToken);
        const orderId = orderRes.data.order.id;
        console.log(`✅ Order created (ID: ${orderId}).\n`);

        // --------------------------------------------------------
        // 8️⃣ Assign Delivery (store owner)
        // --------------------------------------------------------
        console.log('8️⃣ Assigning Delivery...');
        await fetchApi('/delivery/assign', 'POST', {
            orderId,
            driverId,
            deliveryFee: 15,
        }, storeOwnerToken);
        console.log('✅ Delivery assigned.\n');

        // --------------------------------------------------------
        // 9️⃣ Driver updates Delivery status to "delivered"
        // --------------------------------------------------------
        console.log('9️⃣ Updating Delivery Status...');
        const myDeliveries = await fetchApi('/delivery/my', 'GET', null, deliveryToken);
        const deliveryId = myDeliveries.data[0].id;
        await fetchApi(`/delivery/${deliveryId}/status`, 'PUT', { status: 'delivered' }, deliveryToken);
        console.log('✅ Delivery status set to delivered.\n');

        // --------------------------------------------------------
        // 🎉 All steps passed
        // --------------------------------------------------------
        console.log('🎉 Full flow test completed successfully!');

    } catch (err) {
        console.error('❌ Test failed!');
        console.error(err.message);
    }
}

// Execute
runTests();