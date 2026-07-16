import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'إلكترونيات', leads: 400 },
  { name: 'ملابس', leads: 300 },
  { name: 'عطور', leads: 200 },
  { name: 'أحذية', leads: 278 },
  { name: 'أثاث', leads: 189 },
];

const Reports = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>التقارير والإحصائيات المتقدمة</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ height: '400px' }}>
          <h3 style={{ marginBottom: '24px' }}>أكثر الأقسام طلباً (Leads)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip />
              <Bar dataKey="leads" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '24px' }}>أفضل التجار (الأكثر تفاعلاً)</h3>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>
            سيتم عرض قائمة بأفضل التجار هنا
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
