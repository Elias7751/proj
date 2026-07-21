import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../api/axios';

const LegalSettings = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        privacy_policy: '',
        terms_conditions: '',
        customer_guide: '',
        merchant_guide: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            const data = res.data.data;
            setSettings({
                privacy_policy: data.privacy_policy || '',
                terms_conditions: data.terms_conditions || '',
                customer_guide: data.customer_guide || '',
                merchant_guide: data.merchant_guide || ''
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert('فشل في تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', settings);
            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('فشل في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>جاري التحميل...</div>;
    }

    const tabs = [
        { id: 0, label: 'سياسة الخصوصية', key: 'privacy_policy' },
        { id: 1, label: 'الشروط والأحكام', key: 'terms_conditions' },
        { id: 2, label: 'دليل العميل', key: 'customer_guide' },
        { id: 3, label: 'دليل التاجر', key: 'merchant_guide' }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إعدادات الصفحات القانونية والأدلة</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Save size={20} />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>

            <div className="glass-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTabIndex(tab.id)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: tabIndex === tab.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                color: tabIndex === tab.id ? 'var(--primary-color)' : 'var(--text-color)',
                                border: 'none',
                                borderBottom: tabIndex === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: tabIndex === tab.id ? 'bold' : 'normal',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ minHeight: '500px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                    ملاحظة: يمكنك استخدام أكواد HTML لتنسيق النص (مثل &lt;h2&gt; للعناوين، &lt;p&gt; للفقرات، &lt;b&gt; للخط العريض).
                </p>

                <textarea
                    style={{
                        width: '100%',
                        height: '400px',
                        padding: '16px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        resize: 'vertical'
                    }}
                    value={settings[tabs[tabIndex].key]}
                    onChange={(e) => handleChange(tabs[tabIndex].key, e.target.value)}
                    placeholder={`أدخل نص ${tabs[tabIndex].label} هنا (يدعم HTML)...`}
                />
            </div>
        </div>
    );
};

export default LegalSettings;
