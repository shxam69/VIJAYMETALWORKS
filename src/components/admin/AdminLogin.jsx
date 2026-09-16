import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const AdminLogin = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError('Authentication service is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || 'Authentication failed');

      // Check role via profiles table
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${data.user.id}&select=role`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${data.access_token}` }
      });
      const profiles = await profileRes.json();
      const role = profiles?.[0]?.role;
      if (role !== 'admin') throw new Error('You do not have admin access. Ask the owner to grant your account the admin role.');

      localStorage.setItem('vmw_session', JSON.stringify(data));
      localStorage.setItem('vmw_admin_auth', 'true');
      navigate('/admin');
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg1 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400, background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", color: C.gold, fontSize: 24, margin: '0 0 8px 0' }}>Admin Gateway</h1>
          <p style={{ fontFamily: "'Jost', sans-serif", color: C.dim, fontSize: 14, margin: 0 }}>Secure access for authorized personnel only.</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ color: '#ff4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          <input type="email" required placeholder="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif" }}/>
          <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif" }}/>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ padding: '16px', background: loading ? 'rgba(255,215,0,0.5)' : C.gold, color: '#000', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontWeight: 700, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};


export default AdminLogin;
