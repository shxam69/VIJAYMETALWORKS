import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { SlideUp } from '../common/Animations';
import { sendEnquiryEmailNotification } from '../../lib/supabase';

const PROJECT_TYPES = [
  'Panchaloha',
  'Gold Naga Work',
  'Silver Articles',
  'Kireedam / Temple Regalia',
  'Architectural Metalwork',
  'Custom Jewellery',
];

const Contact = () => {
  const C = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Panchaloha',
    projectDetails: '',
    agreedToTerms: false,
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 3) {
      alert('You can upload a maximum of 3 reference images.');
      return;
    }
    const newFiles = [...files, ...selected].slice(0, 3);
    setFiles(newFiles);
    setPreviews(newFiles.map((file) => URL.createObjectURL(file)));
  };

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }
    // Validate email format if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address or leave the email field blank.');
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMsg('You must agree to the Privacy Policy and Terms & Conditions to proceed.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const imageUrls = [];

    try {
      if (supabaseUrl && supabaseKey && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `contact_${Date.now()}_${i}.${fileExt}`;
          try {
            const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/inquiry_references/${fileName}`, {
              method: 'POST',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': file.type || 'image/jpeg',
              },
              body: file,
            });
            if (uploadRes.ok) imageUrls.push(fileName);
          } catch (_) {
            /* continue */
          }
        }
      }

      const inquiryPayload = {
        full_name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'Not provided',
        whatsapp: formData.phone.trim(),
        artwork_type: formData.projectType,
        description: formData.projectDetails.trim(),
        reference_images: imageUrls,
        status: 'new',
      };

      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(inquiryPayload),
          });
        } catch (dbErr) {
          console.warn('Supabase inquiry insert fallback:', dbErr);
        }
      }

      // Trigger automated email notification via Supabase Edge Function (server-side Resend)
      try {
        await sendEnquiryEmailNotification({
          full_name: inquiryPayload.full_name,
          phone: inquiryPayload.phone,
          email: formData.email.trim(),
          whatsapp: inquiryPayload.whatsapp,
          artwork_type: inquiryPayload.artwork_type,
          description: inquiryPayload.description,
          reference_images: imageUrls,
          submitted_at: new Date().toISOString(),
          source: 'Website Consultation Form',
        });
      } catch (emailErr) {
        console.warn('[VMW Email Automation] Trigger non-blocking error:', emailErr);
      }

      const waMessage = encodeURIComponent(
        `Namaskaram Vijay Metal Works,\n\nI would like to discuss a temple metalwork project:\n` +
          `• Name: ${formData.name.trim()}\n` +
          `• Phone / WhatsApp: ${formData.phone.trim()}\n` +
          `• Email: ${formData.email.trim() || 'Not provided'}\n` +
          `• Project Type: ${formData.projectType}\n` +
          `• Project Details: ${formData.projectDetails.trim() || 'To be discussed'}\n\n` +
          `Please advise on next steps and consultation.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/919382877351?text=${waMessage}`, '_blank');
      }, 400);

      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitting(false);
      const waFallback = encodeURIComponent(
        `Namaskaram Vijay Metal Works,\n\nI would like to discuss a temple metalwork project:\nName: ${formData.name}\nProject: ${formData.projectType}`
      );
      window.open(`https://wa.me/919382877351?text=${waFallback}`, '_blank');
      setSubmitted(true);
    }
  };

  const labelStyle = {
    ...ff.body,
    fontSize: 10,
    letterSpacing: '.18em',
    color: C.dim,
    fontWeight: 600,
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    color: C.text,
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.25s',
  };

  return (
    <section
      id="contact"
      className="section-pad"
      style={{ position: 'relative', zIndex: 2, background: C.bg3, borderTop: `1px solid ${C.border}` }}
    >
      <div className="vmw-container">
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <SlideUp>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 16, color: C.gold, opacity: 0.85 }}>✧</div>
              <h2
                style={{
                  ...ff.display,
                  fontSize: 'clamp(24px, 4vw, 42px)',
                  color: C.text,
                  marginBottom: 16,
                  letterSpacing: '.03em',
                  fontWeight: 700,
                }}
              >
                BEGIN A TEMPLE METALWORK PROJECT
              </h2>
              <p
                style={{
                  ...ff.body,
                  fontSize: 'clamp(13px, 1.3vw, 15px)',
                  color: C.dim,
                  lineHeight: 1.8,
                  maxWidth: 620,
                  margin: '0 auto',
                }}
              >
                Share your requirements, dimensions, reference images or project details with us. Our team can
                understand the scope of your requirement and discuss the next steps.
              </p>
            </div>

            {submitted ? (
              <div
                style={{
                  padding: '48px 24px',
                  background: C.bg2,
                  border: `1px solid ${C.borderGold}`,
                  borderRadius: 4,
                  textAlign: 'center',
                  marginBottom: 48,
                }}
              >
                <div style={{ fontSize: 36, color: C.gold, marginBottom: 12 }}>✦</div>
                <h3 style={{ ...ff.display, fontSize: 22, color: C.text, marginBottom: 10 }}>
                  Consultation Request Lodged
                </h3>
                <p style={{ ...ff.serif, fontSize: 15, color: C.dim, fontStyle: 'italic', maxWidth: 480, margin: '0 auto 24px' }}>
                  Thank you. Your project requirement has been recorded and WhatsApp has opened to connect directly with proprietor I. Vijay.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', projectType: 'Panchaloha', projectDetails: '', agreedToTerms: false });
                    setFiles([]);
                    setPreviews([]);
                  }}
                  style={{
                    padding: '12px 28px',
                    background: 'transparent',
                    border: `1px solid ${C.gold}`,
                    color: C.gold,
                    fontSize: 11,
                    letterSpacing: '.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: 3,
                  }}
                >
                  Submit Another Project
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  padding: 'clamp(20px, 4vw, 40px)',
                  borderRadius: 6,
                  marginBottom: 48,
                }}
              >
                {errorMsg && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,80,60,0.12)',
                      border: '1px solid rgba(255,80,60,0.3)',
                      borderRadius: 4,
                      color: '#ff6b6b',
                      fontSize: 12,
                      marginBottom: 20,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <label style={labelStyle}>NAME *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name or temple authority"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>PHONE / WHATSAPP *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 93828 77351"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <label style={labelStyle}>EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@temple.org"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>PROJECT TYPE</label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {PROJECT_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>PROJECT DETAILS</label>
                  <textarea
                    rows={4}
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleInputChange}
                    placeholder="Dimensions, deity, temple, specifications or other project requirements"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>REFERENCE IMAGES</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '24px 16px',
                      border: `1px dashed ${C.borderGold}`,
                      borderRadius: 4,
                      background: 'rgba(212, 175, 55, 0.03)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 20, color: C.gold, display: 'block', marginBottom: 4 }}>📷</span>
                    <span style={{ ...ff.body, fontSize: 12, color: C.text, fontWeight: 600 }}>
                      Attach Reference Photos or Drawings
                    </span>
                    <span style={{ ...ff.body, fontSize: 10, color: C.dim, display: 'block', marginTop: 2 }}>
                      Max 3 images (JPG, PNG, WEBP)
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      {previews.map((src, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'relative',
                            width: 60,
                            height: 60,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: `1px solid ${C.borderGold}`,
                          }}
                        >
                          <img src={src} alt={`Ref ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: 'rgba(0,0,0,0.8)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 16,
                              height: 16,
                              fontSize: 9,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Policy & Terms Checkbox */}
                <div
                  style={{
                    marginBottom: 24,
                    padding: '18px 20px',
                    background: 'rgba(212, 175, 55, 0.05)',
                    border: `1px solid ${formData.agreedToTerms ? C.borderGold : C.border}`,
                    borderRadius: 4,
                    transition: 'all 0.25s',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <input
                        type="checkbox"
                        name="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onChange={(e) => setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: C.gold,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        ...ff.body,
                        fontSize: 'clamp(11px, 2.2vw, 12.5px)',
                        color: C.text,
                        lineHeight: 1.6,
                      }}
                    >
                      I acknowledge that I have read and agree to the{' '}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: C.gold,
                          textDecoration: 'underline',
                          fontWeight: 600,
                        }}
                      >
                        Privacy Policy
                      </a>
                      {' '}and{' '}
                      <a
                        href="/terms-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: C.gold,
                          textDecoration: 'underline',
                          fontWeight: 600,
                        }}
                      >
                        Terms &amp; Conditions
                      </a>
                      {' '}of Vijay Metal Works. I understand that by submitting this consultation request, I consent to the collection and processing of my contact information as outlined in the Privacy Policy.
                    </div>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting || !formData.agreedToTerms}
                  whileHover={{ scale: formData.agreedToTerms ? 1.01 : 1 }}
                  whileTap={{ scale: formData.agreedToTerms ? 0.99 : 1 }}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    background: formData.agreedToTerms ? C.gold : C.border,
                    color: formData.agreedToTerms ? '#000' : C.faint,
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: (submitting || !formData.agreedToTerms) ? 'not-allowed' : 'pointer',
                    boxShadow: formData.agreedToTerms ? `0 8px 30px ${C.gold}33` : 'none',
                    opacity: (submitting || !formData.agreedToTerms) ? 0.6 : 1,
                    transition: 'all 0.25s',
                  }}
                >
                  {submitting ? 'RECORDING CONSULTATION...' : 'REQUEST A CONSULTATION'}
                </motion.button>
              </form>
            )}

            <div
              className="vmw-contact-links"
              style={{
                paddingTop: 32,
                borderTop: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(16px, 4vw, 36px)',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: '☎', txt: BIZ.phone, link: `tel:${BIZ.phoneTel}` },
                { icon: '✉', txt: BIZ.email, link: `mailto:${BIZ.email}` },
                { icon: '💬', txt: `WhatsApp: ${BIZ.phone}`, link: BIZ.whatsapp },
                { icon: '📍', txt: 'Sowcarpet, Chennai', link: BIZ.mapLink },
              ].map((c) => (
                <motion.a
                  key={c.txt}
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 15, color: C.gold }}>{c.icon}</span>
                  <span
                    style={{
                      ...ff.body,
                      fontSize: 'clamp(10px, 1vw, 11px)',
                      color: C.dim,
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {c.txt}
                  </span>
                </motion.a>
              ))}
            </div>
          </SlideUp>
        </div>
      </div>
    </section>
  );
};

export default Contact;
