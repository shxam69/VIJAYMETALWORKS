/**
 * ╔══════════════════════════════════════════════════════════════╗
 *  VIJAY METAL WORKS — ADMIN DASHBOARD v3
 *  ✅ Full Gallery Management (upload, edit, replace photo, delete)
 *  ✅ Caption, Subtext, Category, Metal Type editing
 *  ✅ Visitor Analytics — location, device, browser, referrer
 *  ✅ Changes reflect on website instantly via Supabase
 *  ✅ Fully responsive — mobile / tablet / desktop
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Supabase Config ─────────────────────────────────────────── */
const SB_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

/* ── Image URL resolver ──────────────────────────────────────────
   Static gallery images (/gallery/...) are served by the main
   website, not the admin app. In dev the proxy forwards them to
   localhost:3000. In production REACT_APP_WEBSITE_URL should be
   set to the live domain so they resolve correctly.
─────────────────────────────────────────────────────────────── */
const WEBSITE_URL = (process.env.REACT_APP_WEBSITE_URL || '').replace(/\/$/, '');

const resolveImg = (url) => {
  if (!url) return '';
  // Already absolute (Supabase storage URL or external)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  // Relative path — prefix with website origin
  return WEBSITE_URL + url;
};

const getSessionToken = () => {
  try {
    const s = localStorage.getItem('vmw_admin_session');
    if (s) { const p = JSON.parse(s); if (p?.access_token) return p.access_token; }
  } catch (_) {}
  return SB_KEY;
};

const sbFetch = async (path, method = 'GET', body = null, extra = {}) => {
  if (!SB_URL || !SB_KEY) return null;
  const token = getSessionToken();
  const opts = {
    method,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${SB_URL}/rest/v1${path}`, opts);
    const text = await res.text();
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null, headers: res.headers };
  } catch (e) { console.error('sbFetch error:', e); return null; }
};

/* ── Theme ───────────────────────────────────────────────────── */
const C = {
  bg: '#0a0806', bg2: '#111008', surface: 'rgba(255,220,160,0.04)',
  gold: '#FFD700', goldDim: 'rgba(255,215,0,0.7)',
  text: 'rgba(255,255,255,0.92)', dim: 'rgba(255,255,255,0.55)',
  faint: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.09)',
  borderGold: 'rgba(255,215,0,0.22)', red: '#ff4d4d', green: '#00c86f',
  blue: '#4da6ff', orange: '#ff9f40',
};

const ff = {
  display: { fontFamily: "'Cinzel', serif" },
  body:    { fontFamily: "'Jost', sans-serif" },
};

/* ── Responsive hook ─────────────────────────────────────────── */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
};

const injectFonts = () => {
  if (document.getElementById('vmw-admin-fonts')) return;
  const l = document.createElement('link');
  l.id = 'vmw-admin-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;600;700;800&display=swap';
  document.head.appendChild(l);
};

/* ── Responsive CSS injected once ───────────────────────────── */
const injectAdminCSS = () => {
  if (document.getElementById('vmw-admin-css')) return;
  const s = document.createElement('style');
  s.id = 'vmw-admin-css';
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;-webkit-tap-highlight-color:transparent;overflow-x:hidden}
    body{background:#0a0806;color:rgba(255,255,255,0.92);font-family:'Jost',sans-serif}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:#0a0806}
    ::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.3);border-radius:2px}
    button,a{touch-action:manipulation}
    input,textarea,select{font-size:16px!important;font-family:'Jost',sans-serif} /* prevents iOS auto-zoom on focus */

    /* Sidebar — desktop sticky */
    .vmw-sidebar{width:220px;flex-shrink:0;transition:transform 0.3s ease}

    /* Tablet (768px – 1024px): narrower sidebar */
    @media(max-width:1024px) and (min-width:768px){
      .vmw-sidebar{width:190px}
      .vmw-main-content{padding:24px 20px!important}
      .vmw-stat-grid{grid-template-columns:repeat(2,1fr)!important}
      .vmw-gallery-grid{grid-template-columns:repeat(2,1fr)!important}
      .vmw-analytics-row{grid-template-columns:1fr!important}
    }

    /* Mobile (≤767px): off-canvas sidebar */
    @media(max-width:767px){
      .vmw-sidebar{position:fixed;top:0;left:0;height:100dvh;height:100vh;z-index:300;transform:translateX(-100%);width:260px}
      .vmw-sidebar.open{transform:translateX(0)}
      .vmw-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:299;display:none}
      .vmw-overlay.open{display:block}
      .vmw-main-content{padding:16px 14px!important;max-width:100vw!important}
      .vmw-stat-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
      .vmw-gallery-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
      .vmw-upload-fields{grid-template-columns:1fr!important}
      .vmw-edit-2col{grid-template-columns:1fr!important}
      .vmw-inquiries-meta{grid-template-columns:1fr 1fr!important}
      .vmw-chart{height:80px!important}
      .vmw-analytics-row{grid-template-columns:1fr!important}
      .vmw-page-header{flex-direction:column;align-items:flex-start!important;gap:10px!important}
      .vmw-modal-inner{padding:18px!important;max-width:calc(100vw - 24px)!important;width:calc(100vw - 24px)!important}
      .vmw-site-images-grid{grid-template-columns:repeat(2,1fr)!important}
    }

    /* Small mobile (≤420px) */
    @media(max-width:420px){
      .vmw-stat-grid{grid-template-columns:1fr 1fr!important}
      .vmw-gallery-grid{grid-template-columns:repeat(2,1fr)!important}
      .vmw-site-images-grid{grid-template-columns:1fr 1fr!important}
    }

    /* Backdrop-filter fallback for older Android */
    @supports not (backdrop-filter: blur(1px)){
      .vmw-overlay{background:rgba(0,0,0,0.85)!important}
    }

    .vmw-btn{transition:opacity 0.2s,transform 0.1s}
    .vmw-btn:active{transform:scale(0.97)}
    img{max-width:100%;height:auto}
    select option{background:#111;color:#fff}
    .vmw-img-slot:hover .img-hover-txt{opacity:1!important}
    .vmw-img-slot .img-hover-txt{opacity:0;transition:opacity 0.2s}
    .vmw-img-slot:hover{background:rgba(0,0,0,0.45)}
  `;
  document.head.appendChild(s);
};

/* ── Toast ───────────────────────────────────────────────────── */
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);
  const Toast = toast ? (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      style={{ position: 'fixed', top: 20, right: 16, zIndex: 9999, padding: '14px 20px',
        background: toast.ok ? 'rgba(0,200,100,0.97)' : 'rgba(220,50,50,0.97)',
        color: '#fff', borderRadius: 12, ...ff.body, fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)', maxWidth: 'calc(100vw - 32px)', wordBreak: 'break-word' }}>
      {toast.msg}
    </motion.div>
  ) : null;
  return { show, Toast };
};

/* ── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: C.surface, border: `1px solid ${accent ? C.borderGold : C.border}`,
      borderRadius: 16, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
    {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />}
    <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
    <div style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
    <div style={{ ...ff.display, fontSize: 32, color: color || (accent ? C.gold : C.text), lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginTop: 6 }}>{sub}</div>}
  </motion.div>
);

/* ── Input Style ─────────────────────────────────────────────── */
const inpStyle = {
  padding: '11px 13px', background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
  fontSize: 16, outline: 'none', fontFamily: "'Jost', sans-serif",
  width: '100%', boxSizing: 'border-box',
};

const GALLERY_CATS = ['Gold Work', 'Crown Work', 'Silver Work', 'Stone Work', 'Vigraham', 'Temple Work', 'Custom'];
const METAL_OPTIONS = ['24K Gold Nagas','22K Gold Handwork','Gold Alloy Polish','Gold Plated Copper','Silver Nagas','Sterling Silver','Stone Carved','Panchaloha'];

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════════════ */
const Login = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    if (!SB_URL || !SB_KEY) {
      setError('Supabase not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env');
      setLoading(false); return;
    }
    try {
      const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || 'Authentication failed');
      const profileRes = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=role`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${data.access_token}` },
      });
      const profiles = await profileRes.json();
      if (profiles?.[0]?.role !== 'admin') throw new Error('Access denied — not an admin account.');
      localStorage.setItem('vmw_admin_session', JSON.stringify(data));
      onLogin(data.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 24, padding: '36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚒️</div>
          <h1 style={{ ...ff.display, color: C.gold, fontSize: 24, margin: '0 0 8px' }}>VMW Admin</h1>
          <p style={{ ...ff.body, color: C.dim, fontSize: 14, margin: 0 }}>Vijay Metal Works — Studio Dashboard</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)}
            required style={{ ...inpStyle, fontSize: 16 }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required style={{ ...inpStyle, fontSize: 16 }} />
          {error && (
            <div style={{ ...ff.body, fontSize: 13, color: C.red, padding: '10px 14px',
              background: 'rgba(255,77,77,0.1)', borderRadius: 8 }}>{error}</div>
          )}
          <button type="submit" disabled={loading} className="vmw-btn"
            style={{ padding: '14px 0', background: loading ? 'rgba(255,215,0,0.4)' : C.gold,
              color: '#000', border: 'none', borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY TAB — Full Control (upload, edit caption+subtext, replace image, delete)
═══════════════════════════════════════════════════════════════ */
const GalleryTab = () => {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [replacePreview, setReplacePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [filterCat, setFilterCat]     = useState('All');
  const [form, setForm] = useState({
    title: '', description: '', subtext: '', category: 'Gold Work',
    metal_type: '24K Gold Nagas', is_featured: false,
    file: null, preview: null, artisan_notes: '',
  });
  const fileRef    = useRef();
  const replaceRef = useRef();
  const { show, Toast } = useToast();

  const authHeaders = useCallback(() => ({
    apikey: SB_KEY, Authorization: `Bearer ${getSessionToken()}`,
  }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const r = await sbFetch('/gallery_items?select=*&order=created_at.desc');
    if (r?.ok) {
      setItems(r.data || []);
    } else {
      const errMsg = r?.data?.message || r?.data?.hint || r?.data?.details || `HTTP ${r?.status}`;
      setLoadError(`Could not load gallery: ${errMsg}. Check Settings → Run the SQL fix.`);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyFile = useCallback((file, isReplace = false) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { show('Only image files (JPG, PNG, WEBP)', false); return; }
    if (file.size > MAX_FILE_BYTES) { show(`Too large (${(file.size/1024/1024).toFixed(1)} MB). Max 20 MB.`, false); return; }
    if (isReplace) {
      if (replacePreview) URL.revokeObjectURL(replacePreview);
      setReplaceFile(file);
      setReplacePreview(URL.createObjectURL(file));
    } else {
      setForm(prev => {
        if (prev.preview) URL.revokeObjectURL(prev.preview);
        return { ...prev, file, preview: URL.createObjectURL(file) };
      });
    }
  }, [show, replacePreview]);

  /* ── Upload new photo ── */
  const handleUpload = async () => {
    if (!form.file || !form.title.trim()) { show('Please add a title and select an image.', false); return; }
    if (!SB_URL || !SB_KEY) { show('Supabase not configured.', false); return; }
    setUploading(true); setProgress(10);
    try {
      setProgress(20);
      const insertRes = await fetch(`${SB_URL}/rest/v1/gallery_items`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          artisan_notes: form.subtext.trim() || form.artisan_notes?.trim() || null,
          category: form.category,
          metal_type: form.metal_type,
          is_featured: form.is_featured,
          image_url: '',
        }),
      });
      if (!insertRes.ok) throw new Error(`DB insert failed: ${await insertRes.text()}`);
      const [newRow] = await insertRes.json();
      const uuid = newRow.id;
      setProgress(40);
      const ext = form.file.name.split('.').pop().toLowerCase();
      const storagePath = `gallery/${uuid}.${ext}`;
      const uploadRes = await fetch(`${SB_URL}/storage/v1/object/gallery-images/${storagePath}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': form.file.type, 'x-upsert': 'true' },
        body: form.file,
      });
      if (!uploadRes.ok) {
        await fetch(`${SB_URL}/rest/v1/gallery_items?id=eq.${uuid}`, { method: 'DELETE', headers: authHeaders() });
        throw new Error(`Image upload failed: ${await uploadRes.text()}`);
      }
      setProgress(80);
      const publicUrl = `${SB_URL}/storage/v1/object/public/gallery-images/${storagePath}`;
      await fetch(`${SB_URL}/rest/v1/gallery_items?id=eq.${uuid}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ image_url: publicUrl }),
      });
      setProgress(100);
      show(`"${form.title}" is now live on the website ✓`);
      if (form.preview) URL.revokeObjectURL(form.preview);
      setForm({ title: '', description: '', subtext: '', category: 'Gold Work', metal_type: '24K Gold Nagas',
        is_featured: false, file: null, preview: null, artisan_notes: '' });
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      load();
    } catch (err) { show(err.message, false); }
    finally { setUploading(false); setProgress(0); }
  };

  /* ── Save edits (caption, subtext, category, metal, featured) ── */
  const saveEdit = async () => {
    if (!editItem || !editItem.title.trim()) { show('Title cannot be empty.', false); return; }
    let imageUrl = editItem.image_url;

    // If admin selected a replacement image, upload it first
    if (replaceFile) {
      try {
        const ext = replaceFile.name.split('.').pop().toLowerCase();
        const storagePath = `gallery/${editItem.id}.${ext}`;
        const upRes = await fetch(`${SB_URL}/storage/v1/object/gallery-images/${storagePath}`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': replaceFile.type, 'x-upsert': 'true' },
          body: replaceFile,
        });
        if (!upRes.ok) throw new Error('Image replacement upload failed');
        imageUrl = `${SB_URL}/storage/v1/object/public/gallery-images/${storagePath}?t=${Date.now()}`;
      } catch (err) { show(err.message, false); return; }
    }

    const r = await sbFetch(`/gallery_items?id=eq.${editItem.id}`, 'PATCH', {
      title:         editItem.title.trim(),
      description:   editItem.description?.trim() || null,
      artisan_notes: editItem.subtext?.trim() || editItem.artisan_notes?.trim() || null,
      category:      editItem.category,
      metal_type:    editItem.metal_type,
      is_featured:   editItem.is_featured,
      image_url:     imageUrl,
    });
    if (r?.ok) {
      show('Updated on website ✓');
      setEditItem(null);
      if (replacePreview) URL.revokeObjectURL(replacePreview);
      setReplaceFile(null); setReplacePreview(null);
      if (replaceRef.current) replaceRef.current.value = '';
      load();
    } else show('Update failed', false);
  };

  const closeEditModal = () => {
    setEditItem(null);
    if (replacePreview) URL.revokeObjectURL(replacePreview);
    setReplaceFile(null); setReplacePreview(null);
    if (replaceRef.current) replaceRef.current.value = '';
  };

  const toggleFeatured = async (item) => {
    const r = await sbFetch(`/gallery_items?id=eq.${item.id}`, 'PATCH', { is_featured: !item.is_featured });
    if (r?.ok) { show(`${item.title} ${!item.is_featured ? '★ featured' : 'unfeatured'}`); load(); }
    else show('Update failed', false);
  };

  const deleteItem = async (item) => {
    const r = await sbFetch(`/gallery_items?id=eq.${item.id}`, 'DELETE');
    if (r?.ok || r?.status === 204) {
      if (item.image_url?.includes('/storage/v1/object/public/gallery-images/')) {
        const path = item.image_url.split('/storage/v1/object/public/gallery-images/')[1].split('?')[0];
        await fetch(`${SB_URL}/storage/v1/object/gallery-images/${path}`, {
          method: 'DELETE', headers: authHeaders(),
        });
      }
      show(`"${item.title}" deleted.`);
      setDeleteConfirm(null); load();
    } else show('Delete failed', false);
  };

  const visibleItems = useMemo(() =>
    filterCat === 'All' ? items : items.filter(i => i.category === filterCat),
  [items, filterCat]);

  return (
    <div>
      {Toast}

      {/* Header */}
      <div className="vmw-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ ...ff.display, fontSize: 20, color: C.text, margin: 0 }}>Gallery Management</h3>
          <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '4px 0 0' }}>
            {items.length} photos · Changes go live on the website instantly
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load} className="vmw-btn"
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
              padding: '9px 14px', borderRadius: 10, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
            ↻ Refresh
          </button>
          <button onClick={() => { setShowForm(v => !v); setEditItem(null); }} className="vmw-btn"
            style={{ background: showForm ? 'transparent' : C.gold, color: showForm ? C.gold : '#000',
              border: `1px solid ${showForm ? C.gold : 'transparent'}`, padding: '9px 20px',
              borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Upload Photo'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['All', ...GALLERY_CATS].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className="vmw-btn"
            style={{ padding: '5px 12px', borderRadius: 20,
              border: `1px solid ${filterCat === cat ? C.gold : C.border}`,
              background: filterCat === cat ? 'rgba(255,215,0,0.12)' : 'transparent',
              color: filterCat === cat ? C.gold : C.dim, cursor: 'pointer', ...ff.body, fontSize: 12 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: 16, padding: 24 }}>
              <h4 style={{ ...ff.display, fontSize: 17, color: C.gold, margin: '0 0 20px' }}>Upload New Photo</h4>
              <div className="vmw-upload-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Title / Caption *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Sadari Gold Crown" style={inpStyle} />
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ ...inpStyle, cursor: 'pointer' }}>
                    {GALLERY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Metal Type</label>
                  <select value={form.metal_type} onChange={e => setForm(f => ({ ...f, metal_type: e.target.value }))}
                    style={{ ...inpStyle, cursor: 'pointer' }}>
                    {METAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Featured on Homepage?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12 }}>
                    <input type="checkbox" checked={form.is_featured}
                      onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' }} />
                    <span style={{ ...ff.body, fontSize: 14, color: C.text }}>Show in featured section</span>
                  </div>
                </div>
              </div>

              {/* Description — shown as caption on website */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                  Description / Caption <span style={{ color: C.gold }}>(shown on website below photo)</span>
                </label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this artwork — shown to visitors on the gallery page..."
                  rows={2} style={{ ...inpStyle, resize: 'vertical', minHeight: 56 }} />
              </div>

              {/* Subtext — shown as smaller text below caption */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                  Subtext <span style={{ color: C.faint }}>(smaller note shown below caption on website)</span>
                </label>
                <textarea value={form.subtext} onChange={e => setForm(f => ({ ...f, subtext: e.target.value }))}
                  placeholder="e.g. Hand-chiselled, each naga scale individually pressed. 45–60 days crafting time."
                  rows={2} style={{ ...inpStyle, resize: 'vertical', minHeight: 56 }} />
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); applyFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? C.gold : form.preview ? C.goldDim : C.border}`,
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                  background: dragOver ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.02)',
                  minHeight: form.preview ? 'auto' : 140, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexDirection: 'column', textAlign: 'center', marginBottom: 14 }}>
                {form.preview
                  ? <img src={form.preview} alt="Preview" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }} />
                  : <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      <p style={{ ...ff.body, fontSize: 14, color: C.dim, margin: '0 0 4px' }}>
                        {dragOver ? 'Drop image here' : 'Click or drag & drop image'}
                      </p>
                      <p style={{ ...ff.body, fontSize: 12, color: C.faint, margin: 0 }}>JPG, PNG, WEBP · Max 20 MB</p>
                    </>}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => applyFile(e.target.files[0])} />
              </div>

              {form.preview && (
                <button onClick={() => { if (form.preview) URL.revokeObjectURL(form.preview);
                    setForm(f => ({ ...f, file: null, preview: null }));
                    if (fileRef.current) fileRef.current.value = ''; }}
                  style={{ ...ff.body, fontSize: 12, color: C.red, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 10px' }}>
                  ✕ Remove image
                </button>
              )}

              {uploading && (
                <div style={{ marginBottom: 14, borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', height: 5 }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                    style={{ height: '100%', background: C.gold, borderRadius: 6 }} />
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading || !form.file} className="vmw-btn"
                style={{ width: '100%', padding: 14, background: uploading || !form.file ? 'rgba(255,215,0,0.3)' : C.gold,
                  color: '#000', border: 'none', borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 14,
                  cursor: uploading || !form.file ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {uploading ? `Uploading… ${progress}%` : '⬆ Upload & Publish to Website'}
              </button>
              <p style={{ ...ff.body, fontSize: 12, color: C.faint, textAlign: 'center', margin: '10px 0 0' }}>
                Photo goes live on the website immediately after upload.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={closeEditModal}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="vmw-modal-inner"
              style={{ background: '#131008', border: `1px solid ${C.borderGold}`, borderRadius: 20,
                padding: 28, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4 style={{ ...ff.display, fontSize: 17, color: C.gold, margin: 0 }}>Edit Photo</h4>
                <button onClick={closeEditModal}
                  style={{ background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>

              {/* Current Image Preview + Replace */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase',
                  letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                  Photo <span style={{ color: C.gold }}>(click to replace)</span>
                </label>
                <div onClick={() => replaceRef.current?.click()}
                  style={{ borderRadius: 12, overflow: 'hidden', border: `2px dashed ${replacePreview ? C.gold : C.border}`,
                    cursor: 'pointer', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
                  <img
                    src={resolveImg(replacePreview || editItem.image_url)}
                    alt={editItem.title}
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display='none'; }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    ...ff.body, fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    {replacePreview ? '✓ New image selected — save to apply' : '📷 Click to replace photo'}
                  </div>
                  <input ref={replaceRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => applyFile(e.target.files[0], true)} />
                </div>
                {replacePreview && (
                  <button onClick={() => { if (replacePreview) URL.revokeObjectURL(replacePreview);
                      setReplaceFile(null); setReplacePreview(null);
                      if (replaceRef.current) replaceRef.current.value = ''; }}
                    style={{ ...ff.body, fontSize: 12, color: C.red, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0 0' }}>
                    ✕ Keep original photo
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Title / Caption */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Title / Caption <span style={{ color: C.dim, textTransform: 'none', letterSpacing: 0 }}>(shown on website)</span>
                  </label>
                  <input value={editItem.title}
                    onChange={e => setEditItem(ei => ({ ...ei, title: e.target.value }))}
                    style={{ ...inpStyle, border: `1px solid ${C.borderGold}` }} />
                </div>

                {/* Description */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Description <span style={{ color: C.dim, textTransform: 'none', letterSpacing: 0 }}>(caption shown below photo on website)</span>
                  </label>
                  <textarea value={editItem.description || ''}
                    onChange={e => setEditItem(ei => ({ ...ei, description: e.target.value }))}
                    placeholder="Describe this artwork for website visitors..."
                    rows={3} style={{ ...inpStyle, border: `1px solid ${C.borderGold}`, resize: 'vertical', minHeight: 70 }} />
                </div>

                {/* Subtext */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Subtext <span style={{ color: C.dim, textTransform: 'none', letterSpacing: 0 }}>(smaller note shown below description)</span>
                  </label>
                  <textarea
                    value={editItem.subtext !== undefined ? editItem.subtext : (editItem.artisan_notes || '')}
                    onChange={e => setEditItem(ei => ({ ...ei, subtext: e.target.value }))}
                    placeholder="e.g. crafting details, technique, duration..."
                    rows={2} style={{ ...inpStyle, resize: 'vertical', minHeight: 60 }} />
                </div>

                {/* Category & Metal */}
                <div className="vmw-edit-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Category</label>
                    <select value={editItem.category || ''} onChange={e => setEditItem(ei => ({ ...ei, category: e.target.value }))}
                      style={{ ...inpStyle, cursor: 'pointer' }}>
                      {GALLERY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Metal Type</label>
                    <select value={editItem.metal_type || ''} onChange={e => setEditItem(ei => ({ ...ei, metal_type: e.target.value }))}
                      style={{ ...inpStyle, cursor: 'pointer' }}>
                      {METAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Featured toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: 'rgba(255,215,0,0.05)', borderRadius: 10, border: `1px solid ${C.borderGold}` }}>
                  <input type="checkbox" checked={editItem.is_featured || false}
                    onChange={e => setEditItem(ei => ({ ...ei, is_featured: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' }} />
                  <span style={{ ...ff.body, fontSize: 14, color: C.text }}>★ Featured on Homepage</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={saveEdit} className="vmw-btn"
                    style={{ flex: 1, padding: 14, background: C.gold, color: '#000', border: 'none',
                      borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Save Changes to Website
                  </button>
                  <button onClick={closeEditModal} className="vmw-btn"
                    style={{ flex: 1, padding: 14, background: 'transparent', color: C.dim,
                      border: `1px solid ${C.border}`, borderRadius: 10, ...ff.body, fontSize: 14, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Grid */}
      {loadError ? (
        <div style={{ background: 'rgba(255,77,77,0.08)', border: `1px solid ${C.red}`, borderRadius: 14,
          padding: 24, marginTop: 8 }}>
          <div style={{ ...ff.body, fontSize: 14, color: C.red, fontWeight: 600, marginBottom: 8 }}>
            ⚠️ Gallery load error
          </div>
          <div style={{ ...ff.body, fontSize: 13, color: 'rgba(255,200,200,0.9)', lineHeight: 1.6, marginBottom: 16 }}>
            {loadError}
          </div>
          <div style={{ ...ff.body, fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.gold }}>How to fix:</strong> Go to <strong>Settings</strong> tab → copy the <strong>"SQL Fix"</strong> block → run it in your Supabase dashboard SQL Editor. Then click Refresh.
          </div>
          <button onClick={load} className="vmw-btn" style={{ marginTop: 14, padding: '8px 18px',
            background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
            borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
            ↻ Retry
          </button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>Loading gallery…</div>
      ) : visibleItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>
          {items.length === 0 ? 'No photos yet. Upload your first one above.' : `No photos in "${filterCat}" category.`}
        </div>
      ) : (
        <div className="vmw-gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 14 }}>
          {visibleItems.map(item => (
            <motion.div key={item.id} layout
              style={{ background: C.surface, border: `1px solid ${item.is_featured ? C.borderGold : C.border}`,
                borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              {item.is_featured && (
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
              )}
              <div style={{ position: 'relative', paddingTop: '70%' }}>
                <img src={resolveImg(item.image_url)} alt={item.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.background = '#1a1206'; e.target.style.display = 'none'; }} />
                {item.is_featured && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.9)',
                    color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...ff.body }}>
                    ★ FEATURED
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ ...ff.body, fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 4, lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </div>
                )}
                {item.artisan_notes && (
                  <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginBottom: 4, lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.artisan_notes}
                  </div>
                )}
                <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginBottom: 10 }}>
                  {item.category}{item.metal_type ? ` · ${item.metal_type}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => toggleFeatured(item)} className="vmw-btn"
                    style={{ flex: 1, minWidth: 60, padding: '6px 4px',
                      background: item.is_featured ? 'rgba(255,215,0,0.15)' : 'transparent',
                      border: `1px solid ${item.is_featured ? C.gold : C.border}`,
                      color: item.is_featured ? C.gold : C.dim, borderRadius: 6, cursor: 'pointer',
                      ...ff.body, fontSize: 11, fontWeight: 600 }}>
                    {item.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button onClick={() => { setEditItem({ ...item, subtext: item.artisan_notes || '' }); setReplaceFile(null); setReplacePreview(null); }} className="vmw-btn"
                    style={{ padding: '6px 11px', background: 'rgba(77,166,255,0.1)',
                      border: `1px solid rgba(77,166,255,0.3)`, color: C.blue, borderRadius: 6,
                      cursor: 'pointer', ...ff.body, fontSize: 11 }}>
                    ✏️ Edit
                  </button>
                  {deleteConfirm === item.id ? (
                    <>
                      <button onClick={() => deleteItem(item)} className="vmw-btn"
                        style={{ padding: '6px 9px', background: 'rgba(255,77,77,0.15)',
                          border: `1px solid ${C.red}`, color: C.red, borderRadius: 6,
                          cursor: 'pointer', ...ff.body, fontSize: 11, fontWeight: 700 }}>
                        Confirm ✓
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="vmw-btn"
                        style={{ padding: '6px 8px', background: 'transparent', border: 'none',
                          color: C.faint, cursor: 'pointer', ...ff.body, fontSize: 11 }}>✕</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(item.id)} className="vmw-btn"
                      style={{ padding: '6px 10px', background: 'transparent',
                        border: `1px solid ${C.border}`, color: C.faint, borderRadius: 6,
                        cursor: 'pointer', ...ff.body, fontSize: 11 }}>
                      🗑
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VISITORS TAB — Analytics + Location + Device + Browser
═══════════════════════════════════════════════════════════════ */
const VisitorsTab = () => {
  const [visits, setVisits]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [stats, setStats]                 = useState({ total: 0, today: 0, week: 0, countries: 0 });
  const [locationGroups, setLocationGroups] = useState([]);
  const [deviceGroups, setDeviceGroups]   = useState([]);
  const [referrerGroups, setReferrerGroups] = useState([]);
  const [dailyData, setDailyData]         = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await sbFetch('/analytics_events?select=*&event_type=eq.page_view&order=created_at.desc&limit=1000');
    if (r?.ok) {
      const all = r.data || [];
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayCount = all.filter(e => e.created_at?.startsWith(todayStr)).length;
      const weekCount  = all.filter(e => new Date(e.created_at) >= weekAgo).length;

      // Location grouping
      const countryMap = {};
      all.forEach(e => {
        const meta = e.metadata || {};
        const country = meta.country || meta.country_name || 'Unknown';
        countryMap[country] = (countryMap[country] || 0) + 1;
      });
      const locationList = Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pct: all.length ? Math.round(count / all.length * 100) : 0 }));

      // Device grouping from user-agent
      const deviceMap = {};
      all.forEach(e => {
        const ua = (e.metadata?.ua || '').toLowerCase();
        let device = 'Desktop';
        if (/iphone|android.*mobile|windows phone|blackberry/i.test(ua)) device = 'Mobile';
        else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) device = 'Tablet';
        deviceMap[device] = (deviceMap[device] || 0) + 1;
      });
      const deviceList = Object.entries(deviceMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pct: all.length ? Math.round(count / all.length * 100) : 0 }));

      // Referrer grouping
      const refMap = {};
      all.forEach(e => {
        const ref = e.metadata?.referrer || 'direct';
        let key = ref === 'direct' || ref === '' ? 'Direct' : (() => {
          try { return new URL(ref).hostname.replace('www.', '') || 'Direct'; } catch { return 'Direct'; }
        })();
        refMap[key] = (refMap[key] || 0) + 1;
      });
      const refList = Object.entries(refMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count, pct: all.length ? Math.round(count / all.length * 100) : 0 }));

      // 14-day chart
      const daily = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const str = d.toISOString().slice(0, 10);
        daily.push({ date: str.slice(5), count: all.filter(e => e.created_at?.startsWith(str)).length });
      }

      setVisits(all);
      setStats({ total: all.length, today: todayCount, week: weekCount,
        countries: Object.keys(countryMap).filter(k => k !== 'Unknown').length });
      setLocationGroups(locationList);
      setDeviceGroups(deviceList);
      setReferrerGroups(refList);
      setDailyData(daily);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxDaily = Math.max(...dailyData.map(d => d.count), 1);
  const recentVisits = useMemo(() => visits.slice(0, 25), [visits]);

  const BarList = ({ items, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.length === 0
        ? <div style={{ ...ff.body, fontSize: 13, color: C.dim }}>No data yet.</div>
        : items.slice(0, 8).map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ ...ff.body, fontSize: 12, color: C.text }}>{item.name}</span>
              <span style={{ ...ff.body, fontSize: 11, color: C.dim }}>{item.count} ({item.pct}%)</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, rgba(255,215,0,0.4))`, borderRadius: 2 }} />
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div>
      {/* Stats Row */}
      <div className="vmw-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Visitors"  value={loading ? '—' : stats.total.toLocaleString()} sub="All time" accent />
        <StatCard icon="📅" label="Today"           value={loading ? '—' : stats.today}   sub="Visits today"  color={C.green} />
        <StatCard icon="📆" label="This Week"       value={loading ? '—' : stats.week}    sub="Last 7 days"   color={C.blue} />
        <StatCard icon="🌍" label="Countries"       value={loading ? '—' : stats.countries} sub="Unique" color={C.orange} />
      </div>

      {/* 14-Day Chart */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 20px 16px', marginBottom: 20 }}>
        <h4 style={{ ...ff.display, fontSize: 15, color: C.text, margin: '0 0 20px' }}>Visitors — Last 14 Days</h4>
        <div className="vmw-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
          {dailyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ ...ff.body, fontSize: 8, color: C.faint }}>{d.count > 0 ? d.count : ''}</div>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', transition: 'height 0.5s',
                height: `${Math.max((d.count / maxDaily) * 80, d.count > 0 ? 4 : 1)}px`,
                background: d.count > 0 ? `linear-gradient(180deg, ${C.gold}, rgba(255,215,0,0.3))` : 'rgba(255,255,255,0.05)' }} />
              <div style={{ ...ff.body, fontSize: 8, color: C.faint, transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>
                {d.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location + Device + Referrer */}
      <div className="vmw-analytics-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h4 style={{ ...ff.display, fontSize: 15, color: C.text, margin: '0 0 16px' }}>🌍 Top Countries</h4>
          {loading ? <div style={{ ...ff.body, color: C.dim, fontSize: 13 }}>Loading…</div>
            : <BarList items={locationGroups} label="Country" />}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h4 style={{ ...ff.display, fontSize: 15, color: C.text, margin: '0 0 16px' }}>📱 Device Type</h4>
          {loading ? <div style={{ ...ff.body, color: C.dim, fontSize: 13 }}>Loading…</div>
            : <BarList items={deviceGroups} label="Device" />}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h4 style={{ ...ff.display, fontSize: 15, color: C.text, margin: '0 0 16px' }}>🔗 Traffic Sources</h4>
          {loading ? <div style={{ ...ff.body, color: C.dim, fontSize: 13 }}>Loading…</div>
            : <BarList items={referrerGroups} label="Source" />}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h4 style={{ ...ff.display, fontSize: 15, color: C.text, margin: '0 0 16px' }}>🕐 Recent Visits</h4>
          {loading ? <div style={{ ...ff.body, color: C.dim, fontSize: 13 }}>Loading…</div>
            : recentVisits.length === 0
              ? <div style={{ ...ff.body, fontSize: 13, color: C.dim }}>No visits yet.</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                  {recentVisits.map((v, i) => {
                    const meta = v.metadata || {};
                    const loc = [meta.city, meta.country || meta.country_name].filter(Boolean).join(', ') || 'Unknown';
                    const ua = (meta.ua || '').toLowerCase();
                    const dev = /iphone|android.*mobile|windows phone/i.test(ua) ? '📱'
                      : /ipad|tablet|android(?!.*mobile)/i.test(ua) ? '📟' : '🖥️';
                    const time = v.created_at
                      ? new Date(v.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
                      : '';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...ff.body, fontSize: 12, color: C.text }}>
                            {dev} {meta.page || '/'}
                          </div>
                          <div style={{ ...ff.body, fontSize: 11, color: C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📍 {loc}
                          </div>
                        </div>
                        <div style={{ ...ff.body, fontSize: 10, color: C.faint, textAlign: 'right', flexShrink: 0 }}>{time}</div>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={load} className="vmw-btn"
          style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   INQUIRIES TAB
═══════════════════════════════════════════════════════════════ */
const InquiriesTab = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const { show, Toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const r = await sbFetch('/inquiries?select=*&order=created_at.desc');
    if (r?.ok) setInquiries(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const r = await sbFetch(`/inquiries?id=eq.${id}`, 'PATCH', { status });
    if (r?.ok) { show('Status updated ✓'); load(); } else show('Update failed', false);
  };

  const statusColor = (s) => ({
    pending: C.gold, new: C.gold, contacted: C.blue,
    in_progress: C.orange, completed: C.green, rejected: C.red,
  }[s] || C.dim);

  return (
    <div>
      {Toast}
      <div className="vmw-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ ...ff.display, fontSize: 20, color: C.text, margin: 0 }}>Commission Inquiries</h3>
          <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '4px 0 0' }}>
            {inquiries.length} total · {inquiries.filter(i => ['pending','new'].includes(i.status)).length} pending
          </p>
        </div>
        <button onClick={load} className="vmw-btn"
          style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>Loading…</div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>
          No inquiries yet. When a customer submits the commission form on the website, it will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inquiries.map(iq => (
            <motion.div key={iq.id} layout
              style={{ background: C.surface, border: `1px solid ${selected === iq.id ? C.borderGold : C.border}`,
                borderRadius: 14, padding: '16px 18px', cursor: 'pointer' }}
              onClick={() => setSelected(selected === iq.id ? null : iq.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ ...ff.body, fontSize: 15, color: C.text, fontWeight: 600 }}>{iq.full_name || 'Unknown'}</div>
                  <div style={{ ...ff.body, fontSize: 12, color: C.dim, marginTop: 2 }}>
                    {iq.phone}{iq.email ? ` · ${iq.email}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20,
                    border: `1px solid ${statusColor(iq.status)}`, color: statusColor(iq.status),
                    ...ff.body, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {iq.status || 'pending'}
                  </span>
                  <span style={{ ...ff.body, fontSize: 11, color: C.faint }}>
                    {iq.created_at ? new Date(iq.created_at).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {selected === iq.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div className="vmw-inquiries-meta" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                        {[['Type', iq.artwork_type || '—'], ['Metal', iq.preferred_metal || '—'],
                          ['Budget', iq.budget || '—'], ['Timeline', iq.timeline || '—'],
                          ['WhatsApp', iq.whatsapp || iq.phone || '—']].map(([k, v]) => (
                          <div key={k}>
                            <div style={{ ...ff.body, fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{k}</div>
                            <div style={{ ...ff.body, fontSize: 13, color: C.text }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {iq.description && (
                        <div style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.7,
                          padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 14 }}>
                          {iq.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <select value={iq.status || 'pending'} onChange={e => updateStatus(iq.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ padding: '7px 10px', background: '#111', border: `1px solid ${C.border}`,
                            borderRadius: 8, color: C.text, ...ff.body, fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                          {['pending','new','contacted','in_progress','completed','rejected'].map(s => (
                            <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                          ))}
                        </select>
                        {(iq.whatsapp || iq.phone) && (
                          <button onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${(iq.whatsapp||iq.phone).replace(/[^0-9]/g,'')}`, '_blank'); }}
                            className="vmw-btn"
                            style={{ padding: '7px 14px', background: '#25D366', color: '#fff', border: 'none',
                              borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13, fontWeight: 600 }}>
                            💬 WhatsApp
                          </button>
                        )}
                        {iq.email && (
                          <button onClick={e => { e.stopPropagation(); window.open(`mailto:${iq.email}`, '_blank'); }}
                            className="vmw-btn"
                            style={{ padding: '7px 14px', background: 'transparent', color: C.gold,
                              border: `1px solid ${C.borderGold}`, borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
                            ✉ Email
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════ */
const DashboardTab = () => {
  const [stats, setStats] = useState({ artworks: 0, inquiries: 0, visitors: 0, todayVisitors: 0 });
  const [loading, setLoading] = useState(true);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!SB_URL || !SB_KEY) { setLoading(false); return; }
      setLoading(true);
      const [artRes, inqRes, visitorRes] = await Promise.all([
        sbFetch('/gallery_items?select=id', 'GET', null, { Prefer: 'count=exact', Range: '0-0' }),
        sbFetch('/inquiries?select=*&order=created_at.desc&limit=5'),
        sbFetch('/analytics_events?select=id,created_at&event_type=eq.page_view'),
      ]);
      const getCount = (r) => parseInt((r?.headers?.get?.('content-range') || '0/0').split('/')[1], 10) || 0;
      const inqData = inqRes?.data || [];
      const allVisits = visitorRes?.data || [];
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayV = allVisits.filter(e => e.created_at?.startsWith(todayStr)).length;
      setStats({ artworks: getCount(artRes), inquiries: inqData.filter(i => ['pending','new'].includes(i.status)).length,
        visitors: allVisits.length, todayVisitors: todayV });
      setRecentInquiries(inqData.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="vmw-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="🖼️" label="Total Artworks"  value={loading ? '—' : stats.artworks}      sub="In gallery"    accent />
        <StatCard icon="💬" label="New Inquiries"    value={loading ? '—' : stats.inquiries}     sub="Pending"       color={C.orange} />
        <StatCard icon="👥" label="Total Visitors"   value={loading ? '—' : stats.visitors}      sub="All time"      color={C.blue} />
        <StatCard icon="📅" label="Today"            value={loading ? '—' : stats.todayVisitors} sub="Visits today"  color={C.green} />
      </div>
      {recentInquiries.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <h4 style={{ ...ff.display, fontSize: 17, color: C.text, margin: '0 0 18px' }}>Recent Inquiries</h4>
          {recentInquiries.map(iq => (
            <div key={iq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ ...ff.body, fontSize: 14, color: C.text, fontWeight: 600 }}>{iq.full_name || 'Unknown'}</div>
                <div style={{ ...ff.body, fontSize: 12, color: C.dim }}>{iq.phone}{iq.artwork_type ? ` · ${iq.artwork_type}` : ''}</div>
              </div>
              <div style={{ ...ff.body, fontSize: 11, color: iq.status === 'pending' ? C.gold : C.dim,
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>{iq.status || 'pending'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SETTINGS TAB
═══════════════════════════════════════════════════════════════ */
/* ── All 23 static gallery images from the website ── */
const STATIC_GALLERY_SEED = [
  { gid:'vmw-gold-00', title:'Sadari Gold Crown',       image_url:'/gallery/gold/sadarigold.jpg',          category:'Gold Work',   metal_type:'24K Gold Nagas',         description:'Sadari crown in traditional gold nagas finish.',                artisan_notes:'Hand-chiselled Sadari with traditional Nagas finish. Each naga scale individually pressed.' },
  { gid:'vmw-gold-01', title:'Crown — Front View',      image_url:'/gallery/gold/crown.jpg',               category:'Gold Work',   metal_type:'Gold Nagas Handcrafted', description:'Kireedam front view — gold handwork in Agama Shastra proportions.', artisan_notes:'Kireedam crafted per Agama Shastra proportions with hand-beaten gold sheets.' },
  { gid:'vmw-gold-02', title:'Crown — Back Detail',     image_url:'/gallery/gold/crown back.jpg',          category:'Gold Work',   metal_type:'24K Gold Polish',        description:'Back detail showing lotus petal work and gold filigree.',       artisan_notes:'Back detail showing intricate lotus petal work and gold filigree.' },
  { gid:'vmw-gold-03', title:'Crown — Side View',       image_url:'/gallery/gold/crown side.jpg',          category:'Gold Work',   metal_type:'Gold Nagas Finish',      description:'Side profile — layered construction with copper frame and gold sheet.', artisan_notes:'Side profile reveals layered construction — inner copper frame, outer gold sheet.' },
  { gid:'vmw-gold-04', title:'Crown Piece I',           image_url:'/gallery/gold/crown1.jpg',              category:'Gold Work',   metal_type:'Gold Handwork',          description:'Classic crown with embossed floral patterns across the Makuta band.', artisan_notes:'Classic crown form with embossed floral patterns across the Makuta band.' },
  { gid:'vmw-gold-05', title:'Crown — Tall Form',       image_url:'/gallery/gold/crownn.jpg',              category:'Gold Work',   metal_type:'Gold Alloy Polish',      description:'Tall Makuta form for Vishnu pantheon deities — mirror-polished.', artisan_notes:'Tall Makuta form for Vishnu pantheon deities, mirror-polished finish.' },
  { gid:'vmw-gold-06', title:'Crown — Side Tall',       image_url:'/gallery/gold/crownnside.jpg',          category:'Gold Work',   metal_type:'24K Nagas Finish',       description:'Side view of tall Makuta — spine rib structure for strength and symmetry.', artisan_notes:'Side view of tall Makuta — the spine rib structure ensures strength and symmetry.' },
  { gid:'vmw-gold-07', title:'Straight Crown',          image_url:'/gallery/gold/straight crown.jpg',      category:'Gold Work',   metal_type:'Gold Beaten Work',       description:'Cylindrical Kireedam — traditional South Indian temple style.',  artisan_notes:'Cylindrical Kireedam with straight walls — traditional South Indian temple style.' },
  { gid:'vmw-gold-08', title:'Hand Ornament',           image_url:'/gallery/gold/hand1.jpg',               category:'Gold Work',   metal_type:'Gold Plated Copper',     description:'Hasta Abharana — deity hand ornament in electro-gold plated copper.', artisan_notes:'Hasta Abharana set for deity hand — electro-gold plated over solid copper base.' },
  { gid:'vmw-gold-09', title:'Kandabaranam',            image_url:'/gallery/gold/kandabaranam.jpg',        category:'Crown Work',  metal_type:'Temple Gold Crown',      description:'Festival crown with stone-set Prabha frame for processions.',   artisan_notes:'Kandabaranam with traditional stone-set Prabha frame — worn during festival processions.' },
  { gid:'vmw-gold-10', title:'Kanganam Bangle',         image_url:'/gallery/gold/kanganam4.jpg',           category:'Gold Work',   metal_type:'Gold Stone Setting',     description:'Deity wrist bangle with micro-pavé emerald and CZ setting.',    artisan_notes:'Deity wrist bangle with micro-pavé stone setting — four units per commission standard.' },
  { gid:'vmw-gold-11', title:'Sadari II',               image_url:'/gallery/gold/SADARI 2.jpg',            category:'Gold Work',   metal_type:'24K Gold Nagas',         description:'Second Sadari variant — wider Nagas flange for Lakshmi and Saraswati forms.', artisan_notes:'Second Sadari variant with wider Nagas flange — for Lakshmi and Saraswati forms.' },
  { gid:'vmw-gold-12', title:'Sur Kad Ornament',        image_url:'/gallery/gold/sur kad.png',             category:'Gold Work',   metal_type:'Gold Copper Alloy',      description:'Ear ornament in traditional Thiru Sur Kad pattern — repousse hammered.', artisan_notes:'Ear ornament set in traditional Thiru Sur Kad pattern — repousse hammered.' },
  { gid:'vmw-silv-13', title:'Kandabaranam Silver',     image_url:'/gallery/silver/kandabaranam.jpg',      category:'Silver Work', metal_type:'Sterling Silver',        description:'Silver Kandabaranam — Britannia silver sheet hand-chased and antique-finished.', artisan_notes:'Silver Kandabaranam — Britannia silver sheet hand-chased and antique-finished.' },
  { gid:'vmw-ston-14', title:'Stone Piece I',           image_url:'/gallery/stone/stone1.jpg',             category:'Stone Work',  metal_type:'Stone · Gold Inlay',     description:'Granite sculpture with gold-inlay highlights on crown and jewelry points.', artisan_notes:'Granite sculpture with gold-inlay highlights on crown and jewelry points.' },
  { gid:'vmw-ston-15', title:'Stone Piece II',          image_url:'/gallery/stone/stone2.jpg',             category:'Stone Work',  metal_type:'Stone Setting',          description:'Standing deity in Karnataka black granite — traditional Chola iconography.', artisan_notes:'Full standing deity in Karnataka black granite — traditional Chola iconography.' },
  { gid:'vmw-ston-16', title:'Stone Piece III',         image_url:'/gallery/stone/stone3.jpg',             category:'Stone Work',  metal_type:'Precious Stone Work',    description:'Multi-figure panel — temple gopuram decorative work.',          artisan_notes:'Larger panel with multi-figure composition — temple gopuram decorative work.' },
  { gid:'vmw-ston-17', title:'Stone Piece IV',          image_url:'/gallery/stone/stone4.jpg',             category:'Stone Work',  metal_type:'Stone · Silver',         description:'Deity with silver kavach overlay on stone base — combined commission.', artisan_notes:'Deity with silver kavach overlay on stone base — combined stone-metal commission.' },
  { gid:'vmw-ston-18', title:'Kow Pathakkam',           image_url:'/gallery/stone/kow pathakkam.png',      category:'Stone Work',  metal_type:'Stone · Temple Gold',    description:'Cow motif pendant in stone and gold — Kamadhenu iconography for temple altars.', artisan_notes:'Cow motif pendant in stone and gold — Kamadhenu iconography for temple altars.' },
  { gid:'vmw-ston-19', title:'Kow Pa Ornament',         image_url:'/gallery/stone/kow pa.jpg',             category:'Stone Work',  metal_type:'Stone Setting Deluxe',   description:'Ornamental piece with 108 stones per traditional Agamic count.', artisan_notes:'Deluxe stone-set ornamental piece with 108 stones per traditional Agamic count.' },
  { gid:'vmw-ston-20', title:'Thamarai Poo',            image_url:'/gallery/stone/thamarai poo3.jpg',      category:'Stone Work',  metal_type:'Lotus Flower Stone',     description:'Thamarai (lotus) in carved stone with hand-painted petal details.', artisan_notes:'Thamarai (lotus) in carved stone with hand-painted petal details.' },
  { gid:'vmw-temp-21', title:'Temple Deity',            image_url:'/gallery/temple/god.jpg',               category:'Vigraham',    metal_type:'Panchaloha Cast',        description:'Lost-wax cast Panchaloha vigraham — consecrated before delivery.', artisan_notes:'Lost-wax cast Panchaloha vigraham — 5-metal alloy (gold, silver, copper, lead, iron). Consecrated before delivery.' },
  { gid:'vmw-temp-22', title:'Temple Ornament Set',     image_url:'/gallery/temple/temple.jpg',            category:'Vigraham',    metal_type:'Full Temple Regalia',    description:'Complete Alankara set — Kireedam, Kavach, Haram, Bangles, Padasara in matching design.', artisan_notes:'Complete Alankara set — Kireedam, Kavach, Haram, Bangles, Padasara in matching design.' },
];

/* ═══════════════════════════════════════════════════════════════
   SITE IMAGES TAB — Upload & replace every image on the website
   Uses the `site_images` table + `site-images` storage bucket.
   Run SITE_IMAGES_PATCH.sql in Supabase before using this tab.
═══════════════════════════════════════════════════════════════ */

// Every image slot that appears anywhere on the website
const SITE_IMAGE_SLOTS = [
  // ── Hero & background ───────────────────────────────────────
  { id: 'hero_bg',         section: 'Hero',           label: 'Hero Background',               fallback: '/gallery/gold/crown.jpg',          hint: 'Full-width background behind the hero headline' },
  // ── CraftworkPanel (rotating slideshow in hero area) ────────
  { id: 'craftwork_1',     section: 'CraftworkPanel', label: 'Rotating Panel — Slide 1',      fallback: '/gallery/gold/sadarigold.jpg',      hint: 'First image in the rotating hero panel' },
  { id: 'craftwork_2',     section: 'CraftworkPanel', label: 'Rotating Panel — Slide 2',      fallback: '/gallery/gold/crown.jpg',           hint: 'Second image in the rotating hero panel' },
  { id: 'craftwork_3',     section: 'CraftworkPanel', label: 'Rotating Panel — Slide 3',      fallback: '/gallery/gold/kanganam4.jpg',       hint: 'Third image in the rotating hero panel' },
  { id: 'craftwork_4',     section: 'CraftworkPanel', label: 'Rotating Panel — Slide 4',      fallback: '/gallery/gold/kandabaranam.jpg',    hint: 'Fourth image in the rotating hero panel' },
  // ── Services section cards ───────────────────────────────────
  { id: 'service_gold',    section: 'Services',       label: 'Service Card — Gold Work',      fallback: '/gallery/gold/sadarigold.jpg',      hint: 'Image on the Gold Work service card' },
  { id: 'service_silver',  section: 'Services',       label: 'Service Card — Silver Work',    fallback: '/gallery/silver/kandabaranam.jpg',  hint: 'Image on the Silver Work service card' },
  { id: 'service_copper',  section: 'Services',       label: 'Service Card — Copper/Brass',   fallback: '/gallery/gold/hand1.jpg',           hint: 'Image on the Copper & Brass service card' },
  { id: 'service_pancha',  section: 'Services',       label: 'Service Card — Panchaloha',     fallback: '/gallery/temple/god.jpg',           hint: 'Image on the Panchaloha Idols service card' },
  { id: 'service_vimana',  section: 'Services',       label: 'Service Card — Vimana Tower',   fallback: '/gallery/gold/crownn.jpg',          hint: 'Image on the Vimana Tower service card' },
  { id: 'service_stone',   section: 'Services',       label: 'Service Card — Stone Work',     fallback: '/gallery/stone/stone1.jpg',         hint: 'Image on the Stone Work service card' },
  // ── Legacy / Heritage section ────────────────────────────────
  { id: 'legacy_1',        section: 'Legacy',         label: 'Legacy Photo 1',                fallback: '/gallery/gold/crown.jpg',           hint: 'First photo in the Legacy / Heritage section' },
  { id: 'legacy_2',        section: 'Legacy',         label: 'Legacy Photo 2',                fallback: '/gallery/gold/crown1.jpg',          hint: 'Second photo in the Legacy / Heritage section' },
  // ── Real Work Photos section ─────────────────────────────────
  { id: 'work_1',          section: 'RealWork',       label: 'Real Work Photo 1',             fallback: '/gallery/gold/crown.jpg',           hint: 'First photo in the "Real Work" showcase' },
  { id: 'work_2',          section: 'RealWork',       label: 'Real Work Photo 2',             fallback: '/gallery/gold/crown1.jpg',          hint: 'Second photo in the "Real Work" showcase' },
  { id: 'work_3',          section: 'RealWork',       label: 'Real Work Photo 3',             fallback: '/gallery/gold/kanganam4.jpg',       hint: 'Third photo in the "Real Work" showcase' },
  { id: 'work_4',          section: 'RealWork',       label: 'Real Work Photo 4',             fallback: '/gallery/silver/kandabaranam.jpg',  hint: 'Fourth photo in the "Real Work" showcase' },
  { id: 'work_5',          section: 'RealWork',       label: 'Real Work Photo 5',             fallback: '/gallery/gold/kandabaranam.jpg',    hint: 'Fifth photo in the "Real Work" showcase' },
  { id: 'work_6',          section: 'RealWork',       label: 'Real Work Photo 6',             fallback: '/gallery/temple/god.jpg',           hint: 'Sixth photo in the "Real Work" showcase' },
  // ── Showcase / Featured banner ───────────────────────────────
  { id: 'showcase_main',   section: 'Showcase',       label: 'Showcase Banner Image',         fallback: '/gallery/temple/temple.jpg',        hint: 'Large banner image in the Showcase section' },
  // ── Process section ──────────────────────────────────────────
  { id: 'process_1',       section: 'Process',        label: 'Process Step 1 — Design',       fallback: '/gallery/gold/crown.jpg',           hint: 'Image for the Design step in the process timeline' },
  { id: 'process_2',       section: 'Process',        label: 'Process Step 2 — Metalwork',    fallback: '/gallery/gold/kandabaranam.jpg',    hint: 'Image for the Metalwork step' },
  { id: 'process_3',       section: 'Process',        label: 'Process Step 3 — Stonework',    fallback: '/gallery/stone/stone1.jpg',         hint: 'Image for the Stonework step' },
  // ── Gallery Preview (homepage) ───────────────────────────────
  { id: 'preview_1',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 1',    fallback: '/gallery/gold/sadarigold.jpg',      hint: 'First featured piece shown on the homepage' },
  { id: 'preview_2',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 2',    fallback: '/gallery/gold/crown.jpg',           hint: 'Second featured piece shown on the homepage' },
  { id: 'preview_3',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 3',    fallback: '/gallery/gold/kandabaranam.jpg',    hint: 'Third featured piece shown on the homepage' },
  { id: 'preview_4',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 4',    fallback: '/gallery/gold/crown1.jpg',          hint: 'Fourth featured piece shown on the homepage' },
  { id: 'preview_5',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 5',    fallback: '/gallery/stone/stone1.jpg',         hint: 'Fifth featured piece (if shown)' },
  { id: 'preview_6',       section: 'GalleryPreview', label: 'Homepage Preview — Photo 6',    fallback: '/gallery/temple/god.jpg',           hint: 'Sixth featured piece (if shown)' },
];

const SECTION_GROUPS = [...new Set(SITE_IMAGE_SLOTS.map(s => s.section))];

const SiteImagesTab = () => {
  const [siteImages, setSiteImages]     = useState({});   // { id: url }
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(null); // slot id currently uploading
  const [filterSection, setFilterSection] = useState('All');
  const [preview, setPreview]           = useState({});   // { id: objectUrl }
  const [pendingFiles, setPendingFiles] = useState({});   // { id: File }
  const fileRefs = useRef({});
  const { show, Toast } = useToast();

  const authHeaders = useCallback(() => ({
    apikey: SB_KEY, Authorization: `Bearer ${getSessionToken()}`,
  }), []);

  // Load all current site image overrides from Supabase
  const load = useCallback(async () => {
    setLoading(true);
    const r = await sbFetch('/site_images?select=*');
    if (r?.ok && Array.isArray(r.data)) {
      const map = {};
      r.data.forEach(row => { map[row.id] = row.image_url; });
      setSiteImages(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => { Object.values(preview).forEach(url => URL.revokeObjectURL(url)); };
  }, []); // eslint-disable-line

  const handleFileSelect = (slotId, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { show('Only image files supported.', false); return; }
    if (file.size > 20 * 1024 * 1024) { show('Max 20 MB per image.', false); return; }
    // Clean up previous preview
    if (preview[slotId]) URL.revokeObjectURL(preview[slotId]);
    setPreview(prev => ({ ...prev, [slotId]: URL.createObjectURL(file) }));
    setPendingFiles(prev => ({ ...prev, [slotId]: file }));
  };

  const uploadSlot = async (slot) => {
    const file = pendingFiles[slot.id];
    if (!file) { show('Select an image first.', false); return; }
    if (!SB_URL || !SB_KEY) { show('Supabase not configured.', false); return; }

    setUploading(slot.id);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const storagePath = `site/${slot.id}.${ext}`;

      // Upload to storage
      const upRes = await fetch(`${SB_URL}/storage/v1/object/site-images/${storagePath}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': file.type, 'x-upsert': 'true' },
        body: file,
      });
      if (!upRes.ok) throw new Error(`Upload failed: ${await upRes.text()}`);

      const publicUrl = `${SB_URL}/storage/v1/object/public/site-images/${storagePath}?t=${Date.now()}`;

      // Upsert into site_images table
      const upsertRes = await fetch(`${SB_URL}/rest/v1/site_images`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          id: slot.id,
          section: slot.section,
          label: slot.label,
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!upsertRes.ok) throw new Error(`DB save failed: ${await upsertRes.text()}`);

      // Update local state
      setSiteImages(prev => ({ ...prev, [slot.id]: publicUrl }));
      // Clear pending
      if (preview[slot.id]) URL.revokeObjectURL(preview[slot.id]);
      setPreview(prev => { const n = { ...prev }; delete n[slot.id]; return n; });
      setPendingFiles(prev => { const n = { ...prev }; delete n[slot.id]; return n; });
      if (fileRefs.current[slot.id]) fileRefs.current[slot.id].value = '';

      show(`${slot.label} updated on website ✓`);
    } catch (err) {
      show(err.message, false);
    }
    setUploading(null);
  };

  const revertSlot = async (slot) => {
    if (!window.confirm(`Reset "${slot.label}" to the original static image?`)) return;
    // Delete the row so the website falls back to the hardcoded default
    const r = await sbFetch(`/site_images?id=eq.${slot.id}`, 'DELETE');
    if (r?.ok || r?.status === 204) {
      setSiteImages(prev => { const n = { ...prev }; delete n[slot.id]; return n; });
      show(`${slot.label} reverted to default ✓`);
    } else {
      show('Revert failed', false);
    }
  };

  const visibleSlots = filterSection === 'All'
    ? SITE_IMAGE_SLOTS
    : SITE_IMAGE_SLOTS.filter(s => s.section === filterSection);

  if (!SB_URL || !SB_KEY) {
    return (
      <div style={{ padding: 32, background: 'rgba(255,77,77,0.08)', border: `1px solid ${C.red}`, borderRadius: 16 }}>
        <div style={{ ...ff.display, fontSize: 18, color: C.red, marginBottom: 12 }}>⚠️ Supabase Not Configured</div>
        <div style={{ ...ff.body, fontSize: 14, color: 'rgba(255,200,200,0.9)', lineHeight: 1.8 }}>
          Add <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code> to <code>vmw-admin/.env</code> and restart.
        </div>
      </div>
    );
  }

  return (
    <div>
      {Toast}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '4px 0 0', lineHeight: 1.7 }}>
          Upload new images for any section of the website. Changes go live instantly — no code changes needed.<br />
          <span style={{ color: C.gold }}>First run <strong>SITE_IMAGES_PATCH.sql</strong> in your Supabase SQL Editor if you haven't already.</span>
        </p>
      </div>

      {/* Section Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {['All', ...SECTION_GROUPS].map(sec => (
          <button key={sec} onClick={() => setFilterSection(sec)} className="vmw-btn"
            style={{ padding: '5px 14px', borderRadius: 20, cursor: 'pointer', ...ff.body, fontSize: 12,
              border: `1px solid ${filterSection === sec ? C.gold : C.border}`,
              background: filterSection === sec ? 'rgba(255,215,0,0.12)' : 'transparent',
              color: filterSection === sec ? C.gold : C.dim }}>
            {sec}
          </button>
        ))}
        <button onClick={load} className="vmw-btn"
          style={{ padding: '5px 14px', borderRadius: 20, background: 'transparent',
            border: `1px solid ${C.border}`, color: C.dim, cursor: 'pointer', ...ff.body, fontSize: 12 }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 18 }}
          className="vmw-site-images-grid">
          {visibleSlots.map(slot => {
            const currentUrl = siteImages[slot.id] || slot.fallback;
            const pendingPreview = preview[slot.id];
            const hasPending = !!pendingFiles[slot.id];
            const isCustomised = !!siteImages[slot.id];
            const isUploading = uploading === slot.id;

            return (
              <motion.div key={slot.id} layout
                style={{ background: C.surface, border: `1px solid ${isCustomised ? C.borderGold : C.border}`,
                  borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                {isCustomised && (
                  <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
                )}

                {/* Image preview */}
                <div className="vmw-img-slot" style={{ position: 'relative', paddingTop: '70%', cursor: 'pointer', background: '#0a0806' }}
                  onClick={() => fileRefs.current[slot.id]?.click()}>
                  <img
                    src={resolveImg(pendingPreview || currentUrl)}
                    alt={slot.label}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'opacity 0.3s', opacity: pendingPreview ? 0.85 : 1 }}
                    onError={e => { e.target.style.opacity = '0.3'; }}
                  />
                  {/* Hover overlay — show "Replace" label on hover */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s', pointerEvents: 'none' }}>
                    <span style={{ ...ff.body, fontSize: 12, color: '#fff', letterSpacing: '0.08em',
                      textTransform: 'uppercase', pointerEvents: 'none' }}
                      className="img-hover-txt">📷 Replace</span>
                  </div>
                  {pendingPreview && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,215,0,0.9)',
                      color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...ff.body }}>
                      NEW — not saved yet
                    </div>
                  )}
                  {isCustomised && !pendingPreview && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,200,100,0.85)',
                      color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...ff.body }}>
                      ✓ Custom
                    </div>
                  )}
                  <input
                    ref={el => fileRefs.current[slot.id] = el}
                    type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFileSelect(slot.id, e.target.files[0])}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ ...ff.body, fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 2 }}>{slot.label}</div>
                  <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginBottom: 3 }}>
                    Section: <span style={{ color: C.gold }}>{slot.section}</span>
                  </div>
                  <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginBottom: 12, lineHeight: 1.5 }}>{slot.hint}</div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {/* Pick / change file */}
                    <button onClick={() => fileRefs.current[slot.id]?.click()} className="vmw-btn"
                      style={{ flex: 1, padding: '7px 8px', background: 'rgba(77,166,255,0.1)',
                        border: '1px solid rgba(77,166,255,0.3)', color: C.blue, borderRadius: 8,
                        cursor: 'pointer', ...ff.body, fontSize: 12 }}>
                      📂 {hasPending ? 'Change' : 'Select'}
                    </button>

                    {/* Save / upload */}
                    {hasPending && (
                      <button onClick={() => uploadSlot(slot)} disabled={isUploading} className="vmw-btn"
                        style={{ flex: 1, padding: '7px 8px',
                          background: isUploading ? 'rgba(255,215,0,0.3)' : C.gold,
                          color: '#000', border: 'none', borderRadius: 8,
                          cursor: isUploading ? 'not-allowed' : 'pointer', ...ff.body, fontSize: 12, fontWeight: 700 }}>
                        {isUploading ? '⏳' : '⬆ Save'}
                      </button>
                    )}

                    {/* Cancel pending */}
                    {hasPending && (
                      <button onClick={() => {
                        if (preview[slot.id]) URL.revokeObjectURL(preview[slot.id]);
                        setPreview(p => { const n = {...p}; delete n[slot.id]; return n; });
                        setPendingFiles(p => { const n = {...p}; delete n[slot.id]; return n; });
                        if (fileRefs.current[slot.id]) fileRefs.current[slot.id].value = '';
                      }} className="vmw-btn"
                        style={{ padding: '7px 9px', background: 'transparent',
                          border: `1px solid ${C.border}`, color: C.faint, borderRadius: 8,
                          cursor: 'pointer', ...ff.body, fontSize: 12 }}>
                        ✕
                      </button>
                    )}

                    {/* Revert to default */}
                    {isCustomised && !hasPending && (
                      <button onClick={() => revertSlot(slot)} className="vmw-btn"
                        style={{ padding: '7px 9px', background: 'transparent',
                          border: `1px solid rgba(255,77,77,0.3)`, color: C.red, borderRadius: 8,
                          cursor: 'pointer', ...ff.body, fontSize: 11 }}
                        title="Revert to original static image">
                        ↩ Reset
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 32, padding: 18, background: 'rgba(255,215,0,0.04)', border: `1px solid ${C.borderGold}`,
        borderRadius: 14, ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.8 }}>
        <strong style={{ color: C.gold }}>How it works:</strong><br />
        1. Click a card (or the 📂 button) to select a new image from your computer.<br />
        2. Click <strong style={{ color: C.gold }}>⬆ Save</strong> — it uploads to Supabase and immediately goes live on the website.<br />
        3. The website checks Supabase first; if no custom image is set, it uses the original static image as fallback.<br />
        4. Click <strong style={{ color: '#ff6b6b' }}>↩ Reset</strong> to go back to the original.
      </div>
    </div>
  );
};

const SettingsTab = () => {
  const [seeding, setSeeding]   = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [seedLog, setSeedLog]   = useState([]);
  const { show, Toast } = useToast();

  /* Seed all static images into gallery_items via Supabase REST */
  const handleSeed = async () => {
    if (!SB_URL || !SB_KEY) { show('Supabase not configured.', false); return; }
    setSeeding(true); setSeedLog([]); setSeedDone(false);
    const token = getSessionToken();
    const headers = {
      apikey: SB_KEY, Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal',
    };
    let ok = 0, skip = 0, fail = 0;
    const log = [];

    for (const item of STATIC_GALLERY_SEED) {
      try {
        const res = await fetch(`${SB_URL}/rest/v1/gallery_items`, {
          method: 'POST', headers,
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            artisan_notes: item.artisan_notes,
            category: item.category,
            metal_type: item.metal_type,
            image_url: item.image_url,
            is_featured: false,
          }),
        });
        if (res.ok || res.status === 201 || res.status === 409) {
          ok++;
          log.push({ title: item.title, status: res.status === 409 ? 'already exists' : 'added ✓' });
        } else {
          const txt = await res.text();
          fail++;
          log.push({ title: item.title, status: `failed (${res.status}): ${txt.slice(0,80)}`, err: true });
        }
      } catch (e) {
        fail++;
        log.push({ title: item.title, status: `error: ${e.message}`, err: true });
      }
    }

    setSeedLog(log);
    setSeedDone(true);
    setSeeding(false);
    if (fail === 0) show(`All ${ok} photos are now in the gallery database ✓`);
    else show(`${ok} added, ${fail} failed — check log below`, false);
  };

  const fixSQL = `-- ══════════════════════════════════════════════════
-- VMW FULL FIX — Run this in Supabase SQL Editor
-- Fixes: RLS policies, storage bucket, admin function
-- ══════════════════════════════════════════════════

-- 1. Make sure gallery_items has all needed columns
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS artisan_notes TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS metal_type TEXT;

-- 2. Admin check function (safe to re-run)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Enable RLS on gallery_items (may already be on)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 4. Drop old conflicting policies and recreate cleanly
DROP POLICY IF EXISTS "Gallery items are public." ON gallery_items;
DROP POLICY IF EXISTS "Admins manage gallery." ON gallery_items;
DROP POLICY IF EXISTS "Public can read gallery" ON gallery_items;
DROP POLICY IF EXISTS "Admin full access gallery" ON gallery_items;

-- Allow anyone to read gallery items (website visitors)
CREATE POLICY "Public can read gallery" ON gallery_items
  FOR SELECT USING (true);

-- Allow admins full write access
CREATE POLICY "Admin full access gallery" ON gallery_items
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Storage bucket: gallery-images (hyphen — matches app code)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('gallery-images', 'gallery-images', true)
  ON CONFLICT (id) DO NOTHING;

-- 6. Drop old storage policies and recreate
DROP POLICY IF EXISTS "Gallery Images Public View" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Images Admin Manage" ON storage.objects;
DROP POLICY IF EXISTS "Admin gallery upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin gallery delete" ON storage.objects;

-- Anyone can view gallery images (public bucket)
CREATE POLICY "Gallery Images Public View" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

-- Admins can upload (INSERT)
CREATE POLICY "Admin gallery upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND public.is_admin());

-- Admins can update/upsert
CREATE POLICY "Admin gallery update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery-images' AND public.is_admin());

-- Admins can delete
CREATE POLICY "Admin gallery delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images' AND public.is_admin());

-- 7. Analytics events — fix policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admins view analytics" ON analytics_events;
CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view analytics" ON analytics_events
  FOR SELECT USING (public.is_admin());

-- 8. Inquiries — fix policies
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins manage inquiries" ON inquiries;
CREATE POLICY "Anyone can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage inquiries" ON inquiries
  FOR ALL USING (public.is_admin());`;

  const adminRoleSQL = `-- Grant admin role to your account
-- Replace the email below with your admin email
UPDATE profiles
  SET role = 'admin'
  WHERE email = 'your-admin@email.com';

-- Verify it worked:
SELECT id, email, role FROM profiles WHERE role = 'admin';`;

  const CopyBlock = ({ label, code, highlight }) => (
    <div style={{ background: C.surface, border: `1px solid ${highlight ? C.borderGold : C.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ ...ff.display, fontSize: 14, color: highlight ? C.gold : C.text, margin: 0 }}>{label}</h4>
        <button onClick={() => { navigator.clipboard.writeText(code); }} className="vmw-btn"
          style={{ padding: '5px 12px', background: C.gold, color: '#000', border: 'none',
            borderRadius: 6, ...ff.body, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          📋 Copy
        </button>
      </div>
      <pre style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 14, color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.7,
        overflowX: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>{code}</pre>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── SEED EXISTING PHOTOS ─────────────────────────── */}
      <div style={{ background: 'rgba(255,215,0,0.06)', border: `1px solid ${C.borderGold}`, borderRadius: 14, padding: 20 }}>
        {Toast}
        <h4 style={{ ...ff.display, fontSize: 16, color: C.gold, margin: '0 0 10px' }}>
          📥 Seed All Existing Website Photos into Gallery
        </h4>
        <p style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.7, margin: '0 0 16px' }}>
          All <strong style={{ color: C.text }}>23 photos</strong> already on your website (gold, silver, stone, temple) are currently hardcoded static files.
          Click the button below to <strong style={{ color: C.text }}>add them all to the Supabase gallery database</strong> so you can edit their captions, subtext, category, and replace images — all from the Gallery tab.
        </p>
        <button onClick={handleSeed} disabled={seeding} className="vmw-btn"
          style={{ padding: '12px 28px', background: seeding ? 'rgba(255,215,0,0.3)' : C.gold,
            color: '#000', border: 'none', borderRadius: 10, ...ff.body, fontWeight: 700,
            fontSize: 14, cursor: seeding ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {seeding ? '⏳ Seeding…' : seedDone ? '✓ Done — Go to Gallery Tab' : '📥 Seed All 23 Photos to Gallery'}
        </button>

        {/* Seed log */}
        {seedLog.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {seedLog.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: 6,
                background: l.err ? 'rgba(255,77,77,0.1)' : 'rgba(0,200,100,0.07)',
                border: `1px solid ${l.err ? 'rgba(255,77,77,0.2)' : 'rgba(0,200,100,0.15)'}` }}>
                <span style={{ ...ff.body, fontSize: 12, color: C.text }}>{l.title}</span>
                <span style={{ ...ff.body, fontSize: 11, color: l.err ? C.red : C.green, flexShrink: 0, marginLeft: 12 }}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {seedDone && (
          <p style={{ ...ff.body, fontSize: 12, color: C.green, margin: '12px 0 0' }}>
            ✓ Go to the <strong>Gallery</strong> tab and click <strong>↻ Refresh</strong> to see all photos.
          </p>
        )}
      </div>

      {/* ── 403 FIX GUIDE ──────────────────────────────────── */}
      <div style={{ background: 'rgba(255,77,77,0.07)', border: `1px solid ${C.red}`, borderRadius: 14, padding: 20 }}>
        <h4 style={{ ...ff.display, fontSize: 16, color: C.red, margin: '0 0 12px' }}>
          🔧 Getting "403 Unauthorized" or 0 photos? Fix it in 2 steps:
        </h4>
        <div style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.9 }}>
          <p style={{ margin: '0 0 6px' }}><strong style={{ color: C.text }}>Step 1:</strong> Copy the <strong style={{ color: C.gold }}>"SQL Fix (Run This First)"</strong> block below</p>
          <p style={{ margin: '0 0 6px' }}><strong style={{ color: C.text }}>Step 2:</strong> Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: C.gold }}>supabase.com/dashboard</a> → your project → <strong>SQL Editor → New Query</strong> → paste → click <strong>Run</strong></p>
          <p style={{ margin: '0 0 6px' }}><strong style={{ color: C.text }}>Step 3:</strong> Come back here, go to Gallery tab, click <strong>↻ Refresh</strong></p>
          <p style={{ margin: 0, color: 'rgba(255,200,200,0.8)', fontSize: 12 }}>This sets up the storage bucket, RLS policies, and admin permissions in one shot.</p>
        </div>
      </div>

      <CopyBlock label="🔑 SQL Fix (Run This First)" code={fixSQL} highlight />
      <CopyBlock label="👤 Grant Admin Role to Your Account" code={adminRoleSQL} />

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h4 style={{ ...ff.display, fontSize: 14, color: C.text, margin: '0 0 10px' }}>🔌 Connection Status</h4>
        <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '0 0 4px' }}>
          Supabase URL: <code style={{ color: SB_URL ? C.green : C.red }}>{SB_URL ? SB_URL.replace('https://','').split('.')[0] + '.supabase.co ✓' : 'NOT SET'}</code>
        </p>
        <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: 0 }}>
          Anon Key: <code style={{ color: SB_KEY ? C.green : C.red }}>{SB_KEY ? '✓ set' : 'NOT SET'}</code>
        </p>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: 14, padding: 20 }}>
        <h4 style={{ ...ff.display, fontSize: 15, color: C.gold, margin: '0 0 10px' }}>ℹ️ How Gallery Sync Works</h4>
        <div style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 5px' }}>1. Upload a photo → stored in Supabase Storage bucket <code style={{ color: C.gold }}>gallery-images</code></p>
          <p style={{ margin: '0 0 5px' }}>2. Caption + metadata saved to <code style={{ color: C.gold }}>gallery_items</code> table</p>
          <p style={{ margin: '0 0 5px' }}>3. Main website fetches <code style={{ color: C.gold }}>gallery_items</code> on every load → appears <strong style={{ color: C.green }}>instantly</strong></p>
          <p style={{ margin: '0 0 5px' }}>4. Edit caption / subtext / replace image → reflects live</p>
          <p style={{ margin: 0 }}>5. Delete here → removed from website and Storage permanently</p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD SHELL — Mobile-responsive sidebar + hamburger
═══════════════════════════════════════════════════════════════ */
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setSidebar_active] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen]  = useState(false);
  const isMobile = useIsMobile();

  const setActiveTab = (tab) => {
    setSidebar_active(tab);
    if (isMobile) setSidebarOpen(false);
  };

  const tabs = [
    { id: 'Dashboard',   icon: '📊', label: 'Dashboard' },
    { id: 'Gallery',     icon: '🖼️', label: 'Gallery' },
    { id: 'SiteImages',  icon: '🌐', label: 'Site Images' },
    { id: 'Visitors',    icon: '👥', label: 'Visitors' },
    { id: 'Inquiries',   icon: '💬', label: 'Inquiries' },
    { id: 'Settings',    icon: '⚙️', label: 'Settings' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard':  return <DashboardTab />;
      case 'Gallery':    return <GalleryTab />;
      case 'SiteImages': return <SiteImagesTab />;
      case 'Visitors':   return <VisitorsTab />;
      case 'Inquiries':  return <InquiriesTab />;
      case 'Settings':   return <SettingsTab />;
      default:           return null;
    }
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, marginBottom: 4 }}>⚒️</div>
          <h2 style={{ ...ff.display, color: C.gold, margin: 0, fontSize: 16, letterSpacing: '0.04em' }}>Studio Admin</h2>
          <div style={{ ...ff.body, fontSize: 11, color: C.dim, marginTop: 2 }}>Vijay Metal Works</div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)}
            style={{ background: 'transparent', border: 'none', color: C.dim, fontSize: 22, cursor: 'pointer', padding: 4 }}>
            ✕
          </button>
        )}
      </div>
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="vmw-btn"
            style={{ width: '100%', textAlign: 'left', padding: '11px 14px',
              background: activeTab === tab.id ? 'rgba(255,215,0,0.1)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? C.borderGold : 'transparent'}`,
              borderRadius: 10, color: activeTab === tab.id ? C.gold : C.dim,
              ...ff.body, fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '14px 10px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...ff.body, fontSize: 11, color: C.faint, padding: '0 6px 10px', wordBreak: 'break-all' }}>
          {user?.email}
        </div>
        <button onClick={onLogout} className="vmw-btn"
          style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent',
            border: 'none', color: C.red, ...ff.body, fontSize: 14, cursor: 'pointer',
            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Mobile overlay */}
      {isMobile && (
        <div className={`vmw-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`vmw-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ background: C.bg2, borderRight: `1px solid ${C.border}`,
          flexShrink: 0,
          height: '100dvh',
          ...(isMobile ? {} : { position: 'sticky', top: 0 }) }}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 14, background: C.bg2, flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text,
                fontSize: 18, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', lineHeight: 1 }}>
              ☰
            </button>
            <div>
              <div style={{ ...ff.display, color: C.gold, fontSize: 14 }}>Studio Admin</div>
              <div style={{ ...ff.body, fontSize: 11, color: C.dim }}>
                {tabs.find(t => t.id === activeTab)?.icon} {activeTab}
              </div>
            </div>
          </div>
        )}

        <div className="vmw-main-content" style={{ flex: 1, padding: isMobile ? '16px 14px' : '36px 44px',
          overflowY: 'auto', overflowX: 'hidden',
          maxWidth: isMobile ? '100vw' : `calc(100vw - 220px)`,
          minWidth: 0, boxSizing: 'border-box' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {!isMobile && (
                <h1 style={{ ...ff.display, fontSize: 26, color: C.text, margin: '0 0 28px' }}>
                  {tabs.find(t => t.id === activeTab)?.icon} {activeTab}
                </h1>
              )}
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  injectFonts();
  injectAdminCSS();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem('vmw_admin_session');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed?.user && parsed?.access_token) {
          const expiresAt = parsed.expires_at;
          if (!expiresAt || Date.now() / 1000 < expiresAt) { setUser(parsed.user); }
          else { localStorage.removeItem('vmw_admin_session'); }
        }
      }
    } catch (_) { localStorage.removeItem('vmw_admin_session'); }
  }, []);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('vmw_admin_session'); setUser(null); };

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
