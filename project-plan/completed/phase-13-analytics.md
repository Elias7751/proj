# المرحلة 13: نظام التحليلات والتقارير

## ⏱️ الوقت المقدر: 4-5 أيام
## 📊 الحالة: ✅ مكتملة
## 📌 يعتمد على: المراحل 5, 7

---

## المهام

### 13.1 تحليلات صاحب المتجر
- [x] أكثر المنتجات مبيعاً
- [ ] أكثر مدينة تطلب
- [ ] ساعات الذروة
- [ ] عدد الزوار
- [ ] معدل التحويل (زيارة → طلب)
- [ ] العملاء العائدون
- [ ] الأرباح اليومية
- [ ] الأرباح الأسبوعية
- [ ] الأرباح الشهرية
- [ ] مقارنة الفترات
- [ ] المنتجات منخفضة المخزون
- [ ] متوسط قيمة الطلب

### 13.2 تحليلات المنصة (Admin)
- [x] إجمالي المبيعات
- [ ] إجمالي العمولات
- [x] عدد المتاجر النشطة
- [x] عدد المستخدمين
- [x] عدد الطلبات يومياً/شهرياً
- [ ] أفضل المتاجر أداءً
- [ ] المدن الأكثر نشاطاً
- [ ] نمو المنصة

### 13.3 التقارير
- [ ] تقرير المبيعات
- [ ] تقرير العمولات
- [ ] تقرير المتاجر
- [ ] تقرير المستخدمين
- [ ] تصدير PDF
- [ ] تصدير Excel (CSV)

### 13.4 Dashboard Data API
- [x] بيانات ملخصة (Summary Cards)
- [ ] رسوم بيانية (Charts Data)
- [ ] جداول (Tables Data)
- [ ] فلترة حسب التاريخ

---

## الـ API Endpoints
```
# تحليلات المتجر
GET    /api/v1/analytics/store/summary          # ملخص
GET    /api/v1/analytics/store/sales            # مبيعات
GET    /api/v1/analytics/store/products         # أداء المنتجات
GET    /api/v1/analytics/store/customers        # العملاء
GET    /api/v1/analytics/store/peak-hours       # ساعات الذروة
GET    /api/v1/analytics/store/cities           # المدن

# تحليلات المنصة (Admin)
GET    /api/v1/analytics/admin/summary          # ملخص المنصة
GET    /api/v1/analytics/admin/revenue          # الإيرادات
GET    /api/v1/analytics/admin/stores           # أداء المتاجر
GET    /api/v1/analytics/admin/users            # المستخدمين
GET    /api/v1/analytics/admin/growth           # النمو

# التقارير
GET    /api/v1/reports/sales                    # تقرير مبيعات
GET    /api/v1/reports/commissions              # تقرير عمولات
GET    /api/v1/reports/export/:type             # تصدير (pdf/csv)
```
