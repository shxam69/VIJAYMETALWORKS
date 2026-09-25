import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { FadeIn } from '../common/Animations';

const Footer = () => {
  const C = useTheme();

  return (
    <footer
      className="vmw-footer"
      style={{
        position: 'relative',
        zIndex: 2,
        background: C.bg1,
        borderTop: `1px solid ${C.border}`,
        textAlign: 'center',
      }}
    >
      <FadeIn duration={0.9}>
        <div
          className="vmw-container"
          style={{
            paddingTop: 'clamp(40px, 5vw, 64px)',
            paddingBottom: 'clamp(36px, 4vw, 56px)',
          }}
        >
          {/* Emblem */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="44" height="44" viewBox="0 0 40 40">
              <rect
                x="4"
                y="4"
                width="32"
                height="32"
                rx="2"
                fill="none"
                stroke={C.gold}
                strokeWidth="1.2"
                transform="rotate(45 20 20)"
                style={{ filter: `drop-shadow(0 0 6px ${C.gold}33)` }}
              />
              <text
                x="20"
                y="26"
                textAnchor="middle"
                fontFamily="'Cinzel',serif"
                fontSize="14"
                fontWeight="700"
                fill={C.gold}
              >
                V
              </text>
            </svg>
          </div>

          {/* Heading */}
          <h3
            style={{
              ...ff.display,
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              letterSpacing: '.28em',
              color: C.text,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            VIJAY METAL WORKS
          </h3>

          {/* Subtitle */}
          <p
            style={{
              ...ff.serif,
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              color: C.dim,
              fontStyle: 'italic',
              marginBottom: 16,
            }}
          >
            Temple Metal Craftsmanship Since 1915
          </p>

          {/* Contact Line */}
          <p
            style={{
              ...ff.body,
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              color: C.dim,
              letterSpacing: '.06em',
              marginBottom: 20,
            }}
          >
            Sowcarpet, Chennai · <a href="tel:+919382877351" style={{ color: C.dim, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}>93828 77351</a> · <a href="mailto:vijaymetalworks4u@gmail.com" style={{ color: C.dim, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}>vijaymetalworks4u@gmail.com</a>
          </p>

          {/* Legal Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Link
              to="/privacy-policy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              style={{
                ...ff.body,
                fontSize: 'clamp(9.5px, 1vw, 11px)',
                color: C.dim,
                textDecoration: 'none',
                letterSpacing: '.08em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
            >
              Privacy Policy
            </Link>
            <span style={{ color: C.faint, fontSize: 10 }}>·</span>
            <Link
              to="/copyright"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              style={{
                ...ff.body,
                fontSize: 'clamp(9.5px, 1vw, 11px)',
                color: C.dim,
                textDecoration: 'none',
                letterSpacing: '.08em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
            >
              Copyright
            </Link>
          </div>

          {/* Copyright */}
          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: 16,
              maxWidth: 420,
              margin: '0 auto',
              ...ff.body,
              fontSize: 10,
              color: C.faint,
              letterSpacing: '.1em',
              lineHeight: 1.8,
            }}
          >
            © {new Date().getFullYear()} Vijay Metal Works. All rights reserved.
          </div>
        </div>
      </FadeIn>
    </footer>
  );
};

export default Footer;
