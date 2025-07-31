import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../ProductCard/ProductCard';
import './BestSellers.css';

const BestSellers = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const { categories } = useCategories();

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
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 8);
      setBestSellerProducts(sortedProducts);
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

        {/* Loading State */}
        {loading && bestSellerProducts.length === 0 && (
          <div className="best-sellers-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل أفضل المنتجات...' : 'Loading best sellers...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="best-sellers-error">
            <p>{currentLang === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products'}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="products-grid">
            {bestSellerProducts.length > 0 ? (
              bestSellerProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInWishlist={isInWishlist}
                  handleWishlistToggle={toggleWishlist}
                  handleAddToCart={handleAddToCart}
                  categories={categories}
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

export default BestSellers;