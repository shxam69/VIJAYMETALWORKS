import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ImmersiveFeed from '../components/gallery/ImmersiveFeed';

const GalleryPage = ({ scrolled }) => {
  const location = useLocation();
  const initialId = location.state?.activeId;

  // Scroll to top only when entering masonry view (no specific image selected)
  useEffect(() => {
    if (!initialId) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [initialId]);

  useEffect(() => {
    document.title = 'Gallery | Vijay Metal Works — Temple Metal Craftsmanship';
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Explore the gallery of temple metalwork by Vijay Metal Works — Panchaloha idols, gold naga work, kireedams, and architectural metalwork since 1915.');
  }, []);

  // ImmersiveFeed is self-contained: shows masonry or immersive viewer
  // based on location.state.activeId — no Nav/Footer needed
  return <ImmersiveFeed />;
};


export default GalleryPage;
