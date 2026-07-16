import React, { useState, useEffect } from 'react';
import { Star, Search, Plus, Trash2, Store } from 'lucide-react';
import api from '../api/axios';

const FeaturedStores = () => {
    const [stores, setStores] = useState([]);
    const [featuredStores, setFeaturedStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/admin/stores');
            const allStores = response.data.data;
            setStores(allStores);
            setFeaturedStores(allStores.filter(store => store.isFeatured));
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await api.put(`/admin/stores/${id}/featured`);
            fetchStores();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            alert('فشل تعديل حالة تمييز المتجر');
        }
    };

    const nonFeaturedStores = stores.filter(store => !store.isFeatured && store.status === 'active');
    const filteredNonFeatured = nonFeaturedStores.filter(store =>
        store.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>المتاجر المميزة</h1>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    إضافة متجر مميز
                </button>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>اسم المتجر</th>
                                <th>المالك</th>
                                <th>تاريخ التسجيل</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {featuredStores.map((store) => (
                                <tr key={store.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Store size={20} color="var(--primary-color)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{store.nameAr}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{store.nameEn}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>{store.owner?.fullName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{store.owner?.phone}</div>
                                    </td>
                                    <td>{new Date(store.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={12} fill="currentColor" /> مميز
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleFeatured(store.id)}
                                            className="btn btn-danger"
                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                        >
                                            إزالة من المميزة
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {featuredStores.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد متاجر مميزة حالياً. اضغط على "إضافة متجر مميز" لتمييز متجر.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Featured Store Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'white', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                            <h2 style={{ margin: 0 }}>إضافة متجر إلى القائمة المميزة</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
                        </div>

                        <div className="input-group" style={{ marginBottom: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="ابحث عن متجر بالاسم..."
                                    style={{ paddingRight: '40px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '40vh', overflowY: 'auto', paddingRight: '4px' }}>
                            {filteredNonFeatured.map((store) => (
                                <div key={store.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', background: 'var(--bg-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Store size={20} color="var(--text-muted)" />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{store.nameAr}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{store.nameEn}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleToggleFeatured(store.id);
                                            setShowAddModal(false);
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        إضافة
                                    </button>
                                </div>
                            ))}
                            {filteredNonFeatured.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                    لا توجد متاجر نشطة متاحة للإضافة.
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                            <button onClick={() => setShowAddModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturedStores;
