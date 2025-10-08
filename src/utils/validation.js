// تحقق من الحقل الإجباري
export function validateRequired(value, errorMsg) {
  if (!value || !value.trim()) return errorMsg;
  return '';
}

// تحقق من رقم الهاتف (دولي)
export function validatePhone(value, errorMsg) {
  if (!/^[0-9+\-\s()]{10,}$/.test(value.trim())) return errorMsg;
  return '';
}

// تحقق من البريد الإلكتروني
export function validateEmail(value, errorMsg) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())) return errorMsg;
  return '';
}

// تحقق من الطول الأدنى
export function validateMinLength(value, min, errorMsg) {
  if (!value || value.length < min) return errorMsg;
  return '';
}

// تحقق من التطابق (مثلاً كلمة المرور والتأكيد)
export function validateMatch(value, matchTo, errorMsg) {
  if (value !== matchTo) return errorMsg;
  return '';
}

// تنظيف وفحص رقم الهاتف بنفس منطق صفحة التشيك أوت
export function validateAndSanitizePhone(value, errorMsg) {
  let sanitized = value.replace(/[^0-9+]/g, '');
  if (sanitized && sanitized[0] !== '+') {
    sanitized = '+' + sanitized.replace(/^\++/, '');
  }
  if (sanitized.startsWith('+')) {
    const digits = sanitized.slice(1).replace(/[^0-9]/g, '');
    sanitized = '+' + digits.slice(0, 15);
  } else {
    sanitized = sanitized.slice(0, 15);
  }
  let error = '';
  if (!/^\+[0-9]{10,15}$/.test(sanitized)) {
    error = errorMsg;
  }
  return { sanitized, error };
}

/**
 * التحقق من صحة رقم WhatsApp/الهاتف الدولي
 * دعم خاص للأرقام الفلسطينية (970) والإسرائيلية (972)
 * 
 * @param {string} phoneNumber - رقم الهاتف بصيغة دولية (مع أو بدون +)
 * @param {function} t - دالة الترجمة من i18next
 * @returns {string} - رسالة الخطأ أو سلسلة فارغة إذا كان الرقم صحيح
 */
export function validateWhatsApp(phoneNumber, t) {
  // إزالة المسافات والأحرف غير الرقمية (ماعدا +)
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // التحقق من أن الرقم يبدأ بـ +
  if (!cleanedNumber.startsWith('+')) {
    return t('store.whatsappInvalidFormat');
  }
  
  // استخراج كود الدولة والرقم الباقي
  const numberWithoutPlus = cleanedNumber.slice(1); // إزالة +
  
  // التحقق من أن جميع الحروف أرقام
  if (!/^\d+$/.test(numberWithoutPlus)) {
    return t('store.whatsappInvalidDigits');
  }
  
  // استخراج كود الدولة (أول 3 أرقام)
  const countryCode = numberWithoutPlus.slice(0, 3);
  const restOfNumber = numberWithoutPlus.slice(3);
  
  // التحقق الخاص بالأرقام الفلسطينية (970) والإسرائيلية (972)
  if (countryCode === '970' || countryCode === '972') {
    // التحقق من الطول الكلي (يجب أن يكون 12 رقم: 970 + 9 أرقام)
    if (numberWithoutPlus.length !== 12) {
      return t('store.whatsappLengthError');
    }
    
    // التحقق من عدم البدء بصفر بعد كود الدولة
    if (restOfNumber.startsWith('0')) {
      return t('store.whatsappNoLeadingZero');
    }
  } else {
    // للأرقام الدولية الأخرى: التحقق من الطول (8-15 رقم)
    if (numberWithoutPlus.length < 8 || numberWithoutPlus.length > 15) {
      return t('store.whatsappLengthError');
    }
  }
  
  // إذا وصلنا هنا، الرقم صحيح
  return '';
}

/**
 * تنظيف رقم الهاتف للتأكد من صحة التنسيق
 * @param {string} phoneNumber - رقم الهاتف
 * @returns {string} - رقم الهاتف المنظف
 */
export function sanitizePhoneNumber(phoneNumber) {
  // إزالة كل شيء ماعدا الأرقام و +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // التأكد من وجود + في البداية
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/^\++/, '');
  }
  
  return cleaned;
}

// يمكنك إضافة دوال أخرى مثل validateEmail, validateMinLength ...الخ 