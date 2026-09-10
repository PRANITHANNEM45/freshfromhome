"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

interface StaffUser {
    id: number;
    username: string;
    role: string;
    createdAt: string;
}

export default function AdminUsers() {
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<StaffUser[]>([]);
    const [listLoading, setListLoading] = useState(true);

    const isMasterAdmin = user?.role === 'admin' && user?.username?.toLowerCase() === 'pranith';

    const loadStaffUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setListLoading(true);
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (err) {
            console.error('Failed to load staff list:', err);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isMasterAdmin) {
            loadStaffUsers();
        }
    }, [isMasterAdmin, loadStaffUsers]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, role })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create staff member');

            setMsg({ text: `✓ Success: ${role.toUpperCase()} user '${username}' created and licensed successfully!`, type: 'success' });
            setUsername('');
            setPassword('');
            loadStaffUsers();
        } catch (err: any) {
            setMsg({ text: `✕ ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number, staffUsername: string) => {
        if (staffUsername.toLowerCase() === 'pranith') {
            alert('Cannot remove the Master Admin account.');
            return;
        }

        if (!confirm(`Are you sure you want to remove staff member '${staffUsername}'?`)) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setMsg({ text: `✓ Staff member '${staffUsername}' removed.`, type: 'success' });
            loadStaffUsers();
        } catch (err: any) {
            setMsg({ text: `✕ ${err.message}`, type: 'error' });
        }
    };

    if (!isMasterAdmin) {
        return (
            <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
                <div className="card glass" style={{ padding: '2.5rem 1.5rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⛔</div>
                    <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Access Restricted</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
                        Only Master Admin (<strong>pranith</strong>) has the official license to create and manage staff accounts.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        Please log in with the Master Admin account to access staff licensing controls.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>👥 Master Admin Staff Licensing</h1>
                    <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted)' }}>
                        Add and manage authorized staff members who can access the store management dashboard.
                    </p>
                </div>
                <div style={{ background: 'rgba(15, 43, 92, 0.1)', border: '1px solid #1e3a8a', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: '#0f2b5c', fontWeight: 600 }}>
                    👑 Master Admin: <strong>pranith</strong>
                </div>
            </div>

            {msg && (
                <div style={{
                    background: msg.type === 'success' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${msg.type === 'success' ? '#16a34a' : '#ef4444'}`,
                    color: msg.type === 'success' ? '#16a34a' : '#ef4444',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontWeight: 500
                }}>
                    {msg.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                {/* 1. Add Staff Form */}
                <div className="card glass" style={{ padding: '1.75rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                        ➕ License New Staff Member
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Set their login username and temporary password. Only you have permission to do this.
                    </p>

                    <form onSubmit={handleCreate}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                                Staff Username
                            </label>
                            <input
                                className="input"
                                type="text"
                                placeholder="e.g. staff_kiran"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                                Staff Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                                Assigned Role
                            </label>
                            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="staff">Staff (Orders & Inventory)</option>
                                <option value="admin">Admin (Full Dashboard Access)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                marginTop: '0.75rem',
                                padding: '0.85rem',
                                backgroundColor: '#0f2b5c',
                                borderColor: '#1e3a8a'
                            }}
                        >
                            {loading ? 'Licensing Staff...' : '✓ Create & License Staff Member'}
                        </button>
                    </form>
                </div>

                {/* 2. Staff Directory */}
                <div className="card glass" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                            📋 Current Staff Accounts
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Total: {staffList.length}
                        </span>
                    </div>

                    {listLoading ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading staff list...</p>
                    ) : staffList.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No staff members created yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {staffList.map(member => (
                                <div
                                    key={member.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.85rem 1rem',
                                        background: member.username.toLowerCase() === 'pranith' ? 'rgba(15, 43, 92, 0.06)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${member.username.toLowerCase() === 'pranith' ? '#1e3a8a' : 'var(--border)'}`,
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                            {member.username} {member.username.toLowerCase() === 'pranith' && '👑 (You)'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            Role: <span style={{ textTransform: 'uppercase', fontWeight: 600, color: member.role === 'admin' ? '#1e3a8a' : 'var(--primary)' }}>{member.role}</span>
                                        </div>
                                    </div>

                                    {member.username.toLowerCase() !== 'pranith' ? (
                                        <button
                                            onClick={() => handleDelete(member.id, member.username)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.12)',
                                                border: '1px solid #ef4444',
                                                color: '#ef4444',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#1e3a8a', fontWeight: 600 }}>Master Admin</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
