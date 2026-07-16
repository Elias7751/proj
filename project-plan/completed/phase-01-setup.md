# المرحلة 1: تهيئة المشروع والبنية الأساسية

## ⏱️ الوقت المقدر: 2-3 أيام
## 📊 الحالة: ✅ مكتملة

---

## المهام

### 1.1 تهيئة مشروع Node.js
- [x] إنشاء `package.json` مع الـ dependencies الأساسية
- [x] إعداد TypeScript (اختياري) أو JavaScript مع ES Modules
- [x] إعداد ESLint + Prettier
- [x] إعداد `.env` و `.env.example`
- [x] إعداد `.gitignore`

### 1.2 إعداد Express.js
- [x] إنشاء `app.js` الرئيسي
- [x] إعداد Middleware الأساسية (cors, helmet, morgan, express.json)
- [ ] إعداد Error Handling Middleware
- [x] إعداد Rate Limiting
- [x] إعداد CORS

### 1.3 إعداد قاعدة البيانات
- [x] الاتصال بـ MySQL (XAMPP)
- [x] إعداد Sequelize
- [x] إنشاء Database Connection Handler
- [ ] إعداد Database Seeder (بيانات أولية)

### 1.4 البنية المعمارية
- [x] إنشاء هيكل المجلدات (modules, middleware, utils, config)
- [ ] إعداد نظام Routes المركزي
- [ ] إعداد Response Handler موحد
- [ ] إعداد Logger (winston أو pino)

### 1.5 أدوات التطوير
- [x] إعداد Nodemon للتطوير
- [ ] إعداد Swagger للتوثيق
- [ ] إعداد Jest أو Mocha للاختبارات

---

## الملفات المتوقعة
```
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   ├── env.js
│   └── swagger.js
├── middleware/
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── validate.js
│   └── responseHandler.js
├── utils/
│   ├── logger.js
│   ├── ApiError.js
│   ├── ApiResponse.js
│   └── asyncHandler.js
├── modules/
│   └── (سيتم إنشاؤها في المراحل القادمة)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## الحزم المطلوبة
```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^7.x",
    "dotenv": "^16.x",
    "cors": "^2.8.x",
    "helmet": "^7.x",
    "morgan": "^1.10.x",
    "express-rate-limit": "^7.x",
    "joi": "^17.x",
    "winston": "^3.x",
    "swagger-jsdoc": "^6.x",
    "swagger-ui-express": "^5.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```
