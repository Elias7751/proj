import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Store, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const data = [
    { name: 'السبت', sales: 4000 },
    { name: 'الأحد', sales: 3000 },
    { name: 'الإثنين', sales: 2000 },
    { name: 'الثلاثاء', sales: 2780 },
    { name: 'الأربعاء', sales: 1890 },
    { name: 'الخميس', sales: 2390 },
    { name: 'الجمعة', sales: 3490 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
            backgroundColor: `${color}20`,
            color: color,
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={32} />
        </div>
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        stores: 0,
        products: 0,
        orders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data.data.counts);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '32px' }}>نظرة عامة</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <StatCard title="إجمالي المستخدمين" value={stats.users} icon={Users} color="#00BFA5" />
                <StatCard title="الطلبات (Leads)" value={stats.orders} icon={ShoppingBag} color="#3498db" />
                <StatCard title="المتاجر النشطة" value={stats.stores} icon={Store} color="#9b59b6" />
                <StatCard title="إجمالي المنتجات" value={stats.products} icon={TrendingUp} color="#f1c40f" />
            </div>

            <div className="glass-card" style={{ height: '400px', padding: '24px' }}>
                <h3 style={{ marginBottom: '24px' }}>المبيعات خلال الأسبوع</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#00BFA5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#00BFA5" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
