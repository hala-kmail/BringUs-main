import React, { useState, useEffect, useCallback } from 'react';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import useOTP from '../../hooks/useOTP';
import './Auth.css';

const OTPVerification = ({ email, onVerificationSuccess, onResendCode, onBack }) => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { verifyOTP, resendOTP, loading, error: otpError, errorAr: otpErrorAr, successMessage, successMessageAr, reset } = useOTP();
  const currentLang = i18n.language;

  // Change from 6 to 5 digits
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Update refs to 5 inputs
  const inputRefs = [
    React.useRef(), React.useRef(), React.useRef(),
    React.useRef(), React.useRef()
  ];

  const validateForm = useCallback(() => {
    const isValid = otp.every(digit => digit !== '');
    setIsFormValid(isValid);
    return isValid;
  }, [otp]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 4) { // Changed from 5 to 4
      inputRefs[index + 1].current?.focus();
    }
    
    // Clear error on typing
    if (otpError) {
      reset();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 5) { // Changed from 6 to 5
      const newOtp = pastedData.split('').slice(0, 5); // Changed from 6 to 5
      setOtp(newOtp);
      inputRefs[4].current?.focus(); // Changed from 5 to 4
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsVerifying(true);
    try {
      const otpString = otp.join('');
      // Get storeSlug from URL or context to ensure verification is for correct store
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      const result = await verifyOTP(email, otpString, storeSlug);
      if (result.success) {
        onVerificationSuccess && onVerificationSuccess();
      }
    } catch (err) {
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      // Get storeSlug from URL or context
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      const result = await resendOTP(email, storeSlug);
      // if (result.success) {
        setCountdown(60);
        onResendCode && onResendCode();
      // }
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChangeEmail = () => {
    setShowChangeEmailModal(true);
    setNewEmail('');
    setEmailError('');
  };

  const validateNewEmail = (newEmailValue) => {
    if (!newEmailValue) {
      return t('auth.validation.email_required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailValue)) {
      return t('auth.validation.email_invalid');
    }
    if (newEmailValue.toLowerCase() === email.toLowerCase()) {
      return t('auth.otp.same_email_error');
    }
    return '';
  };

  const handleConfirmNewEmail = async () => {
    const error = validateNewEmail(newEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    setIsUpdatingEmail(true);
    try {
      // Get storeSlug from URL or context
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      
      // Send OTP to new email
      const result = await resendOTP(newEmail, storeSlug);
      
      if (result.success) {
        // Close modal and update email in parent component
        setShowChangeEmailModal(false);
        setCountdown(60);
        
        // Update the email - we need to call a callback to update parent component
        // For now, we'll navigate back with the new email
        onResendCode && onResendCode(newEmail);
      } else {
        setEmailError(result.error || t('auth.otp.email_update_failed'));
      }
    } catch (err) {
      console.error('Error updating email:', err);
      setEmailError(t('auth.otp.email_update_failed'));
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleNewEmailChange = (e) => {
    setNewEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('auth.otp.title')}</h1>
          <p className="auth-subtitle">
            {t('auth.otp.subtitle')}<br />
            <strong>{email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {(otpError || otpErrorAr) && (
            <div className="error-message">
              {currentLang === 'ar' ? (otpErrorAr || otpError) : (otpError || otpErrorAr)}
            </div>
          )}
          
          <div className="form-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                <path d="M10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6ZM10 10C9.44772 10 9 9.55228 9 9C9 8.44772 9.44772 8 10 8C10.5523 8 11 8.44772 11 9C11 9.55228 10.5523 10 10 10Z" fill="currentColor"/>
              </svg>
              {t('auth.otp.verification_code')}
            </h3>
            
            <div className="otp-container">
              <p className="otp-instruction">{t('auth.otp.enter_code')}</p>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    maxLength={1}
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className={`submit-button ${!isFormValid ? 'disabled' : ''}`}
            disabled={isVerifying || !isFormValid}
          >
            {isVerifying ? (
              <>
                {/* <svg className="loading-spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                </svg> */}
                {t('auth.otp.verifying')}
              </>
            ) : (
              <>
                {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                </svg> */}
                {t('auth.otp.verify')}
              </>
            )}
          </button>
        </form>
        
        <div className="resend-section">
          <p className="resend-text">{t('auth.otp.didnt_receive')}</p>
          <button
            type="button"
            className={`resend-button ${countdown > 0 ? 'disabled' : ''}`}
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading ? (
              <>
                {/* <svg className="loading-spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                </svg> */}
                {t('auth.otp.sending')}
              </>
            ) : countdown > 0 ? (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                </svg>
                {t('auth.otp.resend_in', { seconds: countdown })}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor"/>
                </svg>
                {t('auth.otp.resend_code')}
              </>
            )}
          </button>
        </div>
        
        <div className="auth-footer">
          <span>{t('auth.otp.wrong_email')}</span>
          <button onClick={handleChangeEmail} className="auth-link">
            {t('auth.otp.change_email')}
          </button>
        </div>
      </div>

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div className="modal-overlay" onClick={() => setShowChangeEmailModal(false)}>
          <div className="modal-content change-email-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setShowChangeEmailModal(false)}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-header">
              <h2 className="modal-title">{t('auth.otp.change_email_title')}</h2>
              <p className="modal-subtitle">{t('auth.otp.change_email_subtitle')}</p>
            </div>

            {emailError && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {emailError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('auth.otp.new_email_label')}</label>
              <input
                type="email"
                className={`form-input ${emailError ? 'error' : ''}`}
                placeholder={t('auth.otp.new_email_placeholder')}
                value={newEmail}
                onChange={handleNewEmailChange}
                disabled={isUpdatingEmail}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowChangeEmailModal(false)}
                disabled={isUpdatingEmail}
              >
                {t('auth.otp.cancel')}
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={handleConfirmNewEmail}
                disabled={isUpdatingEmail || !newEmail}
              >
                {isUpdatingEmail ? t('auth.otp.updating') : t('auth.otp.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
