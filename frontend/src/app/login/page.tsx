"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export default function Login() {
    const [portalMode, setPortalMode] = useState<'customer' | 'admin'>('customer');
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            if (isRegister) {
                // Auto login after register or ask to login
                setIsRegister(false);
                alert('Registration successful! Please login.');
            } else {
                login(data.token, data.user);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '420px', border: portalMode === 'admin' ? '2px solid #1e3a8a' : '1px solid var(--border)' }}>
                {/* Portal Mode Switcher */}
                <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem', gap: '4px' }}>
                    <button
                        type="button"
                        onClick={() => { setPortalMode('customer'); setIsRegister(false); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem 0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: portalMode === 'customer' ? 'var(--surface)' : 'transparent',
                            color: portalMode === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: portalMode === 'customer' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🛒 Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => { setPortalMode('admin'); setIsRegister(false); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem 0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: portalMode === 'admin' ? '#0f2b5c' : 'transparent',
                            color: portalMode === 'admin' ? '#ffffff' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: portalMode === 'admin' ? '0 2px 8px rgba(15, 43, 92, 0.35)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🛡️ Admin & Staff
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '90px', borderRadius: '12px', marginBottom: '0.75rem' }} />
                    <h2 style={{ color: portalMode === 'admin' ? '#0f2b5c' : 'var(--primary)', marginBottom: '0.25rem' }}>
                        {portalMode === 'admin'
                            ? 'Admin & Staff Portal'
                            : (isRegister ? 'Create Customer Account' : 'Welcome to FreshFromFarm')}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {portalMode === 'admin'
                            ? 'Secure Management & Staff Operations'
                            : (isRegister ? 'Register to place orders and track deliveries' : 'Sign in to your fresh shopping account')}
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            {portalMode === 'admin' ? 'Staff / Admin Username' : 'Username'}
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder={portalMode === 'admin' ? 'e.g. pranith' : 'Your username'}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Enter password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button - Styled in Dark Blue for Admin & Staff */}
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: portalMode === 'admin' ? '#0f2b5c' : 'var(--primary)',
                            color: '#ffffff',
                            border: portalMode === 'admin' ? '1px solid #1e3a8a' : 'none',
                            boxShadow: portalMode === 'admin' ? '0 4px 14px rgba(15, 43, 92, 0.4)' : 'none'
                        }}
                    >
                        {portalMode === 'admin'
                            ? '🛡️ Admin & Staff Log In'
                            : (isRegister ? 'Sign Up as Customer' : 'Log In to Shop')}
                    </button>
                </form>

                {/* Secondary Quick Switch Button on Customer View */}
                {portalMode === 'customer' && !isRegister && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                        <button
                            type="button"
                            onClick={() => { setPortalMode('admin'); setError(''); }}
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #1e3a8a',
                                backgroundColor: '#0f2b5c',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🛡️ Switch to Admin & Staff Login
                        </button>
                    </div>
                )}

                {portalMode === 'customer' && (
                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        <span
                            onClick={() => setIsRegister(!isRegister)}
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {isRegister ? 'Login' : 'Sign Up'}
                        </span>
                    </p>
                )}

                {portalMode === 'admin' && (
                    <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        🔒 Protected Area. Unauthorized access attempts are monitored and rate-limited.
                    </div>
                )}
            </div>
        </div>
    );
}
