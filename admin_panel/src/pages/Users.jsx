import React from 'react';
import { Search, Filter } from 'lucide-react';

const Users = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة المستخدمين</h1>
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
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                م
                                            </div>
                                            <span style={{ fontWeight: '600' }}>مستخدم تجريبي {item}</span>
                                        </div>
                                    </td>
                                    <td>77700000{item}</td>
                                    <td>
                                        <span className={`badge ${item % 2 === 0 ? 'badge-warning' : 'badge-success'}`}>
                                            {item % 2 === 0 ? 'تاجر' : 'عميل'}
                                        </span>
                                    </td>
                                    <td>10 أكتوبر 2023</td>
                                    <td><span className="badge badge-success">نشط</span></td>
                                    <td>
                                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                            حظر
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
