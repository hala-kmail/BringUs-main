import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { allProducts } from '../../data/products';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import ProductCard from '../../components/ProductCard/ProductCard';
import './AlmostFinishedSale.css';

const almostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentSection, setCurrentSection] = useState('almost-finished');
  const [sortBy, setSortBy] = useState('stockLowToHigh');
  const [viewMode, setViewMode] = useState('grid');
  const currentLang = i18n.language;
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

  const almostFinishedTotal = allProducts.filter(product => product.stock <= 10 && product.stock > 0).length;
  const discountedTotal = allProducts.filter(product => isDiscountActive(product) && product.stock > 0).length;

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
              <span className="hero-label">{currentLang === 'ar' ? 'المنتجات القريبة من الانتهاء' : 'Almost Finished Products'}</span>
              <h1 className="hero-title">{currentLang === 'ar' ? 'المنتجات القريبة من الانتهاء' : 'Almost Finished Products'}</h1>
             
            </div>
            <div className="hero-visual">
              <div className="countdown-badge">
                <div className="timer-icon">⏰</div>
                <span>{currentLang === 'ar' ? 'تنتهي قريبا' : 'Hurry'}</span>
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
            <span className="tab-icon">
              {/* SVG Box Icon */}
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg> */}
            </span>
            {currentLang === 'ar' ? 'المنتجات القريبة من الانتهاء' : 'Almost Finished Products'}
            <span className="tab-count">({almostFinishedProducts.length})</span>
          </button>
          <button 
            className={`tab-button ${currentSection === 'discounted' ? 'active' : ''}`}
            onClick={() => setCurrentSection('discounted')}
          >
            <span className="tab-icon">
              {/* SVG Discount Tag Icon */}
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-8 8a2 2 0 0 1-2.83 0l-6.17-6.17a2 2 0 0 1 0-2.83l8-8a2 2 0 0 1 2.83 0l6.17 6.17a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/><line x1="17" y1="17" x2="17.01" y2="17"/></svg> */}
            </span>
            {currentLang === 'ar' ? 'منتجات عليها خصم' : 'Discounted Products'}
            <span className="tab-count">({discountedProducts.length})</span>
          </button>
        </div>

        {/* Shop Toolbar */}
        <ShopToolbar
          filters={{ sortBy }}
          handleSortChange={setSortBy}
          itemsPerPage={0}
          handleItemsPerPageChange={() => {}}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentLang={currentLang}
          filteredCount={currentProducts.length}
          totalCount={currentSection === 'almost-finished' ? almostFinishedTotal : discountedTotal}
          sortOptions={[
            { value: 'stockLowToHigh', label: currentLang === 'ar' ? 'الأقل مخزوناً' : 'Stock: Low to High' },
            { value: 'stockHighToLow', label: currentLang === 'ar' ? 'الأعلى مخزوناً' : 'Stock: High to Low' },
            { value: 'discountHighToLow', label: currentLang === 'ar' ? 'الأعلى خصماً' : 'Discount: High to Low' },
            { value: 'priceLowToHigh', label: currentLang === 'ar' ? 'الأقل سعراً' : 'Price: Low to High' },
            { value: 'priceHighToLow', label: currentLang === 'ar' ? 'الأعلى سعراً' : 'Price: High to Low' }
          ]}
        />

        {/* Products Grid */}
        <div className={`products-grid ${viewMode}`}>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentLang={currentLang}
                t={t}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={handleAddToCart}
                showStockInfo={currentSection === 'almost-finished'}
                showDiscountInfo={currentSection === 'discounted'}
                isListView={viewMode === 'list'}
              />
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