const sequelize = require('../config/database');
const User = require('../modules/users/user.model');
const Store = require('../modules/stores/store.model');
const Product = require('../modules/products/product.model');
const Category = require('../modules/categories/category.model');
const City = require('../modules/cities/city.model');
const Area = require('../modules/cities/area.model');
const bcrypt = require('bcryptjs');

const seedStores = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // 1. Create a dummy store owner user
        let owner = await User.findOne({ where: { phone: '777000000' } });
        if (!owner) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            owner = await User.create({
                fullName: 'تاجر تجريبي',
                phone: '777000000',
                password: hashedPassword,
                role: 'store_owner',
                status: 'active'
            });
        }

        // 2. Ensure we have a city and area
        let city = await City.findOne();
        if (!city) {
            city = await City.create({ nameAr: 'صنعاء', nameEn: 'Sanaa', isActive: true });
        }
        let area = await Area.findOne();
        if (!area) {
            area = await Area.create({ nameAr: 'حدة', nameEn: 'Hadda', cityId: city.id, deliveryFee: 1000, isActive: true });
        }

        // 3. Ensure we have some categories
        const categoryNames = ['إلكترونيات', 'ملابس', 'عطور', 'مطاعم', 'بقالات', 'صيدليات'];
        const categories = [];
        for (let i = 0; i < categoryNames.length; i++) {
            let cat = await Category.findOne({ where: { nameAr: categoryNames[i] } });
            if (!cat) {
                cat = await Category.create({
                    nameAr: categoryNames[i],
                    nameEn: `Category ${i}`,
                    slug: `category-${i}`,
                    isActive: true
                });
            }
            categories.push(cat);
        }

        // 4. Create 30 stores
        console.log('Creating 30 stores...');
        for (let i = 1; i <= 30; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            const store = await Store.create({
                nameAr: `متجر تجريبي رقم ${i}`,
                nameEn: `Test Store ${i}`,
                slug: `test-store-${i}-${Date.now()}`,
                description: `هذا وصف تجريبي للمتجر رقم ${i}. يقدم هذا المتجر أفضل المنتجات بأسعار منافسة.`,
                logo: `https://picsum.photos/seed/store${i}/200/200`,
                cover: `https://picsum.photos/seed/cover${i}/800/400`,
                whatsappNumber: `777000${i.toString().padStart(3, '0')}`,
                ownerId: owner.id,
                categoryId: randomCategory.id,
                cityId: city.id,
                areaId: area.id,
                status: 'active',
                isFeatured: i <= 5 // أول 5 متاجر مميزة
            });

            // 5. Create 5 products for each store
            for (let j = 1; j <= 5; j++) {
                const price = Math.floor(Math.random() * 10000) + 1000;
                await Product.create({
                    name: `منتج تجريبي ${j} - متجر ${i}`,
                    description: `وصف تفصيلي للمنتج التجريبي رقم ${j} التابع للمتجر رقم ${i}. منتج عالي الجودة ومضمون.`,
                    price: price,
                    discountPrice: Math.random() > 0.5 ? price - 500 : null,
                    images: [
                        `https://picsum.photos/seed/prod${i}${j}a/400/400`,
                        `https://picsum.photos/seed/prod${i}${j}b/400/400`
                    ],
                    stock: 50,
                    unit: 'قطعة',
                    storeId: store.id,
                    categoryId: randomCategory.id,
                    isFeatured: j === 1, // أول منتج في كل متجر مميز
                    status: 'active'
                });
            }
        }

        // Clear Redis Cache
        const { clearCache } = require('../middleware/cache');
        await clearCache('cache:/api/v1/stores*');
        await clearCache('cache:/api/v1/products*');
        await clearCache('cache:/api/v1/categories*');

        console.log('Successfully created 30 stores and 150 products!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding stores:', error);
        process.exit(1);
    }
};

seedStores();
