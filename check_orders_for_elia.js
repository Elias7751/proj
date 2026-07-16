const sequelize = require('./src/config/database');
const Order = require('./src/modules/orders/order.model');

async function checkOrders() {
    try {
        await sequelize.authenticate();
        const orders = await Order.findAll({
            where: { storeId: 'b8af84ad-4c32-4b0d-9708-f304bc241fbc' }
        });
        console.log(`Orders for elia: ${orders.length}`);
        orders.forEach(o => {
            console.log(`- ID: ${o.id}, Number: ${o.orderNumber}, Status: ${o.status}, Total: ${o.totalAmount}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error checking orders:', error);
        process.exit(1);
    }
}

checkOrders();
