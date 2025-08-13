import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';
import { useTranslation } from 'react-i18next';
import './Auth.css';
import { validateRequired, validatePhone, validateEmail, validateMinLength, validateMatch } from '../../utils/validation';
import { useCreateUser } from '../../hooks/useCreateUser';
import { useCheckEmail } from '../../hooks/useCheckEmail';
import { useAppData } from '../../contexts/AppDataContext';

const Register = () => {
  const { t } = useTranslation();
  const { navigate } = useAffiliateNavigation();
  const { createUser, loading, error, reset } = useCreateUser();
  const { checkEmailFromError, emailExists, emailError, reset: resetEmailCheck } = useCheckEmail();
  const { store } = useAppData();
  
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
    if (!validateForm()) return;

    // تحضير بيانات المستخدم
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: city.trim(),
      zipCode: zipCode.trim(),
      country: country.trim()
    };

    // استدعاء API لإنشاء المستخدم
    const result = await createUser(userData);
    
    if (result.success) {
      // حفظ البيانات في localStorage للاستخدام اللاحق
      localStorage.setItem('register_firstName', firstName);
      localStorage.setItem('register_lastName', lastName);
      localStorage.setItem('register_phone', phone);
      localStorage.setItem('register_city', city);
      localStorage.setItem('register_address', address);
      localStorage.setItem('register_zipCode', zipCode);
      localStorage.setItem('register_country', country);
      
      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem('user', JSON.stringify(result.data));
      
      // التوجيه إلى الصفحة الرئيسية أو صفحة تسجيل الدخول
      navigate('/login');
    } else {
      // التحقق من البريد الإلكتروني إذا كان الخطأ متعلق به
      checkEmailFromError(result.error);
    }
  };
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
          <div className="form-group">
            <label className="form-label">{t('auth.register.firstName')} <span className='required'>*</span></label>
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
            <label className="form-label">{t('auth.register.lastName')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.lastName_placeholder')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.register.phone')} <span className='required'>*</span></label>
            <input
              type="tel"
              className="form-input"
              placeholder={t('auth.register.phone_placeholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
          </div>

          {/* معلومات العنوان */}
          <div className="form-group">
            <label className="form-label">{t('auth.register.country')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.country_placeholder')}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            {formErrors.country && <span className="error-message">{formErrors.country}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.city')} <span className='required'>*</span></label>
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
            <label className="form-label">{t('auth.register.address')} <span className='required'>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.address_placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {formErrors.address && <span className="error-message">{formErrors.address}</span>}
          </div>
         
          <div className="form-group">
            <label className="form-label">{t('auth.register.zipCode')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.register.zipCode_placeholder')}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.register.email')} <span className='required'>*</span></label>
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
          <div className="form-group">
            <label className="form-label">{t('auth.register.password')} <span className='required'>*</span></label>
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
            <label className="form-label">{t('auth.register.confirm_password')} <span className='required'>*</span></label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.register.confirm_password_placeholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
          </div>


          <button 
            type="submit" 
            className={`submit-button ${!isFormValid ? 'disabled' : ''}`} 
            disabled={loading || !isFormValid}
          >
            {loading ? t('auth.register.creating') || 'جاري الإنشاء...' : t('auth.register.submit')}
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