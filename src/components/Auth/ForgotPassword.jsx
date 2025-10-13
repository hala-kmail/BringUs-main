import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import useStoreSlug from '../../hooks/useStoreSlug';
import './Auth.css';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { storeSlug } = useStoreSlug();
  const params = useParams();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get storeSlug from URL params or store context
  const currentStoreSlug = params.storeSlug || storeSlug;

  // Set document direction when language changes
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Force re-render when language changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang).then(() => {
      document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      localStorage.setItem('i18nextLng', newLang);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('auth.forgot_password.validation.email_required'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.forgot_password.validation.email_invalid'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE_URL = 'https://bringus-backend.onrender.com/api';
      
      // Get base URL from current window location
      // Handle different environments and ports
      let baseUrl = `${window.location.protocol}//${window.location.host}/${currentStoreSlug}`;
      
      // Remove port from baseUrl in production (optional)
      if (process.env.NODE_ENV === 'production' && window.location.port) {
        // Keep the port for now, but you can remove it if needed
        // baseUrl = `${window.location.protocol}//${window.location.hostname}`;
      }
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Current window location:', {
          protocol: window.location.protocol,
          host: window.location.host,
          href: window.location.href,
          baseUrl: baseUrl
        });
      }
      
      const requestBody = { 
        email,
        baseUrl,
        ...(currentStoreSlug && { storeSlug: currentStoreSlug })
      };
      
      console.log('Sending forgot password request:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/password-reset/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Display success message based on current language
        const successMsg = i18n.language === 'ar' 
          ? (data.messageAr || data.message || t('auth.forgot_password.success_message'))
          : (data.message || data.messageAr || t('auth.forgot_password.success_message'));
        setMessage(successMsg);
        setIsSubmitted(true);
      } else {
        // Display error message based on current language with fallback
        const errorMsg = i18n.language === 'ar'
          ? (data.messageAr || data.message || t('auth.forgot_password.error_generic'))
          : (data.message || data.messageAr || t('auth.forgot_password.error_generic'));
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(t('auth.forgot_password.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="language-switcher"
          style={{
            position: 'fixed',
            top: '2rem',
            [i18n.language === 'ar' ? 'left' : 'right']: '2rem',
            zIndex: 1000
          }}
        >
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{t('auth.forgot_password.title')}</h1>
            <p className="auth-subtitle">{t('auth.forgot_password.subtitle')}</p>
          </div>
          
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{message}</p>
          </div>
          
          <div className="auth-footer">
            <button onClick={handleBackToLogin} className="auth-link">
              {t('auth.forgot_password.back_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="language-switcher"
        style={{
          position: 'fixed',
          top: '2rem',
          [i18n.language === 'ar' ? 'left' : 'right']: '2rem',
          zIndex: 1000
        }}
      >
        {i18n.language === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('auth.forgot_password.title')}</h1>
          <p className="auth-subtitle">{t('auth.forgot_password.subtitle')}</p>
        </div>
        
       
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.forgot_password.email')}</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder={t('auth.forgot_password.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            /> {error && (
          <div className="error-message">
            {error}
          </div>
        )}
          </div>
         
          <button 
            type="submit" 
            className={`submit-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? t('auth.forgot_password.sending') : t('auth.forgot_password.send')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('auth.forgot_password.remember_password')}</span>
          <button onClick={handleBackToLogin} className="auth-link">
            {t('auth.forgot_password.back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
