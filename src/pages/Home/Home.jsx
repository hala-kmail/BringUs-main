import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
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
 //-----------------------------------isWholesaleModalOpen------------------------------------------------  
  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false); 
  const handleWholesaleModalOpen = () => setIsWholesaleModalOpen(true);
  const handleWholesaleModalClose = () => setIsWholesaleModalOpen(false);
  //-----------------------------------isMobileSearchOpen------------------------------------------------  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); 
    const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };
//-----------------------------------t------------------------------------------------  
  const { t } = useTranslation();
//-----------------------------------return------------------------------------------------  
  return (
    <div className="home">
     
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      
      <MobileSearch isOpen={isMobileSearchOpen} onClose={handleMobileSearchClose}/>
      <main className="home-content">
        <Carousel />
        <CategoriesGrid />
        <div className="almost-finished-with-register">
          {/* <button
            className="wholesale-inline-btn"
            onClick={handleWholesaleModalOpen}
            title={t('wholesale.register_title')}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7L5 3H19L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7H21V9C21 10.6569 19.6569 12 18 12C16.3431 12 15 10.6569 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 10.6569 7.65685 12 6 12C4.34315 12 3 10.6569 3 9V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 21V19C5 17.8954 5.89543 17 7 17H17C18.1046 17 19 17.8954 19 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="14" width="2" height="3" rx="1" fill="currentColor"/>
              <rect x="15" y="14" width="2" height="3" rx="1" fill="currentColor"/>
            </svg>
            <span style={{marginInlineStart: 8}}>{t('wholesale.register_title')}</span>
          </button> */}
          <AlmostFinishedCard />
        </div>
        <WholesaleRegisterModal isOpen={isWholesaleModalOpen} onClose={handleWholesaleModalClose} />
        <Features />
        <NewArrivals />
        <BestSellers />
        <SocialComments />
      </main>
    </div>
  );
};

export default Home; 