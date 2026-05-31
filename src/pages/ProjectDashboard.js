import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ProjectDashboard({ user, project, onBack, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState({
        floors: [], boq: [], invoices: [], payments: [], materials: [], progress: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [floors, boq, invoices, payments, materials, progress] = await Promise.all([
                api.get(`/projects/${project.id}/floors`),
                api.get(`/projects/${project.id}/boq`),
                api.get(`/projects/${project.id}/invoices`),
                api.get(`/projects/${project.id}/payments`),
                api.get(`/projects/${project.id}/materials`),
                api.get(`/projects/${project.id}/progress`),
            ]);
            setData({
                floors: Array.isArray(floors.data) ? floors.data : [],
                boq: Array.isArray(boq.data) ? boq.data : [],
                invoices: Array.isArray(invoices.data) ? invoices.data : [],
                payments: Array.isArray(payments.data) ? payments.data : [],
                materials: Array.isArray(materials.data) ? materials.data : [],
                progress: Array.isArray(progress.data) ? progress.data : [],
            });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const tabs = [
        { key: 'dashboard', label: '📊 Dashboard' },
        { key: 'floors', label: '🏢 Floors' },
        { key: 'boq', label: '📋 BOQ' },
        { key: 'finance', label: '💰 Finance' },
        { key: 'materials', label: '🧱 Materials' },
        { key: 'progress', label: '📈 Progress' },
    ];

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <div style={styles.navLeft}>
                    <button style={styles.backBtn} onClick={onBack}>← Back</button>
                    <h2 style={styles.logo}>🏗️ {project.name}</h2>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.userInfo}>👤 {user.name} ({user.role})</span>
                    <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        style={{...styles.tab, ...(activeTab === t.key ? styles.activeTab : {})}}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {loading ? (
                    <p style={styles.loading}>Loading...</p>
                ) : (
                    <>
                        {activeTab === 'dashboard' && <DashboardTab project={project} data={data} />}
                        {activeTab === 'floors' && <FloorsTab floors={data.floors} user={user} projectId={project.id} refresh={fetchAll} />}
                        {activeTab === 'boq' && <BOQTab boq={data.boq} user={user} projectId={project.id} refresh={fetchAll} />}
                        {activeTab === 'finance' && <FinanceTab invoices={data.invoices} payments={data.payments} user={user} projectId={project.id} refresh={fetchAll} />}
                        {activeTab === 'materials' && <MaterialsTab materials={data.materials} user={user} projectId={project.id} refresh={fetchAll} />}
                        {activeTab === 'progress' && <ProgressTab progress={data.progress} floors={data.floors} user={user} projectId={project.id} refresh={fetchAll} />}
                    </>
                )}
            </div>
        </div>
    );
}

function DashboardTab({ project, data }) {
    const totalBOQ = data.boq.reduce((s, b) => s + Number(b.total_amount), 0);
    const totalPaid = data.payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
    const pendingInvoices = data.invoices.filter(i => i.status !== 'paid').length;
    const lowStock = data.materials.filter(m => m.status === 'low_stock' || m.status === 'out_of_stock').length;

    return (
        <div>
            <div style={styles.statsGrid}>
                <StatCard title="Total Budget" value={`KES ${Number(project.budget).toLocaleString()}`} color="#27ae60" icon="💰" />
                <StatCard title="Total BOQ" value={`KES ${totalBOQ.toLocaleString()}`} color="#3498db" icon="📋" />
                <StatCard title="Total Paid" value={`KES ${totalPaid.toLocaleString()}`} color="#9b59b6" icon="✅" />
                <StatCard title="Progress" value={`${project.progress}%`} color="#f39c12" icon="📈" />
                <StatCard title="Pending Invoices" value={pendingInvoices} color="#e74c3c" icon="📄" />
                <StatCard title="Low Stock Alerts" value={lowStock} color="#e67e22" icon="⚠️" />
            </div>

            <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Project Info</h3>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Location:</span> {project.location}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Client:</span> {project.client_name}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Contractor:</span> {project.contractor_name}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Status:</span> {project.status}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Floors:</span> {project.total_floors}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>Start:</span> {project.start_date}</p>
                    <p style={styles.infoRow}><span style={styles.infoLabel}>End:</span> {project.end_date}</p>
                </div>
                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Floor Progress</h3>
                    {data.floors.map(f => (
                        <div key={f.id} style={styles.floorRow}>
                            <span style={styles.floorName}>{f.name}</span>
                            <div style={styles.floorBar}>
                                <div style={{...styles.floorFill, width: `${f.progress}%`, background: f.status === 'completed' ? '#27ae60' : f.status === 'current' ? '#f39c12' : '#555'}}></div>
                            </div>
                            <span style={styles.floorPct}>{f.progress}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color, icon }) {
    return (
        <div style={{...styles.statCard, borderTop: `4px solid ${color}`}}>
            <div style={styles.statIcon}>{icon}</div>
            <div style={{...styles.statValue, color}}>{value}</div>
            <div style={styles.statTitle}>{title}</div>
        </div>
    );
}

function FloorsTab({ floors, user, projectId, refresh }) {
    return (
        <div>
            <h3 style={styles.tabTitle}>Floor Management</h3>
            {floors.map(f => (
                <div key={f.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>{f.name}</span>
                        <span style={{...styles.badge, background: f.status === 'completed' ? '#27ae60' : f.status === 'current' ? '#f39c12' : '#555'}}>
                            {f.status}
                        </span>
                    </div>
                    <p style={styles.listSub}>Stage: {f.stage} | Progress: {f.progress}%</p>
                    <div style={styles.progressBar}>
                        <div style={{...styles.progressFill, width: `${f.progress}%`}}></div>
                    </div>
                    {f.notes && <p style={styles.listNote}>{f.notes}</p>}
                </div>
            ))}
        </div>
    );
}

function BOQTab({ boq, user, projectId, refresh }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ description: '', unit: '', quantity: '', unit_rate: '', type: 'labour' });
    const canAdd = ['admin', 'contractor', 'qs'].includes(user.role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/boq', { ...form, project_id: projectId });
            setShowForm(false);
            setForm({ description: '', unit: '', quantity: '', unit_rate: '', type: 'labour' });
            refresh();
        } catch (err) { alert('Error adding BOQ item'); }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.put(`/boq/${id}`, { status });
            refresh();
        } catch (err) { alert('Error updating status'); }
    };

    return (
        <div>
            <div style={styles.tabHeader}>
                <h3 style={styles.tabTitle}>Bill of Quantities</h3>
                {canAdd && <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Item'}</button>}
            </div>
            {showForm && (
                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            {[
                                { label: 'Description', key: 'description' },
                                { label: 'Unit', key: 'unit' },
                                { label: 'Quantity', key: 'quantity', type: 'number' },
                                { label: 'Unit Rate (KES)', key: 'unit_rate', type: 'number' },
                            ].map(f => (
                                <div key={f.key} style={styles.formField}>
                                    <label style={styles.label}>{f.label}</label>
                                    <input style={styles.input} type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
                                </div>
                            ))}
                            <div style={styles.formField}>
                                <label style={styles.label}>Type</label>
                                <select style={styles.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                    <option value="labour">Labour</option>
                                    <option value="material">Material</option>
                                </select>
                            </div>
                        </div>
                        <button style={styles.submitBtn} type="submit">Add BOQ Item</button>
                    </form>
                </div>
            )}
            {boq.map(b => (
                <div key={b.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>{b.description}</span>
                        <span style={{...styles.badge, background: b.status === 'approved' ? '#27ae60' : b.status === 'rejected' ? '#e74c3c' : '#f39c12'}}>{b.status}</span>
                    </div>
                    <p style={styles.listSub}>{b.unit} × {b.quantity} @ KES {Number(b.unit_rate).toLocaleString()} = <strong style={{color:'#27ae60'}}>KES {Number(b.total_amount).toLocaleString()}</strong></p>
                    <p style={styles.listSub}>Type: {b.type}</p>
                    {user.role === 'qs' && b.status === 'pending' && (
                        <div style={styles.actionRow}>
                            <button style={{...styles.actionBtn, background:'#27ae60'}} onClick={() => handleStatus(b.id, 'approved')}>✅ Approve</button>
                            <button style={{...styles.actionBtn, background:'#e74c3c'}} onClick={() => handleStatus(b.id, 'rejected')}>❌ Reject</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function FinanceTab({ invoices, payments, user, projectId, refresh }) {
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showPayForm, setShowPayForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({ description: '', amount: '', due_date: '' });
    const [payForm, setPayForm] = useState({ phone: '', amount: '' });
    const [paying, setPaying] = useState(false);

    const canAddInvoice = ['admin', 'contractor', 'qs'].includes(user.role);
    const canPay = ['admin', 'client'].includes(user.role);

    const handleInvoice = async (e) => {
        e.preventDefault();
        try {
            await api.post('/invoices', { ...invoiceForm, project_id: projectId });
            setShowInvoiceForm(false);
            setInvoiceForm({ description: '', amount: '', due_date: '' });
            refresh();
        } catch (err) { alert('Error creating invoice'); }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setPaying(true);
        try {
            await api.post('/mpesa/stk-push', {
                phone: payForm.phone,
                amount: payForm.amount,
                project_id: projectId,
                labour_invoice_id: selectedInvoice?.id
            });
            alert('STK Push sent! Check your phone for Mpesa prompt.');
            setShowPayForm(false);
            setPayForm({ phone: '', amount: '' });
            refresh();
        } catch (err) { alert('Payment failed. Try again.'); }
        setPaying(false);
    };

    return (
        <div>
            <div style={styles.tabHeader}>
                <h3 style={styles.tabTitle}>Finance & Payments</h3>
                <div style={{display:'flex', gap:8}}>
                    {canAddInvoice && <button style={styles.addBtn} onClick={() => setShowInvoiceForm(!showInvoiceForm)}>+ Invoice</button>}
                    {canPay && <button style={{...styles.addBtn, background:'#27ae60'}} onClick={() => setShowPayForm(!showPayForm)}>💳 Pay Now</button>}
                </div>
            </div>

            {showInvoiceForm && (
                <div style={styles.formCard}>
                    <h4 style={{color:'#f39c12', marginTop:0}}>Create Labour Invoice</h4>
                    <form onSubmit={handleInvoice}>
                        <div style={styles.formGrid}>
                            <div style={styles.formField}>
                                <label style={styles.label}>Description</label>
                                <input style={styles.input} value={invoiceForm.description} onChange={e => setInvoiceForm({...invoiceForm, description: e.target.value})} required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Amount (KES)</label>
                                <input style={styles.input} type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Due Date</label>
                                <input style={styles.input} type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
                            </div>
                        </div>
                        <button style={styles.submitBtn} type="submit">Create Invoice</button>
                    </form>
                </div>
            )}

            {showPayForm && (
                <div style={styles.formCard}>
                    <h4 style={{color:'#27ae60', marginTop:0}}>💳 Pay via Mpesa</h4>
                    <form onSubmit={handlePay}>
                        <div style={styles.formGrid}>
                            <div style={styles.formField}>
                                <label style={styles.label}>Phone Number (07XXXXXXXX)</label>
                                <input style={styles.input} value={payForm.phone} onChange={e => setPayForm({...payForm, phone: e.target.value})} placeholder="0712345678" required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Amount (KES)</label>
                                <input style={styles.input} type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Select Invoice (optional)</label>
                                <select style={styles.input} onChange={e => setSelectedInvoice(invoices.find(i => i.id == e.target.value))}>
                                    <option value="">-- General Payment --</option>
                                    {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number} - KES {Number(i.balance).toLocaleString()}</option>)}
                                </select>
                            </div>
                        </div>
                        <button style={styles.submitBtn} type="submit" disabled={paying}>{paying ? 'Sending STK Push...' : '📱 Send Mpesa Prompt'}</button>
                    </form>
                </div>
            )}

            <h4 style={{color:'#aaa', marginTop:24}}>Labour Invoices</h4>
            {invoices.length === 0 ? <p style={styles.empty}>No invoices yet</p> : invoices.map(i => (
                <div key={i.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>{i.invoice_number}</span>
                        <span style={{...styles.badge, background: i.status === 'paid' ? '#27ae60' : i.status === 'partial' ? '#f39c12' : '#e74c3c'}}>{i.status}</span>
                    </div>
                    <p style={styles.listSub}>{i.description}</p>
                    <p style={styles.listSub}>Amount: KES {Number(i.amount).toLocaleString()} | Paid: KES {Number(i.paid_amount).toLocaleString()} | Balance: <strong style={{color:'#e74c3c'}}>KES {Number(i.balance).toLocaleString()}</strong></p>
                </div>
            ))}

            <h4 style={{color:'#aaa', marginTop:24}}>Payment History</h4>
            {payments.length === 0 ? <p style={styles.empty}>No payments yet</p> : payments.map(p => (
                <div key={p.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>KES {Number(p.amount).toLocaleString()}</span>
                        <span style={{...styles.badge, background: p.status === 'completed' ? '#27ae60' : p.status === 'pending' ? '#f39c12' : '#e74c3c'}}>{p.status}</span>
                    </div>
                    <p style={styles.listSub}>Phone: {p.phone_number} | Receipt: {p.mpesa_receipt || 'Pending'}</p>
                </div>
            ))}
        </div>
    );
}

function MaterialsTab({ materials, user, projectId, refresh }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', supplier: '', unit: '', quantity: '', unit_price: '', delivery_date: '' });
    const canAdd = ['admin', 'contractor'].includes(user.role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/materials', { ...form, project_id: projectId });
            setShowForm(false);
            setForm({ name: '', supplier: '', unit: '', quantity: '', unit_price: '', delivery_date: '' });
            refresh();
        } catch (err) { alert('Error adding material'); }
    };

    return (
        <div>
            <div style={styles.tabHeader}>
                <h3 style={styles.tabTitle}>Materials & Inventory</h3>
                {canAdd && <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Material'}</button>}
            </div>
            {showForm && (
                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            {[
                                { label: 'Material Name', key: 'name' },
                                { label: 'Supplier', key: 'supplier' },
                                { label: 'Unit', key: 'unit' },
                                { label: 'Quantity', key: 'quantity', type: 'number' },
                                { label: 'Unit Price (KES)', key: 'unit_price', type: 'number' },
                                { label: 'Delivery Date', key: 'delivery_date', type: 'date' },
                            ].map(f => (
                                <div key={f.key} style={styles.formField}>
                                    <label style={styles.label}>{f.label}</label>
                                    <input style={styles.input} type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
                                </div>
                            ))}
                        </div>
                        <button style={styles.submitBtn} type="submit">Add Material</button>
                    </form>
                </div>
            )}
            {materials.map(m => (
                <div key={m.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>{m.name}</span>
                        <span style={{...styles.badge, background: m.status === 'in_stock' ? '#27ae60' : m.status === 'low_stock' ? '#f39c12' : '#e74c3c'}}>{m.status}</span>
                    </div>
                    <p style={styles.listSub}>Supplier: {m.supplier} | Unit: {m.unit}</p>
                    <p style={styles.listSub}>Qty: {m.quantity} | Price: KES {Number(m.unit_price).toLocaleString()} | Total: KES {Number(m.total_cost).toLocaleString()}</p>
                    <p style={styles.listSub}>Stock Remaining: <strong style={{color: m.status === 'low_stock' ? '#f39c12' : '#27ae60'}}>{m.stock_remaining} {m.unit}</strong></p>
                </div>
            ))}
        </div>
    );
}

function ProgressTab({ progress, floors, user, projectId, refresh }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ activity: '', description: '', progress_percentage: '', workers_present: '', stage: 'excavation', notes: '', date: '', floor_id: '' });
    const canAdd = ['admin', 'contractor', 'foreman'].includes(user.role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/progress', { ...form, project_id: projectId });
            setShowForm(false);
            setForm({ activity: '', description: '', progress_percentage: '', workers_present: '', stage: 'excavation', notes: '', date: '', floor_id: '' });
            refresh();
        } catch (err) { alert('Error adding progress'); }
    };

    return (
        <div>
            <div style={styles.tabHeader}>
                <h3 style={styles.tabTitle}>Site Progress</h3>
                {canAdd && <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Log Progress'}</button>}
            </div>
            {showForm && (
                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.formField}>
                                <label style={styles.label}>Floor</label>
                                <select style={styles.input} value={form.floor_id} onChange={e => setForm({...form, floor_id: e.target.value})}>
                                    <option value="">-- Select Floor --</option>
                                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Activity</label>
                                <input style={styles.input} value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Stage</label>
                                <select style={styles.input} value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
                                    {['excavation','foundation','slab','walling','roofing','finishing','completed'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Progress %</label>
                                <input style={styles.input} type="number" min="0" max="100" value={form.progress_percentage} onChange={e => setForm({...form, progress_percentage: e.target.value})} required />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Workers Present</label>
                                <input style={styles.input} type="number" value={form.workers_present} onChange={e => setForm({...form, workers_present: e.target.value})} />
                            </div>
                            <div style={styles.formField}>
                                <label style={styles.label}>Date</label>
                                <input style={styles.input} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                            </div>
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Notes</label>
                            <input style={styles.input} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                        </div>
                        <button style={styles.submitBtn} type="submit">Log Progress</button>
                    </form>
                </div>
            )}
            {progress.map(p => (
                <div key={p.id} style={styles.listCard}>
                    <div style={styles.listHeader}>
                        <span style={styles.listTitle}>{p.activity}</span>
                        <span style={styles.badge}>{p.stage}</span>
                    </div>
                    <p style={styles.listSub}>Date: {p.date} | Workers: {p.workers_present} | Progress: {p.progress_percentage}%</p>
                    {p.notes && <p style={styles.listNote}>{p.notes}</p>}
                </div>
            ))}
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff' },
    navbar: { background: '#16213e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
    navLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    logo: { color: '#f39c12', margin: 0, fontSize: 18 },
    backBtn: { background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' },
    navRight: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { color: '#aaa', fontSize: 14 },
    logoutBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' },
    tabs: { background: '#16213e', padding: '0 24px', display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid #333' },
    tab: { background: 'none', color: '#aaa', border: 'none', padding: '14px 16px', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' },
    activeTab: { color: '#f39c12', borderBottom: '2px solid #f39c12' },
    content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    loading: { color: '#aaa', textAlign: 'center', padding: 40 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
    statCard: { background: '#16213e', borderRadius: 12, padding: 20, textAlign: 'center' },
    statIcon: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    statTitle: { color: '#aaa', fontSize: 13 },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
    infoCard: { background: '#16213e', borderRadius: 12, padding: 20 },
    infoTitle: { color: '#f39c12', marginTop: 0 },
    infoRow: { color: '#ccc', fontSize: 14, margin: '8px 0' },
    infoLabel: { color: '#aaa', marginRight: 8 },
    floorRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    floorName: { color: '#ccc', fontSize: 13, width: 60 },
    floorBar: { flex: 1, background: '#333', borderRadius: 4, height: 8 },
    floorFill: { height: '100%', borderRadius: 4 },
    floorPct: { color: '#aaa', fontSize: 12, width: 35 },
    tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    tabTitle: { color: '#fff', margin: 0 },
    addBtn: { background: '#f39c12', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' },
    formCard: { background: '#16213e', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #333' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
    formField: { display: 'flex', flexDirection: 'column', marginBottom: 12 },
    label: { color: '#aaa', fontSize: 13, marginBottom: 6 },
    input: { padding: 10, borderRadius: 6, border: '1px solid #333', background: '#0f3460', color: '#fff', fontSize: 14 },
    submitBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 15 },
    listCard: { background: '#16213e', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #333' },
    listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    listTitle: { color: '#fff', fontWeight: 'bold' },
    listSub: { color: '#aaa', fontSize: 13, margin: '4px 0' },
    listNote: { color: '#888', fontSize: 12, fontStyle: 'italic' },
    badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, color: '#fff', background: '#555' },
    actionRow: { display: 'flex', gap: 8, marginTop: 8 },
    actionBtn: { color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    progressBar: { background: '#333', borderRadius: 4, height: 6, margin: '8px 0' },
    progressFill: { background: '#f39c12', height: '100%', borderRadius: 4 },
    empty: { color: '#666', textAlign: 'center', padding: 20 },
};