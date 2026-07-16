const sequelize = require('./src/config/database');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Check if column exists
        const [results] = await sequelize.query("SHOW COLUMNS FROM `stores` LIKE 'is_featured'");
        if (results.length === 0) {
            await sequelize.query("ALTER TABLE `stores` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status` ");
            console.log('✅ Column is_featured added successfully to stores table!');
        } else {
            console.log('Column is_featured already exists in stores table.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error adding column:', error);
        process.exit(1);
    }
}

addColumn();
