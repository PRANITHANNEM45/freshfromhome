"use client";

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const searchParams = useSearchParams();
    const isStaffLogin = searchParams.get('type') === 'staff' || searchParams.get('type') === 'admin';

    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // For staff/admin, registration is strictly disabled
        const endpoint = (!isStaffLogin && isRegister) ? '/api/auth/register' : '/api/auth/login';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Invalid credentials or request failed');

            if (!isStaffLogin && isRegister) {
                setIsRegister(false);
                alert('Registration successful! Please log in with your credentials.');
            } else {
                login(data.token, data.user);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '90px', borderRadius: '12px', marginBottom: '0.75rem' }} />
                    <h2 style={{ color: isStaffLogin ? '#1e3a8a' : 'var(--primary)', fontSize: '1.6rem', marginBottom: '0.35rem' }}>
                        {isStaffLogin ? '🔐 Admin & Staff Login' : (isRegister ? 'Create Customer Account' : 'Customer Login')}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                        {isStaffLogin 
                            ? 'Authorized Staff & Admin Portal' 
                            : (isRegister ? 'Sign up to order fresh farm dairy' : 'Welcome back to FreshFromFarm')}
                    </p>
                </div>

                {isStaffLogin && (
                    <div style={{
                        background: 'rgba(15, 43, 92, 0.08)',
                        border: '1px solid #1e3a8a',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.82rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.45
                    }}>
                        🛡️ <strong>Staff Notice:</strong> Public sign-up is disabled. Staff accounts can only be added by Master Admin (<strong>pranith</strong>).
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.88rem',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder={isStaffLogin ? "Enter staff or admin username" : "Enter customer username"}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            backgroundColor: isStaffLogin ? '#0f2b5c' : undefined,
                            borderColor: isStaffLogin ? '#1e3a8a' : undefined
                        }}
                    >
                        {loading 
                            ? 'Authenticating...' 
                            : (isStaffLogin ? 'Log In to Admin Panel' : (isRegister ? 'Sign Up as Customer' : 'Log In'))
                        }
                    </button>
                </form>

                {/* Account Toggle or Switch Link */}
                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {isStaffLogin ? (
                        <p style={{ margin: 0 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Are you a customer? </span>
                            <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                                Customer Login / Sign Up
                            </Link>
                        </p>
                    ) : (
                        <div>
                            <p style={{ margin: '0 0 0.75rem 0' }}>
                                {isRegister ? 'Already have a customer account? ' : "Don't have an account? "}
                                <span
                                    onClick={() => setIsRegister(!isRegister)}
                                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                >
                                    {isRegister ? 'Log In' : 'Sign Up as Customer'}
                                </span>
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                <Link href="/login?type=staff" style={{ color: '#0f2b5c', textDecoration: 'none', fontWeight: 600 }}>
                                    🔐 Staff or Admin? Log In Here
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>Loading Login...</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
