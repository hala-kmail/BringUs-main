import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './MobileSearch.css';
import { useAppData } from '../../contexts/AppDataContext';
import useProducts from '../../hooks/useProducts';
import { formatPrice } from '../../utils/currencyUtils';

const MobileSearch = ({ isOpen, onClose, onSearch, searchQuery: parentSearchQuery }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(parentSearchQuery || '');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const language = i18n.language === 'ar' ? 'ar' : 'en';
  const { searchProducts } = useProducts();

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
    let ignore = false;
    const doSearch = async () => {
      const result = await searchProducts(searchQuery);
      let filtered = [];
      if (result && result.products) {
        const query = searchQuery.trim().toLowerCase();
        filtered = result.products.filter(product => {
          // الاسم
          const nameAr = product.nameAr?.toLowerCase() || '';
          const nameEn = product.nameEn?.toLowerCase() || '';
          const nameObjAr = product.name?.ar?.toLowerCase() || '';
          const nameObjEn = product.name?.en?.toLowerCase() || '';
          // الوصف
          const descAr = product.descriptionAr?.toLowerCase() || '';
          const descEn = product.descriptionEn?.toLowerCase() || '';
          const descObjAr = product.description?.ar?.toLowerCase() || '';
          const descObjEn = product.description?.en?.toLowerCase() || '';
          // السعر
          const price = (product.finalPrice || product.originalPrice || product.price || '').toString();
          return (
            nameAr.includes(query) ||
            nameEn.includes(query) ||
            nameObjAr.includes(query) ||
            nameObjEn.includes(query) ||
            descAr.includes(query) ||
            descEn.includes(query) ||
            descObjAr.includes(query) ||
            descObjEn.includes(query) ||
            price.includes(query)
          );
        });
      }
      if (!ignore) setFilteredProducts(filtered.slice(0, 10));
    };
    doSearch();
    return () => { ignore = true; };
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    handleClose();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
      onClose();
    }
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
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
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
                <div 
                  className="suggestion-item" 
                  key={product.id || product._id}
                  onClick={() => handleProductClick(product.id || product._id)}
                >
                  <img 
                    src={product.mainImage || product.image} 
                    alt={
                      (product.name && typeof product.name === 'object' && (product.name[language] || product.name.ar || product.name.en)) ||
                      product.nameAr || product.nameEn || ''
                    }
                    style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover', marginRight: 12}} 
                  />
                  <div className="suggestion-content">
                    <span className="suggestion-name">{
                      (product.name && typeof product.name === 'object' && (product.name[language] || product.name.ar || product.name.en)) ||
                      product.nameAr || product.nameEn || ''
                    }</span>
                    <span className="suggestion-price">
                      {product.discountPercentage ? (
                        <>
                          <span className="original-price">{formatPrice(product.originalPrice, store?.settings?.currency || 'ILS')}</span>
                        </>
                      ) : (
                        <span className="current-price">{formatPrice(product.finalPrice, store?.settings?.currency || 'ILS')}</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              {searchQuery.trim() && (
                <div 
                  className="suggestion-item search-all"
                  onClick={handleSearchSubmit}
                >
                  <div className="search-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span>{t('search.search_all_for', `البحث عن جميع النتائج لـ "${searchQuery}"`)}</span>
                </div>
              )}
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