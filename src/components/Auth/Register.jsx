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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, password, confirmPassword });
  };

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