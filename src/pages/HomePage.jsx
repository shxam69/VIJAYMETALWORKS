import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../components/hero/Hero';
import Ticker from '../components/common/Ticker';
import Legacy from '../components/heritage/Legacy';
import TrustedByTemples from '../components/heritage/TrustedByTemples';
import Services from '../components/services/Services';
import Showcase from '../components/services/Showcase';
import RealWorkPhotos from '../components/services/RealWorkPhotos';
import ProcessSection from '../components/process/ProcessSection';
import GalleryPreview from '../components/gallery/GalleryPreview';
import Testimonials from '../components/footer/Testimonials';
import FAQ from '../components/footer/FAQ';
import Archive from '../components/footer/Archive';
import Contact from '../components/footer/Contact';
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
      <Nav scrolled={scrolled}/>
      <Hero/>
      <Ticker/>
      <Legacy/>
      <TrustedByTemples/>
      <Services/>
      <Showcase/>
      <RealWorkPhotos/>
      <ProcessSection/>
      {/* Featured gallery preview instead of full gallery */}
      <GalleryPreview onViewAll={() => navigate('/gallery')}/>
      <Testimonials/>
      <FAQ/>
      <Archive/>
      <Contact/>
      <Footer/>
      <WAFab/>
      <MobileContactBar/>
    </>
  );
};


export default HomePage;
