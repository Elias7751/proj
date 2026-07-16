import React, { useState } from 'react';
import { Send, Bell } from 'lucide-react';

const Notifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');

  const handleSend = () => {
    // TODO: Call API to send notification
    alert('تم إرسال الإشعار بنجاح');
    setTitle('');
    setMessage('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>إرسال إشعارات (Push Notifications)</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card">
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--primary-color)" />
            إشعار جديد
          </h2>

          <div className="input-group">
            <label>الفئة المستهدفة</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-field">
              <option value="all">جميع المستخدمين (عملاء وتجار)</option>
              <option value="customers">العملاء فقط</option>
              <option value="merchants">التجار فقط</option>
            </select>
          </div>

          <div className="input-group">
            <label>عنوان الإشعار</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="مثال: خصم 50% بمناسبة العيد!" />
          </div>

          <div className="input-group">
            <label>نص الإشعار</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-field" rows="4" placeholder="اكتب تفاصيل الإشعار هنا..."></textarea>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSend}>
            <Send size={18} />
            إرسال الإشعار الآن
          </button>
        </div>

        <div className="glass-card">
          <h2 style={{ marginBottom: '24px' }}>سجل الإشعارات المرسلة</h2>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
            لا توجد إشعارات سابقة
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
