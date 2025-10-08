import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './CustomPhoneInput.css';

/**
 * CustomPhoneInput - مكون مخصص لإدخال أرقام الهاتف الدولية
 * 
 * @param {Object} props
 * @param {string} props.label - تسمية الحقل
 * @param {string} props.value - قيمة رقم الهاتف
 * @param {function} props.onChange - دالة التغيير
 * @param {string} props.error - رسالة الخطأ
 * @param {boolean} props.required - هل الحقل مطلوب
 * @param {string} props.placeholder - النص التوضيحي
 * @param {boolean} props.disabled - تعطيل الحقل
 * @param {string} props.dir - اتجاه النص (rtl/ltr)
 */
const CustomPhoneInput = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = '',
  disabled = false,
  dir = 'ltr'
}) => {
  return (
    <div className={`custom-phone-input-wrapper ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      {label && (
        <label className="custom-phone-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      
      <PhoneInput
        country={'ps'} // فلسطين كدولة افتراضية
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        enableSearch={true}
        searchPlaceholder="بحث..."
        containerClass={`phone-input-container ${error ? 'has-error' : ''}`}
        inputClass="phone-input-field"
        buttonClass="phone-input-button"
        dropdownClass="phone-input-dropdown"
        searchClass="phone-input-search"
        preferredCountries={['ps', 'il', 'jo', 'eg', 'sa', 'ae']}
        localization={{
          Palestine: 'فلسطين',
          Israel: 'إسرائيل',
          Jordan: 'الأردن',
          Egypt: 'مصر',
          'Saudi Arabia': 'السعودية',
          'United Arab Emirates': 'الإمارات'
        }}
        inputProps={{
          required: required,
          autoComplete: 'tel'
        }}
        isValid={(inputNumber, country, countries) => {
          // التحقق الأساسي من الطول
          const countryCode = country.dialCode;
          const numberWithoutCode = inputNumber.slice(countryCode.length);
          
          // التحقق الخاص بالأرقام الفلسطينية والإسرائيلية
          if (countryCode === '970' || countryCode === '972') {
            // يجب أن يكون الطول 12 رقم (970 + 9 أرقام)
            if (inputNumber.length !== 12) return false;
            // يجب ألا يبدأ بصفر بعد كود الدولة
            if (numberWithoutCode.startsWith('0')) return false;
          }
          
          return true;
        }}
      />
      
      {error && (
        <span className="custom-phone-error">{error}</span>
      )}
      
      <style jsx>{`
        .custom-phone-input-wrapper {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .custom-phone-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-family: 'Tajawal', sans-serif;
        }
        
        .required-asterisk {
          color: #ef4444;
        }
        
        .custom-phone-error {
          display: block;
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 0.25rem;
          font-family: 'Tajawal', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default CustomPhoneInput;


