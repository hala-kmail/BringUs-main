import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import useLogin from '../../hooks/useLogin';
import useOTP from '../../hooks/useOTP';
import OTPVerification from './OTPVerification';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { login, loading, error, store, loadUserAndStoreInfo } = useLogin();
  const { verifyOTP, resendOTP, loading: otpLoading, error: otpError, reset: resetOTP } = useOTP();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [loginData, setLoginData] = useState(null);

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
        console.log('Error parsing stored user info, skipping auto-load');
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

    console.log('Calling login function...');
    const result = await login(formData.email, formData.password);
    console.log('Login result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'result is null/undefined');
    
    if (result && result.success) {
      console.log('Login successful, navigating to home');
      // Email is verified, redirect to home page
      navigate('/');
    } else if (result && result.isEmailVerified === false) {
      console.log('Email not verified, showing OTP');
      // Email not verified, show OTP verification
      setLoginData(result.data);
      setShowOTP(true);
    } else {
      console.log('Login failed or unexpected result:', result);
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    // Redirect to home page after successful verification
    navigate('/');
  };

  // Handle OTP resend
  const handleOTPResend = () => {
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
      <div className="auth-card">
        <div className="auth-header">
          {/* Display store logo if available */}
          {store && store.logo && (
            <div className="store-logo">
              <img 
                src={store.logo.url} 
                alt={store.nameEn || store.nameAr || 'Store Logo'} 
                className="store-logo-img"
              />
            </div>
          )}
          
          <h1 className="auth-title">
            {store ? (store.nameEn || store.nameAr) : t('auth.login.title')}
          </h1>
          <p className="auth-subtitle">
            {store ? store.descriptionEn || store.descriptionAr : t('auth.login.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
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