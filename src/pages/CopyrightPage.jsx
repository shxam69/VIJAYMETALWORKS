import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ff } from '../styles/fonts';
import { BIZ } from '../data/biz';
import Footer from '../components/footer/Footer';

const CopyrightPage = () => {
  const C = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = 'Copyright | Vijay Metal Works';
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Copyright information for Vijay Metal Works — intellectual property, image rights, and content usage.');
  }, []);

  const sectionHeadingStyle = {
    ...ff.display,
    fontSize: 'clamp(18px, 2.2vw, 22px)',
    color: C.gold,
    letterSpacing: '.03em',
    fontWeight: 600,
    marginTop: 36,
    marginBottom: 12,
  };

  const paragraphStyle = {
    ...ff.body,
    fontSize: 'clamp(13px, 1.2vw, 14.5px)',
    color: C.dim,
    lineHeight: 1.85,
    marginBottom: 16,
  };

  return (
    <div style={{ background: C.bg1, color: C.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar Navigation */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: '18px 24px',
          background: C.bg2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              ...ff.display,
              fontSize: 14,
              letterSpacing: '.2em',
              color: C.text,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            VIJAY METAL WORKS
          </Link>
          <Link
            to="/"
            style={{
              ...ff.body,
              fontSize: 11,
              letterSpacing: '.12em',
              color: C.gold,
              textDecoration: 'none',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            ← Return to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'clamp(48px, 6vw, 80px) clamp(20px, 4vw, 32px)' }}>
        <article style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ marginBottom: 40, borderBottom: `1px solid ${C.border}`, paddingBottom: 28 }}>
            <span
              style={{
                ...ff.body,
                fontSize: 9,
                letterSpacing: '.4em',
                color: C.gold,
                textTransform: 'uppercase',
                fontWeight: 600,
                display: 'block',
                marginBottom: 10,
              }}
            >
              INTELLECTUAL PROPERTY NOTICE
            </span>
            <h1
              style={{
                ...ff.display,
                fontSize: 'clamp(28px, 4.5vw, 44px)',
                color: C.text,
                letterSpacing: '.02em',
                lineHeight: 1.15,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Copyright Notice
            </h1>
            <p style={{ ...ff.serif, fontSize: 14, color: C.dim, fontStyle: 'italic' }}>
              © 2026 Vijay Metal Works. All rights reserved.
            </p>
          </div>

          <h2 style={sectionHeadingStyle}>1. Ownership of Original Materials</h2>
          <p style={paragraphStyle}>
            Unless otherwise credited, all original content published on this website—including written text, editorial
            narratives, photographs and workshop images (where owned or commissioned by Vijay Metal Works), graphical marks,
            custom iconography, branding elements, software code, and visual interface designs—is protected under applicable
            copyright and intellectual property laws.
          </p>
          <p style={paragraphStyle}>
            No portion of this website&apos;s original text, photographic archive, or bespoke artwork may be copied, reproduced,
            republished, broadcast, or distributed for commercial purposes without prior written authorization from Vijay Metal Works.
          </p>

          <h2 style={sectionHeadingStyle}>2. Temple Iconography &amp; Traditional Artistry</h2>
          <p style={paragraphStyle}>
            The sacred iconographic designs, deity postures, canonical measurements (Tala systems), and Agamic forms represented
            in our temple metalwork belong to the timeless heritage of traditional Indian temple craftsmanship. Vijay Metal Works
            claims copyright in its bespoke artistic execution, photographic documentation, and unique workshop creations.
          </p>

          <h2 style={sectionHeadingStyle}>3. Third-Party Libraries, Fonts &amp; Open-Source Assets</h2>
          <p style={paragraphStyle}>
            This website is built utilizing modern web technologies, open-source software libraries, and typography assets. We
            expressly acknowledge that third-party elements remain the property of their respective creators and are used under
            applicable licenses:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li><strong>Open-Source Frameworks &amp; Tools:</strong> React, React Router, Framer Motion, GSAP, and associated JavaScript packages are licensed under the MIT License or respective open-source licenses.</li>
            <li><strong>Typography:</strong> Google Fonts (including Cinzel, Cormorant Garamond, and Jost) are governed by the SIL Open Font License (OFL) or Apache License.</li>
            <li><strong>Infrastructure:</strong> Database and hosting services are provided by Supabase and Vercel under their respective service agreements.</li>
          </ul>

          <h2 style={sectionHeadingStyle}>4. Permissions &amp; Inquiries</h2>
          <p style={paragraphStyle}>
            For academic inquiries, publication permissions, or licensing requests regarding our photographic archive or workshop
            documentation, please contact:
          </p>
          <div
            style={{
              padding: '20px 24px',
              background: C.bg2,
              border: `1px solid ${C.borderGold}`,
              borderRadius: 4,
              ...ff.body,
              fontSize: 13,
              color: C.dim,
              lineHeight: 1.8,
            }}
          >
            <div><strong style={{ color: C.text }}>Vijay Metal Works</strong></div>
            <div>New No. 3, Old No. 19, Murugappa Street, Sowcarpet, Chennai – 600 079</div>
            <div>Phone: <a href={`tel:${BIZ.phoneTel}`} style={{ color: C.gold, textDecoration: 'none' }}>+91 {BIZ.phone}</a></div>
            <div>Email: <a href={`mailto:${BIZ.email}`} style={{ color: C.gold, textDecoration: 'none' }}>{BIZ.email}</a></div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default CopyrightPage;
