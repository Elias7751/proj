const sequelize = require('./src/config/database');

async function updatePhone() {
    try {
        await sequelize.query("UPDATE stores SET whatsapp_number='+967739811541'");
        console.log('Updated successfully');
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

updatePhone();
