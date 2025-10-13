/**
 * Utility functions for handling bilingual error messages
 */

/**
 * Get the appropriate error message based on current language
 * @param {string} currentLang - Current language ('ar' or 'en')
 * @param {string} errorEn - English error message
 * @param {string} errorAr - Arabic error message  
 * @returns {string} - The appropriate error message
 */
export const getLocalizedError = (currentLang, errorEn, errorAr) => {
  if (currentLang === 'ar') {
    return errorAr || errorEn || 'حدث خطأ';
  }
  return errorEn || errorAr || 'An error occurred';
};

/**
 * Extract bilingual error messages from API response
 * @param {Object} data - API response data
 * @param {string} defaultEn - Default English error message
 * @param {string} defaultAr - Default Arabic error message
 * @returns {Object} - Object with error and errorAr properties
 */
export const extractBilingualError = (data, defaultEn = 'An error occurred', defaultAr = 'حدث خطأ') => {
  return {
    error: data.message || defaultEn,
    errorAr: data.messageAr || defaultAr
  };
};

/**
 * Common error messages in both languages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    en: 'Network error. Please try again.',
    ar: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.'
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password',
    ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
  },
  LOGIN_FAILED: {
    en: 'Login failed. Please try again.',
    ar: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  },
  EMAIL_NOT_VERIFIED: {
    en: 'Email is not verified',
    ar: 'البريد الإلكتروني غير مُحقق'
  },
  USER_NOT_FOUND: {
    en: 'User not found with this email',
    ar: 'المستخدم غير موجود بهذا البريد الإلكتروني'
  },
  GENERIC_ERROR: {
    en: 'An error occurred',
    ar: 'حدث خطأ'
  }
};

