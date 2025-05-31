import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { allProducts } from '../../data/products';
import './MobileSearch.css';

const MobileSearch = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const language = i18n.language === 'ar' ? 'ar' : 'en';

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when search is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when search is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }
    const results = allProducts.filter(product =>
      product.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description[language].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchQuery, language]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-search-overlay">
      <div className="mobile-search-container">
        <button className="mobile-search-back" onClick={handleClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="search-input-wrapper">
          {/* <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg> */}
          <input
            type="text"
            placeholder={t('navbar.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
            autoFocus
          />
          {searchQuery && (
            <button className="mobile-search-clear" onClick={handleClear}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Search Results Area */}
      <div className="mobile-search-results">
        {searchQuery ? (
          filteredProducts.length > 0 ? (
            <div className="search-suggestions">
              {filteredProducts.map(product => (
                <div className="suggestion-item" key={product.id}>
                  <img src={product.image} alt={product.name[language]} style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover', marginRight: 12}} />
                  <span>{product.name[language]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-placeholder-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="search-placeholder-text">{t('shop.no_products_title', 'لا يوجد نتائج مطابقة')}</p>
            </div>
          )
        ) : (
          <div className="search-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-placeholder-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="search-placeholder-text">{t('navbar.search_placeholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearch; 