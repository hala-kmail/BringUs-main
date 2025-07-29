import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import { getSimpleColorsFromColorsField, isDiscountActive, getEffectivePrice } from '../../utils/productUtils'; // استيراد الدوال

const ProductCard = ({
  product,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart,
  showStockInfo = false,
  showDiscountInfo = false,
  isListView = false,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // استخدام البيانات من API
  const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
  const productDescription = currentLang === 'ar' ? product.descriptionAr : product.descriptionEn;
  const productImage = product.mainImage || (product.images && product.images[0]) || null;
  const categoryName = product.category ? (currentLang === 'ar' ? product.category.nameAr : product.category.nameEn) : null;
  
  // دالة لتحديد حالة المخزون
  const getStockStatus = (product) => {
    if (product.stockStatus === 'out_of_stock' || product.availableQuantity === 0) return 'sold_out';
    if (product.availableQuantity <= product.lowStockThreshold) return 'low-stock';
    return 'in_stock';
  };

  const getStockStatusForAlmostFinishedSale = (quantity) => {
    if (quantity <= 4) return 'red';
    if (quantity <= 7) return 'orange';
    return 'yellow';
  };

  // التحقق من وجود تسميات للمنتج
  const hasNewLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'جديد' : 'new')
  );
  
  const hasFeaturedLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'مميز' : 'featured')
  );

  const hasSaleLabel = product.productLabels?.some(label => 
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'تخفيض' : 'sale')
  );
  
  const processedColors = Array.isArray(product.allColors)
  ? product.allColors.map(color => {
      if (Array.isArray(color)) {
        return {
          type: 'mixed',
          value: color
        };
      }
      return {
        type: 'single',
        value: color
      };
    })
  : [];

  
  return (
    <div className={`product-card${isListView ? ' list-view' : ''}`}>
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product._id}`}>
          <img 
            className='product-image-img' 
            src={productImage || '/placeholder-product.jpg'} 
            alt={productName}
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </Link>

        {/* Wishlist Heart Icon */}
        <div
          className="wishlist-btn"
          onClick={() => handleWishlistToggle && handleWishlistToggle(product)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isInWishlist && isInWishlist(product._id) ? '#ef4444' : 'none'}
            stroke={isInWishlist && isInWishlist(product._id) ? '#ef4444' : '#6b7280'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Badges */}
        <div className="product-badges">
          {hasNewLabel && (
            <span className="product-badge product-new-badge">
              {currentLang === 'ar' ? 'جديد' : 'New'}
            </span>
          )}
          {hasFeaturedLabel && (
            <span className="product-badge bestseller-badge">
              {currentLang === 'ar' ? 'مميز' : 'Featured'}
            </span>
          )}
          {hasSaleLabel && (
            <span className="product-badge product-discount-badge">
              {currentLang === 'ar' ? 'تخفيض' : 'Sale'}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="product-badge product-discount-badge">
              -{product.discountPercentage}%
            </span>
          )}
          {product.stockStatus === 'out_of_stock' && (
            <span className="product-badge out-of-stock-badge">
              {currentLang === 'ar' ? 'نفدت الكمية' : 'Out of Stock'}
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info-section product-info">
        <div className="product-info-top">
          <Link
            to={`/product/${product._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 className="product-top-name">{productName}</h3>
          </Link>
          
          {categoryName && (
            <Link 
              to={`/category/${product.category?.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h4
                className="product-category-name"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '300',
                  color: '#6b7280',
                  margin: '0.25rem 0',
                  cursor: 'pointer'
                }}
              >
                {categoryName}
              </h4>
            </Link>
          )}
          
          {isListView && productDescription && (
            <div className="product-description">
              {productDescription}
            </div>
          )}
          
          {/* Stock Info (خاص بصفحة AlmostFinishedSale) */}
          {showStockInfo && (
            <div className="stock-info">
              <div className={`stock-level ${getStockStatus(product)}`}>
                <span className="stock-text">
                  {getStockStatus(product) === 'sold_out'
                    ? (currentLang === 'ar' ? 'نفدت الكمية' : 'Out of Stock')
                    : getStockStatus(product) === 'low-stock'
                      ? currentLang === 'ar' ? `${product.availableQuantity} متبقي فقط` : `${product.availableQuantity} Only left`
                      : currentLang === 'ar' ? 'في المخزون' : 'In Stock'}
                </span>
                {getStockStatus(product) !== 'sold_out' && (
                  <div className="stock-bar">
                    <div 
                      className={`stock-fill ${getStockStatusForAlmostFinishedSale(product.availableQuantity)}`} 
                      style={{ 
                        width: `${Math.min((product.availableQuantity / (product.lowStockThreshold * 2)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="product-info-bottom">
          {/* Price */}
          <div className="product-price-container">
            {product.discountPercentage > 0 && product.compareAtPrice > 0 ? (
              <>
                <span className="current-price">
                  {getEffectivePrice(product).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
                </span>
                <span className="original-price">
                  {product.compareAtPrice.toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </>
            ) : (
              <span className="current-price">
                {getEffectivePrice(product).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            )}
          </div>
         
          {/* Colors */}
          {processedColors.length > 0 && (
  <div className="product-colors">
    {processedColors.slice(0, 5).map((colorObj, index) => (
      <span
        key={index}
        className="color-swatch"
        style={{
          background:
            colorObj.type === 'mixed'
              ? `linear-gradient(45deg, ${colorObj.value.join(', ')})`
              : colorObj.value,
          border:
            colorObj.type === 'single' &&
            (colorObj.value === '#fff' || colorObj.value === '#ffffff')
              ? '1px solid #ccc'
              : undefined
        }}
        title={
          colorObj.type === 'mixed'
            ? colorObj.value.join(' + ')
            : colorObj.value
        }
      ></span>
    ))}
    {processedColors.length > 5 && (
      <span className="color-swatch-more">
        +{processedColors.length - 5}
      </span>
    )}
  </div>
)}


          {/* Add to Cart Button */}
          <button
            className="add-to-cart-btn"
            onClick={() => handleAddToCart && handleAddToCart(product)}
            disabled={product.stockStatus === 'out_of_stock'}
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
        
        {/* Discount Info (خاص بصفحة AlmostFinishedSale) */}
        {showDiscountInfo && product.discountPercentage > 0 && product.compareAtPrice > 0 && (
          <div className="discount-info">
            <div className="savings-amount">
              <span className="savings-label">{currentLang === 'ar' ? 'توفير' : 'Save'}</span>
              <span className="savings-value">
                {(product.compareAtPrice - getEffectivePrice(product)).toFixed(2)} {currentLang === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            </div>
            <div className="discount-percentage-large">
              <span className="discount-text">{product.discountPercentage}% {currentLang === 'ar' ? 'خصم' : 'Off'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;