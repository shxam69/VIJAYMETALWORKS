/* ---------------------------------------------------------------
   SUPABASE CLIENT & UTILITIES
--------------------------------------------------------------- */
const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL,
  key: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  console.warn('[VMW] Supabase env vars not set. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env to enable live data. Running in offline/mock mode.');
}

// Cache with TTL (5 minutes)
const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
  return null;
};

const setCached = (key, data) => {
  CACHE.set(key, { data, time: Date.now() });
};

// localStorage persistence for user's personal state
const getUserState = () => {
  try {
    const stored = localStorage.getItem('vmw_user_state');
    return stored ? JSON.parse(stored) : { likes: {}, saves: {}, comments: {} };
  } catch (_) {
    localStorage.removeItem('vmw_user_state');
    return { likes: {}, saves: {}, comments: {} };
  }
};

const setUserState = (state) => {
  localStorage.setItem('vmw_user_state', JSON.stringify(state));
};

// ── Core fetch wrapper — always sends auth token if session exists ──────────
const supabaseCall = async (endpoint, method = 'GET', body = null, extraHeaders = {}) => {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) return null;

  // Attach live session bearer token when available
  let authHeader = `Bearer ${SUPABASE_CONFIG.key}`;
  try {
    const sess = localStorage.getItem('vmw_session');
    if (sess) {
      const parsed = JSON.parse(sess);
      if (parsed?.access_token) authHeader = `Bearer ${parsed.access_token}`;
    }
  } catch (_) {}

  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  };

  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1${endpoint}`, opts);
    if (res.ok) {
      // HEAD requests and DELETE return empty body
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }
    const errText = await res.text();
    console.warn('Supabase error', res.status, errText);
  } catch (e) {
    console.warn('Supabase call failed:', e);
  }
  return null;
};

// ── Count helper using PostgREST exact count ─────────────────────────────────
const getCount = async (table, filter) => {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) return 0;
  try {
    const res = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${table}?${filter}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Prefer': 'count=exact',
          'Range': '0-0',
        },
      }
    );
    const cr = res.headers.get('content-range'); // "0-0/42"
    if (cr) return parseInt(cr.split('/')[1], 10) || 0;
  } catch (_) {}
  return 0;
};

// Get likes count for an idol — FIX: column is gallery_item_id not idol_id
const getIdolLikesCount = async (idolId) => {
  const cacheKey = `likes_count_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const count = await getCount('likes', `gallery_item_id=eq.${idolId}`);
  setCached(cacheKey, count);
  return count;
};

// Get saves count for an idol — FIX: column is gallery_item_id not idol_id
const getIdolSavesCount = async (idolId) => {
  const cacheKey = `saves_count_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const count = await getCount('saved_items', `gallery_item_id=eq.${idolId}`);
  setCached(cacheKey, count);
  return count;
};

// Get comments for an idol — FIX: column is gallery_item_id & content not text
const getIdolComments = async (idolId) => {
  const cacheKey = `comments_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const data = await supabaseCall(
    `/comments?gallery_item_id=eq.${idolId}&order=created_at.desc&limit=20&select=id,content,created_at,user_id`
  );
  const comments = data || [];
  setCached(cacheKey, comments);
  return comments;
};

// Toggle like (optimistic + server) — FIX: correct column names
const toggleIdolLike = async (idolId, userId, isCurrentlyLiked) => {
  const userState = getUserState();
  userState.likes[idolId] = !isCurrentlyLiked;
  setUserState(userState);

  if (!isCurrentlyLiked) {
    await supabaseCall('/likes', 'POST', { gallery_item_id: idolId, user_id: userId });
  } else {
    await supabaseCall(`/likes?gallery_item_id=eq.${idolId}&user_id=eq.${userId}`, 'DELETE');
  }
  CACHE.delete(`likes_count_${idolId}`);
};

// Toggle save (optimistic + server) — FIX: correct column names
const toggleIdolSave = async (idolId, userId, isCurrentlySaved) => {
  const userState = getUserState();
  userState.saves[idolId] = !isCurrentlySaved;
  setUserState(userState);

  if (!isCurrentlySaved) {
    await supabaseCall('/saved_items', 'POST', { gallery_item_id: idolId, user_id: userId });
  } else {
    await supabaseCall(`/saved_items?gallery_item_id=eq.${idolId}&user_id=eq.${userId}`, 'DELETE');
  }
  CACHE.delete(`saves_count_${idolId}`);
};

// Add comment — FIX: column is gallery_item_id & content not text
const addIdolComment = async (idolId, userId, text) => {
  const userState = getUserState();
  if (!userState.comments[idolId]) userState.comments[idolId] = [];

  const tempComment = {
    id: 'temp_' + Date.now(),
    content: text,
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  userState.comments[idolId].unshift(tempComment);
  setUserState(userState);

  await supabaseCall('/comments', 'POST', { gallery_item_id: idolId, user_id: userId, content: text });
  CACHE.delete(`comments_${idolId}`);
};

// Log view event — FIX: analytics_events has no idol_id column; use metadata JSONB
const logViewEvent = async (idolId, userId) => {
  await supabaseCall('/analytics_events', 'POST', {
    event_type: 'view',
    user_id: userId || null,
    metadata: { gallery_item_id: idolId },
  });
};



export {
  SUPABASE_CONFIG,
  supabaseCall,
  getCount,
  getUserState,
  setUserState,
  getCached,
  setCached,
  getIdolLikesCount,
  getIdolSavesCount,
  getIdolComments,
  getIdolComments as getCommentsForIdol,
  addIdolComment,
  addIdolComment as postCommentForIdol,
  toggleIdolLike,
  toggleIdolLike as toggleLikeForIdol,
  toggleIdolSave,
  toggleIdolSave as toggleSaveForIdol,
  logViewEvent,
  logViewEvent as recordIdolView,
};
