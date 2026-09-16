/* ---------------------------------------------------------------
   RESPONSIVE SYSTEM — Vijay Metal Works
   Shared clamp() tokens for typography and spacing.
   Import { rp } and use as inline style values.
--------------------------------------------------------------- */
export const rp = {
  /* ── Typography scale ──────────────────────────────────────── */
  // H1 — hero brand title
  h1: 'clamp(32px, 7.5vw, 76px)',
  // H2 — section headings
  h2: 'clamp(26px, 4.5vw, 58px)',
  // H3 — card / step titles
  h3: 'clamp(18px, 2.2vw, 28px)',
  // Body text
  body: 'clamp(13px, 1.3vw, 15px)',
  // Small / captions
  small: 'clamp(11px, 1.1vw, 13px)',
  // Label / eyebrow (uppercase tiny)
  label: 'clamp(9px, 0.9vw, 11px)',

  /* ── Spacing ────────────────────────────────────────────────── */
  // Horizontal page gutter (section inner padding)
  px: 'clamp(16px, 5vw, 64px)',
  // Vertical section rhythm
  py: 'clamp(60px, 8vw, 120px)',
};

export default rp;
