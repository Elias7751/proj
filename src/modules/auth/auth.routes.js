const express = require('express');
const { register, login, getMe } = require('./auth.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// مسارات عامة (Public Routes)
router.post('/register', register);
router.post('/login', login);

// مسارات محمية (Protected Routes)
router.get('/me', protect, getMe);

module.exports = router;
