"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export default function AdminUsers() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [msg, setMsg] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
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
            if (!res.ok) throw new Error(data.error);

            setMsg(`Success: ${role} user '${username}' created.`);
            setUsername('');
            setPassword('');
        } catch (err: any) {
            setMsg(`Error: ${err.message}`);
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Add New Admin/Staff</h1>

            <div className="card glass" style={{ maxWidth: '400px' }}>
                {msg && <p style={{ marginBottom: '1rem', color: msg.startsWith('Success') ? 'green' : 'red' }}>{msg}</p>}
                <form onSubmit={handleCreate}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                        <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Create User</button>
                </form>
            </div>
        </div>
    );
}
