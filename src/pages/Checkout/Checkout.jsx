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
import deliveryAreas, { getShippingPriceByAreaId, getAreaLabelById, getDefaultAreaIdFromLocalStorage } from '../../data/deliveryAreas';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import OrderSummary from '../../components/Checkout/OrderSummary';
import { validateRequired, validateAndSanitizePhone } from '../../utils/validation';
//-----------------------------------Checkout------------------------------------------------  
const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getCartTotals, clearCart } = useCart();
  const currentLang = i18n.language;
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    deliveryArea: getDefaultAreaIdFromLocalStorage(),
    address: '',
    city: '',
    district: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const cartTotals = getCartTotals();
  const defaultAreaId = localStorage.getItem('register_area') || 1; 
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); 
  const [deliveryArea, setDeliveryArea] = useState(defaultAreaId);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

//-----------------------------------paymentMethods------------------------------------------------  
  const paymentMethods = [
    { key: 'palpay', label: currentLang === 'ar' ? 'بال بي' : 'PalPay', img: `${palpayImg}` },
    { key: 'paypal', label: currentLang === 'ar' ? 'باي بال' : 'PayPal', img: `${paypalImg}` },
    { key: 'cash on delivery', label: currentLang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery', img: `${cashImg}` },
    { key: 'reflect', label: currentLang === 'ar' ? 'ريفليك' : 'Refill', img: `${reflectImg}` },
    { key: 'visa', label: currentLang === 'ar' ? 'رابط دفع الكتروني' : 'SA Link', img: `${visaImg}` },
  ];
  //-----------------------------------getColorKey------------------------------------------------  
  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }
//-----------------------------------getColorLabel------------------------------------------------  
  function getColorLabel(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }
//-----------------------------------useEffect------------------------------------------------  
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);
  //-----------------------------------useEffect------------------------------------------------  
useEffect(() => {
  setFormData(prev => ({
    ...prev,
    fullName: localStorage.getItem('register_name') || '',
    phone: localStorage.getItem('register_phone') || '',
    address: localStorage.getItem('register_address') || '',
    district: localStorage.getItem('register_district') || '',
    city: localStorage.getItem('register_city') || prev.city || '',
    deliveryArea: localStorage.getItem('register_area') || '1',

  }));
  
}, []);
//-----------------------------------handleInputChange------------------------------------------------  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const { sanitized } = validateAndSanitizePhone(value, t('checkout.validation.phone_invalid'));
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
//-----------------------------------validateForm------------------------------------------------  
  const validateForm = () => {
    const errors = {};
    errors.fullName = validateRequired(formData.fullName, t('checkout.validation.name_required'));
    const phoneResult = validateAndSanitizePhone(formData.phone, t('checkout.validation.phone_invalid'));
    errors.phone = phoneResult.error || validateRequired(formData.phone, t('checkout.validation.phone_required'));
    if (deliveryMethod === 'delivery') {
      errors.address = validateRequired(formData.address, t('checkout.validation.address_required'));
      errors.city = validateRequired(formData.city, t('checkout.validation.city_required'));
    }
    setFormErrors(errors);
    return Object.values(errors).every((err) => !err);
  };
  //-----------------------------------getShippingPrice------------------------------------------------  
  const getShippingPrice = () => {
    if (deliveryMethod === 'store') return 0;
    const areaId = Number(formData.deliveryArea) || 1;
    const price = getShippingPriceByAreaId(areaId);
    return price !== undefined ? price : 20;
  };
  //-----------------------------------handlePlaceOrderClick------------------------------------------------  
const handlePlaceOrderClick = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setShowPaymentPopup(true);
};
//-----------------------------------handleSelectPayment------------------------------------------------  
 const handleSelectPayment = (method) => {
  setSelectedPaymentMethod(method);
  setShowPaymentPopup(false);
  setShowPaymentConfirm(true);
  setPaymentDone(false);
};
//-----------------------------------handlePaymentDone------------------------------------------------  
 const handlePaymentDone = () => {
  setPaymentDone(true);
};
//-----------------------------------handleSendWhatsApp------------------------------------------------  
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
//-----------------------------------handleWhatsAppOrder------------------------------------------------  
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
//-----------------------------------if cartItems is empty------------------------------------------------  
  if (cartItems.length === 0) {
    return null; 
  }
//-----------------------------------return------------------------------------------------  
  return (
    <div className="checkout-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
          <Navbar />
      <SecondaryNavbar />
      
      <div className="checkout-content">
        {/* Breadcrumb Navigation */}
        <Breadcrumb currentLang={currentLang} t={t} breadcrumbPath={[
          { name: t('secondary_navbar.cart'), slug: 'cart' },
          { name: t('checkout.title'), slug: '' }
        ]} />

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
            
            <CheckoutForm
              t={t}
              currentLang={currentLang}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              privacyChecked={privacyChecked}
              setPrivacyChecked={setPrivacyChecked}
              showPrivacyPopup={showPrivacyPopup}
              setShowPrivacyPopup={setShowPrivacyPopup}
              deliveryAreas={deliveryAreas}
            />
          </div>

          {/* Order Summary */}
         
            
            <OrderSummary
              cartItems={cartItems}
              cartTotals={cartTotals}
              deliveryMethod={deliveryMethod}
              getShippingPrice={getShippingPrice}
              t={t}
              currentLang={currentLang}
              onPlaceOrder={handlePlaceOrderClick}
              isProcessing={isProcessing}
              privacyChecked={privacyChecked}
            />
         
        </div>
      </div>
 {/* Popup طرق الدفع */}
 {showPaymentPopup && (
        <div className="privacy-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="privacy-popup" style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95%', padding: 60, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative' }}>
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
                <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24" style={{ marginLeft: 8 }}><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.6 5.85L0 24l6.31-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.75.98.99-3.65-.24-.38A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.17 3.32 5.27 4.52.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/></svg>
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