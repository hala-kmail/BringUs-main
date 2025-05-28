import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import logo from '../../assets/shopping-cart.png';
import './Navbar.css';

const Navbar = ({ onMobileSearchToggle, isMobileSearchOpen }) => {
  const { t } = useTranslation();
  const { count: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');

  // Temporary mock data - replace with real data later
  const cartItemsCount = 3;

  // Update top position based on announcement bar and top bar heights
  useEffect(() => {
    const updateTopPosition = () => {
      const announcementBar = document.querySelector('.announcement-bar');
      const topBar = document.querySelector('.top-bar');
      const navbar = document.querySelector('.navbar');
      
      if (announcementBar && topBar && navbar) {
        const announcementHeight = announcementBar.offsetHeight;
        const topBarHeight = topBar.offsetHeight;
        const totalHeight = announcementHeight + topBarHeight;
        navbar.style.top = `${totalHeight}px`;
      }
    };

    // Update on mount and resize
    updateTopPosition();
    window.addEventListener('resize', updateTopPosition);
    
    // Update after a short delay to ensure content is rendered
    setTimeout(updateTopPosition, 100);

    return () => window.removeEventListener('resize', updateTopPosition);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/home" className="navbar-logo">
          <img src={logo} alt="Hala Store" />
          <span className="logo-text">Hala Store</span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="search-bar desktop-search">
          <input
            type="text"
            placeholder={t('navbar.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* User Actions */}
        <div className="user-actions">
          {/* Mobile Search Button */}
          <button className="mobile-search-trigger" onClick={onMobileSearchToggle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </div>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="action-item">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && <span className="badge">{cartItemsCount}</span>}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 