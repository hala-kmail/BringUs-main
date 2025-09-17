import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
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
  const { categories } = useCategories();

  const { 
    products,
    loading,
    error,
    fetchAlmostSoldProducts
  } = useAlmostFinishedSale();

  const currentLang = i18n.language;
  
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

  // Don't render if no almost finished products
  if (!products || products.length === 0) {
    return null;
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
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                currentLang={currentLang}
                t={t}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={() => handleAddToCart(product)}
                getFeatureById={() => null}
                getCategoryById={() => null}
                categories={categories}
              />
            ))
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