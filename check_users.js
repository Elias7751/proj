const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        console.log('Users in database:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Name: ${u.fullName}, Email: ${u.email}, Role: ${u.role}, Phone: ${u.phone}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
