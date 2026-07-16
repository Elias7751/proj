import React, { useState, useEffect } from 'react';
import { Search, Filter, Ban, CheckCircle, Eye, User, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', status: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'فشل حذف المستخدم');
      }
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, formData);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'فشل تحديث بيانات المستخدم');
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>إدارة العملاء والمستخدمين</h1>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="input-group" style={{ flex: 1, margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" placeholder="ابحث بالاسم أو رقم الهاتف..." style={{ paddingRight: '40px' }} />
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
                <th>الاسم</th>
                <th>رقم الهاتف</th>
                <th>نوع الحساب</th>
                <th>تاريخ التسجيل</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.fullName ? user.fullName.charAt(0) : <User size={20} />}
                      </div>
                      <span style={{ fontWeight: '600' }}>{user.fullName}</span>
                    </div>
                  </td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{user.phone}</td>
                  <td>
                    <span className={`badge ${user.role === 'store_owner' ? 'badge-warning' : 'badge-success'}`}>
                      {user.role === 'store_owner' ? 'تاجر' : user.role === 'admin' ? 'مشرف' : 'عميل'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {user.status === 'active' ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleBlock(user.id)}
                        className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {user.status === 'active' ? <><Ban size={14} /> حظر</> : <><CheckCircle size={14} /> تفعيل</>}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="btn"
                        style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }}
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    لا يوجد مستخدمين حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>تعديل بيانات المستخدم</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
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
                <label>الحالة</label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">نشط</option>
                  <option value="blocked">محظور</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ التعديلات</button>
                <button type="button" className="btn" onClick={() => setShowEditModal(false)} style={{ flex: 1, background: 'var(--bg-color)' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
