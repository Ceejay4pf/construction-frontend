import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Home({ user, onLogout, onSelectProject }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', location: '', client_name: '',
        contractor_name: '', budget: '', total_floors: '',
        start_date: '', end_date: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', form);
            setShowForm(false);
            fetchProjects();
        } catch (err) {
            alert('Error creating project');
        }
    };

    const canCreate = ['admin', 'contractor', 'client'].includes(user.role);

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <h2 style={styles.logo}>🏗️ ConstructMS</h2>
                <div style={styles.navRight}>
                    <span style={styles.userInfo}>👤 {user.name} ({user.role})</span>
                    <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.pageHeader}>
                    <h2 style={styles.pageTitle}>Projects</h2>
                    {canCreate && (
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ New Project'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>Create New Project</h3>
                        <form onSubmit={handleCreate}>
                            <div style={styles.formGrid}>
                                {[
                                    { label: 'Project Name', key: 'name' },
                                    { label: 'Location', key: 'location' },
                                    { label: 'Client Name', key: 'client_name' },
                                    { label: 'Contractor Name', key: 'contractor_name' },
                                    { label: 'Budget (KES)', key: 'budget', type: 'number' },
                                    { label: 'Total Floors', key: 'total_floors', type: 'number' },
                                    { label: 'Start Date', key: 'start_date', type: 'date' },
                                    { label: 'End Date', key: 'end_date', type: 'date' },
                                ].map(f => (
                                    <div key={f.key} style={styles.formField}>
                                        <label style={styles.label}>{f.label}</label>
                                        <input
                                            style={styles.input}
                                            type={f.type || 'text'}
                                            value={form[f.key]}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <button style={styles.submitBtn} type="submit">Create Project</button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <p style={styles.loading}>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p style={styles.empty}>No projects yet. Create one!</p>
                ) : (
                    <div style={styles.grid}>
                        {projects.map(p => (
                            <div key={p.id} style={styles.card} onClick={() => onSelectProject(p)}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>{p.name}</h3>
                                    <span style={{...styles.badge, background: p.status === 'active' ? '#27ae60' : '#e67e22'}}>
                                        {p.status}
                                    </span>
                                </div>
                                <p style={styles.cardLocation}>📍 {p.location}</p>
                                <div style={styles.progressBar}>
                                    <div style={{...styles.progressFill, width: `${p.progress}%`}}></div>
                                </div>
                                <p style={styles.progressText}>{p.progress}% Complete</p>
                                <div style={styles.cardFooter}>
                                    <span style={styles.footerItem}>👷 {p.contractor_name}</span>
                                    <span style={styles.footerItem}>🏢 {p.total_floors} Floors</span>
                                </div>
                                <div style={styles.budget}>
                                    <span style={styles.budgetLabel}>Budget:</span>
                                    <span style={styles.budgetValue}>KES {Number(p.budget).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff' },
    navbar: { background: '#16213e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
    logo: { color: '#f39c12', margin: 0 },
    navRight: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { color: '#aaa', fontSize: 14 },
    logoutBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' },
    content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { color: '#fff', margin: 0, fontSize: 24 },
    addBtn: { background: '#f39c12', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
    formCard: { background: '#16213e', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #333' },
    formTitle: { color: '#f39c12', marginTop: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
    formField: { display: 'flex', flexDirection: 'column' },
    label: { color: '#aaa', fontSize: 13, marginBottom: 6 },
    input: { padding: 10, borderRadius: 6, border: '1px solid #333', background: '#0f3460', color: '#fff', fontSize: 14 },
    submitBtn: { marginTop: 16, background: '#27ae60', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 15 },
    loading: { color: '#aaa', textAlign: 'center', padding: 40 },
    empty: { color: '#666', textAlign: 'center', padding: 40 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
    card: { background: '#16213e', borderRadius: 12, padding: 20, cursor: 'pointer', border: '1px solid #333', transition: 'transform 0.2s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { color: '#fff', margin: 0, fontSize: 16 },
    badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, color: '#fff' },
    cardLocation: { color: '#888', fontSize: 13, margin: '8px 0' },
    progressBar: { background: '#333', borderRadius: 4, height: 6, margin: '12px 0 4px' },
    progressFill: { background: '#f39c12', height: '100%', borderRadius: 4 },
    progressText: { color: '#aaa', fontSize: 12, margin: '0 0 12px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
    footerItem: { color: '#888', fontSize: 13 },
    budget: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: 12 },
    budgetLabel: { color: '#aaa', fontSize: 13 },
    budgetValue: { color: '#27ae60', fontWeight: 'bold', fontSize: 13 },
};