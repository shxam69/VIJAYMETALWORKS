import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUPABASE_CONFIG } from '../lib/supabase';

const SiteImagesContext = createContext({ getImage: (_id, fallback) => fallback, loading: false });

export const SiteImagesProvider = ({ children }) => {
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = SUPABASE_CONFIG.url;
    const key = SUPABASE_CONFIG.key;
    if (!url || !key) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    fetch(`${url}/rest/v1/site_images?select=id,image_url`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((rows) => {
        if (cancelled) return;
        const next = {};
        (Array.isArray(rows) ? rows : []).forEach((row) => {
          if (row?.id && row?.image_url) next[row.id] = row.image_url;
        });
        setOverrides(next);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getImage = useCallback(
    (id, fallback) => overrides[id] || fallback,
    [overrides]
  );

  const value = useMemo(() => ({ getImage, loading }), [getImage, loading]);
  return <SiteImagesContext.Provider value={value}>{children}</SiteImagesContext.Provider>;
};

export const useSiteImages = () => useContext(SiteImagesContext);
export const useSiteImage = (id, fallback) => useSiteImages().getImage(id, fallback);

export default useSiteImages;
