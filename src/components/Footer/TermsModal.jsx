import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSpinner, FaSignInAlt } from 'react-icons/fa';
import { useAppData } from '../../contexts/AppDataContext';
import { getToken } from '../../utils/tokenManager';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { store } = useAppData();
  
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب بيانات الشروط والأحكام من API
  const fetchTerms = async () => {
    if (!store?._id) {
      setError('Store ID not found');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('unauthorized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/terms-conditions/stores/${store._id}/terms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // التحقق من نجاح الطلب
      if (data.success && data.data) {
        setTermsData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch terms and conditions');
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند فتح المودال أو تغيير اللغة
  useEffect(() => {
    if (isOpen) {
      fetchTerms();
    }
  }, [isOpen, currentLang]);

  // إغلاق المودال عند الضغط على ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  // إغلاق المودال عند النقر خارجه
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay" onClick={handleBackdropClick}>
      <div className="terms-modal" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Close Button */}
        <button 
          className="terms-modal-close" 
          onClick={onClose}
          aria-label={currentLang === 'ar' ? 'إغلاق' : 'Close'}
        >
          <FaTimes />
        </button>

        {/* Content */}
        <div className="terms-modal-content">
          {loading && (
            <div className="terms-loading">
              <FaSpinner className="loading-spinner" />
              <p>{currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          )}

          {error && (
            <div className="terms-error">
              <p className="error-message">
                {error === 'unauthorized' 
                  ? (currentLang === 'ar' 
                      ? 'يرجى تسجيل الدخول للاطلاع على الشروط والأحكام.'
                      : 'Please log in to view the terms and conditions.')
                  : (currentLang === 'ar' 
                      ? 'عذراً، حدث خطأ في التحميل. يرجى المحاولة مرة أخرى.'
                      : 'Sorry, an error occurred while loading. Please try again.')
                }
              </p>
              {error === 'unauthorized' ? (
                <button 
                  className="login-button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/login';
                  }}
                >
                  <FaSignInAlt />
                  {currentLang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </button>
              ) : (
                <button 
                  className="retry-button"
                  onClick={fetchTerms}
                >
                  {currentLang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              )}
            </div>
          )}

          {termsData && !loading && !error && (
            <div className="terms-content">
              {termsData.htmlContent && (
                <div 
                  className="terms-text"
                  dangerouslySetInnerHTML={{
                    __html: termsData.htmlContent
                  }}
                />
              )}

              {!termsData.htmlContent && (
                <div className="terms-placeholder">
                  <p>
                    {currentLang === 'ar' 
                      ? 'الشروط والأحكام قيد التحديث. يرجى العودة لاحقاً.'
                      : 'Terms and conditions are being updated. Please check back later.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal; 