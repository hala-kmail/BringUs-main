import React from 'react';

const ProductsGrid = ({
  paginatedProducts,
  viewMode,
  ProductCard,
  currentLang,
  t,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart,
  getFeatureById,
  getCategoryById,
  showStockInfo
}) => {
  return (
    <div className={`products-grid desktop-grid ${viewMode}`}>
      {paginatedProducts.map((product) => (
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