# VMW-WEBSITE Visual Architecture & Data Flow

## 1. Component Hierarchy Tree

```
App (BrowserRouter wrapper)
│
└─ AppContent
   ├─ Theme Context Provider
   │  └─ App Context Provider
   │     │
   │     ├─ SEOMeta (injected into <head>)
   │     ├─ CanvasBg (fixed position particle system)
   │     ├─ Grain (noise overlay)
   │     ├─ ThemeToggle
   │     │  └─ UI: Mode selector (Auto/Dark/Light)
   │     │
   │     ├─ Loader (onDone callback)
   │     │  └─ Cinematic text reveal animation
   │     │
   │     ├─ Motion.div (AnimatePresence wrapper)
   │     │  │
   │     │  └─ Routes
   │     │     │
   │     │     ├─ Route: / → HomePage
   │     │     │  │
   │     │     │  ├─ Nav (with gallery link)
   │     │     │  ├─ Hero section
   │     │     │  ├─ Ticker
   │     │     │  ├─ Legacy
   │     │     │  ├─ TrustedByTemples
   │     │     │  ├─ Services
   │     │     │  ├─ Showcase
   │     │     │  ├─ RealWorkPhotos
   │     │     │  ├─ ProcessSection
   │     │     │  ├─ GalleryPreview ⭐
   │     │     │  │  └─ Featured 6 items
   │     │     │  │     ├─ Masonry grid
   │     │     │  │     ├─ Hover animations
   │     │     │  │     └─ "View Full Gallery" button
   │     │     │  ├─ Testimonials
   │     │     │  ├─ FAQ
   │     │     │  ├─ Archive
   │     │     │  ├─ Contact
   │     │     │  └─ Footer
   │     │     │
   │     │     ├─ Route: /gallery → GalleryPage
   │     │     │  │
   │     │     │  ├─ Gallery Page Header
   │     │     │  ├─ Gallery Component ⭐⭐ (isFullPage=true)
   │     │     │  │  ├─ Filter buttons (All/Gold/Silver/Stone/Crown/Vigraham)
   │     │     │  │  ├─ Masonry grid (4 col desktop, 3 tablet, 2 mobile)
   │     │     │  │  │  └─ Items 0-22 (GALLERY_IDOLS)
   │     │     │  │  ├─ Dock navigation (magnifying glass)
   │     │     │  │  └─ Lightbox Modal (when selected)
   │     │     │  │     ├─ Large image display
   │     │     │  │     ├─ Description panel (left)
   │     │     │  │     │  ├─ Category badge
   │     │     │  │     │  ├─ Metal badge
   │     │     │  │     │  ├─ Deity name (h2)
   │     │     │  │     │  ├─ Description text
   │     │     │  │     │  └─ "View More" button
   │     │     │  │     ├─ Actions panel (right)
   │     │     │  │     │  ├─ Like button + count
   │     │     │  │     │  ├─ Comment button + count
   │     │     │  │     │  ├─ Save button (auth gated)
   │     │     │  │     │  └─ Commission button
   │     │     │  │     ├─ Navigation arrows (prev/next)
   │     │     │  │     ├─ Image counter badge (bottom-left)
   │     │     │  │     ├─ Close button
   │     │     │  │     ├─ Comment drawer (bottom slide-up)
   │     │     │  │     │  ├─ Comment list
   │     │     │  │     │  └─ Input + Post
   │     │     │  │     └─ Keyboard handlers (Escape, Arrows)
   │     │     │  └─ Contact form
   │     │     │
   │     │     ├─ Route: /admin → AdminDashboard
   │     │     │  ├─ Left sidebar with tabs
   │     │     │  ├─ Tab content
   │     │     │  │  ├─ Dashboard (stats cards)
   │     │     │  │  ├─ Gallery (upload UI)
   │     │     │  │  ├─ Inquiries (table with actions)
   │     │     │  │  └─ [Other tabs: Users, Collections, Comments, Analytics, Settings]
   │     │     │  └─ Auth check (redirect to login if not authenticated)
   │     │     │
   │     │     └─ Route: /admin/login → AdminLogin
   │     │        └─ Email + Password form
   │     │           └─ Hardcoded: admin@vijaymetalworks.com / admin123
   │     │
   │     └─ AnimatePresence (for modals)
   │        ├─ CommissionModal (overlay)
   │        │  └─ Multi-step form
   │        │     ├─ Name, Phone, Email, WhatsApp fields
   │        │     ├─ Artwork type, Metal, Budget, Timeline
   │        │     ├─ Description textarea
   │        │     ├─ File upload (max 3)
   │        │     └─ Success screen with celebration animation
   │        │
   │        └─ AuthModal (overlay)
   │           └─ Email + Password form
   │              ├─ Login mode
   │              └─ Signup mode
```

---

## 2. Data Flow Diagrams

### Gallery Interaction Flow

```
User Views Homepage
    ↓
Sees GalleryPreview (6 featured items)
    ↓
Clicks "View Full Gallery" or featured item
    ↓
navigate('/gallery', { state: { activeId?: 5 } })
    ↓
GalleryPage renders
    ├─ Gallery component with isFullPage=true
    ├─ 23 GALLERY_IDOLS displayed in masonry
    └─ If activeId in state, auto-open lightbox

│
├─ User sees masonry grid
├─ Clicks filter → activeFilter changes → filteredIdols updates
├─ Clicks item → setSelected(id) → lightbox opens
│
├─ In Lightbox:
│  ├─ Image displays
│  ├─ Click Like → setLiked({...prev, [id]: !prev[id]}) → state changes
│  ├─ Click Save → if !isLoggedIn: show AuthModal, else: setShippedSaved
│  ├─ Click Comment:
│  │  ├─ if !isLoggedIn: show AuthModal
│  │  ├─ else: open comments drawer
│  │  ├─ type comment → setCommentInput
│  │  ├─ press Enter or click Post → setComments({...prev, [id]: [..., {text, time}]})
│  ├─ Click "View More" → setShowDetailPanel(true) → detail panel slides in
│  ├─ Click prev/next → setSelected(prevId/nextId) → image transitions
│  └─ Press Escape → setSelected(null) → lightbox closes

User logs out or page refreshes
    ↓
State lost (except localStorage.vmw_session)
    ↓
Likes/saves/comments all reset
```

### Authentication Flow

```
Guest User
    ↓
Clicks protected action (Save/Comment/Like if needs auth)
    ↓
isLoggedIn === false?
    ├─ YES: setAuthAction('save'|'comment'|'like')
    │       setShowAuthModal(true)
    │       AuthModal renders
    │       │
    │       User enters email + password
    │       │
    │       if Supabase env vars exist:
    │       ├─ POST /auth/v1/token (if login)
    │       ├─ POST /auth/v1/signup (if signup)
    │       ├─ Receive: { access_token, user: {...} }
    │       ├─ localStorage.setItem('vmw_session', JSON.stringify(data))
    │       ├─ setIsLoggedIn(true)
    │       └─ setUser(data.user)
    │       else (no env vars):
    │       ├─ Wait 1000ms (mock)
    │       ├─ setIsLoggedIn(true)
    │       └─ setUser(null)
    │
    │       Modal closes → Original action proceeds
    │
    └─ NO: Action proceeds directly (user is authenticated)

Page Refresh
    ↓
AppContent useEffect (line 5189-5199)
    ├─ getItem('vmw_session') from localStorage
    ├─ Parse JSON
    └─ setIsLoggedIn(true) + setUser(data.user) → Session restored
```

### Commission Request Flow

```
User clicks "Commission a Piece" button
    ↓
setShowCommissionModal(true)
    ↓
CommissionModal renders
    ├─ Form: fullName, phone, email, whatsapp
    ├─ Form: artworkType, metal, budget, timeline
    ├─ Form: description, attachments
    └─ User fills and submits
       │
       onSubmit handler (line 4780-4830):
       ├─ e.preventDefault()
       ├─ setSubmitting(true)
       ├─ getFormData()
       │
       ├─ if (supabaseUrl && supabaseKey):
       │  ├─ For each file:
       │  │  ├─ POST to /storage/v1/object/inquiry_references/{filename}
       │  │  ├─ Collect imageUrls[]
       │  ├─ POST to /rest/v1/inquiries
       │  │  └─ body: { full_name, phone, email, whatsapp, artwork_type, metal, budget, timeline, description, image_urls }
       │  └─ setDone(true) → Success screen shows
       │
       └─ else (no Supabase):
          └─ Just show success screen after delay
       
       After success:
       ├─ User sees "Commission Received" message
       ├─ Click "Close Window"
       └─ setShowCommissionModal(false)
```

### Theme System Flow

```
AppContent renders
    ↓
useThemeMode() hook
    ├─ Detects system preference: window.matchMedia('(prefers-color-scheme: dark)')
    ├─ Returns: { mode, setMode, C }
    └─ 'auto' mode listens to system changes
    
User can change mode:
    ├─ Click ThemeToggle button
    ├─ setMode('auto'|'dark'|'light')
    │
    ├─ useEffect watches mode changes
    │  ├─ if mode='auto': apply system preference
    │  ├─ else: apply selected mode
    │  └─ setC(THEMES.dark or THEMES.light)
    │
    └─ ThemeCtx.Provider updates value
       └─ All useTheme() calls get new C
       
CSS Injection (line 5206-5209):
    ├─ Generate CSS with buildCSS(themeC)
    ├─ Inject into <style id="vmw-theme-css">
    ├─ All colors update dynamically
    └─ Smooth transition via CSS: transition: background .35s, color .35s
```

---

## 3. State Management Map

### AppCtx (Global State)

```
AppCtx.Provider value = {
  showCommissionModal: boolean,
  setShowCommissionModal: function,
  showAuthModal: boolean,
  setShowAuthModal: function,
  authAction: 'like'|'save'|'comment'|'',
  setAuthAction: function,
  isLoggedIn: boolean,
  setIsLoggedIn: function,
  user: {
    id: string,
    email: string,
    user_metadata: { avatar_url?: string }
  },
  setUser: function
}

Persistence:
  localStorage.vmw_session = JSON.stringify({ user: {...}, access_token, ... })
  
Scope:
  • Available to ALL components via useAppCtx()
  • Survives page navigation
  • Lost on refresh (unless localStorage restored)
```

### Local Component State

```
Gallery Component:
  selected: number|null                  → current lightbox image ID
  liked: { [id]: boolean }               → likes by image
  saved: { [id]: boolean }               → saves by image (Supabase-backed)
  comments: { [id]: [{text, time}] }    → comments by image
  activeFilter: string                   → current filter
  
GalleryPreview:
  hov: number|null                       → hovered item for preview

ImmersiveFeed:
  activeIdx: number                      → current vertical scroll index
  immersiveMode: boolean                 → is in fullscreen mode
  liked: { [id]: boolean }               → likes in immersive
  saved: { [id]: boolean }               → saves in immersive
  comments: { [id]: [{text, user, time}] } → comments in immersive
  showDetailPanel: boolean               → detail panel visible
  showComments: boolean                  → comments drawer visible
  showShareMenu: boolean                 → share menu visible

CommissionModal:
  submitting: boolean                    → form being submitted
  done: boolean                          → success state

AuthModal:
  email: string
  password: string
  isLogin: boolean                       → toggle login/signup
  loading: boolean
  error: string
```

---

## 4. Key Data Structures

### GALLERY_IDOLS Structure

```javascript
[
  {
    id: 0,                           // Unique identifier
    deity: "Sadari Gold Crown",     // Display name
    metal: "24K Gold Nagas",        // Material/technique
    img: "/gallery/gold/sadarigold.jpg",  // Image path (public/)
    cat: "Gold Work"                // Category for filtering
  },
  // ... 22 more items
]

// Categories: 'Gold Work', 'Crown Work', 'Silver Work', 'Stone Work', 'Vigraham'
// Total: 23 items
```

### Comment Object Structure

```javascript
// In Gallery/GalleryPage
comments[id] = [
  {
    text: "Beautiful craftsmanship",
    time: "15 May"  // Formatted date string
  }
]

// In ImmersiveFeed
comments[id] = [
  {
    text: "Exquisite work",
    user: "Guest User",           // Dynamic in immersive
    time: "Just now"
  }
]
```

### Supabase Session Object

```javascript
// localStorage.vmw_session
{
  access_token: "eyJhbGc...",
  refresh_token: "...",
  expires_in: 3600,
  user: {
    id: "uuid-string",
    email: "user@example.com",
    email_confirmed_at: "2024-05-01T...",
    user_metadata: {
      avatar_url: "https://..."
    },
    created_at: "2024-05-01T...",
    updated_at: "2024-05-01T..."
  }
}
```

---

## 5. URL & Route Reference

```
/                          HomePage
  ├─ Hero section
  ├─ GalleryPreview (6 items)
  └─ "View Full Gallery" → navigate('/gallery')

/gallery                   GalleryPage
  ├─ Full Gallery (all 23 items)
  ├─ Filters (All/Gold/Silver/Stone/Crown/Vigraham)
  ├─ Masonry grid
  └─ Lightbox on item click

/admin                     AdminDashboard
  ├─ Dashboard tab (stats)
  ├─ Gallery tab (upload)
  ├─ Inquiries tab (table)
  ├─ Users tab
  ├─ Collections tab
  ├─ Comments tab
  ├─ Analytics tab
  └─ Settings tab

/admin/login              AdminLogin
  └─ Email + Password form (hardcoded: admin@vijaymetalworks.com / admin123)

Internal Navigation (no routes):
  - Modals (CommissionModal, AuthModal, ProfileModal)
  - Drawers (Comments drawer in lightbox)
  - Side panels (Detail panel in immersive feed)
```

---

## 6. Image Path Mapping

```
Real Image Locations:
  /public/gallery/gold/          (13 images)
    ├─ sadarigold.jpg
    ├─ crown.jpg
    ├─ crown back.jpg            (space in name - encoded)
    ├─ crown side.jpg
    ├─ crown1.jpg
    ├─ crownn.jpg
    ├─ crownnside.jpg
    ├─ straight crown.jpg
    ├─ hand1.jpg
    ├─ kandabaranam.jpg
    ├─ kanganam4.jpg
    ├─ SADARI 2.jpg              (uppercase - encoded)
    └─ sur kad.png
  
  /public/gallery/silver/        (1 image)
    └─ kandabaranam.jpg
  
  /public/gallery/stone/         (7 images)
    ├─ stone1.jpg
    ├─ stone2.jpg
    ├─ stone3.jpg
    ├─ stone4.jpg
    ├─ kow pathakkam.png
    ├─ kow pa.jpg
    └─ thamarai poo3.jpg
  
  /public/gallery/temple/        (2 images)
    ├─ god.jpg
    └─ temple.jpg

Encoding issue:
  • Files with spaces get encoded: 'crown back.jpg' → '/gallery/gold/crown%20back.jpg'
  • In GALLERY_IDOLS: encodeURIComponent('/gallery/gold/crown back.jpg').replace(/%2F/g,'/')
  • Results in: '/gallery/gold/crown%20back.jpg'
```

---

## 7. Authentication Gates

```
Protected Actions:
┌────────────────┬─────────────┬──────────────────────────────┐
│ Action         │ Gate Level  │ Behavior When Not Logged In  │
├────────────────┼─────────────┼──────────────────────────────┤
│ Like           │ UI visible  │ Like works (no persistence)  │
│ Save           │ HARD gate   │ Show AuthModal               │
│ Comment        │ HARD gate   │ Show AuthModal on focus      │
│ Commission     │ Form open   │ Entire form accessible      │
│ View saved     │ HARD gate   │ Profile modal shows "Sign In"│
│ Profile        │ View only   │ Can view but shows guest UI  │
└────────────────┴─────────────┴──────────────────────────────┘

Admin Dashboard:
  • Requires localStorage.vmw_admin_auth = 'true'
  • Hardcoded check: if(!auth) redirect to /admin/login
  • Credentials: admin@vijaymetalworks.com / admin123
  • No Supabase auth for admin currently
```

---

## 8. Animation Types & Easing

```
Easing Functions:
  EASE_OUT = [0.16, 1, 0.3, 1]        // Smooth outgoing
  EASE_IN_OUT = [0.45, 0, 0.55, 1]   // Smooth both ways

Framer Motion Components:
  Reveal              duration: 0.8s, ease: EASE_OUT
  SlideLeft/Right     duration: 0.9s, ease: EASE_OUT
  SlideUp             duration: 0.85s, ease: EASE_OUT
  ZoomIn              duration: 0.9s, ease: EASE_OUT
  FadeIn              duration: 0.9s, ease: EASE_IN_OUT
  StaggerContainer    stagger: 0.12s

Image Transitions (Gallery/Immersive):
  Load: blur(24px) opacity(0) scale(0.92)
      → blur(0px) opacity(1) scale(1)
      Duration: 0.85s, ease: cubic-bezier
  Exit: opacity(0) scale(0.95)
      Duration: varies

Button Hover Effects:
  CurvyButton Primary:   scale(1.03) + glow shadow
  CurvyButton Secondary: opacity +  glow shadow
  Transition time: 0.3s
```

---

## 9. Critical Functions & Handlers

```javascript
handleLike(id, e)
  → Toggle liked[id]
  → Trigger 600ms animation
  → Show 1.1k → 1.2k count change

handleSave(id, e)
  → Check isLoggedIn (auth gate)
  → Toggle saved[id]
  → No persistence to DB

handleAddComment(id, e)
  → Check isLoggedIn (auth gate)
  → Push to comments[id] array
  → Clear input
  → Timestamp: new Date().toLocaleDateString('en-IN')

handleScroll(e) [ImmersiveFeed]
  → Calculate scrollTop / itemHeight
  → Update activeIdx
  → Auto-close panels
  → Snap animation

handleDoubleTap(id)
  → Like immediately without modal
  → Show glow animation 800ms
  → ImmersiveFeed only

toggleLike/toggleSave/postComment
  → Authentication check wrapper
  → Return false if not logged in
  → setAuthAction('like'|'save'|'comment')
  → setShowAuthModal(true)
```

---

## 10. Performance Characteristics

```
Bundle Size:
  • No external gallery library (built from scratch)
  • Framer Motion: ~16KB gzipped
  • React Router: ~5KB gzipped
  • Total dependencies: Minimal

Render Performance:
  • Canvas BG: 14 particles, every 2 frames (30fps)
  • Image lazy loading: loading="lazy" + decoding="async"
  • Masonry: CSS columns (highly optimized)
  • Modal: OnDemand rendering with AnimatePresence

Memory:
  • Gallery state: 23 items × 4 state objects = minimal
  • Likes/saves/comments: Depends on user interactions
  • Image caching: Browser automatic

Network:
  • Images: Only 23 high-quality images needed
  • No API calls unless Supabase enabled
  • Static page (no server required for frontend)
```

This visual guide complements the CODE_STRUCTURE_ANALYSIS.md file and provides quick reference for developers.
