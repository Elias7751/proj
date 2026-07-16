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
  max: 100 // limit each IP to 100 requests per windowMs
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

// Temporary route to seed admin
app.get('/api/v1/seed-admin', async (req, res) => {
  try {
    const User = require('./modules/users/user.model');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const existingAdmin = await User.findOne({ where: { phone: '777777777' } });
    if (existingAdmin) {
      await existingAdmin.update({
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      return res.json({ message: 'Admin user updated successfully!' });
    } else {
      await User.create({
        fullName: 'مدير النظام',
        email: 'admin@admin.com',
        password: hashedPassword,
        phone: '777777777',
        role: 'admin',
        status: 'active'
      });
      return res.json({ message: 'Admin user created successfully!' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Mount Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
