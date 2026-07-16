import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', status: 'active' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشرف؟')) {
      try {
        await api.delete(`/admin/admins/${id}`);
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert(error.response?.data?.message || 'فشل حذف المشرف');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setFormData({ fullName: '', email: '', phone: '', password: '', status: 'active' });
    setShowModal(true);
  };

  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '', // Leave empty unless changing
      status: admin.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        // Update
        await api.put(`/admin/admins/${editingAdmin.id}`, formData);
      } else {
        // Create
        if (!formData.password) {
          alert('يرجى إدخال كلمة المرور للمشرف الجديد');
          return;
        }
        await api.post('/admin/admins', formData);
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      alert(error.response?.data?.message || 'فشل حفظ بيانات المشرف');
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>المشرفين والصلاحيات</h1>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          إضافة مشرف جديد
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        <Shield size={20} />
                      </div>
                      <span style={{ fontWeight: '600' }}>{admin.fullName}</span>
                    </div>
                  </td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{admin.phone}</td>
                  <td>{admin.email || 'غير محدد'}</td>
                  <td>
                    <span className={`badge ${admin.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {admin.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(admin)}
                        className="btn"
                        style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }}
                        title="تعديل الصلاحيات"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px', minWidth: 'auto' }}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    لا يوجد مشرفين حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{editingAdmin ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>رقم الهاتف</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>كلمة المرور {editingAdmin && '(اتركها فارغة إذا لم تكن تريد تغييرها)'}</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
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
                  <option value="blocked">غير نشط</option>
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

export default Admins;
