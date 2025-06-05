import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { allProducts } from '../../data/products';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import './almostFinishedSale.css';

const almostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentSection, setCurrentSection] = useState('almost-finished');
  const [sortBy, setSortBy] = useState('stockLowToHigh');

  // Helper function to check if discount is active
  const isDiscountActive = (product) => {
    if (!product.discountPrice || !product.discountPercentage) return false;
    if (!product.discountEndTime) return true; // If no end time, consider it active
    
    const now = new Date();
    const endTime = new Date(product.discountEndTime);
    return now < endTime;
  };

  // Helper function to get effective price (considering expired discounts)
  const getEffectivePrice = (product) => {
    if (isDiscountActive(product)) {
      return product.discountPrice;
    }
    return product.originalPrice;
  };

  // Helper function to get discount percentage (only if active)
  const getActiveDiscountPercentage = (product) => {
    if (isDiscountActive(product)) {
      return product.discountPercentage;
    }
    return null;
  };

  // Filter products by type - only show products with stock 10 or less
  const almostFinishedProducts = allProducts
    .filter(product => product.stock <= 10 && product.stock > 0)
    .sort((a, b) => {
      switch (sortBy) {
        case 'stockLowToHigh':
          return a.stock - b.stock;
        case 'stockHighToLow':
          return b.stock - a.stock;
        case 'discountHighToLow':
          return (getActiveDiscountPercentage(b) || 0) - (getActiveDiscountPercentage(a) || 0);
        case 'priceLowToHigh':
          return getEffectivePrice(a) - getEffectivePrice(b);
        case 'priceHighToLow':
          return getEffectivePrice(b) - getEffectivePrice(a);
        default:
          return a.stock - b.stock;
      }
    });

  // Show only products with active discounts
  const discountedProducts = allProducts
    .filter(product => isDiscountActive(product) && product.stock > 0)
    .sort((a, b) => {
      switch (sortBy) {
        case 'stockLowToHigh':
          return a.stock - b.stock;
        case 'stockHighToLow':
          return b.stock - a.stock;
        case 'discountHighToLow':
          return (getActiveDiscountPercentage(b) || 0) - (getActiveDiscountPercentage(a) || 0);
        case 'priceLowToHigh':
          return getEffectivePrice(a) - getEffectivePrice(b);
        case 'priceHighToLow':
          return getEffectivePrice(b) - getEffectivePrice(a);
        default:
          return (getActiveDiscountPercentage(b) || 0) - (getActiveDiscountPercentage(a) || 0);
      }
    });

  const currentProducts = currentSection === 'almost-finished' ? almostFinishedProducts : discountedProducts;

  const getStockStatus = (stock) => {
    if (stock <= 3) return 'critical';
    if (stock <= 5) return 'low';
    if (stock <= 10) return 'limited';
    return 'available';
  };

  const getStockStatusText = (stock) => {
    const status = getStockStatus(stock);
    return t(`stock.${status}`);
  };

  const handleAddToCart = (product) => {
    // Navigate to product details page like other components
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  return (
    <div className="almost-finished-sale-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* <TopBar /> */}
      <Navbar />
      <SecondaryNavbar />
      
      <div className="almost-finished-container">
        {/* Hero Section */}
        <div className="almost-finished-hero">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">{t('almostFinished.heroLabel')}</span>
              <h1 className="hero-title">{t('almostFinished.heroTitle')}</h1>
              <p className="hero-subtitle">{t('almostFinished.heroSubtitle')}</p>
            </div>
            <div className="hero-visual">
              <div className="countdown-badge">
                <div className="timer-icon">⏰</div>
                <span>{t('almostFinished.hurry')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="section-tabs">
          <button 
            className={`tab-button ${currentSection === 'almost-finished' ? 'active' : ''}`}
            onClick={() => setCurrentSection('almost-finished')}
          >
            <span className="tab-icon">📦</span>
            {t('almostFinished.almostFinished')}
            <span className="tab-count">({almostFinishedProducts.length})</span>
          </button>
          <button 
            className={`tab-button ${currentSection === 'discounted' ? 'active' : ''}`}
            onClick={() => setCurrentSection('discounted')}
          >
            <span className="tab-icon">🏷️</span>
            {t('almostFinished.discountedProducts')}
            <span className="tab-count">({discountedProducts.length})</span>
          </button>
        </div>

        {/* Sort Controls */}
        <div className="sort-controls">
          <div className="results-info">
            <span>{t('almostFinished.resultsFound', { count: currentProducts.length })}</span>
          </div>
          <div className="sort-dropdown">
            <label htmlFor="sort-select">{t('almostFinished.sortBy')}</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="stockLowToHigh">{t('almostFinished.sortOptions.stockLowToHigh')}</option>
              <option value="stockHighToLow">{t('almostFinished.sortOptions.stockHighToLow')}</option>
              <option value="discountHighToLow">{t('almostFinished.sortOptions.discountHighToLow')}</option>
              <option value="priceLowToHigh">{t('almostFinished.sortOptions.priceLowToHigh')}</option>
              <option value="priceHighToLow">{t('almostFinished.sortOptions.priceHighToLow')}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div key={product.id} className="product-card">
                {/* Product Image */}
                <div className="product-image-container">
                  <div 
                    className="product-image"
                    style={{
                      backgroundImage: `url(${product.image})`
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                  </div>
                  
                  {/* Discount Badge */}
                  {getActiveDiscountPercentage(product) && (
                    <div className="discount-badge">
                      -{getActiveDiscountPercentage(product)}%
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className={`stock-badge ${getStockStatus(product.stock)}`}>
                    {getStockStatusText(product.stock)}
                  </div>

                  {/* Wishlist Button */}
                  <div 
                    className="wishlist-btn"
                    onClick={() => handleWishlistToggle(product)}
                  >
                    <svg 
                      width="24"
                      height="24"
                      viewBox="0 0 24 24" 
                      fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                      stroke={isInWishlist(product.id) ? '#ef4444' : '#6b7280'}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <div className="product-main-content">
                    <h3 
                      className="product-name"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name[i18n.language] || product.name.en}
                    </h3>
                    
                    <div className="product-pricing">
                      {isDiscountActive(product) ? (
                        <>
                          <span className="current-price">
                            {product.discountPrice.toFixed(2)} {t('shop.currency')}
                          </span>
                          <span className="original-price">
                            {product.originalPrice.toFixed(2)} {t('shop.currency')}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          {product.originalPrice.toFixed(2)} {t('shop.currency')}
                        </span>
                      )}
                    </div>

                    {/* Stock Info - Only show for almost finished products */}
                    {currentSection === 'almost-finished' && (
                      <div className="stock-info">
                        <div className={`stock-level ${getStockStatus(product.stock)}`}>
                          <span className="stock-text">
                            {t('almostFinished.onlyLeft', { count: product.stock })}
                          </span>
                          <div className="stock-bar">
                            <div 
                              className="stock-fill" 
                              style={{ 
                                width: `${Math.min((product.stock / 10) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Discount Info - Only show for discounted products with active discounts */}
                    {currentSection === 'discounted' && isDiscountActive(product) && (
                      <>
                        <div className="discount-info">
                          <div className="savings-amount">
                            <span className="savings-label">{t('almostFinished.youSave')}</span>
                            <span className="savings-value">
                              {(product.originalPrice - product.discountPrice).toFixed(2)} {t('shop.currency')}
                            </span>
                          </div>
                          <div className="discount-percentage-large">
                            <span className="discount-text">{getActiveDiscountPercentage(product)}% {t('almostFinished.off')}</span>
                          </div>
                        </div>
                        
                        {/* Countdown Timer for discount end time - Only in discounted section */}
                        {product.discountEndTime && (
                          <div >
                            <CountdownTimer endTime={product.discountEndTime} size="small" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                 
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>{t('almostFinished.noProducts')}</h3>
              <p>{t('almostFinished.noProductsDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default almostFinishedSale; 