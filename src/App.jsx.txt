import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
:root {
  --bg:#0f1117;--surface:#181c27;--surface2:#1e2335;--border:#2a3050;
  --accent:#3b82f6;--accent2:#f59e0b;--danger:#ef4444;--success:#22c55e;
  --warn:#f59e0b;--text:#e2e8f0;--muted:#64748b;
  --mono:'IBM Plex Mono',monospace;--sans:'IBM Plex Sans',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.5}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

/* LOGIN */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px}
.login-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:36px 32px;width:100%;max-width:440px}
.login-logo{font-family:var(--mono);font-size:22px;font-weight:600;color:var(--accent);letter-spacing:-0.5px;margin-bottom:4px}
.login-sub{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:28px}
.login-label{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:6px;display:block}
.login-input{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:6px;font-family:var(--sans);font-size:13px;outline:none;transition:border-color .15s;margin-bottom:14px}
.login-input:focus{border-color:var(--accent)}
.login-btn{width:100%;padding:11px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-family:var(--sans);font-size:14px;font-weight:600;cursor:pointer;margin-top:6px;transition:opacity .15s}
.login-btn:hover{opacity:.88}
.login-err{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:14px}
.login-divider{text-align:center;color:var(--muted);font-size:12px;margin:20px 0 14px;position:relative}
.login-divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:var(--border)}
.login-divider span{background:var(--surface);padding:0 10px;position:relative}
.quick-accounts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.quick-card{background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:10px 12px;cursor:pointer;transition:border-color .15s,background .15s;text-align:left}
.quick-card:hover{border-color:var(--accent);background:rgba(59,130,246,.06)}
.quick-card .qc-name{font-size:13px;font-weight:500;margin-bottom:2px}
.quick-card .qc-role{font-size:11px;color:var(--muted);font-family:var(--mono)}
.quick-card .qc-avatar{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;margin-bottom:6px}

/* APP SHELL */
.app{display:flex;height:100vh;overflow:hidden}
aside{width:220px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.logo{padding:20px 16px 16px;border-bottom:1px solid var(--border)}
.logo-mark{font-family:var(--mono);font-size:18px;font-weight:600;color:var(--accent);letter-spacing:-0.5px}
.logo-sub{font-size:11px;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:1px}
.user-badge{margin:12px 16px;padding:8px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px}
.user-badge .ub-name{font-size:13px;font-weight:600;margin-bottom:2px}
.user-badge .ub-role{font-family:var(--mono);font-size:11px;color:var(--accent2)}
nav{flex:1;padding:8px 0}
.nav-a{display:flex;align-items:center;gap:10px;padding:9px 16px;color:var(--muted);text-decoration:none;font-size:13px;font-weight:500;cursor:pointer;transition:color .15s,background .15s;border-left:2px solid transparent;background:none;border-top:none;border-right:none;border-bottom:none;width:100%;font-family:var(--sans)}
.nav-a:hover{color:var(--text);background:var(--surface2)}
.nav-a.active{color:var(--accent);border-left-color:var(--accent);background:rgba(59,130,246,.07)}
.nav-section{font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:16px 16px 4px}
.nav-icon{font-size:16px;width:20px;text-align:center}
.nav-badge{margin-left:auto;background:var(--danger);color:white;font-size:10px;font-family:var(--mono);padding:1px 5px;border-radius:10px;font-weight:600}
.sidebar-footer{padding:12px 16px;border-top:1px solid var(--border)}
.logout-btn{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:8px;border-radius:5px;font-family:var(--sans);font-size:12px;cursor:pointer;transition:color .15s,border-color .15s}
.logout-btn:hover{color:var(--text);border-color:var(--accent)}
main{flex:1;overflow-y:auto;padding:24px 28px;background:var(--bg)}

/* COMMON */
.page-title{font-size:22px;font-weight:600;margin-bottom:4px}
.page-sub{font-size:13px;color:var(--muted);margin-bottom:24px}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px}
.stat-card .label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.stat-card .value{font-family:var(--mono);font-size:28px;font-weight:600}
.stat-card.accent .value{color:var(--accent)}
.stat-card.warn .value{color:var(--warn)}
.stat-card.danger .value{color:var(--danger)}
.stat-card.success .value{color:var(--success)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:20px}
.card-title{font-size:14px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);padding:8px 12px;border-bottom:1px solid var(--border)}
td{padding:10px 12px;border-bottom:1px solid rgba(42,48,80,.5);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(30,35,53,.6)}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-family:var(--mono);font-weight:600}
.badge-pending{background:rgba(245,158,11,.15);color:var(--warn);border:1px solid rgba(245,158,11,.3)}
.badge-approved{background:rgba(34,197,94,.12);color:var(--success);border:1px solid rgba(34,197,94,.3)}
.badge-rejected{background:rgba(239,68,68,.12);color:var(--danger);border:1px solid rgba(239,68,68,.3)}
.badge-issued{background:rgba(59,130,246,.12);color:var(--accent);border:1px solid rgba(59,130,246,.3)}
.badge-low{background:rgba(239,68,68,.12);color:var(--danger);border:1px solid rgba(239,68,68,.3)}
.badge-ok{background:rgba(34,197,94,.12);color:var(--success);border:1px solid rgba(34,197,94,.3)}
.badge-critical{background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.5)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:5px;border:none;font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;transition:opacity .15s,transform .1s}
.btn:active{transform:scale(.98)}
.btn-primary{background:var(--accent);color:white}
.btn-primary:hover{opacity:.88}
.btn-success{background:var(--success);color:#0f1117}
.btn-success:hover{opacity:.88}
.btn-danger{background:var(--danger);color:white}
.btn-danger:hover{opacity:.88}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{color:var(--text);background:var(--surface2)}
.btn-sm{padding:4px 10px;font-size:12px}
.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:20px}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:12px;color:var(--muted);font-weight:500}
.form-group input,.form-group select,.form-group textarea{background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:5px;font-family:var(--sans);font-size:13px;outline:none;transition:border-color .15s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--accent)}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:900px){.two-col{grid-template-columns:1fr}}
.eng-stock-card{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:10px}
.eng-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.eng-name{font-weight:600}
.text-muted{color:var(--muted)}
.text-mono{font-family:var(--mono)}
.text-sm{font-size:12px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:500;display:flex;align-items:center;justify-content:center}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px;width:500px;max-width:95vw;max-height:85vh;overflow-y:auto}
.modal-title{font-size:16px;font-weight:600;margin-bottom:16px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.toast-area{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:10px;pointer-events:none}
.toast{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);padding:12px 16px;border-radius:6px;font-size:13px;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,.4);animation:slidein .25s ease}
.toast.success{border-left-color:var(--success)}
.toast.warn{border-left-color:var(--warn)}
.toast.danger{border-left-color:var(--danger)}
@keyframes slidein{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
`;

// ═══════════════════════════════════════════════════════
//  USER ACCOUNTS & CONFIG
// ═══════════════════════════════════════════════════════
const ACCOUNTS = [
  { id: 'charlie', name: 'Charlie Rajan', email: 'charlie@plant.com', password: 'admin123', role: 'admin',    avatar: 'CR', color: '#3b82f6', engineerId: null },
  { id: 'dave',    name: 'Dave Menon',   email: 'dave@plant.com',    password: 'store123', role: 'store',    avatar: 'DM', color: '#22c55e', engineerId: null },
  { id: 'eve',     name: 'Eve Thomas',   email: 'eve@plant.com',     password: 'purchase1',role: 'purchase', avatar: 'ET', color: '#f59e0b', engineerId: null },
  { id: 'alice',   name: 'Alice Johnson',email: 'alice@plant.com',   password: 'eng001',   role: 'engineer', avatar: 'AJ', color: '#a855f7', engineerId: 'eng-1' },
  { id: 'bob',     name: 'Bob Nair',     email: 'bob@plant.com',     password: 'eng002',   role: 'engineer', avatar: 'BN', color: '#ec4899', engineerId: 'eng-2' },
];

const NAV_CONFIG = {
  admin:    [
    { page: 'dashboard',    icon: '⬡', label: 'Dashboard' },
    { section: 'Operations' },
    { page: 'requests',     icon: '📋', label: 'Spare Requests',    hasBadge: 'pendingReq' },
    { section: 'Admin' },
    { page: 'database',     icon: '🗄', label: 'Database' },
  ],
  engineer: [
    { page: 'dashboard',    icon: '⬡', label: 'My Dashboard' },
    { section: 'My Work' },
    { page: 'requests',     icon: '📋', label: 'My Requests' },
  ],
  store:    [
    { page: 'dashboard',    icon: '⬡', label: 'Store Dashboard' },
    { section: 'Store' },
    { page: 'requests',     icon: '📋', label: 'Issue Parts',        hasBadge: 'approvedReq' },
  ],
  purchase: [
    { page: 'dashboard',    icon: '⬡', label: 'Purchase Dashboard' },
  ],
};

const ROLE_LABELS = { admin: 'Admin', engineer: 'Engineer', store: 'Store Team', purchase: 'Purchase Team' };
const today = () => new Date().toISOString().split('T')[0];

// ═══════════════════════════════════════════════════════
//  UTILITIES & COMPONENTS
// ═══════════════════════════════════════════════════════
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);
  return { toasts, toast };
}

function Modal({ title, onClose, children, actions }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

const PriorityBadge = ({ p }) => {
  const cls = p === 'Critical' ? 'badge-critical' : p === 'Urgent' ? 'badge-pending' : 'badge-issued';
  return <span className={`badge ${cls}`}>{p}</span>;
};
const StatusBadge = ({ s }) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>;

// ═══════════════════════════════════════════════════════
//  LOGIN & SIDEBAR
// ═══════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const acc = ACCOUNTS.find(a => a.email === email.trim().toLowerCase() && a.password === password);
    if (!acc) { setError('Invalid email or password.'); return; }
    onLogin(acc);
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">SpareTrack</div>
        <div className="login-sub">Live Parts Utilization System</div>
        {error && <div className="login-err">⚠ {error}</div>}
        <label className="login-label">Email</label>
        <input className="login-input" type="email" placeholder="you@plant.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <label className="login-label">Password</label>
        <input className="login-input" type="password" placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button className="login-btn" onClick={handleLogin}>Sign In</button>
        <div className="login-divider"><span>or sign in as demo user</span></div>
        <div className="quick-accounts">
          {ACCOUNTS.map(acc => (
            <button key={acc.id} className="quick-card" onClick={() => onLogin(acc)}>
              <div className="qc-avatar" style={{ background: acc.color + '25', color: acc.color }}>{acc.avatar}</div>
              <div className="qc-name">{acc.name.split(' ')[0]}</div>
              <div className="qc-role">{ROLE_LABELS[acc.role]}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ user, activePage, setPage, data, onLogout }) {
  const items = NAV_CONFIG[user.role] || NAV_CONFIG.admin;
  const pendingReq  = data.requests.filter(r => r.status === 'Pending').length;
  const approvedReq = data.requests.filter(r => r.status === 'Approved').length;
  const pendingPR   = data.purchaseRequests.filter(p => p.status === 'Pending').length;
  const badges = { pendingReq, approvedReq, pendingPR };

  return (
    <aside>
      <div className="logo">
        <div className="logo-mark">SpareTrack</div>
        <div className="logo-sub">Live Realtime Data</div>
      </div>
      <div className="user-badge">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: user.color + '25', color: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{user.avatar}</div>
          <div>
            <div className="ub-name">{user.name}</div>
            <div className="ub-role">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>
      <nav>
        {items.map((item, i) => {
          if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
          const cnt = item.hasBadge ? badges[item.hasBadge] || null : null;
          return (
            <button key={item.page} className={`nav-a${activePage === item.page ? ' active' : ''}`} onClick={() => setPage(item.page)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {cnt ? <span className="nav-badge">{cnt}</span> : null}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>⇠ Sign out</button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
//  PAGE COMPONENTS
// ═══════════════════════════════════════════════════════
function Dashboard({ user, data, toast }) {
  const { role, engineerId } = user;
  const totalStock = data.parts.reduce((s, p) => s + (Number(p.storeStock) || 0), 0);
  const lowParts   = data.parts.filter(p => p.storeStock < p.minStock).length;
  const pendingReq = data.requests.filter(r => r.status === 'Pending').length;

  const approve = async (id) => {
    await updateDoc(doc(db, "requests", id), { status: 'Approved', approvedBy: user.name });
    toast('Request approved.', 'success');
  };

  const reject = async (id) => {
    await updateDoc(doc(db, "requests", id), { status: 'Rejected' });
    toast('Request rejected.', 'warn');
  };

  const engName = id => data.engineers.find(e => e.id === id)?.name || id;

  const buildEngStock = (engId) => {
    const rows = data.parts.filter(p => (p.engineerStock && p.engineerStock[engId] > 0));
    if (!rows.length) return <div className="text-muted text-sm">No stock with this engineer.</div>;
    return (
      <table><thead><tr><th>Part</th><th>Qty</th><th>Unit</th></tr></thead>
        <tbody>{rows.map(p => <tr key={p.id}><td>{p.name}</td><td className="text-mono">{p.engineerStock[engId]}</td><td className="text-muted text-sm">{p.unit}</td></tr>)}</tbody>
      </table>
    );
  };

  if (role === 'engineer') {
    const myReqs  = data.requests.filter(r => r.engineerId === engineerId);
    return (
      <div>
        <div className="page-title">My Dashboard</div>
        <div className="page-sub">Your current spare parts stock and recent activity.</div>
        <div className="stat-grid">
          <div className="stat-card accent"><div className="label">Stock Types</div><div className="value">{data.parts.filter(p => (p.engineerStock && p.engineerStock[engineerId] > 0)).length}</div></div>
          <div className="stat-card"><div className="label">My Requests</div><div className="value">{myReqs.length}</div></div>
          <div className="stat-card warn"><div className="label">Pending Approval</div><div className="value">{myReqs.filter(r => r.status === 'Pending').length}</div></div>
        </div>
        <div className="card"><div className="card-title">My Stock</div>{buildEngStock(engineerId)}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">Command Center</div>
      <div className="page-sub">System overview.</div>
      <div className="stat-grid">
        <div className="stat-card accent"><div className="label">Total Store Stock</div><div className="value">{totalStock}</div></div>
        <div className="stat-card warn"><div className="label">Pending Requests</div><div className="value">{pendingReq}</div></div>
        <div className="stat-card danger"><div className="label">Low Stock Alerts</div><div className="value">{lowParts}</div></div>
      </div>
      
      <div className="two-col">
        <div className="card">
          <div className="card-title">Pending Approvals</div>
          <table><thead><tr><th>Engineer</th><th>Part</th><th>Qty</th><th>Priority</th><th>Actions</th></tr></thead>
            <tbody>{data.requests.filter(r => r.status === 'Pending').map(r => {
              const p = data.parts.find(x => x.id === r.partId);
              return <tr key={r.id}>
                <td>{engName(r.engineerId)}</td><td>{p?.name}</td><td className="text-mono">{r.qty}</td><td><PriorityBadge p={r.priority} /></td>
                <td>
                  {role === 'admin' && <>
                    <button className="btn btn-success btn-sm" onClick={() => approve(r.id)}>✓</button>
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }} onClick={() => reject(r.id)}>✗</button>
                  </>}
                </td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        
        <div className="card">
          <div className="card-title">Engineer Stock Overview</div>
          {data.engineers.map(eng => (
            <div key={eng.id} className="eng-stock-card">
              <div className="eng-header"><div className="eng-name">{eng.name}</div></div>
              {buildEngStock(eng.id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RequestsPage({ user, data, toast }) {
  const { role, engineerId, name } = user;
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ partId: '', qty: 1, machine: '', priority: 'Normal', notes: '' });
  const [issueModal, setIssueModal] = useState(null);
  const [issueQty, setIssueQty] = useState(1);

  const engName = id => data.engineers.find(e => e.id === id)?.name || id;

  const raiseRequest = async () => {
    if (!form.machine.trim()) { toast('Enter machine name.', 'warn'); return; }
    const partId = form.partId || data.parts[0]?.id;
    const qty = Number(form.qty);
    
    await addDoc(collection(db, "requests"), { partId, qty, engineerId, machine: form.machine, priority: form.priority, notes: form.notes, status: 'Pending', date: today(), approvedBy: null });
    
    setForm({ partId: '', qty: 1, machine: '', priority: 'Normal', notes: '' });
    toast('Request submitted.', 'success');
  };

  const approve = async (id) => {
    await updateDoc(doc(db, "requests", id), { status: 'Approved', approvedBy: name });
    toast(`Request approved.`, 'success');
  };

  const confirmIssue = async () => {
    const r = issueModal;
    const part = data.parts.find(p => p.id === r.partId);
    if (issueQty > part.storeStock) { toast('Insufficient store stock.', 'danger'); return; }

    // Update Request
    await updateDoc(doc(db, "requests", r.id), { status: 'Issued' });
    
    // Update Part Stock
    const newStoreStock = part.storeStock - issueQty;
    const currentEngStock = (part.engineerStock && part.engineerStock[r.engineerId]) || 0;
    await updateDoc(doc(db, "parts", part.id), { 
      storeStock: newStoreStock, 
      [`engineerStock.${r.engineerId}`]: currentEngStock + issueQty 
    });
    
    setIssueModal(null);
    toast(`${part?.name} issued successfully.`, 'success');
  };

  let rows = data.requests;
  if (filter !== 'all') rows = rows.filter(r => r.status === filter);
  if (role === 'engineer') rows = rows.filter(r => r.engineerId === engineerId);

  return (
    <div>
      <div className="page-title">Spare Part Requests</div>
      {role !== 'store' && role !== 'purchase' && (
        <div className="card">
          <div className="card-title">Raise New Request</div>
          <div className="form-grid">
            <div className="form-group"><label>Spare Part</label>
              <select value={form.partId} onChange={e => setForm({ ...form, partId: e.target.value })}>
                {data.parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Quantity</label><input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} /></div>
            <div className="form-group"><label>Machine / Equipment</label><input type="text" value={form.machine} onChange={e => setForm({ ...form, machine: e.target.value })} /></div>
            <div className="form-group"><label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>Normal</option><option>Urgent</option><option>Critical</option></select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={raiseRequest}>Submit Request</button>
        </div>
      )}

      <div className="card">
        <div className="card-title">
          Request History
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'var(--sans)' }}>
            <option value="all">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Issued">Issued</option><option value="Rejected">Rejected</option>
          </select>
        </div>
        <table><thead><tr><th>Part</th><th>Qty</th><th>Engineer</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{rows.map(r => {
            const p = data.parts.find(x => x.id === r.partId);
            return <tr key={r.id}>
              <td>{p?.name}</td><td className="text-mono">{r.qty}</td><td>{engName(r.engineerId)}</td><td><StatusBadge s={r.status} /></td>
              <td>
                {r.status === 'Pending' && role === 'admin' && <button className="btn btn-success btn-sm" onClick={() => approve(r.id)}>Approve</button>}
                {r.status === 'Approved' && (role === 'store' || role === 'admin') && <button className="btn btn-primary btn-sm" onClick={() => { setIssueModal(r); setIssueQty(r.qty); }}>Issue</button>}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>

      {issueModal && (
        <Modal title="Issue Spare Part" onClose={() => setIssueModal(null)} actions={<><button className="btn btn-ghost" onClick={() => setIssueModal(null)}>Cancel</button><button className="btn btn-success" onClick={confirmIssue}>Confirm</button></>}>
          <div className="form-group"><label>Quantity to Issue</label><input type="number" min="1" value={issueQty} onChange={e => setIssueQty(Number(e.target.value))} /></div>
        </Modal>
      )}
    </div>
  );
}

function DatabasePage({ data, toast }) {
  const [pf, setPf] = useState({ name:'', partNo:'', category:'Bearings', unit:'pcs', storeStock:0, minStock:5 });
  
  const savePart = async () => {
    await addDoc(collection(db, "parts"), { ...pf, storeStock: Number(pf.storeStock), minStock: Number(pf.minStock), engineerStock: {} });
    toast('Part added to database.', 'success');
  };

  const deletePart = async (id) => {
    if(!window.confirm('Delete this part?')) return;
    await deleteDoc(doc(db, "parts", id));
    toast('Part removed.', 'warn');
  };

  return (
    <div>
      <div className="page-title">Database Management</div>
      <div className="card">
        <div className="card-title">Add New Part</div>
        <div className="form-grid">
          <div className="form-group"><label>Name</label><input value={pf.name} onChange={e=>setPf({...pf, name:e.target.value})} /></div>
          <div className="form-group"><label>Part No.</label><input value={pf.partNo} onChange={e=>setPf({...pf, partNo:e.target.value})} /></div>
          <div className="form-group"><label>Store Stock</label><input type="number" value={pf.storeStock} onChange={e=>setPf({...pf, storeStock:e.target.value})} /></div>
          <div className="form-group"><label>Min Stock</label><input type="number" value={pf.minStock} onChange={e=>setPf({...pf, minStock:e.target.value})} /></div>
        </div>
        <button className="btn btn-primary" onClick={savePart}>Save Part</button>
      </div>

      <div className="card">
        <div className="card-title">Parts Catalogue</div>
        <table><thead><tr><th>Name</th><th>Part No.</th><th>Stock</th><th>Action</th></tr></thead>
          <tbody>{data.parts.map(p => <tr key={p.id}>
            <td>{p.name}</td><td>{p.partNo}</td><td>{p.storeStock}</td>
            <td><button className="btn btn-danger btn-sm" onClick={() => deletePart(p.id)}>Delete</button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP WRAPPER (WITH LOCAL STORAGE FIX)
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ engineers: [], parts: [], requests: [], utilization: [], purchaseRequests: [] });
  const { toasts, toast } = useToasts();

  // 1. Load user from browser storage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('sparetrack_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sparetrack_user');
      }
    }
  }, []);

  // 2. Firebase Real-time Sync
  useEffect(() => {
    const collections = ['engineers', 'parts', 'requests', 'utilization', 'purchaseRequests'];
    const unsubscribes = collections.map(col => 
      onSnapshot(collection(db, col), (snapshot) => {
        setData(prev => ({ ...prev, [col]: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) }));
      })
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // 3. Login - Save user memory to browser
  const handleLogin = (acc) => { 
    setUser(acc); 
    localStorage.setItem('sparetrack_user', JSON.stringify(acc));
    setPage('dashboard'); 
  };
  
  // 4. Logout - Wipe memory
  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('sparetrack_user');
    setPage('dashboard'); 
  };

  if (!user) return <><style>{CSS}</style><LoginPage onLogin={handleLogin} /></>;

  const pageProps = { user, data, toast, setPage };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar user={user} activePage={page} setPage={setPage} data={data} onLogout={handleLogout} />
        <main>
          {page === 'dashboard' && <Dashboard {...pageProps} />}
          {page === 'requests'  && <RequestsPage {...pageProps} />}
          {page === 'database'  && <DatabasePage data={data} toast={toast} />}
        </main>
      </div>
      <div className="toast-area">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </>
  );
}