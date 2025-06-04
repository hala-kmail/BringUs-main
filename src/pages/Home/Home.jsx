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
import './Home.css';

const Home = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  return (
    <div className="home">
      {/* <TopBar /> */}
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
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