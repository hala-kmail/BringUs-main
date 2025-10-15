import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import useLogin from '../../hooks/useLogin';
import useOTP from '../../hooks/useOTP';
import useStoreSlug from '../../hooks/useStoreSlug';
import useDynamicColors from '../../hooks/useDynamicColors';
import OTPVerification from './OTPVerification';
import { FaStore } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { login, loading, error, errorAr, store, loadUserAndStoreInfo } = useLogin();
  const { primaryColor } = useDynamicColors();
  const { verifyOTP, resendOTP, sendOTP, loading: otpLoading, error: otpError, reset: resetOTP } = useOTP();
  const currentLang = i18n.language;
  const { storeSlug } = useStoreSlug();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [loginData, setLoginData] = useState(null);

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

  // Load user and store info on component mount if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser && (parsedUser.id || parsedUser._id)) {
          loadUserAndStoreInfo();
        }
      } catch (err) {
      }
    }
  }, [loadUserAndStoreInfo]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = t('auth.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validation.email_invalid');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('auth.validation.password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.password_min_length');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Real-time validation
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData, validateForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    console.log('handleSubmit');
    e.preventDefault();
    
    console.log('=== Login Form Submission Started ===');
    console.log('Form data:', formData);
    console.log('Is form valid:', isFormValid);
    
    if (!isFormValid) {
      console.log('Form validation failed, stopping submission');
      return;
    }

    const result = await login(formData.email, formData.password);
   
    
    if (result && result.success) {
    
      navigate('/');
    } else if (result && result.isEmailVerified === false) {
      // Send OTP verification code automatically
      const currentStoreSlug = storeSlug || window.location.pathname.split('/')[1] || 'default';
      console.log('Email not verified, sending OTP to:', formData.email, 'for store:', currentStoreSlug);
      await sendOTP(formData.email, currentStoreSlug);
      
      setLoginData(result.data);
      setShowOTP(true);
    } else {
      console.log('Login failed or unexpected result:', result);
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = async () => {
    // تسجيل الدخول تلقائياً بعد التحقق الناجح
    console.log('OTP verified successfully, auto-logging in...');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result && result.success) {
        console.log('Auto-login successful, navigating to home');
        navigate('/');
      } else {
        console.log('Auto-login failed, but navigating to home anyway');
        navigate('/');
      }
    } catch (err) {
      console.error('Auto-login error:', err);
      navigate('/');
    }
  };

  // Handle OTP resend or email change
  const handleOTPResend = (newEmailAddress) => {
    // If new email provided, update the email state
    if (newEmailAddress && newEmailAddress !== formData.email) {
      console.log('Email changed to:', newEmailAddress);
      setFormData(prev => ({ ...prev, email: newEmailAddress }));
    }
    console.log('OTP resent successfully');
  };

  // Handle back to login
  const handleOTPBack = () => {
    setShowOTP(false);
    setLoginData(null);
    resetOTP();
  };

  // Show OTP component if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={formData.email}
        onVerificationSuccess={handleOTPSuccess}
        onResendCode={handleOTPResend}
        onBack={handleOTPBack}
      />
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
          {/* Display store logo */}
          {console.log('store',store)}
          <div className="store-logo">
            {store && store.logo.url ? (
              <img 
                src={store.logo.url} 
                alt={store ? (store.nameEn || store.nameAr) : 'Store Logo'} 
                className="store-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  const icon = document.createElement('div');
                  icon.className = 'default-store-icon-auth';
                  icon.innerHTML = `<svg width="65" height="65" viewBox="0 0 24 24" fill="${primaryColor}"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>`;
                  e.target.parentNode.replaceChild(icon, e.target);
                }}
              />
            ) : (
              <div className="default-store-icon-auth">
                <FaStore style={{ color: primaryColor, fontSize: '80px' }} />
              </div>
            )}
          </div>
          
          <h1 className="auth-title">
           
            {store ?i18n.language === 'ar' ? store.nameAr : store.nameEn : t('auth.login.title')}
          </h1>
          {/* <p className="auth-subtitle">
            {store ? store.descriptionEn || store.descriptionAr : t('auth.login.subtitle')}
          </p> */}
        </div>
        
       
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.login.email')}</label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder={t('auth.login.email_placeholder')}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('auth.login.password')}</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={t('auth.login.password_placeholder')}
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>
          
          {(error || errorAr) && (
          <div className="error-message">
            {currentLang === 'ar' ? (errorAr || error) : (error || errorAr)}
          </div>
        )}
        
          <div className="forgot-password-link">
            <button 
              type="button"
              onClick={() => {
                // Navigate to forgot password page with storeSlug if available
                const forgotPasswordPath = storeSlug 
                  ? `/${storeSlug}/forgot-password` 
                  : '/forgot-password';
                navigate(forgotPasswordPath);
              }} 
              className="forgot-password-btn"
            >
              {t('auth.login.forgot_password')}
            </button>
          </div>
          
          <button 
            type="submit" 
            className={`submit-button ${!isFormValid || loading ? 'disabled' : ''}`}
            disabled={!isFormValid || loading}
            style={store && store.settings && store.settings.mainColor ? {
              backgroundColor: store.settings.mainColor
            } : {}}
            onClick={handleSubmit}
          >
            {loading ? t('auth.login.loading') : t('auth.login.submit')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('auth.login.no_account')}</span>
          <button onClick={() => navigate('/register')} className="auth-link">
            {t('auth.login.signup')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 