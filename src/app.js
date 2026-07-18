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
  res.json({ message: 'مرحباً بك في منصة السوق اليمني API' });
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

// Mount Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
