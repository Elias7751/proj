const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        await sequelize.authenticate();

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { phone: '777777777' } });
        if (existingAdmin) {
            await existingAdmin.update({
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
            console.log('Admin user updated successfully!');
        } else {
            await User.create({
                fullName: 'مدير النظام',
                email: 'admin@admin.com',
                password: hashedPassword,
                phone: '777777777',
                role: 'admin',
                status: 'active'
            });
            console.log('Admin user created successfully!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
