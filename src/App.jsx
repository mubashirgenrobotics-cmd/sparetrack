import React, { useState, useEffect } from 'react';

// ══════════════════════════════════════════
//  INITIAL DATA (MOCK DB)
// ══════════════════════════════════════════
const INITIAL_ENGINEERS = [
  { id: 1, name: 'Alice Johnson', empId: 'ENG-001', email: 'alice@plant.com', dept: 'Mechanical', active: true, password: 'password123' },
  { id: 2, name: 'Bob Nair', empId: 'ENG-002', email: 'bob@plant.com', dept: 'Electrical', active: true, password: 'password123' },
];

const INITIAL_USERS = [
  { id: 3, name: 'Charlie (Admin)', role: 'admin', email: 'admin@plant.com', active: true, password: 'admin' },
  { id: 4, name: 'Dave (Store)', role: 'store', email: 'store@plant.com', active: true, password: 'store' },
  { id: 5, name: 'Eve (Purchase)', role: 'purchase', email: 'purchase@plant.com', active: true, password: 'purchase' },
];

const INITIAL_PARTS = [
  { id: 1, name: 'Deep Groove Bearing', partNo: 'BRG-6205', category: 'Bearings', unit: 'pcs', storeStock: 18, minStock: 10, engineerStock: { 1: 4, 2: 2 } },
  { id: 2, name: 'Oil Seal 40×60', partNo: 'SL-40-60', category: 'Seals', unit: 'pcs', storeStock: 5, minStock: 8, engineerStock: { 1: 1, 2: 0 } },
  { id: 3, name: 'Air Filter Element', partNo: 'AFE-227', category: 'Filters', unit: 'pcs', storeStock: 22, minStock: 12, engineerStock: { 1: 2, 2: 3 } },
  { id: 4, name: 'V-Belt A45', partNo: 'BLT-A45', category: 'Belts', unit: 'pcs', storeStock: 3, minStock: 6, engineerStock: { 1: 0, 2: 1 } },
  { id: 5, name: 'Gate Valve 1"', partNo: 'VLV-GV1', category: 'Valves', unit: 'pcs', storeStock: 9, minStock: 4, engineerStock: { 1: 1, 2: 0 } },
  { id: 6, name: 'Pressure Sensor', partNo: 'SEN-PS-100', category: 'Sensors', unit: 'pcs', storeStock: 4, minStock: 3, engineerStock: { 1: 1, 2: 1 } },
];

const INITIAL_REQUESTS = [
  { id: 1, partId: 1, qty: 3, engineerId: 1, machine: 'Pump Unit A-12', priority: 'Normal', notes: 'Scheduled PM', status: 'Approved', date: '2026-06-08', approvedBy: 'Charlie' },
  { id: 2, partId: 4, qty: 2, engineerId: 2, machine: 'Conveyor Drive B', priority: 'Urgent', notes: 'Belt worn', status: 'Pending', date: '2026-06-11', approvedBy: null },
  { id: 3, partId: 2, qty: 4, engineerId: 1, machine: 'Compressor C-3', priority: 'Critical', notes: 'Leaking seal', status: 'Pending', date: '2026-06-12', approvedBy: null },
  { id: 4, partId: 3, qty: 5, engineerId: 2, machine: 'Air Handler AH-2', priority: 'Normal', notes: 'Monthly filter change', status: 'Issued', date: '2026-06-05', approvedBy: 'Charlie' },
];

const INITIAL_UTILIZATION = [
  { id: 1, partId: 1, qty: 2, engineerId: 1, machine: 'Pump Unit A-12', activity: 'Preventive Maintenance', remarks: 'Replaced during PM', date: '2026-06-08' },
  { id: 2, partId: 3, qty: 3, engineerId: 2, machine: 'Air Handler AH-2', activity: 'Corrective Repair', remarks: 'Clogged filter', date: '2026-06-07' },
  { id: 3, partId: 4, qty: 1, engineerId: 2, machine: 'Conveyor Drive B', activity: 'Corrective Repair', remarks: 'Belt snapped', date: '2026-06-05' },
];

const INITIAL_PR = [
  { id: 1, partId: 2, qty: 20, reason: 'Below minimum (5 < 8)', status: 'Pending', generatedDate: '2026-06-11', approvedBy: null },
  { id: 2, partId: 4, qty: 15, reason: 'Below minimum (3 < 6)', status: 'Pending', generatedDate: '2026-06-12', approvedBy: null },
];

const INITIAL_TRANSACTIONS = [
  { type: 'Issue', part: 'Air Filter Element', qty: 5, engineer: 'Bob Nair', date: '2026-06-05' },
  { type: 'Utilization', part: 'V-Belt A45', qty: 1, engineer: 'Bob Nair', date: '2026-06-05' },
  { type: 'Utilization', part: 'Deep Groove Bearing', qty: 2, engineer: 'Alice Johnson', date: '2026-06-08' },
  { type: 'Request', part: 'Oil Seal 40×60', qty: 4, engineer: 'Alice Johnson', date: '2026-06-12' },
];

const INITIAL_AUDIT = [
  { action: 'Request Approved', detail: 'Request #1 – Bearing ×3 by Alice', user: 'Charlie (Admin)', date: '2026-06-08 09:14' },
  { action: 'Part Issued', detail: 'Air Filter ×5 to Bob', user: 'Dave (Store)', date: '2026-06-05 14:22' },
  { action: 'PR Generated', detail: 'Auto-PR for Oil Seal – below min stock', user: 'System', date: '2026-06-11 08:00' },
  { action: 'PR Generated', detail: 'Auto-PR for V-Belt A45 – below min stock', user: 'System', date: '2026-06-12 08:00' },
];

const NAV_CONFIG = {
  admin: [
    { page: 'page-dashboard', icon: '⬡', label: 'Dashboard' },
    { section: 'Operations' },
    { page: 'page-requests', icon: '📋', label: 'Spare Requests', badge: (reqs) => reqs.filter(r => r.status === 'Pending').length || null },
    { page: 'page-stock', icon: '📦', label: 'Stock Management' },
    { page: 'page-utilization', icon: '🔧', label: 'Utilization Log' },
    { page: 'page-purchase', icon: '🛒', label: 'Purchase Requests', badge: (_, prs) => prs.filter(p => p.status === 'Pending').length || null },
    { section: 'Admin' },
    { page: 'page-database', icon: '🗄', label: 'Database' },
    { page: 'page-reports', icon: '📊', label: 'Reports' },
  ],
  engineer: [
    { page: 'page-dashboard', icon: '⬡', label: 'My Dashboard' },
    { section: 'My Work' },
    { page: 'page-requests', icon: '📋', label: 'My Requests' },
    { page: 'page-stock', icon: '📦', label: 'My Stock' },
    { page: 'page-utilization', icon: '🔧', label: 'Log Utilization' },
  ],
  store: [
    { page: 'page-dashboard', icon: '⬡', label: 'Store Dashboard' },
    { section: 'Store' },
    { page: 'page-requests', icon: '📋', label: 'Issue Parts', badge: (reqs) => reqs.filter(r => r.status === 'Approved').length || null },
    { page: 'page-stock', icon: '📦', label: 'Central Stock' },
  ],
  purchase: [
    { page: 'page-dashboard', icon: '⬡', label: 'Purchase Dashboard' },
    { section: 'Procurement' },
    { page: 'page-purchase', icon: '🛒', label: 'Purchase Requests' },
  ],
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0f1117; --surface: #181c27; --surface2: #1e2335; --border: #2a3050;
    --accent: #3b82f6; --accent2: #f59e0b; --danger: #ef4444; --success: #22c55e;
    --warn: #f59e0b; --text: #e2e8f0; --muted: #64748b;
    --mono: 'IBM Plex Mono', monospace; --sans: 'IBM Plex Sans', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; font-size: 14px; line-height: 1.5; }
  #app { display: flex; height: 100vh; overflow: hidden; }
  
  /* LOGIN PAGE STYLES */
  .login-wrapper { display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg); }
  .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .login-logo { text-align: center; margin-bottom: 30px; }
  .login-logo .logo-mark { font-size: 24px; color: var(--accent); }
  
  aside { width: 220px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; }
  .logo { padding: 20px 16px 16px; border-bottom: 1px solid var(--border); }
  .logo-mark { font-family: var(--mono); font-size: 18px; font-weight: 600; color: var(--accent); letter-spacing: -0.5px; }
  .logo-sub { font-size: 11px; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
  .role-badge { margin: 12px 16px; padding: 6px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; font-family: var(--mono); font-size: 11px; }
  .role-badge span { color: var(--accent2); font-weight: 600; }
  nav { flex: 1; padding: 8px 0; }
  nav a { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: color .15s, background .15s; border-left: 2px solid transparent; }
  nav a:hover { color: var(--text); background: var(--surface2); }
  nav a.active { color: var(--accent); border-left-color: var(--accent); background: rgba(59,130,246,.07); }
  nav .nav-section { font-family: var(--mono); font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; padding: 16px 16px 4px; }
  nav a .icon { font-size: 16px; width: 20px; text-align: center; }
  nav a .badge { margin-left: auto; background: var(--danger); color: white; font-size: 10px; font-family: var(--mono); padding: 1px 5px; border-radius: 10px; font-weight: 600; }
  .bottom-actions { padding: 16px; border-top: 1px solid var(--border); }
  
  main { flex: 1; overflow-y: auto; padding: 24px 28px; background: var(--bg); }
  .page { display: none; }
  .page.active { display: block; }
  .page-title { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
  .stat-card .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
  .stat-card .value { font-family: var(--mono); font-size: 28px; font-weight: 600; }
  .stat-card.accent .value { color: var(--accent); }
  .stat-card.warn .value { color: var(--warn); }
  .stat-card.danger .value { color: var(--danger); }
  .stat-card.success .value { color: var(--success); }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 20px; }
  .card-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); padding: 8px 12px; border-bottom: 1px solid var(--border); }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(42,48,80,.5); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(30,35,53,.6); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-family: var(--mono); font-weight: 600; }
  .badge-pending { background: rgba(245,158,11,.15); color: var(--warn); border: 1px solid rgba(245,158,11,.3); }
  .badge-approved { background: rgba(34,197,94,.12); color: var(--success); border: 1px solid rgba(34,197,94,.3); }
  .badge-rejected { background: rgba(239,68,68,.12); color: var(--danger); border: 1px solid rgba(239,68,68,.3); }
  .badge-issued { background: rgba(59,130,246,.12); color: var(--accent); border: 1px solid rgba(59,130,246,.3); }
  .badge-low { background: rgba(239,68,68,.12); color: var(--danger); border: 1px solid rgba(239,68,68,.3); }
  .badge-ok { background: rgba(34,197,94,.12); color: var(--success); border: 1px solid rgba(34,197,94,.3); }
  .badge-critical { background: rgba(239,68,68,.2); color: #fca5a5; border: 1px solid rgba(239,68,68,.5); }
  .badge-engineer { background: rgba(168,85,247,.15); color: #c4b5fd; border: 1px solid rgba(168,85,247,.3); }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 14px; border-radius: 5px; border: none; font-family: var(--sans); font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity .15s, transform .1s; }
  .btn:active { transform: scale(.98); }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { opacity: .88; }
  .btn-success { background: var(--success); color: #0f1117; }
  .btn-success:hover { opacity: .88; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { opacity: .88; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); background: var(--surface2); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-warn { background: var(--warn); color: #0f1117; }
  .btn-block { width: 100%; padding: 10px; font-size: 14px; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-size: 12px; color: var(--muted); font-weight: 500; }
  .form-group input, .form-group select, .form-group textarea { background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 8px 10px; border-radius: 5px; font-family: var(--sans); font-size: 13px; outline: none; transition: border-color .15s; }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
  .form-group textarea { resize: vertical; min-height: 70px; }
  .stock-bar { height: 5px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .stock-bar-fill { height: 100%; border-radius: 3px; transition: width .3s; }
  #toast-area { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 10px; }
  .toast { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 12px 16px; border-radius: 6px; font-size: 13px; max-width: 320px; animation: slidein .25s ease; box-shadow: 0 4px 20px rgba(0,0,0,.4); }
  .toast.success { border-left-color: var(--success); }
  .toast.warn { border-left-color: var(--warn); }
  .toast.danger { border-left-color: var(--danger); }
  @keyframes slidein { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 500; align-items: center; justify-content: center; }
  .modal-overlay.open { display: flex; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px; width: 500px; max-width: 95vw; max-height: 85vh; overflow-y: auto; }
  .modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .alert { padding: 12px 16px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .alert-warn { background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.3); color: #fde68a; }
  .alert-danger { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: #fca5a5; }
  .flex { display: flex; } .gap-2 { gap: 8px; } .gap-3 { gap: 12px; } .items-center { align-items: center; } .justify-between { justify-content: space-between; }
  .text-muted { color: var(--muted); } .text-mono { font-family: var(--mono); } .text-sm { font-size: 12px; }
  .mt-2 { margin-top: 8px; } .mb-3 { margin-bottom: 12px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
  .engineer-stock-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 14px; margin-bottom: 10px; }
  .engineer-stock-card .eng-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .engineer-stock-card .eng-name { font-weight: 600; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

export default function SpareTrackApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activePage, setActivePage] = useState('page-dashboard');
  const [engineers, setEngineers] = useState(INITIAL_ENGINEERS);
  const [users] = useState(INITIAL_USERS);
  const [parts, setParts] = useState(INITIAL_PARTS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [utilization, setUtilization] = useState(INITIAL_UTILIZATION);
  const [purchaseRequests, setPurchaseRequests] = useState(INITIAL_PR);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT);
  
  const [toasts, setToasts] = useState([]);
  const [openModal, setOpenModal] = useState(null);
  
  const [editingPartId, setEditingPartId] = useState(null);
  const [editingEngId, setEditingEngId] = useState(null);
  const [deletingEngId, setDeletingEngId] = useState(null);
  const [issuingRequestId, setIssuingRequestId] = useState(null);

  const [reqFilter, setReqFilter] = useState('all');

  // Form States
  const [reqForm, setReqForm] = useState({ partId: '', qty: 1, machine: '', priority: 'Normal', notes: '' });
  const [utilForm, setUtilForm] = useState({ partId: '', qty: 1, machine: '', activity: 'Preventive Maintenance', remarks: '' });
  const [partForm, setPartForm] = useState({ name: '', partNo: '', category: 'Bearings', unit: 'pcs', storeStock: 0, minStock: 5 });
  const [engForm, setEngForm] = useState({ name: '', empId: '', email: '', dept: '', password: '' });
  const [issueQty, setIssueQty] = useState(1);

  // Initialize selected dropdowns
  useEffect(() => {
    if (parts.length > 0) {
      setReqForm(prev => ({ ...prev, partId: prev.partId || parts[0].id.toString() }));
      setUtilForm(prev => ({ ...prev, partId: prev.partId || parts[0].id.toString() }));
    }
  }, [parts]);

  // Helpers
  const nextId = (arr) => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  const today = () => new Date().toISOString().split('T')[0];
  const now = () => new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
  const engName = (id) => engineers.find(e => e.id === id)?.name || 'Unknown';
  
  // Define Role from currentUser
  const role = currentUser ? (currentUser.role || 'engineer') : null;
  const roleLabel = { admin: 'Admin', engineer: 'Engineer', store: 'Store Team', purchase: 'Purchase Team' }[role];

  const showToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const addTxn = (type, part, qty, engineer) => {
    setTransactions(prev => [...prev, { type, part, qty, engineer, date: today() }]);
  };

  const addAudit = (action, detail, user) => {
    setAuditLog(prev => [...prev, { action, detail, user, date: now() }]);
  };

  // ══════════════════════════════════════════
  // AUTH ACTIONS
  // ══════════════════════════════════════════
  const handleLogin = (e) => {
    e.preventDefault();
    const allAccounts = [...engineers.map(e => ({...e, role: 'engineer'})), ...users];
    const foundUser = allAccounts.find(u => u.email === loginEmail && u.password === loginPassword);
    
    if (foundUser) {
      if (!foundUser.active) {
        showToast('Your account is deactivated.', 'danger');
        return;
      }
      setCurrentUser(foundUser);
      setActivePage('page-dashboard');
      showToast(`Welcome back, ${foundUser.name.split(' ')[0]}!`, 'success');
    } else {
      showToast('Invalid email or password.', 'danger');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    showToast('Logged out successfully.');
  };

  // ══════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════
  const checkLowStock = (updatedPart) => {
    if (updatedPart.storeStock < updatedPart.minStock) {
      setPurchaseRequests(prev => {
        const exists = prev.find(pr => pr.partId === updatedPart.id && pr.status === 'Pending');
        if (!exists) {
          const id = nextId(prev);
          const newPR = { 
            id, 
            partId: updatedPart.id, 
            qty: updatedPart.minStock * 3 - updatedPart.storeStock, 
            reason: `Below minimum (${updatedPart.storeStock} < ${updatedPart.minStock})`, 
            status: 'Pending', 
            generatedDate: today(), 
            approvedBy: null 
          };
          addAudit('PR Generated', `Auto-PR for ${updatedPart.name} – below min stock`, 'System');
          showToast(`⚠ Low stock! Auto-PR generated for ${updatedPart.name}.`, 'warn');
          return [...prev, newPR];
        }
        return prev;
      });
    }
  };

  const handleRaiseRequest = () => {
    const pId = parseInt(reqForm.partId);
    const q = parseInt(reqForm.qty);
    const m = reqForm.machine.trim();
    if (!m) { showToast('Enter the machine / equipment name.', 'warn'); return; }
    
    const eId = role === 'engineer' ? currentUser.id : 1; 
    const id = nextId(requests);
    const newReq = { id, partId: pId, qty: q, engineerId: eId, machine: m, priority: reqForm.priority, notes: reqForm.notes, status: 'Pending', date: today(), approvedBy: null };
    
    setRequests(prev => [...prev, newReq]);
    addAudit('Request Raised', `Request #${id} by ${engName(eId)}`, engName(eId));
    addTxn('Request', parts.find(p => p.id === pId)?.name, q, engName(eId));
    
    showToast('Request submitted. Awaiting admin approval.', 'success');
    setReqForm(prev => ({ ...prev, machine: '', notes: '' }));
  };

  const handleApproveRequest = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved', approvedBy: currentUser.name } : r));
    const r = requests.find(x => x.id === id);
    addAudit('Request Approved', `Request #${id} – ${parts.find(p => p.id === r?.partId)?.name} ×${r?.qty}`, currentUser.name);
    showToast(`Request #${id} approved.`, 'success');
  };

  const handleRejectRequest = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    addAudit('Request Rejected', `Request #${id}`, currentUser.name);
    showToast(`Request #${id} rejected.`, 'warn');
  };

  const openIssueModal = (id) => {
    const r = requests.find(x => x.id === id); 
    if (!r) return;
    setIssuingRequestId(id);
    setIssueQty(r.qty);
    setOpenModal('modal-issue');
  };

  const confirmIssue = () => {
    const r = requests.find(x => x.id === issuingRequestId); 
    if (!r) return;
    const qty = parseInt(issueQty);
    const p = parts.find(x => x.id === r.partId);
    if (p.storeStock < qty) { showToast('Insufficient store stock!', 'danger'); return; }

    let updatedPart;
    setParts(prev => prev.map(part => {
      if (part.id === p.id) {
        updatedPart = {
          ...part,
          storeStock: part.storeStock - qty,
          engineerStock: {
            ...part.engineerStock,
            [r.engineerId]: (part.engineerStock[r.engineerId] || 0) + qty
          }
        };
        return updatedPart;
      }
      return part;
    }));

    setRequests(prev => prev.map(req => req.id === r.id ? { ...req, status: 'Issued' } : req));
    addTxn('Issue', p.name, qty, engName(r.engineerId));
    addAudit('Part Issued', `${p.name} ×${qty} to ${engName(r.engineerId)}`, currentUser.name);
    
    if (updatedPart) checkLowStock(updatedPart);
    
    setOpenModal(null);
    showToast(`${p.name} ×${qty} issued to ${engName(r.engineerId)}.`, 'success');
  };

  const handleLogUtilization = () => {
    const pId = parseInt(utilForm.partId);
    const q = parseInt(utilForm.qty);
    const m = utilForm.machine.trim();
    if (!m) { showToast('Enter the machine / product name.', 'warn'); return; }
    
    const p = parts.find(x => x.id === pId);
    const eId = role === 'engineer' ? currentUser.id : 1;

    if ((p.engineerStock[eId] || 0) < q) { showToast('Insufficient stock with you. Request more parts first.', 'danger'); return; }

    let updatedPart;
    setParts(prev => prev.map(part => {
      if (part.id === pId) {
        updatedPart = {
          ...part,
          engineerStock: {
            ...part.engineerStock,
            [eId]: part.engineerStock[eId] - q
          }
        };
        return updatedPart;
      }
      return part;
    }));

    const id = nextId(utilization);
    setUtilization(prev => [...prev, { id, partId: pId, qty: q, engineerId: eId, machine: m, activity: utilForm.activity, remarks: utilForm.remarks, date: today() }]);
    
    addTxn('Utilization', p.name, q, engName(eId));
    addAudit('Utilization Logged', `${p.name} ×${q} on ${m}`, engName(eId));
    
    if (updatedPart) checkLowStock(updatedPart);
    
    showToast(`Utilization logged: ${p.name} ×${q} on ${m}.`, 'success');
    setUtilForm(prev => ({ ...prev, machine: '', remarks: '' }));
  };

  const handleApprovePR = (id) => {
    setPurchaseRequests(prev => prev.map(pr => pr.id === id ? { ...pr, status: 'Approved', approvedBy: currentUser.name } : pr));
    addAudit('PR Approved', `PR-${String(id).padStart(4, '0')}`, currentUser.name);
    showToast('Purchase Request approved. Purchase Team notified.', 'success');
  };

  const handleRejectPR = (id) => {
    setPurchaseRequests(prev => prev.map(pr => pr.id === id ? { ...pr, status: 'Rejected' } : pr));
    showToast('Purchase Request rejected.', 'warn');
  };

  // DB Modals & Actions
  const handleOpenAddPartModal = () => {
    setEditingPartId(null);
    setPartForm({ name: '', partNo: '', category: 'Bearings', unit: 'pcs', storeStock: 0, minStock: 5 });
    setOpenModal('modal-part');
  };

  const handleOpenEditPartModal = (id) => {
    const p = parts.find(x => x.id === id); 
    if (!p) return;
    setEditingPartId(id);
    setPartForm({ name: p.name, partNo: p.partNo, category: p.category, unit: p.unit, storeStock: p.storeStock, minStock: p.minStock });
    setOpenModal('modal-part');
  };

  const handleSavePart = () => {
    const { name, partNo, category, unit, storeStock, minStock } = partForm;
    if (!name.trim() || !partNo.trim()) { showToast('Part name and number are required.', 'warn'); return; }
    
    const data = { name: name.trim(), partNo: partNo.trim(), category, unit, storeStock: parseInt(storeStock) || 0, minStock: parseInt(minStock) || 5 };
    
    if (editingPartId) {
      setParts(prev => prev.map(p => p.id === editingPartId ? { ...p, ...data } : p));
      addAudit('Part Updated', `${data.name} (${data.partNo})`, currentUser.name);
      showToast(`${data.name} updated.`, 'success');
    } else {
      const id = nextId(parts);
      const engStock = {};
      engineers.forEach(e => { engStock[e.id] = 0; });
      setParts(prev => [...prev, { id, ...data, engineerStock: engStock }]);
      addAudit('Part Added', `${data.name} (${data.partNo})`, currentUser.name);
      showToast(`${data.name} added to catalogue.`, 'success');
    }
    setOpenModal(null);
  };

  const handleDeletePart = (id) => {
    const p = parts.find(x => x.id === id);
    if (!window.confirm(`Delete "${p?.name}"? This cannot be undone.`)) return;
    setParts(prev => prev.filter(x => x.id !== id));
    addAudit('Part Deleted', p.name, currentUser.name);
    showToast(`${p.name} removed from catalogue.`, 'warn');
  };

  const handleOpenAddEngineerModal = () => {
    setEditingEngId(null);
    setEngForm({ name: '', empId: '', email: '', dept: '', password: '' });
    setOpenModal('modal-engineer');
  };

  const handleOpenEditEngineerModal = (id) => {
    const e = engineers.find(x => x.id === id); 
    if (!e) return;
    setEditingEngId(id);
    setEngForm({ name: e.name, empId: e.empId, email: e.email, dept: e.dept, password: e.password || '' });
    setOpenModal('modal-engineer');
  };

  const handleSaveEngineer = () => {
    const { name, empId, email, dept, password } = engForm;
    if (!name.trim() || !empId.trim() || !password.trim()) { showToast('Name, Employee ID, and Password are required.', 'warn'); return; }
    
    const data = { name: name.trim(), empId: empId.trim(), email: email.trim(), dept: dept.trim(), password: password.trim() };
    
    if (editingEngId) {
      setEngineers(prev => prev.map(e => e.id === editingEngId ? { ...e, ...data } : e));
      addAudit('Engineer Updated', `${data.name} (${data.empId})`, currentUser.name);
      showToast(`${data.name} updated.`, 'success');
    } else {
      const id = nextId(engineers);
      setEngineers(prev => [...prev, { id, ...data, active: true }]);
      setParts(prev => prev.map(p => ({ ...p, engineerStock: { ...p.engineerStock, [id]: 0 } })));
      addAudit('Engineer Added', `${data.name} (${data.empId})`, currentUser.name);
      showToast(`${data.name} added as engineer.`, 'success');
    }
    setOpenModal(null);
  };

  const handlePromptDeleteEngineer = (id) => {
    setDeletingEngId(id);
    setOpenModal('modal-del-engineer');
  };

  const handleConfirmDeleteEngineer = () => {
    const e = engineers.find(x => x.id === deletingEngId); 
    if (!e) return;
    
    setParts(prev => prev.map(p => {
      const engStock = p.engineerStock[deletingEngId] || 0;
      const newEngStock = { ...p.engineerStock };
      delete newEngStock[deletingEngId];
      return { ...p, storeStock: p.storeStock + engStock, engineerStock: newEngStock };
    }));
    
    setRequests(prev => prev.map(r => r.engineerId === deletingEngId ? { ...r, engineerId: null } : r));
    setUtilization(prev => prev.map(u => u.engineerId === deletingEngId ? { ...u, engineerId: null } : u));
    setEngineers(prev => prev.filter(x => x.id !== deletingEngId));
    
    addAudit('Engineer Removed', `${e.name} (${e.empId}) – stock returned to store`, currentUser.name);
    setOpenModal(null);
    showToast(`${e.name} removed. Their stock has been returned to the central store.`, 'warn');
  };

  // ══════════════════════════════════════════
  // RENDER HELPERS
  // ══════════════════════════════════════════
  const buildEngStockTable = (engId) => {
    const rows = parts.filter(p => (p.engineerStock[engId] || 0) > 0);
    if (!rows.length) return <div className="text-muted text-sm">No stock with this engineer.</div>;
    return (
      <table>
        <thead><tr><th>Part</th><th>Qty</th><th>Unit</th></tr></thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td className="text-mono">{p.engineerStock[engId]}</td><td className="text-muted text-sm">{p.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ══════════════════════════════════════════
  // RENDER PAGES
  // ══════════════════════════════════════════
  const renderDashboard = () => {
    const totalStock = parts.reduce((s, p) => s + p.storeStock, 0);
    const lowParts = parts.filter(p => p.storeStock < p.minStock).length;
    const pendingReq = requests.filter(r => r.status === 'Pending').length;
    const pendingPR = purchaseRequests.filter(p => p.status === 'Pending').length;

    let subText, statGrid, content;
    const eId = role === 'engineer' ? currentUser.id : null;

    if (role === 'engineer') {
      subText = 'Your current spare parts stock and recent activity.';
      statGrid = (
        <>
          <div className="stat-card accent"><div className="label">My Stock (types)</div><div className="value">{parts.filter(p => (p.engineerStock[eId] || 0) > 0).length}</div></div>
          <div className="stat-card"><div className="label">My Requests</div><div className="value">{requests.filter(r => r.engineerId === eId).length}</div></div>
          <div className="stat-card warn"><div className="label">Pending Approval</div><div className="value">{requests.filter(r => r.engineerId === eId && r.status === 'Pending').length}</div></div>
          <div className="stat-card success"><div className="label">Utilizations Logged</div><div className="value">{utilization.filter(u => u.engineerId === eId).length}</div></div>
        </>
      );
      content = <div className="card" id="engineer-stock-section"><div className="card-title">My Stock</div>{buildEngStockTable(eId)}</div>;
    } else if (role === 'store') {
      subText = 'Parts approved and ready to be issued.';
      statGrid = (
        <>
          <div className="stat-card accent"><div className="label">Total Store Stock</div><div className="value">{totalStock}</div></div>
          <div className="stat-card warn"><div className="label">Awaiting Issue</div><div className="value">{requests.filter(r => r.status === 'Approved').length}</div></div>
          <div className="stat-card danger"><div className="label">Low Stock Parts</div><div className="value">{lowParts}</div></div>
        </>
      );
    } else if (role === 'purchase') {
      subText = 'Purchase requests forwarded to your team.';
      statGrid = (
        <>
          <div className="stat-card warn"><div className="label">Open PRs</div><div className="value">{pendingPR}</div></div>
          <div className="stat-card success"><div className="label">Approved PRs</div><div className="value">{purchaseRequests.filter(p => p.status === 'Approved').length}</div></div>
        </>
      );
    } else {
      subText = 'Consolidated view across all engineers and central store.';
      statGrid = (
        <>
          <div className="stat-card accent"><div className="label">Total Store Stock</div><div className="value">{totalStock}</div></div>
          <div className="stat-card warn"><div className="label">Pending Requests</div><div className="value">{pendingReq}</div></div>
          <div className="stat-card danger"><div className="label">Low Stock Alerts</div><div className="value">{lowParts}</div></div>
          <div className="stat-card"><div className="label">Pending PRs</div><div className="value">{pendingPR}</div></div>
          <div className="stat-card success"><div className="label">Engineers</div><div className="value">{engineers.length}</div></div>
          <div className="stat-card"><div className="label">Parts Catalogue</div><div className="value">{parts.length}</div></div>
        </>
      );
    }

    const lowItems = parts.filter(p => p.storeStock < p.minStock);
    const pendingRequestsList = requests.filter(r => r.status === 'Pending').slice(0, 4);
    const recentTxns = [...transactions].reverse().slice(0, 5);

    if (role !== 'engineer') {
      content = (
        <>
          <div id="low-stock-alerts">
            {lowItems.map(p => (
              <div key={p.id} className={`alert alert-${p.storeStock === 0 ? 'danger' : 'warn'}`}>
                ⚠ <strong>{p.name}</strong> — Store stock: <strong>{p.storeStock} {p.unit}</strong> (min: {p.minStock}). Auto-PR generated.
              </div>
            ))}
          </div>
          <div className="two-col">
            <div className="card">
              <div className="card-title">Pending Approvals <button className="btn btn-ghost btn-sm" onClick={() => setActivePage('page-requests')}>View all</button></div>
              <div className="table-wrap">
                {pendingRequestsList.length > 0 ? (
                  <table>
                    <thead><tr><th>Engineer</th><th>Part</th><th>Qty</th><th>Priority</th>{role === 'admin' && <th>Actions</th>}</tr></thead>
                    <tbody>
                      {pendingRequestsList.map(r => {
                        const p = parts.find(x => x.id === r.partId);
                        return (
                          <tr key={r.id}>
                            <td>{engName(r.engineerId)}</td><td>{p?.name}</td><td className="text-mono">{r.qty}</td>
                            <td><span className={`badge badge-${r.priority === 'Critical' ? 'critical' : r.priority === 'Urgent' ? 'pending' : 'issued'}`}>{r.priority}</span></td>
                            {role === 'admin' && (
                              <td>
                                <button className="btn btn-success btn-sm" onClick={() => handleApproveRequest(r.id)}>Approve</button>
                                <button className="btn btn-danger btn-sm" style={{marginLeft: '4px'}} onClick={() => handleRejectRequest(r.id)}>Reject</button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : <div className="text-muted text-sm" style={{padding: '8px'}}>No pending requests.</div>}
              </div>
            </div>
            <div className="card">
              <div className="card-title">Recent Transactions</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Type</th><th>Part</th><th>Qty</th><th>Engineer</th><th>Date</th></tr></thead>
                  <tbody>
                    {recentTxns.map((t, idx) => (
                      <tr key={idx}>
                        <td><span className={`badge badge-${t.type === 'Issue' ? 'issued' : t.type === 'Utilization' ? 'approved' : 'pending'}`}>{t.type}</span></td>
                        <td>{t.part}</td><td className="text-mono">{t.qty}</td><td>{t.engineer}</td><td className="text-muted text-sm">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {role === 'admin' && (
            <div className="card">
              <div className="card-title">Engineer Stock Overview</div>
              {engineers.map(eng => (
                <div className="engineer-stock-card" key={eng.id}>
                  <div className="eng-header">
                    <div className="eng-name">{eng.name} <span className="badge badge-engineer" style={{fontSize: '10px'}}>{eng.empId}</span></div>
                    <span className="text-muted text-sm">{eng.dept}</span>
                  </div>
                  {buildEngStockTable(eng.id)}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    return (
      <div className={`page ${activePage === 'page-dashboard' ? 'active' : ''}`}>
        <div className="page-title">Command Center</div>
        <div className="page-sub">{subText}</div>
        <div className="stat-grid">{statGrid}</div>
        {content}
      </div>
    );
  };

  const renderRequestsPage = () => {
    let filteredRequests = requests;
    if (reqFilter !== 'all') filteredRequests = filteredRequests.filter(r => r.status === reqFilter);
    if (role === 'engineer') filteredRequests = filteredRequests.filter(r => r.engineerId === currentUser.id);

    return (
      <div className={`page ${activePage === 'page-requests' ? 'active' : ''}`}>
        <div className="page-title">Spare Part Requests</div>
        <div className="page-sub">Raise, track, and manage spare part requests.</div>
        
        {role !== 'store' && role !== 'purchase' && (
          <div className="card">
            <div className="card-title">Raise New Request</div>
            <div className="form-grid">
              <div className="form-group"><label>Spare Part</label>
                <select value={reqForm.partId} onChange={e => setReqForm({...reqForm, partId: e.target.value})}>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.partNo})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Quantity</label>
                <input type="number" min="1" value={reqForm.qty} onChange={e => setReqForm({...reqForm, qty: e.target.value})} />
              </div>
              <div className="form-group"><label>Machine / Equipment</label>
                <input type="text" placeholder="e.g. Pump Unit A-12" value={reqForm.machine} onChange={e => setReqForm({...reqForm, machine: e.target.value})} />
              </div>
              <div className="form-group"><label>Priority</label>
                <select value={reqForm.priority} onChange={e => setReqForm({...reqForm, priority: e.target.value})}>
                  <option>Normal</option><option>Urgent</option><option>Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group mb-3" style={{maxWidth: '460px'}}><label>Justification</label>
              <textarea placeholder="Describe why this part is needed…" value={reqForm.notes} onChange={e => setReqForm({...reqForm, notes: e.target.value})} />
            </div>
            <button className="btn btn-primary" onClick={handleRaiseRequest}>Submit Request</button>
          </div>
        )}

        <div className="card">
          <div className="card-title">
            Request History
            <select value={reqFilter} onChange={e => setReqFilter(e.target.value)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text)',padding:'5px 8px',borderRadius:'4px',fontSize:'12px',fontFamily:'var(--sans)'}}>
              <option value="all">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Issued">Issued</option><option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Part</th><th>Qty</th><th>Engineer</th><th>Machine</th><th>Priority</th><th>Status</th><th>Date</th>
                  {role !== 'engineer' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const p = parts.find(x => x.id === r.partId);
                  return (
                    <tr key={r.id}>
                      <td className="text-mono text-muted">#{r.id}</td><td>{p?.name}</td><td className="text-mono">{r.qty}</td>
                      <td>{engName(r.engineerId)}</td><td>{r.machine}</td>
                      <td><span className={`badge badge-${r.priority === 'Critical' ? 'critical' : r.priority === 'Urgent' ? 'pending' : 'issued'}`}>{r.priority}</span></td>
                      <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                      <td className="text-muted text-sm">{r.date}</td>
                      {role !== 'engineer' && (
                        <td style={{whiteSpace: 'nowrap'}}>
                          {r.status === 'Pending' && role === 'admin' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleApproveRequest(r.id)}>✓</button>
                              <button className="btn btn-danger btn-sm" style={{marginLeft: '4px'}} onClick={() => handleRejectRequest(r.id)}>✗</button>
                            </>
                          )}
                          {r.status === 'Approved' && (role === 'store' || role === 'admin') && (
                            <button className="btn btn-primary btn-sm" onClick={() => openIssueModal(r.id)}>Issue</button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStockPage = () => {
    const lowCount = parts.filter(p => p.storeStock < p.minStock).length;
    return (
      <div className={`page ${activePage === 'page-stock' ? 'active' : ''}`}>
        <div className="page-title">Stock Management</div>
        <div className="page-sub">Current inventory levels, minimum thresholds, and automatic PR generation.</div>
        <div className="stat-grid">
          <div className="stat-card accent"><div className="label">Total Store Stock</div><div className="value">{parts.reduce((s, p) => s + p.storeStock, 0)}</div></div>
          <div className="stat-card"><div className="label">Part Types</div><div className="value">{parts.length}</div></div>
          <div className="stat-card danger"><div className="label">Below Minimum</div><div className="value">{lowCount}</div></div>
        </div>
        <div className="card">
          <div className="card-title">
            Inventory 
            {role === 'admin' && <button className="btn btn-primary btn-sm" onClick={handleOpenAddPartModal}>+ Add Part</button>}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Part Name</th><th>Part No.</th><th>Category</th><th>Store Stock</th><th>Min Level</th><th>Status</th>
                  {role === 'engineer' ? <th>With Me</th> : engineers.map(e => <th key={e.id}>{e.name.split(' ')[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {parts.map(p => {
                  const isLow = p.storeStock < p.minStock;
                  const pct = Math.min(100, Math.round(p.storeStock / (p.minStock * 2) * 100));
                  return (
                    <tr key={p.id} className={isLow ? 'low-stock-row' : ''}>
                      <td>{p.name}</td><td className="text-mono text-muted text-sm">{p.partNo}</td><td>{p.category}</td>
                      <td>
                        <span className="text-mono">{p.storeStock} {p.unit}</span>
                        <div className="stock-bar"><div className="stock-bar-fill" style={{width: `${pct}%`, background: isLow ? 'var(--danger)' : 'var(--success)'}}></div></div>
                      </td>
                      <td className="text-mono">{p.minStock}</td>
                      <td><span className={`badge badge-${isLow ? 'low' : 'ok'}`}>{isLow ? 'LOW' : 'OK'}</span></td>
                      {role === 'engineer' ? <td className="text-mono">{p.engineerStock[currentUser.id] || 0}</td> : engineers.map(e => <td key={e.id} className="text-mono">{p.engineerStock[e.id] || 0}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderUtilizationPage = () => {
    const eId = role === 'engineer' ? currentUser.id : null;
    const available = eId ? parts.filter(p => (p.engineerStock[eId] || 0) > 0) : parts;
    let tableRows = utilization;
    if (role === 'engineer') tableRows = tableRows.filter(u => u.engineerId === currentUser.id);

    return (
      <div className={`page ${activePage === 'page-utilization' ? 'active' : ''}`}>
        <div className="page-title">Spare Utilization</div>
        <div className="page-sub">Record spare parts consumed against a specific product, machine, or service activity.</div>
        
        {role !== 'purchase' && (
          <div className="card">
            <div className="card-title">Log Utilization</div>
            <div className="form-grid">
              <div className="form-group"><label>Spare Part</label>
                <select value={utilForm.partId} onChange={e => setUtilForm({...utilForm, partId: e.target.value})}>
                  {available.map(p => <option key={p.id} value={p.id}>{p.name} (In hand: {eId ? p.engineerStock[eId] : p.storeStock} {p.unit})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Quantity Used</label>
                <input type="number" min="1" value={utilForm.qty} onChange={e => setUtilForm({...utilForm, qty: e.target.value})} />
              </div>
              <div className="form-group"><label>Machine / Product</label>
                <input type="text" placeholder="e.g. Compressor B-7" value={utilForm.machine} onChange={e => setUtilForm({...utilForm, machine: e.target.value})} />
              </div>
              <div className="form-group"><label>Activity Type</label>
                <select value={utilForm.activity} onChange={e => setUtilForm({...utilForm, activity: e.target.value})}>
                  <option>Preventive Maintenance</option><option>Corrective Repair</option><option>Installation</option><option>Overhaul</option><option>Testing</option>
                </select>
              </div>
            </div>
            <div className="form-group mb-3" style={{maxWidth: '460px'}}><label>Remarks</label>
              <textarea placeholder="Optional notes…" value={utilForm.remarks} onChange={e => setUtilForm({...utilForm, remarks: e.target.value})} />
            </div>
            <button className="btn btn-primary" onClick={handleLogUtilization}>Record Utilization</button>
          </div>
        )}

        <div className="card">
          <div className="card-title">Utilization Log</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Part</th><th>Qty</th><th>Engineer</th><th>Machine</th><th>Activity</th><th>Remarks</th><th>Date</th></tr></thead>
              <tbody>
                {tableRows.map(u => {
                  const p = parts.find(x => x.id === u.partId);
                  return (
                    <tr key={u.id}>
                      <td className="text-mono text-muted">#{u.id}</td><td>{p?.name}</td><td className="text-mono">{u.qty}</td>
                      <td>{engName(u.engineerId)}</td><td>{u.machine}</td><td>{u.activity}</td>
                      <td className="text-muted text-sm">{u.remarks}</td><td className="text-muted text-sm">{u.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPurchasePage = () => (
    <div className={`page ${activePage === 'page-purchase' ? 'active' : ''}`}>
      <div className="page-title">Purchase Requests</div>
      <div className="page-sub">Auto-generated PRs when stock falls below minimum.</div>
      <div className="card">
        <div className="card-title">Purchase Request Queue</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Part</th><th>Req. Qty</th><th>Reason</th><th>Status</th><th>Generated</th>{role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {purchaseRequests.map(pr => {
                const p = parts.find(x => x.id === pr.partId);
                return (
                  <tr key={pr.id}>
                    <td className="text-mono text-muted">PR-{String(pr.id).padStart(4, '0')}</td>
                    <td>{p?.name} <span className="text-muted text-sm">({p?.partNo})</span></td>
                    <td className="text-mono">{pr.qty} {p?.unit}</td>
                    <td className="text-muted text-sm">{pr.reason}</td>
                    <td><span className={`badge badge-${pr.status.toLowerCase()}`}>{pr.status}</span></td>
                    <td className="text-muted text-sm">{pr.generatedDate}</td>
                    {role === 'admin' && (
                      <td>
                        {pr.status === 'Pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprovePR(pr.id)}>Approve</button>
                            <button className="btn btn-danger btn-sm" style={{marginLeft: '4px'}} onClick={() => handleRejectPR(pr.id)}>Reject</button>
                          </>
                        )}
                        {pr.status === 'Approved' && <span className="text-muted text-sm">Notified Purchase</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDatabasePage = () => (
    <div className={`page ${activePage === 'page-database' ? 'active' : ''}`}>
      <div className="page-title">Database Management</div>
      <div className="page-sub">Manage spare parts catalogue, categories, stock levels, and engineers. Note: Passwords can be managed here.</div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Spare Parts Catalogue <button className="btn btn-primary btn-sm" onClick={handleOpenAddPartModal}>+ Add Part</button></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Part No.</th><th>Category</th><th>Stock</th><th>Min</th><th>Actions</th></tr></thead>
              <tbody>
                {parts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td className="text-mono text-sm text-muted">{p.partNo}</td><td>{p.category}</td>
                    <td className="text-mono">{p.storeStock}</td><td className="text-mono">{p.minStock}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditPartModal(p.id)}>Edit</button>
                      <button className="btn btn-danger btn-sm" style={{marginLeft: '4px'}} onClick={() => handleDeletePart(p.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Engineers <button className="btn btn-primary btn-sm" onClick={handleOpenAddEngineerModal}>+ Add Engineer</button></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Emp ID</th><th>Dept</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                {engineers.map(e => (
                  <tr key={e.id}>
                    <td>{e.name}</td><td className="text-mono text-sm text-muted">{e.empId}</td><td>{e.dept}</td><td className="text-muted text-sm">{e.email}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditEngineerModal(e.id)}>Edit</button>
                      <button className="btn btn-danger btn-sm" style={{marginLeft: '4px'}} onClick={() => handlePromptDeleteEngineer(e.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">All System Accounts (View Only)</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              {engineers.map(e => (
                <tr key={`eng-${e.id}`}>
                  <td>{e.name}</td><td><span className="badge badge-engineer">engineer</span></td>
                  <td className="text-muted text-sm">{e.email}</td><td><span className="badge badge-ok">Active</span></td>
                </tr>
              ))}
              {users.map(u => (
                <tr key={`user-${u.id}`}>
                  <td>{u.name.split(' (')[0]}</td><td><span className="badge badge-issued">{u.role}</span></td>
                  <td className="text-muted text-sm">{u.email}</td><td><span className={`badge badge-${u.active ? 'ok' : 'rejected'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportsPage = () => {
    const byPart = {};
    utilization.forEach(u => { byPart[u.partId] = (byPart[u.partId] || 0) + parseInt(u.qty); });
    const sortedParts = Object.entries(byPart).sort((a, b) => b[1] - a[1]);
    const maxQty = sortedParts[0]?.[1] || 1;

    const sc = {};
    requests.forEach(r => { sc[r.status] = (sc[r.status] || 0) + 1; });

    return (
      <div className={`page ${activePage === 'page-reports' ? 'active' : ''}`}>
        <div className="page-title">Reports & Analytics</div>
        <div className="page-sub">Utilization history, request summaries, and audit logs.</div>
        <div className="two-col">
          <div className="card">
            <div className="card-title">Top Utilized Parts</div>
            <div>
              {sortedParts.length > 0 ? sortedParts.map(([partId, qty]) => {
                const p = parts.find(x => x.id === parseInt(partId));
                return (
                  <div key={partId} style={{marginBottom: '12px'}}>
                    <div className="flex justify-between text-sm" style={{marginBottom: '4px'}}><span>{p?.name}</span><span className="text-mono">{qty} {p?.unit}</span></div>
                    <div className="stock-bar"><div className="stock-bar-fill" style={{width: `${Math.round(qty/maxQty*100)}%`, background: 'var(--accent)'}}></div></div>
                  </div>
                );
              }) : <div className="text-muted text-sm">No data.</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Request Summary by Status</div>
            <div>
              {Object.entries(sc).map(([s, c]) => (
                <div key={s} className="flex justify-between items-center" style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>
                  <span className={`badge badge-${s.toLowerCase()}`}>{s}</span><span className="text-mono" style={{fontSize: '22px'}}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Full Audit Log</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>Detail</th><th>User</th><th>Date/Time</th></tr></thead>
              <tbody>
                {[...auditLog].reverse().map((a, idx) => (
                  <tr key={idx}>
                    <td><span className="badge badge-issued">{a.action}</span></td>
                    <td>{a.detail}</td><td className="text-muted text-sm">{a.user}</td><td className="text-muted text-sm">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Main Return Statement
  if (!currentUser) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-logo">
              <div className="logo-mark">SpareTrack</div>
              <div className="logo-sub">Sign in to your account</div>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="e.g. admin@plant.com" required />
              </div>
              <div className="form-group" style={{marginBottom: '24px'}}>
                <label>Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Log In</button>
            </form>
            <div style={{marginTop: '20px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center'}}>
              <strong>Demo accounts:</strong><br/>
              Admin: admin@plant.com / admin<br/>
              Engineer: alice@plant.com / password123
            </div>
          </div>
        </div>
        <div id="toast-area">
          {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
        </div>
      </>
    );
  }

  const issuingRequestData = requests.find(r => r.id === issuingRequestId);
  const issuingPartData = parts.find(p => p.id === issuingRequestData?.partId);
  const deletingEngData = engineers.find(e => e.id === deletingEngId);
  const deletingEngStock = parts.reduce((s, p) => s + (p.engineerStock[deletingEngId] || 0), 0);
  const deletingEngPartTypes = parts.filter(p => (p.engineerStock[deletingEngId] || 0) > 0).length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div id="app">
        <aside>
          <div className="logo">
            <div className="logo-mark">SpareTrack</div>
            <div className="logo-sub">Parts Utilization System</div>
          </div>
          <div className="role-badge">Logged in as:<br/><span>{currentUser.name} ({roleLabel})</span></div>
          <nav>
            {(NAV_CONFIG[role] || NAV_CONFIG.admin).map((item, idx) => {
              if (item.section) return <div key={idx} className="nav-section">{item.section}</div>;
              const cnt = item.badge ? item.badge(requests, purchaseRequests) : null;
              return (
                <a key={idx} className={activePage === item.page ? 'active' : ''} onClick={() => setActivePage(item.page)}>
                  <span className="icon">{item.icon}</span>{item.label}{cnt ? <span className="badge">{cnt}</span> : ''}
                </a>
              );
            })}
          </nav>
          <div className="bottom-actions">
            <button className="btn btn-ghost btn-block" onClick={handleLogout}>Log Out</button>
          </div>
        </aside>

        <main>
          {renderDashboard()}
          {renderRequestsPage()}
          {renderStockPage()}
          {renderUtilizationPage()}
          {renderPurchasePage()}
          {renderDatabasePage()}
          {renderReportsPage()}
        </main>
      </div>

      {/* Modal: Part */}
      <div className={`modal-overlay ${openModal === 'modal-part' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-title">{editingPartId ? 'Edit Spare Part' : 'Add Spare Part'}</div>
          <div className="form-grid">
            <div className="form-group"><label>Part Name</label><input type="text" placeholder="e.g. Bearing 6205" value={partForm.name} onChange={e => setPartForm({...partForm, name: e.target.value})} /></div>
            <div className="form-group"><label>Part No.</label><input type="text" placeholder="e.g. BRG-6205-ZZ" value={partForm.partNo} onChange={e => setPartForm({...partForm, partNo: e.target.value})} /></div>
            <div className="form-group"><label>Category</label>
              <select value={partForm.category} onChange={e => setPartForm({...partForm, category: e.target.value})}>
                <option>Bearings</option><option>Seals</option><option>Filters</option><option>Belts</option><option>Valves</option><option>Sensors</option><option>Gaskets</option><option>Fasteners</option><option>Electrical</option>
              </select>
            </div>
            <div className="form-group"><label>Unit</label>
              <select value={partForm.unit} onChange={e => setPartForm({...partForm, unit: e.target.value})}>
                <option>pcs</option><option>set</option><option>m</option><option>kg</option><option>ltr</option>
              </select>
            </div>
            <div className="form-group"><label>Stock (Store)</label><input type="number" min="0" value={partForm.storeStock} onChange={e => setPartForm({...partForm, storeStock: e.target.value})} /></div>
            <div className="form-group"><label>Min. Stock Level</label><input type="number" min="0" value={partForm.minStock} onChange={e => setPartForm({...partForm, minStock: e.target.value})} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSavePart}>Save Part</button>
          </div>
        </div>
      </div>

      {/* Modal: Engineer */}
      <div className={`modal-overlay ${openModal === 'modal-engineer' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-title">{editingEngId ? 'Edit Engineer' : 'Add Engineer'}</div>
          <div className="form-grid">
            <div className="form-group"><label>Full Name</label><input type="text" placeholder="e.g. John Smith" value={engForm.name} onChange={e => setEngForm({...engForm, name: e.target.value})} /></div>
            <div className="form-group"><label>Employee ID</label><input type="text" placeholder="e.g. ENG-007" value={engForm.empId} onChange={e => setEngForm({...engForm, empId: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="e.g. john@plant.com" value={engForm.email} onChange={e => setEngForm({...engForm, email: e.target.value})} /></div>
            <div className="form-group"><label>Department</label><input type="text" placeholder="e.g. Mechanical" value={engForm.dept} onChange={e => setEngForm({...engForm, dept: e.target.value})} /></div>
            <div className="form-group"><label>Password</label><input type="text" placeholder="Set user password" value={engForm.password} onChange={e => setEngForm({...engForm, password: e.target.value})} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveEngineer}>Save Engineer</button>
          </div>
        </div>
      </div>

      {/* Modal: Issue */}
      <div className={`modal-overlay ${openModal === 'modal-issue' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-title">Issue Spare Part</div>
          <div style={{marginBottom: '16px', color: 'var(--muted)', fontSize: '13px'}}>
            Issuing <strong>{issuingPartData?.name}</strong> ({issuingPartData?.partNo}) to <strong>{engName(issuingRequestData?.engineerId)}</strong> for <em>{issuingRequestData?.machine}</em>.<br/>
            Requested: <span className="text-mono">{issuingRequestData?.qty}</span> — Store stock: <span className="text-mono">{issuingPartData?.storeStock}</span>
          </div>
          <div className="form-group mb-3"><label>Quantity to Issue</label>
            <input type="number" min="1" value={issueQty} onChange={e => setIssueQty(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>Cancel</button>
            <button className="btn btn-success" onClick={confirmIssue}>Confirm Issue</button>
          </div>
        </div>
      </div>

      {/* Modal: Confirm Delete Engineer */}
      <div className={`modal-overlay ${openModal === 'modal-del-engineer' ? 'open' : ''}`}>
        <div className="modal" style={{width: '400px'}}>
          <div className="modal-title">Remove Engineer</div>
          <div style={{color: 'var(--muted)', fontSize: '13px', marginBottom: '8px'}}>
            Remove <strong>{deletingEngData?.name}</strong> ({deletingEngData?.empId}) from {deletingEngData?.dept}?<br/>
            Parts currently held: <span className="text-mono">{deletingEngStock} units</span> across {deletingEngPartTypes} part types.
          </div>
          <div className="alert alert-danger" style={{marginTop: '12px'}}>⚠ This will permanently remove the engineer and all their stock records.</div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleConfirmDeleteEngineer}>Remove Engineer</button>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div id="toast-area">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}