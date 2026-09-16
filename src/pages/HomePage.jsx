import React from 'react';
import { useNavigate } from 'react-router-dom';
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
