
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAppData } from '../../contexts/AppDataContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import ProductCard from '../../components/ProductCard/ProductCard';
import useCategories from '../../hooks/useCategories';
import './Wishlist.css';

const Wishlist = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const currentLang = i18n.language;
  const { categories } = useCategories();
  const { features } = useAppData();

  // استخدام Context بدلاً من API hook
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    clearWishlist,
    toggleWishlist
  } = useWishlist();

  // Helper functions to work with real API data
  const getFeatureById = (featureId) => {
    return features?.find(feature => feature._id === featureId) || null;
  };

  const getCategoryById = (categoryId) => {
    return categories?.find(category => category._id === categoryId) || null;
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    navigate(`/product/${product._id || product.id}`);
  };

  const handleClearWishlist = async () => {
    if (window.confirm(t('wishlist.confirm_clear'))) {
      await clearWishlist();
    }
  };

  // تحويل البيانات من API إلى الشكل المطلوب للمكونات
  const getProductData = (wishlistItem) => {
    // إذا كان المنتج موجود في البيانات (من API likes)
    if (wishlistItem.product) {
      return wishlistItem.product;
    }
    
    // إذا كان المنتج موجود في البيانات مباشرة (من API)
    if (wishlistItem.nameAr || wishlistItem.nameEn) {
      return {
        _id: wishlistItem.productId || wishlistItem._id,
        id: wishlistItem.productId || wishlistItem._id,
        nameAr: wishlistItem.nameAr,
        nameEn: wishlistItem.nameEn,
        name: {
          ar: wishlistItem.nameAr,
          en: wishlistItem.nameEn
        },
        price: wishlistItem.price || 0,
        compareAtPrice: wishlistItem.compareAtPrice || 0,
        discountPercentage: wishlistItem.discountPercentage || 0,
        mainImage: wishlistItem.mainImage,
        images: wishlistItem.images || [],
        category: wishlistItem.category,
        stockStatus: wishlistItem.stockStatus,
        availableQuantity: wishlistItem.availableQuantity,
        lowStockThreshold: wishlistItem.lowStockThreshold,
        productLabels: wishlistItem.productLabels || [],
        colors: wishlistItem.colors || '[]'
      };
    }
    
    // إذا لم يكن موجود، نستخدم البيانات الأساسية
    return {
      _id: wishlistItem.productId || wishlistItem._id,
      id: wishlistItem.productId || wishlistItem._id,
      nameAr: 'منتج',
      nameEn: 'Product',
      name: { ar: 'منتج', en: 'Product' },
      price: wishlistItem.price || 0,
      compareAtPrice: 0,
      discountPercentage: 0,
      mainImage: null,
      images: [],
      category: null,
      stockStatus: 'in_stock',
      availableQuantity: 0,
      lowStockThreshold: 5,
      productLabels: [],
      colors: '[]'
    };
  };

  return (
    <div className="wishlist-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      
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
        
          {wishlistItems.length > 0 && (
            <button 
              onClick={handleClearWishlist}
              className="clear-wishlist-btn"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('wishlist.clear_all')}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="wishlist-loading">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="wishlist-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Wishlist Content */}
        {!loading && !error && wishlistItems.length > 0 ? (
          <div className="wishlist-content">
            <div className="products-grid">
              {wishlistItems.map((wishlistItem) => {
                const product = getProductData(wishlistItem);
                return (
                <ProductCard
                    key={wishlistItem._id || wishlistItem.productId}
                    product={product}
                  currentLang={currentLang}
                  t={t}
                  isInWishlist={() => true} // Always true since item is in wishlist
                  handleWishlistToggle={handleWishlistToggle}
                  handleAddToCart={handleAddToCart}
                  getFeatureById={getFeatureById}
                  getCategoryById={getCategoryById}
                  categories={categories}
                />
                );
              })}
            </div>
          </div>
        ) : !loading && !error ? (
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
        ) : null}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Wishlist;