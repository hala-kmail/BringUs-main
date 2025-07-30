import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import useProducts from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';

const NewArrivals = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);

  const { 
    products,
    loading, 
    error,
    getFinalPrice,
    getMainImage,
    getProductName,
    isInStock
  } = useProducts();

  const currentLang = i18n.language;
  
  useEffect(() => {
    if (products && products.length > 0) {
      const sortedProducts = [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
      setNewArrivalProducts(sortedProducts);
    }
  }, [products]);

  const handleAddToCart = (product) => {
    if (isInStock(product)) {
      addToCart({
        id: product._id,
        name: getProductName(product, currentLang),
        price: getFinalPrice(product),
        image: getMainImage(product),
        quantity: 1
      });
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-container">
        {/* Section Header */}
        <div className="section-header">
          <div className='section-header-title'>
            <h2 className="section-title">{t('new_arrivals.title')}</h2>
            <p className="section-subtitle">{t('new_arrivals.subtitle')}</p>
          </div>
          <Link to="/new-arrivals" className="view-all-btn">
            {t('new_arrivals.view_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {/* Loading State */}
        {loading && newArrivalProducts.length === 0 && (
          <div className="new-arrivals-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل أحدث المنتجات...' : 'Loading new arrivals...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="new-arrivals-error">
            <p>{currentLang === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products'}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="products-grid">
            {newArrivalProducts.length > 0 ? (
              newArrivalProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInWishlist={isInWishlist}
                  handleWishlistToggle={toggleWishlist}
                  handleAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="no-products">
                <p>{currentLang === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals; 