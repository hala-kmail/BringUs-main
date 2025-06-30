import React from 'react';
import ProductCard from '../ProductCard/ProductCard';

const ProductsGrid = ({
  products = [],
  viewMode,
  currentLang,
  t,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart,
  getFeatureById,
  getCategoryById,
  showStockInfo
}) => {
  if (!Array.isArray(products)) {
    return <div>No products available</div>;
  }

  return (
    <div className={`products-grid desktop-grid ${viewMode}`}>
      {products.map((product) => (
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
          showStockInfo={showStockInfo}
          isListView={viewMode === 'list' || viewMode === 'list-view'}
        />
      ))}
    </div>
  );
};

export default ProductsGrid; 