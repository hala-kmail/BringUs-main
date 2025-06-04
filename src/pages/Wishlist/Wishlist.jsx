
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getFeatureById, getCategoryById } from '../../data/index';
import './Wishlist.css';

const Wishlist = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleWishlistToggle = (product) => {
    removeFromWishlist(product.id);
  };

  const handleAddToCart = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="wishlist-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
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
      <div className="wishlist-container">
        {/* Header */}
        <div className="wishlist-header">
          <h1 className="wishlist-title">{t('navbar.wishlist')}</h1>
          <p className="wishlist-subtitle">
            {t('wishlist.items_count', { count: wishlistItems.length })}
          </p>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length > 0 ? (
          <div className="wishlist-content">
            <div className="products-grid">
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  currentLang={currentLang}
                  t={t}
                  isInWishlist={() => true} // Always true since item is in wishlist
                  handleWishlistToggle={handleWishlistToggle}
                  handleAddToCart={handleAddToCart}
                  getFeatureById={getFeatureById}
                  getCategoryById={getCategoryById}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3>{t('wishlist.empty_title')}</h3>
            <p>{t('wishlist.empty_description')}</p>
            <Link to="/shop" className="continue-shopping-btn">
              {t('wishlist.continue_shopping')}
            </Link>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Wishlist;