"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use the admin endpoint for now but filter by user on backend normally.
        // Since we didn't make a specific 'my-orders' endpoint yet, let's make one or filter the admin one?
        // Actually, distinct endpoint is better. Let's assume /api/orders/my exist or create it.
        // For now, let's fetch from a new endpoint we will create: GET /api/orders/my
        fetch('http://localhost:5000/api/orders/my', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>My Applications / Orders</h1>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="card glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                <span style={{
                                    color: order.status === 'Confirmed' ? '#34d399' : '#fbbf24',
                                    fontWeight: 600
                                }}>{order.status}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>Total: ₹{order.totalAmount}</p>
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
