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
  const [formErrors, setFormErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log({ name, phone, area, address, district, email, password, confirmPassword });
  };
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
            <label className="form-label">{t('auth.register.name')}</label>
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
            <label className="form-label">{t('auth.register.phone')}</label>
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
            <label className="form-label">{t('auth.register.area')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.area_placeholder')}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              
            />
            {formErrors.area && <span className="error-message">{formErrors.area}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.address')}</label>
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
            <label className="form-label">{t('auth.register.email')}</label>
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
            <label className="form-label">{t('auth.register.password')}</label>
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
            <label className="form-label">{t('auth.register.confirm_password')}</label>
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