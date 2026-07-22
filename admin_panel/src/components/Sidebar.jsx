import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Settings, LogOut, CreditCard, ShoppingBag, Package, Bell, Shield, FileText, Activity, Star, Image, ListTree, MapPin, MessageCircle, StarHalf, Tag } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '24px' }}>Sellink</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>لوحة تحكم الإدارة</p>
            </div>

            <nav>
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                    <LayoutDashboard size={20} />
                    <span>لوحة القيادة</span>
                </NavLink>
                <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Users size={20} />
                    <span>العملاء</span>
                </NavLink>
                <NavLink to="/merchants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Store size={20} />
                    <span>التجار والمتاجر</span>
                </NavLink>
                <NavLink to="/featured-stores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Star size={20} />
                    <span>المتاجر المميزة</span>
                </NavLink>
                <NavLink to="/banners" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Image size={20} />
                    <span>إعلانات البنرات</span>
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <ListTree size={20} />
                    <span>التصنيفات</span>
                </NavLink>
                <NavLink to="/cities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <MapPin size={20} />
                    <span>المحافظات والمناطق</span>
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Package size={20} />
                    <span>المنتجات</span>
                </NavLink>
                <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <ShoppingBag size={20} />
                    <span>الطلبات (Leads)</span>
                </NavLink>
                <NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <CreditCard size={20} />
                    <span>خطط الاشتراكات</span>
                </NavLink>
                <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Bell size={20} />
                    <span>الإشعارات</span>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FileText size={20} />
                    <span>التقارير</span>
                </NavLink>
                <NavLink to="/logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Activity size={20} />
                    <span>سجل النشاطات</span>
                </NavLink>
                <NavLink to="/admins" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Shield size={20} />
                    <span>المشرفين والصلاحيات</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <Settings size={20} />
                    <span>إعدادات النظام</span>
                </NavLink>
                <NavLink to="/legal-settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FileText size={20} />
                    <span>الصفحات القانونية</span>
                </NavLink>
            </nav>

            <button onClick={onLogout} className="btn btn-danger" style={{ width: '100%', marginTop: 'auto' }}>
                <LogOut size={18} />
                تسجيل الخروج
            </button>
        </aside>
    );
};

export default Sidebar;
