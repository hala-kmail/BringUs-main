import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ProductCard/ProductCard';

const ProductsGrid = ({
  products = [],
  viewMode = 'grid',
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  loading = false
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="no-products">
        <h3>{t('shop.noProducts.title')}</h3>
        <p>{t('shop.noProducts.description')}</p>
      </div>
    );
  }

  return (
    <div className={`products-grid desktop-grid ${viewMode}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          currentLang={currentLang}
          t={t}
          isInWishlist={isInWishlist}
          handleWishlistToggle={onWishlistToggle}
          handleAddToCart={onAddToCart}
          isListView={viewMode === 'list'}
        />
      ))}
    </div>
  );
};

export default ProductsGrid; 