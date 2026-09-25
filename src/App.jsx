import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SEOMeta from './components/common/SEOMeta';
import Loader from './components/common/Loader';
import CanvasBg from './components/common/CanvasBg';
import Grain from './components/common/Grain';
import ErrorBoundary from './components/common/ErrorBoundary';
import ImageProtection from './components/common/ImageProtection';
import CommissionModal from './components/commission/CommissionModal';
import AuthModal from './components/auth/AuthModal';

import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CopyrightPage from './pages/CopyrightPage';
import ImmersiveFeed from './components/gallery/ImmersiveFeed';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import NotFoundPage from './pages/NotFoundPage';

import { ThemeCtx, useThemeMode } from './hooks/useTheme';
import { AppCtx } from './hooks/useApp';
import { SiteImagesProvider } from './hooks/useSiteImages';
import { buildCSS, PREMIUM_BTN_CSS } from './styles/globalStyles';

function AppContent() {
  const { C: themeC } = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // -- Visitor tracking: one event per route per browser session --
  useEffect(() => {
    const trackVisit = async () => {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      const pageKey = `vmw_page_view:${window.location.pathname}`;
      if (sessionStorage.getItem(pageKey)) return;
      sessionStorage.setItem(pageKey, '1');
      const sessionKey = 'vmw_analytics_session_id';
      let analyticsSessionId = sessionStorage.getItem(sessionKey);
      if (!analyticsSessionId) {
        analyticsSessionId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(sessionKey, analyticsSessionId);
      }
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'page_view',
            metadata: {
              session_id: analyticsSessionId,
              page: window.location.pathname,
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              timezone,
              referrer: document.referrer || 'direct',
              ua: navigator.userAgent ? navigator.userAgent.slice(0, 120) : '',
            }
          })
        });
      } catch (_) { /* silent fallback */ }
    };
    trackVisit();
  }, []);

  useEffect(() => {
    const sessionStr = localStorage.getItem('vmw_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.user && session.access_token) {
          const expiresAt = session.expires_at;
          if (!expiresAt || Date.now() / 1000 < expiresAt) {
            setIsLoggedIn(true);
            setUser(session.user);
          } else {
            localStorage.removeItem('vmw_session');
          }
        }
      } catch (err) {
        console.error('Session restore failed', err);
        localStorage.removeItem('vmw_session');
      }
    }
  }, []);

  const done = useCallback(() => setLoading(false), []);

  // Dynamic CSS injection on theme change
  useEffect(() => {
    let el = document.getElementById('vmw-theme-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'vmw-theme-css';
      document.head.appendChild(el);
    }
    el.textContent = buildCSS(themeC);

    if (!document.getElementById('vmw-btn-css')) {
      const btnEl = document.createElement('style');
      btnEl.id = 'vmw-btn-css';
      document.head.appendChild(btnEl);
    }
    document.getElementById('vmw-btn-css').textContent = PREMIUM_BTN_CSS(themeC);
  }, [themeC]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 65);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <ThemeCtx.Provider value={themeC}>
      <SiteImagesProvider>
        <AppCtx.Provider value={{
        showCommissionModal,
        setShowCommissionModal,
        showAuthModal,
        setShowAuthModal,
        authAction,
        setAuthAction,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser
        }}>
        <SEOMeta />
        <div style={{
          background: themeC.bg1,
          color: themeC.text,
          overflowX: 'hidden',
          minHeight: '100vh',
          transition: 'background .35s, color .35s'
        }}>
          <AnimatePresence mode="wait">
            {loading && <Loader key="loader" onDone={done} />}
          </AnimatePresence>
          {!loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5 }}>
              <ImageProtection />
              <CanvasBg />
              <Grain />
              <Routes>
                <Route path="/" element={<HomePage scrolled={scrolled} />} />
                <Route path="/gallery" element={<GalleryPage scrolled={scrolled} />} />
                <Route path="/gallery/immersive" element={<ImmersiveFeed />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                <Route path="/copyright" element={<CopyrightPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          )}
          <AnimatePresence>
            {showCommissionModal && <CommissionModal onClose={() => setShowCommissionModal(false)} C={themeC} />}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} action={authAction} />}
          </AnimatePresence>
        </div>
        </AppCtx.Provider>
      </SiteImagesProvider>
    </ThemeCtx.Provider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
