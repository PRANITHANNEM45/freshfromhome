"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://YOUR-BACKEND.onrender.com/api/admin/orders', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error(err));
    }, []);

    const confirmOrder = async (id: number) => {
        const token = localStorage.getItem('token');
        await fetch(`http://YOUR-BACKEND.onrender.com/api/admin/orders/${id}/confirm`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Confirmed' } : o));
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manage Orders</h1>
            <div className="card glass">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Address</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>#{order.id}</td>
                                <td style={{ padding: '1rem', maxWidth: '300px' }}>{order.shippingAddress}</td>
                                <td style={{ padding: '1rem' }}>₹{order.totalAmount}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: order.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                        color: order.status === 'Confirmed' ? '#34d399' : '#fbbf24'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {order.status === 'Pending' && (
                                        <button onClick={() => confirmOrder(order.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                            Confirm
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
