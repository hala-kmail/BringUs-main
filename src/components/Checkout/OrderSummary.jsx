import React from 'react';

const OrderSummary = ({
  cartItems,
  cartTotals,
  deliveryMethod,
  getShippingPrice,
  t,
  currentLang,
  onPlaceOrder,
  isProcessing,
  privacyChecked
}) => (
  <div className="order-summary-section">
    <h2 className="section-title">
      {currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
    </h2>
    <div className="order-summary">
      {/* Items List */}
      <div className="order-items">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="order-item">
            <div className="item-image">
              <img src={item.image} alt={item.name[currentLang]} />
              <span className="item-quantity">{item.quantity}</span>
            </div>
            <div className="item-details">
              <h4 className="item-name">{item.name[currentLang]}</h4>
              {(item.selectedColor || item.variant) && (
                <div className="item-options">
                  {item.selectedColor && (
                    <span>{currentLang === 'ar' ? 'اللون' : 'Color'}: {item.selectedColor}</span>
                  )}
                  {/* إضافة جميع المواصفات الأخرى */}
                  {item.variant && (
                    (() => {
                      const variantParts = item.variant.split('|');
                      return variantParts.map((part, index) => {
                        const [specName, specValue] = part.split(':');
                        if (specName && specValue && specName !== 'Color') {
                          return (
                            <span key={index}>
                              {specName}: {specValue}
                            </span>
                          );
                        }
                        return null;
                      });
                    })()
                  )}
                </div>
              )}
              <div className="item-price">
                ₪{item.finalPrice.toFixed(2)} × {item.quantity}
              </div>
            </div>
            <div className="item-total">
              ₪{(item.finalPrice * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      {/* Totals */}
      <div className="order-totals">
        <div className="total-row">
          <span>{t('checkout.subtotal')}</span>
          <span>₪{cartTotals.subtotal}</span>
        </div>
        <div className="total-row">
          <span>{t('checkout.shipping')}</span>
          <span>
            {deliveryMethod === 'store' ? t('checkout.free') : (getShippingPrice() === 0 ? t('checkout.free') : `₪${getShippingPrice()}`)}
          </span>
        </div>
        <hr className="totals-divider" />
        <div className="total-row total-final">
          <span>{t('checkout.total')}</span>
          <span>₪{(cartTotals.subtotal + getShippingPrice()).toFixed(2)}</span>
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

export default OrderSummary; 