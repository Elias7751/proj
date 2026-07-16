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

// Mount Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
