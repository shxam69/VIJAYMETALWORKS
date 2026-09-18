# VMW-WEBSITE Source Code Structure Analysis

## Executive Summary
VMW-WEBSITE is a React-based premium luxury website for Vijay Metal Works, a temple metalcraft business established in 1915. The application features a dual-page architecture (homepage + dedicated gallery), immersive Instagram/TikTok-style gallery viewer, theme management, commission request system, and admin dashboard. All state is currently client-side with mock/hardcoded data.

---

## 1. App.jsx Structure Overview

### Main Architecture
```
App.jsx (5,257+ lines)
│
├── BrowserRouter (React Router wrapper)
│   └── AppContent
│       ├── ThemeCtx.Provider (Theme system)
│       │   └── AppCtx.Provider (Global state)
│       │       ├── SEOMeta (Dynamic meta tags injection)
│       │       ├── ThemeToggle (Light/Dark/Auto mode)
│       │       ├── Loader (Luxury cinematic preloader)
│       │       ├── CanvasBg (Ambient particle system)
│       │       ├── Grain (Noise overlay)
│       │       ├── Routes:
│       │       │   ├── / → HomePage
│       │       │   ├── /gallery → GalleryPage
│       │       │   ├── /admin → AdminDashboard
│       │       │   └── /admin/login → AdminLogin
│       │       ├── CommissionModal (Modal overlay)
│       │       └── AuthModal (Auth overlay)
```

### Global State Management (AppCtx)
```javascript
AppCtx Properties:
- showCommissionModal: boolean (commission form visibility)
- setShowCommissionModal: function
- showAuthModal: boolean (auth form visibility)
- setShowAuthModal: function
- authAction: string ('like'|'save'|'comment')
- setAuthAction: function
- isLoggedIn: boolean
- setIsLoggedIn: function
- user: object (from localStorage.vmw_session)
- setUser: function
```

### Theme System
```javascript
THEMES = {
  dark: {
    gold: "#FFD700",
    bg1: "#080604", bg2: "#0E0B08", bg3: "#111008",
    border: "rgba(255,255,255,0.09)",
    text: "rgba(255,255,255,0.92)",
    isDark: true
  },
  light: {
    gold: "#B8860B",
    bg1: "#F5F0E8", bg2: "#EDE7D8", bg3: "#E5DEC8",
    border: "rgba(100,70,20,0.16)",
    text: "rgba(15,9,2,0.92)",
    isDark: false
  }
}

useTheme() → returns current theme from context
useThemeMode() → { mode, setMode, C }
```

### Loading System
**Loader component** (lines 851-1000):
- Cinematic brand reveal animation
- 4 phases: mount → line-in → letter reveal → subtitle+progress bar → exit
- Total duration: ~3.1 seconds
- Shows "VIJAY METAL WORKS" with gold gradient text
- Animated progress percentage counter (0-100%)
- Blur-to-sharp animation effects

---

## 2. Gallery Component Architecture

### Gallery Component (lines 2412-3346)
**Props:**
- `isFullPage` (boolean) - determines styling (homepage preview vs full page)
- `onSelect` (function) - callback when item selected

**State Management:**
```javascript
const [selected, setSelected] = useState(null);        // Selected item ID
const [liked, setLiked] = useState({});                // {id: boolean}
const [saved, setSaved] = useState({});                // {id: boolean}
const [hovered, setHovered] = useState(null);          // Hovered item ID
const [likeAnim, setLikeAnim] = useState({});           // Animation state
const [loadedImages, setLoadedImages] = useState({});   // Image load tracking
const [activeFilter, setActiveFilter] = useState('All');// Current filter
const [comments, setComments] = useState({});           // {id: [{text, time}]}
const [commentInput, setCommentInput] = useState('');   // Input field value
const [showComments, setShowComments] = useState(false);// Comments panel visibility
```

### Data Flow
```
GALLERY_IDOLS (23 items)
    ↓
Filter by activeFilter
    ↓
filteredIdols
    ↓
Render masonry layout
    ↓
Click → setSelected(id)
    ↓
Open lightbox → show selected item
```

### Gallery Features

#### Image Click Handling
1. **Click item** → `setSelected(id)` 
2. **Opens lightbox modal** with:
   - Full image display (large, centered)
   - Like/Save/Comment buttons (right side)
   - Description panel (left side)
   - Navigation arrows (prev/next)
   - Keyboard support (Escape to close, Arrow keys to navigate)
   - Swipe gestures (mobile)

#### Filter System
```javascript
FILTERS = ['All', 'Gold Work', 'Crown Work', 'Silver Work', 'Stone Work', 'Vigraham']

filteredIdols = activeFilter === 'All'
  ? GALLERY_IDOLS
  : GALLERY_IDOLS.filter(i => i.cat === activeFilter || ...)
```

#### Mock Interactions
- **Likes**: Stored in local state `liked` object
  - Fake count: '1.1k' when unliked, '1.2k' when liked
  - Animation: 600ms scale + opacity pulse
- **Saves**: Requires authentication (gate-kept by `isLoggedIn`)
- **Comments**: 
  - Stored in local state `comments[id]` array
  - Each comment: `{text, time}` (time is formatted date)
  - Empty state message: "A silent admiration..."

#### Dock Navigation (lines 2540-2560)
Interactive dock with magnifying glass effect:
- Shows active filter buttons
- Mouse proximity scaling (max 1.65 scale at hover)
- Smooth transitions on filter change

---

## 3. GalleryPreview Component (lines 4063-4175)

**Purpose:** Show 4-6 featured items on homepage to encourage full gallery visit

**Features:**
- Masonry layout: 3 columns (desktop), 2 (tablet), 1 (mobile)
- Shows only first 6 GALLERY_IDOLS items
- Category badge on each card
- Hover effects: `translateY(-4px)` + image scale `1.08`
- CTA button: "View Full Gallery" → `navigate('/gallery')`

**Click Behavior:**
- Clicking a preview item:
  - If isFullPage mode: opens lightbox
  - Otherwise: navigates to /gallery and opens lightbox with that item

---

## 4. ImmersiveFeed Component (lines 4174-4573)

**Purpose:** Instagram/TikTok-style vertical full-screen gallery viewer

**Architecture:**
```
ImmersiveFeed
├── Fixed viewport full-screen container
├── Vertical scroll container (snap to full height items)
├── Search bar (floating, collapsible)
├── Item cards (full-viewport height each)
│   ├── Full image background
│   ├── Left side: Description panel
│   │   ├── Category + Metal badges
│   │   ├── Deity name (title)
│   │   ├── "View More" button → setShowDetailPanel
│   │   └── Sacred description text
│   ├── Right side: Instagram-style actions
│   │   ├── Like button + count
│   │   ├── Comment button + count
│   │   ├── Save button
│   │   └── Share button
│   ├── Double-tap glow effect
│   └── Saved animation overlay
├── Extended detail panel (left slide-in)
│   ├── Specifications grid
│   ├── Artisan notes
│   └── Close button
├── Comments drawer (bottom slide-up)
│   ├── Comment list
│   ├── Input + Post button
│   └── Close button
├── Share menu (center modal)
│   ├── Copy Link
│   ├── WhatsApp
│   ├── Instagram
│   └── Pinterest
├── Profile modal
└── Bottom navigation bar
    ├── Home, Search, Commission (prominent), Saved, Profile
```

**State:**
```javascript
const [immersiveMode, setImmersiveMode] = useState(!!initialId);
const [searchQuery, setSearchQuery] = useState('');
const [activeIdx, setActiveIdx] = useState(initialIdx);
const [liked, setLiked] = useState({});
const [saved, setSaved] = useState({});
const [comments, setComments] = useState({});
const [showDetailPanel, setShowDetailPanel] = useState(false);
const [showComments, setShowComments] = useState(false);
const [showShareMenu, setShowShareMenu] = useState(false);
const [doubleTapGlow, setDoubleTapGlow] = useState(false);
```

**Scroll Behavior:**
- Container snaps to item height (window.innerHeight)
- `handleScroll` calculates which item is in view
- Updates activeIdx when user scrolls to new item
- Animated panel transitions based on activeIdx

**Authentication Gate:**
```javascript
handleInteraction(actionType) {
  if (!isLoggedIn) {
    setAuthAction(actionType);
    setShowAuthModal(true);
    return false;  // Action blocked
  }
  return true;  // Action allowed
}
```

---

## 5. Gallery Data Structure

### GALLERY_IDOLS Array (lines 280-326)
**23 items total:**

```javascript
{
  id: 0,
  deity: "Sadari Gold Crown",
  metal: "24K Gold Nagas",
  img: "/gallery/gold/sadarigold.jpg",
  cat: "Gold Work"
}
```

**Categories:**
- Gold Work (13 items)
- Silver Work (1 item)
- Stone Work (7 items)
- Vigraham (2 items)

**Real Images:** Stored in `/public/gallery/`:
- `/public/gallery/gold/` (13 images)
- `/public/gallery/silver/` (1 image - kandabaranam.jpg)
- `/public/gallery/stone/` (7 images)
- `/public/gallery/temple/` (2 images)

**File Structure Issues:**
- Spaces in filenames encoded: `encodeURIComponent('/gallery/gold/crown back.jpg')`
- Some PNG files included for variation

---

## 6. Supabase Integration Points

### Commission Request (lines 4730-4850)
**Form fields:**
- fullName, phone, email, whatsapp
- artworkType, metal, budget, timeline
- description, attachments (up to 3 images)

**Supabase Operations:**
```javascript
if (supabaseUrl && supabaseKey) {
  // Upload images to 'inquiry_references' bucket
  // POST to /rest/v1/inquiries
} else {
  // Mock mode: just show success
}
```

**Status:** Partially integrated - form exists but only uploads if env vars set

### Authentication (lines 4900-5040)
**Endpoints:**
- Login: `POST /auth/v1/token?grant_type=password`
- Signup: `POST /auth/v1/signup`

**Headers:**
```javascript
{
  'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
}
```

**Session Storage:**
```javascript
localStorage.setItem('vmw_session', JSON.stringify(data));
// data = { access_token, refresh_token, user: { id, email, user_metadata: {} } }
```

**Status:** Functional but fallback to mock if no env vars

### Admin Dashboard (lines 5060-5160)
**Hardcoded credentials:**
```javascript
if(email === 'admin@vijaymetalworks.com' && password === 'admin123') {
  localStorage.setItem('vmw_admin_auth', 'true');
  navigate('/admin');
}
```

**Queries implemented:**
```javascript
// GET inquiries
fetch(`${supabaseUrl}/rest/v1/inquiries?select=*&order=created_at.desc`, { headers })

// GET gallery_items count
fetch(`${supabaseUrl}/rest/v1/gallery_items?select=id`, { headers })

// GET profiles count
fetch(`${supabaseUrl}/rest/v1/profiles?select=id`, { headers })

// PATCH inquiry status
fetch(`${supabaseUrl}/rest/v1/inquiries?id=eq.${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ status: newStatus })
})
```

**Dashboard Stats:**
- Total Artworks (from gallery_items table)
- Pending Inquiries (filtered by status='pending')
- Total Users (from profiles table)
- Total Views (hardcoded: 12054)

---

## 7. Mock/Hardcoded Data

### Fake Interaction Counts
```javascript
// Likes counter
liked[idol.id] ? '1.2k' : '1.1k'  // Hardcoded in ImmersiveFeed (line 4515)

// Comment counts
(comments[idol.id] || []).length  // Dynamic based on user actions

// Comments area empty state
"A silent admiration. Be the first to share your thoughts."
```

### Mock Detail Information
```javascript
// Specifications shown in detail panel
[
  { label: 'Material', value: activeItem.metal },
  { label: 'Category', value: activeItem.cat },
  { label: 'Crafting Duration', value: '45 - 60 Days' },
  { label: 'Origin', value: 'Sowcarpet Workshop' },
  { label: 'Technique', value: 'Traditional Nagas / Lost Wax' },
  { label: 'Purity', value: 'Certified' }
]

// Artisan notes (generic template)
"Every detail from the intricate Kireedam (crown) to the Padmam (lotus base)
is painstakingly hand-chiselled. Our artisans chant sacred mantras during
the casting process..."
```

### Hardcoded Admin Data
- Admin email: `admin@vijaymetalworks.com`
- Admin password: `admin123`
- Profile avatar fallback: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`
- Guest avatar fallback: `/gallery/gold/crown.jpg`

### Mock Profile Stats (ProfileModal - line 4636)
```javascript
<div><strong>0</strong> <span>posts</span></div>
<div><strong>12</strong> <span>saved</span></div>
<div><strong>4</strong> <span>collections</span></div>
```

---

## 8. "View More" Implementation

### Location: ImmersiveFeed Detail Panel (lines 4454-4485)

**Trigger:**
```javascript
<button onClick={() => setShowDetailPanel(true)}>
  View More <svg>→</svg>
</button>
```

**Detail Panel (lines 4487-4530):**
```
Extended Detail Panel
├── Left slide-in animation (x: -100% → 0)
├── Full-screen overlay background
├── Close button (top-right)
├── Title (deity name)
├── Italic description
├── Specifications grid (3 cols)
│   ├── Material
│   ├── Category
│   ├── Crafting Duration
│   ├── Origin
│   ├── Technique
│   └── Purity
├── Artisan notes section
└── Scroll container for long content
```

**Layout:**
- `position: absolute`, `inset: 0`
- `padding: 60px 40px`
- `background: rgba(10,8,6,0.95)` with `backdropFilter: blur(24px)`
- zIndex: 150 (above images, below modals)

---

## 9. Key Components & Animation System

### Framer Motion Animations Used
```
Reveal          - Fade + Rise (delay support)
SlideLeft       - Left slide + fade
SlideRight      - Right slide + fade
SlideUp         - Bottom slide + fade
ZoomIn          - Zoom + fade
FadeIn          - Opacity only
StaggerContainer - Parent for staggered children
StaggerItem     - Child animation variant
StaggerItemScale - Scale variant
```

### Premium Button System
```
CurvyButton
├── Primary (gold gradient glassmorphic)
│   ├── Hover: translateY(-3px) + scale(1.03)
│   ├── Glow: 0 6px 32px rgba(255,215,0,0.52)
│   └── Shine sweep animation on hover
└── Secondary (dark glass outline)
    ├── Hover: same transforms
    ├── Color: rgba(255,215,0,0.92) on hover
    └── Magnetic proximity effect

StarBorderButton
├── Rotating star border animation
├── Hover opacity increase
└── Cursor proximity effects
```

### Lighthouse CSS
```
.vmw-btn-primary - Gold glassmorphic buttons
.vmw-btn-secondary - Dark outline buttons
Custom animations:
- @keyframes starBorderSpin (360° rotation)
- @keyframes btnShine (gradient sweep)
- @keyframes lineGlow (pulsing shadow)
```

---

## 10. Routing & Navigation

### Routes Configuration (line 5223)
```javascript
<Routes>
  <Route path="/" element={<HomePage scrolled={scrolled}/>}/>
  <Route path="/gallery" element={<GalleryPage scrolled={scrolled}/>}/>
  <Route path="/admin" element={<AdminDashboard />}/>
  <Route path="/admin/login" element={<AdminLogin />}/>
</Routes>
```

### Navigation Methods
```javascript
// From anywhere using useNavigate()
navigate('/gallery')
navigate('/admin/login')
navigate('/')

// From GalleryPreview
onClick={() => navigate('/gallery')}

// From ImmersiveFeed
<button onClick={() => navigate('/')}>Home</button>
```

### Location State (used for immersive feed)
```javascript
// Navigate with state
navigate('/gallery', { state: { activeId: 5 } })

// Receive in ImmersiveFeed
const location = useLocation();
const initialId = location.state?.activeId;
```

---

## 11. State Management Flow

### User Authentication Flow
```
1. User clicks "Sign In" or tries protected action
2. setShowAuthModal(true)
3. AuthModal renders with email/password form
4. User submits:
   a. If Supabase configured:
      - POST to Supabase /auth/v1/token
      - Receive: { access_token, user: {...} }
   b. If no Supabase:
      - Mock delay, then proceed
5. localStorage.setItem('vmw_session', JSON.stringify(data))
6. setIsLoggedIn(true)
7. setUser(data.user)
8. Modal closes, action proceeds (save/comment/like)
```

### Session Persistence (line 5189-5199)
```javascript
useEffect(() => {
  const sessionStr = localStorage.getItem('vmw_session');
  if(sessionStr) {
    const session = JSON.parse(sessionStr);
    if(session && session.user) {
      setIsLoggedIn(true);
      setUser(session.user);
    }
  }
}, []);
```

---

## 12. Performance Optimizations

### Implemented
- **Lazy loading**: Images beyond fold load with `loading="lazy"`
- **Async decoding**: `decoding="async"` on images
- **GPU acceleration**: `will-change: transform` on animations
- **Passive listeners**: `{ passive: true }` on scroll events
- **Skeleton loading**: Placeholder while image loads
- **CSS transforms**: Uses transform/opacity instead of layout changes
- **Framer Motion**: Optimized animations with proper easing

### Canvas Background
- Reduced from 28 to 14 particles for performance
- Renders every 2 frames (30fps instead of 60fps)
- Proper cleanup with cancelAnimationFrame

---

## 13. File Locations & Key Lines

### Component Definitions
| Component | Lines | Purpose |
|-----------|-------|---------|
| SEOMeta | 8-76 | Meta tag injection |
| Loader | 851-1000 | Cinematic preloader |
| Gallery | 2412-3346 | Main gallery component |
| GalleryPreview | 4063-4175 | Homepage preview |
| ImmersiveFeed | 4174-4573 | Full-screen immersive viewer |
| GalleryPage | 4580-4740 | Gallery page wrapper |
| CommissionModal | 4730-4890 | Commission form |
| AuthModal | 4900-5040 | Auth form |
| ProfileModal | 4610-4680 | User profile |
| AdminLogin | 5040-5070 | Admin login |
| AdminDashboard | 5060-5170 | Admin panel |
| AppContent | 5178-5250 | Main app wrapper |

### Data Sources
| Data | Lines |
|------|-------|
| GALLERY_IDOLS | 280-326 |
| IMG (hero images) | 328-347 |
| THEMES | 162-174 |
| BIZ (business data) | 92-108 |
| VMW (image paths) | 110-146 |

---

## 14. Dependencies

### Key Libraries
- **react-router-dom** v7.15.1 - Client-side routing
- **framer-motion** v12.38.0 - Animations
- **React Context API** - State management
- **localStorage** - Session persistence

### No External Gallery Library
- Gallery built from scratch with vanilla JS + Framer Motion
- Custom masonry layout via CSS columns
- Custom lightbox modal implementation

---

## 15. Identified Issues & Observations

### Current Limitations
1. **All state is client-side** - No database persistence except auth
2. **Mock data** - Likes/comments/saves not persisted
3. **Hardcoded admin credentials** - Should use Supabase auth
4. **No real user profiles** - Profile stats are hardcoded
5. **Image filename encoding** - Space handling is inconsistent
6. **Supabase schema not visible** - Tables expected: inquiries, gallery_items, profiles
7. **No error boundaries** - Component crashes not handled gracefully

### Architecture Notes
- Single massive App.jsx file (5,257+ lines)
- All components in one file rather than modular structure
- No component extraction or code splitting
- Theme system works well but could use Redux/Zustand for larger state

### Business Logic
- Commission requests form exists but upload to Supabase incomplete
- Admin dashboard queries hardcoded table names
- No real distinction between guest/authenticated experience (UI gating only)

---

## Summary

**This is a beautifully architected, animation-rich React SPA with:**
- Dual-page layout (home + gallery)
- Immersive full-screen gallery viewer (Instagram-style)
- Premium Framer Motion animations throughout
- Theme switching system (dark/light/auto)
- Authentication gates (Supabase or mock)
- Admin dashboard for inquiry management
- Commission request form with image uploads
- Comprehensive SEO meta tags
- Responsive design (desktop/tablet/mobile)

**All user interactions (likes, saves, comments) are currently mock/in-memory** and don't persist to any database. The architecture is ready for backend integration but would benefit from component extraction and code splitting.
