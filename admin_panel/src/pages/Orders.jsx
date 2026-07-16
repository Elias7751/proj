import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <span className="badge badge-primary">طلب جديد</span>;
      case 'contacted': return <span className="badge badge-warning">تم التواصل</span>;
      case 'in_progress': return <span className="badge badge-warning">قيد التنفيذ</span>;
      case 'completed': return <span className="badge badge-success">تم الاتفاق</span>;
      case 'cancelled': return <span className="badge badge-danger">ملغي</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>إدارة الطلبات (Leads)</h1>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="input-group" style={{ flex: 1, margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" placeholder="ابحث برقم الطلب أو اسم العميل..." style={{ paddingRight: '40px' }} />
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
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>المتجر</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 'bold' }}>{order.orderNumber}</td>
                  <td>
                    <div>{order.user?.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.user?.phone}</div>
                  </td>
                  <td>{order.store?.nameAr}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{order.totalAmount} ريال</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        className="input-field"
                        style={{ padding: '4px 8px', margin: 0, minWidth: '120px', fontSize: '12px' }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="new">طلب جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="completed">تم الاتفاق</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <button className="btn" style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }} title="عرض التفاصيل">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    لا توجد طلبات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
