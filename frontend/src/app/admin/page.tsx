"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role === 'customer') {
            router.push('/shop');
        }
    }, [user, router]);

    if (!user || user.role === 'customer') return null;

    return (
        <div>
            <header className="header">
                <h1>Admin Dashboard</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card glass">
                    <h3>Total Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</p>
                </div>
                <div className="card glass">
                    <h3>Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹ 8,450</p>
                </div>
            </div>
        </div>
    );
}
