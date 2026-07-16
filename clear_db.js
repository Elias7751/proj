const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const Store = require('./src/modules/stores/store.model');
const Product = require('./src/modules/products/product.model');
const ProductVariant = require('./src/modules/products/variant.model');
const Order = require('./src/modules/orders/order.model');
const OrderItem = require('./src/modules/orders/orderItem.model');
const Favorite = require('./src/modules/favorites/favorite.model');
const StoreSubscription = require('./src/modules/subscriptions/storeSubscription.model');
const Notification = require('./src/modules/notifications/notification.model');

async function clearDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database. Starting cleanup...');

        // تعطيل فحص المفاتيح الأجنبية مؤقتاً لتسهيل الحذف
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

        // حذف البيانات من الجداول
        console.log('Clearing Notifications...');
        await Notification.destroy({ where: {} });

        console.log('Clearing Favorites...');
        await Favorite.destroy({ where: {} });

        console.log('Clearing Order Items...');
        await OrderItem.destroy({ where: {} });

        console.log('Clearing Orders...');
        await Order.destroy({ where: {} });

        console.log('Clearing Product Variants...');
        await ProductVariant.destroy({ where: {} });

        console.log('Clearing Products...');
        await Product.destroy({ where: {} });

        console.log('Clearing Store Subscriptions...');
        await StoreSubscription.destroy({ where: {} });

        console.log('Clearing Stores...');
        await Store.destroy({ where: {} });

        console.log('Clearing Users (except Admin)...');
        await User.destroy({
            where: {
                role: { [sequelize.Sequelize.Op.ne]: 'admin' }
            }
        });

        // إعادة تفعيل فحص المفاتيح الأجنبية
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('✅ All dummy data cleared successfully! (Admin account kept intact)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

clearDatabase();
