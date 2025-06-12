import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import palpayImg from '../../assets/PALPAY.png';
import paypalImg from '../../assets/Paypal_2014_logo.png';
import reflectImg from '../../assets/reflect.jpg';
import cashImg from '../../assets/cash on delivery.png';
import visaImg from '../../assets/visa.png';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import './Checkout.css';
import namer from 'color-namer';

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

  // أضف حالة لطريقة الاستلام والمنطقة
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'store'
  const [deliveryArea, setDeliveryArea] = useState('الصفة'); // default area
  const deliveryAreas = [
    { value: 'الضفة', label: currentLang === 'ar' ? 'الضفة (20₪)' : 'West Bank (20₪)', price: 20 },
    { value: 'الداخل', label: currentLang === 'ar' ? 'الداخل (70₪)' : 'the occupied interior (70₪)', price: 70 },
    { value: 'القدس', label: currentLang === 'ar' ? 'القدس (30₪)' : 'Jerusalem (30₪)', price: 30 },
  ];

  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);


  const paymentMethods = [
    { key: 'palpay', label: currentLang === 'ar' ? 'بال بي' : 'PalPay', img: `${palpayImg}` },
    { key: 'paypal', label: currentLang === 'ar' ? 'باي بال' : 'PayPal', img: `${paypalImg}` },
    { key: 'cash on delivery', label: currentLang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery', img: `${cashImg}` },
    { key: 'reflect', label: currentLang === 'ar' ? 'ريفليك' : 'Refill', img: `${reflectImg}` },
    { key: 'visa', label: currentLang === 'ar' ? 'رابط دفع الكتروني' : 'SA Link', img: `${visaImg}` },
  ];
///////////////////////////////////////////////////////////////////////////////////////////
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
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }
////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);
////////////////////////////////////////////////////////////////////////////////////////
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
      errors.fullName = t('checkout.validation.name_required');
    }
    if (!formData.phone.trim()) {
      errors.phone = t('checkout.validation.phone_required');
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone.trim())) {
      errors.phone = t('checkout.validation.invalid_phone_number');
    }
    if (deliveryMethod === 'delivery') {
      if (!formData.address.trim()) {
        errors.address = t('checkout.validation.address_required');
      }
      if (!formData.city.trim()) {
        errors.city = t('checkout.validation.city_required');
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
///////////////////////////////////////////////////////////////////////////////////////
  // عدل حساب الشحن حسب طريقة الاستلام
  const getShippingPrice = () => {
    if (deliveryMethod === 'store') return 0;
    const area = deliveryAreas.find(a => a.value === deliveryArea);
    return area ? area.price : 0;
  };
//////////////////////////////////////////////////////////////////////////////////////
// زر تأكيد الطلب: يظهر popup الدفع
const handlePlaceOrderClick = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setShowPaymentPopup(true);

};

 // عند اختيار طريقة دفع
 const handleSelectPayment = (method) => {
  setSelectedPaymentMethod(method);
  setShowPaymentPopup(false);
  setShowPaymentConfirm(true);
  setPaymentDone(false);
};

 // عند تأكيد الدفع (تم الدفع)
 const handlePaymentDone = () => {
  setPaymentDone(true);
};

// عند إرسال الطلب عبر واتساب بعد الدفع
const handleSendWhatsApp = () => {
  const orderData = {
    customerInfo: formData,
    items: cartItems,
    totals: { ...cartTotals, shipping: getShippingPrice(), total: cartTotals.subtotal + getShippingPrice() },
    orderDate: new Date().toISOString(),
    deliveryMethod,
    deliveryArea: deliveryMethod === 'delivery' ? deliveryArea : null,
    paymentMethod: selectedPaymentMethod?.key
  };
  handleWhatsAppOrder(orderData);
  clearCart();
  setShowPaymentConfirm(false);
  setSelectedPaymentMethod(null);
  setShowPaymentPopup(false);
  setPaymentDone(false);
  navigate('/');
};
//////////////////////////////////////////////////////////////////////////////////////

  const handleWhatsAppOrder = (orderData) => {
    const { customerInfo, items, totals } = orderData;
    
    let message = ` *طلب جديد من ${customerInfo.fullName}*\n\n`;
    message += ` الهاتف: ${customerInfo.phone}\n`;
    message += ` العنوان: ${customerInfo.address}, ${customerInfo.city}`;
    if (customerInfo.district) {
      message += `, ${customerInfo.district}`;
    }
    message += '\n\n';
    
    if (customerInfo.notes) {
      message += ` ملاحظات: ${customerInfo.notes}\n\n`;
    }
    
    message += ` *المنتجات:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name[currentLang]} x${item.quantity}`;
      if (item.selectedColor) message += ` (${getColorLabel(item.selectedColor, t)})`;
      if (item.selectedSize) message += ` (${item.selectedSize})`;
      message += ` - ₪${(item.finalPrice * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n *الفاتورة:*\n`;
    message += `المجموع الفرعي: ₪${totals.subtotal}\n`;
    message += `الشحن: ${totals.shipping === 0 ? 'مجاني' : `₪${totals.shipping}`}\n`;
    message += `الإجمالي: ₪${totals.total}`;
    
    const phoneNumber = "+970594056090"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }
//////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="checkout-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
          <Navbar />
      <SecondaryNavbar />
      
      <div className="checkout-content">
        {/* Breadcrumb Navigation */}
        <nav className="checkout-breadcrumb">
        <Link to="/">
            <span>{t('secondary_navbar.home')}</span>
          </Link>
          <span className="breadcrumb-separator"> {currentLang === 'ar' ? '‹' : '›'}</span>
          <Link to="/shop">
              <span>{t('secondary_navbar.shop')}</span>
            </Link>
          <span className="breadcrumb-separator"> {currentLang === 'ar' ? '‹' : '›'}</span>
          <Link to="/cart">
              <span>{t('secondary_navbar.cart')}</span>
            </Link>
          
          <span className="breadcrumb-separator"> {currentLang === 'ar' ? '‹' : '›'}</span>
          <span className="breadcrumb-current">
            {t('checkout.title')}
          </span>
        </nav>

        {/* Header */}
        <div className="checkout-header">
          <h1 className="page-title">
            {t('checkout.title')}
          </h1>
        </div>

        <div className="checkout-container">
          {/* Customer Information Form */}
          <div className="checkout-form-section">
            <h2 className="section-title">
              {t('checkout.delivery_info')}
            </h2>
            
            <form  className="checkout-form">
              {/* طريقة الاستلام */}
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>{t('checkout.delivery_method')} *</label>
                <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                  <label>
                    <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} />
                    {t('checkout.delivery')}
                  </label>
                  <label>
                    <input type="radio" name="deliveryMethod" value="store" checked={deliveryMethod === 'store'} onChange={() => setDeliveryMethod('store')} />
                    {t('checkout.pickup_from_store')}
                  </label>
                </div>
              </div>
              {/* دائماً: الاسم، الهاتف */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">{t('checkout.full_name')}*</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder={t('checkout.full_name_placeholder')} className={formErrors.fullName ? 'error' : ''} />
                  {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t('checkout.phone')}  *</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('checkout.phone_placeholder')} className={formErrors.phone ? 'error' : ''} />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>
              </div>
              {/* إذا كان توصيل */}
              {deliveryMethod === 'delivery' && (
                <>
                  {/* منطقة التوصيل */}
                  <div className="form-group">
                    <label htmlFor="deliveryArea">{t('checkout.delivery_area')} *</label>
                    <select id="deliveryArea" name="deliveryArea" value={deliveryArea} onChange={e => setDeliveryArea(e.target.value)}>
                      {deliveryAreas.map(area => (
                        <option key={area.value} value={area.value}>{area.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">{t('checkout.city')} *</label>
                      <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder={t('checkout.city_placeholder')} className={formErrors.city ? 'error' : ''} />
                      {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="district">{t('checkout.district')}</label>
                      <input type="text" id="district" name="district" value={formData.district} onChange={handleInputChange} placeholder={t('checkout.district_placeholder')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">{t('checkout.address')} *</label>
                    <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder={t('checkout.address_placeholder')} rows="3" className={formErrors.address ? 'error' : ''}></textarea>
                    {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                  </div>
                </>
              )}
              {/* دائماً: الملاحظات */}
              <div className="form-group">
                <label htmlFor="notes">{t('checkout.notes')} </label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder={t('checkout.notes_placeholder')} rows="2"></textarea>
              </div>
              {/* Checkbox للموافقة على سياسة الخصوصية */}
              <div className="form-group" style={{ margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={privacyChecked}
                    onChange={e => {
                      setPrivacyChecked(e.target.checked);
                      if (e.target.checked) setShowPrivacyPopup(true);
                    }}
                  />
                  <span>
                 {t('checkout.agree_privacy')} 
                  </span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => setShowPrivacyPopup(true)}
                  >
                    {t('checkout.view')} 
                  </button>
                </label>
              </div>
              {/* Popup لسياسة الخصوصية */}
              {showPrivacyPopup && (
                <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '90%', padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyPopup(false)}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
                      aria-label="Close"
                    >×</button>
                    <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--primary-color)' }}>{currentLang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</h3>
                    <div style={{ fontSize: 15, color: '#333', whiteSpace: 'pre-line' }}>
                    {t('checkout.privacy_policy_text')} 
                    </div>
                  </div>
                </div>
              )}
              {/* إذا كان استلام من المتجر */}
              {deliveryMethod === 'store' && (
                <div className="store-pickup-info" style={{ background: '#f3f4f6', borderRadius: 8, padding: 16, margin: '16px 0', color: '#444' }}>
                  <strong>{currentLang === 'ar' ? 'عنوان المتجر:' : 'Store Location:'}</strong>
                  <div>{currentLang === 'ar' ? 'رام الله - شارع الإرسال - بجانب البنك العربي' : 'Ramallah - Al-Irsal St. - Next to Arab Bank'}</div>
                  <div>{currentLang === 'ar' ? 'ساعات العمل: 9 صباحاً - 9 مساءً' : 'Working hours: 9am - 9pm'}</div>
                  <div>{currentLang === 'ar' ? 'يرجى الحضور خلال ساعات العمل لاستلام طلبك.' : 'Please come during working hours to pick up your order.'}</div>
                </div>
              )}
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
                            <span>{currentLang === 'ar' ? 'اللون' : 'Color'}: {getColorLabel(item.selectedColor, t)}</span>
                          )}
                          {item.selectedSize && (
                            <span>{currentLang === 'ar' ? 'الحجم' : 'Size'}: {item.selectedSize}</span>
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
                    {getShippingPrice() === 0 ? (t('checkout.free')) : `₪${getShippingPrice()}`}
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
                onClick={handlePlaceOrderClick}
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
        </div>
      </div>
 {/* Popup طرق الدفع */}
 {showPaymentPopup && (
        <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95%', padding: 60, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative', maxHeight: '80vh' }}>
            <button type="button" onClick={() => setShowPaymentPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} aria-label="Close">×</button>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--primary-color)' }}>{t('checkout.payment_methods')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {paymentMethods.map(method => (
                <button key={method.key} onClick={() => handleSelectPayment(method)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 12, border: '1px solid #eee', background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 8, cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>
                  <span>{method.label}</span>
                  <img className='payment-method-img' src={method.img} alt={method.label}  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
 {/* Popup تأكيد الدفع */}
 {showPaymentConfirm && (
        <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95%', padding: 60, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative', maxHeight: '80vh', overflowY: 'auto', textAlign: 'center' }}>
            <button type="button" onClick={() => { setShowPaymentConfirm(false); setSelectedPaymentMethod(null); }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} aria-label="Close">×</button>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: 16 }}>{t('checkout.payment_confirmation')}</h3>
            <div style={{ margin: '24px 0' }}>
              <div style={{ background: '#e6f9ed', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <svg width="32" height="32" fill="none" stroke="var(--primary-color)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--primary-color)" strokeWidth="2" fill="#e6f9ed"/><path d="M9 12l2 2 4-4" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{t('checkout.payment_successful')}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{cartTotals.subtotal + getShippingPrice()} ILS</div>
              {/* QR code placeholder */}
              <div style={{ margin: '16px 0' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=order" alt="QR Code" style={{ width: 120, height: 120 }} />
              </div>
            </div>
            {!paymentDone ? (
              <>
                <button onClick={handlePaymentDone} style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M2 12h20M2 12l7-7m-7 7l7 7" /></svg>
                  {t('checkout.i_have_paid')}
                </button>
                <button onClick={() => setShowPaymentConfirm(false)} style={{ width: '100%', background: 'none', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {t('checkout.pay_later')}
                </button>
              </>
            ) : (
              <button onClick={handleSendWhatsApp} style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/></svg>
                  {t('checkout.send_whatsapp')} 
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout; 