import React, { useState, useEffect, useCallback } from 'react';

const GALLERY_CATS = ['Gold Work', 'Silver Work', 'Stone Work', 'Vigraham', 'Crown Work'];
const METAL_OPTIONS = ['24K Gold Nagas', 'Gold Nagas Handcrafted', '24K Gold Polish', 'Gold Beaten Work', 'Gold Plated Copper', 'Sterling Silver', 'Stone · Gold Inlay', 'Stone Setting', 'Panchaloha Cast', 'Custom'];

const AdminGalleryManager = ({ C, supabaseUrl, supabaseKey, onRefreshStats }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'Gold Work', metal_type: '24K Gold Nagas',
    is_featured: false, file: null, preview: null,
  });
  const fileRef = React.useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const getAuthHeaders = () => {
    let token = supabaseKey;
    try { const s = localStorage.getItem('vmw_session'); if(s){const p=JSON.parse(s);if(p?.access_token)token=p.access_token;} } catch(_){}
    return { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` };
  };

  const fetchItems = useCallback(async () => {
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
        headers: getAuthHeaders()
      });
      const data = res.ok ? await res.json() : [];
      setItems(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke previous preview URL to prevent memory leak
    setForm(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      return { ...f, file, preview: URL.createObjectURL(file) };
    });
  };

  const handleUpload = async () => {
    if (!form.file || !form.title.trim()) { showToast('Please fill title and select an image.', false); return; }
    if (!supabaseUrl || !supabaseKey) { showToast('Supabase not configured.', false); return; }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Insert metadata — DO NOT send `id`, let Postgres auto-generate UUID
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/gallery_items`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          metal_type: form.metal_type,
          is_featured: form.is_featured,
          image_url: '', // placeholder — updated after upload
        }),
      });
      if (!insertRes.ok) throw new Error(`DB insert failed: ${await insertRes.text()}`);
      const [newRow] = await insertRes.json();
      const uuid = newRow.id; // real UUID from gen_random_uuid()
      setUploadProgress(35);

      // Step 2: Upload image using real UUID as path (no collision risk)
      const ext = form.file.name.split('.').pop().toLowerCase();
      const storagePath = `gallery/${uuid}.${ext}`;
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/gallery-images/${storagePath}`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': form.file.type, 'x-upsert': 'true' },
        body: form.file,
      });
      if (!uploadRes.ok) {
        // Roll back DB row if storage fails
        await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${uuid}`, { method: 'DELETE', headers: getAuthHeaders() });
        throw new Error(`Image upload failed: ${await uploadRes.text()}`);
      }
      setUploadProgress(75);

      // Step 3: Update row with real public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/gallery-images/${storagePath}`;
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${uuid}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ image_url: publicUrl }),
      });
      if (!updateRes.ok) throw new Error(`URL update failed: ${await updateRes.text()}`);

      setUploadProgress(100);
      showToast(`"${form.title}" uploaded and live on website! ✓`);

      if (form.preview) URL.revokeObjectURL(form.preview);
      setForm({ title: '', category: 'Gold Work', metal_type: '24K Gold Nagas', is_featured: false, file: null, preview: null });
      if (fileRef.current) fileRef.current.value = '';
      setShowUploadForm(false);
      await fetchItems();
      if (onRefreshStats) onRefreshStats();
    } catch(err) {
      showToast(err.message, false);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(`${item.title} ${!item.is_featured ? 'featured' : 'unfeatured'}`);
      await fetchItems();
    } catch(e) { showToast(e.message, false); }
  };

  const handleDelete = async (item) => {
    try {
      // Delete from DB
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('DB delete failed');

      // Try delete from storage if it's an upload (not seeded)
      if (item.image_url && item.image_url.includes('/storage/v1/object/public/gallery-images/')) {
        const path = item.image_url.split('/storage/v1/object/public/gallery-images/')[1];
        await fetch(`${supabaseUrl}/storage/v1/object/gallery-images/${path}`, {
          method: 'DELETE', headers: getAuthHeaders(),
        });
      }
      showToast(`"${item.title}" deleted.`);
      setDeleteConfirm(null);
      await fetchItems();
      if (onRefreshStats) onRefreshStats();
    } catch(e) { showToast(e.message, false); }
  };

  const inp = (label, value, onChange, type='text', placeholder='') => (
    <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>{label}</span>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ padding:'12px 14px', background: C.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none', fontFamily:"'Jost',sans-serif" }} />
    </label>
  );

  return (
    <div style={{ position:'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:9999, padding:'14px 22px', background: toast.ok ? 'rgba(0,200,100,0.95)' : 'rgba(220,50,50,0.95)', color:'#fff', borderRadius:12, fontFamily:"'Jost',sans-serif", fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.4)', maxWidth:360 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:24, margin:0, color:C.text }}>Gallery Management</h3>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim, margin:'4px 0 0' }}>{items.length} items in gallery · Uploads reflect instantly on the website</p>
        </div>
        <button onClick={() => setShowUploadForm(v => !v)}
          style={{ background: showUploadForm ? 'rgba(255,215,0,0.15)' : C.gold, color: showUploadForm ? C.gold : '#000', border: showUploadForm ? `1px solid ${C.gold}` : 'none', padding:'12px 24px', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer', letterSpacing:'.04em' }}>
          {showUploadForm ? '✕ Cancel' : '+ Upload New Artwork'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div style={{ background:C.surfaceWarm, border:`1px solid ${C.gold}44`, borderRadius:16, padding:32, marginBottom:32 }}>
          <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:C.gold, margin:'0 0 24px' }}>Upload New Gallery Item</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            {inp('Artwork Title *', form.title, v => setForm(f=>({...f,title:v})), 'text', 'e.g. Sadari Gold Crown')}
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Category</span>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                style={{ padding:'12px 14px', background: C.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Jost',sans-serif", outline:'none' }}>
                {GALLERY_CATS.map(c=><option key={c} value={c} style={{background:'#111'}}>{c}</option>)}
              </select>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Metal Type</span>
              <select value={form.metal_type} onChange={e=>setForm(f=>({...f,metal_type:e.target.value}))}
                style={{ padding:'12px 14px', background: C.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Jost',sans-serif", outline:'none' }}>
                {METAL_OPTIONS.map(m=><option key={m} value={m} style={{background: C.bg2, color: C.text}}>{m}</option>)}
              </select>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Featured on Home Page?</span>
              <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:8 }}>
                <input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))}
                  style={{ width:18, height:18, accentColor:C.gold, cursor:'pointer' }} />
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:14, color:C.text }}>Show in Featured section</span>
              </div>
            </label>
          </div>

          {/* File Drop Zone */}
          <label style={{ display:'block', cursor:'pointer' }}>
            <div style={{
              border: `2px dashed ${form.preview ? C.gold : C.border}`,
              borderRadius:14, padding: form.preview ? 0 : '48px 24px',
              textAlign:'center', background:'rgba(255,255,255,0.02)',
              transition:'border-color .2s', overflow:'hidden',
              minHeight: form.preview ? 280 : 'auto',
              position:'relative',
            }}>
              {form.preview ? (
                <>
                  <img src={form.preview} alt="Preview" style={{ width:'100%', maxHeight:320, objectFit:'contain', display:'block' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                    <span style={{ color:'#fff', fontFamily:"'Jost',sans-serif", fontSize:14 }}>Click to change image</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:40, marginBottom:12 }}>📷</div>
                  <div style={{ fontFamily:"'Jost',sans-serif", fontSize:15, color:C.text, fontWeight:600, marginBottom:6 }}>Click to select image</div>
                  <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim }}>JPG, PNG, WEBP · Max 10MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:'none' }} />
          </label>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim }}>Uploading to Supabase Storage…</span>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.gold }}>{uploadProgress}%</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.1)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${uploadProgress}%`, background:C.gold, borderRadius:99, transition:'width .4s ease' }} />
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            <button onClick={handleUpload} disabled={uploading || !form.file || !form.title.trim()}
              style={{ flex:1, padding:'14px', background: (uploading || !form.file || !form.title.trim()) ? 'rgba(255,215,0,0.3)' : C.gold, color:'#000', border:'none', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor: (uploading || !form.file || !form.title.trim()) ? 'not-allowed' : 'pointer', letterSpacing:'.06em', textTransform:'uppercase' }}>
              {uploading ? `Uploading… ${uploadProgress}%` : '⬆ Upload & Publish to Website'}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} style={{ aspectRatio:'1/1', borderRadius:12, background:'rgba(255,255,255,0.04)' }} className="skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ background:C.surfaceWarm, border:`1px solid ${C.border}`, borderRadius:16, padding:60, textAlign:'center', color:C.dim, fontFamily:"'Jost',sans-serif" }}>
          No gallery items yet. Upload your first artwork above.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {items.map(item => (
            <div key={item.id} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${item.is_featured ? C.gold+'66' : C.border}`, background:C.surfaceWarm, position:'relative', display:'flex', flexDirection:'column' }}>
              {/* Image */}
              <div style={{ aspectRatio:'1/1', overflow:'hidden', position:'relative' }}>
                <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e=>{ e.target.style.background='#1a1208'; e.target.src=''; }} />
                {item.is_featured && (
                  <div style={{ position:'absolute', top:8, left:8, background:C.gold, color:'#000', padding:'2px 8px', borderRadius:99, fontSize:10, fontFamily:"'Jost',sans-serif", fontWeight:700, letterSpacing:'.06em' }}>FEATURED</div>
                )}
                {/* Overlay actions */}
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:0 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.6)'; e.currentTarget.style.opacity=1; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(0,0,0,0)'; e.currentTarget.style.opacity=0; }}>
                  <button onClick={()=>handleToggleFeatured(item)} title={item.is_featured?'Unfeature':'Feature on home'}
                    style={{ background:'rgba(255,215,0,0.9)', color:'#000', border:'none', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:700, cursor:'pointer' }}>
                    {item.is_featured ? '★ Unfeature' : '☆ Feature'}
                  </button>
                  <button onClick={()=>setDeleteConfirm(item)} title="Delete artwork"
                    style={{ background:'rgba(220,50,50,0.9)', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:700, cursor:'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:11, color:C.dim, marginTop:3 }}>{item.category} · {item.metal_type}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={()=>setDeleteConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surfaceWarm, border:`1px solid ${C.border}`, borderRadius:20, padding:36, maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:20, color:C.text, margin:'0 0 10px' }}>Delete Artwork?</h3>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:14, color:C.dim, margin:'0 0 28px', lineHeight:1.6 }}>
              "{deleteConfirm.title}" will be permanently removed from the gallery and website. This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>setDeleteConfirm(null)}
                style={{ flex:1, padding:'12px', background:'transparent', border:`1px solid ${C.border}`, color:C.text, borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:14, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={()=>handleDelete(deleteConfirm)}
                style={{ flex:1, padding:'12px', background:'rgba(220,50,50,0.9)', border:'none', color:'#fff', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminGalleryManager;
