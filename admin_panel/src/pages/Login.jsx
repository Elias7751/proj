import React, { useState } from 'react';
import api from '../api/axios';
import { Lock, Phone, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                phone,
                password
            });

            const { token, user } = response.data.data;

            if (user.role !== 'admin') {
                setError('عذراً، هذا الحساب ليس لديه صلاحيات الإدارة.');
                setLoading(false);
                return;
            }

            localStorage.setItem('adminToken', token);
            onLoginSuccess();
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '40px 32px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ color: 'var(--primary-color)', fontSize: '32px', marginBottom: '8px', fontWeight: '800' }}>Sellink</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>لوحة تحكم الإدارة والمشرفين</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(231, 76, 60, 0.15)',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        color: '#ff6b6b',
                        fontSize: '14px',
                        textAlign: 'right'
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>رقم الهاتف</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.5)' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="777777777"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                style={{
                                    paddingRight: '40px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '32px' }}>
                        <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.5)' }} />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    paddingRight: '40px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 191, 165, 0.4)'
                        }}
                    >
                        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
