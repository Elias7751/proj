import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/axios';

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/support/tickets/all');
            setTickets(response.data.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/support/tickets/${id}/status`, { status });
            fetchTickets();
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, status });
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    const handleViewTicket = async (id) => {
        try {
            const response = await api.get(`/support/tickets/${id}`);
            setSelectedTicket(response.data.data);
        } catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return;
        setReplying(true);
        try {
            await api.post(`/support/tickets/${selectedTicket.id}/reply`, { message: replyMessage });
            setReplyMessage('');
            handleViewTicket(selectedTicket.id); // Refresh ticket details
            fetchTickets(); // Refresh list to update status if it changed
        } catch (error) {
            console.error('Error replying to ticket:', error);
        } finally {
            setReplying(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="badge badge-primary">مفتوحة</span>;
            case 'in_progress': return <span className="badge badge-warning">قيد المعالجة</span>;
            case 'resolved': return <span className="badge badge-success">تم الحل</span>;
            case 'closed': return <span className="badge badge-danger">مغلقة</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'low': return <span style={{ color: 'gray' }}>منخفضة</span>;
            case 'medium': return <span style={{ color: 'blue' }}>متوسطة</span>;
            case 'high': return <span style={{ color: 'orange' }}>عالية</span>;
            case 'urgent': return <span style={{ color: 'red', fontWeight: 'bold' }}>عاجلة</span>;
            default: return <span>{priority}</span>;
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>جاري التحميل...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>تذاكر الدعم الفني</h1>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Tickets List */}
                <div className="glass-card" style={{ flex: selectedTicket ? '1' : '100%', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div className="input-group" style={{ flex: 1, margin: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input type="text" className="input-field" placeholder="ابحث برقم التذكرة أو اسم المستخدم..." style={{ paddingRight: '40px' }} />
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>رقم التذكرة</th>
                                    <th>المستخدم</th>
                                    <th>الموضوع</th>
                                    <th>الأهمية</th>
                                    <th>الحالة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} style={{ background: selectedTicket?.id === ticket.id ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                                        <td style={{ fontWeight: 'bold' }}>#{ticket.id.substring(0, 8)}</td>
                                        <td>
                                            <div>{ticket.user?.fullName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.user?.role === 'store_owner' ? 'تاجر' : 'عميل'}</div>
                                        </td>
                                        <td>{ticket.title}</td>
                                        <td>{getPriorityBadge(ticket.priority)}</td>
                                        <td>{getStatusBadge(ticket.status)}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                style={{ padding: '6px', minWidth: 'auto', background: 'var(--bg-color)' }}
                                                title="عرض التفاصيل"
                                                onClick={() => handleViewTicket(ticket.id)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                            لا توجد تذاكر حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ticket Details Sidebar */}
                {selectedTicket && (
                    <div className="glass-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>تفاصيل التذكرة</h3>
                            <button className="btn" style={{ padding: '4px', background: 'transparent', border: 'none' }} onClick={() => setSelectedTicket(null)}>
                                <XCircle size={20} color="var(--text-muted)" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 8px 0' }}>{selectedTicket.title}</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{selectedTicket.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            <select
                                className="input-field"
                                style={{ padding: '6px 12px', margin: 0, flex: 1 }}
                                value={selectedTicket.status}
                                onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                            >
                                <option value="open">مفتوحة</option>
                                <option value="in_progress">قيد المعالجة</option>
                                <option value="resolved">تم الحل</option>
                                <option value="closed">مغلقة</option>
                            </select>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {selectedTicket.replies?.map((reply) => (
                                <div key={reply.id} style={{
                                    background: reply.user?.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-color)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    alignSelf: reply.user?.role === 'admin' ? 'flex-start' : 'flex-end',
                                    width: '85%'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong style={{ fontSize: '13px' }}>{reply.user?.fullName}</strong>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {new Date(reply.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{reply.message}</p>
                                </div>
                            ))}
                            {selectedTicket.replies?.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '32px' }}>
                                    لا توجد ردود حتى الآن
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <textarea
                                className="input-field"
                                placeholder="اكتب ردك هنا..."
                                style={{ height: '80px', resize: 'none', marginBottom: '8px' }}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                            />
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                                onClick={handleReply}
                                disabled={replying || !replyMessage.trim()}
                            >
                                <MessageCircle size={18} />
                                {replying ? 'جاري الإرسال...' : 'إرسال الرد'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tickets;
