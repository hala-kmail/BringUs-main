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