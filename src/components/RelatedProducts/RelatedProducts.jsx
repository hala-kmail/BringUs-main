
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductsByCategory, getCategoryById, getFeatureById } from '../../data/index';
import ProductCard from '../ProductCard/ProductCard';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProductId, currentCategoryId }) => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const currentLang = i18n.language;


  const currentCategory = getCategoryById(currentCategoryId);

  // Filter products by category and exclude current product
  const relatedProducts = getProductsByCategory(currentCategoryId)
    .filter(product => product.id !== currentProductId)
    .slice(0, 4); // Show only 4 related products

  const handleAddToCart = (product) => {
    navigate(`/product/${product.id}`);
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



  const categorySlug = currentCategory.slug['en'];

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
        <div className="products-grid">
          {relatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currentLang={currentLang}
              t={t}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleAddToCart={() => {
                handleAddToCart(product);
                handleProductClick();
              }}
              getFeatureById={getFeatureById}
              getCategoryById={() => null} // Prevent category link from showing
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
