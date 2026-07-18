import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import api from '../api/axios';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nameAr: '',
        nameEn: '',
        description: '',
        image: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/categories', formData);
            alert('تم إضافة التصنيف بنجاح');
            setShowModal(false);
            setFormData({ nameAr: '', nameEn: '', description: '', image: '' });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('حدث خطأ أثناء حفظ التصنيف');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة التصنيفات</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    إضافة تصنيف جديد
                </button>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>الاسم (عربي)</th>
                                <th>الاسم (إنجليزي)</th>
                                <th>الوصف</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {category.image ? (
                                                <img src={category.image} alt={category.nameAr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <ImageIcon size={24} color="var(--text-muted)" />
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{category.nameAr}</td>
                                    <td dir="ltr" style={{ textAlign: 'right' }}>{category.nameEn}</td>
                                    <td>{category.description || '---'}</td>
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
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد تصنيفات حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>إضافة تصنيف جديد</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>الاسم (عربي) *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>الاسم (إنجليزي)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    dir="ltr"
                                    value={formData.nameEn}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>الوصف</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <label>صورة التصنيف</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input-field"
                                    onChange={handleImageChange}
                                />
                                {formData.image && (
                                    <div style={{ marginTop: '12px', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: 'var(--bg-color)' }}>
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

export default Categories;
