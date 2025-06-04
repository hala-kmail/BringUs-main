import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { allProducts } from '../../data/products';
import logo from '../../assets/shopping-cart.png';
import './Navbar.css';

const Navbar = ({ onMobileSearchToggle, isMobileSearchOpen }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();
  const { getCartTotals } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const placeholders = t('navbar.search_placeholders', { returnObjects: true });
  const currentLang = i18n.language;
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const userName = "محمد أحمد"; // Temporary mock data

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    setIsLanguageDropdownOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Update placeholder text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filteredProducts = allProducts.filter(product => {
        const productName = product.name[currentLang]?.toLowerCase() || '';
        const productDesc = product.description[currentLang]?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return productName.includes(query) || productDesc.includes(query);
      }).slice(0, 8); // Limit to 8 results
      
      setSearchResults(filteredProducts);
      setShowSearchDropdown(filteredProducts.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, currentLang]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle product selection
  const handleProductClick = (productId) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/product/${productId}`);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

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
        <div className="search-bar desktop-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder={placeholders[placeholderIndex]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(searchResults.length > 0)}
            aria-label={t('navbar.search_placeholder')}
          />
            <button type="submit" className="search-button" aria-label={t('navbar.search')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          </form>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="search-dropdown" ref={dropdownRef}>
              <div className="search-results">
                {searchResults.map((product) => (
                  <div 
                    key={product.id} 
                    className="search-result-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="result-image">
                      <img src={product.image} alt={product.name[currentLang]} />
                    </div>
                    <div className="result-details">
                      <h4 className="result-name">{product.name[currentLang]}</h4>
                      <p className="result-description">{product.description[currentLang]}</p>
                      <div className="result-price">
                        {product.discountPrice ? (
                          <>
                            <span className="current-price">${product.discountPrice.toFixed(2)}</span>
                            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="current-price">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {searchResults.length > 0 && (
                <div className="search-footer">
                  <button 
                    className="view-all-results"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                      setShowSearchDropdown(false);
                    }}
                  >
                    {currentLang === 'ar' ? `عرض جميع النتائج (${searchResults.length})` : `View all results (${searchResults.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Actions - Rearranged Order: Language, User, Wishlist, Cart */}
        <div className="user-actions">
          {/* Mobile Search Button */}
          <button className="mobile-search-trigger" onClick={onMobileSearchToggle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Language Selector */}
          <div className="selector-dropdown">
            <button
              className="selector-button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              aria-expanded={isLanguageDropdownOpen}
              aria-controls="language-menu"
            >
              <span className="flag">{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Apply open-programmatically class when isLanguageDropdownOpen is true */}
            <div id="language-menu" className={`dropdown-menu ${isLanguageDropdownOpen ? 'open-programmatically' : ''}`}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`dropdown-item ${i18n.language === language.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(language.code)}
                >
                  <span className="flag">{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="selector-dropdown user-menu">
            <button
              className="selector-button user-button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              aria-expanded={isUserDropdownOpen}
              aria-controls="user-menu-items"
            >
              <div className="user-avatar">
                {userName.charAt(0)}
              </div>
              <span className="user-name">{userName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Apply open-programmatically class when isUserDropdownOpen is true */}
            <div id="user-menu-items" className={`dropdown-menu ${isUserDropdownOpen ? 'open-programmatically' : ''}`}>
              <Link to="/profile" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('navbar.profile')}
              </Link>
              <Link to="/orders" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('navbar.orders')}
              </Link>
              <Link to="/settings" className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('navbar.settings')}
              </Link>
              <button className="dropdown-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', marginRight: '8px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('navbar.logout')}
              </button>
            </div>
          </div>

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