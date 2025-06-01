import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import logo from '../../assets/shopping-cart.png';
import './Navbar.css';

const Navbar = ({ onMobileSearchToggle, isMobileSearchOpen }) => {
  const { t } = useTranslation();
  const { count: wishlistCount } = useWishlist();
  const { getCartTotals } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = t('navbar.search_placeholders', { returnObjects: true });

  // Update placeholder text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Get real cart items count
  const cartTotals = getCartTotals();
  const cartItemsCount = cartTotals.itemsCount;

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
            className="search-input"
            placeholder={placeholders[placeholderIndex]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('navbar.search_placeholder')}
          />
          <button className="search-button" aria-label={t('navbar.search')}>
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