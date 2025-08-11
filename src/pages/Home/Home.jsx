import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import Carousel from '../../components/Carousel/Carousel';
import CategoriesGrid from '../../components/CategoriesGrid/CategoriesGrid';
import Features from '../../components/Features/Features';
import NewArrivals from '../../components/NewArrivals/NewArrivals';
import BestSellers from '../../components/BestSellers/BestSellers';
import AlmostFinishedCard from '../../components/AlmostFinishedCard/AlmostFinishedCard';
import SocialComments from '../../components/SocialComments/SocialComments';
import WholesaleRegisterModal from '../../components/WholesaleRegisterModal';
import './Home.css';
import { useTranslation } from 'react-i18next';
//-----------------------------------Home------------------------------------------------  
const Home = () => {
  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false);
  
  const handleWholesaleModalOpen = () => setIsWholesaleModalOpen(true);
  const handleWholesaleModalClose = () => setIsWholesaleModalOpen(false);
  
  const { t } = useTranslation();
  // Lazy reveal section using IntersectionObserver
  const LazyRevealSection = ({
    children,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.15,
    once = true,
    className = ''
  }) => {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasAppeared, setHasAppeared] = useState(false);

    useEffect(() => {
      const elem = containerRef.current;
      if (!elem) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              setHasAppeared(true);
              if (once) observer.unobserve(entry.target);
            } else if (!once) {
              setIsVisible(false);
            }
          });
        },
        { root: null, rootMargin, threshold }
      );

      observer.observe(elem);
      return () => observer.disconnect();
    }, [rootMargin, threshold, once]);

    return (
      <section
        ref={containerRef}
        className={`reveal-section ${isVisible ? 'visible' : ''} ${className}`.trim()}
      >
        {children}
      </section>
    );
  };

//-----------------------------------return------------------------------------------------  
  return (
    <div className="home">
     
      <Navbar 
      />
      <SecondaryNavbar />
      
      <main className="home-content">
        <Carousel />

        <LazyRevealSection>
          <CategoriesGrid />
        </LazyRevealSection>

        <LazyRevealSection>
          <div className="almost-finished-with-register">
            <AlmostFinishedCard />
          </div>
        </LazyRevealSection>

        <WholesaleRegisterModal isOpen={isWholesaleModalOpen} onClose={handleWholesaleModalClose} />

        <LazyRevealSection>
          <Features />
        </LazyRevealSection>

        <LazyRevealSection>
          <NewArrivals />
        </LazyRevealSection>

        <LazyRevealSection>
          <BestSellers />
        </LazyRevealSection>

        <LazyRevealSection>
          <SocialComments />
        </LazyRevealSection>
      </main>
    </div>
  );
};

export default Home; 