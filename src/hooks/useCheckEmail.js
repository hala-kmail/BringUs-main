import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api';

export const useCheckEmail = () => {
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [existingAccounts, setExistingAccounts] = useState([]);
  const debounceTimer = useRef(null);
  const abortController = useRef(null);

  // دالة للتحقق من توفر البريد الإلكتروني في الوقت الفعلي
  const checkEmailAvailability = useCallback(async (email, storeSlug) => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Reset states immediately when email changes
    setEmailExists(false);
    setEmailError(null);
    setEmailAvailable(false);
    setExistingAccounts([]);

    // Basic email validation before API call
    if (!email || !email.includes('@') || email.length < 5) {
      setIsCheckingEmail(false);
      return;
    }

    // Debounce the API call (wait 500ms after user stops typing)
    return new Promise((resolve) => {
      debounceTimer.current = setTimeout(async () => {
        try {
          setIsCheckingEmail(true);
          
          // Create new abort controller for this request
          abortController.current = new AbortController();
          
          console.log('🔍 Checking email availability:', email, 'for store:', storeSlug);
          
          const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
              storeSlug: storeSlug || 'default'
            }),
            signal: abortController.current.signal
          });

          const data = await response.json();
          
          if (response.ok) {
            // 200 means email is available (not taken)
            console.log('✅ Email is available');
            setEmailExists(false);
            setEmailError(null);
            setEmailAvailable(true);
            setExistingAccounts([]);
            resolve({ available: true, exists: false });
          } else if (response.status === 400 || response.status === 409) {
            // 400 or 409 means email already exists
            console.log('❌ Email already exists', data);
            setEmailExists(true);
            setEmailError(data.messageAr || data.message || 'البريد الإلكتروني مستخدم بالفعل');
            setEmailAvailable(false);
            setExistingAccounts(data.accounts || []);
            resolve({ 
              available: false, 
              exists: true, 
              accounts: data.accounts || [],
              totalAccounts: data.totalAccounts || 0
            });
          } else {
            // Other errors
            console.warn('⚠️ Email check returned unexpected status:', response.status);
            setEmailExists(false);
            setEmailError(null);
            setEmailAvailable(false);
            setExistingAccounts([]);
            resolve({ available: false, exists: false, error: data.message });
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('🔄 Email check aborted (new request started)');
          } else {
            console.error('❌ Error checking email:', error);
            setEmailExists(false);
            setEmailError(null);
            setEmailAvailable(false);
            setExistingAccounts([]);
          }
          resolve({ available: false, exists: false, error: error.message });
        } finally {
          setIsCheckingEmail(false);
        }
      }, 500); // Wait 500ms after user stops typing
    });
  }, []);

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
    // Cancel any pending requests
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setEmailExists(false);
    setEmailError(null);
    setIsCheckingEmail(false);
    setEmailAvailable(false);
    setExistingAccounts([]);
  };

  return {
    checkEmailAvailability,
    checkEmailFromError,
    emailExists,
    emailError,
    isCheckingEmail,
    emailAvailable,
    existingAccounts,
    reset
  };
}; 