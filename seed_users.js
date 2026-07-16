const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        await sequelize.authenticate();

        const hashedPassword = await bcrypt.hash('password123', 10);

        await User.bulkCreate([
            {
                fullName: 'محمد العميل',
                email: 'customer@test.com',
                password: hashedPassword,
                phone: '777123456',
                role: 'customer',
                status: 'active'
            },
            {
                fullName: 'أحمد التاجر',
                email: 'merchant@test.com',
                password: hashedPassword,
                phone: '777987654',
                role: 'store_owner',
                status: 'active'
            }
        ]);

        console.log('Dummy users created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating dummy users:', error);
        process.exit(1);
    }
}

seedUsers();
