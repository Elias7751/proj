import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Merchants from './pages/Merchants';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Subscriptions from './pages/Subscriptions';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Logs from './pages/Logs';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import LegalSettings from './pages/LegalSettings';
import Login from './pages/Login';
import FeaturedStores from './pages/FeaturedStores';
import Banners from './pages/Banners';
import Categories from './pages/Categories';
import Cities from './pages/Cities';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="admin-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/merchants" element={<Merchants />} />
            <Route path="/featured-stores" element={<FeaturedStores />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/legal-settings" element={<LegalSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
