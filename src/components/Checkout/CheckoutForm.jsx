import React from 'react';

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
  deliveryAreas
}) => (
  <form className="checkout-form">
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
          <select id="deliveryArea" name="deliveryArea" value={formData.deliveryArea} onChange={handleInputChange}>
            {deliveryAreas.map(area => (
              <option key={area.id} value={area.id}>{area.label[currentLang]}</option>
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
);

export default CheckoutForm; 