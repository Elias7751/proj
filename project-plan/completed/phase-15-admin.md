# المرحلة 15: لوحة الإدارة (Admin API)

## ⏱️ الوقت المقدر: 5-7 أيام
## 📊 الحالة: ✅ مكتملة
## 📌 يعتمد على: كل المراحل السابقة

---

## المهام

### 15.1 إدارة المستخدمين
- [x] عرض كل المستخدمين + بحث + فلترة
- [ ] تفاصيل مستخدم
- [x] حظر/إلغاء حظر مستخدم
- [ ] تعديل بيانات مستخدم
- [ ] حذف مستخدم
- [ ] إحصائيات المستخدمين

### 15.2 إدارة المتاجر
- [x] طلبات الانضمام (الموافقة/الرفض)
- [x] عرض كل المتاجر
- [x] تعطيل/تفعيل متجر
- [ ] تفاصيل متجر + إحصائياته
- [ ] تعديل بيانات متجر

### 15.3 إدارة التصنيفات
- [x] CRUD كامل للتصنيفات الرئيسية والفرعية (تم في المرحلة 3)
- [ ] ترتيب التصنيفات

### 15.4 إدارة المدن والمناطق
- [x] CRUD للمدن (تم في المرحلة 1)
- [x] CRUD للمناطق (تم في المرحلة 1)
- [ ] تفعيل/تعطيل التغطية

### 15.5 إدارة الطلبات
- [x] عرض كل الطلبات
- [ ] فلترة متقدمة
- [ ] تفاصيل طلب
- [ ] التدخل في طلب (إلغاء، تعديل)

### 15.6 إدارة شركات/مندوبي التوصيل
- [x] الموافقة على مندوبين جدد (تم في المرحلة 6)
- [x] عرض المندوبين (تم في المرحلة 6)
- [ ] تقييمات المندوبين
- [ ] تعطيل/تفعيل

### 15.7 إدارة الإعلانات
- [x] الموافقة/رفض طلبات الإعلانات (تم في المرحلة 10)
- [x] عرض كل الإعلانات (تم في المرحلة 10)
- [ ] إحصائيات الإعلانات

### 15.8 إدارة الاشتراكات
- [x] عرض الاشتراكات النشطة (تم في المرحلة 11)
- [x] تعديل الباقات (تم في المرحلة 11)
- [ ] إحصائيات الاشتراكات

### 15.9 إدارة العمولات
- [x] تعيين نسب العمولة (تم في المرحلة 11 - الباقات)
- [ ] تقارير العمولات
- [ ] تسوية المدفوعات

### 15.10 لوحة الإحصائيات الرئيسية (Dashboard)
- [x] بطاقات ملخصة (إجمالي المبيعات، المتاجر، المستخدمين، الطلبات) (تم في المرحلة 13)
- [ ] رسوم بيانية (مبيعات يومية/شهرية)
- [ ] أحدث الطلبات
- [ ] طلبات الانضمام الجديدة
- [ ] تنبيهات النظام

### 15.11 مركز الدعم (Admin Side)
- [x] عرض التذاكر المفتوحة (تم في المرحلة 14)
- [x] الرد على التذاكر (تم في المرحلة 14)
- [ ] إحصائيات الدعم

---

## الـ API Endpoints
```
# يبدأ كل endpoint بـ /api/v1/admin/

# المستخدمين
GET    /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
PUT    /admin/users/:id/block
DELETE /admin/users/:id

# المتاجر
GET    /admin/stores
GET    /admin/stores/pending
PUT    /admin/stores/:id/approve
PUT    /admin/stores/:id/reject
PUT    /admin/stores/:id/block

# التصنيفات
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id

# المدن
POST   /admin/cities
PUT    /admin/cities/:id
POST   /admin/cities/:id/areas
PUT    /admin/areas/:id
DELETE /admin/areas/:id

# الطلبات
GET    /admin/orders
GET    /admin/orders/:id
PUT    /admin/orders/:id

# المندوبين
GET    /admin/drivers
PUT    /admin/drivers/:id/approve
PUT    /admin/drivers/:id/block

# الإعلانات
GET    /admin/ads
PUT    /admin/ads/:id/approve
PUT    /admin/ads/:id/reject

# الاشتراكات
GET    /admin/subscriptions
PUT    /admin/plans/:id

# العمولات
GET    /admin/commissions
PUT    /admin/commissions/settings

# لوحة التحكم
GET    /admin/dashboard/summary
GET    /admin/dashboard/charts

# الدعم
GET    /admin/support/tickets
POST   /admin/support/tickets/:id/reply
```
