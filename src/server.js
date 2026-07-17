const app = require('./app');
const sequelize = require('./config/database');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 5000;

// دالة لإنشاء قاعدة البيانات تلقائياً إذا لم تكن موجودة
async function ensureDatabaseExists() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();
        console.log(`✅ تم التأكد من وجود قاعدة البيانات: ${process.env.DB_NAME}`);
    } catch (err) {
        console.error('❌ خطأ أثناء محاولة إنشاء قاعدة البيانات:', err.message);
    }
}

async function startServer() {
    // التأكد من وجود قاعدة البيانات أولاً
    await ensureDatabaseExists();

    try {
        // الاتصال بقاعدة البيانات ومزامنة الجداول
        await sequelize.authenticate();
        console.log('✅ متصل بقاعدة البيانات MySQL بنجاح عبر Sequelize');

        // مزامنة النماذج مع قاعدة البيانات
        // نستخدم sync({ alter: true }) لتحديث الجداول وإضافة الأعمدة الجديدة
        await sequelize.sync({ alter: true });
        console.log('✅ تم مزامنة جداول قاعدة البيانات بنجاح');

        // تشغيل الخادم
        app.listen(PORT, () => {
            console.log(`🚀 الخادم يعمل على المنفذ ${PORT} في وضع ${process.env.NODE_ENV}`);
        });
    } catch (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات أو تشغيل الخادم:', err.message);
        process.exit(1);
    }
}

startServer();

// التعامل مع الأخطاء غير المتوقعة
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
