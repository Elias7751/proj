import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import { Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
            const res = await axios.get('http://localhost:5000/api/v1/settings');
            const data = res.data.data;
            setSettings({
                privacy_policy: data.privacy_policy || '',
                terms_conditions: data.terms_conditions || '',
                customer_guide: data.customer_guide || '',
                merchant_guide: data.merchant_guide || ''
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('فشل في تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/v1/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('فشل في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    إعدادات الصفحات القانونية والأدلة
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save size={20} />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={(e, newValue) => setTabIndex(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="سياسة الخصوصية" />
                    <Tab label="الشروط والأحكام" />
                    <Tab label="دليل العميل" />
                    <Tab label="دليل التاجر" />
                </Tabs>
            </Paper>

            <Paper sx={{ p: 3, minHeight: '500px' }}>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    ملاحظة: يمكنك استخدام أكواد HTML لتنسيق النص (مثل &lt;h2&gt; للعناوين، &lt;p&gt; للفقرات، &lt;b&gt; للخط العريض).
                </Typography>

                {tabIndex === 0 && (
                    <textarea
                        style={{ width: '100%', height: '400px', padding: '15px', fontFamily: 'monospace', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={settings.privacy_policy}
                        onChange={(e) => handleChange('privacy_policy', e.target.value)}
                        placeholder="أدخل نص سياسة الخصوصية هنا (يدعم HTML)..."
                    />
                )}
                {tabIndex === 1 && (
                    <textarea
                        style={{ width: '100%', height: '400px', padding: '15px', fontFamily: 'monospace', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={settings.terms_conditions}
                        onChange={(e) => handleChange('terms_conditions', e.target.value)}
                        placeholder="أدخل نص الشروط والأحكام هنا (يدعم HTML)..."
                    />
                )}
                {tabIndex === 2 && (
                    <textarea
                        style={{ width: '100%', height: '400px', padding: '15px', fontFamily: 'monospace', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={settings.customer_guide}
                        onChange={(e) => handleChange('customer_guide', e.target.value)}
                        placeholder="أدخل نص دليل العميل هنا (يدعم HTML)..."
                    />
                )}
                {tabIndex === 3 && (
                    <textarea
                        style={{ width: '100%', height: '400px', padding: '15px', fontFamily: 'monospace', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={settings.merchant_guide}
                        onChange={(e) => handleChange('merchant_guide', e.target.value)}
                        placeholder="أدخل نص دليل التاجر هنا (يدعم HTML)..."
                    />
                )}
            </Paper>
        </Box>
    );
};

export default LegalSettings;
