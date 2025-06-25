import React, { useState } from 'react';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import Carousel from '../../components/Carousel/Carousel';
import CategoriesGrid from '../../components/CategoriesGrid/CategoriesGrid';
import Features from '../../components/Features/Features';
import NewArrivals from '../../components/NewArrivals/NewArrivals';
import BestSellers from '../../components/BestSellers/BestSellers';
import AlmostFinishedCard from '../../components/AlmostFinishedCard/AlmostFinishedCard';
import WholesaleRegisterModal from '../../components/WholesaleRegisterModal';
import './Home.css';
import { useTranslation } from 'react-i18next';
const Home = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false);
  const { t } = useTranslation();
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleWholesaleModalOpen = () => setIsWholesaleModalOpen(true);
  const handleWholesaleModalClose = () => setIsWholesaleModalOpen(false);

  return (
    <div className="home">
      {/* <TopBar /> */}
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <button className="wholesale-register-btn" onClick={handleWholesaleModalOpen} style={{margin: '1rem auto', display: 'block'}}>
       {t('wholesale.register_title')}
      </button>
      <WholesaleRegisterModal isOpen={isWholesaleModalOpen} onClose={handleWholesaleModalClose} />
      <MobileSearch 
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      <main className="home-content">
        <Carousel />
        <CategoriesGrid />
        <AlmostFinishedCard />
        <Features />
        <NewArrivals />
        <BestSellers />
      </main>
    </div>
  );
};

export default Home; 