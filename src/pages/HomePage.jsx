import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../components/hero/Hero';
import Ticker from '../components/common/Ticker';
import Legacy from '../components/heritage/Legacy';
import TrustedByTemples from '../components/heritage/TrustedByTemples';
import Services from '../components/services/Services';
import Showcase from '../components/services/Showcase';
import ProcessSection from '../components/process/ProcessSection';
import RealWorkPhotos from '../components/services/RealWorkPhotos';
import GalleryPreview from '../components/gallery/GalleryPreview';
import ClientReviews from '../components/reviews/ClientReviews';
import FAQ from '../components/footer/FAQ';
import Contact from '../components/footer/Contact';
import VisitingCard from '../components/footer/VisitingCard';
import Footer from '../components/footer/Footer';
import Nav from '../components/navigation/Nav';
import MobileContactBar from '../components/navigation/MobileContactBar';
import WAFab from '../components/navigation/WAFab';

const HomePage = ({ scrolled }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll to section when navigating from another page
  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <>
      <Nav scrolled={scrolled} />
      {/* 1. HERO */}
      <Hero />
      <Ticker />

      {/* 2. LEGACY / HERITAGE */}
      <Legacy />
      <TrustedByTemples />

      {/* 3. CRAFT & SERVICES */}
      <Services />
      <Showcase />

      {/* 4. PROCESS */}
      <ProcessSection />

      {/* 5. REAL WORK / GALLERY */}
      <RealWorkPhotos />
      <GalleryPreview onViewAll={() => navigate('/gallery')} />
      <ClientReviews />
      <FAQ />

      {/* 6. CONTACT / CONSULTATION */}
      <Contact />

      {/* 7. VISITING CARD */}
      <VisitingCard />

      {/* 8. MINIMAL FOOTER */}
      <Footer />

      <WAFab />
      <MobileContactBar />
    </>
  );
};

export default HomePage;
