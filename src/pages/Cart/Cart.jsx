import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAppData } from '../../contexts/AppDataContext';

import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import './Cart.css';


import { getCurrencySymbol, formatPrice } from '../../utils/currencyUtils';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotals } = useCart();
  const { store } = useAppData();
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
    
    // خريطة الألوان العربية
    const colorMapAr = {
      '#ef4444': 'أحمر',
      '#22c55e': 'أخضر',
      '#3b82f6': 'أزرق',
      '#f59e0b': 'برتقالي',
      '#8b5cf6': 'بنفسجي',
      '#ec4899': 'وردي',
      '#f97316': 'برتقالي',
      '#eab308': 'أصفر',
      '#84cc16': 'أخضر فاتح',
      '#06b6d4': 'أزرق فاتح',
      '#6366f1': 'أزرق غامق',
      '#a855f7': 'بنفسجي فاتح',
      '#f43f5e': 'أحمر فاتح',
      '#14b8a6': 'أزرق مخضر',
      '#fbbf24': 'أصفر ذهبي',
      '#fb7185': 'وردي فاتح',
      '#34d399': 'أخضر فاتح',
      '#60a5fa': 'أزرق فاتح',
      '#a78bfa': 'بنفسجي فاتح',
      '#f472b6': 'وردي فاتح',
      '#000000': 'أسود',
      '#ffffff': 'أبيض',
      '#fff': 'أبيض',
      '#000': 'أسود',
      '#ffd700': 'ذهبي',
      '#a0522d': 'بني',
      '#eab308': 'أصفر ذهبي',
      '#9b9b9b': 'رمادي',
      '#808080': 'رمادي غامق',
      '#c0c0c0': 'فضي',
      '#ff69b4': 'وردي غامق',
      '#ff1493': 'وردي عميق',
      '#dc143c': 'أحمر غامق',
      '#b22222': 'أحمر ناري',
      '#228b22': 'أخضر غابة',
      '#32cd32': 'أخضر ليموني',
      '#4169e1': 'أزرق ملكي',
      '#1e90ff': 'أزرق دودجر',
      '#9370db': 'بنفسجي متوسط',
      '#8a2be2': 'بنفسجي أزرق',
      '#ff4500': 'برتقالي أحمر',
      '#ff8c00': 'برتقالي غامق',
      '#ffd700': 'ذهبي',
      '#daa520': 'ذهبي غامق',
      '#cd853f': 'بني فاتح',
      '#8b4513': 'بني غامق'
    };
    
    // خريطة الألوان الإنجليزية
    const colorMapEn = {
      '#ef4444': 'Red',
      '#22c55e': 'Green',
      '#3b82f6': 'Blue',
      '#f59e0b': 'Orange',
      '#8b5cf6': 'Purple',
      '#ec4899': 'Pink',
      '#f97316': 'Orange',
      '#eab308': 'Yellow',
      '#84cc16': 'Light Green',
      '#06b6d4': 'Light Blue',
      '#6366f1': 'Dark Blue',
      '#a855f7': 'Light Purple',
      '#f43f5e': 'Light Red',
      '#14b8a6': 'Teal',
      '#fbbf24': 'Golden Yellow',
      '#fb7185': 'Light Pink',
      '#34d399': 'Light Green',
      '#60a5fa': 'Light Blue',
      '#a78bfa': 'Light Purple',
      '#f472b6': 'Light Pink',
      '#000000': 'Black',
      '#ffffff': 'White',
      '#fff': 'White',
      '#000': 'Black',
      '#ffd700': 'Gold',
      '#a0522d': 'Brown',
      '#eab308': 'Golden Yellow',
      '#9b9b9b': 'Gray',
      '#808080': 'Dark Gray',
      '#c0c0c0': 'Silver',
      '#ff69b4': 'Hot Pink',
      '#ff1493': 'Deep Pink',
      '#dc143c': 'Crimson',
      '#b22222': 'Fire Brick',
      '#228b22': 'Forest Green',
      '#32cd32': 'Lime Green',
      '#4169e1': 'Royal Blue',
      '#1e90ff': 'Dodger Blue',
      '#9370db': 'Medium Purple',
      '#8a2be2': 'Blue Violet',
      '#ff4500': 'Orange Red',
      '#ff8c00': 'Dark Orange',
      '#ffd700': 'Gold',
      '#daa520': 'Golden Rod',
      '#cd853f': 'Sandy Brown',
      '#8b4513': 'Saddle Brown'
    };
    
    if (currentLang === 'ar') {
      return colorMapAr[hex] || hex;
    } else {
      return colorMapEn[hex] || hex;
    }
  }

  // دالة لتحليل المواصفات المختارة وعرضها بشكل منظم
  const parseSelectedSpecs = (selectedSpecifications, selectedColors) => {
    const specs = [];
    
    // إضافة الألوان كأشياء منفصلة
    const colors = [];
    if (selectedColors && selectedColors.length > 0) {
      selectedColors.forEach(color => {
        colors.push({
          type: 'color',
          value: color,
          name: currentLang === 'ar' ? 'اللون' : 'Color'
        });
      });
    }
    
    // إضافة المواصفات الأخرى
    const specifications = [];
    if (selectedSpecifications && selectedSpecifications.length > 0) {
      selectedSpecifications.forEach(spec => {
        // تحديد العنوان حسب اللغة
        let specTitle = currentLang === 'ar' ? (spec.titleAr || spec.specificationId) : (spec.titleEn || spec.specificationId);
        
        // تحديد القيمة حسب اللغة
        let specValue = currentLang === 'ar' ? (spec.valueAr || spec.valueId) : (spec.valueEn || spec.valueId);
        
        specifications.push({
          type: 'specification',
          name: specTitle,
          value: specValue
        });
      });
    }
    
    return {
      colors,
      specifications,
      all: [...colors, ...specifications]
    };
  };

  return (
    <div className="cart-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
     
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
          <span className="breadcrumb-separator">›</span>
          <Link to="/shop">
            <span>{currentLang === 'ar' ? 'المتجر' : 'Shop'}</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
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
              {cartItems.map((item, index) => (
                <div key={`cart-item-${index}`} className="cart-item">
                  {/* Desktop Layout (hidden on mobile) */}
                  <div 
                    className="cart-item-image desktop-only"
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
                    {(item.selectedSpecifications || item.selectedColors) && (
                      <div className="cart-item-options">
                        {(() => {
                          const specsData = parseSelectedSpecs(item.selectedSpecifications, item.selectedColors);
                          
                          return (
                            <>
                              {/* الألوان المرئية */}
                              {specsData.colors.map((color, index) => (
                                <div key={`color-${index}`} className="cart-color-option">
                                  <span className="color-swatch" 
                                    style={{
                                      background: color.value.includes('+') 
                                        ? `linear-gradient(45deg, ${color.value.split('+').join(', ')})`
                                        : color.value,
                                      border: color.value === '#fff' || color.value === '#ffffff' 
                                        ? '1px solid #ccc' 
                                        : undefined
                                    }}
                                    title={getColorLabel(color.value, t)}
                                  ></span>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {/* Price */}
                    <div className="cart-item-price">
                      {item.product.salePercentage > 0 && (
                        <span className="original-price">
                          {formatPrice( item.product.price, store?.settings?.currency || 'ILS')}
                        </span>
                      )}
                      <span className="current-price">{formatPrice( item.product.finalPrice, store?.settings?.currency || 'ILS')}</span>
                    </div>
                    {/* Product Specifications - Simple Text */}
                    {(item.selectedSpecifications || item.selectedColors) && (
                      <div className="cart-item-specifications">
                        {(() => {
                          const specsData = parseSelectedSpecs(item.selectedSpecifications, item.selectedColors);
                          
                          return (
                            <>
                              {/* عرض جميع المواصفات كنص بسيط */}
                              {specsData.specifications.map((spec, index) => (
                                <div key={`spec-${index}`} className="cart-spec-text">
                                  {spec.name}: {spec.value}
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
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
                    {formatPrice((( item.product.finalPrice || item.price || 0) * (item.quantity || 1)), store?.settings?.currency || 'ILS')}
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
                        {(item.selectedSpecifications || item.selectedColors) && (
                          <div className="cart-item-options">
                            {(() => {
                              const specsData = parseSelectedSpecs(item.selectedSpecifications, item.selectedColors);
                              
                              return (
                                <>
                                  {/* الألوان المرئية */}
                                  {specsData.colors.map((color, index) => (
                                    <div key={`color-${index}`} className="cart-color-option">
                                      <span className="color-swatch" 
                                        style={{
                                          background: color.value.includes('+') 
                                            ? `linear-gradient(45deg, ${color.value.split('+').join(', ')})`
                                            : color.value,
                                          border: color.value === '#fff' || color.value === '#ffffff' 
                                            ? '1px solid #ccc' 
                                            : undefined
                                        }}
                                        title={getColorLabel(color.value, t)}
                                      ></span>
                                    </div>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        )}
                        
                        {/* Product Specifications - Simple Text */}
                        {(item.selectedSpecifications || item.selectedColors) && (
                          <div className="cart-item-specifications">
                            {(() => {
                              const specsData = parseSelectedSpecs(item.selectedSpecifications, item.selectedColors);
                              
                              return (
                                <>
                                  {/* عرض جميع المواصفات كنص بسيط */}
                                  {specsData.specifications.map((spec, index) => (
                                    <div key={`spec-${index}`} className="cart-spec-text">
                                      {spec.name}: {spec.value}
                                    </div>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        )}
                        {/* Price */}
                        <div className="cart-item-price">
                        {item.product.salePercentage > 0 && (
                          <span className="original-price">
                            {formatPrice( item.product.price, store?.settings?.currency || 'ILS')}
                          </span>
                        )}
                          <span className="current-price">{formatPrice((item.product.finalPrice || item.price || 0), store?.settings?.currency || 'ILS')}</span>
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
                          {formatPrice(((item.product.finalPrice || item.price || 0) * (item.quantity || 1)), store?.settings?.currency || 'ILS')}
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
                <span>{currentLang === 'ar' ? 'مجموع المنتجات:' : 'Products Total:'}</span>
                <span>{formatPrice(cartTotals?.subtotal || 0, store?.settings?.currency || 'ILS')}</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row summary-total">
              
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
            <span className="mobile-total-amount">{formatPrice(cartTotals?.subtotal || 0, store?.settings?.currency || 'ILS')}</span>
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