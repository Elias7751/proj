import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Star, CheckCircle, XCircle, Trash2, EyeOff } from 'lucide-react';
import api from '../api/axios';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, store, product
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/reviews/admin/all');
            setReviews(response.data.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`هل أنت متأكد أنك تريد ${status === 'hidden' ? 'إخفاء' : 'إظهار'} هذا التقييم؟`)) return;

        try {
            await api.put(`/reviews/admin/${id}/status`, { status });
            fetchReviews();
        } catch (error) {
            console.error('Error updating review status:', error);
        }
    };

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= rating ? '#F59E0B' : 'transparent'}
                        color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                    />
                ))}
            </div>
        );
    };

    const filteredReviews = reviews.filter(review => {
        const matchesFilter = filter === 'all' || review.targetType === filter;
        const matchesSearch = review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>إدارة التقييمات والمراجعات</h1>
            </div>

            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="ابحث في نص التقييم أو اسم العميل..."
                                style={{ paddingRight: '40px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <select
                        className="input-field"
                        style={{ width: '200px', margin: 0 }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">جميع التقييمات</option>
                        <option value="store">تقييمات المتاجر</option>
                        <option value="product">تقييمات المنتجات</option>
                    </select>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>العميل</th>
                                <th>النوع</th>
                                <th>التقييم</th>
                                <th>التعليق</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.map((review) => (
                                <tr key={review.id} style={{ opacity: review.status === 'hidden' ? 0.6 : 1 }}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{review.user?.fullName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.user?.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${review.targetType === 'store' ? 'badge-primary' : 'badge-success'}`}>
                                            {review.targetType === 'store' ? 'متجر' : 'منتج'}
                                        </span>
                                    </td>
                                    <td>{renderStars(review.rating)}</td>
                                    <td style={{ maxWidth: '300px' }}>
                                        <div style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {review.comment || <span style={{ color: 'var(--text-muted)' }}>بدون تعليق</span>}
                                        </div>
                                        {review.storeReply && (
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--primary-color)',
                                                marginTop: '4px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                <strong>رد المتجر:</strong> {review.storeReply}
                                            </div>
                                        )}
                                    </td>
                                    <td>{new Date(review.createdAt).toLocaleDateString('ar-SA')}</td>
                                    <td>
                                        {review.status === 'active' ? (
                                            <span className="badge badge-success">نشط</span>
                                        ) : review.status === 'hidden' ? (
                                            <span className="badge badge-warning">مخفي</span>
                                        ) : (
                                            <span className="badge badge-danger">مُبلغ عنه</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {review.status === 'active' ? (
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px', minWidth: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                    title="إخفاء التقييم"
                                                    onClick={() => handleUpdateStatus(review.id, 'hidden')}
                                                >
                                                    <EyeOff size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px', minWidth: 'auto', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
                                                    title="إظهار التقييم"
                                                    onClick={() => handleUpdateStatus(review.id, 'active')}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredReviews.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        لا توجد تقييمات مطابقة للبحث
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

export default Reviews;
