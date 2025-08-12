import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import ProductCard from '../ProductCard/ProductCard';
import './BestSellers.css';

const BestSellers = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate } = useAffiliateNavigation();
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const { categories } = useCategories();
  
  // استخدام البيانات من الكونتكست بدلاً من useProducts
  const { products, isLoading: loading } = useAppData();
  
  // استخدام الدوال من useProducts
  const { 
    getFinalPrice,
    getMainImage,
    getProductName,
    isInStock
  } = useProducts();

  const currentLang = i18n.language;

  // Helper: chunk into pages of 4
  const chunkIntoPages = (items, size) => {
    const pages = [];
    for (let i = 0; i < items.length; i += size) {
      pages.push(items.slice(i, i + size));
    }
    return pages;
  };

  // Horizontal scroll controls
  const scrollerRef = useRef(null);
  const scrollByPage = (direction /* -1 prev, 1 next */) => {
    const el = scrollerRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth;
    el.scrollBy({ left: direction * pageWidth, behavior: 'smooth' });
  };
  const handlePrev = () => scrollByPage(-1);
  const handleNext = () => scrollByPage(1);

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
      addToCart(product, { quantity: 1 });
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
         
        </div>

        {/* Loading State */}
        {loading && bestSellerProducts.length === 0 && (
          <div className="best-sellers-loading">
            <div className="loading-spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل أفضل المنتجات...' : 'Loading best sellers...'}</p>
          </div>
        )}

        {/* Error State - لا نحتاج لهذا لأننا نستخدم البيانات من الكونتكست */}

        {/* One-row horizontal scroller, 4 items per page */}
        {!loading && (
          <div className="bestsellers-outer">
            <div className="bestsellers-carousel" ref={scrollerRef}>
              <div className="bestsellers-track">
              {bestSellerProducts.length > 0 ? (
                chunkIntoPages(bestSellerProducts, 8).map((page, pageIndex) => (
                  <div className="bestsellers-page" key={pageIndex}>
                    {page.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isInWishlist={isInWishlist}
                        handleWishlistToggle={toggleWishlist}
                        handleAddToCart={handleAddToCart}
                        categories={categories}
                      />
                    ))}
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>{currentLang === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}</p>
                </div>
              )}
              </div>
            </div>
            {/* Arrows */}
            {bestSellerProducts.length > 4 && (
              <>
                <button type="button" className="carousel-arrow left" onClick={handlePrev} aria-label={currentLang === 'ar' ? 'السابق' : 'Previous'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button type="button" className="carousel-arrow right" onClick={handleNext} aria-label={currentLang === 'ar' ? 'التالي' : 'Next'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;