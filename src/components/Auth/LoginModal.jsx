import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import useLogin from '../../hooks/useLogin';
import './Auth.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { t } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { login, loading, error, store, loadUserAndStoreInfo } = useLogin();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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
    
    if (!isFormValid) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Wait a bit for the context to update
      setTimeout(() => {
        // Close modal and redirect to home page
        onClose();
        navigate('/');
      }, 100);
    }
  };

  const handleClose = () => {
    // Reset form when closing
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