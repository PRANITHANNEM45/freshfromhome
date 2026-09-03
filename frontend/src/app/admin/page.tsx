"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
}

interface RecentOrder {
    id: number;
    customerName?: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    shippingAddress: string;
    User?: { username: string };
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.role === 'customer') {
            router.push('/shop');
            return;
        }
        loadData();
    }, [user, router, loadData]);

    if (!user || user.role === 'customer') return null;

    return (
        <div>
            <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Welcome back, <strong>{user.username}</strong>! Here is your business overview.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/admin/orders" className="btn btn-primary">
                        📦 View Orders Queue {stats.pendingOrders > 0 && `(${stats.pendingOrders} New)`}
                    </Link>
                    <Link href="/inventory" className="btn glass" style={{ color: 'var(--text-main)' }}>
                        🥬 Inventory & Stock
                    </Link>
                </div>
            </header>

            {/* Pending Alert Banner */}
            {stats.pendingOrders > 0 && (
                <div
                    style={{
                        background: 'rgba(251, 191, 36, 0.15)',
                        border: '1px solid #f59e0b',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔔</span>
                        <div>
                            <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>
                                You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} requiring confirmation!
                            </strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                                Customer orders are waiting to be reviewed and confirmed.
                            </p>
                        </div>
                    </div>
                    <Link href="/admin/orders" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                        Review Orders Now →
                    </Link>
                </div>
            )}

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card glass">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Orders</h3>
                    <p style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                        {loading ? '...' : stats.totalOrders}
                    </p>
                    <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                        {stats.pendingOrders} pending
                    </span>
                </div>

                <div className="card glass">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Revenue</h3>
                    <p style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--primary)' }}>
                        ₹ {loading ? '...' : stats.totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        From all sales
                    </span>
                </div>

                <div className="card glass">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Active Products</h3>
                    <p style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#60a5fa' }}>
                        {loading ? '...' : stats.totalProducts}
                    </p>
                    <Link href="/inventory" style={{ color: 'var(--secondary)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                        Manage inventory
                    </Link>
                </div>

                <div className="card glass">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Registered Customers</h3>
                    <p style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#a78bfa' }}>
                        {loading ? '...' : stats.totalCustomers}
                    </p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Signed up shoppers
                    </span>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="card glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Recent Customer Orders</h2>
                    <Link href="/admin/orders" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                        View All Orders →
                    </Link>
                </div>

                {loading ? (
                    <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Loading recent orders...</p>
                ) : recentOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No orders placed yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Address</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>#{order.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {order.customerName || order.User?.username || 'Customer'}
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '300px', fontSize: '0.9rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.shippingAddress}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            ₹{order.totalAmount}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: order.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.2)' : order.status === 'Delivered' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                                    color: order.status === 'Confirmed' ? '#34d399' : order.status === 'Delivered' ? '#60a5fa' : '#fbbf24'
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <Link href="/admin/orders" className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

