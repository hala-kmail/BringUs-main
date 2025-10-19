import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useOTP from '../../hooks/useOTP';
import useEmailChange from '../../hooks/useEmailChange';
import './Auth.css';

const OTPModal = ({ email, userId, onVerificationSuccess, onResendCode, onBack, onClose }) => {
  const { t, i18n } = useTranslation();
  const { verifyOTP, resendOTP, loading, error: otpError, errorAr: otpErrorAr, successMessage, successMessageAr, reset } = useOTP();
  const { requestEmailChangeByUserId, error: emailChangeError, errorAr: emailChangeErrorAr } = useEmailChange();
  const currentLang = i18n.language;

  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

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
    if (value && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Clear error when user starts typing
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
    if (pastedData.length === 5) {
      const newOtp = pastedData.split('').slice(0, 5);
      setOtp(newOtp);
      inputRefs[4].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isVerifying) return;

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
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      const result = await resendOTP(email, storeSlug);
      if (result.success) {
        setCountdown(60);
        onResendCode && onResendCode();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown timer
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

    // Check if userId is available
    if (!userId) {
      setEmailError(t('auth.otp.user_id_missing') || 'User ID is required to change email');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      console.log('📧 Requesting email change from', email, 'to', newEmail, 'for userId:', userId);
      
      // Call the email change API
      const result = await requestEmailChangeByUserId(userId, newEmail);
      
      if (result.success) {
        console.log('✅ Email change request successful, OTP sent to new email');
        setShowChangeEmailModal(false);
        setCountdown(60);
        // Notify parent component about the email change
        onResendCode && onResendCode(newEmail);
      } else {
        console.error('❌ Email change request failed:', result.error);
        setEmailError(currentLang === 'ar' ? (result.errorAr || result.error) : result.error);
      }
    } catch (err) {
      console.error('❌ Error requesting email change:', err);
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
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">{t('auth.otp.title')}</h1>
        <p className="auth-subtitle">
          {t('auth.otp.subtitle')} <strong>{email}</strong>
        </p>
      </div>

      {(otpError || otpErrorAr || emailChangeError || emailChangeErrorAr) && (
        <div className="error-message">
          {currentLang === 'ar' 
            ? (otpErrorAr || emailChangeErrorAr || otpError || emailChangeError) 
            : (otpError || emailChangeError || otpErrorAr || emailChangeErrorAr)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-labelOTP">{t('auth.otp.verification_code')}</label>
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
          <p className="otp-instruction">{t('auth.otp.enter_code')}</p>
        </div>

        <button
          type="submit"
          className={`submit-button ${!isFormValid || isVerifying ? 'disabled' : ''}`}
          disabled={!isFormValid || isVerifying}
        >
          {isVerifying ? t('auth.otp.verifying') : t('auth.otp.verify')}
        </button>
      </form>

      <div className="resend-section">
        <p className="resend-text">{t('auth.otp.didnt_receive')}</p>
        <button
          type="button"
          className="resend-button"
          onClick={handleResendCode}
          disabled={countdown > 0 || resendLoading}
        >
          {resendLoading ? t('auth.otp.sending') : 
           countdown > 0 ? t('auth.otp.resend_in', { seconds: countdown }) : 
           t('auth.otp.resend_code')}
        </button>
      </div>

      <div className="auth-footer">
        <span>{t('auth.otp.wrong_email')}</span>
        {/* <button type="button" className="auth-link" onClick={handleChangeEmail}>
          {t('auth.otp.change_email')}
        </button> */}
      </div>

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div className="modal-overlay-inner" onClick={() => setShowChangeEmailModal(false)}>
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
              <label className="form-label">{t('auth.otp.current_email_label')}</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
                readOnly
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  cursor: 'not-allowed',
                  color: '#666'
                }}
              />
            </div>

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

export default OTPModal;
