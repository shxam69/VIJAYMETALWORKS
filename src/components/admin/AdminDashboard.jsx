import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import AdminGalleryManager from './AdminGalleryManager';

const AdminDashboard = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAuth, setIsAuth] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ artworks: 0, inquiries: 0, users: 0, views: 0 });
  const [loading, setLoading] = useState(false);
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  const fetchAdminData = useCallback(async () => {
    if(!supabaseUrl || !supabaseKey) return;
    try {
      setLoading(true);
      // Use session token if available for admin-level access
      let authToken = supabaseKey;
      try {
        const sess = localStorage.getItem('vmw_session');
        if (sess) { const p = JSON.parse(sess); if (p?.access_token) authToken = p.access_token; }
      } catch(_) {}
      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}`, 'Prefer': 'count=exact', 'Range': '0-0' };
      const headersNoCount = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}` };
      const [inqRes, artRes, userRes, viewRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/inquiries?select=*&order=created_at.desc`, { headers: headersNoCount }),
        fetch(`${supabaseUrl}/rest/v1/gallery_items?select=id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/analytics_events?event_type=eq.page_view&select=id`, { headers }),
      ]);
      const inqData = inqRes.ok ? await inqRes.json() : [];
      const artCount = parseInt((artRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      const userCount = parseInt((userRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      const viewCount = parseInt((viewRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      setInquiries(inqData);
      setStats({
        artworks: artCount,
        inquiries: inqData.filter(i => ['pending','new'].includes(i.status)).length || 0,
        users: userCount,
        views: viewCount,
      });
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabaseUrl, supabaseKey]);

  const updateInquiryStatus = async (id, newStatus) => {
    if(!supabaseUrl || !supabaseKey) return;
    try {
      let authToken = supabaseKey;
      try { const sess = localStorage.getItem('vmw_session'); if(sess){const p=JSON.parse(sess);if(p?.access_token)authToken=p.access_token;} } catch(_){}
      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' };
      await fetch(`${supabaseUrl}/rest/v1/inquiries?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) });
      fetchAdminData();
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('vmw_admin_auth');
    if(!auth) {
      navigate('/admin/login');
    } else {
      setIsAuth(true);
      fetchAdminData();
    }
  }, [navigate, fetchAdminData]);

  if(!isAuth) return null;

  const tabs = ['Dashboard', 'Gallery', 'Inquiries', 'Users', 'Collections', 'Comments', 'Analytics', 'Settings'];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Dashboard':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { label: 'Total Artworks', value: loading ? '-' : stats.artworks, icon: '🖼️' },
              { label: 'Pending Inquiries', value: loading ? '-' : stats.inquiries, icon: '💬' },
              { label: 'Total Users', value: loading ? '-' : stats.users, icon: '👥' },
              { label: 'Total Views', value: loading ? '-' : stats.views, icon: '👁️' }
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{stat.icon}</div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, color: C.text, marginTop: 8 }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        );
      case 'Inquiries':
        return (
          <div style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: C.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(100,70,20,0.05)' }}>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Client</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Artwork</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Budget</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: C.dim }}>Loading inquiries...</td></tr>
                ) : inquiries.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: C.dim }}>No inquiries found.</td></tr>
                ) : inquiries.map((iq) => (
                  <tr key={iq.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 500 }}>
                      {iq.full_name}<br/>
                      <span style={{ fontSize: 12, color: C.dim, fontWeight: 400 }}>{iq.phone}</span>
                    </td>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14 }}>
                      {iq.artwork_type}<br/>
                      <span style={{ fontSize: 12, color: C.dim }}>{iq.preferred_metal}</span>
                    </td>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14 }}>{iq.budget || 'Unspecified'}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <select 
                        value={iq.status} 
                        onChange={(e) => updateInquiryStatus(iq.id, e.target.value)}
                        style={{ padding: '4px 8px', background: iq.status === 'pending' ? 'rgba(255,215,0,0.1)' : 'rgba(0,255,100,0.1)', border: `1px solid ${iq.status === 'pending' ? C.gold : '#00ff64'}`, color: iq.status === 'pending' ? C.gold : '#00ff64', borderRadius: 4, fontSize: 12, outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="pending" style={{background: C.bg2, color: C.text}}>Pending (New)</option>
                        <option value="new" style={{background: C.bg2, color: C.text}}>New</option>
                        <option value="contacted" style={{background: C.bg2, color: C.text}}>Contacted</option>
                        <option value="in_progress" style={{background: C.bg2, color: C.text}}>In Progress</option>
                        <option value="completed" style={{background: C.bg2, color: C.text}}>Completed</option>
                        <option value="rejected" style={{background: C.bg2, color: C.text}}>Rejected</option>
                      </select>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button onClick={() => window.open(`https://wa.me/${iq.whatsapp || iq.phone.replace(/[^0-9]/g, '')}`, '_blank')} style={{ background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 12 }}>WhatsApp</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'Gallery':
        return <AdminGalleryManager C={C} supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} onRefreshStats={fetchAdminData} />;
      default:
        return <div style={{ color: C.dim }}>{activeTab} module under development.</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg1 }}>
      <div style={{ width: 280, borderRight: `1px solid ${C.border}`, background: C.surfaceWarm, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: C.gold, margin: 0, fontSize: 20 }}>Studio Admin</h2>
          <div style={{ fontSize: 12, color: C.dim, fontFamily: "'Jost', sans-serif", marginTop: 4 }}>Vijay Metal Works</div>
        </div>
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: activeTab === tab ? (C.isDark ? 'rgba(255,215,0,0.1)' : 'rgba(184,134,11,0.12)') : 'transparent', border: 'none', borderRadius: 8, color: activeTab === tab ? C.gold : C.text, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ padding: 24, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { localStorage.removeItem('vmw_admin_auth'); localStorage.removeItem('vmw_session'); navigate('/admin/login'); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#ff4444', fontFamily: "'Jost', sans-serif", fontSize: 15, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: C.text, margin: '0 0 32px 0' }}>{activeTab}</h1>
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};


export default AdminDashboard;
