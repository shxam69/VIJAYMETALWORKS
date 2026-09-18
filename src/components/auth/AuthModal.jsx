import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppCtx } from '../../hooks/useApp';
import { useTheme } from '../../hooks/useTheme';

const AuthModal = ({ onClose, action }) => {
  const C = useTheme();
  const { setIsLoggedIn, setUser } = useAppCtx();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!email || !password) return;
    
    setLoading(true);
    setError('');
    
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if(supabaseUrl && supabaseKey) {
      try {
        const endpoint = isLogin ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';
        const res = await fetch(`${supabaseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error_description || data.msg || 'Authentication failed');
        
        localStorage.setItem('vmw_session', JSON.stringify(data));
        setIsLoggedIn(true);
        if(setUser) setUser(data.user);
        onClose();
      } catch(err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Mock fallback
      setTimeout(() => {
        setIsLoggedIn(true);
        onClose();
      }, 1000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 3000, background: C.isDark ? 'rgba(0,0,0,0.92)' : 'rgba(100,70,20,0.3)', backdropFilter: 'blur(30px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(400px, 100vw)', border: `1px solid ${C.borderGold}`, background: C.isDark ? 'linear-gradient(180deg, rgba(20,16,10,0.98) 0%, rgba(10,8,6,0.98) 100%)' : 'linear-gradient(180deg, rgba(252,247,240,0.99) 0%, rgba(242,235,222,0.99) 100%)', borderRadius: 24, overflow: 'hidden', boxShadow: C.shadow }}
      >
        <div style={{ padding: '40px 32px 20px', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', color: C.dim, width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <div style={{ fontSize: 42, marginBottom: 16, filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.4))' }}>✨</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: 'rgba(255,215,0,0.95)', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </h3>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.5 }}>
            {isLogin ? 'Welcome back to the archive.' : 'Join to curate your personal collection.'}
          </p>
        </div>
        <div style={{ padding: '0 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div style={{ color: '#ff4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <input type="email" required placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: '14px 20px', background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '14px 20px', background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <motion.button disabled={loading} whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }} type="submit" style={{ width: '100%', padding: '16px 24px', background: loading ? 'rgba(255,215,0,0.5)' : 'linear-gradient(135deg, rgba(255,215,0,0.9) 0%, rgba(200,150,0,1) 100%)', color: '#000', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>
          
          <div style={{ textAlign: 'center', fontSize: 12, fontFamily: "'Jost', sans-serif", color: C.dim, cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', opacity: 0.3 }}>
            <div style={{ flex: 1, height: 1, background: C.border }}></div>
            <div style={{ padding: '0 16px', fontSize: 12, fontFamily: "'Jost', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</div>
            <div style={{ flex: 1, height: 1, background: C.border }}></div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.9)' }} whileTap={{ scale: 0.98 }}
            onClick={() => { alert('Google sign-in is coming soon. Please use email/password for now.'); }}
            style={{ width: '100%', padding: '14px 24px', background: 'rgba(255,255,255,0.85)', color: '#555', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', opacity: 0.7 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google (Coming Soon)
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setIsLoggedIn(false); onClose(); }}
            style={{ width: '100%', padding: '14px 24px', background: 'transparent', color: 'rgba(255,215,0,0.8)', border: '1px dashed rgba(255,215,0,0.3)', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Continue as Guest
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   ADMIN LOGIN
═══════════════════════════════════════════════════════════════ */

export default AuthModal;
