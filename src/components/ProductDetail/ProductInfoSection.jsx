import React from 'react';

import { getEffectivePrice, isDiscountActive } from '../../utils/productUtils';
import { useAppData } from '../../contexts/AppDataContext';
import { formatPrice } from '../../utils/currencyUtils';
const ProductInfoSection = ({
  product,
  currentLang,
  t,
  quantity = 1
}) => {
  const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
  const productDescription = currentLang === 'ar' ? product.descriptionAr : product.descriptionEn;
  const { store } = useAppData();
  const hasNewLabel = product.productLabels?.some(label =>
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'جديد' : 'new')
  );
  const hasFeaturedLabel = product.productLabels?.some(label =>
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'مميز' : 'featured')
  );
  const hasSaleLabel = product.productLabels?.some(label =>
    (currentLang === 'ar' ? label.nameAr : label.nameEn)?.toLowerCase().includes(currentLang === 'ar' ? 'تخفيض' : 'sale')
  );

  const discountActive = isDiscountActive(product);
  const effectivePrice = getEffectivePrice(product);
  const originalPrice =  product.price;
  const totalPrice = effectivePrice * quantity;

  const handleCopy = (barcode) => {
    navigator.clipboard.writeText(barcode);
  };

  return (
    <div className="product-detail-info">
      {/* Product Badges */}
      <div className="product-detail-badges">
        {hasNewLabel && (
          <span className="product-detail-badge product-new-badge">
            {t('product_detail.new')}
          </span>
        )}
        {hasFeaturedLabel && (
          <span className="product-detail-badge product-bestseller-badge">
            {t('product_detail.featured')}
          </span>
        )}
        {hasSaleLabel && (
           <span className="product-detail-badge product-sale-badge">
            {t('product_detail.sale')}
          </span>
        )}
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
        {discountActive ? (
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