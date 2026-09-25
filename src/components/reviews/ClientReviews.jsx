import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItem } from '../common/Animations';
import { GoldRule } from '../common/Button';
import { SUPABASE_CONFIG, supabase, supabaseCall } from '../../lib/supabase';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Luxury Heritage Palette Constants
const PALETTE = {
  obsidian: '#0B0B0A',
  surface: '#141312',
  secondarySurface: '#191817',
  warmIvory: '#F2EEE6',
  mutedText: 'rgba(242, 238, 230, 0.62)',
  faintText: 'rgba(242, 238, 230, 0.38)',
  antiqueGold: '#B08A45',
  refinedGold: '#C8A460',
  border: 'rgba(176, 138, 69, 0.25)',
  borderActive: 'rgba(200, 164, 96, 0.55)',
  backdrop: 'rgba(0, 0, 0, 0.78)',
};

const ClientReviews = () => {
  const C = useTheme();

  // State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Form Controls / Setting State (Fail-closed default)
  const [formEnabled, setFormEnabled] = useState(false);
  const [closedMessage, setClosedMessage] = useState('Client review submissions are currently closed.');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Refs for Background Lock, Accessibility, and Focus Trap
  const fileInputRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const scrollPosRef = useRef(0);

  // 1. Fetch Setting: client_reviews_enabled
  useEffect(() => {
    let isMounted = true;
    const fetchReviewSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('branding_config')
          .eq('id', 'global');

        if (error || !data || data.length === 0) {
          if (isMounted) {
            setFormEnabled(true);
            setSettingsLoaded(true);
          }
          return;
        }

        if (!isMounted) return;
        const cfg = data[0]?.branding_config || {};
        const isEnabled = cfg.client_reviews_enabled !== false;
        setFormEnabled(isEnabled);
        if (cfg.client_reviews_closed_message) {
          setClosedMessage(cfg.client_reviews_closed_message);
        }
      } catch (err) {
        console.warn('[ClientReviews] Could not load review settings:', err);
        if (isMounted) setFormEnabled(true);
      } finally {
        if (isMounted) setSettingsLoaded(true);
      }
    };
    fetchReviewSetting();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Approved Reviews via fluent Supabase client
  const loadReviews = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[ClientReviews] Supabase URL:', SUPABASE_CONFIG.url);
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ClientReviews] Supabase query failed:', error);
        setFetchError(error.message || 'Failed to load reviews');
        setReviews([]);
        return;
      }

      console.log('[ClientReviews] Approved reviews successfully loaded:', Array.isArray(data) ? data.length : 0, data);
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('[ClientReviews] Network error querying reviews:', err);
      setFetchError(err.message || 'Network error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mount & Window Focus Re-fetch (automatically shows newly approved reviews without redeployment)
  useEffect(() => {
    loadReviews();

    const handleFocus = () => {
      console.log('[ClientReviews] Window focused — refreshing approved reviews');
      loadReviews();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadReviews]);

  // URL Hash & Deep Link Handling (#client-reviews, #write-review, ?review=open)
  useEffect(() => {
    const handleUrlHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#client-reviews' || hash === '#write-review' || search.includes('review=open')) {
        const el = document.getElementById('client-reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        if ((hash === '#write-review' || search.includes('review=open')) && formEnabled) {
          setIsModalOpen(true);
        }
      }
    };

    const timer = setTimeout(handleUrlHash, 300);
    window.addEventListener('hashchange', handleUrlHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleUrlHash);
    };
  }, [formEnabled]);

  // Log analytics event safely
  const logEvent = async (eventType, meta = {}) => {
    try {
      await supabaseCall('/analytics_events', 'POST', {
        event_type: eventType,
        metadata: meta,
      });
    } catch (_) {
      // non-critical analytics logging
    }
  };

  // 3. Robust Background Scroll Lock & Focus Trap
  useEffect(() => {
    if (isModalOpen) {
      // Record exact scroll position
      scrollPosRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      // Lock document body completely (prevent wheel, touch, and scroll jumping)
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      // Focus first input inside dialog
      const focusTimer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 60);

      // Focus trap and Escape key listener
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restore document body
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';

      if (top) {
        const restoreY = Math.abs(parseInt(top, 10)) || scrollPosRef.current || 0;
        window.scrollTo({ top: restoreY, behavior: 'instant' });
      }

      // Restore focus to trigger button
      if (triggerBtnRef.current) {
        triggerBtnRef.current.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const openModal = () => {
    if (!formEnabled) return; // Fail closed: do not allow open if disabled
    triggerBtnRef.current = document.activeElement;
    setIsModalOpen(true);
    setFormSuccess(false);
    setFormError('');
    logEvent('review_form_view');
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setFormError('');
  };

  // Image Selection Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFormError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError(`Image size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`);
      return;
    }

    setFormError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Double check form is enabled
    if (!formEnabled) {
      setFormError('Review submissions are currently closed.');
      return;
    }

    // Validation
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!reviewText.trim()) {
      setFormError('Please write your review or experience.');
      return;
    }
    if (!consent) {
      setFormError('Please confirm your consent to publish your review.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      let uploadedImageUrl = null;

      // Upload image if present
      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

        // Attempt upload to review-images bucket
        let uploadRes = await fetch(
          `${SUPABASE_CONFIG.url}/storage/v1/object/review-images/${fileName}`,
          {
            method: 'POST',
            headers: {
              apikey: SUPABASE_CONFIG.key,
              Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
              'Content-Type': selectedFile.type,
              'x-upsert': 'true',
            },
            body: selectedFile,
          }
        );

        if (uploadRes.ok) {
          uploadedImageUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/review-images/${fileName}`;
          logEvent('review_image_uploaded', { bucket: 'review-images' });
        } else {
          // Fallback to gallery-images/reviews
          const fallbackRes = await fetch(
            `${SUPABASE_CONFIG.url}/storage/v1/object/gallery-images/reviews/${fileName}`,
            {
              method: 'POST',
              headers: {
                apikey: SUPABASE_CONFIG.key,
                Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
                'Content-Type': selectedFile.type,
                'x-upsert': 'true',
              },
              body: selectedFile,
            }
          );
          if (fallbackRes.ok) {
            uploadedImageUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/gallery-images/reviews/${fileName}`;
            logEvent('review_image_uploaded', { bucket: 'gallery-images/reviews' });
          } else {
            console.warn('Storage upload note: image could not be uploaded, proceeding without image.');
          }
        }
      }

      // Insert record into reviews table with status = 'pending'
      const reviewPayload = {
        name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        organisation: organisation.trim() || null,
        rating: Number(rating),
        review_text: reviewText.trim(),
        image_url: uploadedImageUrl,
        status: 'pending',
        is_featured: false,
        display_order: 0,
      };

      const insertRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_CONFIG.key,
          Authorization: `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(reviewPayload),
      });

      if (!insertRes.ok) {
        const errBody = await insertRes.text();
        throw new Error(errBody || 'Failed to submit review');
      }

      // Log event
      logEvent('review_submitted', { rating, has_image: !!uploadedImageUrl });

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setOrganisation('');
      setRating(5);
      setReviewText('');
      removeSelectedFile();
      setConsent(false);
      setFormSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError('Unable to submit your review at this time. Please check your connection or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable input styling for refined editorial form
  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    background: PALETTE.secondarySurface,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 6,
    color: PALETTE.warmIvory,
    ...ff.body,
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s, box-shadow .2s',
  };

  return (
    <section
      id="client-reviews"
      className="section-pad vmw-client-reviews-section"
      style={{
        position: 'relative',
        zIndex: 2,
        background: C.bg3,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div className="vmw-container">
        {/* Section Heading */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                ...ff.body,
                fontSize: 9,
                letterSpacing: '.48em',
                color: C.dim,
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 14,
                opacity: 0.85,
              }}
            >
              CLIENT REVIEWS
            </span>
            <h2
              style={{
                ...ff.display,
                fontSize: 'clamp(28px,4.5vw,56px)',
                lineHeight: 1.05,
                letterSpacing: '.04em',
                color: C.text,
                fontWeight: 700,
              }}
            >
              TRUST BUILT THROUGH <span style={{ color: C.gold }}>CRAFTSMANSHIP</span>
            </h2>
            <p
              style={{
                ...ff.serif,
                fontSize: 15,
                color: C.dim,
                fontStyle: 'italic',
                maxWidth: 580,
                margin: '16px auto 0',
                lineHeight: 1.7,
              }}
            >
              Feedback from clients and partners who have experienced the craftsmanship and service of Vijay Metal Works.
            </p>

            {/* Action Area: Controlled by client_reviews_enabled */}
            <div style={{ marginTop: 28 }}>
              {settingsLoaded && formEnabled ? (
                <button
                  ref={triggerBtnRef}
                  onClick={openModal}
                  style={{
                    background: PALETTE.obsidian,
                    border: `1px solid ${PALETTE.antiqueGold}`,
                    color: PALETTE.warmIvory,
                    ...ff.body,
                    fontSize: 9,
                    letterSpacing: '.3em',
                    fontWeight: 700,
                    padding: '12px 28px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    transition: 'border-color .25s, background .25s, box-shadow .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = PALETTE.refinedGold;
                    e.currentTarget.style.background = PALETTE.surface;
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,164,96,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = PALETTE.antiqueGold;
                    e.currentTarget.style.background = PALETTE.obsidian;
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)';
                  }}
                >
                  <span style={{ color: PALETTE.refinedGold }}>★</span> SHARE YOUR EXPERIENCE
                </button>
              ) : settingsLoaded && !formEnabled ? (
                <div
                  style={{
                    display: 'inline-block',
                    padding: '9px 20px',
                    border: '1px solid rgba(176,138,69,0.18)',
                    borderRadius: 4,
                    background: 'rgba(20,19,18,0.5)',
                    ...ff.body,
                    fontSize: 10,
                    letterSpacing: '.16em',
                    color: 'rgba(242,238,230,0.52)',
                    textTransform: 'uppercase',
                  }}
                >
                  {closedMessage}
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* Reviews Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.dim, ...ff.body, fontSize: 13 }}>
            <div style={{ display: 'inline-block', width: 22, height: 22, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%', marginBottom: 12 }} />
            <div>Loading verified reviews…</div>
          </div>
        ) : fetchError ? (
          /* Error State: Never silently hide errors as empty */
          <div
            style={{
              maxWidth: 580,
              margin: '0 auto',
              textAlign: 'center',
              padding: '36px 24px',
              background: C.surfaceWarm,
              border: `1px solid rgba(230, 80, 80, 0.28)`,
              borderRadius: 8,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 24, color: '#E06C75', marginBottom: 10 }}>⚠</div>
            <h4 style={{ ...ff.display, fontSize: 16, color: C.text, margin: '0 0 8px' }}>
              Client Reviews Temporarily Unavailable
            </h4>
            <p style={{ ...ff.body, fontSize: 12.5, color: C.dim, lineHeight: 1.6, margin: '0 0 18px' }}>
              We could not retrieve patron feedback at this moment.
            </p>
            <button
              onClick={loadReviews}
              style={{
                background: PALETTE.obsidian,
                border: `1px solid ${PALETTE.antiqueGold}`,
                color: PALETTE.warmIvory,
                ...ff.body,
                fontSize: 8.5,
                letterSpacing: '.24em',
                fontWeight: 700,
                padding: '9px 20px',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div
            style={{
              maxWidth: 620,
              margin: '0 auto',
              textAlign: 'center',
              padding: '48px 32px',
              background: C.surfaceWarm,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              position: 'relative',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 28, color: C.gold, marginBottom: 14, opacity: 0.9 }}>❖</div>
            <p
              style={{
                ...ff.serif,
                fontSize: 16,
                color: C.text,
                fontStyle: 'italic',
                lineHeight: 1.8,
                margin: '0 0 20px',
              }}
            >
              &ldquo;Client reviews will appear here as they are published.&rdquo;
            </p>
            <p style={{ ...ff.body, fontSize: 12, color: C.dim, margin: '0 0 24px', letterSpacing: '.04em' }}>
              Have you worked with Vijay Metal Works on a temple metalwork project?
            </p>
            {formEnabled ? (
              <button
                onClick={openModal}
                style={{
                  background: PALETTE.obsidian,
                  border: `1px solid ${PALETTE.antiqueGold}`,
                  color: PALETTE.warmIvory,
                  ...ff.body,
                  fontSize: 8.5,
                  letterSpacing: '.28em',
                  fontWeight: 700,
                  padding: '10px 22px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'border-color .2s, background .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = PALETTE.refinedGold;
                  e.currentTarget.style.background = PALETTE.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = PALETTE.antiqueGold;
                  e.currentTarget.style.background = PALETTE.obsidian;
                }}
              >
                Write First Review
              </button>
            ) : (
              <div style={{ ...ff.body, fontSize: 11, color: PALETTE.mutedText, letterSpacing: '.08em' }}>
                {closedMessage}
              </div>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <StaggerContainer
            stagger={0.08}
            delay={0.05}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 22,
              marginBottom: 40,
            }}
          >
            {reviews.map((r) => {
              const hasImage = Boolean(r.image_url);
              return (
                <StaggerItem key={r.id}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: C.borderHi }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: C.surfaceWarm,
                      border: `1px solid ${r.is_featured ? C.gold : C.border}`,
                      borderRadius: 8,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      boxShadow: r.is_featured ? `0 4px 20px rgba(200,164,96,0.12)` : 'none',
                    }}
                  >
                    {/* Featured Ribbon */}
                    {r.is_featured && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 12,
                          background: `${C.gold}22`,
                          border: `1px solid ${C.gold}66`,
                          color: C.gold,
                          ...ff.body,
                          fontSize: 7.5,
                          fontWeight: 700,
                          letterSpacing: '.22em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 3,
                          zIndex: 2,
                        }}
                      >
                        ★ FEATURED
                      </div>
                    )}

                    {/* Image View (if present) */}
                    {hasImage && (
                      <div
                        onClick={() => setLightboxImg(r.image_url)}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: 220,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: '#050403',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                        title="Click to view full image"
                      >
                        <img
                          src={r.image_url}
                          alt={r.name ? `${r.name} commission` : 'Client Review Image'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform .4s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.65)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            ...ff.body,
                            fontSize: 9,
                            color: '#fff',
                            letterSpacing: '.1em',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          🔍 Expand
                        </div>
                      </div>
                    )}

                    {/* Content Body */}
                    <div
                      style={{
                        padding: hasImage ? '20px 22px' : '26px 24px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}
                    >
                      {/* Giant Quote Watermark for pure text cards */}
                      {!hasImage && (
                        <div
                          style={{
                            ...ff.display,
                            fontSize: 90,
                            color: C.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                            position: 'absolute',
                            top: -10,
                            left: 14,
                            lineHeight: 1,
                            fontWeight: 900,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          &ldquo;
                        </div>
                      )}

                      <div>
                        {/* Rating Stars */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                          {Array.from({ length: 5 }).map((_, si) => (
                            <span
                              key={si}
                              style={{
                                fontSize: 13,
                                color: si < (r.rating || 5) ? C.gold : 'rgba(255,255,255,0.15)',
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Review Text */}
                        <p
                          style={{
                            ...ff.serif,
                            fontSize: 14.5,
                            lineHeight: 1.8,
                            color: C.text,
                            fontStyle: 'italic',
                            fontWeight: 300,
                            marginBottom: 20,
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          &ldquo;{r.review_text}&rdquo;
                        </p>
                      </div>

                      {/* Footer: Name, Organisation, Badge */}
                      <div>
                        <GoldRule opacity={0.12} my={14} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div
                              style={{
                                ...ff.display,
                                fontSize: 14,
                                color: C.text,
                                fontWeight: 600,
                                letterSpacing: '.03em',
                                marginBottom: 3,
                              }}
                            >
                              {r.name}
                            </div>
                            {r.organisation && (
                              <div
                                style={{
                                  ...ff.body,
                                  fontSize: 10,
                                  color: C.gold,
                                  letterSpacing: '.14em',
                                  textTransform: 'uppercase',
                                  fontWeight: 500,
                                }}
                              >
                                {r.organisation}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              ...ff.body,
                              fontSize: 8,
                              color: C.faint,
                              letterSpacing: '.2em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Verified Patron
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>

      {/* ── REDESIGNED REVIEW FORM MODAL WITH BACKGROUND LOCK ── */}
      <AnimatePresence>
        {isModalOpen && formEnabled && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {/* Backdrop: Dark 78% with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeModal}
              style={{
                position: 'fixed',
                inset: 0,
                background: PALETTE.backdrop,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
              aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
              aria-describedby="review-modal-desc"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: PALETTE.obsidian,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 12,
                width: '100%',
                maxWidth: 640,
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '32px 30px',
                boxShadow: '0 24px 72px rgba(0,0,0,0.9), 0 0 1px rgba(200,164,96,0.35)',
                zIndex: 2,
                boxSizing: 'border-box',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'none',
                  border: 'none',
                  color: PALETTE.mutedText,
                  fontSize: 20,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 6,
                  borderRadius: 4,
                  transition: 'color .2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = PALETTE.refinedGold; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = PALETTE.mutedText; }}
                aria-label="Close dialog"
              >
                ✕
              </button>

              {formSuccess ? (
                /* Success State */
                <div style={{ textAlign: 'center', padding: '28px 12px' }}>
                  <div style={{ fontSize: 40, color: PALETTE.refinedGold, marginBottom: 14 }}>❖</div>
                  <h3
                    id="review-modal-title"
                    style={{
                      ...ff.display,
                      fontSize: 22,
                      color: PALETTE.warmIvory,
                      letterSpacing: '.04em',
                      marginBottom: 12,
                    }}
                  >
                    Thank You
                  </h3>
                  <p
                    id="review-modal-desc"
                    style={{
                      ...ff.body,
                      fontSize: 14,
                      color: PALETTE.mutedText,
                      lineHeight: 1.7,
                      marginBottom: 26,
                      maxWidth: 460,
                      margin: '0 auto 26px',
                    }}
                  >
                    Your review has been submitted for editorial verification and will appear on the website once approved by our atelier.
                  </p>
                  <button
                    onClick={closeModal}
                    style={{
                      background: PALETTE.obsidian,
                      border: `1px solid ${PALETTE.antiqueGold}`,
                      color: PALETTE.warmIvory,
                      ...ff.body,
                      fontSize: 9.5,
                      letterSpacing: '.28em',
                      fontWeight: 700,
                      padding: '12px 32px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* Form View */
                <div>
                  {/* Modal Header */}
                  <div style={{ marginBottom: 24 }}>
                    <span
                      style={{
                        ...ff.body,
                        fontSize: 8.5,
                        letterSpacing: '.38em',
                        color: PALETTE.refinedGold,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      CLIENT TESTIMONIAL
                    </span>
                    <h3
                      id="review-modal-title"
                      style={{
                        ...ff.display,
                        fontSize: 22,
                        color: PALETTE.warmIvory,
                        margin: 0,
                        fontWeight: 700,
                        letterSpacing: '.03em',
                      }}
                    >
                      SHARE YOUR EXPERIENCE
                    </h3>
                    <p
                      id="review-modal-desc"
                      style={{
                        ...ff.serif,
                        fontSize: 13.5,
                        color: PALETTE.mutedText,
                        margin: '8px 0 0',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;Your experience helps us preserve the story behind every piece of temple craftsmanship.&rdquo;
                    </p>
                  </div>

                  {formError && (
                    <div
                      style={{
                        padding: '11px 14px',
                        background: 'rgba(255,77,77,0.1)',
                        border: '1px solid rgba(255,77,77,0.3)',
                        borderRadius: 6,
                        color: '#ff8585',
                        ...ff.body,
                        fontSize: 12.5,
                        marginBottom: 18,
                        lineHeight: 1.5,
                      }}
                    >
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* 1. Full Name (Required) */}
                    <div>
                      <label style={{ ...ff.body, fontSize: 10.5, letterSpacing: '.12em', color: PALETTE.warmIvory, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Full Name <span style={{ color: PALETTE.refinedGold }}>*</span>
                      </label>
                      <input
                        ref={firstInputRef}
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sri. R. Ramanathan"
                        style={inputStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.refinedGold;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${PALETTE.borderActive}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.border;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* 2. Temple / Organisation / City */}
                    <div>
                      <label style={{ ...ff.body, fontSize: 10.5, letterSpacing: '.12em', color: PALETTE.warmIvory, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Temple / Organisation / City
                      </label>
                      <input
                        type="text"
                        value={organisation}
                        onChange={(e) => setOrganisation(e.target.value)}
                        placeholder="e.g. Kapaleeswarar Temple Trustee / Chennai"
                        style={inputStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.refinedGold;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${PALETTE.borderActive}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.border;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* 3. Interactive Star Rating */}
                    <div>
                      <label style={{ ...ff.body, fontSize: 10.5, letterSpacing: '.12em', color: PALETTE.warmIvory, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Your Rating <span style={{ color: PALETTE.refinedGold }}>*</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = star <= (hoverRating || rating);
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 22,
                                color: isActive ? PALETTE.refinedGold : 'rgba(242,238,230,0.18)',
                                transition: 'color .15s, transform .15s',
                                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                                padding: '2px',
                              }}
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              ★
                            </button>
                          );
                        })}
                        <span style={{ ...ff.body, fontSize: 11.5, color: PALETTE.refinedGold, marginLeft: 8, fontWeight: 600 }}>
                          {rating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    {/* 4. Review Narrative (Required) */}
                    <div>
                      <label style={{ ...ff.body, fontSize: 10.5, letterSpacing: '.12em', color: PALETTE.warmIvory, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Your Review / Experience <span style={{ color: PALETTE.refinedGold }}>*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Describe the craftsmanship, Panchaloha casting, kireedam fit, silver nagas work, or timely delivery..."
                        style={{
                          ...inputStyle,
                          height: 'auto',
                          minHeight: 96,
                          padding: '12px 14px',
                          lineHeight: 1.6,
                          resize: 'vertical',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.refinedGold;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${PALETTE.borderActive}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = PALETTE.border;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* 5. Optional Image Upload */}
                    <div>
                      <label style={{ ...ff.body, fontSize: 10.5, letterSpacing: '.12em', color: PALETTE.warmIvory, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Photograph of Completed Work <span style={{ color: PALETTE.faintText, fontSize: 9.5, textTransform: 'none' }}>(Optional · JPG, PNG, WEBP · Max 5MB)</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />

                      {!previewUrl ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: PALETTE.surface,
                            border: `1px dashed ${PALETTE.border}`,
                            borderRadius: 6,
                            color: PALETTE.mutedText,
                            ...ff.body,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'border-color .2s, color .2s, background .2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.refinedGold;
                            e.currentTarget.style.color = PALETTE.warmIvory;
                            e.currentTarget.style.background = PALETTE.secondarySurface;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.border;
                            e.currentTarget.style.color = PALETTE.mutedText;
                            e.currentTarget.style.background = PALETTE.surface;
                          }}
                        >
                          <span style={{ color: PALETTE.refinedGold }}>📷</span> Upload photo of completed work or consecrated piece
                        </button>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            background: PALETTE.surface,
                            border: `1px solid ${PALETTE.border}`,
                            borderRadius: 6,
                          }}
                        >
                          <img
                            src={previewUrl}
                            alt="Selected upload preview"
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 4,
                              border: `1px solid ${PALETTE.border}`,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...ff.body, fontSize: 12, color: PALETTE.warmIvory, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedFile?.name}
                            </div>
                            <div style={{ ...ff.body, fontSize: 10, color: PALETTE.faintText, marginTop: 2 }}>
                              {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: PALETTE.refinedGold,
                                fontSize: 11,
                                cursor: 'pointer',
                                ...ff.body,
                                padding: '4px 6px',
                                textDecoration: 'underline',
                              }}
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeSelectedFile}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff7777',
                                fontSize: 11,
                                cursor: 'pointer',
                                ...ff.body,
                                padding: '4px 6px',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 6. Private verification info (Email / Phone) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ ...ff.body, fontSize: 10, letterSpacing: '.1em', color: PALETTE.faintText, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Email <span style={{ fontSize: 9, color: PALETTE.faintText }}>(Private / verification only)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patron@example.com"
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.refinedGold;
                            e.currentTarget.style.boxShadow = `0 0 0 1px ${PALETTE.borderActive}`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.border;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ ...ff.body, fontSize: 10, letterSpacing: '.1em', color: PALETTE.faintText, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                          Phone / WhatsApp <span style={{ fontSize: 9, color: PALETTE.faintText }}>(Private / verification only)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.refinedGold;
                            e.currentTarget.style.boxShadow = `0 0 0 1px ${PALETTE.borderActive}`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = PALETTE.border;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* 7. Consent Checkbox (Required) */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                      <input
                        type="checkbox"
                        id="review-consent"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        style={{ marginTop: 3, accentColor: PALETTE.refinedGold, cursor: 'pointer' }}
                      />
                      <label htmlFor="review-consent" style={{ ...ff.body, fontSize: 11.5, color: PALETTE.mutedText, lineHeight: 1.5, cursor: 'pointer' }}>
                        I agree to have my review published on the Vijay Metal Works website. Private contact details will remain strictly confidential.
                      </label>
                    </div>

                    {/* 8. Refined Submit Button */}
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          width: '100%',
                          height: 48,
                          background: PALETTE.obsidian,
                          border: `1px solid ${PALETTE.antiqueGold}`,
                          borderRadius: 6,
                          color: PALETTE.warmIvory,
                          ...ff.body,
                          fontSize: 9.5,
                          letterSpacing: '.28em',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          opacity: submitting ? 0.7 : 1,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                          transition: 'border-color .25s, background .25s, box-shadow .25s',
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting) {
                            e.currentTarget.style.borderColor = PALETTE.refinedGold;
                            e.currentTarget.style.background = PALETTE.surface;
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,164,96,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!submitting) {
                            e.currentTarget.style.borderColor = PALETTE.antiqueGold;
                            e.currentTarget.style.background = PALETTE.obsidian;
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
                          }
                        }}
                      >
                        {submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX PREVIEW MODAL ── */}
      <AnimatePresence>
        {lightboxImg && (
          <div
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              cursor: 'zoom-out',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '85vh',
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 8,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <img
                src={lightboxImg}
                alt="Enlarged review commission detail"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <button
                onClick={() => setLightboxImg(null)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(0,0,0,0.7)',
                  border: `1px solid ${PALETTE.border}`,
                  color: '#fff',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClientReviews;
