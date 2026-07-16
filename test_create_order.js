const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const Product = require('./src/modules/products/product.model');
const Cart = require('./src/modules/orders/cart.model');
const CartItem = require('./src/modules/orders/cartItem.model');
const Order = require('./src/modules/orders/order.model');
const OrderItem = require('./src/modules/orders/orderItem.model');

async function testCreateOrder() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const user = await User.findOne({ where: { phone: '771000001' } });
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        const product = await Product.findOne({ where: { name: 'meet' } });
        if (!product) {
            console.log('Product not found!');
            process.exit(1);
        }

        console.log(`User ID: ${user.id}, Product ID: ${product.id}, Store ID: ${product.storeId}`);

        // 1. Create or find cart
        let cart = await Cart.findOne({ where: { userId: user.id } });
        if (cart) {
            await cart.destroy();
        }
        cart = await Cart.create({
            userId: user.id,
            storeId: product.storeId,
            subTotal: product.price
        });

        await CartItem.create({
            cartId: cart.id,
            productId: product.id,
            quantity: 1,
            price: product.price
        });

        console.log('Cart and CartItem created.');

        // Now simulate the createOrder controller logic
        const store = await require('./src/modules/stores/store.model').findByPk(cart.storeId);
        const minOrderAmount = store.minOrderAmount ? parseFloat(store.minOrderAmount) : 0;
        if (parseFloat(cart.subTotal) < minOrderAmount) {
            console.log(`Error: Min order amount is ${minOrderAmount}`);
            process.exit(1);
        }

        const deliveryFee = 0.00;
        const totalAmount = parseFloat(cart.subTotal) + deliveryFee;
        const orderNumber = `ORD-${Math.floor(Math.random() * 1000000000)}`;

        const order = await Order.create({
            orderNumber,
            userId: user.id,
            storeId: cart.storeId,
            subTotal: cart.subTotal,
            deliveryFee,
            totalAmount,
            deliveryAddress: { city: 'Sanaa', area: 'Hadda', street: 'Main St', details: 'Apt 1' },
            paymentMethod: 'cash_on_delivery',
            notes: 'Test order'
        });

        await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.price,
            totalPrice: product.price
        });

        await cart.destroy();
        console.log('✅ Order created successfully! Order Number:', order.orderNumber);
        process.exit(0);
    } catch (error) {
        console.error('Error creating order:', error);
        process.exit(1);
    }
}

testCreateOrder();
