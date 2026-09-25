import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ff } from '../styles/fonts';
import { BIZ } from '../data/biz';
import Footer from '../components/footer/Footer';

const PrivacyPolicyPage = () => {
  const C = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = 'Privacy Policy | Vijay Metal Works';
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Privacy Policy for Vijay Metal Works — how we handle your data, inquiries, and client reviews.');
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
              LEGAL &amp; DATA PRACTICES
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
              Privacy Policy
            </h1>
            <p style={{ ...ff.serif, fontSize: 14, color: C.dim, fontStyle: 'italic' }}>
              Last updated: September 2026 · Effective for vijaymetalworks.com
            </p>
          </div>

          <p style={paragraphStyle}>
            Vijay Metal Works (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the atelier&rdquo;), established in 1915 and operating from
            Sowcarpet, Chennai, respects the privacy of our temple patrons, trustees, and visitors. This Privacy Policy
            accurately explains how information is collected, processed, and safeguarded when you use our website.
          </p>

          <h2 style={sectionHeadingStyle}>1. Information Submitted for Inquiries &amp; Consultations</h2>
          <p style={paragraphStyle}>
            When you request a consultation or commission through our website contact form or atelier consultation modal, we
            collect only the information you voluntarily submit:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li><strong>Name:</strong> To identify you or your temple trust.</li>
            <li><strong>Phone / WhatsApp Number:</strong> To contact you directly regarding technical specifications, dimensions, and quotes.</li>
            <li><strong>Email Address:</strong> If provided, used for transmitting detailed project drawings, proposals, or receipts.</li>
            <li><strong>Project Details:</strong> Information such as deity name, temple location, dimensions, metal preference, or scheduling requirements.</li>
            <li><strong>Reference Images:</strong> Photographs, sketches, or architectural drawings you choose to upload to assist in assessing the work.</li>
          </ul>

          <h2 style={sectionHeadingStyle}>2. Client Reviews &amp; Testimonial Submissions</h2>
          <p style={paragraphStyle}>
            When you voluntarily submit feedback through our &ldquo;Client Reviews&rdquo; portal, we collect the following details based on your affirmative consent:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li><strong>Public Details (Displayed Upon Approval):</strong> Your full name, associated temple or organisation name, star rating, written review, and any optional photograph of the consecrated work or installation you choose to provide.</li>
            <li><strong>Private Verification Details (Never Published):</strong> Your email address or phone/WhatsApp number, if provided, is collected strictly for internal identity verification and communication regarding your commission. These contact details are never shown publicly or distributed.</li>
            <li><strong>Review Moderation &amp; Approval:</strong> All submitted reviews undergo editorial moderation prior to publication to prevent spam, defamation, or inappropriate submissions. We reserve the right to decline or unpublish reviews that do not relate to verified commissions.</li>
          </ul>

          <h2 style={sectionHeadingStyle}>3. How Your Information Is Used</h2>
          <p style={paragraphStyle}>
            Information collected through our consultation forms is used strictly to evaluate your requirement, provide
            authentic estimates, discuss iconographic specifications, and carry out commissioned temple metalwork. Approved
            reviews are showcased on our public website to represent verified patron experiences. We do
            not sell, rent, commercialize, or trade your personal data to any marketing agencies or third parties.
          </p>

          <h2 style={sectionHeadingStyle}>4. Storage, Hosting &amp; Communication Channels</h2>
          <p style={paragraphStyle}>
            <strong>Database &amp; File Storage:</strong> Project inquiries, client reviews, and optional uploaded images are
            transmitted securely to our private database instance hosted via Supabase infrastructure. Only authorized
            proprietors have administrative access.
          </p>
          <p style={paragraphStyle}>
            <strong>WhatsApp Communication:</strong> When you submit a consultation request, our website facilitates an
            optional direct link opening WhatsApp with your pre-filled inquiry. Any ongoing conversations on WhatsApp are
            governed by standard WhatsApp end-to-end encryption protocols and your direct interaction with proprietor I. Vijay.
          </p>

          <h2 style={sectionHeadingStyle}>5. Website Analytics &amp; Interaction Tracking</h2>
          <p style={paragraphStyle}>
            To understand website usage and ensure proper server performance, our website records minimal, aggregated
            analytics events:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li><strong>Page Views:</strong> Generic metrics such as browser viewport, anonymized session ID, and page path.</li>
            <li><strong>Visiting-Card &amp; Review Events:</strong> Minimal interaction events when visitors download our official contact card, open the review submission form, or submit feedback, helping us evaluate patron engagement.</li>
          </ul>
          <p style={paragraphStyle}>
            We do not use intrusive third-party cross-site advertising pixels, behavioral tracking networks, or marketing cookies.
          </p>

          <h2 style={sectionHeadingStyle}>6. Data Retention &amp; Security</h2>
          <p style={paragraphStyle}>
            Inquiry records and approved reviews are retained to preserve the historical lineage and provenance of temple commissions. We implement appropriate technical controls, HTTPS encryption in
            transit, and authenticated database access to protect your information against unauthorized access or disclosure.
          </p>

          <h2 style={sectionHeadingStyle}>7. Your Rights &amp; Requests (Including Review Removal)</h2>
          <p style={paragraphStyle}>
            You have the right to request access to, correction of, or permanent deletion of your inquiry data or published client reviews at any time. If you wish to modify or remove your review and any attached photograph from our website, simply email us at <a href={`mailto:${BIZ.email}`} style={{ color: C.gold, textDecoration: 'none' }}>{BIZ.email}</a> and our administration team will promptly update or take down the record.
          </p>

          <h2 style={sectionHeadingStyle}>8. Contact Us</h2>
          <p style={paragraphStyle}>
            If you have questions regarding this Privacy Policy or how your data is handled, please reach out to:
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
            <div><strong style={{ color: C.text }}>Vijay Metal Works</strong> (Estd. 1915)</div>
            <div>New No. 3, Old No. 19, Murugappa Street, Sowcarpet, Chennai – 600 079</div>
            <div>Phone / WhatsApp: <a href={`tel:${BIZ.phoneTel}`} style={{ color: C.gold, textDecoration: 'none' }}>+91 {BIZ.phone}</a></div>
            <div>Email: <a href={`mailto:${BIZ.email}`} style={{ color: C.gold, textDecoration: 'none' }}>{BIZ.email}</a></div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
