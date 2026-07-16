const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const Store = require('./src/modules/stores/store.model');
const Product = require('./src/modules/products/product.model');
const Category = require('./src/modules/categories/category.model');
const Order = require('./src/modules/orders/order.model');
const OrderItem = require('./src/modules/orders/orderItem.model');
const bcrypt = require('bcryptjs');

async function seedDummyData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database. Starting dummy data seeding...');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Ensure Category exists
        let category = await Category.findOne();
        if (!category) {
            category = await Category.create({
                nameAr: 'إلكترونيات',
                nameEn: 'Electronics',
                slug: 'electronics',
                icon: 'laptop'
            });
            console.log('Created default category.');
        }

        // 2. Create 10 Customers
        const customers = [];
        for (let i = 1; i <= 10; i++) {
            const phone = `7710000${i.toString().padStart(2, '0')}`;
            // Check if exists
            let user = await User.findOne({ where: { phone } });
            if (!user) {
                user = await User.create({
                    fullName: `عميل تجريبي ${i}`,
                    email: `customer${i}@test.com`,
                    password: hashedPassword,
                    phone,
                    role: 'customer',
                    status: 'active'
                });
            }
            customers.push(user);
        }
        console.log('Created 10 customers.');

        // 3. Create 10 Merchants & Stores
        const stores = [];
        for (let i = 1; i <= 10; i++) {
            const phone = `7720000${i.toString().padStart(2, '0')}`;
            let merchant = await User.findOne({ where: { phone } });
            if (!merchant) {
                merchant = await User.create({
                    fullName: `تاجر تجريبي ${i}`,
                    email: `merchant${i}@test.com`,
                    password: hashedPassword,
                    phone,
                    role: 'store_owner',
                    status: 'active'
                });
            }

            let store = await Store.findOne({ where: { ownerId: merchant.id } });
            if (!store) {
                store = await Store.create({
                    nameAr: `متجر الأمل ${i}`,
                    nameEn: `Hope Store ${i}`,
                    slug: `hope-store-${i}`,
                    description: `وصف متجر الأمل التجريبي رقم ${i}`,
                    whatsappNumber: phone,
                    status: 'active',
                    ownerId: merchant.id,
                    categoryId: category.id
                });
            }
            stores.push(store);
        }
        console.log('Created 10 merchants and stores.');

        // 4. Create 2 Products for each Store
        const products = [];
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            for (let j = 1; j <= 2; j++) {
                const productName = `منتج تجريبي ${j} من ${store.nameAr}`;
                let product = await Product.findOne({ where: { name: productName, storeId: store.id } });
                if (!product) {
                    product = await Product.create({
                        name: productName,
                        description: `هذا وصف تجريبي للمنتج ${j} التابع لمتجر ${store.nameAr}`,
                        price: (100 * (i + 1) + j * 10).toFixed(2),
                        stock: 50,
                        unit: 'قطعة',
                        status: 'active',
                        storeId: store.id,
                        categoryId: category.id
                    });
                }
                products.push(product);
            }
        }
        console.log('Created 20 products.');

        // 5. Create 1 Order (Lead) for each Customer
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            const product = products[i % products.length]; // Distribute products
            const store = stores[i % stores.length];

            const orderNumber = `LEAD-${Math.floor(Math.random() * 1000000000)}`;
            const totalPrice = parseFloat(product.price);

            const order = await Order.create({
                orderNumber,
                userId: customer.id,
                storeId: store.id,
                subTotal: totalPrice,
                deliveryFee: 0,
                totalAmount: totalPrice,
                deliveryAddress: {},
                paymentMethod: 'cash_on_delivery',
                status: i % 2 === 0 ? 'new' : 'contacted'
            });

            await OrderItem.create({
                orderId: order.id,
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitPrice: totalPrice,
                totalPrice
            });
        }
        console.log('Created 10 orders (leads).');

        console.log('✅ Dummy data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dummy data:', error);
        process.exit(1);
    }
}

seedDummyData();
