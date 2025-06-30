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

// يمكنك إضافة دوال أخرى مثل validateEmail, validateMinLength ...الخ 