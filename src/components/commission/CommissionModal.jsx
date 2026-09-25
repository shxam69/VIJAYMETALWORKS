import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { CurvyButton } from '../common/Button';
import { sendEnquiryEmailNotification } from '../../lib/supabase';

const CATEGORIES = [
  { id: 'Temple Artwork', label: 'Temple Sanctum Artwork', desc: 'Vimana kalasams, prabhavali arches, sanctum doors & vahanas' },
  { id: 'Vigraham', label: 'Sacred Vigraham / Idol', desc: 'Lost-wax Panchaloha, bronze, or copper deity casting' },
  { id: 'Crown', label: 'Kireedam / Sacred Crown', desc: 'Hand-beaten gold & silver crowns with traditional makuta bands' },
  { id: 'Kavacha', label: 'Kavacha / Body Armor', desc: 'Full embossed gold/silver sheet body armor for consecrated idols' },
  { id: 'Silver Work', label: 'Silver Pooja Articles', desc: 'Hallmarked 92.5 sterling silver lamps, plates, vessels & kalasams' },
  { id: 'Custom Metalwork', label: 'Custom Temple Commission', desc: 'Bespoke architectural restoration, electro-plating or renovation' },
  { id: 'Custom Jewellery', label: 'Custom Jewellery', desc: 'Gold, Silver and Platinum', isSeparateRow: true },
];

const METALS = [
  { id: '24K Gold Nagas', label: '24K Gold Nagas Work', desc: 'Pure temple gold repoussé hand-chiselled over natural pitch beds' },
  { id: '92.5 Sterling Silver', label: '92.5 Sterling Silver', desc: 'Hallmarked Britannia silver with optional antique oxidisation' },
  { id: 'Panchaloha (5-Metal)', label: 'Sacred Panchaloha', desc: 'Gold, silver, copper, iron & lead alloy per Agamic proportions' },
  { id: 'Copper / Gold Foil', label: 'Copper with 24K Gold Foil', desc: 'Traditional Thanga Thagadu gold leaf layered over solid copper' },
  { id: 'Brass / Electro Plated', label: 'Brass / Electro Gold Plated', desc: 'European electroplating with multi-year sanctum guarantee' },
];

const JEWELLERY_METALS = [
  { id: 'Gold', label: 'Gold', desc: 'Lustrous 22K or 18K gold crafted with traditional South Indian artistry and contemporary elegance' },
  { id: 'Silver', label: 'Silver', desc: 'Hallmarked 92.5 sterling silver with intricate handwork, oxidised or polished finish' },
  { id: 'Platinum', label: 'Platinum', desc: 'Pure platinum with exceptional durability and timeless sophistication for heirloom pieces' },
];

const JEWELLERY_TYPES = [
  'Ring',
  'Necklace',
  'Bracelet',
  'Earrings',
  'Anklet',
  'Pendant',
  'Chain',
  'Bangle',
  'Nose Ring',
  'Toe Ring',
  'Other',
];

const CommissionModal = ({ onClose, C: themeProp }) => {
  const hookTheme = useTheme();
  const C = themeProp || hookTheme;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artworkType: 'Temple Artwork',
    metal: '24K Gold Nagas',
    jewelleryType: '',
    dimensions: '',
    deityDetails: '',
    budget: '',
    timeline: 'Within 3 Months',
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    description: '',
    agreedToTerms: false,
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const validateCurrentStep = () => {
    if (step === 1 && !formData.artworkType) return false;
    if (step === 2 && !formData.metal) return false;
    if (step === 6) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.trim().length < 8) {
        setErrorMsg('Please enter a valid telephone or WhatsApp number.');
        return false;
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setErrorMsg('Please enter a valid email address or leave blank.');
        return false;
      }
      if (!formData.agreedToTerms) {
        setErrorMsg('You must agree to the Privacy Policy and Terms & Conditions to proceed.');
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(6, s + 1));
    }
  };

  const prevStep = () => {
    setErrorMsg(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      const imageUrls = [];

      // Upload files to Supabase inquiry_references bucket if available
      if (supabaseUrl && supabaseKey && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `inquiry_${Date.now()}_${i}.${fileExt}`;
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

      // Combine description with details
      const fullDescription = [
        formData.description,
        formData.artworkType === 'Custom Jewellery' && formData.jewelleryType ? `Jewellery Type: ${formData.jewelleryType}` : '',
        formData.dimensions ? `Dimensions: ${formData.dimensions}` : '',
        formData.deityDetails && formData.artworkType !== 'Custom Jewellery' ? `Deity / Sanctum: ${formData.deityDetails}` : '',
        formData.deityDetails && formData.artworkType === 'Custom Jewellery' && formData.jewelleryType === 'Other' ? `Custom Type: ${formData.deityDetails}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'Not provided',
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        artwork_type: formData.artworkType,
        preferred_metal: formData.metal,
        budget: formData.budget || 'Custom Quote',
        timeline: formData.timeline,
        description: fullDescription,
        reference_images: imageUrls,
        status: 'new',
      };

      // Send to Supabase inquiries table
      if (supabaseUrl && supabaseKey) {
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            // Fallback to minimal payload
            await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
              method: 'POST',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({
                full_name: payload.full_name,
                phone: payload.phone,
                email: payload.email,
              }),
            });
          }
        } catch (dbErr) {
          console.warn('Supabase inquiry insert failed, proceeding to WhatsApp confirmation:', dbErr);
        }
      }

      // Trigger automated email notification (Server-side Edge Function with Resend)
      try {
        await sendEnquiryEmailNotification({
          full_name: payload.full_name,
          phone: payload.phone,
          email: formData.email.trim(),
          whatsapp: payload.whatsapp,
          artwork_type: payload.artwork_type,
          preferred_metal: payload.preferred_metal,
          budget: payload.budget,
          timeline: payload.timeline,
          description: payload.description,
          dimensions: formData.dimensions,
          reference_images: imageUrls,
          submitted_at: new Date().toISOString(),
          source: 'Commission Modal',
        });
      } catch (emailErr) {
        console.warn('[VMW Email Automation] Trigger non-blocking error:', emailErr);
      }

      // Open WhatsApp prefill
      const waMessage = encodeURIComponent(
        formData.artworkType === 'Custom Jewellery'
          ? `Namaskaram I. Vijay sir,\n\nI would like to commission a custom jewellery piece from Vijay Metal Works:\n` +
            `• Jewellery Type: ${formData.jewelleryType || 'To be discussed'}\n` +
            `• Metal: ${formData.metal}\n` +
            `• Design Notes: ${formData.description || 'To be discussed'}\n` +
            `• Timeline: ${formData.timeline}\n` +
            `• Name: ${formData.fullName}\n` +
            `• Phone: ${formData.phone}\n\n` +
            `Please advise on the design consultation and next steps.`
          : `Namaskaram I. Vijay sir,\n\nI would like to commission a sacred piece from Vijay Metal Works:\n` +
            `• Artwork: ${formData.artworkType}\n` +
            `• Metal: ${formData.metal}\n` +
            `• Deity/Sanctum: ${formData.deityDetails || 'To be discussed'}\n` +
            `• Dimensions: ${formData.dimensions || 'To be specified'}\n` +
            `• Timeline: ${formData.timeline}\n` +
            `• Name: ${formData.fullName}\n` +
            `• Phone: ${formData.phone}\n\n` +
            `Please advise on the next steps and consultation schedule.`
      );

      // Trigger WhatsApp
      setTimeout(() => {
        window.open(`https://wa.me/919382877351?text=${waMessage}`, '_blank');
      }, 500);

      setSubmitting(false);
      setDone(true);
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('An unexpected error occurred. Please contact us directly on WhatsApp.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(5, 4, 2, 0.85)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 680,
          margin: '0 auto',
          background: C.bg2,
          border: `1px solid ${C.borderGold}`,
          borderRadius: 6,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,215,0,0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Metallic Bar */}
        <div style={{ height: 3, background: C.goldGrad }} />

        {/* Modal Header */}
        <div
          style={{
            padding: 'clamp(16px, 4vw, 24px) clamp(20px, 4vw, 28px) clamp(12px, 2vw, 16px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${C.border}`,
            gap: '12px',
          }}
        >
          <div>
            <span
              style={{
                ...ff.body,
                fontSize: 'clamp(7px, 1.8vw, 8.5px)',
                letterSpacing: '.35em',
                color: C.gold,
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}
            >
              ATELIER CONSULTATION · SOWCARPET
            </span>
            <h3 style={{ ...ff.display, fontSize: 'clamp(18px, 4vw, 22px)', color: C.text, fontWeight: 700, letterSpacing: '.02em' }}>
              Commission a Sacred Piece
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close consultation modal"
            style={{
              background: 'none',
              border: 'none',
              color: C.faint,
              fontSize: 'clamp(20px, 4vw, 22px)',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Tracker (6 Steps) */}
        {!done && (
          <div style={{ padding: 'clamp(12px, 2vw, 14px) clamp(20px, 4vw, 28px)', background: C.bg1, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                style={{
                  flex: 1,
                  minWidth: '28px',
                  height: 3,
                  borderRadius: 2,
                  background: st <= step ? C.gold : C.border,
                  transition: 'background 0.35s',
                }}
              />
            ))}
            <span style={{ ...ff.body, fontSize: 'clamp(9px, 2vw, 10px)', color: C.dim, marginLeft: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Step {step} of 6
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: 'clamp(16px, 3.5vw, 28px)', maxHeight: 'clamp(50vh, 60vh, calc(100dvh - 140px))', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {done ? (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>✦</div>
              <h4 style={{ ...ff.display, fontSize: 24, color: C.gold, fontWeight: 700, marginBottom: 12 }}>
                Inquiry Successfully Lodged
              </h4>
              <p style={{ ...ff.serif, fontSize: 16, color: C.text, fontStyle: 'italic', maxWidth: 440, margin: '0 auto 24px' }}>
                &ldquo;Devotion embodied in metal.&rdquo; Your commission details have been transmitted to I. Vijay. WhatsApp has also opened with your pre-filled inquiry.
              </p>
              <div style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 32 }}>
                You will receive an iconographic proposal and quote shortly on {formData.phone}.
              </div>
              <CurvyButton primary onClick={onClose}>
                RETURN TO ATELIER
              </CurvyButton>
            </div>
          ) : (
            <div>
              {errorMsg && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,80,60,0.12)', border: '1px solid rgba(255,80,60,0.3)', borderRadius: 4, color: '#ff6b6b', fontSize: 12, marginBottom: 20 }}>
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: CATEGORY */}
              {step === 1 && (
                <div>
                  <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                    1. Select the Sacred Artwork Type
                  </h4>
                  <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                    Choose the classification of metalwork you wish to commission:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 10 }}>
                    {CATEGORIES.filter(cat => !cat.isSeparateRow).map((cat) => {
                      const isSel = formData.artworkType === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setFormData((p) => ({ ...p, artworkType: cat.id }))}
                          style={{
                            padding: '16px',
                            borderRadius: 4,
                            border: `1px solid ${isSel ? C.gold : C.border}`,
                            background: isSel ? 'rgba(212, 175, 55, 0.08)' : C.bg1,
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                          }}
                        >
                          <div style={{ ...ff.display, fontSize: 14, color: isSel ? C.gold : C.text, fontWeight: 700, marginBottom: 4 }}>
                            {cat.label}
                          </div>
                          <div style={{ ...ff.body, fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                            {cat.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Separator Line */}
                  <div style={{ 
                    margin: '24px 0', 
                    height: '1px', 
                    background: `linear-gradient(to right, transparent, ${C.borderGold}, transparent)`,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: C.bg2,
                      padding: '0 12px',
                      ...ff.body,
                      fontSize: 9,
                      color: C.dim,
                      letterSpacing: '.2em',
                      textTransform: 'uppercase'
                    }}>
                      Personal Commissions
                    </div>
                  </div>

                  {/* Custom Jewellery Row */}
                  <div>
                    {CATEGORIES.filter(cat => cat.isSeparateRow).map((cat) => {
                      const isSel = formData.artworkType === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setFormData((p) => ({ ...p, artworkType: cat.id, metal: 'Gold' }))}
                          style={{
                            padding: '16px',
                            borderRadius: 4,
                            border: `1px solid ${isSel ? C.gold : C.border}`,
                            background: isSel ? 'rgba(212, 175, 55, 0.08)' : C.bg1,
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                          }}
                        >
                          <div style={{ ...ff.display, fontSize: 14, color: isSel ? C.gold : C.text, fontWeight: 700, marginBottom: 4 }}>
                            {cat.label}
                          </div>
                          <div style={{ ...ff.body, fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                            {cat.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: SACRED METAL */}
              {step === 2 && (
                <div>
                  <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                    2. {formData.artworkType === 'Custom Jewellery' ? 'Preferred Metal for Jewellery' : 'Preferred Sacred Metal or Alloy'}
                  </h4>
                  <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                    {formData.artworkType === 'Custom Jewellery' 
                      ? 'Select the precious metal for your custom jewellery piece:'
                      : 'Select the metallurgical composition per your temple tradition or budget:'
                    }
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(formData.artworkType === 'Custom Jewellery' ? JEWELLERY_METALS : METALS).map((met) => {
                      const isSel = formData.metal === met.id;
                      return (
                        <div
                          key={met.id}
                          onClick={() => setFormData((p) => ({ ...p, metal: met.id }))}
                          style={{
                            padding: '16px',
                            borderRadius: 4,
                            border: `1px solid ${isSel ? C.gold : C.border}`,
                            background: isSel ? 'rgba(212, 175, 55, 0.08)' : C.bg1,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.25s',
                          }}
                        >
                          <div>
                            <div style={{ ...ff.display, fontSize: 14, color: isSel ? C.gold : C.text, fontWeight: 700, marginBottom: 2 }}>
                              {met.label}
                            </div>
                            <div style={{ ...ff.body, fontSize: 11, color: C.dim }}>
                              {met.desc}
                            </div>
                          </div>
                          <span style={{ color: isSel ? C.gold : C.faint, fontSize: 18 }}>
                            {isSel ? '●' : '○'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SPECIFICATIONS */}
              {step === 3 && (
                <div>
                  {formData.artworkType === 'Custom Jewellery' ? (
                    // Jewellery Type Selection
                    <>
                      <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                        3. Type of Jewellery
                      </h4>
                      <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                        Select the type of jewellery piece you wish to commission:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 10 }}>
                        {JEWELLERY_TYPES.map((type) => {
                          const isSel = formData.jewelleryType === type;
                          return (
                            <div
                              key={type}
                              onClick={() => setFormData((p) => ({ ...p, jewelleryType: type }))}
                              style={{
                                padding: '14px 12px',
                                borderRadius: 4,
                                border: `1px solid ${isSel ? C.gold : C.border}`,
                                background: isSel ? 'rgba(212, 175, 55, 0.08)' : C.bg1,
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ ...ff.display, fontSize: 13, color: isSel ? C.gold : C.text, fontWeight: 600 }}>
                                {type}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {formData.jewelleryType === 'Other' && (
                        <div style={{ marginTop: 16 }}>
                          <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                            Please Specify
                          </label>
                          <input
                            type="text"
                            name="deityDetails"
                            value={formData.deityDetails}
                            onChange={handleInputChange}
                            placeholder="e.g. Thali chain, Metti, Jimikki, etc."
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              background: C.bg1,
                              border: `1px solid ${C.border}`,
                              borderRadius: 4,
                              color: C.text,
                              fontSize: 13,
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    // Temple Artwork Specifications
                    <>
                      <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                        3. Dimensions &amp; Sanctum Requirements
                      </h4>
                      <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                        Provide estimated proportions or specific temple deity details:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                            Deity Name or Temple Project
                          </label>
                          <input
                            type="text"
                            name="deityDetails"
                            value={formData.deityDetails}
                            onChange={handleInputChange}
                            placeholder="e.g. Lord Venkateswara Kireedam, Murugan Vel, Ganesha Idol"
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              background: C.bg1,
                              border: `1px solid ${C.border}`,
                              borderRadius: 4,
                              color: C.text,
                              fontSize: 13,
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                            Approximate Dimensions / Height
                          </label>
                          <input
                            type="text"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleInputChange}
                            placeholder="e.g. 2.5 Feet Height, 18 Inches Width, or Sanctum Door Size"
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              background: C.bg1,
                              border: `1px solid ${C.border}`,
                              borderRadius: 4,
                              color: C.text,
                              fontSize: 13,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4: REFERENCE IMAGES */}
              {step === 4 && (
                <div>
                  <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                    4. Reference Photos or Sketches (Optional)
                  </h4>
                  <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                    {formData.artworkType === 'Custom Jewellery' 
                      ? 'Upload inspiration images, design sketches, or similar jewellery pieces you admire (max 3):'
                      : 'Upload existing deity photos, antique pieces to restore, or design drawings (max 3):'
                    }
                  </p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '32px 20px',
                      border: `1px dashed ${C.borderGold}`,
                      borderRadius: 4,
                      background: 'rgba(212, 175, 55, 0.03)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8, color: C.gold }}>📷</div>
                    <div style={{ ...ff.body, fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>
                      Click to Browse Reference Images
                    </div>
                    <div style={{ ...ff.body, fontSize: 10, color: C.faint }}>
                      Supports JPG, PNG, WEBP up to 10MB each
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Image Previews */}
                  {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.borderGold}` }}>
                          <img src={src} alt={`Upload ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: 'rgba(0,0,0,0.75)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 18,
                              height: 18,
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: TIMELINE & BUDGET */}
              {step === 5 && (
                <div>
                  <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                    5. {formData.artworkType === 'Custom Jewellery' ? 'Timeline & Budget Expectations' : 'Project Timeline &amp; Budget Outlook'}
                  </h4>
                  <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                    {formData.artworkType === 'Custom Jewellery' 
                      ? 'Share your preferred timeline and budget range for your custom jewellery piece:'
                      : 'Help us understand your consecrated installation milestone:'
                    }
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Required Timeline
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.bg1,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          color: C.text,
                          fontSize: 13,
                        }}
                      >
                        {formData.artworkType === 'Custom Jewellery' ? (
                          <>
                            <option value="Urgent (2 Weeks)">Urgent (2 Weeks)</option>
                            <option value="Within 1 Month">Within 1 Month</option>
                            <option value="Within 3 Months">Standard (2 to 3 Months)</option>
                            <option value="Flexible">Flexible Timeline</option>
                          </>
                        ) : (
                          <>
                            <option value="Urgent (1 Month)">Urgent (1 Month / Upcoming Festival)</option>
                            <option value="Within 3 Months">Standard (2 to 3 Months)</option>
                            <option value="3 to 6 Months">Major Project (3 to 6 Months)</option>
                            <option value="Flexible / Planning Stage">Flexible / Temple Planning Stage</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Budget Range (Optional)
                      </label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder={formData.artworkType === 'Custom Jewellery' 
                          ? 'e.g. ₹25,000 - ₹1,00,000 or Flexible'
                          : 'e.g. ₹50,000 - ₹2,00,000 or Custom Temple Allocation'
                        }
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.bg1,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          color: C.text,
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        {formData.artworkType === 'Custom Jewellery' 
                          ? 'Design Preferences & Additional Notes'
                          : 'Additional Notes / Iconographic Description'
                        }
                      </label>
                      <textarea
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder={formData.artworkType === 'Custom Jewellery' 
                          ? 'Describe your vision, preferred design style, gemstone preferences, sizing requirements, or any special occasions this piece commemorates...'
                          : 'Specific details such as stone color preferences, deity posture, or temple location...'
                        }
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.bg1,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          color: C.text,
                          fontSize: 13,
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CONTACT & CONSULTATION DETAILS */}
              {step === 6 && (
                <div>
                  <h4 style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                    6. {formData.artworkType === 'Custom Jewellery' ? 'Your Contact Details' : 'Patron Contact &amp; Verification'}
                  </h4>
                  <p style={{ ...ff.body, fontSize: 12, color: C.dim, marginBottom: 20 }}>
                    {formData.artworkType === 'Custom Jewellery' 
                      ? 'Please provide your contact information so we can discuss your custom jewellery commission:'
                      : 'Please provide your contact details for proprietor I. Vijay to consult directly:'
                    }
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Srikanth Ramanathan / Temple Trustee"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.bg1,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          color: C.text,
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+91 98400..."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            background: C.bg1,
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            color: C.text,
                            fontSize: 13,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                          WhatsApp (if different)
                        </label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="+91..."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            background: C.bg1,
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            color: C.text,
                            fontSize: 13,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourname@gmail.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.bg1,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4,
                          color: C.text,
                          fontSize: 13,
                        }}
                      />
                    </div>
                  </div>

                  {/* Privacy Policy & Terms Checkbox */}
                  <div
                    style={{
                      marginTop: 24,
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
                        {' '}of Vijay Metal Works. I understand that by submitting this commission inquiry, I consent to the collection and processing of my contact information as outlined in the Privacy Policy.
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      ...ff.body,
                      background: 'none',
                      border: `1px solid ${C.border}`,
                      color: C.dim,
                      padding: '10px 22px',
                      borderRadius: 4,
                      fontSize: 11,
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    ← BACK
                  </button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    style={{
                      ...ff.body,
                      background: C.gold,
                      color: '#000',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    CONTINUE →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting || !formData.agreedToTerms}
                    onClick={handleSubmit}
                    style={{
                      ...ff.body,
                      background: formData.agreedToTerms ? C.goldGrad : C.border,
                      color: formData.agreedToTerms ? '#000' : C.faint,
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '.18em',
                      textTransform: 'uppercase',
                      cursor: (submitting || !formData.agreedToTerms) ? 'not-allowed' : 'pointer',
                      opacity: (submitting || !formData.agreedToTerms) ? 0.6 : 1,
                      boxShadow: formData.agreedToTerms ? `0 4px 18px ${C.gold}44` : 'none',
                      transition: 'all 0.25s',
                    }}
                  >
                    {submitting ? 'SENDING INQUIRY…' : 'SUBMIT COMMISSION ENQUIRY'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CommissionModal;
