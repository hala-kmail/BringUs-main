import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { getNewProducts, getFeatureById,getCategoryById } from '../../data/index';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';

const NewArrivals = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get products that are marked as new arrivals
  const newArrivalProducts = getNewProducts();

  const currentLang = i18n.language;

  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-container">
        {/* Section Header */}
        <div className="section-header">
<div className='section-header-title'><h2 className="section-title">{t('new_arrivals.title')}</h2>
          <p className="section-subtitle">{t('new_arrivals.subtitle')}</p></div>
          <Link to="/new-arrivals" className="view-all-btn">
            {t('new_arrivals.view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
        {newArrivalProducts.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      currentLang={currentLang}
      t={t}
      isInWishlist={isInWishlist}
      handleWishlistToggle={handleWishlistToggle}
      handleAddToCart={handleAddToCart}
      getFeatureById={getFeatureById}
      getCategoryById={getCategoryById}
    />
  ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals; 