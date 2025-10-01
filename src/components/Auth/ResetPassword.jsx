import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import useStoreSlug from '../../hooks/useStoreSlug';
import './Auth.css';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { storeSlug } = useStoreSlug();
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Get storeSlug from URL params or store context
  const currentStoreSlug = params.storeSlug || storeSlug;
  
  // Get token from URL search params
  const token = searchParams.get('token');

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

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('auth.reset_password.validation.password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.reset_password.validation.password_min_length');
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.reset_password.validation.confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.reset_password.validation.passwords_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError(t('auth.reset_password.error_no_token'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE_URL = 'https://bringus-backend.onrender.com/api';
      
      // Get base URL from current window location
      let baseUrl = `${window.location.protocol}//${window.location.host}`;
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset password request:', {
          token,
          baseUrl,
          storeSlug: currentStoreSlug
        });
      }
      
      const requestBody = { 
        token,
        newPassword: formData.password,
       
      };
      
      const response = await fetch(`${API_BASE_URL}/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('auth.reset_password.success_message'));
        setIsSubmitted(true);
      } else {
        setError(data.message || t('auth.reset_password.error_generic'));
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(t('auth.reset_password.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    const loginPath = currentStoreSlug 
      ? `/login` 
      : '/login';
    navigate(loginPath);
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
            <h1 className="auth-title">{t('auth.reset_password.title')}</h1>
            <p className="auth-subtitle">{t('auth.reset_password.subtitle')}</p>
          </div>
          
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{message}</p>
          </div>
          
          <div className="auth-footer">
            <button onClick={handleBackToLogin} className="auth-link">
              {t('auth.reset_password.back_to_login')}
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
          <h1 className="auth-title">{t('auth.reset_password.title')}</h1>
          <p className="auth-subtitle">{t('auth.reset_password.subtitle')}</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.reset_password.new_password')}</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={t('auth.reset_password.new_password_placeholder')}
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('auth.reset_password.confirm_password')}</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder={t('auth.reset_password.confirm_password_placeholder')}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`submit-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? t('auth.reset_password.resetting') : t('auth.reset_password.reset')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('auth.reset_password.remember_password')}</span>
          <button onClick={handleBackToLogin} className="auth-link">
            {t('auth.reset_password.back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

