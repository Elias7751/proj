import React, { useState, useEffect } from 'react';
import { Activity, Trash2, Edit, CheckCircle, XCircle, User, Star, LogIn, Store } from 'lucide-react';
import api from '../api/axios';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'قبول':
      case 'إلغاء حظر':
        return { icon: CheckCircle, color: 'var(--success)' };
      case 'رفض':
      case 'حظر':
        return { icon: XCircle, color: 'var(--danger)' };
      case 'تسجيل حساب جديد':
        return { icon: User, color: 'var(--primary-color)' };
      case 'تسجيل الدخول':
        return { icon: LogIn, color: '#4F46E5' };
      case 'إنشاء متجر':
        return { icon: Store, color: '#10B981' };
      case 'تمييز':
      case 'إلغاء تمييز':
        return { icon: Star, color: '#D97706' };
      default:
        return { icon: Activity, color: 'var(--text-muted)' };
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>سجل النشاطات (Audit Logs)</h1>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>النشاط</th>
                <th>التفاصيل</th>
                <th>بواسطة</th>
                <th>عنوان IP</th>
                <th>التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const style = getActionStyle(log.action);
                const Icon = style.icon;
                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: style.color, fontWeight: 'bold' }}>
                        <Icon size={16} />
                        {log.action}
                      </div>
                    </td>
                    <td>{log.details}</td>
                    <td>
                      {log.user ? (
                        <div>
                          <div style={{ fontWeight: '600' }}>{log.user.fullName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.user.phone} ({log.user.role === 'admin' ? 'مشرف' : log.user.role === 'store_owner' ? 'تاجر' : 'عميل'})</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>غير معروف</span>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px' }}>
                        {log.ipAddress || 'N/A'}
                      </code>
                    </td>
                    <td dir="ltr" style={{ textAlign: 'right' }}>
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    لا توجد سجلات نشاطات حالياً.
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

export default Logs;
