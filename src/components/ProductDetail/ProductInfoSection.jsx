import React from 'react';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import { getEffectivePrice, isDiscountActive } from '../../utils/productUtils';

const ProductInfoSection = ({
  product,
  currentLang,
  t,
  quantity = 1
}) => {
  const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
  const productDescription = currentLang === 'ar' ? product.descriptionAr : product.descriptionEn;

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
  const originalPrice = product.compareAtPrice || product.price;
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
              {effectivePrice.toFixed(2)} {t('currency.sar')}
            </span>
            <span className="product-original-price">
              {originalPrice.toFixed(2)} {t('currency.sar')}
            </span>
          </>
        ) : (
          <span className="product-current-price">
            {effectivePrice.toFixed(2)} {t('currency.sar')}
          </span>
        )}
      </div>
      {/* Total Price */}
      {quantity > 1 && (
        <div className="product-total-price">
          <span className="total-label">{currentLang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
          <span className="total-value">{totalPrice.toFixed(2)} {t('currency.sar')}</span>
        </div>
      )}
      {/* Barcodes - Compact */}
      {product.barcodes && product.barcodes.length > 0 && (
        <div className="product-barcode-compact">
          <span className="barcode-title-compact">
            <span className="barcode-icon" role="img" aria-label="barcode">🏷️</span>
            {currentLang === 'ar' ? 'الباركود' : 'Barcode'}:
          </span>
          {product.barcodes.map((barcode, idx) => (
            <span className="barcode-item-compact" key={idx}>
              <span className="barcode-value-compact">{barcode}</span>
              <button className="barcode-copy-btn-compact" title={currentLang === 'ar' ? 'نسخ الباركود' : 'Copy barcode'} onClick={() => handleCopy(barcode)}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="10" height="10" rx="2" stroke="#888" strokeWidth="1.2" fill="#fff"/>
                  <rect x="8" y="8" width="7" height="7" rx="1.5" stroke="#888" strokeWidth="1" fill="#f3f4f6"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductInfoSection; 