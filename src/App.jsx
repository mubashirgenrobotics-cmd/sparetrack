import { useState, useEffect } from "react";
import { db, storage } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  LayoutDashboard, Wrench, ClipboardCheck, Package, 
  Database, FileText, PieChart as PieChartIcon
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
:root { 
  --bg: #0f111a; --surface: #1a1d2d; --surface-hover: #23273b; --border: #2e344f; 
  --accent: #3b82f6; --accent-hover: #2563eb; --warn: #f59e0b; --success: #10b981; --danger: #ef4444; 
  --text: #f8fafc; --muted: #94a3b8; --font: 'Inter', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font); }
body { background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; font-size: 14px; }
.app-layout { display: flex; height: 100vh; }
aside { width: 260px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.brand { padding: 24px 20px; font-size: 18px; font-weight: 700; color: var(--accent); border-bottom: 1px solid var(--border); display:flex; align-items:center; gap:10px; }
.nav-menu { padding: 12px 0; flex: 1; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 24px; color: var(--muted); background: none; border: none; cursor: pointer; text-align: left; font-size: 14px; font-weight: 500; border-left: 3px solid transparent; transition: all 0.2s; }
.nav-item:hover, .nav-item.active { color: var(--text); background: var(--surface-hover); border-left-color: var(--accent); }
main { flex: 1; overflow-y: auto; padding: 32px 40px; }
.header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; }

.dash-tabs { display: flex; gap: 20px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
.dash-tab { display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--muted); padding: 12px 4px; font-size: 15px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.dash-tab:hover { color: var(--text); }
.dash-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.card-title { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: var(--text); display:flex; justify-content:space-between; align-items:center; }
.stat-box { display: flex; flex-direction: column; gap: 8px; }
.stat-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--text); }

table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid var(--border); }
td { padding: 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
tr:hover td { background: var(--surface-hover); }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.b-pending { background: rgba(245, 158, 11, 0.15); color: var(--warn); border: 1px solid rgba(245, 158, 11, 0.3); }
.b-completed { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
.b-assigned { background: rgba(59, 130, 246, 0.15); color: var(--accent); border: 1px solid rgba(59, 130, 246, 0.3); }
.select-input { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; outline: none; }
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Recharts Customization */
.recharts-default-tooltip { background-color: var(--surface) !important; border: 1px solid var(--border) !important; border-radius: 8px; }
`;

// ═══════════════════════════════════════════════════════
//  MAIN APP SHELL
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState({ role: 'admin', name: 'Admin Hub' });
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ tickets: [], products: [], inspections: [], parts: [] });

  useEffect(() => {
    const cols = ['tickets', 'products', 'inspections', 'parts'];
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
      <div className="app-layout">
        <aside>
          <div className="brand"><Wrench size={24} /> ServiceManager</div>
          <div className="nav-menu">
            <div style={{padding: '0 24px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', margin: '16px 0 8px', textTransform:'uppercase'}}>Management</div>
            <button className={`nav-item ${page==='dashboard'?'active':''}`} onClick={()=>setPage('dashboard')}><LayoutDashboard size={18}/> Dashboard</button>
            <button className={`nav-item ${page==='complaints'?'active':''}`} onClick={()=>setPage('complaints')}><FileText size={18}/> Complaints & Service</button>
            <button className={`nav-item ${page==='inspections'?'active':''}`} onClick={()=>setPage('inspections')}><ClipboardCheck size={18}/> Inspections</button>
            
            <div style={{padding: '0 24px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', margin: '24px 0 8px', textTransform:'uppercase'}}>Inventory & Admin</div>
            <button className={`nav-item ${page==='store'?'active':''}`} onClick={()=>setPage('store')}><Package size={18}/> Maintenance Store</button>
            <button className={`nav-item ${page==='database'?'active':''}`} onClick={()=>setPage('database')}><Database size={18}/> Master Database</button>
          </div>
        </aside>

        <main>
          {page === 'dashboard' && <AdminDashboard data={data} />}
          {page === 'complaints' && <ComplaintRegistry data={data} />}
        </main>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  ADMIN DASHBOARD (Tri-Window Layout with Analytics)
// ═══════════════════════════════════════════════════════
function AdminDashboard({ data }) {
  const [activeWindow, setActiveWindow] = useState('analytics'); // 'service', 'inspection', or 'analytics'
  const [selectedProduct, setSelectedProduct] = useState("");
  const [engFilter, setEngFilter] = useState("All");
  
  const prodDetails = data.products.find(p => p.id === selectedProduct);

  // --- DATA PROCESSING FOR ANALYTICS ---
  
  // 1. Engineer Performance Data
  const engStatsMap = {};
  data.tickets.forEach(t => {
    const eng = t.assignedEngineer || 'Unassigned';
    if (!engStatsMap[eng]) engStatsMap[eng] = { name: eng, Pending: 0, Completed: 0, Total: 0 };
    engStatsMap[eng].Total += 1;
    if (t.status === 'Completed') engStatsMap[eng].Completed += 1;
    else engStatsMap[eng].Pending += 1;
  });
  const engineerData = Object.values(engStatsMap);

  // 2. Engineer Pie Chart Data (Based on selected filter)
  const pieData = engineerData.map(e => ({ name: e.name, value: e.Total }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // 3. Project Distribution Data
  const projectStatsMap = {};
  data.tickets.forEach(t => {
    const prod = data.products.find(p => p.id === t.productId);
    const proj = prod?.project || 'Unassigned Project';
    if (!projectStatsMap[proj]) projectStatsMap[proj] = { name: proj, tickets: 0 };
    projectStatsMap[proj].tickets += 1;
  });
  const projectData = Object.values(projectStatsMap);

  // --- RENDER ---
  return (
    <div>
      <div className="header-flex">
        <h1 className="page-title">Command Center</h1>
        <select className="select-input" defaultValue="month">
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab ${activeWindow === 'analytics' ? 'active' : ''}`} onClick={() => setActiveWindow('analytics')}><PieChartIcon size={18}/> Analytics</button>
        <button className={`dash-tab ${activeWindow === 'service' ? 'active' : ''}`} onClick={() => setActiveWindow('service')}><Wrench size={18}/> Services</button>
        <button className={`dash-tab ${activeWindow === 'inspection' ? 'active' : ''}`} onClick={() => setActiveWindow('inspection')}><ClipboardCheck size={18}/> Inspections</button>
      </div>

      {/* 🟣 WINDOW 1: ANALYTICS & REPORTS */}
      {activeWindow === 'analytics' && (
        <div className="animate-fade-in">
          <div className="grid-2">
            
            {/* Engineer Performance Chart */}
            <div className="card">
              <div className="card-title">
                Engineer Workload (Total Tickets)
                <select className="select-input" value={engFilter} onChange={e => setEngFilter(e.target.value)}>
                  <option value="All">All Engineers</option>
                  {engineerData.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={engFilter === 'All' ? pieData : pieData.filter(d => d.name === engFilter)} 
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Distribution Chart */}
            <div className="card">
              <div className="card-title">Project-Wise Ticket Volume</div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={projectData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'var(--surface-hover)'}} />
                    <Bar dataKey="tickets" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Engineer Detail Table */}
          <div className="card">
            <div className="card-title">Engineer Service History Summary</div>
            <table>
              <thead><tr><th>Engineer Name</th><th>Total Assigned</th><th>Completed</th><th>Pending</th><th>Completion Rate</th></tr></thead>
              <tbody>
                {engineerData.map(e => (
                  <tr key={e.name}>
                    <td style={{fontWeight: 600}}>{e.name}</td>
                    <td>{e.Total}</td>
                    <td style={{color:'var(--success)'}}>{e.Completed}</td>
                    <td style={{color:'var(--warn)'}}>{e.Pending}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{flex:1, height:6, background:'var(--surface-hover)', borderRadius:3, overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${(e.Completed/e.Total)*100}%`, background:'var(--success)'}}></div>
                        </div>
                        <span style={{fontSize:12, color:'var(--muted)'}}>{((e.Completed/e.Total)*100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {engineerData.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', color:'var(--muted)'}}>No engineer data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🟢 WINDOW 2: SERVICES (Existing logic) */}
      {activeWindow === 'service' && (
        <div className="animate-fade-in">
          <div className="grid-3">
            <div className="card stat-box"><span className="stat-label">Total Complaints</span><span className="stat-value">{data.tickets.length}</span></div>
            <div className="card stat-box"><span className="stat-label" style={{color:'var(--warn)'}}>Pending</span><span className="stat-value" style={{color:'var(--warn)'}}>{data.tickets.filter(t=>t.status==='Pending').length}</span></div>
            <div className="card stat-box"><span className="stat-label" style={{color:'var(--success)'}}>Completed</span><span className="stat-value" style={{color:'var(--success)'}}>{data.tickets.filter(t=>t.status==='Completed').length}</span></div>
          </div>
          <div className="grid-2">
            <div className="card" style={{overflowY: 'auto', maxHeight: '400px'}}>
              <div className="card-title">Recent Complaints</div>
              <table>
                <thead><tr><th>Ticket ID</th><th>Category</th><th>Status</th><th>Engineer</th></tr></thead>
                <tbody>
                  {data.tickets.slice(0, 5).map(t => {
                    const p = data.products.find(x => x.id === t.productId);
                    return <tr key={t.id}><td style={{fontFamily:'var(--mono)', fontWeight:600}}>{t.ticketId}</td><td>{p?.category || 'Unknown'}</td><td><span className={`badge b-${t.status.toLowerCase()}`}>{t.status}</span></td><td>{t.assignedEngineer || 'Unassigned'}</td></tr>
                  })}
                </tbody>
              </table>
            </div>
            <div className="card">
              <div className="card-title">Product Lookup</div>
              <select className="select-input" style={{width: '100%', marginBottom: 20}} onChange={(e) => setSelectedProduct(e.target.value)} value={selectedProduct}>
                <option value="">Select a Product...</option>
                {data.products.map(p => <option key={p.id} value={p.id}>{p.serialNo} - {p.customerName}</option>)}
              </select>
              {prodDetails ? (
                <div style={{display:'flex', flexDirection:'column', gap:'12px', background:'var(--bg)', padding:'16px', borderRadius:'8px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--muted)'}}>Customer:</span> <strong>{prodDetails.customerName}</strong></div>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--muted)'}}>Project:</span> <strong>{prodDetails.project}</strong></div>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--muted)'}}>Zone Eng:</span> <strong>{prodDetails.zoneEngineerId}</strong></div>
                </div>
              ) : <div style={{textAlign:'center', color:'var(--muted)', padding:'20px 0'}}>Select a product.</div>}
            </div>
          </div>
        </div>
      )}

      {/* 🔵 WINDOW 3: INSPECTIONS (Existing logic) */}
      {activeWindow === 'inspection' && (
        <div className="animate-fade-in">
           <div className="card" style={{overflowY: 'auto', maxHeight: '400px'}}>
            <div className="card-title">Upcoming Periodic Inspections</div>
            <table>
              <thead><tr><th>Inspection ID</th><th>Product & Site</th><th>Quarter</th><th>Scheduled Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.inspections.map(i => {
                  const p = data.products.find(x => x.id === i.productId);
                  return <tr key={i.id}><td style={{fontFamily:'var(--mono)', fontWeight:600}}>{i.id}</td><td>{p?.category} - {p?.customerName}</td><td><span className="badge" style={{background:'var(--surface-hover)'}}>{i.quarter}</span></td><td>{i.scheduledDate}</td><td><span className={`badge b-${i.status.toLowerCase()}`}>{i.status}</span></td></tr>
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintRegistry({ data }) {
  return (
    <div>
      <div className="header-flex"><h1 className="page-title">Complaint & Service Registry</h1></div>
      <div className="card"><p style={{color: 'var(--muted)'}}>Complaint list form building in Phase 2.</p></div>
    </div>
  );
}