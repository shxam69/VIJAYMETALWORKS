/**
 * ╔══════════════════════════════════════════════════════════════╗
 *  VIJAY METAL WORKS — ADMIN DASHBOARD v2
 *  Enhanced with:
 *  ✅ Full Gallery Management (upload, edit caption, delete, view)
 *  ✅ Caption/Description editing for every photo
 *  ✅ Visitor Analytics — real-time visitor count + location map
 *  ✅ Changes reflect on website instantly via Supabase
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Supabase Config ─────────────────────────────────────────── */
const SB_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

const getSessionToken = () => {
  try {
    const s = localStorage.getItem('vmw_admin_session');
    if (s) {
      const p = JSON.parse(s);
      if (p?.access_token) return p.access_token;
    }
  } catch (_) {}
  return SB_KEY;
};

const sbFetch = async (path, method = 'GET', body = null, extra = {}) => {
  if (!SB_URL || !SB_KEY) return null;
  const token = getSessionToken();
  const opts = {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extra,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${SB_URL}/rest/v1${path}`, opts);
    const text = await res.text();
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null, headers: res.headers };
  } catch (e) {
    console.error('sbFetch error:', e);
    return null;
  }
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

const injectFonts = () => {
  if (document.getElementById('vmw-admin-fonts')) return;
  const l = document.createElement('link');
  l.id = 'vmw-admin-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;600;700;800&display=swap';
  document.head.appendChild(l);
};

/* ── Toast ───────────────────────────────────────────────────── */
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);
  const Toast = toast ? (
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '14px 22px',
        background: toast.ok ? 'rgba(0,200,100,0.95)' : 'rgba(220,50,50,0.95)',
        color: '#fff', borderRadius: 12, ...ff.body, fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxWidth: 380 }}>
      {toast.msg}
    </motion.div>
  ) : null;
  return { show, Toast };
};

/* ── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: C.surface, border: `1px solid ${accent ? C.borderGold : C.border}`,
      borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
    {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />}
    <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
    <div style={{ ...ff.body, fontSize: 12, color: C.dim, textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
    <div style={{ ...ff.display, fontSize: 36, color: color || (accent ? C.gold : C.text), lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ ...ff.body, fontSize: 12, color: C.faint, marginTop: 8 }}>{sub}</div>}
  </motion.div>
);

/* ── Input Style ─────────────────────────────────────────────── */
const inpStyle = {
  padding: '12px 14px', background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
  fontSize: 14, outline: 'none', fontFamily: "'Jost', sans-serif",
  width: '100%', boxSizing: 'border-box',
};

/* ── Gallery Categories & Metal Options ──────────────────────── */
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
    setLoading(true);
    setError('');
    if (!SB_URL || !SB_KEY) {
      setError('Supabase not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.');
      setLoading(false);
      return;
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
      if (profiles?.[0]?.role !== 'admin') {
        throw new Error('Access denied — account does not have admin role.');
      }
      localStorage.setItem('vmw_admin_session', JSON.stringify(data));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 24, padding: 40,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <h1 style={{ ...ff.display, color: C.gold, fontSize: 26, margin: '0 0 8px' }}>VMW Admin</h1>
          <p style={{ ...ff.body, color: C.dim, fontSize: 14, margin: 0 }}>Secure dashboard for Vijay Metal Works</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)}
            required style={{ ...inpStyle }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required style={{ ...inpStyle }} />
          {error && <div style={{ ...ff.body, fontSize: 13, color: C.red, padding: '10px 14px', background: 'rgba(255,77,77,0.1)', borderRadius: 8 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ padding: '15px 0', background: loading ? 'rgba(255,215,0,0.4)' : C.gold, color: '#000',
              border: 'none', borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY TAB — Full Control
═══════════════════════════════════════════════════════════════ */
const GalleryTab = () => {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [filterCat, setFilterCat]     = useState('All');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Gold Work',
    metal_type: '24K Gold Nagas', is_featured: false,
    file: null, preview: null, artisan_notes: '',
  });
  const fileRef = useRef();
  const { show, Toast } = useToast();

  const authHeaders = useCallback(() => ({
    apikey: SB_KEY,
    Authorization: `Bearer ${getSessionToken()}`,
  }), []);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await sbFetch('/gallery_items?select=*&order=created_at.desc');
    if (r?.ok) setItems(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { show('Only image files accepted (JPG, PNG, WEBP)', false); return; }
    if (file.size > MAX_FILE_BYTES) { show(`Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 20 MB.`, false); return; }
    setForm(prev => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return { ...prev, file, preview: URL.createObjectURL(file) };
    });
  }, [show]);

  const handleUpload = async () => {
    if (!form.file || !form.title.trim()) { show('Please enter a title and select an image.', false); return; }
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
          category: form.category,
          metal_type: form.metal_type,
          is_featured: form.is_featured,
          image_url: '',
          artisan_notes: form.artisan_notes?.trim() || null,
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
      setProgress(75);

      const publicUrl = `${SB_URL}/storage/v1/object/public/gallery-images/${storagePath}`;
      const updateRes = await fetch(`${SB_URL}/rest/v1/gallery_items?id=eq.${uuid}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ image_url: publicUrl }),
      });
      if (!updateRes.ok) throw new Error(`URL update failed: ${await updateRes.text()}`);
      setProgress(100);
      show(`"${form.title}" is now live on the website ✓`);
      if (form.preview) URL.revokeObjectURL(form.preview);
      setForm({ title: '', description: '', category: 'Gold Work', metal_type: '24K Gold Nagas', is_featured: false, file: null, preview: null, artisan_notes: '' });
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      load();
    } catch (err) {
      show(err.message, false);
    } finally {
      setUploading(false); setProgress(0);
    }
  };

  /* ── Save edits (caption, description, category, metal, featured) ── */
  const saveEdit = async () => {
    if (!editItem || !editItem.title.trim()) { show('Title cannot be empty.', false); return; }
    const r = await sbFetch(`/gallery_items?id=eq.${editItem.id}`, 'PATCH', {
      title:        editItem.title.trim(),
      description:  editItem.description?.trim() || null,
      category:     editItem.category,
      metal_type:   editItem.metal_type,
      artisan_notes: editItem.artisan_notes?.trim() || null,
      is_featured:  editItem.is_featured,
    });
    if (r?.ok) { show('Updated on website ✓'); setEditItem(null); load(); }
    else show('Update failed', false);
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
        const path = item.image_url.split('/storage/v1/object/public/gallery-images/')[1];
        await fetch(`${SB_URL}/storage/v1/object/gallery-images/${path}`, {
          method: 'DELETE', headers: authHeaders(),
        });
      }
      show(`"${item.title}" deleted.`);
      setDeleteConfirm(null);
      load();
    } else {
      show('Delete failed', false);
    }
  };

  const visibleItems = useMemo(() =>
    filterCat === 'All' ? items : items.filter(i => i.category === filterCat),
  [items, filterCat]);

  return (
    <div>
      {Toast}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ ...ff.display, fontSize: 22, color: C.text, margin: 0 }}>Gallery Management</h3>
          <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '4px 0 0' }}>
            {items.length} photos · All changes go live on the website instantly
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
            ↻ Refresh
          </button>
          <button onClick={() => { setShowForm(v => !v); setEditItem(null); }}
            style={{ background: showForm ? 'transparent' : C.gold, color: showForm ? C.gold : '#000',
              border: `1px solid ${showForm ? C.gold : 'transparent'}`, padding: '10px 24px',
              borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Upload Photo'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['All', ...GALLERY_CATS].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filterCat === cat ? C.gold : C.border}`,
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
            <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: 16, padding: 28 }}>
              <h4 style={{ ...ff.display, fontSize: 18, color: C.gold, margin: '0 0 24px' }}>Upload New Photo</h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Title / Caption *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Sadari Gold Crown" style={inpStyle} />
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ ...inpStyle, appearance: 'none', cursor: 'pointer' }}>
                    {GALLERY_CATS.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Metal Type</label>
                  <select value={form.metal_type} onChange={e => setForm(f => ({ ...f, metal_type: e.target.value }))}
                    style={{ ...inpStyle, appearance: 'none', cursor: 'pointer' }}>
                    {METAL_OPTIONS.map(m => <option key={m} value={m} style={{ background: '#111' }}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Featured on Homepage?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14 }}>
                    <input type="checkbox" checked={form.is_featured}
                      onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' }} />
                    <span style={{ ...ff.body, fontSize: 14, color: C.text }}>Show in featured section</span>
                  </div>
                </div>
              </div>

              {/* Description (shown as caption on website) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                  Description / Caption <span style={{ color: C.gold }}>(shown on website)</span>
                </label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this artwork — shown to visitors on the website gallery..."
                  rows={2} style={{ ...inpStyle, resize: 'vertical', minHeight: 60 }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Artisan Notes (optional, internal)</label>
                <textarea value={form.artisan_notes || ''} onChange={e => setForm(f => ({ ...f, artisan_notes: e.target.value }))}
                  placeholder="Internal notes about craftsmanship, technique..." rows={2}
                  style={{ ...inpStyle, resize: 'vertical', minHeight: 60 }} />
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
                  minHeight: form.preview ? 'auto' : 160,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', textAlign: 'center', marginBottom: 16 }}>
                {form.preview ? (
                  <img src={form.preview} alt="Preview"
                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
                    <p style={{ ...ff.body, fontSize: 14, color: C.dim, margin: '0 0 4px' }}>
                      {dragOver ? 'Drop image here' : 'Click or drag image here'}
                    </p>
                    <p style={{ ...ff.body, fontSize: 12, color: C.faint, margin: 0 }}>JPG, PNG, WEBP · Max 20 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => applyFile(e.target.files[0])} />
              </div>

              {form.preview && (
                <button onClick={() => {
                  if (form.preview) URL.revokeObjectURL(form.preview);
                  setForm(f => ({ ...f, file: null, preview: null }));
                  if (fileRef.current) fileRef.current.value = '';
                }}
                  style={{ ...ff.body, fontSize: 12, color: C.red, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 12px' }}>
                  ✕ Remove image
                </button>
              )}

              {uploading && (
                <div style={{ marginBottom: 16, borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', height: 6 }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                    style={{ height: '100%', background: C.gold, borderRadius: 6 }} />
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading || !form.file}
                style={{ width: '100%', padding: 16,
                  background: uploading || !form.file ? 'rgba(255,215,0,0.3)' : C.gold,
                  color: '#000', border: 'none', borderRadius: 10, ...ff.body,
                  fontWeight: 700, fontSize: 15, cursor: uploading || !form.file ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {uploading ? `Uploading… ${progress}%` : '⬆ Upload & Publish to Website'}
              </button>

              <p style={{ ...ff.body, fontSize: 12, color: C.faint, textAlign: 'center', margin: '12px 0 0' }}>
                The image will appear live on the website immediately after upload.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setEditItem(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#131008', border: `1px solid ${C.borderGold}`, borderRadius: 20,
                padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h4 style={{ ...ff.display, fontSize: 18, color: C.gold, margin: 0 }}>Edit Photo Details</h4>
                <button onClick={() => setEditItem(null)}
                  style={{ background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>

              {/* Image Preview */}
              {editItem.image_url && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <img src={editItem.image_url} alt={editItem.title}
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Caption / Title */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Title / Caption <span style={{ color: C.dim }}>(shown on website)</span>
                  </label>
                  <input value={editItem.title} onChange={e => setEditItem(ei => ({ ...ei, title: e.target.value }))}
                    style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.borderGold}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', ...ff.body, width: '100%', boxSizing: 'border-box' }} />
                </div>

                {/* Description */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Description <span style={{ color: C.dim }}>(caption shown on website)</span>
                  </label>
                  <textarea value={editItem.description || ''} onChange={e => setEditItem(ei => ({ ...ei, description: e.target.value }))}
                    placeholder="Describe this artwork for website visitors..."
                    rows={3} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.borderGold}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', ...ff.body, width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }} />
                </div>

                {/* Category & Metal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Category</label>
                    <select value={editItem.category} onChange={e => setEditItem(ei => ({ ...ei, category: e.target.value }))}
                      style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', ...ff.body, width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' }}>
                      {GALLERY_CATS.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Metal Type</label>
                    <select value={editItem.metal_type || ''} onChange={e => setEditItem(ei => ({ ...ei, metal_type: e.target.value }))}
                      style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', ...ff.body, width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' }}>
                      {METAL_OPTIONS.map(m => <option key={m} value={m} style={{ background: '#111' }}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Artisan Notes */}
                <div>
                  <label style={{ ...ff.body, fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Artisan Notes (internal)</label>
                  <textarea value={editItem.artisan_notes || ''} onChange={e => setEditItem(ei => ({ ...ei, artisan_notes: e.target.value }))}
                    rows={2} placeholder="Internal notes..."
                    style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', ...ff.body, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>

                {/* Featured toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,215,0,0.05)', borderRadius: 10, border: `1px solid ${C.borderGold}` }}>
                  <input type="checkbox" checked={editItem.is_featured || false}
                    onChange={e => setEditItem(ei => ({ ...ei, is_featured: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' }} />
                  <span style={{ ...ff.body, fontSize: 14, color: C.text }}>★ Featured on Homepage</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={saveEdit}
                    style={{ flex: 1, padding: '14px 0', background: C.gold, color: '#000', border: 'none', borderRadius: 10, ...ff.body, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Save Changes to Website
                  </button>
                  <button onClick={() => setEditItem(null)}
                    style={{ flex: 1, padding: '14px 0', background: 'transparent', color: C.dim, border: `1px solid ${C.border}`, borderRadius: 10, ...ff.body, fontSize: 14, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>Loading gallery…</div>
      ) : visibleItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>
          {items.length === 0 ? 'No photos yet. Upload your first one above.' : `No photos in "${filterCat}" category.`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {visibleItems.map(item => (
            <motion.div key={item.id} layout
              style={{ background: C.surface, border: `1px solid ${item.is_featured ? C.borderGold : C.border}`,
                borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              {item.is_featured && (
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
              )}
              <div style={{ position: 'relative', paddingTop: '70%' }}>
                <img src={item.image_url} alt={item.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.background = '#1a1206'; e.target.style.display = 'none'; }} />
                {item.is_featured && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.9)',
                    color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...ff.body }}>
                    ★ FEATURED
                  </div>
                )}
              </div>
              <div style={{ padding: 14 }}>
                {/* Caption / Title */}
                <div style={{ ...ff.body, fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                  {item.title}
                </div>
                {/* Description preview */}
                {item.description && (
                  <div style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 6, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </div>
                )}
                <div style={{ ...ff.body, fontSize: 11, color: C.faint, marginBottom: 12 }}>
                  {item.category} · {item.metal_type}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {/* Feature toggle */}
                  <button onClick={() => toggleFeatured(item)}
                    style={{ flex: 1, minWidth: 70, padding: '7px 4px',
                      background: item.is_featured ? 'rgba(255,215,0,0.15)' : 'transparent',
                      border: `1px solid ${item.is_featured ? C.gold : C.border}`,
                      color: item.is_featured ? C.gold : C.dim, borderRadius: 6,
                      cursor: 'pointer', ...ff.body, fontSize: 11, fontWeight: 600 }}>
                    {item.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  {/* Edit */}
                  <button onClick={() => setEditItem({ ...item })}
                    style={{ padding: '7px 12px', background: 'rgba(77,166,255,0.1)',
                      border: `1px solid rgba(77,166,255,0.3)`, color: C.blue, borderRadius: 6,
                      cursor: 'pointer', ...ff.body, fontSize: 11 }}>
                    ✏️ Edit
                  </button>
                  {/* Delete */}
                  {deleteConfirm === item.id ? (
                    <>
                      <button onClick={() => deleteItem(item)}
                        style={{ padding: '7px 10px', background: 'rgba(255,77,77,0.15)',
                          border: `1px solid ${C.red}`, color: C.red, borderRadius: 6,
                          cursor: 'pointer', ...ff.body, fontSize: 11, fontWeight: 700 }}>
                        Confirm Delete
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        style={{ padding: '7px 8px', background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer', ...ff.body, fontSize: 11 }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(item.id)}
                      style={{ padding: '7px 10px', background: 'transparent',
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
   VISITORS TAB — Analytics + Location
═══════════════════════════════════════════════════════════════ */
const VisitorsTab = () => {
  const [visits, setVisits]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState({ total: 0, today: 0, week: 0, countries: 0 });
  const [locationGroups, setLocationGroups] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch all visitor events (page_view type)
    const r = await sbFetch('/analytics_events?select=*&order=created_at.desc&limit=500');
    if (r?.ok) {
      const all = r.data || [];
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayCount = all.filter(e => e.created_at?.startsWith(todayStr)).length;
      const weekCount  = all.filter(e => new Date(e.created_at) >= weekAgo).length;

      // Extract location from metadata
      const countryMap = {};
      const cityMap = {};
      all.forEach(e => {
        const meta = e.metadata || {};
        const country = meta.country || meta.country_name || 'Unknown';
        const city = meta.city || 'Unknown';
        countryMap[country] = (countryMap[country] || 0) + 1;
        const key = `${city}, ${country}`;
        if (city !== 'Unknown') cityMap[key] = (cityMap[key] || 0) + 1;
      });

      const locationList = Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pct: Math.round(count / all.length * 100) }));

      setVisits(all);
      setStats({ total: all.length, today: todayCount, week: weekCount, countries: Object.keys(countryMap).filter(k => k !== 'Unknown').length });
      setLocationGroups(locationList);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group visits by day for chart
  const dailyData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    visits.forEach(e => {
      const key = e.created_at?.slice(0, 10);
      if (key && days[key] !== undefined) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    }));
  }, [visits]);

  const maxDaily = Math.max(...dailyData.map(d => d.count), 1);

  // Recent visits table
  const recentVisits = useMemo(() => visits.slice(0, 20), [visits]);

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Visitors" value={loading ? '—' : stats.total.toLocaleString()} sub="All time" accent />
        <StatCard icon="📅" label="Today" value={loading ? '—' : stats.today} sub="Visits today" color={C.green} />
        <StatCard icon="📆" label="This Week" value={loading ? '—' : stats.week} sub="Last 7 days" color={C.blue} />
        <StatCard icon="🌍" label="Countries" value={loading ? '—' : stats.countries} sub="Unique countries" color={C.orange} />
      </div>

      {/* 14-Day Chart */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 28 }}>
        <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: '0 0 24px' }}>Visitors — Last 14 Days</h4>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {dailyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ ...ff.body, fontSize: 9, color: C.faint }}>{d.count > 0 ? d.count : ''}</div>
              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.5s',
                height: `${Math.max((d.count / maxDaily) * 90, d.count > 0 ? 4 : 1)}px`,
                background: d.count > 0
                  ? `linear-gradient(180deg, ${C.gold}, rgba(255,215,0,0.4))`
                  : 'rgba(255,255,255,0.06)' }} />
              <div style={{ ...ff.body, fontSize: 9, color: C.faint, transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>
                {d.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Location breakdown */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: '0 0 18px' }}>🌍 Visitors by Location</h4>
          {loading ? (
            <div style={{ ...ff.body, color: C.dim, fontSize: 14 }}>Loading…</div>
          ) : locationGroups.length === 0 ? (
            <div style={{ ...ff.body, color: C.dim, fontSize: 14 }}>
              <p>No location data yet.</p>
              <p style={{ fontSize: 12 }}>Location is captured when visitors load the website. Make sure the website is tracking visits by calling the <code style={{ color: C.gold }}>trackVisit()</code> function with IP geolocation data.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {locationGroups.slice(0, 10).map((loc, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ ...ff.body, fontSize: 13, color: C.text }}>{loc.name}</span>
                    <span style={{ ...ff.body, fontSize: 12, color: C.dim }}>{loc.count} ({loc.pct}%)</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${loc.pct}%` }} transition={{ duration: 0.8 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, rgba(255,215,0,0.4))`, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent visits */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: '0 0 18px' }}>🕐 Recent Visits</h4>
          {loading ? (
            <div style={{ ...ff.body, color: C.dim, fontSize: 14 }}>Loading…</div>
          ) : recentVisits.length === 0 ? (
            <div style={{ ...ff.body, color: C.dim, fontSize: 14 }}>No visits recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {recentVisits.map((v, i) => {
                const meta = v.metadata || {};
                const location = [meta.city, meta.country || meta.country_name].filter(Boolean).join(', ') || 'Unknown location';
                const time = v.created_at ? new Date(v.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <div style={{ ...ff.body, fontSize: 12, color: C.text }}>
                        {meta.page || v.event_type || 'page_view'}
                      </div>
                      <div style={{ ...ff.body, fontSize: 11, color: C.dim }}>📍 {location}</div>
                    </div>
                    <div style={{ ...ff.body, fontSize: 10, color: C.faint, textAlign: 'right' }}>{time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SQL snippet for website tracking */}
      <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: 16, padding: 24 }}>
        <h4 style={{ ...ff.display, fontSize: 16, color: C.gold, margin: '0 0 12px' }}>📡 How to Track Visitors on Your Website</h4>
        <p style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.7, margin: '0 0 12px' }}>
          Add this code to your main website's <code style={{ color: C.text }}>App.jsx</code> (inside a <code style={{ color: C.text }}>useEffect</code> that runs once on load) to log each visitor with their location:
        </p>
        <pre style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 10,
          padding: 16, color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.8,
          overflowX: 'auto', whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>
{`// Paste in main website App.jsx — runs once on page load
useEffect(() => {
  const trackVisit = async () => {
    try {
      // Get visitor location via free IP geolocation API
      const geoRes = await fetch('https://ipapi.co/json/');
      const geo = await geoRes.json();
      
      // Log to Supabase analytics_events table
      await fetch(\`\${process.env.REACT_APP_SUPABASE_URL}/rest/v1/analytics_events\`, {
        method: 'POST',
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': \`Bearer \${process.env.REACT_APP_SUPABASE_ANON_KEY}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'page_view',
          metadata: {
            country: geo.country_name,
            city: geo.city,
            region: geo.region,
            ip: geo.ip,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            ua: navigator.userAgent.slice(0, 100),
          }
        })
      });
    } catch (_) {}  // Silent fail — never block the user
  };
  trackVisit();
}, []);`}
        </pre>
        <button onClick={() => navigator.clipboard.writeText(`useEffect(() => {
  const trackVisit = async () => {
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geo = await geoRes.json();
      await fetch(\`\${process.env.REACT_APP_SUPABASE_URL}/rest/v1/analytics_events\`, {
        method: 'POST',
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Authorization': \`Bearer \${process.env.REACT_APP_SUPABASE_ANON_KEY}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'page_view',
          metadata: {
            country: geo.country_name,
            city: geo.city,
            region: geo.region,
            ip: geo.ip,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
          }
        })
      });
    } catch (_) {}
  };
  trackVisit();
}, []);`)}
          style={{ padding: '8px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: 8,
            ...ff.body, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          📋 Copy Code
        </button>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={load}
          style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
          ↻ Refresh Data
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
    if (r?.ok) { show('Status updated ✓'); load(); }
    else show('Update failed', false);
  };

  const statusColor = (s) => ({
    pending: C.gold, new: C.gold, contacted: C.blue,
    in_progress: C.orange, completed: C.green, rejected: C.red,
  }[s] || C.dim);

  return (
    <div>
      {Toast}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ ...ff.display, fontSize: 22, color: C.text, margin: 0 }}>Commission Inquiries</h3>
          <p style={{ ...ff.body, fontSize: 13, color: C.dim, margin: '4px 0 0' }}>
            {inquiries.length} total · {inquiries.filter(i => ['pending','new'].includes(i.status)).length} pending
          </p>
        </div>
        <button onClick={load}
          style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim,
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>Loading inquiries…</div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.dim, ...ff.body }}>
          No inquiries yet. When a customer submits the commission form on the website, it will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inquiries.map(iq => (
            <motion.div key={iq.id} layout
              style={{ background: C.surface, border: `1px solid ${selected === iq.id ? C.borderGold : C.border}`,
                borderRadius: 14, padding: 20, cursor: 'pointer' }}
              onClick={() => setSelected(selected === iq.id ? null : iq.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ ...ff.body, fontSize: 16, color: C.text, fontWeight: 600 }}>{iq.full_name || 'Unknown'}</div>
                  <div style={{ ...ff.body, fontSize: 13, color: C.dim, marginTop: 2 }}>
                    {iq.phone}{iq.email ? ` · ${iq.email}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20,
                    border: `1px solid ${statusColor(iq.status)}`, color: statusColor(iq.status),
                    ...ff.body, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {iq.status || 'pending'}
                  </div>
                  <div style={{ ...ff.body, fontSize: 11, color: C.faint }}>
                    {iq.created_at ? new Date(iq.created_at).toLocaleDateString('en-IN') : ''}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {selected === iq.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 16, marginTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
                        {[
                          ['Type', iq.artwork_type || iq.notes || '—'],
                          ['Metal', iq.preferred_metal || '—'],
                          ['Budget', iq.budget || '—'],
                          ['Timeline', iq.timeline || '—'],
                          ['WhatsApp', iq.whatsapp || iq.phone || '—'],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div style={{ ...ff.body, fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{k}</div>
                            <div style={{ ...ff.body, fontSize: 14, color: C.text }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {iq.description && (
                        <div style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.7,
                          padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 16 }}>
                          {iq.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <select value={iq.status || 'pending'}
                          onChange={e => updateStatus(iq.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ padding: '8px 12px', background: '#111', border: `1px solid ${C.border}`,
                            borderRadius: 8, color: C.text, ...ff.body, fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                          {['pending','new','contacted','in_progress','completed','rejected'].map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                          ))}
                        </select>
                        {(iq.whatsapp || iq.phone) && (
                          <button onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${(iq.whatsapp || iq.phone).replace(/[^0-9]/g, '')}`, '_blank'); }}
                            style={{ padding: '8px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...ff.body, fontSize: 13, fontWeight: 600 }}>
                            💬 WhatsApp
                          </button>
                        )}
                        {iq.email && (
                          <button onClick={e => { e.stopPropagation(); window.open(`mailto:${iq.email}`, '_blank'); }}
                            style={{ padding: '8px 16px', background: 'transparent', color: C.gold,
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
        sbFetch('/analytics_events?select=id,created_at', 'GET', null, {}),
      ]);
      const getCount = (r) => parseInt((r?.headers?.get?.('content-range') || '0/0').split('/')[1], 10) || 0;
      const inqData = inqRes?.data || [];
      const allVisits = visitorRes?.data || [];
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayV = allVisits.filter(e => e.created_at?.startsWith(todayStr)).length;
      setStats({
        artworks:      getCount(artRes),
        inquiries:     inqData.filter(i => ['pending', 'new'].includes(i.status)).length,
        visitors:      allVisits.length,
        todayVisitors: todayV,
      });
      setRecentInquiries(inqData.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 36 }}>
        <StatCard icon="🖼️" label="Total Artworks"   value={loading ? '—' : stats.artworks}      sub="In gallery database" accent />
        <StatCard icon="💬" label="New Inquiries"     value={loading ? '—' : stats.inquiries}     sub="Pending response" color={C.orange} />
        <StatCard icon="👥" label="Total Visitors"    value={loading ? '—' : stats.visitors}      sub="All time" color={C.blue} />
        <StatCard icon="📅" label="Visitors Today"    value={loading ? '—' : stats.todayVisitors} sub="Today's visits" color={C.green} />
      </div>

      {recentInquiries.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h4 style={{ ...ff.display, fontSize: 18, color: C.text, margin: '0 0 20px' }}>Recent Inquiries</h4>
          {recentInquiries.map(iq => (
            <div key={iq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
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
const SettingsTab = () => {
  const schemaSQL = `-- Run in Supabase SQL Editor → New Query
-- Add description column if not exists (for captions shown on website)
ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add missing inquiry columns
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS artwork_type TEXT,
  ADD COLUMN IF NOT EXISTS preferred_metal TEXT,
  ADD COLUMN IF NOT EXISTS budget TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reference_images TEXT[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes TEXT;`;

  const adminSQL = `UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-admin@email.com'
);`;

  const storageSQL = `-- Create the gallery-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admin upload
CREATE POLICY "Admin can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

-- Allow public read
CREATE POLICY "Public read gallery" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');`;

  const CopyBlock = ({ label, code }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: 0 }}>{label}</h4>
        <button onClick={() => navigator.clipboard.writeText(code)}
          style={{ padding: '6px 14px', background: C.gold, color: '#000', border: 'none', borderRadius: 6,
            ...ff.body, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          📋 Copy
        </button>
      </div>
      <pre style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 10,
        padding: 16, color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.8,
        overflowX: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>{code}</pre>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderGold}`, borderRadius: 16, padding: 24 }}>
        <h4 style={{ ...ff.display, fontSize: 18, color: C.gold, margin: '0 0 12px' }}>ℹ️ How Gallery Sync Works</h4>
        <div style={{ ...ff.body, fontSize: 14, color: C.dim, lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 8px' }}>1. Upload a photo in <strong style={{ color: C.text }}>Gallery → Upload Photo</strong></p>
          <p style={{ margin: '0 0 8px' }}>2. Image is stored in Supabase Storage → URL + caption saved to <code>gallery_items</code> table</p>
          <p style={{ margin: '0 0 8px' }}>3. The main website fetches <code>gallery_items</code> on every load → photo appears <strong style={{ color: C.green }}>instantly</strong></p>
          <p style={{ margin: '0 0 8px' }}>4. Edit captions anytime in Gallery → ✏️ Edit → changes reflect on website in real-time</p>
          <p style={{ margin: 0 }}>5. Delete a photo here → removed from website and storage permanently</p>
        </div>
      </div>
      <CopyBlock label="📋 Add description column to gallery_items" code={schemaSQL} />
      <CopyBlock label="🗃️ Set up gallery-images Storage Bucket" code={storageSQL} />
      <CopyBlock label="🔐 Grant Admin Role" code={adminSQL} />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: '0 0 12px' }}>🔌 Connection Status</h4>
        <div style={{ ...ff.body, fontSize: 14, color: C.dim, lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 4px' }}>Supabase URL: <code style={{ color: SB_URL ? C.green : C.red }}>{SB_URL || 'NOT SET'}</code></p>
          <p style={{ margin: 0 }}>Anon Key: <code style={{ color: SB_KEY ? C.green : C.red }}>{SB_KEY ? '✓ set' : 'NOT SET'}</code></p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD SHELL
═══════════════════════════════════════════════════════════════ */
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const tabs = [
    { id: 'Dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'Gallery',   icon: '🖼️', label: 'Gallery' },
    { id: 'Visitors',  icon: '👥', label: 'Visitors' },
    { id: 'Inquiries', icon: '💬', label: 'Inquiries' },
    { id: 'Settings',  icon: '⚙️', label: 'Settings' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardTab />;
      case 'Gallery':   return <GalleryTab />;
      case 'Visitors':  return <VisitorsTab />;
      case 'Inquiries': return <InquiriesTab />;
      case 'Settings':  return <SettingsTab />;
      default:          return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: C.bg2, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '28px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>⚒️</div>
          <h2 style={{ ...ff.display, color: C.gold, margin: 0, fontSize: 17, letterSpacing: '0.05em' }}>Studio Admin</h2>
          <div style={{ ...ff.body, fontSize: 12, color: C.dim, marginTop: 3 }}>Vijay Metal Works</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: '100%', textAlign: 'left', padding: '11px 16px',
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

        <div style={{ padding: '16px 12px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ ...ff.body, fontSize: 12, color: C.faint, padding: '0 8px 12px', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <button onClick={onLogout}
            style={{ width: '100%', textAlign: 'left', padding: '11px 16px', background: 'transparent',
              border: 'none', color: C.red, ...ff.body, fontSize: 14, cursor: 'pointer',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', maxWidth: 'calc(100vw - 240px)', boxSizing: 'border-box' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <h1 style={{ ...ff.display, fontSize: 28, color: C.text, margin: '0 0 32px' }}>
              {tabs.find(t => t.id === activeTab)?.icon} {activeTab}
            </h1>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  injectFonts();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem('vmw_admin_session');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed?.user && parsed?.access_token) {
          const expiresAt = parsed.expires_at;
          if (!expiresAt || Date.now() / 1000 < expiresAt) {
            setUser(parsed.user);
          } else {
            localStorage.removeItem('vmw_admin_session');
          }
        }
      }
    } catch (_) {
      localStorage.removeItem('vmw_admin_session');
    }
  }, []);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('vmw_admin_session'); setUser(null); };

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
