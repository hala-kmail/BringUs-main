import React from 'react';
import TermsModal from '../Footer/TermsModal';

const CheckoutForm = ({
  t,
  currentLang,
  deliveryMethod,
  setDeliveryMethod,
  formData,
  setFormData,
  formErrors,
  handleInputChange,
  privacyChecked,
  setPrivacyChecked,
  showPrivacyPopup,
  setShowPrivacyPopup,
  deliveryMethods,
  storeAddress,
  isTermsModalOpen,
  setIsTermsModalOpen,
  updateShippingArea
}) => {
  // معالج مخصص لتغيير منطقة التوصيل
  const handleDeliveryAreaChange = (e) => {
    const areaId = e.target.value;
    // تحديث النموذج
    setFormData(prev => ({ ...prev, deliveryMethodId: areaId }));
    // تحديث منطقة التوصيل في CartContext
    if (areaId) {
      updateShippingArea(areaId);
    }
  };

  return (
  <form className="checkout-form">
    {/* طريقة الاستلام */}
    {/* <div className="form-group">
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
    </div> */}
    
    {/* عنوان المتجر إذا كان الاستلام من المتجر */}
    {deliveryMethod === 'store' && storeAddress && (
      <div className="form-group" style={{ 
        background: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef',
        marginBottom: '20px'
      }}>
        <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
          {currentLang === 'ar' ? 'عنوان المتجر' : 'Store Address'}
        </label>
        <div style={{ 
          color: '#495057', 
          fontSize: '14px', 
          lineHeight: '1.5',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px', color: '#6c757d' }}>📍</span>
          {storeAddress}
        </div>
      </div>
    )}
    
    {/* دائماً: الاسم، الهاتف */}
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="firstName">{t('profile.first_name')}*</label>
        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('profile.first_name_placeholder')} className={formErrors.firstName ? 'error' : ''} />
        {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="lastName">{t('profile.last_name')}*</label>
        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('profile.last_name_placeholder')} className={formErrors.lastName ? 'error' : ''} />
        {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="phone">{t('profile.phone')}  *</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('profile.phone_placeholder')} className={formErrors.phone ? 'error' : ''} />
        {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="email">{t('profile.email')} *</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('profile.email_placeholder')} className={formErrors.email ? 'error' : ''} />
        {formErrors.email && <span className="error-message">{formErrors.email}</span>}
      </div>
    </div>
    
    {/* إذا كان توصيل */}
    {deliveryMethod === 'delivery' && (
      <>
        {/* منطقة التوصيل */}
        <div className="form-group">
          <label htmlFor="deliveryMethodId">{t('checkout.delivery_area')} *</label>
          <select 
            id="deliveryMethodId" 
            name="deliveryMethodId" 
            value={formData.deliveryMethodId} 
            onChange={handleDeliveryAreaChange}
            className={formErrors.deliveryMethodId ? 'error' : ''}
          >
            <option value="">{currentLang === 'ar' ? 'اختر منطقة التوصيل' : 'Select delivery area'}</option>
            {deliveryMethods.map(method => (
              <option key={method._id} value={method._id}>
                {currentLang === 'ar' ? method.locationAr : method.locationEn} - {method.price} ILS
                {method.estimatedDays && ` (${method.estimatedDays} ${currentLang === 'ar' ? 'يوم' : 'day'}${method.estimatedDays > 1 ? (currentLang === 'ar' ? 's' : 's') : ''})`}
              </option>
            ))}
          </select>
          {formErrors.deliveryMethodId && <span className="error-message">{formErrors.deliveryMethodId}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">{t('profile.city')} *</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder={t('profile.city_placeholder')} className={formErrors.city ? 'error' : ''} />
            {formErrors.city && <span className="error-message">{formErrors.city}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="district">{t('profile.district')}</label>
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
            if (e.target.checked) setIsTermsModalOpen(true);
          }}
        />
        <span>
          {t('checkout.agree_privacy')}
        </span>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
          onClick={() => setIsTermsModalOpen(true)}
        >
          {t('checkout.view')}
        </button>
      </label>
    </div>

    <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
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
   
  </form>
  );
};

export default CheckoutForm; 