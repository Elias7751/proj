import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Edit, Trash2, Package } from 'lucide-react';
import api from '../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/admin/products/${id}/status`);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>إدارة المنتجات</h1>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="input-group" style={{ flex: 1, margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" placeholder="ابحث باسم المنتج أو المتجر..." style={{ paddingRight: '40px' }} />
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
                <th>المنتج</th>
                <th>المتجر</th>
                <th>السعر</th>
                <th>المخزون</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <Package size={20} color="var(--text-muted)" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.category?.nameAr}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.store?.nameAr}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{product.price} ريال</div>
                    {product.discountPrice && <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{product.discountPrice} ريال</div>}
                  </td>
                  <td>{product.stock} {product.unit}</td>
                  <td>
                    <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {product.status === 'active' ? 'ظاهر' : 'مخفي'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(product.id)}
                        className={`btn ${product.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                        style={{ padding: '6px', minWidth: 'auto' }}
                        title={product.status === 'active' ? 'إخفاء' : 'إظهار'}
                      >
                        {product.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="btn" style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }} title="تعديل">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px', minWidth: 'auto' }} title="حذف">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    لا توجد منتجات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
