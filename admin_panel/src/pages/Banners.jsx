import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CheckCircle, XCircle, Image as ImageIcon, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import api from '../api/axios';

const Banners = () => {
    const [ads, setAds] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        placement: 'home_banner',
        startDate: '',
        endDate: '',
        storeId: '',
        cost: ''
    });

    useEffect(() => {
        fetchAds();
        fetchStores();
    }, []);

    const fetchAds = async () => {
        try {
            const response = await api.get('/admin/ads');
            setAds(response.data.data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await api.get('/admin/stores');
            setStores(response.data.data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/ads/${id}/approve`, { status: 'active' });
            fetchAds();
        } catch (error) {
            console.error('Error approving ad:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/ads/${id}/approve`, { status: 'rejected' });
            fetchAds();
        } catch (error) {
            console.error('Error rejecting ad:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
            try {
                await api.delete(`/admin/ads/${id}`);
                fetchAds();
            } catch (error) {
                console.error('Error deleting ad:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/ads', formData);
            setShowAddModal(false);
            setFormData({
                title: '',
                image: '',
                link: '',
                placement: 'home_banner',
                startDate: '',
                endDate: '',
                storeId: '',
                cost: ''
            });
            fetchAds();
        } catch (error) {
            console.error('Error creating ad:', error);
            alert('حدث خطأ أثناء إنشاء الإعلان');
        }
    };

    const getPlacementLabel = (placement) => {
        switch (placement) {
            case 'home_banner':
                return 'البنر الرئيسي بالرئيسية';
            case 'search_top':
                return 'أعلى نتائج البحث';
            case 'category_inside':
                return 'داخل التصنيف';
            case 'between_products':
                return 'بين المنتجات';
            default:
                return placement;
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة الإعلانات والبنرات</h1>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    إضافة إعلان جديد
                </button>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الإعلان</th>
                                <th>الموضع</th>
                                <th>المتجر</th>
                                <th>الفترة</th>
                                <th>التكلفة</th>
                                <th>المشاهدات/النقرات</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map((ad) => (
                                <tr key={ad.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '80px', height: '45px', borderRadius: '4px', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {ad.image ? (
                                                    <img src={ad.image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <ImageIcon size={20} color="#aaa" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{ad.title}</div>
                                                {ad.link && (
                                                    <a href={ad.link} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        الرابط <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getPlacementLabel(ad.placement)}</td>
                                    <td>{ad.store?.nameAr || 'عام'}</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>
                                            <div>من: {new Date(ad.startDate).toLocaleDateString('ar-EG')}</div>
                                            <div>إلى: {new Date(ad.endDate).toLocaleDateString('ar-EG')}</div>
                                        </div>
                                    </td>
                                    <td>{ad.cost} ريال</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>
                                            <div>👁️ {ad.viewsCount}</div>
                                            <div>🖱️ {ad.clicksCount}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${ad.status === 'active' ? 'badge-success' : ad.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                            {ad.status === 'active' ? 'نشط' : ad.status === 'pending' ? 'قيد المراجعة' : ad.status === 'rejected' ? 'مرفوض' : 'منتهي'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {ad.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(ad.id)} className="btn btn-primary" style={{ padding: '6px', minWidth: 'auto' }} title="قبول">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleReject(ad.id)} className="btn btn-danger" style={{ padding: '6px', minWidth: 'auto' }} title="رفض">
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(ad.id)} className="btn btn-danger" style={{ padding: '6px', minWidth: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: 'red' }} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ads.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد إعلانات حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Ad Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                            <h2 style={{ margin: 0 }}>إضافة إعلان جديد</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label className="input-label">العنوان</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label className="input-label">رابط الصورة (URL)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label className="input-label">رابط التوجيه (اختياري)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label className="input-label">الموضع</label>
                                <select
                                    className="input-field"
                                    value={formData.placement}
                                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                                >
                                    <option value="home_banner">البنر الرئيسي بالرئيسية</option>
                                    <option value="search_top">أعلى نتائج البحث</option>
                                    <option value="category_inside">داخل التصنيف</option>
                                    <option value="between_products">بين المنتجات</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label className="input-label">المتجر المرتبط</label>
                                <select
                                    className="input-field"
                                    required
                                    value={formData.storeId}
                                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                                >
                                    <option value="">اختر متجراً...</option>
                                    {stores.map(store => (
                                        <option key={store.id} value={store.id}>{store.nameAr}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="input-group">
                                    <label className="input-label">تاريخ البدء</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">تاريخ الانتهاء</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '24px' }}>
                                <label className="input-label">التكلفة (ريال)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ الإعلان</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
