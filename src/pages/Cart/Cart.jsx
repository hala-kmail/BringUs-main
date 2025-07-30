import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import './Cart.css';
import namer from 'color-namer';
import { getEffectivePrice, isDiscountActive } from '../../utils/productUtils';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotals } = useCart();
  const currentLang = i18n.language;
  const [showClearModal, setShowClearModal] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState(null);

  const cartTotals = getCartTotals();

  const handleQuantityChange = async (product, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(product);
    } else {
      await updateQuantity(product._id || product.id, newQuantity);
    }
  };

  const handleRemoveItem = async (product) => {
    setPendingDeleteItemId(product._id || product.id);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteItem = async () => {
    if (pendingDeleteItemId) {
      await removeFromCart(pendingDeleteItemId);
      setPendingDeleteItemId(null);
    }
    setShowDeleteModal(false);
  };

  const handleCancelDeleteItem = () => {
    setPendingDeleteItemId(null);
    setShowDeleteModal(false);
  };

  const handleClearCartClick = () => {
    setShowClearModal(true);
  };

  const handleConfirmClearCart = async () => {
    await clearCart();
    setShowClearModal(false);
  };

  const handleCancelClearCart = () => {
    setShowClearModal(false);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleProductClick = (product) => {
    if (product && (product._id || product.id)) {
      navigate(`/product/${product._id || product.id}`);
    } else {
      console.error('Product ID is missing');
    }
  };

  // Mobile search handlers
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  function getColorLabel(hex, t) {
    if (!hex) return '';
    try {
      const colorName = namer(hex);
      return colorName.ntc[0]?.name || hex;
    } catch (e) {
      return hex;
    }
  }

  // دالة لتحليل variant string وعرض المواصفات بشكل منظم
  const parseVariantSpecs = (variant) => {
    if (!variant) return [];
    
    const specs = [];
    const parts = variant.split('|');
    
    parts.forEach(part => {
      const [specName, specValue] = part.split(':');
      if (specName && specValue) {
        // تحسين عرض اللون
        if (specName === 'Color') {
          specs.push({
            name: currentLang === 'ar' ? 'اللون' : 'Color',
            value: getColorLabel(specValue, t)
          });
        }
        // باقي المواصفات (بما في ذلك الحجم)
        else {
          specs.push({
            name: specName,
            value: specValue
          });
        }
      }
    });
    
    return specs;
  };

  return (
    <div className="cart-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* <TopBar /> */}
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      <div className="cart-content">
        {/* Breadcrumb Navigation */}
        <nav className="cart-breadcrumb">
          <Link to="/">
            <span>{currentLang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </Link>
          <span className="breadcrumb-separator"> {currentLang === 'ar' ? '‹' : '›'}</span>
          <Link to="/shop">
            <span>{currentLang === 'ar' ? 'المتجر' : 'Shop'}</span>
          </Link>
          <span className="breadcrumb-separator"> {currentLang === 'ar' ? '‹' : '›'}</span>
          <span className="breadcrumb-current">
            {currentLang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </span>
        </nav>
        {/* Header */}
        <div className="cart-header">
          <h1 className="page-title">
            {currentLang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
          {cartItems.length > 0 && (
            <button 
              className="clear-cart-btn"
              onClick={handleClearCartClick}
            >
              {currentLang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
            </button>
          )}
        </div>
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="empty-cart">
            <div className="empty-cart-animation">
              <div className="empty-cart-icon">🛒</div>
              <div className="empty-cart-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
            <h2>{currentLang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</h2>
            <p>{currentLang === 'ar' 
              ? 'لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. استكشف مجموعتنا المتنوعة من المنتجات الطازجة والعضوية!' 
              : 'You haven\'t added any products to your cart yet. Explore our diverse collection of fresh and organic products!'
            }</p>
            <div className="empty-cart-features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span className="feature-text">
                  {currentLang === 'ar' ? 'توصيل سريع ومجاني' : 'Fast & Free Delivery'}
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌱</span>
                <span className="feature-text">
                  {currentLang === 'ar' ? 'منتجات طازجة وعضوية' : 'Fresh & Organic Products'}
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <span className="feature-text">
                  {currentLang === 'ar' ? 'جودة مضمونة' : 'Quality Guaranteed'}
                </span>
              </div>
            </div>
            <button 
              className="start-shopping-btn"
              onClick={() => navigate('/shop')}
            >
              <span className="btn-icon">🛍️</span>
              {currentLang === 'ar' ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
            </button>
          </div>
        ) : (
          /* Cart Items */
          <div className="cart-items-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  {/* Desktop Layout (hidden on mobile) */}
                  <div 
                    className="cart-item-image"
                    onClick={() => handleProductClick(item.product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={item.product?.mainImage || item.product?.images?.[0]} alt={item.product?.nameAr || item.product?.nameEn} />
                  </div>
                  <div className="cart-item-details desktop-only">
                    <h3 
                      className="cart-item-name"
                      onClick={() => handleProductClick(item.product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {currentLang === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                    </h3>
                    {/* Selected Options */}
                    {item.variant && (
                      <div className="cart-item-options">
                        {parseVariantSpecs(item.variant).map((spec, index) => (
                          <span key={index} className="cart-option">
                            {spec.name}: {spec.value}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Price */}
                    <div className="cart-item-price">
                      <span className="current-price">₪{item.priceAtAdd.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Quantity Controls */}
                  <div className="cart-item-quantity desktop-only">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                      title={currentLang === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                      title={currentLang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                    >
                      +
                    </button>
                  </div>
                  {/* Total Price */}
                  <div className="cart-item-total desktop-only">
                    ₪{((item.priceAtAdd || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                  {/* Remove Button */}
                  <button 
                    className="remove-item-btn desktop-only"
                    onClick={() => handleRemoveItem(item.product)}
                    title={currentLang === 'ar' ? 'حذف المنتج' : 'Remove item'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {/* Mobile Layout (hidden on desktop) */}
                  <div className="mobile-only mobile-cart-item">
                    {/* Remove Button - corner button */}
                    <button 
                      className="remove-item-btn mobile-remove-btn"
                      onClick={() => handleRemoveItem(item.product)}
                      title={currentLang === 'ar' ? 'حذف المنتج' : 'Remove item'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {/* Product Main Info */}
                    <div className="cart-item-main">
                      <div 
                        className="cart-item-image"
                        onClick={() => handleProductClick(item.product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={item.product?.mainImage || item.product?.images?.[0]} alt={item.product?.nameAr || item.product?.nameEn} />
                      </div>
                      <div className="cart-item-details">
                        <h3 
                          className="cart-item-name"
                          onClick={() => handleProductClick(item.product)}
                          style={{ cursor: 'pointer' }}
                        >
                          {currentLang === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                        </h3>
                        {/* Selected Options */}
                        {item.variant && (
                          <div className="cart-item-options">
                            {parseVariantSpecs(item.variant).map((spec, index) => (
                              <span key={index} className="cart-option">
                                {spec.name}: {spec.value}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Price */}
                        <div className="cart-item-price">
                          <span className="current-price">₪{(item.priceAtAdd || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Controls Section */}
                    <div className="cart-item-controls">
                      {/* Quantity Controls */}
                      <div className="cart-item-quantity">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                          title={currentLang === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                          title={currentLang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                        >
                          +
                        </button>
                      </div>
                      {/* Total Price */}
                      <div className="cart-item-total">
                        <span className="cart-item-total-label">
                          {currentLang === 'ar' ? 'الإجمالي' : 'Total'}
                        </span>
                        <div className="cart-item-total-price">
                          ₪{((item.priceAtAdd || 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>{currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span>₪{(cartTotals?.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'الشحن:' : 'Shipping:'}</span>
                <span>
                  {(cartTotals?.shipping || 0) === 0 
                    ? (currentLang === 'ar' ? 'مجاني' : 'Free') 
                    : `₪${(cartTotals?.shipping || 0).toFixed(2)}`
                  }
                </span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row summary-total">
                <span>{currentLang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span>₪{(cartTotals?.total || 0).toFixed(2)}</span>
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
      {/* Mobile Fixed Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="mobile-checkout-bar" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="mobile-total-section">
            <span className="mobile-total-label">
              {currentLang === 'ar' ? 'الإجمالي' : 'Total'}
            </span>
            <span className="mobile-total-amount">₪{(cartTotals?.total || 0).toFixed(2)}</span>
          </div>
          <button 
            className="mobile-checkout-btn"
            onClick={handleCheckout}
          >
            {currentLang === 'ar' ? 'إكمال الدفع' : 'Checkout'}
          </button>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        title={currentLang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
        message={currentLang === 'ar' 
          ? 'هل أنت متأكد من إفراغ جميع منتجات السلة؟ لن تتمكن من التراجع عن هذا الإجراء.' 
          : 'Are you sure you want to clear all items from your cart? This action cannot be undone.'
        }
        confirmText={currentLang === 'ar' ? 'نعم، إفراغ السلة' : 'Yes, Clear Cart'}
        cancelText={currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
        onConfirm={handleConfirmClearCart}
        onClose={handleCancelClearCart}
      />
      {/* Confirmation Modal for deleting item */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title={currentLang === 'ar' ? 'حذف المنتج' : 'Remove Item'}
        message={currentLang === 'ar' 
          ? 'هل أنت متأكد من حذف هذا المنتج من السلة؟' 
          : 'Are you sure you want to remove this item from your cart?'
        }
        confirmText={currentLang === 'ar' ? 'نعم، حذف المنتج' : 'Yes, Remove Item'}
        cancelText={currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
        onConfirm={handleConfirmDeleteItem}
        onClose={handleCancelDeleteItem}
      />
    </div>
  );
};

export default Cart; 