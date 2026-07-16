// Script to list all users in the database
// Run with: `node src/scripts/list_users.js`

const sequelize = require('../config/database');
const User = require('../modules/users/user.model');

(async () => {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({ attributes: ['id', 'fullName', 'phone', 'email', 'role'] });
        console.log('=== Users in DB ===');
        users.forEach(u => {
            console.log(`${u.role}: ${u.fullName} (${u.phone}) - ${u.email}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error fetching users:', err);
        process.exit(1);
    }
})();
