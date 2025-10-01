import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { useAppData } from '../../contexts/AppDataContext';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { store } = useAppData();
  
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get store ID from localStorage or store context
  const getStoreId = useCallback(() => {
    if (store && store._id) {
      return store._id;
    }
    
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        const parsedStore = JSON.parse(storedStore);
        return parsedStore._id;
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    
    return null;
  }, [store]);

  // جلب بيانات الشروط والأحكام من API
  const fetchTerms = async () => {
    const storeId = getStoreId();
    
    if (!storeId) {
      setError('Store ID not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/terms-conditions/stores/${storeId}/terms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
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
        {/* Header Section */}
        <div className="terms-modal-header">
          <h1 className="terms-modal-title">
            {currentLang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </h1>
          <p className="terms-modal-subtitle">
            {currentLang === 'ar' 
              ? 'يرجى قراءة الشروط والأحكام بعناية قبل استخدام الخدمة'
              : 'Please read the terms and conditions carefully before using the service'
            }
          </p>
        </div>

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
                {currentLang === 'ar' 
                  ? 'عذراً، حدث خطأ في التحميل. يرجى المحاولة مرة أخرى.'
                  : 'Sorry, an error occurred while loading. Please try again.'
                }
              </p>
              <button 
                className="retry-button"
                onClick={fetchTerms}
              >
                {currentLang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
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