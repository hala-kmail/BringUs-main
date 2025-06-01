import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './Checkout.css';

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getCartTotals, clearCart } = useCart();
  const currentLang = i18n.language;
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const cartTotals = getCartTotals();

  // Redirect to cart if no items
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = currentLang === 'ar' ? 'الاسم مطلوب' : 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = currentLang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone.trim())) {
      errors.phone = currentLang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    
    if (!formData.address.trim()) {
      errors.address = currentLang === 'ar' ? 'العنوان مطلوب' : 'Address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = currentLang === 'ar' ? 'المدينة مطلوبة' : 'City is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send the order to your backend
      const orderData = {
        customerInfo: formData,
        items: cartItems,
        totals: cartTotals,
        orderDate: new Date().toISOString()
      };
      
      console.log('Order submitted:', orderData);
      
      // WhatsApp order
      handleWhatsAppOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Navigate to success page or show success message
      alert(currentLang === 'ar' 
        ? 'تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً' 
        : 'Order submitted successfully! We will contact you soon'
      );
      
      navigate('/');
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert(currentLang === 'ar' 
        ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى' 
        : 'Error submitting order. Please try again'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppOrder = (orderData) => {
    const { customerInfo, items, totals } = orderData;
    
    let message = `🛒 *طلب جديد من ${customerInfo.fullName}*\n\n`;
    message += `📞 الهاتف: ${customerInfo.phone}\n`;
    message += `📧 الإيميل: ${customerInfo.email || 'غير محدد'}\n`;
    message += `📍 العنوان: ${customerInfo.address}, ${customerInfo.city}`;
    if (customerInfo.district) {
      message += `, ${customerInfo.district}`;
    }
    message += '\n\n';
    
    if (customerInfo.notes) {
      message += `📝 ملاحظات: ${customerInfo.notes}\n\n`;
    }
    
    message += `🛍️ *المنتجات:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name[currentLang]} x${item.quantity}`;
      if (item.selectedColor) message += ` (${item.selectedColor})`;
      if (item.selectedSize) message += ` (${item.selectedSize})`;
      message += ` - $${(item.finalPrice * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *الفاتورة:*\n`;
    message += `المجموع الفرعي: $${totals.subtotal}\n`;
    message += `الشحن: ${totals.shipping === 0 ? 'مجاني' : `$${totals.shipping}`}\n`;
    message += `الإجمالي: $${totals.total}`;
    
    const phoneNumber = "+966123456789"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <TopBar />
      <Navbar />
      <SecondaryNavbar />
      
      <div className="checkout-content">
        {/* Breadcrumb Navigation */}
        <nav className="checkout-breadcrumb">
          <Link to="/">
            <span>{t('secondary_navbar.home')}</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/cart">
            <span>{currentLang === 'ar' ? 'السلة' : 'Cart'}</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">
            {currentLang === 'ar' ? 'إكمال الطلب' : 'Checkout'}
          </span>
        </nav>

        {/* Header */}
        <div className="checkout-header">
          <h1 className="page-title">
            {currentLang === 'ar' ? 'إكمال الطلب' : 'Checkout'}
          </h1>
        </div>

        <div className="checkout-container">
          {/* Customer Information Form */}
          <div className="checkout-form-section">
            <h2 className="section-title">
              {currentLang === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
            </h2>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">
                    {currentLang === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className={formErrors.fullName ? 'error' : ''}
                  />
                  {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    {currentLang === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? '+966 50 123 4567' : '+966 50 123 4567'}
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  {currentLang === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={currentLang === 'ar' ? 'name@example.com' : 'name@example.com'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">
                    {currentLang === 'ar' ? 'المدينة' : 'City'} *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? 'الرياض' : 'Riyadh'}
                    className={formErrors.city ? 'error' : ''}
                  />
                  {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="district">
                    {currentLang === 'ar' ? 'الحي (اختياري)' : 'District (Optional)'}
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? 'الملز' : 'Al-Malaz'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  {currentLang === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'} *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={currentLang === 'ar' 
                    ? 'اسم الشارع، رقم المبنى، رقم الشقة...' 
                    : 'Street name, building number, apartment number...'
                  }
                  rows="3"
                  className={formErrors.address ? 'error' : ''}
                ></textarea>
                {formErrors.address && <span className="error-message">{formErrors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">
                  {currentLang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={currentLang === 'ar' 
                    ? 'أي ملاحظات خاصة للتوصيل...' 
                    : 'Any special delivery instructions...'
                  }
                  rows="2"
                ></textarea>
              </div>
            </form>
          </div>

          {/* Order Summary */}
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
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="item-options">
                          {item.selectedColor && (
                            <span>{currentLang === 'ar' ? 'اللون' : 'Color'}: {item.selectedColor}</span>
                          )}
                          {item.selectedSize && (
                            <span>{currentLang === 'ar' ? 'الحجم' : 'Size'}: {item.selectedSize}</span>
                          )}
                        </div>
                      )}
                      <div className="item-price">
                        ${item.finalPrice.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="item-total">
                      ${(item.finalPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="order-totals">
                <div className="total-row">
                  <span>{currentLang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span>${cartTotals.subtotal}</span>
                </div>
                
                <div className="total-row">
                  <span>{currentLang === 'ar' ? 'الشحن:' : 'Shipping:'}</span>
                  <span>
                    {cartTotals.shipping === 0 
                      ? (currentLang === 'ar' ? 'مجاني' : 'Free') 
                      : `$${cartTotals.shipping}`
                    }
                  </span>
                </div>
                
                <hr className="totals-divider" />
                
                <div className="total-row total-final">
                  <span>{currentLang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                  <span>${cartTotals.total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="place-order-btn"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="processing">
                    {currentLang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentLang === 'ar' ? 'تأكيد الطلب' : 'Place Order'}
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="security-note">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>
                  {currentLang === 'ar' 
                    ? 'معلوماتك آمنة ومحمية' 
                    : 'Your information is secure and protected'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 