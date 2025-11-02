import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import './Auth.css';
import { validateRequired, validatePhone, validateEmail, validateMinLength, validateMatch, validateWhatsApp, sanitizePhoneNumber } from '../../utils/validation';
import { useCreateUser } from '../../hooks/useCreateUser';
import { useCheckEmail } from '../../hooks/useCheckEmail';
import { useAppData } from '../../contexts/AppDataContext';
import OTPVerification from './OTPVerification';
import CustomPhoneInput from '../common/CustomPhoneInput';
import useOTP from '../../hooks/useOTP';
import useLogin from '../../hooks/useLogin';

const Register = () => {
  const { t, i18n } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { createUser, loading, error, reset } = useCreateUser();
  const { 
    checkEmailAvailability, 
    checkEmailFromError, 
    emailExists, 
    emailError, 
    isCheckingEmail,
    emailAvailable,
    existingAccounts,
    reset: resetEmailCheck 
  } = useCheckEmail();
  const { store } = useAppData();
  const { sendOTP } = useOTP();
  const { login } = useLogin();
  
  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  //---------------------form fields-------------------------------
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('فلسطين');
  //----------------------------------------------------------------
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const currentLang = localStorage.getItem('i18nextLng');
  

  const validateForm = useCallback(() => {
    const errors = {};
    
    // التحقق من الاسم الأول (2-50 حرف)
    if (!firstName.trim()) {
      errors.firstName = t('auth.register.validation.firstName_required');
    } else if (firstName.trim().length < 2 || firstName.trim().length > 50) {
      errors.firstName = t('auth.register.validation.firstName_length');
    }
    
    // التحقق من الاسم الأخير (2-50 حرف)
    if (!lastName.trim()) {
      errors.lastName = t('auth.register.validation.lastName_required');
    } else if (lastName.trim().length < 2 || lastName.trim().length > 50) {
      errors.lastName = t('auth.register.validation.lastName_length');
    }
    
    // التحقق من البريد الإلكتروني
    const emailValidation = validateEmail(email, t('auth.register.validation.email_invalid')) || validateRequired(email, t('auth.register.validation.email_required'));
    if (emailValidation) {
      errors.email = emailValidation;
    } else if (emailExists) {
      errors.email = t('auth.register.validation.email_exists');
    }
    
    // التحقق من كلمة المرور (6 أحرف على الأقل)
    errors.password = validateMinLength(password, 6, t('auth.register.validation.password_short')) || validateRequired(password, t('auth.register.validation.password_required'));
    
    // التحقق من تأكيد كلمة المرور
    errors.confirmPassword = validateMatch(confirmPassword, password, t('auth.register.validation.passwords_not_match')) || validateRequired(confirmPassword, t('auth.register.validation.confirm_password_required'));
    
    // التحقق من رقم الهاتف (تنسيق دولي مع دعم WhatsApp)
    if (!phone.trim()) {
      errors.phone = t('auth.register.validation.phone_required');
    } else {
      const phoneError = validateWhatsApp(phone, t);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }
    
    // التحقق من المدينة
    errors.city = validateRequired(city, t('auth.register.validation.city_required'));
    
    // التحقق من العنوان
    errors.address = validateRequired(address, t('auth.register.validation.address_required'));
    
    // التحقق من الدولة
    errors.country = validateRequired(country, t('auth.register.validation.country_required'));
    
    // التحقق من الرمز البريدي (اختياري ولكن إذا تم إدخاله يجب أن يكون صحيحاً)
    if (zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      errors.zipCode = t('auth.register.validation.zipCode_invalid');
    }
    
    setFormErrors(errors);
    return Object.values(errors).every((err) => !err) && !emailExists;
  }, [firstName, lastName, email, password, confirmPassword, phone, city, address, country, zipCode, emailExists, t, currentLang]);

  // التحقق من صحة البيانات أثناء الكتابة
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [validateForm]);

  // Real-time email availability check
  useEffect(() => {
    // Only check if email is valid format
    if (email && email.includes('@') && email.length >= 5) {
      const storeSlug = store?.slug || window.location.pathname.split('/')[1] || 'default';
      checkEmailAvailability(email, storeSlug);
    }
  }, [email, store?.slug, checkEmailAvailability]);
///////////////////////////////////////////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== Form Submission Started ===');
    console.log('Form validation result:', validateForm());
    console.log('isFormValid state:', isFormValid);
    console.log('loading state:', loading);
    
    if (!validateForm()) {
      console.log('Form validation failed, stopping submission');
      return;
    }
    
    console.log('Form validation passed, proceeding with submission');
    
    // Reset any previous errors using the reset function from useCreateUser
    reset();
    
    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: city.trim(),
        zipCode: zipCode.trim(),
        country: country.trim()
      };
      
      console.log('User data prepared:', userData);
      console.log('Calling createUser...');
      
      const result = await createUser(userData);
      
      console.log('createUser result:', result);
      
      if (result.success) {
        console.log('User creation successful, proceeding with OTP verification');
        
        // Save registration data to localStorage
        localStorage.setItem('register_firstName', firstName);
        localStorage.setItem('register_lastName', lastName);
        localStorage.setItem('register_phone', phone);
        localStorage.setItem('register_city', city);
        localStorage.setItem('register_address', address);
        localStorage.setItem('register_zipCode', zipCode);
        localStorage.setItem('register_country', country);
        
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(result.data));
        
        // Send OTP verification code automatically
        const storeSlug = window.location.pathname.split('/')[1] || 'default';
        console.log('Sending OTP to:', email, 'for store:', storeSlug);
        await sendOTP(email, storeSlug);
        
        // Show OTP verification component after sending OTP
        setRegistrationData(result.data);
        setShowOTP(true);
      } else {
        console.log('User creation failed:', result.error);
        // Check if error is related to email
        checkEmailFromError(result.error);
      }
    } catch (err) {
      console.error('Registration error:', err);
      // The error will be handled by the useCreateUser hook
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = async () => {
    // تسجيل الدخول تلقائياً بعد التحقق الناجح
    console.log('OTP verified successfully, auto-logging in...');
    
    try {
      const result = await login(email, password);
      
      if (result && result.success) {
        console.log('Auto-login successful, navigating to home');
        navigate('/');
      } else {
        console.log('Auto-login failed, redirecting to login page');
        navigate('/login');
      }
    } catch (err) {
      console.error('Auto-login error:', err);
      // في حالة فشل تسجيل الدخول التلقائي، نوجه للصفحة الرئيسية أو Login
      navigate('/login');
    }
  };

  // Handle OTP resend or email change
  const handleOTPResend = (newEmailAddress) => {
    // If new email provided, update the email state
    if (newEmailAddress && newEmailAddress !== email) {
      console.log('Email changed to:', newEmailAddress);
      setEmail(newEmailAddress);
    }
    console.log('OTP resent successfully');
  };

  // Handle back to registration
  const handleOTPBack = () => {
    setShowOTP(false);
    setRegistrationData(null);
  };

  // Show OTP component if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onVerificationSuccess={handleOTPSuccess}
        onResendCode={handleOTPResend}
        onBack={handleOTPBack}
      />
    );
  }

///////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
         
          <h1 className="auth-title">{t('auth.register.title')}</h1>
          <p className="auth-subtitle">{t('auth.register.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {/* المعلومات الشخصية */}
          <div className="form-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="var(--primary-color)"/>
              </svg>
              {t('auth.register.personal_info') || 'المعلومات الشخصية'}
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  
                  {t('auth.register.firstName')} <span className='required'>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('auth.register.firstName_placeholder')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  
                  {t('auth.register.lastName')} <span className='required'>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('auth.register.lastName_placeholder')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <CustomPhoneInput
                label={t('auth.register.phone')}
                value={phone}
                onChange={(value) => setPhone('+' + value)}
                error={formErrors.phone}
                required={true}
                placeholder={t('auth.register.phone_placeholder')}
                dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* معلومات العنوان */}
          <div className="form-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="var(--primary-color)"/>
              </svg>
              {t('auth.register.address_info') || 'معلومات العنوان'}
            </h3>
            
            <div className="form-group">
              <label className="form-label">
                
                {t('auth.register.country')} <span className='required'>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t('auth.register.country_placeholder')}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              {formErrors.country && <span className="error-message">{formErrors.country}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  
                  {t('auth.register.city')} <span className='required'>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('auth.register.city_placeholder')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {formErrors.city && <span className="error-message">{formErrors.city}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  
                  {t('auth.register.zipCode')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('auth.register.zipCode_placeholder')}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
                {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                
                {t('auth.register.address')} <span className='required'>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t('auth.register.address_placeholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {formErrors.address && <span className="error-message">{formErrors.address}</span>}
            </div>
          </div>

          {/* معلومات الحساب */}
          <div className="form-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="var(--primary-color)"/>
              </svg>
              {t('auth.register.account_info') || 'معلومات الحساب'}
            </h3>
            
            <div className="form-group">
              <label className="form-label">
                
                {t('auth.register.email')} <span className='required'>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className={`form-input ${emailExists ? 'error' : ''} ${emailAvailable ? 'success' : ''}`}
                  placeholder={t('auth.register.email_placeholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // إعادة تعيين خطأ البريد الإلكتروني عند تغييره
                    if (emailExists) {
                      resetEmailCheck();
                    }
                  }}
                  style={{ paddingRight: currentLang === 'ar' ? '40px' : '12px', paddingLeft: currentLang === 'ar' ? '12px' : '40px' }}
                />
                {/* Email checking indicator */}
                {isCheckingEmail && (
                  <span style={{
                    position: 'absolute',
                    [currentLang === 'ar' ? 'right' : 'left']: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#3b82f6'
                  }}>
                    <svg style={{ animation: 'spin 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}
                {/* Email available indicator */}
                {!isCheckingEmail && emailAvailable && !emailExists && email && (
                  <span style={{
                    position: 'absolute',
                    [currentLang === 'ar' ? 'right' : 'left']: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                    </svg>
                  </span>
                )}
                {/* Email exists indicator */}
                {!isCheckingEmail && emailExists && (
                  <span style={{
                    position: 'absolute',
                    [currentLang === 'ar' ? 'right' : 'left']: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ef4444'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                  </span>
                )}
              </div>
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              {emailError && !formErrors.email && <span className="error-message">{emailError}</span>}
              
              {/* Email Available - Simple green checkmark */}
              {!formErrors.email && !emailError && emailAvailable && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: '#10b981', 
                  fontSize: '0.875rem', 
                  marginTop: '6px' 
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  </svg>
                  <span>{currentLang === 'ar' ? 'البريد الإلكتروني متاح' : 'Email is available'}</span>
                </div>
              )}
              
              {/* Existing Accounts Info */}
              {!formErrors.email && existingAccounts && existingAccounts.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: '#991b1b',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    <span>
                      {currentLang === 'ar' 
                        ? `هذا البريد مسجل في ${existingAccounts.length} ${existingAccounts.length === 1 ? 'متجر' : 'متاجر'}`
                        : `This email is registered in ${existingAccounts.length} ${existingAccounts.length === 1 ? 'store' : 'stores'}`
                      }
                    </span>
                  </div>
                  
                  {existingAccounts.map((account, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '10px',
                        marginBottom: index < existingAccounts.length - 1 ? '8px' : '0',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        border: '1px solid #fee2e2',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}>
                          <span style={{ 
                            fontWeight: '600', 
                            color: '#1f2937',
                            fontSize: '0.875rem'
                          }}>
                            {account.storeName}
                          </span>
                          {account.isActive && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {currentLang === 'ar' ? 'نشط' : 'Active'}
                            </span>
                          )}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '4px',
                          color: '#6b7280' 
                        }}>
                          <span style={{ fontWeight: '500' }}>
                            {currentLang === 'ar' ? 'الدور:' : 'Role:'}
                          </span>
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: account.role === 'admin' ? '#dbeafe' : '#e0e7ff',
                            color: account.role === 'admin' ? '#1e40af' : '#4338ca',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {account.role === 'admin' 
                              ? (currentLang === 'ar' ? 'مدير' : 'Admin')
                              : account.role === 'wholesaler'
                              ? (currentLang === 'ar' ? 'تاجر جملة' : 'Wholesaler')
                              : (currentLang === 'ar' ? 'عميل' : 'Customer')
                            }
                          </span>
                        </div>
                        
                        {account.redirectUrl && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={account.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#3b82f6',
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                              </svg>
                              {currentLang === 'ar' ? 'الذهاب إلى المتجر' : 'Go to Store'}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '0.8125rem',
                    color: '#92400e',
                    textAlign: 'center'
                  }}>
                    {currentLang === 'ar' 
                      ? 'إذا كنت ترغب في التسجيل في متجر مختلف، استخدم بريد إلكتروني آخر'
                      : 'If you want to register in a different store, use another email'
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  
                  {t('auth.register.password')} <span className='required'>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={t('auth.register.password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {formErrors.password && <span className="error-message">{formErrors.password}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                 
                  {t('auth.register.confirm_password')} <span className='required'>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={t('auth.register.confirm_password_placeholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`submit-button ${(!isFormValid || isCheckingEmail || emailExists) ? 'disabled' : ''}`} 
            disabled={loading || !isFormValid || isCheckingEmail || emailExists}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('auth.register.creating') || 'جاري الإنشاء...'}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                </svg>
                {t('auth.register.submit')}
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>{t('auth.register.have_account')}</span>
          <button onClick={() => navigate('/login')} className="auth-link">
            {t('auth.register.signin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;