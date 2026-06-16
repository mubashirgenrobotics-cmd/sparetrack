import { useState, useEffect, useRef } from "react";
import { db, storage } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
:root { --bg:#0f1117; --surface:#181c27; --surface2:#1e2335; --border:#2a3050; --accent:#3b82f6; --accent2:#f59e0b; --danger:#ef4444; --success:#22c55e; --text:#e2e8f0; --muted:#64748b; --sans:'IBM Plex Sans',sans-serif; --mono:'IBM Plex Mono',monospace; }
*{box-sizing:border-box;margin:0;padding:0} body{font-family:var(--sans);background:var(--bg);color:var(--text);font-size:14px;height:100vh;overflow:hidden;}
.app{display:flex;height:100vh;}
aside{width:240px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;}
main{flex:1;overflow-y:auto;padding:24px 32px;}
.logo{padding:20px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:18px;font-weight:600;color:var(--accent);}
nav button{display:block;width:100%;text-align:left;padding:12px 20px;background:none;border:none;color:var(--muted);cursor:pointer;border-left:3px solid transparent;}
nav button:hover, nav button.active{background:var(--surface2);color:var(--text);border-left-color:var(--accent);}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px;margin-bottom:24px;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
.form-group label{font-size:12px;color:var(--muted);text-transform:uppercase;}
.form-group input, .form-group select, .form-group textarea{background:var(--surface2);border:1px solid var(--border);color:white;padding:10px;border-radius:6px;font-family:var(--sans);}
table{width:100%;border-collapse:collapse;} th,td{padding:12px;text-align:left;border-bottom:1px solid var(--border);} th{color:var(--muted);font-size:12px;text-transform:uppercase;}
.badge{padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;}
.badge.pending{background:rgba(245,158,11,0.2);color:#fbbf24;} .badge.completed{background:rgba(34,197,94,0.2);color:#4ade80;}
.btn{background:var(--accent);color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-weight:600;}
.btn-success{background:var(--success);}
.file-upload{border:2px dashed var(--border);padding:20px;text-align:center;border-radius:6px;cursor:pointer;background:var(--surface2);}
.sig-canvas{border:1px solid var(--border);background:var(--surface2);border-radius:6px;width:100%;height:150px;margin-bottom:10px;}
`;

// ═══════════════════════════════════════════════════════
//  APP COMPONENT (Allows switching roles for testing)
// ═══════════════════════════════════════════════════════
export default function App() {
  // Toggle between 'admin' and 'engineer' to test both views!
  const [user, setUser] = useState({ role: 'engineer', name: 'Alice Johnson', engineerId: 'eng-1' }); 
  const [page, setPage] = useState('complaints');
  const [data, setData] = useState({ tickets: [], products: [], parts: [], users: [] });

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
          <div className="logo">ServiceManager</div>
          <div style={{padding:'10px 20px', fontSize:12, color:'var(--warn)'}}>Logged in as: {user.role.toUpperCase()}</div>
          <nav>
            <button className={page==='complaints'?'active':''} onClick={()=>setPage('complaints')}>
              {user.role === 'admin' ? 'All Complaints' : 'My Service Tickets'}
            </button>
            {/* Quick role switcher for testing */}
            <div style={{marginTop: 50, padding: 20, borderTop: '1px solid var(--border)'}}>
              <p style={{fontSize: 10, color: 'var(--muted)', marginBottom: 10}}>TESTING SWITCHER</p>
              <button onClick={()=>setUser({role:'admin', name:'Admin'})}>Switch to Admin</button>
              <button onClick={()=>setUser({role:'engineer', name:'Alice', engineerId:'eng-1'})}>Switch to Engineer</button>
            </div>
          </nav>
        </aside>
        <main>
          {page === 'complaints' && user.role === 'admin' && <AdminComplaints data={data} />}
          {page === 'complaints' && user.role === 'engineer' && <EngineerWorkflow data={data} user={user} />}
        </main>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  ADMIN: REGISTER COMPLAINT (WITH PHOTO UPLOAD)
// ═══════════════════════════════════════════════════════
function AdminComplaints({ data }) {
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ productId: '', reportedProblem: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const submitComplaint = async () => {
    setUploading(true);
    const ticketId = `SRV-${Math.floor(Math.random() * 100000)}`;
    let photoUrl = null;

    // 1. Upload Photo to Firebase Storage
    if (file) {
      const storageRef = ref(storage, `complaints/${ticketId}/${file.name}`);
      await uploadBytes(storageRef, file);
      photoUrl = await getDownloadURL(storageRef);
    }

    // 2. Save Ticket to Firestore
    await addDoc(collection(db, "tickets"), {
      ticketId,
      productId: form.productId,
      reportedProblem: form.reportedProblem,
      preServicePhotoUrl: photoUrl, // Save the image link!
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      assignedEngineerId: 'eng-1' // Hardcoded for demo purposes
    });
    
    setUploading(false);
    setView('list');
  };

  if (view === 'new') return (
    <div>
      <button onClick={() => setView('list')} className="btn" style={{background:'transparent', color:'var(--accent)', marginBottom: 20}}>← Back to List</button>
      <div className="card">
        <h2>Register New Complaint</h2>
        <div className="form-group" style={{marginTop: 20}}>
          <label>Select Product</label>
          <select onChange={(e) => setForm({...form, productId: e.target.value})} value={form.productId}>
            <option value="">-- Select Product --</option>
            {data.products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.customerName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Reported Problem</label>
          <textarea rows="4" onChange={e => setForm({...form, reportedProblem: e.target.value})}></textarea>
        </div>
        
        {/* PHOTO UPLOAD UI */}
        <div className="form-group">
          <label>Upload Pre-Service Photo</label>
          <div className="file-upload">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
            {file && <p style={{marginTop:10, color:'var(--success)'}}>Selected: {file.name}</p>}
          </div>
        </div>

        <button className="btn" onClick={submitComplaint} disabled={uploading}>
          {uploading ? 'Uploading & Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
        <h2>All Complaints</h2>
        <button className="btn" onClick={() => setView('new')}>+ Register Complaint</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Ticket</th><th>Problem</th><th>Photo</th><th>Status</th></tr></thead>
          <tbody>
            {data.tickets.map(t => (
              <tr key={t.id}>
                <td>{t.ticketId}</td>
                <td>{t.reportedProblem}</td>
                <td>{t.preServicePhotoUrl ? <a href={t.preServicePhotoUrl} target="_blank" style={{color:'var(--accent)'}}>View Photo</a> : 'No Photo'}</td>
                <td><span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ENGINEER: CLOSING WORKFLOW & SIGNATURE
// ═══════════════════════════════════════════════════════
function EngineerWorkflow({ data, user }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [form, setForm] = useState({ identifiedIssue: '', actionTaken: '', partId: '', qty: 0 });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const sigCanvas = useRef({}); // Reference for the signature pad
  const reportRef = useRef(null); // Reference for PDF generation

  const myTickets = data.tickets.filter(t => t.assignedEngineerId === user.engineerId);

  const completeTicket = async () => {
    setUploading(true);
    let photoUrl = null;

    // 1. Upload After-Service Photo
    if (file) {
      const storageRef = ref(storage, `repairs/${activeTicket.ticketId}/${file.name}`);
      await uploadBytes(storageRef, file);
      photoUrl = await getDownloadURL(storageRef);
    }

    // 2. Get Signature Image Data
    const signatureData = sigCanvas.current.isEmpty() ? null : sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    // 3. Update Ticket in Firestore
    await updateDoc(doc(db, "tickets", activeTicket.id), {
      status: 'Completed',
      identifiedIssue: form.identifiedIssue,
      actionTaken: form.actionTaken,
      spareUsed: form.partId ? { partId: form.partId, qty: form.qty } : null,
      postServicePhotoUrl: photoUrl,
      customerSignature: signatureData,
      completedDate: new Date().toISOString().split('T')[0]
    });

    // 4. Update Spare Part Inventory (if a part was used)
    if (form.partId && form.qty > 0) {
      const part = data.parts.find(p => p.id === form.partId);
      if (part) {
        await updateDoc(doc(db, "parts", part.id), {
          storeStock: Number(part.storeStock) - Number(form.qty)
        });
      }
    }

    setUploading(false);
    setActiveTicket(null); // Go back to list
  };

  const generatePDF = () => {
    html2canvas(reportRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${activeTicket.ticketId}_ServiceReport.pdf`);
    });
  };

  if (activeTicket) return (
    <div ref={reportRef} style={{background: 'var(--bg)', padding: 20}}>
      <button onClick={() => setActiveTicket(null)} className="btn" style={{marginBottom: 20}}>← Back to Tasks</button>
      
      <div className="card">
        <h2 style={{color:'var(--accent)', marginBottom: 20}}>Service Report: {activeTicket.ticketId}</h2>
        
        {/* Read-Only Admin Data */}
        <div style={{background:'var(--surface2)', padding:16, borderRadius:8, marginBottom:20}}>
          <p><strong>Reported Problem:</strong> {activeTicket.reportedProblem}</p>
          {activeTicket.preServicePhotoUrl && <img src={activeTicket.preServicePhotoUrl} alt="Pre-Service" style={{maxHeight: 150, marginTop:10, borderRadius: 6}} />}
        </div>

        {/* Engineer Input */}
        <div className="form-group"><label>Identified Issue</label><input onChange={e=>setForm({...form, identifiedIssue: e.target.value})} /></div>
        <div className="form-group"><label>Action Taken</label><textarea onChange={e=>setForm({...form, actionTaken: e.target.value})}></textarea></div>
        
        <div className="form-grid" style={{background:'var(--surface2)', padding:16, borderRadius:8, marginBottom:20}}>
          <div className="form-group">
            <label>Spare Part Used (Optional)</label>
            <select onChange={e=>setForm({...form, partId: e.target.value})}>
              <option value="">None</option>
              {data.parts.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.storeStock})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Quantity Used</label><input type="number" onChange={e=>setForm({...form, qty: e.target.value})} /></div>
        </div>

        <div className="form-group">
          <label>Upload After-Service Photo</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        {/* Customer Signature Pad */}
        <div className="form-group" style={{marginTop: 30}}>
          <label style={{color:'var(--warn)'}}>Customer Signature</label>
          <SignatureCanvas ref={sigCanvas} penColor='white' canvasProps={{className: 'sig-canvas'}} />
          <button onClick={() => sigCanvas.current.clear()} style={{background:'none', border:'none', color:'var(--muted)', cursor:'pointer'}}>Clear Signature</button>
        </div>

        <div style={{display:'flex', gap: 10, marginTop: 20}}>
          <button className="btn btn-success" onClick={completeTicket} disabled={uploading}>
            {uploading ? 'Processing...' : 'Complete Service & Save'}
          </button>
          <button className="btn" onClick={generatePDF}>Download PDF Report</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2>My Tasks</h2>
      <div className="card">
        <table>
          <thead><tr><th>Ticket</th><th>Problem</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myTickets.map(t => (
              <tr key={t.id}>
                <td>{t.ticketId}</td>
                <td>{t.reportedProblem}</td>
                <td><span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td>
                  {t.status === 'Pending' ? (
                    <button className="btn" onClick={() => setActiveTicket(t)}>Start Service</button>
                  ) : (
                    <span style={{color:'var(--success)'}}>Completed ✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}