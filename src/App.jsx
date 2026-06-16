import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

// ═══════════════════════════════════════════════════════
//  STYLES (Updated for Dashboard & Complex Forms)
// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
:root { --bg:#0f1117; --surface:#181c27; --surface2:#1e2335; --border:#2a3050; --accent:#3b82f6; --accent2:#f59e0b; --danger:#ef4444; --success:#22c55e; --text:#e2e8f0; --muted:#64748b; --sans:'IBM Plex Sans',sans-serif; --mono:'IBM Plex Mono',monospace; }
*{box-sizing:border-box;margin:0;padding:0} body{font-family:var(--sans);background:var(--bg);color:var(--text);font-size:14px;height:100vh;overflow:hidden;}
.app{display:flex;height:100vh;}
aside{width:240px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;}
main{flex:1;overflow-y:auto;padding:24px 32px;}
.logo{padding:20px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:18px;font-weight:600;color:var(--accent);}
nav button{display:block;width:100%;text-align:left;padding:12px 20px;background:none;border:none;color:var(--muted);cursor:pointer;border-left:3px solid transparent;}
nav button:hover, nav button.active{background:var(--surface2);color:var(--text);border-left-color:var(--accent);}
.grid-3{display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;margin-bottom:24px;}
.stat-card{background:var(--surface);padding:20px;border-radius:8px;border:1px solid var(--border);}
.stat-value{font-size:32px;font-weight:600;font-family:var(--mono);margin-top:8px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px;margin-bottom:24px;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
.form-group label{font-size:12px;color:var(--muted);text-transform:uppercase;}
.form-group input, .form-group select, .form-group textarea{background:var(--surface2);border:1px solid var(--border);color:white;padding:10px;border-radius:6px;font-family:var(--sans);}
table{width:100%;border-collapse:collapse;} th,td{padding:12px;text-align:left;border-bottom:1px solid var(--border);} th{color:var(--muted);font-size:12px;text-transform:uppercase;}
.badge{padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;}
.badge.pending{background:rgba(245,158,11,0.2);color:#fbbf24;} .badge.completed{background:rgba(34,197,94,0.2);color:#4ade80;} .badge.warranty{background:rgba(59,130,246,0.2);color:#60a5fa;}
.btn{background:var(--accent);color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:600;}
.readonly-field{background:var(--bg) !important; color:var(--muted) !important; cursor:not-allowed;}
`;

// ═══════════════════════════════════════════════════════
//  APP COMPONENT & STATE
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState({ role: 'admin', name: 'Admin User' }); // Force logged in for testing
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ tickets: [], products: [], parts: [], users: [] });

  // Sync with Firebase
  useEffect(() => {
    const cols = ['tickets', 'products', 'parts', 'users'];
    const unsubs = cols.map(col => 
      onSnapshot(collection(db, col), (snap) => {
        setData(prev => ({ ...prev, [col]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      })
    );
    return () => unsubs.forEach(u => u());
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside>
          <div className="logo">ServiceManager Pro</div>
          <nav>
            {user.role === 'admin' && (
              <>
                <button className={page==='dashboard'?'active':''} onClick={()=>setPage('dashboard')}>Dashboard</button>
                <button className={page==='complaints'?'active':''} onClick={()=>setPage('complaints')}>Complaints & Tickets</button>
                <button className={page==='database'?'active':''} onClick={()=>setPage('database')}>Master Database</button>
              </>
            )}
            {user.role === 'engineer' && (
              <>
                <button className={page==='my_tickets'?'active':''} onClick={()=>setPage('my_tickets')}>My Service Tickets</button>
              </>
            )}
          </nav>
        </aside>
        <main>
          {page === 'dashboard' && <AdminDashboard data={data} />}
          {page === 'complaints' && <ComplaintManager data={data} />}
        </main>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════
function AdminDashboard({ data }) {
  const totalComplaints = data.tickets.length;
  const pending = data.tickets.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;
  const completed = data.tickets.filter(t => t.status === 'Completed').length;

  return (
    <div>
      <h2>Maintenance Dashboard</h2>
      <p style={{color: 'var(--muted)', marginBottom: 24}}>System overview and metrics.</p>
      
      <div className="grid-3">
        <div className="stat-card">
          <div style={{color:'var(--muted)', fontSize: 12}}>TOTAL COMPLAINTS</div>
          <div className="stat-value">{totalComplaints}</div>
        </div>
        <div className="stat-card">
          <div style={{color:'var(--accent2)', fontSize: 12}}>PENDING / ASSIGNED</div>
          <div className="stat-value" style={{color:'var(--accent2)'}}>{pending}</div>
        </div>
        <div className="stat-card">
          <div style={{color:'var(--success)', fontSize: 12}}>COMPLETED</div>
          <div className="stat-value" style={{color:'var(--success)'}}>{completed}</div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Service History</h3>
        <table style={{marginTop: 16}}>
          <thead><tr><th>Ticket ID</th><th>Product</th><th>Customer</th><th>Status</th><th>Engineer</th></tr></thead>
          <tbody>
            {data.tickets.slice(0, 5).map(t => {
              const prod = data.products.find(p => p.id === t.productId);
              return (
                <tr key={t.id}>
                  <td style={{fontFamily: 'var(--mono)'}}>{t.ticketId}</td>
                  <td>{prod?.name || 'Unknown'}</td>
                  <td>{prod?.customerName}</td>
                  <td><span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                  <td>{t.assignedEngineerName || 'Unassigned'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  COMPLAINT REGISTRATION & LISTING
// ═══════════════════════════════════════════════════════
function ComplaintManager({ data }) {
  const [view, setView] = useState('list'); // 'list' or 'new'
  const [form, setForm] = useState({ productId: '', reportedProblem: '' });
  const [selectedProd, setSelectedProd] = useState(null);

  // Auto-fetch product details when a product is selected
  const handleProductSelect = (id) => {
    const prod = data.products.find(p => p.id === id);
    setSelectedProd(prod);
    setForm({ ...form, productId: id });
  };

  const submitComplaint = async () => {
    const ticketId = `SRV-${Math.floor(Math.random() * 100000)}`; // Auto-gen ID
    await addDoc(collection(db, "tickets"), {
      ticketId,
      productId: form.productId,
      reportedProblem: form.reportedProblem,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      assignedEngineerId: selectedProd?.zoneEngineerId || null
    });
    setView('list');
  };

  if (view === 'new') {
    return (
      <div>
        <button onClick={() => setView('list')} style={{background:'none', border:'none', color:'var(--accent)', cursor:'pointer', marginBottom: 16}}>← Back to List</button>
        <div className="card">
          <h2>Register New Complaint</h2>
          <div className="form-group" style={{marginTop: 20}}>
            <label>Select Product / Machine</label>
            <select onChange={(e) => handleProductSelect(e.target.value)} value={form.productId}>
              <option value="">-- Select Product --</option>
              {/* Dummy data mapping - replace with data.products map */}
              <option value="prod_1">Sewer Cleaning Robot (Bandicoot Mk2) - SRN:1002</option>
              <option value="prod_2">Pneumatic Control Unit - SRN:884</option>
            </select>
          </div>

          {selectedProd && (
            <div className="form-grid" style={{background: 'var(--surface2)', padding: 16, borderRadius: 8, marginBottom: 20}}>
              <div className="form-group"><label>Customer Name</label><input readOnly className="readonly-field" value={selectedProd.customerName || 'IOCL Refinery'} /></div>
              <div className="form-group"><label>Warranty Status</label><input readOnly className="readonly-field" value={selectedProd.warrantyStatus || 'Under Warranty'} /></div>
              <div className="form-group"><label>Project / Zone</label><input readOnly className="readonly-field" value={selectedProd.project || 'Zone A'} /></div>
              <div className="form-group"><label>Assigned Zone Engineer</label><input readOnly className="readonly-field" value={selectedProd.engineerName || 'Alice Johnson'} /></div>
            </div>
          )}

          <div className="form-group">
            <label>Reported Problem / Observation</label>
            <textarea rows="4" value={form.reportedProblem} onChange={e => setForm({...form, reportedProblem: e.target.value})} placeholder="Describe the issue..."></textarea>
          </div>
          
          {/* Note: Photo upload component will be added here in Phase 2 */}
          <div style={{padding: '16px', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--muted)', textAlign: 'center', marginBottom: 24}}>
            [Photo Upload Area - Pending Firebase Storage Setup]
          </div>

          <button className="btn" onClick={submitComplaint}>Submit Complaint & Route to Engineer</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24}}>
        <h2>Complaint Registry</h2>
        <button className="btn" onClick={() => setView('new')}>+ Register Complaint</button>
      </div>
      
      <div className="card">
        <table>
          <thead><tr><th>Ticket ID</th><th>Date</th><th>Problem</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {data.tickets.map(t => (
              <tr key={t.id}>
                <td style={{fontFamily: 'var(--mono)'}}>{t.ticketId}</td>
                <td>{t.date}</td>
                <td>{t.reportedProblem}</td>
                <td><span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td><button style={{background:'transparent', color:'var(--accent)', border:'none', cursor:'pointer'}}>View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}