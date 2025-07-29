import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
// Remove static import
// import { allProducts } from '../../data/products';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import ProductCard from '../../components/ProductCard/ProductCard';
import { isDiscountActive, getEffectivePrice } from '../../utils/productUtils';
// Add dynamic data hooks
import useProducts from '../../hooks/useProducts';
import { useAppData } from '../../contexts/AppDataContext';
import './AlmostFinishedSale.css';

const AlmostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentSection, setCurrentSection] = useState('almost-finished');
  const [sortBy, setSortBy] = useState('stockLowToHigh');
  const [viewMode, setViewMode] = useState('grid');
  const currentLang = i18n.language;
  
  // Use dynamic data
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { store } = useAppData();
  
  // Use products from API instead of static data
  const allProducts = products || [];

  const getActiveDiscountPercentage = (product) => {
    if (isDiscountActive(product)) {
      return Number(product.discountPercentage) || 0;
    }
    return 0;
  };

  // Unified sort function
  const getSortFunction = (sortBy, getActiveDiscountPercentage, getEffectivePrice) => (a, b) => {
      switch (sortBy) {
        case 'stockLowToHigh':
          return a.stock - b.stock;
        case 'stockHighToLow':
          return b.stock - a.stock;
        case 'discountHighToLow':
        return getActiveDiscountPercentage(b) - getActiveDiscountPercentage(a);
      case 'discountLowToHigh':
        return getActiveDiscountPercentage(a) - getActiveDiscountPercentage(b); 
        case 'priceLowToHigh':
          return getEffectivePrice(a) - getEffectivePrice(b);
        case 'priceHighToLow':
          return getEffectivePrice(b) - getEffectivePrice(a);
        default:
          return a.stock - b.stock;
      }
  };

  // Filter products based on lowStockThreshold instead of hardcoded value
  const almostFinishedProducts = allProducts
    .filter(product => {
      const stockThreshold = product.lowStockThreshold || 5; // fallback to 5 if not defined
      return product.stock <= stockThreshold && product.stock > 0;
    })
    .sort(getSortFunction(sortBy, getActiveDiscountPercentage, getEffectivePrice));

  const discountedProducts = allProducts
    .filter(product => isDiscountActive(product) && product.stock > 0)
    .sort(getSortFunction(sortBy, getActiveDiscountPercentage, getEffectivePrice));

  const currentProducts = currentSection === 'almost-finished' ? almostFinishedProducts : discountedProducts;

  const handleAddToCart = (product) => {
    // Navigate to product details page like other components
    navigate(`/product/${product._id || product.id}`);
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  // Update counts to use lowStockThreshold
  const almostFinishedTotal = allProducts.filter(product => {
    const stockThreshold = product.lowStockThreshold || 5;
    return product.stock <= stockThreshold && product.stock > 0;
  }).length;
  
  const discountedTotal = allProducts.filter(product => isDiscountActive(product) && product.stock > 0).length;

  // Loading state
  if (productsLoading) {
    return (
      <div className="almost-finished-sale-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <SecondaryNavbar />
        <div className="almost-finished-container">
          <div className="loading-state" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#666'
          }}>
            {currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className="almost-finished-sale-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <SecondaryNavbar />
        <div className="almost-finished-container">
          <div className="error-state" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#ef4444'
          }}>
            {currentLang === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="almost-finished-sale-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      
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
          sortOptions={
            currentSection === 'almost-finished'
              ? [
                  { value: 'stockLowToHigh', label: currentLang === 'ar' ? 'الأقل مخزوناً' : 'Stock: Low to High' },
                  { value: 'stockHighToLow', label: currentLang === 'ar' ? 'الأعلى مخزوناً' : 'Stock: High to Low' },
                  { value: 'priceLowToHigh', label: currentLang === 'ar' ? 'الأقل سعراً' : 'Price: Low to High' },
                  { value: 'priceHighToLow', label: currentLang === 'ar' ? 'الأعلى سعراً' : 'Price: High to Low' }
                ]
              : [
                  { value: 'discountHighToLow', label: currentLang === 'ar' ? 'الأعلى خصماً' : 'Discount: High to Low' },
                  { value: 'discountLowToHigh', label: currentLang === 'ar' ? 'الأقل خصماً' : 'Discount: Low to High' },
                  { value: 'priceLowToHigh', label: currentLang === 'ar' ? 'الأقل سعراً' : 'Price: Low to High' },
                  { value: 'priceHighToLow', label: currentLang === 'ar' ? 'الأعلى سعراً' : 'Price: High to Low' }
                ]
          }
        />

        {/* Products Grid */}
        <div className={`products-grid ${viewMode}`}>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
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

export default AlmostFinishedSale; 