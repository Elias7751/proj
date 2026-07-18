import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, MessageCircle, Globe, FileText } from 'lucide-react';
import api from '../api/axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    platformName: 'السوق اليمني',
    whatsappMessage: 'مرحباً، أريد الاستفسار عن هذا المنتج:',
    countryCode: '+967',
    enableRegistration: true,
    enableAddingProducts: true,
    enableOrders: true,
    termsAndConditions: '',
    privacyPolicy: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.data && Object.keys(response.data.data).length > 0) {
        setSettings(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>إعدادات النظام</h1>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} />
          حفظ التعديلات
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* إعدادات عامة */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--primary-color)" />
            إعدادات عامة
          </h2>

          <div className="input-group">
            <label>اسم المنصة</label>
            <input type="text" name="platformName" value={settings.platformName} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>شعار المنصة (Logo)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={24} color="var(--text-muted)" />
              </div>
              <button className="btn" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>تغيير الشعار</button>
            </div>
          </div>
        </div>

        {/* إعدادات الواتساب (Lead System) */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} color="#25D366" />
            إعدادات الواتساب (Leads)
          </h2>

          <div className="input-group">
            <label>رمز الدولة الافتراضي</label>
            <input type="text" name="countryCode" value={settings.countryCode} onChange={handleChange} className="input-field" dir="ltr" />
          </div>

          <div className="input-group">
            <label>نص الرسالة الافتراضية</label>
            <textarea name="whatsappMessage" value={settings.whatsappMessage} onChange={handleChange} className="input-field" rows="4"></textarea>
            <small style={{ color: 'var(--text-muted)' }}>سيتم إضافة اسم المنتج وتفاصيله تلقائياً بعد هذا النص.</small>
          </div>
        </div>

        {/* التحكم بالمنصة */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ marginBottom: '24px' }}>التحكم بالمنصة</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="enableRegistration" checked={settings.enableRegistration} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 'bold' }}>السماح بتسجيل مستخدمين جدد</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="enableAddingProducts" checked={settings.enableAddingProducts} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 'bold' }}>السماح للتجار بإضافة منتجات</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="enableOrders" checked={settings.enableOrders} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 'bold' }}>تفعيل زر (تواصل مع التاجر)</span>
            </label>
          </div>
        </div>

        {/* السياسات والشروط */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary-color)" />
            السياسات والشروط
          </h2>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label>شروط وأحكام المنصة</label>
            <textarea
              name="termsAndConditions"
              value={settings.termsAndConditions}
              onChange={handleChange}
              className="input-field"
              rows="6"
              placeholder="اكتب الشروط والأحكام هنا..."
            ></textarea>
          </div>

          <div className="input-group">
            <label>سياسة الخصوصية</label>
            <textarea
              name="privacyPolicy"
              value={settings.privacyPolicy}
              onChange={handleChange}
              className="input-field"
              rows="6"
              placeholder="اكتب سياسة الخصوصية هنا..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
