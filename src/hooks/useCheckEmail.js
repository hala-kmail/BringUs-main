import { useState } from 'react';

export const useCheckEmail = () => {
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // دالة للتحقق من البريد الإلكتروني بناءً على رسالة الخطأ من API التسجيل
  const checkEmailFromError = (errorMessage) => {
    if (errorMessage && (
      errorMessage.includes('email') || 
      errorMessage.includes('البريد الإلكتروني') ||
      errorMessage.includes('Email') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('مستخدم بالفعل')
    )) {
      setEmailExists(true);
      setEmailError('البريد الإلكتروني مستخدم بالفعل');
      return true;
    }
    return false;
  };

  const reset = () => {
    setEmailExists(false);
    setEmailError(null);
  };

  return {
    checkEmailFromError,
    emailExists,
    emailError,
    reset
  };
}; 