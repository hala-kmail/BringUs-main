import React, { useState, useRef, useEffect } from 'react';

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
  
  // State for show more/less functionality
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showTitleButton, setShowTitleButton] = useState(false);
  const [showDescriptionButton, setShowDescriptionButton] = useState(false);
  
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  
  // Check if text overflows 2 lines
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const lineHeight = parseFloat(getComputedStyle(titleRef.current).lineHeight);
        const height = titleRef.current.scrollHeight;
        const lines = Math.round(height / lineHeight);
        setShowTitleButton(lines > 2);
      }
      
      if (descriptionRef.current) {
        const element = descriptionRef.current.querySelector('p');
        if (element) {
          const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
          const height = element.scrollHeight;
          const lines = Math.round(height / lineHeight);
          setShowDescriptionButton(lines > 2);
        }
      }
    };
    
    // Check on mount and when window resizes
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [productName, productDescription]);
  
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
              backgroundColor: label.color || '#b1b1b1',
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
      <div className="product-title-wrapper">
        <h1 
          ref={titleRef}
          className={`product-title ${isTitleExpanded ? 'expanded' : 'collapsed'}`}
        >
          {productName}
        </h1>
        {showTitleButton && (
          <button 
            className="show-more-btn"
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
          >
            {isTitleExpanded 
              ? (currentLang === 'ar' ? 'إخفاء' : 'Show less')
              : (currentLang === 'ar' ? 'اظهر المزيد' : 'Show more')
            }
          </button>
        )}
      </div>
      
      <div className="product-description-wrapper">
        <div 
          ref={descriptionRef}
          className={`product-description ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}
        >
          <p>{productDescription}</p>
        </div>
        {showDescriptionButton && (
          <button 
            className="show-more-btn"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded 
              ? (currentLang === 'ar' ? 'إخفاء' : 'Show less')
              : (currentLang === 'ar' ? 'اظهر المزيد' : 'Show more')
            }
          </button>
        )}
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