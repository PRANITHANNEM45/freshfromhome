"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';

interface SaleItem {
    id: number;
    quantity: number;
    priceAtSale: number;
    subtotal: number;
    Product?: {
        name: string;
        unit: string;
        image?: string;
    };
}

interface Order {
    id: number;
    date: string;
    totalAmount: number;
    status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
    paymentMethod: string;
    shippingAddress: string;
    customerName?: string;
    customerMobile?: string;
    paymentRef?: string;
    paymentStatus?: string;
    createdAt: string;
    User?: {
        username: string;
    };
    SaleItems?: SaleItem[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled'>('All');
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    const fetchOrders = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching admin orders:', err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateOrderStatus = async (id: number, newStatus: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setActionLoadingId(id);
            const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Failed to update status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredOrders = filter === 'All'
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter.toLowerCase());

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' };
            case 'Delivered':
                return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6' };
            case 'Cancelled':
                return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444' };
            default: // Pending
                return { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' };
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Manage Customer Orders</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Live queue of incoming orders for delivery & fulfillment
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}
                    disabled={loading}
                >
                    🔄 Refresh Orders
                </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {(['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'] as const).map(tab => {
                    const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
                    const isActive = filter === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                                background: isActive ? 'var(--primary)' : 'var(--surface)',
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Loading live orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        {filter === 'All' ? 'No customer orders received yet.' : `No orders with status "${filter}".`}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredOrders.map(order => {
                        const orderDate = new Date(order.createdAt || order.date).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        });

                        return (
                            <div
                                key={order.id}
                                className="card glass"
                                style={{
                                    borderLeft: `4px solid ${order.status === 'Confirmed' ? '#10b981' : order.status === 'Delivered' ? '#3b82f6' : order.status === 'Cancelled' ? '#ef4444' : '#fbbf24'}`
                                }}
                            >
                                {/* Order Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                Order #{order.id}
                                            </span>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    ...getStatusStyle(order.status)
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                                            Placed on {orderDate}
                                        </span>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            ₹{order.totalAmount}
                                        </span>
                                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {order.paymentMethod ? `${order.paymentMethod}` : 'Cash on Delivery'}
                                        </span>
                                        {order.paymentRef && (
                                            <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.2rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {order.paymentRef}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Body: 2 Columns (Customer & Items) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {/* Customer & Address Details */}
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            Customer & Delivery Details
                                        </h4>
                                        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                                            {order.customerName || order.User?.username || 'Customer'}
                                        </p>
                                        {order.customerMobile && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                📞 <a href={`tel:${order.customerMobile}`} style={{ color: 'var(--secondary)' }}>{order.customerMobile}</a>
                                            </p>
                                        )}
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                            📍 <strong>Delivery Address:</strong>
                                            <div style={{ marginTop: '0.25rem', color: 'var(--text-main)' }}>
                                                {order.shippingAddress || 'Address not provided'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Ordered */}
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            Items Ordered ({order.SaleItems?.length || 0})
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {order.SaleItems && order.SaleItems.length > 0 ? (
                                                order.SaleItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            fontSize: '0.9rem',
                                                            paddingBottom: '0.25rem',
                                                            borderBottom: '1px dashed var(--border)'
                                                        }}
                                                    >
                                                        <span>
                                                            <strong>{item.Product?.name || 'Product'}</strong> × {item.quantity} {item.Product?.unit || ''}
                                                        </span>
                                                        <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No item details recorded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                                    {order.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                                                disabled={actionLoadingId === order.id}
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                                            >
                                                {actionLoadingId === order.id ? 'Updating...' : '✓ Confirm Order'}
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                                disabled={actionLoadingId === order.id}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.9rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                                    background: 'transparent',
                                                    color: '#f87171',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'Confirmed' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                            disabled={actionLoadingId === order.id}
                                            style={{
                                                padding: '0.5rem 1.25rem',
                                                fontSize: '0.9rem',
                                                borderRadius: 'var(--radius)',
                                                border: 'none',
                                                background: '#3b82f6',
                                                color: '#fff',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {actionLoadingId === order.id ? 'Updating...' : '🚚 Mark as Delivered'}
                                        </button>
                                    )}

                                    {order.status === 'Delivered' && (
                                        <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, alignSelf: 'center' }}>
                                            ✓ Completed & Delivered
                                        </span>
                                    )}

                                    {order.status === 'Cancelled' && (
                                        <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600, alignSelf: 'center' }}>
                                            ✕ Cancelled
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

