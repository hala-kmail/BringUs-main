import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('auth.login.title')}</h1>
          <p className="auth-subtitle">{t('auth.login.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.login.email')}</label>
            <input
              type="email"
              className="form-input"
              placeholder={t('auth.login.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.login.password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.login.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-button">
            {t('auth.login.submit')}
          </button>
        </form>
        <div className="auth-footer">
          <span>{t('auth.login.no_account')}</span>
          <Link to="/register" className="auth-link">
            {t('auth.login.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 