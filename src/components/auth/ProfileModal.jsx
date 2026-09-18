import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { getUserState } from '../../lib/supabase';

const ProfileModal = ({ onClose, C }) => {
  const { user, setIsLoggedIn, setUser, setShowAuthModal } = useAppCtx();
  const [activeTab, setActiveTab] = useState('Saved');
  const tabs = ['Saved', 'Liked', 'Collections'];
  
  const isGuest = !user;
  const username = user?.email?.split('@')[0] || 'Guest Collector';
  const avatar = user?.user_metadata?.avatar_url || (isGuest ? '/gallery/gold/crown.jpg' : `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'fixed',inset:0,zIndex:3000,background:C.isDark?'rgba(0,0,0,0.92)':'rgba(255,255,255,0.92)',backdropFilter:'blur(24px)',display:'flex',justifyContent:'center',alignItems:'center',padding:20}}
      onClick={onClose}>
      <motion.div initial={{scale:0.97,y:20,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0.97,y:10,opacity:0}}
        onClick={e=>e.stopPropagation()}
        style={{width:'100%',maxWidth:800,maxHeight:'90vh',display:'flex',flexDirection:'column',background:C.bg1,border:`1px solid ${C.border}`,borderRadius:24,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.8)'}}>
        
        {/* Profile Header */}
        <div style={{padding:'40px 48px',display:'flex',alignItems:'center',gap:32,borderBottom:`1px solid ${C.border}`,position:'relative', flexWrap:'wrap'}}>
          <button onClick={onClose} style={{position:'absolute',top:24,right:24,background:'none',border:'none',color:C.dim,fontSize:24,cursor:'pointer'}}>×</button>
          
          <div style={{position:'relative',width:110,height:110,flexShrink:0}}>
            <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:C.goldGrad,animation:'starBorderSpin 8s linear infinite'}}/>
            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:C.bg1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,border:`4px solid ${C.bg1}`}}>
              <img src={avatar} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt="Avatar" />
            </div>
          </div>
          
          <div style={{flex:1, minWidth:200}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:12, flexWrap:'wrap'}}>
              <h2 style={{...ff.display,fontSize:28,color:C.text,margin:0}}>{username}</h2>
              <button style={{padding:'6px 16px',background:'transparent',border:`1px solid ${C.borderHi}`,color:C.text,borderRadius:4,...ff.body,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={() => { if(isGuest) { setShowAuthModal(true); onClose(); } }}>{isGuest ? 'Sign In' : 'Edit Profile'}</button>
              {!isGuest && <button style={{padding:'6px 16px',background:'transparent',border:'1px solid rgba(255,80,80,0.4)',color:'rgba(255,100,100,0.9)',borderRadius:4,...ff.body,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={() => { localStorage.removeItem('vmw_session'); setIsLoggedIn(false); setUser(null); onClose(); }}>Sign Out</button>}
            </div>
            
            <div style={{display:'flex',gap:24,marginBottom:16,...ff.body,fontSize:14}}>
              {(() => {
                const us = getUserState();
                const likedCount = Object.values(us.likes).filter(Boolean).length;
                const savedCount = Object.values(us.saves).filter(Boolean).length;
                return (<>
                  <div><strong style={{color:C.text}}>0</strong> <span style={{color:C.dim}}>posts</span></div>
                  <div><strong style={{color:C.text}}>{savedCount}</strong> <span style={{color:C.dim}}>saved</span></div>
                  <div><strong style={{color:C.text}}>{likedCount}</strong> <span style={{color:C.dim}}>liked</span></div>
                </>);
              })()}
            </div>
            
            <div style={{...ff.body,fontSize:14,color:C.text}}>
              <div style={{fontWeight:600,marginBottom:2}}>Sacred Art Enthusiast</div>
              <div style={{color:C.dim,maxWidth:300}}>Curating fine handcrafted temple metalworks. Chennai, India.</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',justifyContent:'center',borderBottom:`1px solid ${C.border}`,gap:48}}>
          {tabs.map((tab)=>(
            <div key={tab} onClick={() => setActiveTab(tab)}
              style={{padding:'16px 0',...ff.body,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:activeTab===tab?700:500,color:activeTab===tab?C.gold:C.dim,borderTop:activeTab===tab?`1px solid ${C.gold}`:'1px solid transparent',cursor:'pointer',position:'relative',top:-1}}>
              {tab}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{flex:1,overflowY:'auto',padding:24,background:C.bg2,minHeight:300}}>
          {(() => {
            const userState = getUserState();
            const likedGids = Object.entries(userState.likes).filter(([,v])=>v).map(([k])=>k);
            const savedGids = Object.entries(userState.saves).filter(([,v])=>v).map(([k])=>k);
            
            let displayItems = [];
            if (activeTab === 'Liked') {
              displayItems = GALLERY_IDOLS.filter(i => likedGids.includes(i.gid));
            } else if (activeTab === 'Saved') {
              displayItems = GALLERY_IDOLS.filter(i => savedGids.includes(i.gid));
            }

            if (displayItems.length === 0) {
              return (
                <div style={{textAlign:'center',padding:'60px 0',color:C.faint,...ff.serif,fontSize:18,fontStyle:'italic'}}>
                  {activeTab === 'Liked' ? 'No liked pieces yet. Tap ❤️ on any gallery item.' : activeTab === 'Saved' ? 'No saved pieces yet. Sign in and tap 📌 to save.' : 'Collections coming soon.'}
                </div>
              );
            }

            return (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
                {displayItems.map(idol => (
                  <div key={idol.gid} style={{aspectRatio:'1/1',overflow:'hidden',borderRadius:8,border:`1px solid ${C.border}`,position:'relative',cursor:'pointer'}}>
                    <img src={idol.img} alt={idol.deity} style={{width:'100%',height:'100%',objectFit:'cover',filter:'sepia(8%)'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)',display:'flex',alignItems:'flex-end',padding:'10px 12px'}}>
                      <div style={{...ff.body,fontSize:11,color:'#fff',fontWeight:600,lineHeight:1.3}}>{idol.deity}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );
};


export default ProfileModal;
