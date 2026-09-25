import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ff } from '../styles/fonts';
import { BIZ } from '../data/biz';
import Footer from '../components/footer/Footer';

const TermsConditionsPage = () => {
  const C = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = 'Terms & Conditions | Vijay Metal Works';
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Terms and Conditions for Vijay Metal Works — project inquiries, commissions, and service agreements.');
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
              LEGAL AGREEMENT · ATELIER PRACTICES
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
              Terms &amp; Conditions
            </h1>
            <p style={{ ...ff.serif, fontSize: 14, color: C.dim, fontStyle: 'italic' }}>
              Last updated: September 2026 · Binding agreement for all commissions
            </p>
          </div>

          <p style={paragraphStyle}>
            By submitting an inquiry, consultation request, or commissioning sacred metalwork from Vijay Metal Works 
            (hereinafter &ldquo;the atelier&rdquo;, &ldquo;we&rdquo;, or &ldquo;our workshop&rdquo;), established in 1915 
            and operating from Sowcarpet, Chennai, you agree to be bound by the following terms and conditions governing 
            project execution, craftsmanship standards, payment obligations, and dispute resolution.
          </p>

          <h2 style={sectionHeadingStyle}>1. Scope of Services</h2>
          <p style={paragraphStyle}>
            Vijay Metal Works specializes in traditional temple metalwork including but not limited to:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li>Lost-wax Panchaloha and bronze vigraham (deity idol) casting</li>
            <li>24K gold and 92.5 sterling silver repousse work (crowns, kavacha, ornaments)</li>
            <li>Temple architectural elements (prabhavali, vimana kalasam, sanctum doors)</li>
            <li>Sacred vessels and pooja articles in hallmarked silver, copper, and brass</li>
            <li>Antique restoration and electro-plating services</li>
          </ul>
          <p style={paragraphStyle}>
            All work is executed per Agamic specifications and traditional South Indian temple iconography standards 
            passed down through four generations of master artisans.
          </p>

          <h2 style={sectionHeadingStyle}>2. Commission Process &amp; Consultation</h2>
          <p style={paragraphStyle}>
            <strong>Initial Inquiry:</strong> Upon submission of a consultation request through our website or WhatsApp channel, 
            proprietor I. Vijay or authorized representatives will review your specifications and contact you within 2-5 business days 
            to discuss dimensions, metallurgy, iconographic requirements, and preliminary estimates.
          </p>
          <p style={paragraphStyle}>
            <strong>Project Proposal:</strong> Following initial consultation, we will provide a detailed written proposal including:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li>Accurate project description with deity specifications and posture details</li>
            <li>Metallurgical composition (metal purity percentages)</li>
            <li>Estimated dimensions and weight</li>
            <li>Timeline for completion (subject to complexity and current workshop queue)</li>
            <li>Total project cost breakdown (metal cost, labor, finishing, consecration preparation)</li>
          </ul>
          <p style={paragraphStyle}>
            <strong>Acceptance:</strong> Commission officially begins upon receipt of advance payment (see Section 4).
          </p>

          <h2 style={sectionHeadingStyle}>3. Custom Design &amp; Modifications</h2>
          <p style={paragraphStyle}>
            All commissions are bespoke handcrafted works. Minor design adjustments may be requested during the initial 
            concept phase at no additional charge. However, significant alterations requested after casting or primary metalwork 
            has commenced may incur revision fees based on material wastage and labor hours already invested.
          </p>
          <p style={paragraphStyle}>
            For pieces requiring strict adherence to specific temple parampara (lineage traditions) or architectural drawings, 
            patrons are responsible for providing accurate reference materials, photographs, or shilpa shastra measurements.
          </p>

          <h2 style={sectionHeadingStyle}>4. Pricing &amp; Payment Terms</h2>
          <p style={paragraphStyle}>
            <strong>Quotation Validity:</strong> All price quotations are valid for 30 days from the date of issuance. 
            Fluctuations in precious metal market rates (gold, silver) may necessitate price adjustments for quotations 
            accepted beyond this period.
          </p>
          <p style={paragraphStyle}>
            <strong>Payment Schedule:</strong> Standard commission payment structure:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li><strong>Advance Payment (40-50%):</strong> Required to initiate work and procure raw materials. Non-refundable once casting or primary metalwork begins.</li>
            <li><strong>Progress Payment (30-40%):</strong> Due upon completion of primary structure or casting, before final finishing and polishing.</li>
            <li><strong>Final Payment (10-20%):</strong> Due upon project completion, before delivery or temple installation coordination.</li>
          </ul>
          <p style={paragraphStyle}>
            <strong>Accepted Payment Methods:</strong> Bank transfer (NEFT/RTGS/IMPS), UPI, cash (for walk-in atelier visits), 
            or certified temple trust cheques. International patrons may remit via wire transfer with applicable banking charges 
            borne by the patron.
          </p>

          <h2 style={sectionHeadingStyle}>5. Delivery, Shipping &amp; Installation</h2>
          <p style={paragraphStyle}>
            <strong>Local Delivery (Chennai &amp; Tamil Nadu):</strong> We offer complimentary supervised delivery and basic installation 
            consultation for projects within Chennai city limits. For temples outside Chennai, transportation and installation coordination 
            charges apply based on distance and complexity.
          </p>
          <p style={paragraphStyle}>
            <strong>Interstate &amp; International Shipping:</strong> For commissions delivered outside Tamil Nadu or internationally, 
            secure custom wooden crating, insurance, and freight forwarding costs are the patron's responsibility. We will coordinate 
            with reputable logistics partners experienced in handling consecrated temple artifacts.
          </p>
          <p style={paragraphStyle}>
            <strong>Risk of Loss:</strong> Title and risk of loss or damage pass to the patron upon physical handover or shipping carrier 
            acceptance, whichever occurs first.
          </p>

          <h2 style={sectionHeadingStyle}>6. Completion Timeline &amp; Delays</h2>
          <p style={paragraphStyle}>
            Estimated completion timelines provided during consultation are approximate and contingent upon:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li>Complexity of design and metallurgical processes required</li>
            <li>Current workshop commission queue and artisan availability</li>
            <li>Timely receipt of patron approvals and progress payments</li>
            <li>Availability of specialized materials (e.g., antique restoration components)</li>
          </ul>
          <p style={paragraphStyle}>
            While we endeavor to meet all agreed deadlines, traditional handcrafting may require additional time to ensure 
            iconographic accuracy and structural integrity. Patrons will be notified promptly of any significant delays. 
            Rush orders for urgent temple festivals may be accommodated subject to expedited labor surcharges.
          </p>

          <h2 style={sectionHeadingStyle}>7. Quality Assurance &amp; Guarantees</h2>
          <p style={paragraphStyle}>
            <strong>Craftsmanship Warranty:</strong> We guarantee authentic traditional craftsmanship executed per approved specifications. 
            All metal purity claims (24K gold, 92.5 sterling silver, Panchaloha composition) are accurate and subject to standard hallmark 
            verification where applicable.
          </p>
          <p style={paragraphStyle}>
            <strong>Structural Integrity:</strong> All vigraham, crowns, and architectural elements are structurally sound for normal 
            temple worship use. However, we are not liable for damage resulting from:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: 24, listStyleType: 'disc' }}>
            <li>Improper handling, installation, or maintenance by temple staff</li>
            <li>Natural disasters, fire, or environmental corrosion beyond normal indoor sanctum conditions</li>
            <li>Unauthorized modifications or repairs performed by third parties</li>
          </ul>
          <p style={paragraphStyle}>
            <strong>Electro-Plating Guarantee:</strong> European standard electro gold/silver plating carries a 3-year finish warranty 
            under normal indoor temple usage (excludes outdoor exposure or abrasive cleaning).
          </p>

          <h2 style={sectionHeadingStyle}>8. Cancellations &amp; Refunds</h2>
          <p style={paragraphStyle}>
            <strong>Patron-Initiated Cancellation:</strong> If a commission is cancelled before primary metalwork or casting begins, 
            advance payment less 25% administrative and design consultation fees will be refunded. Once casting or irreversible fabrication 
            has commenced, advance payments are non-refundable, though patrons may opt to pause the project for up to 6 months.
          </p>
          <p style={paragraphStyle}>
            <strong>Atelier-Initiated Cancellation:</strong> In the rare event we must cancel a commission due to unforeseen circumstances 
            (material unavailability, workshop closure), all payments received will be refunded in full within 30 business days.
          </p>

          <h2 style={sectionHeadingStyle}>9. Intellectual Property &amp; Documentation</h2>
          <p style={paragraphStyle}>
            All design sketches, technical drawings, and proprietary repoussé techniques remain the intellectual property of Vijay Metal Works. 
            Patrons are granted perpetual ownership of the commissioned physical artifact but may not reproduce our designs commercially or 
            claim authorship of traditional motifs refined through our family lineage.
          </p>
          <p style={paragraphStyle}>
            We reserve the right to photograph completed works for portfolio documentation, website gallery display, and promotional purposes 
            unless patrons explicitly request confidentiality in writing.
          </p>

          <h2 style={sectionHeadingStyle}>10. Limitation of Liability</h2>
          <p style={paragraphStyle}>
            Our total liability for any claim arising from a commission shall not exceed the total amount paid by the patron for that 
            specific project. We are not liable for indirect, incidental, consequential, or special damages including but not limited to 
            lost profits, temple festival postponement costs, or spiritual distress claims.
          </p>

          <h2 style={sectionHeadingStyle}>11. Dispute Resolution &amp; Governing Law</h2>
          <p style={paragraphStyle}>
            Any disputes arising from commissions shall first be subject to good-faith mediation facilitated by mutually agreed temple 
            authorities or community elders, in keeping with traditional atelier dispute resolution practices. If mediation fails, 
            disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu, India, and governed by Indian law.
          </p>

          <h2 style={sectionHeadingStyle}>12. Changes to Terms</h2>
          <p style={paragraphStyle}>
            We reserve the right to update these Terms &amp; Conditions periodically to reflect evolving workshop practices or legal 
            requirements. Updated terms apply only to commissions initiated after the revision date. Patrons with active ongoing commissions 
            remain governed by the terms accepted at the time of initial advance payment.
          </p>

          <h2 style={sectionHeadingStyle}>13. Contact for Legal Inquiries</h2>
          <p style={paragraphStyle}>
            For questions regarding these Terms &amp; Conditions or to request clarification on commission agreements, please contact:
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

          <div
            style={{
              marginTop: 40,
              padding: '20px 24px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: `1px solid ${C.borderGold}`,
              borderRadius: 4,
              ...ff.serif,
              fontSize: 14,
              color: C.text,
              fontStyle: 'italic',
              lineHeight: 1.7,
            }}
          >
            &ldquo;By submitting a commission inquiry or making an advance payment, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms &amp; Conditions in full. For queries or clarifications before 
            proceeding, please reach out to our atelier directly.&rdquo;
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditionsPage;
