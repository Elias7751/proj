# المرحلة 14: نظام الإعدادات والدعم

## ⏱️ الوقت المقدر: 2-3 أيام
## 📊 الحالة: ✅ مكتملة
## 📌 يعتمد على: المراحل السابقة

---

## المهام

### 14.1 إعدادات المنصة (Settings Model)
- [x] إنشاء Setting Schema (Sequelize Model)
- [x] اسم المنصة
- [x] الشعار
- [x] الوصف
- [x] معلومات التواصل
- [x] روابط التواصل الاجتماعي
- [x] شروط الخدمة
- [x] سياسة الخصوصية
- [x] نسبة العمولة الافتراضية
- [x] رسوم التوصيل الافتراضية
- [x] العملة الافتراضية (ريال يمني)
- [x] المدن المفعلة

### 14.2 مركز الدعم
- [x] Ticket Model
  - المستخدم
  - العنوان
  - الوصف
  - الأولوية (low, medium, high)
  - الحالة (open, in_progress, resolved, closed)
  - الردود
- [x] إنشاء تذكرة دعم
- [x] الرد على التذكرة (Admin)
- [ ] إغلاق التذكرة
- [x] عرض تذاكري

### 14.3 الأسئلة الشائعة (FAQ)
- [x] FAQ Model
- [x] إضافة سؤال (Admin)
- [x] عرض الأسئلة الشائعة
- [ ] تصنيف الأسئلة

### 14.4 المفضلة (Favorites)
- [ ] إضافة متجر/منتج للمفضلة
- [ ] إزالة من المفضلة
- [ ] عرض المفضلة

---

## الـ API Endpoints
```
# الإعدادات
GET    /api/v1/settings                      # إعدادات المنصة
PUT    /api/v1/settings                      # تعديل (Admin)

# الدعم
POST   /api/v1/support/tickets               # إنشاء تذكرة
GET    /api/v1/support/tickets               # تذاكري
GET    /api/v1/support/tickets/:id           # تفاصيل تذكرة
POST   /api/v1/support/tickets/:id/reply     # رد
PUT    /api/v1/support/tickets/:id/close     # إغلاق

# الأسئلة الشائعة
GET    /api/v1/faq                            # كل الأسئلة
POST   /api/v1/faq                            # إضافة (Admin)
PUT    /api/v1/faq/:id                       # تعديل (Admin)
DELETE /api/v1/faq/:id                       # حذف (Admin)

# المفضلة
POST   /api/v1/favorites                     # إضافة للمفضلة
GET    /api/v1/favorites                      # المفضلة
DELETE /api/v1/favorites/:id                 # إزالة
```
