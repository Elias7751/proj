import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Percent, DollarSign, Calendar } from 'lucide-react';
import api from '../api/axios';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCouponId, setCurrentCouponId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        usageLimit: '',
        storeId: '' // empty means global
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/coupons/admin');
            setCoupons(response.data.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                storeId: formData.storeId || null
            };

            if (isEditing) {
                await api.put(`/coupons/admin/${currentCouponId}`, payload);
            } else {
                await api.post('/coupons/admin', payload);
            }

            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert(error.response?.data?.message || 'حدث خطأ أثناء حفظ الكوبون');
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount || '',
            startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
            endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
            usageLimit: coupon.usageLimit || '',
            storeId: coupon.storeId || ''
        });
        setCurrentCouponId(coupon.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الكوبون؟')) return;
        try {
            await api.delete(`/coupons/admin/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    const openNewModal = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderAmount: '0',
            maxDiscountAmount: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            usageLimit: '',
            storeId: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة الكوبونات والعروض</h1>
                <button className="btn btn-primary" onClick={openNewModal}>
                    <Plus size={20} style={{ marginLeft: '8px' }} />
                    إضافة كوبون جديد
                </button>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>رمز الكوبون</th>
                                <th>النوع</th>
                                <th>قيمة الخصم</th>
                                <th>الاستخدام</th>
                                <th>تاريخ الانتهاء</th>
                                <th>النطاق</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Tag size={16} color="var(--primary-color)" />
                                            {coupon.code}
                                        </div>
                                    </td>
                                    <td>
                                        {coupon.discountType === 'percentage' ? (
                                            <span className="badge badge-primary"><Percent size={12} style={{ marginLeft: '4px' }} /> نسبة مئوية</span>
                                        ) : (
                                            <span className="badge badge-success"><DollarSign size={12} style={{ marginLeft: '4px' }} /> مبلغ ثابت</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} ريال`}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>
                                            المستخدم: {coupon.usedCount}
                                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (غير محدود)'}
                                        </div>
                                    </td>
                                    <td>
                                        {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('ar-SA') : 'بدون تاريخ انتهاء'}
                                    </td>
                                    <td>
                                        {coupon.storeId ? (
                                            <span className="badge badge-warning">متجر: {coupon.store?.nameAr}</span>
                                        ) : (
                                            <span className="badge badge-primary">عام (للمنصة)</span>
                                        )}
                                    </td>
                                    <td>
                                        {coupon.isActive ? (
                                            <span className="badge badge-success">نشط</span>
                                        ) : (
                                            <span className="badge badge-danger">غير نشط</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn"
                                                style={{ padding: '6px', minWidth: 'auto', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)' }}
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ padding: '6px', minWidth: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد كوبونات حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-card" onClick={e => e.stopPropagation()} style={{
                        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>{isEditing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
                            <button className="btn" style={{ padding: '4px', background: 'transparent' }} onClick={() => setShowModal(false)}>
                                <XCircle size={24} color="var(--text-muted)" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رمز الكوبون *</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="مثال: SUMMER2024"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نطاق الكوبون</label>
                                    <select
                                        className="input-field"
                                        name="storeId"
                                        value={formData.storeId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">عام (على مستوى المنصة)</option>
                                        {/* In a real app, you would fetch and list stores here if you want to assign to a specific store */}
                                        <option value="store_id_here" disabled>لتعيينه لمتجر، يجب جلبه من القائمة (غير مفعل حالياً)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نوع الخصم *</label>
                                    <select
                                        className="input-field"
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ريال)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>قيمة الخصم *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الحد الأدنى للطلب</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الحد الأقصى للخصم (للنسبة المئوية)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleInputChange}
                                        disabled={formData.discountType === 'fixed'}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>تاريخ البدء *</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>تاريخ الانتهاء</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>حد الاستخدام (مرات)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    placeholder="اتركه فارغاً لجعله غير محدود"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                                    إلغاء
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'حفظ التعديلات' : 'إضافة الكوبون'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
