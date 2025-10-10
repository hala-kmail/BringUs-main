import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useOTP from '../../hooks/useOTP';
import './Auth.css';

const OTPModal = ({ email, onVerificationSuccess, onResendCode, onBack, onClose }) => {
  const { t } = useTranslation();
  const { verifyOTP, resendOTP, loading, error: otpError, reset } = useOTP();

  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isFormValid, setIsFormValid] = useState(false);

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
    if (!isFormValid || loading) return;

    const otpString = otp.join('');
    const result = await verifyOTP(email, otpString);
    
    if (result.success) {
      onVerificationSuccess && onVerificationSuccess();
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

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">{t('auth.otp.title')}</h1>
        <p className="auth-subtitle">
          {t('auth.otp.subtitle')} <strong>{email}</strong>
        </p>
      </div>

      {otpError && (
        <div className="error-message">
          {otpError}
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
          className={`submit-button ${!isFormValid || loading ? 'disabled' : ''}`}
          disabled={!isFormValid || loading}
        >
          {loading ? t('auth.otp.verifying') : t('auth.otp.verify')}
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
        <button type="button" className="auth-link" onClick={onBack}>
          {t('auth.otp.change_email')}
        </button>
      </div>
    </div>
  );
};

export default OTPModal;
