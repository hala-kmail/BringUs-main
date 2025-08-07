import React, { useState } from 'react';
import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';

const OrderSummary = ({
  cartItems,
  cartTotals,
  deliveryMethod,
  getShippingPrice,
  t,
  currentLang,
  onPlaceOrder,
  isProcessing,
  privacyChecked,
  store
}) => {
  const [expandedItems, setExpandedItems] = useState({});

  const getItemName = (item, lang) => {
    if (item.name && item.name[lang]) {
      return item.name[lang];
    }
    if (item.product && item.product.name && item.product.name[lang]) {
      return item.product.name[lang];
    }
    return item.name || item.product?.name || 'N/A';
  };

  const getColorLabel = (color) => {
    if (color.includes('+')) {
      return color.split('+').map(c => c.trim()).join(' + ');
    }
    return color;
  };

  const toggleSpecificationsExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const currencySymbol = getCurrencySymbol(store?.settings?.currency || 'ILS');

  return (
    <div className="order-summary-section">
      <h2 className="section-title">
        {currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
      </h2>
      <div className="order-summary">
        {/* Items List */}
        <div className="order-items">
          {cartItems.map((item) => (
            <div key={item.cartItemId || item._id} className="order-item">
              <div className="item-image">
                <img src={item.mainImage || item.product?.mainImage} alt={getItemName(item, currentLang)} />
                <span className="item-quantity">{item.quantity}</span>
              </div>
              <div className="item-details">
                <h4 className="item-name">{currentLang === 'ar' ? item.product.nameAr : item.product.nameEn}</h4>
                {(item.selectedColors || item.selectedSpecifications) && (
                  <div className="item-options">
                    {item.selectedColors && item.selectedColors.length > 0 && (
                      <div className="cart-color-options">
                        {item.selectedColors.map((color, colorIndex) => {
                          // إذا كان اللون عبارة عن دمج (مثل #fff+#000)
                          const isMixed = color.includes('+');
                          return (
                            <div key={colorIndex} className="cart-color-option">
                              <span 
                                className="color-swatch" 
                                style={{
                                  background: isMixed ? `linear-gradient(45deg, ${color.split('+').join(', ')})` : color,
                                  border: color === "#fff" || color === "#ffffff" ? "2px solid #e2e8f0" : undefined
                                }}
                                title={getColorLabel(color)}
                              ></span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* إضافة جميع المواصفات الأخرى */}
                    {item.selectedSpecifications && item.selectedSpecifications.length > 0 && (
                      <div className="cart-item-specifications">
                        {item.selectedSpecifications.slice(0, expandedItems[item.cartItemId || item._id] ? undefined : 1).map((spec, index) => {
                          const specTitle = currentLang === 'ar' ? (spec.titleAr || spec.title || spec.specificationId) : (spec.titleEn || spec.title || spec.specificationId);
                          const specValue = currentLang === 'ar' ? (spec.valueAr || spec.value || spec.valueId) : (spec.valueEn || spec.value || spec.valueId);
                          return (
                            <span key={index} className="cart-spec-text">
                              {specTitle}: {specValue}
                            </span>
                          );
                        })}
                        {item.selectedSpecifications.length > 1 && (
                          <button
                            className="expand-specs-btn"
                            onClick={() => toggleSpecificationsExpansion(item.cartItemId || item._id)}
                            type="button"
                          >
                            {expandedItems[item.cartItemId || item._id] ? '-' : `+${item.selectedSpecifications.length - 1}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="item-price">
                  {currencySymbol}{(item.finalPrice || item.priceAtAdd || 0).toFixed(2)} × {item.quantity}
                </div>
              </div>
              <div className="item-total">
                {currencySymbol}{((item.finalPrice || item.priceAtAdd || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="order-totals">
          <div className="total-row">
            <span>{t('checkout.subtotal')}</span>
            <span>{currencySymbol}{cartTotals.subtotal}</span>
          </div>
          <div className="total-row">
            <span>{t('checkout.shipping')}</span>
            <span>
              {deliveryMethod === 'store' ? t('checkout.free') : (getShippingPrice() === 0 ? t('checkout.free') : `${currencySymbol}${getShippingPrice()}`)}
            </span>
          </div>
          <hr className="totals-divider" />
          <div className="total-row total-final">
            <span>{t('checkout.total')}</span>
            <span>{currencySymbol}{(cartTotals.subtotal + getShippingPrice()).toFixed(2)}</span>
          </div>
        </div>
        {/* Submit Button */}
        <button 
          type="submit"
          className="place-order-btn"
          onClick={onPlaceOrder}
          disabled={isProcessing || !privacyChecked}
        >
          {isProcessing ? (
            <span className="processing">
              {t('checkout.processing')}
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('checkout.place_order')}
            </>
          )}
        </button>
        {/* Security Note */}
        <div className="security-note">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            {t('checkout.security_note')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary; 