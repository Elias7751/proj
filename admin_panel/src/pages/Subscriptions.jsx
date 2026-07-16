import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import api from '../api/axios';

const Subscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        price: '',
        durationDays: 30,
        maxProducts: 50,
        featuresInput: '',
        status: 'active'
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/subscriptions/plans');
            setPlans(response.data.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف خطة الاشتراك هذه؟')) {
            try {
                await api.delete(`/subscriptions/plans/${id}`);
                fetchPlans();
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert('فشل حذف خطة الاشتراك');
            }
        }
    };

    const handleOpenAddModal = () => {
        setEditingPlan(null);
        setFormData({
            nameAr: '',
            nameEn: '',
            descriptionAr: '',
            descriptionEn: '',
            price: '',
            durationDays: 30,
            maxProducts: 50,
            featuresInput: '',
            status: 'active'
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (plan) => {
        setEditingPlan(plan);

        let featuresList = [];
        if (plan.features) {
            if (Array.isArray(plan.features)) {
                featuresList = plan.features;
            } else if (typeof plan.features === 'string') {
                try {
                    featuresList = JSON.parse(plan.features);
                } catch (e) {
                    featuresList = [];
                }
            }
        }

        setFormData({
            nameAr: plan.nameAr || '',
            nameEn: plan.nameEn || '',
            descriptionAr: plan.descriptionAr || '',
            descriptionEn: plan.descriptionEn || '',
            price: plan.price || '',
            durationDays: plan.durationDays || 30,
            maxProducts: plan.maxProducts || 50,
            featuresInput: featuresList.join('\n'),
            status: plan.status || 'active'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // تحويل النص المدخل إلى مصفوفة مميزات
        const features = formData.featuresInput
            .split('\n')
            .map(f => f.trim())
            .filter(f => f.length > 0);

        const payload = {
            nameAr: formData.nameAr,
            nameEn: formData.nameEn,
            descriptionAr: formData.descriptionAr,
            descriptionEn: formData.descriptionEn,
            price: parseFloat(formData.price),
            durationDays: parseInt(formData.durationDays),
            maxProducts: parseInt(formData.maxProducts),
            features: features,
            status: formData.status
        };

        try {
            if (editingPlan) {
                await api.put(`/subscriptions/plans/${editingPlan.id}`, payload);
            } else {
                await api.post('/subscriptions/plans', payload);
            }
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert(error.response?.data?.message || 'فشل حفظ خطة الاشتراك');
        }
    };

    const getFeaturesArray = (features) => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        if (typeof features === 'string') {
            try {
                return JSON.parse(features);
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>خطط الاشتراكات</h1>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <Plus size={18} />
                    إضافة خطة جديدة
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {plans.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>لا توجد خطط اشتراك حالياً. أضف خطة جديدة.</div>
                ) : (
                    plans.map((plan, index) => {
                        const featuresList = getFeaturesArray(plan.features);
                        return (
                            <div key={plan.id} className="glass-card" style={{ position: 'relative', overflow: 'hidden', border: index === 1 ? '2px solid var(--primary-color)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ position: 'absolute', top: 0, right: 0, background: index === 1 ? 'var(--primary-dark)' : 'var(--primary-color)', color: 'white', padding: '4px 24px', borderBottomLeftRadius: '12px', fontWeight: 'bold' }}>
                                        {plan.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </div>
                                    <h2 style={{ marginTop: '24px', marginBottom: '8px' }}>{plan.nameAr}</h2>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{plan.descriptionAr}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{plan.price}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>ريال / {plan.durationDays} يوم</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        الحد الأقصى للمنتجات: {plan.maxProducts === -1 ? 'غير محدود' : `${plan.maxProducts} منتج`}
                                    </p>

                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                                        {featuresList.map((feature, i) => (
                                            <li key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    <button className="btn" onClick={() => handleOpenEditModal(plan)} style={{ flex: 1, background: 'var(--bg-color)', color: 'var(--text-main)' }}>
                                        <Edit size={16} /> تعديل
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(plan.id)} style={{ padding: '10px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Plan Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2>{editingPlan ? 'تعديل خطة الاشتراك' : 'إضافة خطة اشتراك جديدة'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>الاسم (بالعربية)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.nameAr}
                                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>الاسم (بالإنجليزية)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>الوصف (بالعربية)</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={formData.descriptionAr}
                                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>الوصف (بالإنجليزية)</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={formData.descriptionEn}
                                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>السعر (ريال)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>المدة (بالأيام)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>الحد الأقصى للمنتجات (-1 لغير محدود)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.maxProducts}
                                    onChange={(e) => setFormData({ ...formData, maxProducts: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>المميزات (اكتب كل ميزة في سطر منفصل)</label>
                                <textarea
                                    className="input-field"
                                    rows="4"
                                    placeholder="مثال:&#10;إضافة حتى 50 منتج&#10;دعم فني عبر الواتساب"
                                    value={formData.featuresInput}
                                    onChange={(e) => setFormData({ ...formData, featuresInput: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>الحالة</label>
                                <select
                                    className="input-field"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ</button>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'var(--bg-color)' }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
