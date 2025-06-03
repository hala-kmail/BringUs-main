import React , { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import './Wishlist.css';


const Wishlist = () => {

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    };
    const handleMobileSearchClose = () => {
      setIsMobileSearchOpen(false);
      };
  const currentLang = i18n.language;

  // Helper function to convert category name to translation key
  const getCategoryTranslationKey = (category) => {
    return category.toLowerCase().replace(/\s+/g, '_').replace(/\s*&\s*/g, '_');
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product.id}`);
  };

 
  return (
    <div className="wishlist-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <TopBar />
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
          <p className="wishlist-subtitle">
            {t('wishlist.items_count', { count: wishlistItems.length })}
          </p>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length > 0 ? (
          <div className="wishlist-content">
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  {/* Product Image */}
                  <div className="wishlist-item-image">
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name[currentLang]} />
                    </Link>
                    
                    {/* Remove Button */}
                    <button 
                      className="remove-wishlist-btn"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      title={t('wishlist.remove')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Badges */}
                    <div className="product-badges">
                      {item.isBestSeller && (
                        <span className="product-badge bestseller-badge">{t('best_sellers.bestseller')}</span>
                      )}
                      {item.isNew && (
                        <span className="product-badge product-new-badge">{t('best_sellers.new')}</span>
                      )}
                    {item.discountPercentage && (
                        <span className="product-badge product-discount-badge">
                        -{item.discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Feature Badge */}
                    {item.feature && (
                      <div className="feature-badge">
                        {item.feature[currentLang]}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="wishlist-item-info">
                    <Link to={`/product/${item.id}`} className="wishlist-item-link">
                      <h3 className="wishlist-item-name">{item.name[currentLang]}</h3>
                    </Link>
                    
                    {/* Price */}
                    <div className="wishlist-item-price">
                      {item.discountPrice ? (
                        <>
                          <span className="current-price">
                            {item.discountPrice.toFixed(2)} {t('shop.currency')}
                          </span>
                          <span className="original-price">
                            {item.originalPrice.toFixed(2)} {t('shop.currency')}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          {item.originalPrice.toFixed(2)} {t('shop.currency')}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      className="wishlist-add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{t('shop.add_to_cart')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Wishlist; 