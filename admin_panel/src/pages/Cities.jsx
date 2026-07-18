import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, X } from 'lucide-react';
import api from '../api/axios';

const Cities = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [selectedCityId, setSelectedCityId] = useState(null);

    const [cityForm, setCityForm] = useState({ nameAr: '', nameEn: '', deliveryFee: 0 });
    const [areaForm, setAreaForm] = useState({ nameAr: '', nameEn: '', deliveryFee: 0 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await api.get('/cities');
            setCities(response.data.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCitySubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/cities', cityForm);
            alert('تم إضافة المحافظة بنجاح');
            setShowCityModal(false);
            setCityForm({ nameAr: '', nameEn: '', deliveryFee: 0 });
            fetchCities();
        } catch (error) {
            console.error('Error saving city:', error);
            alert('حدث خطأ أثناء حفظ المحافظة');
        } finally {
            setSaving(false);
        }
    };

    const handleAreaSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCityId) return;
        setSaving(true);
        try {
            await api.post(`/cities/${selectedCityId}/areas`, areaForm);
            alert('تم إضافة المنطقة بنجاح');
            setShowAreaModal(false);
            setAreaForm({ nameAr: '', nameEn: '', deliveryFee: 0 });
            fetchCities();
        } catch (error) {
            console.error('Error saving area:', error);
            alert('حدث خطأ أثناء حفظ المنطقة');
        } finally {
            setSaving(false);
        }
    };

    const openAreaModal = (cityId) => {
        setSelectedCityId(cityId);
        setShowAreaModal(true);
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة المحافظات والمناطق</h1>
                <button className="btn btn-primary" onClick={() => setShowCityModal(true)}>
                    <Plus size={18} />
                    إضافة محافظة جديدة
                </button>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
                {cities.map((city) => (
                    <div key={city.id} className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '20px' }}>{city.nameAr}</h2>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{city.nameEn}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ background: 'var(--bg-color)', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold' }}>
                                    رسوم التوصيل: {city.deliveryFee} ريال
                                </div>
                                <button className="btn" onClick={() => openAreaModal(city.id)} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <Plus size={16} /> إضافة منطقة
                                </button>
                            </div>
                        </div>

                        {city.areas && city.areas.length > 0 ? (
                            <div className="table-container" style={{ margin: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>المنطقة / المديرية</th>
                                            <th>الاسم (إنجليزي)</th>
                                            <th>رسوم التوصيل الإضافية</th>
                                            <th>إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {city.areas.map(area => (
                                            <tr key={area.id}>
                                                <td style={{ fontWeight: 'bold' }}>{area.nameAr}</td>
                                                <td dir="ltr" style={{ textAlign: 'right' }}>{area.nameEn}</td>
                                                <td>{area.deliveryFee} ريال</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn" style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }} title="تعديل">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn btn-danger" style={{ padding: '6px', minWidth: 'auto' }} title="حذف">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', background: 'var(--bg-color)', borderRadius: '8px' }}>
                                لا توجد مناطق مضافة لهذه المحافظة
                            </div>
                        )}
                    </div>
                ))}

                {cities.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        لا توجد محافظات مضافة حالياً. ابدأ بإضافة محافظة جديدة.
                    </div>
                )}
            </div>

            {/* City Modal */}
            {showCityModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>إضافة محافظة جديدة</h2>
                            <button onClick={() => setShowCityModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCitySubmit}>
                            <div className="input-group">
                                <label>اسم المحافظة (عربي) *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={cityForm.nameAr}
                                    onChange={(e) => setCityForm({ ...cityForm, nameAr: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>اسم المحافظة (إنجليزي)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    dir="ltr"
                                    value={cityForm.nameEn}
                                    onChange={(e) => setCityForm({ ...cityForm, nameEn: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>رسوم التوصيل الافتراضية (ريال)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={cityForm.deliveryFee}
                                    onChange={(e) => setCityForm({ ...cityForm, deliveryFee: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'جاري الحفظ...' : 'حفظ المحافظة'}
                                </button>
                                <button type="button" onClick={() => setShowCityModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Area Modal */}
            {showAreaModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>إضافة منطقة / مديرية</h2>
                            <button onClick={() => setShowAreaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAreaSubmit}>
                            <div className="input-group">
                                <label>اسم المنطقة (عربي) *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={areaForm.nameAr}
                                    onChange={(e) => setAreaForm({ ...areaForm, nameAr: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>اسم المنطقة (إنجليزي)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    dir="ltr"
                                    value={areaForm.nameEn}
                                    onChange={(e) => setAreaForm({ ...areaForm, nameEn: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>رسوم التوصيل (ريال)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={areaForm.deliveryFee}
                                    onChange={(e) => setAreaForm({ ...areaForm, deliveryFee: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'جاري الحفظ...' : 'حفظ المنطقة'}
                                </button>
                                <button type="button" onClick={() => setShowAreaModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cities;
