import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
        } catch (err) {
            setError('Invalid email or password');
        }
        setLoading(false);
    };

    const accounts = [
        { role: 'Admin', email: 'admin@gmail.com' },
        { role: 'Contractor', email: 'contractor@gmail.com' },
        { role: 'Client', email: 'client@gmail.com' },
        { role: 'QS', email: 'qs@gmail.com' },
        { role: 'Foreman', email: 'foreman@gmail.com' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>🏗️ ConstructMS</h1>
                    <p style={styles.subtitle}>Construction Management System</p>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={styles.accounts}>
                    <p style={styles.accountsTitle}>Test Accounts (password: 1234)</p>
                    {accounts.map(a => (
                        <div key={a.role} style={styles.accountRow}
                            onClick={() => setEmail(a.email)}>
                            <span style={styles.role}>{a.role}</span>
                            <span style={styles.email}>{a.email}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: { background: '#16213e', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
    header: { textAlign: 'center', marginBottom: 24 },
    title: { color: '#f39c12', fontSize: 28, margin: 0 },
    subtitle: { color: '#888', marginTop: 8 },
    error: { background: '#e74c3c22', border: '1px solid #e74c3c', color: '#e74c3c', padding: 12, borderRadius: 8, marginBottom: 16 },
    field: { marginBottom: 16 },
    label: { color: '#aaa', fontSize: 14, display: 'block', marginBottom: 6 },
    input: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #333', background: '#0f3460', color: '#fff', fontSize: 16, boxSizing: 'border-box' },
    button: { width: '100%', padding: 14, background: '#f39c12', color: '#000', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 8 },
    accounts: { marginTop: 24, borderTop: '1px solid #333', paddingTop: 16 },
    accountsTitle: { color: '#666', fontSize: 12, marginBottom: 8 },
    accountRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', marginBottom: 4, background: '#0f3460' },
    role: { color: '#f39c12', fontWeight: 'bold', fontSize: 13 },
    email: { color: '#aaa', fontSize: 13 },
};