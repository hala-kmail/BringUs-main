import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import './Auth.css';
import { validateRequired, validatePhone, validateEmail, validateMinLength, validateMatch } from '../../utils/validation';
import { useCreateUser } from '../../hooks/useCreateUser';
import { useCheckEmail } from '../../hooks/useCheckEmail';
import { useAppData } from '../../contexts/AppDataContext';
import OTPVerification from './OTPVerification';

const Register = () => {
  const { t } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { createUser, loading, error, reset } = useCreateUser();
  const { checkEmailFromError, emailExists, emailError, reset: resetEmailCheck } = useCheckEmail();
  const { store } = useAppData();
  
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
    
    // التحقق من رقم الهاتف (تنسيق دولي)
    if (!phone.trim()) {
      errors.phone = t('auth.register.validation.phone_required');
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.trim())) {
      errors.phone = t('auth.register.validation.phone_invalid');
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
        
        // Show OTP verification component directly since backend sends OTP automatically
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
  const handleOTPSuccess = () => {
    // التوجيه إلى صفحة تسجيل الدخول بعد التحقق الناجح
    navigate('/login');
  };

  // Handle OTP resend
  const handleOTPResend = () => {
    // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 9H14V4H5V21H19V9Z" fill="var(--primary-color)"/>
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 9H14V4H5V21H19V9Z" fill="var(--primary-color)"/>
                  </svg>
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
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="var(--primary-color)"/>
                </svg>
                {t('auth.register.phone')} <span className='required'>*</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder={t('auth.register.phone_placeholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="var(--primary-color)"/>
                </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="var(--primary-color)"/>
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="var(--primary-color)"/>
                  </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="var(--primary-color)"/>
                </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="var(--primary-color)"/>
                </svg>
                {t('auth.register.email')} <span className='required'>*</span>
              </label>
              <input
                type="email"
                className={`form-input ${emailExists ? 'error' : ''}`}
                placeholder={t('auth.register.email_placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // إعادة تعيين خطأ البريد الإلكتروني عند تغييره
                  if (emailExists) {
                    resetEmailCheck();
                  }
                }}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              {emailError && !formErrors.email && <span className="error-message">{emailError}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="var(--primary-color)"/>
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="var(--primary-color)"/>
                  </svg>
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
            className={`submit-button ${!isFormValid ? 'disabled' : ''}`} 
            disabled={loading || !isFormValid}
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
          <button onClick={() => navigate('/home')} className="auth-link">
            {t('auth.register.signin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;