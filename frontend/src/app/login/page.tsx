"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export default function Login() {
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '100px', borderRadius: '12px', marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--primary)' }}>
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {isRegister ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {isRegister ? 'Login' : 'Sign Up'}
                    </span>
                </p>
            </div>
        </div>
    );
}
