const sequelize = require('./src/config/database');
const User = require('./src/modules/users/user.model');
const Store = require('./src/modules/stores/store.model');
const Product = require('./src/modules/products/product.model');
const Category = require('./src/modules/categories/category.model');
const Subscription = require('./src/modules/subscriptions/subscription.model');
const Plan = require('./src/modules/subscriptions/plan.model');

async function createDummyStore() {
    try {
        await sequelize.sync();

        // 1. Create Category if not exists
        let category = await Category.findOne();
        if (!category) {
            category = await Category.create({
                nameAr: 'إلكترونيات',
                nameEn: 'Electronics',
                slug: 'electronics',
                icon: 'devices'
            });
        }

        // 2. Create User
        const phone = '777123456';
        const password = 'password123';

        let user = await User.findOne({ where: { phone } });
        if (user) {
            await user.destroy(); // Delete if exists to start fresh
        }

        user = await User.create({
            fullName: 'تاجر تجريبي',
            phone: phone,
            password: password,
            role: 'store_owner',
            status: 'active'
        });

        // 3. Create Store
        const store = await Store.create({
            nameAr: 'متجر التقنية الحديثة',
            nameEn: 'Modern Tech Store',
            slug: 'modern-tech-' + Date.now(),
            description: 'أفضل متجر لبيع الإلكترونيات والأجهزة الذكية',
            whatsappNumber: phone,
            ownerId: user.id,
            categoryId: category.id,
            status: 'active'
        });

        // 4. Create Plan & Subscription
        let plan = await Plan.findOne();
        if (!plan) {
            plan = await Plan.create({
                nameAr: 'باقة برو',
                nameEn: 'Pro Plan',
                monthlyPrice: 99.00,
                yearlyPrice: 990.00,
                maxProducts: -1,
                commissionRate: 0.00
            });
        }

        await Subscription.create({
            storeId: store.id,
            planId: plan.id,
            billingCycle: 'monthly',
            pricePaid: 0.00,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active'
        });

        // 5. Create Dummy Products
        const products = [
            {
                name: 'هاتف آيفون 15 برو',
                description: 'أحدث هاتف من آبل بمواصفات خيالية وكاميرا احترافية.',
                price: 4500.00,
                images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop'],
                stock: 10,
                storeId: store.id,
                categoryId: category.id,
                isActive: true
            },
            {
                name: 'سماعات أبل إيربودز برو',
                description: 'سماعات لاسلكية بعزل ضوضاء ممتاز.',
                price: 850.00,
                images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=2070&auto=format&fit=crop'],
                stock: 25,
                storeId: store.id,
                categoryId: category.id,
                isActive: true
            },
            {
                name: 'ساعة ذكية رياضية',
                description: 'ساعة ذكية لتتبع نبضات القلب والنشاط الرياضي.',
                price: 299.00,
                images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2072&auto=format&fit=crop'],
                stock: 50,
                storeId: store.id,
                categoryId: category.id,
                isActive: true
            }
        ];

        for (const p of products) {
            await Product.create(p);
        }

        console.log('-----------------------------------');
        console.log('✅ تم إنشاء الحساب والمتجر بنجاح!');
        console.log(`📱 رقم الهاتف: ${phone}`);
        console.log(`🔑 كلمة المرور: ${password}`);
        console.log('-----------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ:', error);
        process.exit(1);
    }
}

createDummyStore();
