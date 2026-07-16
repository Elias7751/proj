# المرحلة 2: نظام المصادقة والمستخدمين

## ⏱️ الوقت المقدر: 3-4 أيام
## 📊 الحالة: ✅ مكتملة
## 📌 يعتمد على: المرحلة 1

---

## المهام

### 2.1 نموذج المستخدم (User Model)
- [x] إنشاء User Schema (Sequelize Model)
  - الاسم الكامل
  - رقم الهاتف (أساسي في اليمن)
  - البريد الإلكتروني (اختياري)
  - كلمة المرور (مشفرة bcrypt)
  - الدور (customer, store_owner, delivery, admin)
  - الصورة الشخصية
  - العنوان (المدينة، المنطقة، التفاصيل)
  - حالة الحساب (active, blocked, pending)
  - تاريخ الإنشاء والتحديث

### 2.2 نظام التسجيل
- [x] تسجيل عميل جديد
- [x] تسجيل صاحب متجر
- [ ] التحقق من رقم الهاتف (OTP)
- [x] Validation لجميع المدخلات

### 2.3 نظام تسجيل الدخول
- [x] تسجيل دخول بالهاتف + كلمة المرور
- [x] توليد JWT Token (Access + Refresh)
- [ ] تسجيل الخروج
- [ ] إعادة تعيين كلمة المرور

### 2.4 Middleware المصادقة
- [x] Auth Middleware (التحقق من JWT)
- [x] Role-based Authorization Middleware
- [x] حماية الـ Routes

### 2.5 إدارة الملف الشخصي
- [x] عرض الملف الشخصي
- [ ] تعديل البيانات الشخصية
- [ ] تغيير كلمة المرور
- [ ] رفع/تغيير الصورة الشخصية

---

## الـ API Endpoints
```
POST   /api/v1/auth/register          # تسجيل جديد
POST   /api/v1/auth/login             # تسجيل دخول
POST   /api/v1/auth/logout            # تسجيل خروج
POST   /api/v1/auth/refresh-token     # تجديد التوكن
POST   /api/v1/auth/forgot-password   # نسيت كلمة المرور
POST   /api/v1/auth/reset-password    # إعادة تعيين
POST   /api/v1/auth/verify-phone      # تحقق من الهاتف

GET    /api/v1/users/me               # ملفي الشخصي
PUT    /api/v1/users/me               # تعديل ملفي
PUT    /api/v1/users/me/password      # تغيير كلمة المرور
PUT    /api/v1/users/me/avatar        # تغيير الصورة
```

## الحزم الإضافية
```json
{
  "bcryptjs": "^2.4.x",
  "jsonwebtoken": "^9.x",
  "multer": "^1.4.x",
  "cloudinary": "^1.x"
}
```
