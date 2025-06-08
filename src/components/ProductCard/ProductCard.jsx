import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({
  product,
  currentLang,
  t,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart,
  getFeatureById,
  getCategoryById,
  showStockInfo = false,
}) => {
  const feature = getFeatureById ? getFeatureById(product.featureId) : null;
  const category = getCategoryById ? getCategoryById(product.categoryId) : null;

  // دالة لتحديد حالة المخزون
  const getStockStatus = (stock) => {
    if (stock === 0) return 'sold_out';
    if (stock <= 10) return 'low-stock';
    return 'in_stock';
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name[currentLang]} />
        </Link>

        {/* Wishlist Heart Icon */}
        <div
          className="wishlist-btn"
          onClick={() => handleWishlistToggle(product)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
            stroke={isInWishlist(product.id) ? '#ef4444' : '#6b7280'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Badges */}
        <div className="product-badges">
          {product.isNew && (
            <span className="product-badge product-new-badge">
              {t('new_arrivals.new')}
            </span>
          )}
          {product.discountPercentage && (
            <span className="product-badge product-discount-badge">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="product-badge bestseller-badge">
              {t('new_arrivals.bestseller')}
            </span>
          )}
        </div>

        {/* Feature Badge */}
        {feature && (
          <div className="feature-badge">{feature.name[currentLang]}</div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info-section">
        <div className="product-info-top">
          <Link
            to={`/product/${product.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 className="product-top-name">{product.name[currentLang]}</h3>
          </Link>
          {category && (
            <Link
              to={`/category/${category.slug['en']}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h4
                className="product-category-name"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '300',
                  color: '#6b7280',
                  margin: '0.25rem 0'
                }}
              >
                {category.name[currentLang]}
              </h4>
            </Link>
          )}
          {/* Stock Info */}
          {showStockInfo && product.stock !== undefined && (
            <div className="stock-info">
              <div className={`stock-level ${getStockStatus(product.stock)}`}>
                <span className="stock-text">
                  {getStockStatus(product.stock) === 'low-stock'
                    ? t('almostFinished.onlyLeft', { count: product.stock }) 
                    : t(`shop.${getStockStatus(product.stock)}`)}  
                </span>
                <div className="stock-bar">
                  <div 
                    className="stock-fill" 
                    style={{ 
                      width: `${Math.min((product.stock / 10) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="product-info-bottom">
          {/* Price */}
          <div className="product-price-container">
            {product.discountPrice ? (
              <>
                <span className="current-price">
                  {product.discountPrice.toFixed(2)} {t('new_arrivals.currency')}
                </span>
                <span className="original-price">
                  {product.originalPrice.toFixed(2)} {t('new_arrivals.currency')}
                </span>
              </>
            ) : (
              <span className="current-price">
                {product.originalPrice.toFixed(2)} {t('new_arrivals.currency')}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            className="add-to-cart-btn"
            onClick={() => handleAddToCart(product)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;