import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductsByCategory, getCategoryById, getFeatureById } from '../../data/index';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProductId, currentCategoryId }) => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const currentLang = i18n.language;

  // Get current category
  const currentCategory = getCategoryById(currentCategoryId);

  // Filter products by category and exclude current product
  const relatedProducts = getProductsByCategory(currentCategoryId)
    .filter(product => product.id !== currentProductId)
    .slice(0, 4); // Show only 4 related products

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    // Add to cart logic here
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  // Function to scroll to top when clicking on a related product
  const handleProductClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Don't render if no related products or category
  if (relatedProducts.length === 0 || !currentCategory) {
    return null;
  }

  // Create category slug for navigation - using the same mapping as Category page
  const getCategorySlug = (category) => {
    const categoryName = category.name.en;
    const mapping = {
      'Fruits & Vegetables': 'fruits-vegetables',
      'Meats & Seafood': 'meats-seafood', 
      'Breakfast & Dairy': 'breakfast-dairy',
      'Breads & Bakery': 'breads-bakery',
      'Beverages': 'beverages',
      'Frozen Foods': 'frozen-foods',
      'Biscuits & Snacks': 'biscuits-snacks',
      'Grocery & Staples': 'grocery-staples',
      'Household Needs': 'household-needs',
      'Healthcare': 'healthcare',
      'Baby & Pregnancy': 'baby-pregnancy'
    };
    return mapping[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-').replace(/\s*&\s*/g, '-');
  };

  const categorySlug = getCategorySlug(currentCategory);

  return (
    <section className="related-products">
      <div className="related-products-container">
        {/* Section Header */}
        <div className="related-section-header">
          <div className='related-section-header-title'>
            <h2 className="related-section-title">{t('related_products.title')}</h2>
            <p className="related-section-subtitle">{t('related_products.subtitle')}</p>
          </div>
          <Link to={`/category/${categorySlug}`} className="related-view-all-btn">
            {t('related_products.view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="related-products-grid">
          {relatedProducts.map((product) => {
            const feature = getFeatureById(product.featureId);
            return (
            <div key={product.id} className="related-product-card">
              {/* Product Image */}
              <div className="related-product-image">
                  <Link to={`/product/${product.id}`} onClick={handleProductClick}>
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

                {/* Discount Badge */}
                {product.discountPercentage && (
                  <div className="related-product-badges">
                    <span className="related-product-badge related-product-discount-badge">
                      -{product.discountPercentage}%
                    </span>
                  </div>
                )}

                {/* Feature Badge */}
                  {feature && (
                  <div className="related-feature-badge">
                      {feature.name[currentLang]}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="related-product-info">
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleProductClick}>
                  <h3 className="related-product-name">{product.name[currentLang]}</h3>
                </Link>
                
                {/* Price */}
                <div className="related-product-price">
                  {product.discountPrice ? (
                    <>
                      <span className="related-current-price">
                        {product.discountPrice.toFixed(2)} {t('related_products.currency')}
                      </span>
                      <span className="related-original-price">
                        {product.originalPrice.toFixed(2)} {t('related_products.currency')}
                      </span>
                    </>
                  ) : (
                    <span className="related-current-price">
                      {product.originalPrice.toFixed(2)} {t('related_products.currency')}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="related-add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="button-text">{t('related_products.add_to_cart')}</span>
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

export default RelatedProducts; 