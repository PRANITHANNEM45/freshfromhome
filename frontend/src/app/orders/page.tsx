"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`${API_URL}/api/orders/my`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error(err));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return '#34d399';
            case 'Delivered': return '#60a5fa';
            case 'Cancelled': return '#f87171';
            default: return '#fbbf24';
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>
            {orders.length === 0 ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="card glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id}</span>
                                <span style={{
                                    color: getStatusColor(order.status),
                                    fontWeight: 600,
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${getStatusColor(order.status)}`
                                }}>{order.status}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                            {order.paymentMethod && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                    💳 Payment: <strong>{order.paymentMethod}</strong> {order.paymentRef ? `(${order.paymentRef})` : ''}
                                </p>
                            )}
                            {order.shippingAddress && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    📍 Delivery to: {order.shippingAddress}
                                </p>
                            )}
                            <p style={{ fontWeight: 'bold', marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                Total: ₹{order.totalAmount}
                            </p>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                {order.SaleItems?.map((item: any) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                        <span>{item.Product?.name} x {item.quantity}</span>
                                        <span>₹{item.subtotal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
