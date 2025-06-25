import React, { useState } from 'react';
import './Auth/Auth.css';
import { useTranslation } from 'react-i18next';

const WholesaleRegisterModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useTranslation();
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registration logic here (not required for now)
    onClose();
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick} style={{zIndex: 2000}}>
      <div className="confirmation-modal" style={{maxWidth: 400, padding: 0}}>
        <div className="auth-card" style={{boxShadow: 'none', padding: '2rem'}}>
          <button onClick={onClose} style={{float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
          <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>{t('wholesale.register_title')}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">{t('wholesale.email')}</label>
              <input
                type="email"
                className="form-input"
                placeholder={t('wholesale.enter_email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('wholesale.password')}</label>
              <input
                type="password"
                className="form-input"
                placeholder={t('wholesale.enter_password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
              <input
                type="checkbox"
                id="wholesale-remember-me"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{marginLeft: 8}}
              />
              <label htmlFor="wholesale-remember-me" style={{margin: 0}}>{t('wholesale.remember_me')}</label>
            </div>
            <button type="submit" className="submit-button">{t('wholesale.register')}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WholesaleRegisterModal; 