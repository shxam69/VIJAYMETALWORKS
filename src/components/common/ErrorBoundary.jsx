import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('VMW App Error:', error, info); }
  render() {
    if (this.state.hasError) {
      const bgColor = document.documentElement.dataset.theme === 'light' ? '#F5F0E8' : '#080604';
      const textColor = document.documentElement.dataset.theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
      return (
        <div style={{ minHeight:'100vh', background:bgColor, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', fontFamily:'Jost,sans-serif', color:textColor }}>
          <div style={{ fontSize:48, marginBottom:24 }}>⚠️</div>
          <h2 style={{ fontFamily:'Cinzel,serif', color:'#FFD700', fontSize:28, marginBottom:12 }}>Something went wrong</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', maxWidth:480, lineHeight:1.6, marginBottom:28 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload(); }}
            style={{ background:'#FFD700', color:'#000', border:'none', padding:'14px 32px', borderRadius:999, fontFamily:'Jost,sans-serif', fontWeight:700, fontSize:13, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
