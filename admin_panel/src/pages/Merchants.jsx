import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Trash2, Eye, Store, X, Package, Phone, User } from 'lucide-react';
import api from '../api/axios';

const Merchants = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeProducts, setStoreProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [assigningPlan, setAssigningPlan] = useState(false);

    useEffect(() => {
        fetchStores();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/subscriptions/plans');
            setPlans(response.data.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await api.get('/admin/merchants');
            setStores(response.data.data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/stores/${id}/approve`);
            fetchStores();
            if (selectedStore && selectedStore.id === id) {
                setSelectedStore({ ...selectedStore, status: 'active' });
            }
        } catch (error) {
            console.error('Error approving store:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/admin/stores/${id}/reject`);
            fetchStores();
            if (selectedStore && selectedStore.id === id) {
                setSelectedStore({ ...selectedStore, status: 'rejected' });
            }
        } catch (error) {
            console.error('Error rejecting store:', error);
        }
    };

    const handleViewDetails = async (store) => {
        setSelectedStore(store);
        setShowModal(true);
        setLoadingProducts(true);
        try {
            // Fetch products for this store
            const response = await api.get('/products', {
                params: { storeId: store.id }
            });
            setStoreProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching store products:', error);
            setStoreProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleAssignPlan = async () => {
        if (!selectedPlanId) return alert('يرجى اختيار خطة أولاً');
        setAssigningPlan(true);
        try {
            await api.post('/subscriptions/assign', {
                storeId: selectedStore.id,
                planId: selectedPlanId
            });
            alert('تم تعيين الخطة بنجاح');
            fetchStores(); // Refresh to get updated data
        } catch (error) {
            console.error('Error assigning plan:', error);
            alert('حدث خطأ أثناء تعيين الخطة');
        } finally {
            setAssigningPlan(false);
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة التجار والمتاجر</h1>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div className="input-group" style={{ flex: 1, margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input type="text" className="input-field" placeholder="ابحث باسم المتجر أو رقم الواتساب..." style={{ paddingRight: '40px' }} />
                        </div>
                    </div>
                    <button className="btn" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>
                        <Filter size={18} />
                        تصفية
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>اسم المتجر</th>
                                <th>المالك</th>
                                <th>رقم الواتساب</th>
                                <th>تاريخ التسجيل</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((merchant) => {
                                const store = merchant.stores && merchant.stores.length > 0 ? merchant.stores[0] : null;
                                return (
                                    <tr key={merchant.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Store size={20} color="var(--text-muted)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{store ? store.nameAr : 'لم ينشئ متجراً بعد'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{store ? store.nameEn : '---'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>{merchant.fullName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{merchant.phone}</div>
                                        </td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{store ? store.whatsappNumber : merchant.phone}</td>
                                        <td>{new Date(merchant.createdAt).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            {store ? (
                                                <span className={`badge ${store.status === 'active' ? 'badge-success' : store.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                    {store.status === 'active' ? 'متجر نشط' : store.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning">بدون متجر</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {store && store.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApprove(store.id)} className="btn btn-primary" style={{ padding: '6px', minWidth: 'auto' }} title="قبول">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => handleReject(store.id)} className="btn btn-danger" style={{ padding: '6px', minWidth: 'auto' }} title="رفض">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {store && (
                                                    <button
                                                        onClick={() => handleViewDetails(store)}
                                                        className="btn"
                                                        style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }}
                                                        title="عرض التفاصيل والمعاينة"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد متاجر حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Store Details & Preview Modal */}
            {showModal && selectedStore && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '800px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Store size={28} color="var(--primary-color)" />
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedStore.nameAr}</h2>
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{selectedStore.nameEn}</span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>بيانات المتجر</h3>
                                <p style={{ marginBottom: '8px' }}><strong>الوصف:</strong> {selectedStore.description || 'لا يوجد وصف'}</p>
                                <p style={{ marginBottom: '8px' }}><strong>رقم الواتساب:</strong> <span dir="ltr">{selectedStore.whatsappNumber}</span></p>
                                <p style={{ marginBottom: '8px' }}><strong>الحالة:</strong>
                                    <span className={`badge ${selectedStore.status === 'active' ? 'badge-success' : selectedStore.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ marginRight: '8px' }}>
                                        {selectedStore.status === 'active' ? 'نشط' : selectedStore.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>بيانات المالك</h3>
                                <p style={{ marginBottom: '8px' }}><strong>الاسم:</strong> {selectedStore.owner?.fullName || 'غير معروف'}</p>
                                <p style={{ marginBottom: '8px' }}><strong>الهاتف:</strong> <span dir="ltr">{selectedStore.owner?.phone || 'غير معروف'}</span></p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px', padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>ترقية / تعيين خطة اشتراك</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <select
                                    className="input-field"
                                    style={{ flex: 1, margin: 0 }}
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                >
                                    <option value="">-- اختر الخطة --</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.nameAr} ({plan.price} ريال)</option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAssignPlan}
                                    disabled={assigningPlan || !selectedPlanId}
                                >
                                    {assigningPlan ? 'جاري التعيين...' : 'تعيين الخطة'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={20} color="var(--primary-color)" />
                                منتجات المتجر ({storeProducts.length})
                            </h3>

                            {loadingProducts ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>جاري تحميل المنتجات...</div>
                            ) : storeProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: 'var(--bg-color)', borderRadius: '8px' }}>
                                    لا توجد منتجات مضافة في هذا المتجر حالياً.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                    {storeProducts.map((product) => (
                                        <div key={product.id} style={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '12px', background: 'var(--bg-color)' }}>
                                            <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: '#ddd', marginBottom: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Package size={32} color="#aaa" />
                                                )}
                                            </div>
                                            <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '14px' }}>{product.price} ريال</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>المخزون: {product.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                            {selectedStore.status === 'pending' && (
                                <>
                                    <button onClick={() => handleApprove(selectedStore.id)} className="btn btn-primary" style={{ flex: 1 }}>
                                        <CheckCircle size={18} /> قبول المتجر وتفعيله
                                    </button>
                                    <button onClick={() => handleReject(selectedStore.id)} className="btn btn-danger" style={{ flex: 1 }}>
                                        <XCircle size={18} /> رفض المتجر
                                    </button>
                                </>
                            )}
                            <button onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Merchants;
