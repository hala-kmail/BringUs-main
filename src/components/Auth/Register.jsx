import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const currentLang = localStorage.getItem('i18nextLng');
  const deliveryAreas = [
    {id: 1, value: 'الضفة', label: currentLang === 'ar' ? 'الضفة (20₪)' : 'West Bank (20₪)', price: 20 },
    {id: 2, value: 'الداخل', label: currentLang === 'ar' ? 'الداخل (70₪)' : 'the occupied interior (70₪)', price: 70 },
    {id: 3, value: 'القدس', label: currentLang === 'ar' ? 'القدس (30₪)' : 'Jerusalem (30₪)', price: 30 },
  ];
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = t('auth.register.validation.name_required');
    }
    if (!phone.trim()) {
      errors.phone = t('auth.register.validation.phone_required');
    } else if (!/^[0-9+\-\s()]{10,}$/.test(phone.trim())) {
      errors.phone = t('auth.register.validation.phone_invalid');
    }
    if (!area.trim()) {
      errors.area = t('auth.register.validation.area_required');
    }
    if (!city.trim()) {
      errors.city = t('auth.register.validation.city_required');
    }
    if (!address.trim()) {
      errors.address = t('auth.register.validation.address_required');
    }
    if (!email.trim()) {
      errors.email = t('auth.register.validation.email_required');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      errors.email = t('auth.register.validation.email_invalid');
    }
    if (!password) {
      errors.password = t('auth.register.validation.password_required');
    } else if (password.length < 6) {
      errors.password = t('auth.register.validation.password_short');
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.confirm_password_required');
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.passwords_not_match');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
///////////////////////////////////////////////////////////////////////////////////////
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    localStorage.setItem('register_name', name);
    localStorage.setItem('register_phone', phone);
    localStorage.setItem('register_area', area);
    localStorage.setItem('register_city', city);
    localStorage.setItem('register_address', address);
    if (district) {
      localStorage.setItem('register_district', district);
    } else {
      localStorage.removeItem('register_district');
    }
    console.log({ name, phone, area, address, district, email, password, confirmPassword });
  };
///////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('auth.register.title')}</h1>
          <p className="auth-subtitle">{t('auth.register.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.register.name')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.phone')} <span className='required'>*</span></label>
            <input
              type="tel"
              className="form-input"
              placeholder={t('auth.register.phone_placeholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
          </div>

          <div className="form-group">
                    <label htmlFor="deliveryArea">{t('checkout.delivery_area')} *</label>
                    <select id="deliveryArea" name="deliveryArea" value={area} onChange={e => setArea(e.target.value)}>
                      {deliveryAreas.map(area => (
                        <option key={area.id} value={area.id}>{area.label}</option>
                      ))}
                    </select>
                  </div>
                      
          <div className="form-group">
            <label className="form-label">{t('auth.register.city')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.city_placeholder')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
              {formErrors.city && <span className="error-message">{formErrors.city}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.address')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.address_placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {formErrors.address && <span className="error-message">{formErrors.address}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.district')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.district_placeholder')}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.email')} <span className='required'>*</span></label>
            <input
              type="email"
              className="form-input"
              placeholder={t('auth.register.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.password')} <span className='required'>*</span></label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.register.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {formErrors.password && <span className="error-message">{formErrors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.confirm_password')} <span className='required'>*</span></label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.register.confirm_password_placeholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
          </div>
          <button type="submit" className="submit-button">
            {t('auth.register.submit')}
          </button>
        </form>
        <div className="auth-footer">
          <span>{t('auth.register.have_account')}</span>
          <Link to="/login" className="auth-link">
            {t('auth.register.signin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 