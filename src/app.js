const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// تعطيل الكاش والـ ETag لضمان إرجاع الحالة 200 دائماً بدلاً من 304
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'مرحباً بك في منصة Sellink API' });
});

// Temporary route to seed admin and default data
app.get('/api/v1/seed-all', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    const User = require('./modules/users/user.model');
    const Store = require('./modules/stores/store.model');
    const SubscriptionPlan = require('./modules/subscriptions/plan.model');
    const Category = require('./modules/categories/category.model');
    const City = require('./modules/cities/city.model');
    const Area = require('./modules/cities/area.model');
    const Offer = require('./modules/offers/offer.model');
    const Coupon = require('./modules/offers/coupon.model');
    const Order = require('./modules/orders/order.model');

    // Sync database schema to add any missing columns like delivery_fee
    await sequelize.sync({ alter: true });

    // 1. Seed Admin
    let admin = await User.findOne({ where: { phone: '777777777' } });
    if (admin) {
      admin.password = 'password123';
      admin.role = 'admin';
      admin.status = 'active';
      await admin.save();
    } else {
      admin = await User.create({
        fullName: 'مدير النظام',
        email: 'admin@admin.com',
        password: 'password123',
        phone: '777777777',
        role: 'admin',
        status: 'active'
      });
    }

    // 2. Seed Subscription Plans
    const plans = [
      {
        nameAr: 'الخطة المجانية',
        nameEn: 'Free Plan',
        descriptionAr: 'ابدأ متجرك مجاناً مع ميزات أساسية',
        descriptionEn: 'Start your store for free with basic features',
        price: 0.00,
        durationDays: 30,
        maxProducts: 10,
        features: ['إضافة حتى 10 منتجات', 'دعم فني عبر البريد', 'تقارير مبيعات مبسطة']
      },
      {
        nameAr: 'الخطة الأساسية',
        nameEn: 'Basic Plan',
        descriptionAr: 'خطة مثالية للمتاجر الناشئة والمتوسطة',
        descriptionEn: 'Perfect plan for startup and medium stores',
        price: 10.00,
        durationDays: 30,
        maxProducts: 100,
        features: ['إضافة حتى 100 منتج', 'دعم فني سريع', 'تقارير مبيعات متقدمة', 'كوبونات الخصم والعروض']
      },
      {
        nameAr: 'الخطة المميزة',
        nameEn: 'Premium Plan',
        descriptionAr: 'خطة غير محدودة للمتاجر الكبيرة والشركات',
        descriptionEn: 'Unlimited plan for large stores and brands',
        price: 30.00,
        durationDays: 30,
        maxProducts: -1,
        features: ['منتجات غير محدودة', 'دعم فني 24/7', 'تحليلات مبيعات تفصيلية', 'كوبونات وعروض غير محدودة', 'أولوية الظهور في المنصة']
      }
    ];

    for (const plan of plans) {
      const existingPlan = await SubscriptionPlan.findOne({ where: { nameEn: plan.nameEn } });
      if (!existingPlan) {
        await SubscriptionPlan.create(plan);
      } else {
        await existingPlan.update(plan);
      }
    }

    // 3. Seed Categories
    const categories = [
      { nameAr: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: 'devices' },
      { nameAr: 'ملابس وأزياء', nameEn: 'Fashion', slug: 'fashion', icon: 'checkroom' },
      { nameAr: 'سوبرماركت', nameEn: 'Supermarket', slug: 'supermarket', icon: 'shopping_basket' },
      { nameAr: 'مطاعم ومأكولات', nameEn: 'Restaurants', slug: 'restaurants', icon: 'restaurant' }
    ];

    for (const cat of categories) {
      const existingCat = await Category.findOne({ where: { nameEn: cat.nameEn } });
      if (!existingCat) {
        await Category.create(cat);
      } else {
        await existingCat.update(cat);
      }
    }

    // 4. Seed Cities & Areas
    const citiesData = [
      {
        nameAr: 'صنعاء',
        nameEn: 'Sanaa',
        areas: [
          { nameAr: 'حدة', nameEn: 'Hadda', deliveryFee: 1000 },
          { nameAr: 'السبعين', nameEn: 'Al-Sabeen', deliveryFee: 1200 },
          { nameAr: 'التحرير', nameEn: 'Al-Tahrir', deliveryFee: 800 }
        ]
      },
      {
        nameAr: 'عدن',
        nameEn: 'Aden',
        areas: [
          { nameAr: 'كريتر', nameEn: 'Crater', deliveryFee: 1500 },
          { nameAr: 'المنصورة', nameEn: 'Al-Mansoura', deliveryFee: 1500 },
          { nameAr: 'الشيخ عثمان', nameEn: 'Sheikh Othman', deliveryFee: 1800 }
        ]
      }
    ];

    for (const cityData of citiesData) {
      let city = await City.findOne({ where: { nameEn: cityData.nameEn } });
      if (!city) {
        city = await City.create({ nameAr: cityData.nameAr, nameEn: cityData.nameEn });
      }
      for (const areaData of cityData.areas) {
        const existingArea = await Area.findOne({ where: { cityId: city.id, nameEn: areaData.nameEn } });
        if (!existingArea) {
          await Area.create({
            nameAr: areaData.nameAr,
            nameEn: areaData.nameEn,
            cityId: city.id,
            deliveryFee: areaData.deliveryFee
          });
        }
      }
    }

    return res.json({ message: 'All default data seeded successfully!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint to seed 30 dummy stores and 150 products
app.get('/api/v1/seed-dummy-stores', async (req, res) => {
  try {
    const User = require('./modules/users/user.model');
    const Store = require('./modules/stores/store.model');
    const Product = require('./modules/products/product.model');
    const Category = require('./modules/categories/category.model');
    const City = require('./modules/cities/city.model');
    const Area = require('./modules/cities/area.model');
    const bcrypt = require('bcryptjs');

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
    const { clearCache } = require('./middleware/cache');
    await clearCache('cache:/api/v1/stores*');
    await clearCache('cache:/api/v1/products*');
    await clearCache('cache:/api/v1/categories*');

    return res.json({ message: 'Successfully created 30 stores and 150 products!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Mount Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
