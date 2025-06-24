import React from 'react';
import CountdownTimer from '../CountdownTimer/CountdownTimer';

const ProductInfoSection = ({
  product,
  category,
  feature,
  currentLang,
  t,
  originalPrice,
  discountPrice,
  isDiscountActive,
  getEffectivePrice
}) => {
  return (
    <div className="product-detail-info">
      {/* Product Badges */}
      <div className="product-detail-badges">
        {product.isBestSeller && (
          <span className="product-detail-badge product-bestseller-badge">
            {t('product_detail.best_seller')}
          </span>
        )}
        {product.isNew && (
          <span className="product-detail-badge product-new-badge">
            {t('product_detail.new')}
          </span>
        )}
        {product.discountPercentage && (
          <span className="product-detail-badge product-sale-badge">
            -{product.discountPercentage}%
          </span>
        )}
        {feature && (
          <span className="product-detail-badge product-organic-badge">
            {feature.name[currentLang]}
          </span>
        )}
      </div>
      {/* Product Title */}
      <h1 className="product-title">{product.name[currentLang]}</h1>
      {/* Product Description */}
      <div className="product-description">
        <p>{product.description[currentLang]}</p>
      </div>
      {/* Product Price */}
      <div className="product-detail-price">
        {isDiscountActive(product) ? (
          <>
            <span className="product-current-price">
              ₪ {getEffectivePrice(product).toFixed(2)}
            </span>
            <span className="product-original-price">
              ₪{originalPrice.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="product-current-price">
            ₪{originalPrice.toFixed(2)}
          </span>
        )}
      </div>
      {/* Countdown Timer for Discounted Products */}
      {product.discountPercentage && product.discountEndTime && isDiscountActive(product) && (
        <div className="product-countdown-section">
          <CountdownTimer endTime={product.discountEndTime} size="small" />
        </div>
      )}
    </div>
  );
};

export default ProductInfoSection; 