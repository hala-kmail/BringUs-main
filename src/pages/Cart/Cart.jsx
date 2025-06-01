import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './Cart.css';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotals } = useCart();
  const currentLang = i18n.language;

  const cartTotals = getCartTotals();

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemoveItem = (cartItemId) => {
    removeFromCart(cartItemId);
  };

  const handleClearCart = () => {
    if (window.confirm(currentLang === 'ar' 
      ? 'هل أنت متأكد من إفراغ السلة؟' 
      : 'Are you sure you want to clear the cart?'
    )) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page (you can implement this later)
    alert(currentLang === 'ar' 
      ? 'سيتم توجيهك لصفحة الدفع قريباً' 
      : 'Checkout functionality will be implemented soon'
    );
  };

  return (
    <div className="cart-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <TopBar />
      <Navbar />
      <SecondaryNavbar />
      
      <div className="cart-content">
        {/* Header */}
        <div className="cart-header">
          <h1 className="page-title">
            {currentLang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
          {cartItems.length > 0 && (
            <button 
              className="clear-cart-btn"
              onClick={handleClearCart}
            >
              {currentLang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>{currentLang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</h2>
            <p>{currentLang === 'ar' ? 'أضف بعض المنتجات لتبدأ التسوق' : 'Add some products to start shopping'}</p>
            <button 
              className="start-shopping-btn"
              onClick={() => navigate('/shop')}
            >
              {currentLang === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
            </button>
          </div>
        ) : (
          /* Cart Items */
          <div className="cart-items-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name[currentLang]} />
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name[currentLang]}</h3>
                    
                    {/* Selected Options */}
                    <div className="cart-item-options">
                      {item.selectedColor && (
                        <span className="cart-option">
                          {currentLang === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="cart-option">
                          {currentLang === 'ar' ? 'الحجم:' : 'Size:'} {item.selectedSize}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="cart-item-price">
                      <span className="current-price">${item.finalPrice.toFixed(2)}</span>
                      {item.discountPrice && item.originalPrice !== item.finalPrice && (
                        <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart-item-quantity">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Total Price for this item */}
                  <div className="cart-item-total">
                    ${(item.finalPrice * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button 
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.cartItemId)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>{currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
              
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span>${cartTotals.subtotal}</span>
              </div>
              
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'الشحن:' : 'Shipping:'}</span>
                <span>
                  {cartTotals.shipping === 0 
                    ? (currentLang === 'ar' ? 'مجاني' : 'Free') 
                    : `$${cartTotals.shipping}`
                  }
                </span>
              </div>
              
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'الضريبة:' : 'Tax:'}</span>
                <span>${cartTotals.tax}</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row summary-total">
                <span>{currentLang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span>${cartTotals.total}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                {currentLang === 'ar' ? 'متابعة للدفع' : 'Proceed to Checkout'}
              </button>

              <button 
                className="continue-shopping-btn"
                onClick={() => navigate('/shop')}
              >
                {currentLang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 