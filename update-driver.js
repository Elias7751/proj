const DeliveryDriver = require('./src/modules/delivery/driver.model');

async function updateDriver() {
    await DeliveryDriver.update({ status: 'available' }, { where: { id: 'b136eb82-13d6-411e-b3f0-4cb5540656cb' } });
    console.log('Driver status updated to available');
    process.exit(0);
}

updateDriver();
