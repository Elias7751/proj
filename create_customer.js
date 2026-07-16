const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');

async function createCustomer() {
    try {
        const phone = '777000000';
        const password = 'password123';

        let user = await User.findOne({ where: { phone } });
        if (user) {
            await user.destroy();
        }

        await User.create({
            fullName: 'عميل تجريبي',
            phone: phone,
            password: password,
            role: 'customer',
            status: 'active'
        });

        console.log('Customer created successfully');
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

createCustomer();
