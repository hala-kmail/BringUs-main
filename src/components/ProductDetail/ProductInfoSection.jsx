import React from 'react';

import { getEffectivePrice, isDiscountActive, getPriceByUserRole, getOriginalPriceByUserRole } from '../../utils/productUtils';
import { useAppData } from '../../contexts/AppDataContext';
import { formatPrice } from '../../utils/currencyUtils';
import { isWholesaler } from '../../utils/productUtils';
const ProductInfoSection = ({
  product,
  currentLang,
  t,
  quantity = 1
}) => {
  const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
  const productDescription = currentLang === 'ar' ? product.descriptionAr : product.descriptionEn;
  const { store } = useAppData();
  
  // عرض جميع الليبلز الموجودة في productLabels
  const productLabels = product.productLabels || [];

  const discountActive = isDiscountActive(product);
  const effectivePrice = getPriceByUserRole(product);
  const originalPrice = getOriginalPriceByUserRole(product);
  const totalPrice = effectivePrice * quantity;

  const handleCopy = (barcode) => {
    navigator.clipboard.writeText(barcode);
  };

  return (
    <div className="product-detail-info">
      {/* Product Badges */}
      <div className="product-detail-badges">
        {/* عرض جميع الليبلز من productLabels */}
        {productLabels.map((label, index) => (
          <span 
            key={label._id || index} 
            className="product-detail-badge"
            style={{ 
              backgroundColor: label.color || '#6B7280',
              color: 'white'
            }}
          >
            {currentLang === 'ar' ? label.nameAr : label.nameEn}
          </span>
        ))}
        
        {/* عرض ليبلة التخفيض إذا كان هناك تخفيض */}
        {product.discountPercentage > 0 && (
          <span className="product-detail-badge product-sale-badge">
            -{product.discountPercentage}%
          </span>
        )}
      </div>
      <h1 className="product-title">{productName}</h1>
      <div className="product-description">
        <p>{productDescription}</p>
      </div>
      {/* Product Price */}
      <div className="product-detail-price">
        {discountActive && !isWholesaler() ? (
          <>
            <span className="product-current-price">
              {formatPrice(effectivePrice, store?.settings?.currency || 'ILS')}
            </span>
            <span className="product-original-price">
              {formatPrice(originalPrice, store?.settings?.currency || 'ILS')}
            </span>
          </>
        ) : (
          <span className="product-current-price">
            {formatPrice(effectivePrice, store?.settings?.currency || 'ILS')}
          </span>
        )}
      </div>
      {/* Total Price */}
      {quantity > 1 && (
        <div className="product-total-price">
          <span className="total-label">{currentLang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
          <span className="total-value">{formatPrice(totalPrice, store?.settings?.currency || 'ILS')}</span>
        </div>
      )}
      
    </div>
  );
};

export default ProductInfoSection; 