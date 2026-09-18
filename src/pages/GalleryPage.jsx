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

  // ImmersiveFeed is self-contained: shows masonry or immersive viewer
  // based on location.state.activeId — no Nav/Footer needed
  return <ImmersiveFeed />;
};


export default GalleryPage;
