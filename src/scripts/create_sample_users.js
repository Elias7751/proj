// Script to create sample users for testing (customer, store_owner, delivery)
// Run with: `node src/scripts/create_sample_users.js`

const sequelize = require('../config/database'); // adjust path if needed
const User = require('../modules/users/user.model');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Ensure tables are up‑to‑date (optional)
        // await sequelize.sync({ alter: true });

        const users = [
            {
                fullName: 'Elias Ahmed',
                phone: '739811541',
                email: 'elias@example.com',
                password: '123456', // will be hashed by model hook
                role: 'customer',
            },
            {
                fullName: 'Store Owner',
                phone: '739811542',
                email: 'owner@example.com',
                password: '123456',
                role: 'store_owner',
            },
        ];

        for (const data of users) {
            const [user, created] = await User.findOrCreate({
                where: { phone: data.phone },
                defaults: data,
            });
            if (created) {
                console.log(`✅ Created ${data.role} user: ${data.fullName}`);
            } else {
                console.log(`⚠️ User with phone ${data.phone} already exists (role: ${user.role})`);
            }
        }

        console.log('✅ Sample users setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating sample users:', err);
        process.exit(1);
    }
})();
