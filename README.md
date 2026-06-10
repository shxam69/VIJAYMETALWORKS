# 🏛️ Vijay Metal Works — Full Project Documentation

> **Two-repo system:** A public-facing website + a private admin dashboard, both powered by Supabase.

---

## 📁 Project Structure

```
for claude/
├── VMW-WEBSITE/          ← Public website (React + Supabase)
│   ├── src/App.jsx       ← Entire frontend (6,654 lines, single-file React app)
│   ├── public/gallery/   ← Static image assets (gold / silver / stone / temple)
│   ├── .env.local        ← ✅ FIXED — now uses REACT_APP_ prefix
│   ├── SUPABASE_SCHEMA.sql   ← Full DB schema (run once on fresh Supabase project)
│   └── SUPABASE_PATCH.sql    ← ✅ NEW — run this if DB already exists
│
└── vmw-admin/            ← Admin dashboard (standalone React app)
    ├── src/App.js        ← Full admin dashboard (748 lines)
    ├── src/AdminApp.jsx  ← Older backup (safe to delete)
    ├── .env              ← Supabase keys for admin
    └── public/index.html ← ✅ FIXED — title updated to "VMW Admin"
```

---

## 🐛 Bugs Fixed (Full Audit)

### 🔴 Critical Fixes

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 1 | `VMW-WEBSITE/.env.local` | Used `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **wrong prefix for Create React App**. The entire app read `REACT_APP_*` variables, so Supabase was completely disabled in development (gallery uploads, commission form, auth, likes/saves/comments all silently failed) | Renamed to `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` ✅ |
| 2 | `SUPABASE_SCHEMA.sql` — `inquiries` table | `status` column had a `CHECK` constraint allowing only `('new','contacted','in_progress','completed','rejected')` — **`'pending'` was missing**. The commission form always sends `status='pending'` → every form submission was rejected by the database with a constraint violation | Added `'pending'` to the CHECK constraint; changed default from `'new'` to `'pending'` ✅ |
| 3 | `SUPABASE_SCHEMA.sql` — `inquiries` table | `notes` column didn't exist in the schema but `CommissionModal` always sends a `notes` field (combined description of artwork type, metal, budget, timeline). This caused inserts to fail on strict schemas | Added `notes TEXT` column to schema ✅ |
| 4 | `vmw-admin/.gitignore` | Only excluded `.env.local` — the admin uses plain `.env` (not `.env.local`), so **Supabase API keys would be committed to Git** | Added `.env` to `.gitignore` ✅ |

### 🟡 Important Fixes

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 5 | `vmw-admin/package.json` | `start` script had no `PORT` override — admin would always try port 3000, conflicting with the website when both run locally | Set `PORT=3001` in start script ✅ |
| 6 | `vmw-admin/package.json` | `build` script didn't use `CI=false` — any ESLint warning would break the production build (same fix already present in website) | Added `CI=false` to build script ✅ |
| 7 | `vmw-admin/public/index.html` | Page title was still the CRA default `"React App"` — confusing in browser tabs and bookmarks | Updated to `"VMW Admin — Vijay Metal Works"` ✅ |

### 🟢 New File Created

| File | Purpose |
|------|---------|
| `VMW-WEBSITE/SUPABASE_PATCH.sql` | Run this against an **existing** Supabase database to apply all the schema fixes without wiping data. Includes: fixing the `status` CHECK constraint, adding missing columns (`notes`, `artwork_type`, `preferred_metal`, `budget`, `timeline`, `description`, `reference_images`), and notes on RLS policy setup. |

---

## ✅ Feature Audit — Website (`VMW-WEBSITE`)

### Navigation & UI
| Feature | Status | Notes |
|---------|--------|-------|
| Top nav (desktop pill) | ✅ Working | Animated, scroll-responsive, mega-menu dropdown |
| Mobile sticky bottom bar | ✅ Working | Shows WhatsApp + Commission buttons |
| Dark / Light / Auto theme | ✅ Working | Persists via OS preference, toggle button |
| Smooth scroll to sections | ✅ Working | Nav links scroll to `#id` anchors |
| `/gallery` route | ✅ Working | Full-page gallery + immersive feed |
| `/admin` route | ✅ Working | Admin dashboard (requires `vmw_admin_auth` in localStorage) |
| `/admin/login` route | ✅ Working | Auth via Supabase or dev fallback |
| Error Boundary | ✅ Working | Catches render errors, shows reload button |
| SEO meta tags | ✅ Working | Open Graph, Twitter Card, JSON-LD structured data |

### Gallery
| Feature | Status | Notes |
|---------|--------|-------|
| Static gallery images (23 items) | ✅ Working | Served from `/public/gallery/` — gold, silver, stone, temple |
| Dynamic Supabase gallery items | ✅ Working (after env fix) | Merges admin-uploaded items with static seeds |
| Category filter tabs | ✅ Working | All / Gold Work / Crown Work / Silver Work / Stone Work / Vigraham |
| Image lightbox / detail panel | ✅ Working | Full artisan notes, metal, purity, dimensions |
| Like button (heart) | ✅ Working | Optimistic UI + localStorage + Supabase sync |
| Save button (bookmark) | ✅ Working | Requires login; stored in Supabase `saved_items` |
| Comments | ✅ Working | Requires login; stored in Supabase `comments` |
| Immersive full-screen feed | ✅ Working | TikTok-style scroll at `/gallery/immersive` |
| Search within immersive feed | ✅ Working | Filters by deity name, category, metal |

### Commission / Contact
| Feature | Status | Notes |
|---------|--------|-------|
| Commission Modal (full form) | ✅ Working (after env fix) | Full Name, Phone, Email, WhatsApp, Artwork Type, Metal, Budget, Timeline, Description, Reference Images (up to 3) |
| Commission form → Supabase | ✅ Working (after schema fix) | Inserts to `inquiries` table with `status='pending'` |
| Commission form → WhatsApp fallback | ✅ Working | Opens WhatsApp with pre-filled message if Supabase fails |
| Reference image upload | ✅ Working | Uploads to `inquiry_references` Supabase storage bucket |
| Contact section (quick enquiry) | ✅ Working | Validates name/phone/description; WhatsApp fallback |
| WhatsApp FAB (floating button) | ✅ Working | Fixed position, opens `wa.me/919382877351` |

### Auth
| Feature | Status | Notes |
|---------|--------|-------|
| Sign In (email/password) | ✅ Working | Supabase Auth `/auth/v1/token` |
| Sign Up | ✅ Working | Supabase Auth `/auth/v1/signup` |
| Guest mode | ✅ Working | Skips auth; likes stored in localStorage only |
| Session restore on reload | ✅ Working | Reads `vmw_session` from localStorage; checks token expiry |
| Sign out | ✅ Working | Clears `vmw_session` |
| Google sign-in | ⚠️ Placeholder | Shows "Coming Soon" alert — not yet wired |
| Profile modal | ✅ Working | Shows liked/saved items from localStorage |

### Home Page Sections
| Section | Status |
|---------|--------|
| Hero (animated) | ✅ |
| Ticker (scrolling text) | ✅ |
| Legacy / Heritage | ✅ |
| Trusted By Temples | ✅ |
| Services | ✅ |
| Showcase / Process | ✅ |
| Real Work Photos | ✅ |
| Gallery Preview | ✅ |
| Testimonials | ✅ |
| FAQ (accordion) | ✅ |
| Archive | ✅ |
| Contact Form | ✅ |
| Footer | ✅ |

---

## ✅ Feature Audit — Admin Dashboard (`vmw-admin`)

| Feature | Status | Notes |
|---------|--------|-------|
| Login screen | ✅ Working | Email/password via Supabase Auth |
| Admin role check | ✅ Working | Verifies `profiles.role = 'admin'` after login |
| Dev fallback login | ✅ Working | `admin@vijaymetalworks.com` / `admin123` when no env vars set |
| Session persistence | ✅ Working | Stores in `vmw_admin_session` localStorage |
| Dashboard tab — stats | ✅ Working | Total artworks, pending inquiries, users, views |
| Dashboard tab — recent inquiries | ✅ Working | Last 5 inquiries with name/phone/status |
| Gallery tab — upload artwork | ✅ Working | Title, category, metal type, featured toggle, image upload |
| Gallery tab — 3-step upload | ✅ Working | Insert DB row → upload to storage → update image_url |
| Gallery tab — feature/unfeature | ✅ Working | Toggles `is_featured` flag |
| Gallery tab — delete artwork | ✅ Working | Confirm → delete DB row + storage file |
| Inquiries tab — list all | ✅ Working | Shows name, phone, email, status |
| Inquiries tab — update status | ✅ Working | Dropdown: pending/new/contacted/in_progress/completed/rejected |
| Inquiries tab — WhatsApp client | ✅ Working | Opens `wa.me/` link |
| Inquiries tab — Email client | ✅ Working | Opens `mailto:` link |
| Settings tab — SQL helper | ✅ Working | Copyable SQL to fix missing columns |
| Settings tab — Admin role SQL | ✅ Working | Instructions + SQL to grant admin role |
| Sign out | ✅ Working | Clears `vmw_admin_session` |
| Port isolation | ✅ Fixed | Runs on port 3001 (website on 3000) |

---

## 🚀 Running Locally

### Prerequisites
```bash
node >= 18
npm >= 9
```

### Website
```bash
cd VMW-WEBSITE
npm install
# .env.local already contains the Supabase keys (fixed)
npm start
# → http://localhost:3000
```

### Admin Dashboard
```bash
cd vmw-admin
npm install
# .env already contains the Supabase keys
npm start
# → http://localhost:3001  (PORT=3001 set in package.json)
```

---

## 🗄️ Supabase Setup

### Fresh database (first time)
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste the contents of `VMW-WEBSITE/SUPABASE_SCHEMA.sql` and run
4. Copy your project URL and anon key into both `.env` files

### Existing database (already set up)
1. Go to **SQL Editor → New Query**
2. Paste the contents of `VMW-WEBSITE/SUPABASE_PATCH.sql` and run
3. This safely adds missing columns and fixes the `status` constraint without dropping data

### Grant admin access
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Storage buckets (auto-created by schema)
| Bucket | Access | Used for |
|--------|--------|---------|
| `gallery-images` | Public | Admin-uploaded artwork photos |
| `inquiry_references` | Private | Customer reference images from commission form |
| `avatars` | Public | User profile pictures |

---

## 🌐 Deployment

### Website → Vercel
```bash
cd VMW-WEBSITE
# In Vercel dashboard, set these environment variables:
# REACT_APP_SUPABASE_URL = https://xxxx.supabase.co
# REACT_APP_SUPABASE_ANON_KEY = eyJ...
npm run build
```
The `vercel.json` already handles SPA routing rewrites. The `public/_redirects` handles Netlify if used instead.

### Admin → Separate Vercel project
```bash
cd vmw-admin
# Deploy to a DIFFERENT Vercel project
# Set env vars: REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY
# Recommended URL: admin.vijaymetalworks.com (keep private)
npm run build
```

---

## 📞 Business Info (Hardcoded in App.jsx)

| Field | Value |
|-------|-------|
| Owner | I. Vijay |
| Phone | +91 93828 77351 |
| Email | vijaymetalworks4u@gmail.com |
| Address | New No. 3, Old No. 19, Murugappa Street, Sowcarpet, Chennai – 600 079 |
| Founded | 1915 |
| WhatsApp | wa.me/919382877351 |

---

## ⚠️ Known Limitations / Future Work

| Item | Notes |
|------|-------|
| Google Sign-In | Wired as "Coming Soon" — needs Supabase OAuth provider setup |
| HEIC images (silver folder) | Browser doesn't support `.heic` — silver gallery only shows `kandabaranam.jpg`; convert HEIC files to JPG to add them |
| `og-image.jpg` | Missing from `/public/` — Open Graph preview image won't show on social shares until added |
| Admin tabs (Users, Collections, Comments, Analytics) | Show "module under development" — only Dashboard, Gallery, Inquiries, Settings are fully wired |
| `AdminApp.jsx` in `vmw-admin/src/` | Older duplicate of `App.js` — safe to delete |
| `App (13).jsx` and `App (8).jsx` in VMW-WEBSITE root | Old backup versions — safe to delete |

---

*Generated by full audit — May 2026*
