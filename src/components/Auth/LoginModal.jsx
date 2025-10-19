import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import useLogin from '../../hooks/useLogin';
import useStoreSlug from '../../hooks/useStoreSlug';
import useOTP from '../../hooks/useOTP';
import useDynamicColors from '../../hooks/useDynamicColors';
import OTPModal from './OTPModal';
import { FaStore } from 'react-icons/fa';
import './Auth.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { login, loading, error, errorAr, store, loadUserAndStoreInfo } = useLogin();
  const { primaryColor } = useDynamicColors();
  const currentLang = i18n.language;
  const { storeSlug } = useStoreSlug();
  const { sendOTP } = useOTP();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loginData, setLoginData] = useState(null);     

  // Load user and store info when modal opens if user is already logged in
  useEffect(() => {
    if (!isOpen) return; // Only run when modal is open
    
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser && (parsedUser.id || parsedUser._id)) {
          loadUserAndStoreInfo();
        }
      } catch (err) {
        console.log('Error parsing stored user info, skipping auto-load');
      }
    }
  }, [loadUserAndStoreInfo, isOpen]);

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
    e.preventDefault();
    
    console.log('=== LoginModal Form Submission Started ===');
    console.log('Form data:', formData);
    console.log('Is form valid:', isFormValid);
    
    if (!isFormValid) {
      console.log('Form validation failed, stopping submission');
      return;
    }

    console.log('Calling login function...');
    // Get current store slug from hook or URL
    const currentStoreSlug = storeSlug || window.location.pathname.split('/')[1] || 'default';
    
    // Build complete login payload
    const loginPayload = {
      email: formData.email,
      password: formData.password,
      panelType: 'client',
      storeSlug: currentStoreSlug,
      rememberMe: formData.rememberMe
    };

    console.log('LoginModal payload:', loginPayload);

    const result = await login(loginPayload);
    console.log('Login result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'result is null/undefined');
    if (result.isEmailVerified === false) {
      // Only show OTP if we have user data (coming from registration)
      console.log('Email not verified from registration, showing OTP');
      
      // Send OTP verification code automatically
      const currentStoreSlug = storeSlug || window.location.pathname.split('/')[1] || 'default';
      console.log('Sending OTP to:', formData.email, 'for store:', currentStoreSlug);
      await sendOTP(formData.email, currentStoreSlug);
      
      setLoginData(result.data);
      setShowOTP(true);
    } 
    else if (result && result.success) {
      console.log('Login successful, closing modal and navigating to home');
      // Wait a bit for the context to update
      setTimeout(() => {
        // Close modal and redirect to home page
        onClose();
        navigate('/');
      }, 100);
    } else {
      console.log('Login failed or unexpected result:', result);
      // For wrong email/password, just show the error message
    }
  };

  const handleClose = () => {
    // Reset form when closing
    handleOTPBack();
    setFormData({ email: '', password: '' });
    setErrors({});
    onClose();
  };

  const handleSwitchToRegister = () => {
    onSwitchToRegister();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
const handleOTPSuccess = async () => {
  // تسجيل الدخول تلقائياً بعد التحقق الناجح
  console.log('OTP verified successfully, auto-logging in...');
  
  try {
    // Get current store slug from hook or URL
    const currentStoreSlug = storeSlug || window.location.pathname.split('/')[1] || 'default';
    
    // Build complete login payload for auto-login
    const loginPayload = {
      email: formData.email,
      password: formData.password,
      panelType: 'client',
      storeSlug: currentStoreSlug,
      rememberMe: formData.rememberMe
    };

    const result = await login(loginPayload);
    
    if (result && result.success) {
      console.log('Auto-login successful, closing modal and navigating to home');
      onClose();
      navigate('/');
    } else {
      console.log('Auto-login failed, but closing modal anyway');
      onClose();
      navigate('/');
    }
  } catch (err) {
    console.error('Auto-login error:', err);
    onClose();
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
};

// Show OTP component if needed
if (showOTP) {
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <OTPModal
          email={formData.email}
          userId={loginData?.userId || loginData?.id || loginData?._id}
          onVerificationSuccess={handleOTPSuccess}
          onResendCode={handleOTPResend}
          onBack={handleOTPBack}
        />
      </div>
    </div>
  );
}

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
              {store ? (store.nameEn || store.nameAr) : t('auth.login.title')}
            </h1>
           
          </div>
          
          {(error || errorAr) && (
            <div className="error-message">
              {currentLang === 'ar' ? (errorAr || error) : (error || errorAr)}
            </div>
          )}
          
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
            
            {/* Remember Me Checkbox */}
            <div className="form-group remember-me-group">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="remember-me-checkbox"
                />
                <span className="remember-me-text">
                  {currentLang === 'ar' ? 'تذكرني' : 'Remember Me'}
                </span>
              </label>
            </div>
            
            <div className="forgot-password-link">
              <button 
                type="button"
                onClick={() => {
                  onClose(); // Close the modal
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
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </form>
          
          <div className="auth-footer">
            <span>{t('auth.login.no_account')}</span>
            <button 
              type="button" 
              className="auth-link"
              onClick={handleSwitchToRegister}
            >
              {t('auth.login.signup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 

