const sequelize = require('./src/config/database');
const SubscriptionPlan = require('./src/modules/subscriptions/plan.model');

async function seedPlans() {
    await sequelize.authenticate();

    await SubscriptionPlan.bulkCreate([
        {
            nameAr: 'الباقة الأساسية',
            nameEn: 'Basic Plan',
            descriptionAr: 'باقة مناسبة للمتاجر الصغيرة',
            descriptionEn: 'Suitable for small stores',
            price: 5000,
            durationDays: 30,
            features: ['إضافة حتى 50 منتج', 'دعم فني عبر البريد']
        },
        {
            nameAr: 'الباقة الاحترافية',
            nameEn: 'Pro Plan',
            descriptionAr: 'باقة متكاملة للمتاجر الكبيرة',
            descriptionEn: 'Complete plan for large stores',
            price: 12000,
            durationDays: 30,
            features: ['إضافة منتجات غير محدودة', 'دعم فني على مدار الساعة', 'ظهور في المتاجر المميزة']
        }
    ]);

    console.log('Plans seeded successfully!');
    process.exit(0);
}

seedPlans();
