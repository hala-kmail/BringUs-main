import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { getBestSellerProducts, getFeatureById } from '../../data/index';
import './BestSellers.css';

const BestSellers = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get products that are marked as best sellers
  const bestSellerProducts = getBestSellerProducts();

  const currentLang = i18n.language;

  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  return (
    <section className="best-sellers">
      <div className="best-sellers-container">
        {/* Section Header */}
        <div className="section-header">
          <div className='section-header-title'>
            <h2 className="section-title">{t('best_sellers.title')}</h2>
            <p className="section-subtitle">{t('best_sellers.subtitle')}</p>
          </div>
          <Link to="/best-sellers" className="view-all-btn">
            {t('best_sellers.view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {bestSellerProducts.map((product) => {
            const feature = getFeatureById(product.featureId);
            return (
            <div key={product.id} className="product-card">
              {/* Product Image */}
              <div className="product-image">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name[currentLang]} />
                </Link>
                
                {/* Wishlist Heart Icon */}
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

                {/* Badges */}
                <div className="product-badges">
                  {product.isBestSeller && (
                    <span className="product-badge bestseller-badge">{t('best_sellers.bestseller')}</span>
                  )}
                  {product.discountPercentage && (
                    <span className="product-badge product-discount-badge">
                      -{product.discountPercentage}%
                    </span>
                  )}
                    {product.isNew && (
                      <span className="product-badge new-badge">{t('best_sellers.new')}</span>
                    )}
                </div>

                {/* Feature Badge */}
                  {feature && (
                  <div className="feature-badge">
                      {feature.name[currentLang]}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="product-info">
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="product-name">{product.name[currentLang]}</h3>
                </Link>
                
                {/* Price */}
                <div className="product-price">
                  {product.discountPrice ? (
                    <>
                      <span className="current-price">
                        {product.discountPrice.toFixed(2)} {t('best_sellers.currency')}
                      </span>
                      <span className="original-price">
                        {product.originalPrice.toFixed(2)} {t('best_sellers.currency')}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">
                      {product.originalPrice.toFixed(2)} {t('best_sellers.currency')}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="button-text">{t('best_sellers.add_to_cart')}</span>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BestSellers; 