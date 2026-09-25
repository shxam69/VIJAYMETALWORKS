import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ff } from '../styles/fonts';

const NotFoundPage = () => {
  const C = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 — Page Not Found | Vijay Metal Works';
  }, []);

  return (
    <div
      style={{
        background: C.bg1,
        color: C.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <h1
        style={{
          ...ff.display,
          fontSize: 'clamp(80px, 15vw, 150px)',
          color: C.gold,
          margin: 0,
          lineHeight: 1,
          letterSpacing: '.05em',
          filter: `drop-shadow(0 0 20px ${C.gold}33)`,
        }}
      >
        404
      </h1>
      <h2
        style={{
          ...ff.display,
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: C.text,
          margin: '24px 0 16px',
          letterSpacing: '.02em',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          ...ff.body,
          fontSize: 'clamp(14px, 1.5vw, 16px)',
          color: C.dim,
          margin: '0 0 40px',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'transparent',
          border: `1px solid ${C.gold}`,
          color: C.gold,
          padding: '16px 32px',
          ...ff.body,
          fontSize: 14,
          letterSpacing: '.15em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.gold;
          e.currentTarget.style.color = '#000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = C.gold;
        }}
      >
        Return Home
      </button>
    </div>
  );
};

export default NotFoundPage;
