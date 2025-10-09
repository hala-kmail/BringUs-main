import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';
import useAlmostFinishedSale from '../../hooks/useAlmostFinishedSale';
import useCategories from '../../hooks/useCategories';
import ProductCard from '../../components/ProductCard/ProductCard';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './AlmostFinishedSale.css';

const AlmostFinishedSale = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { store } = useAppData();
  const { categories } = useCategories();

  const { 
    products,
    loading,
    error,
    fetchAlmostSoldProducts
  } = useAlmostFinishedSale();

  const currentLang = i18n.language;
  const storeSlug = store?.slug || '';
  
  useEffect(() => {
    const storedStore = localStorage.getItem('storeData');
    const storeId = storedStore ? JSON.parse(storedStore)._id : null;

    if (storeId) {
      fetchAlmostSoldProducts(storeId);
    }
  }, [fetchAlmostSoldProducts]);
  
 
 
  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product, { quantity: 1 });
    }
  };

  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Show loading state
  if (loading) {
    return (
      <section className="almost-finished-sale">
        <Navbar />
        <SecondaryNavbar />
        <div className="almost-finished-container">
          <div className="loading-message">
            <p>{t('loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="almost-finished-sale">
        <Navbar />
        <SecondaryNavbar />
        <div className="almost-finished-container">
          <div className="error-message">
            <p>{t('error_loading_products')}: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state when no almost finished products
  if (!products || products.length === 0) {
    return (
      <section className="almost-finished-sale">
        <Navbar />
        <SecondaryNavbar />
        <div className="almost-finished-container">
          <div className="almost-finished-header">
            <div className="header-background">
              <div className="header-pattern"></div>
              <div className="header-glow"></div>
            </div>
            <div className="almost-finished-title-section">
              <div className="title-badge">
                <span className="badge-icon">⚡</span>
                <span className="badge-text">{t('almost_finished_sale.title')}</span>
              </div>
              <p className="almost-finished-subtitle">{t('almost_finished_sale.subtitle')}</p>
            </div>
          </div>
          
          <div className="no-products-container">
            <div className="no-products-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="no-products-title">
              {t('almost_finished_sale.no_products_title')}
            </h3>
            <p className="no-products-message">
              {t('almost_finished_sale.no_products_message')}
            </p>
            <div className="no-products-actions">
              <a href={`/${storeSlug}/shop`} className="browse-shop-btn">
                {t('almost_finished_sale.browse_shop')}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="almost-finished-sale">
      <Navbar />
      <SecondaryNavbar />
      <div className="almost-finished-container">
        {/* Enhanced Section Header */}
        <div className="almost-finished-header">
          <div className="header-background">
            <div className="header-pattern"></div>
            <div className="header-glow"></div>
          </div>
          <div className="almost-finished-title-section">
            <div className="title-badge">
              <span className="badge-icon">⚡</span>
              <span className="badge-text">{t('almost_finished_sale.title')}</span>
            </div>
            {/* <h2 className="almost-finished-title">
              <span className="title-highlight">{t('almost_finished.title')}</span>
              <span className="title-accent">!</span>
            </h2> */}
            <p className="almost-finished-subtitle">{t('almost_finished_sale.subtitle')}</p>
          
          </div>
          
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map((product) => {
              // التأكد من وجود productLabels في البيانات
              const productWithLabels = {
                ...product,
                productLabels: product.productLabels || []
              };
              
              return (
                <ProductCard
                  key={product._id}
                  product={productWithLabels}
                  isInWishlist={isInWishlist}
                  handleWishlistToggle={handleWishlistToggle}
                  categories={categories}
                />
              );
            })
          ) : (
            <div className="no-products-message">
              <p>{t('no_almost_finished_products')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AlmostFinishedSale; 