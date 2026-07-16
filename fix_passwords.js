const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');

async function fixPasswords() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database. Fixing passwords...');

        const users = await User.findAll();
        for (const user of users) {
            // Setting the password to plain text 'password123'
            // This will trigger the beforeSave hook to hash it once correctly
            user.password = 'password123';
            await user.save();
            console.log(`Updated password for user: ${user.fullName} (${user.phone})`);
        }

        console.log('✅ All passwords fixed and hashed correctly once!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing passwords:', error);
        process.exit(1);
    }
}

fixPasswords();
