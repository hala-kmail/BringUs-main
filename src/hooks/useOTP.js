import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorAr, setErrorAr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [successMessageAr, setSuccessMessageAr] = useState(null);
  const token = getBearerToken();

  const sendOTP = useCallback(async (email, storeSlug) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          storeSlug
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Verification code sent successfully');
        setSuccessMessageAr(result.messageAr || 'تم إرسال رمز التحقق بنجاح');
        return { 
          success: true, 
          data: result.data,
          message: result.message,
          messageAr: result.messageAr
        };
      } else {
        setError(result.message || 'Failed to send verification code');
        setErrorAr(result.messageAr || 'فشل إرسال رمز التحقق');
        return { 
          success: false, 
          error: result.message,
          errorAr: result.messageAr
        };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      const errorMessageAr = 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setErrorAr(errorMessageAr);
      return { 
        success: false, 
        error: errorMessage,
        errorAr: errorMessageAr
      };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const verifyOTP = useCallback(async (email, otp, storeSlug = null) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const requestBody = {
        email,
        otp
      };
      
      // Include storeSlug if provided to verify for specific store
      if (storeSlug) {
        requestBody.storeSlug = storeSlug;
      }

      const response = await fetch(`${API_BASE_URL}/email-verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Verification successful');
        setSuccessMessageAr(result.messageAr || 'تم التحقق بنجاح');
        return { 
          success: true, 
          data: result.data,
          message: result.message,
          messageAr: result.messageAr
        };
      } else {
        setError(result.message || 'Verification failed');
        setErrorAr(result.messageAr || 'فشل التحقق');
        return { 
          success: false, 
          error: result.message,
          errorAr: result.messageAr
        };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      const errorMessageAr = 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setErrorAr(errorMessageAr);
      return { 
        success: false, 
        error: errorMessage,
        errorAr: errorMessageAr
      };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const resendOTP = useCallback(async (email, storeSlug) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          storeSlug
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Verification code resent successfully');
        setSuccessMessageAr(result.messageAr || 'تم إعادة إرسال رمز التحقق بنجاح');
        return { 
          success: true, 
          data: result.data,
          message: result.message,
          messageAr: result.messageAr
        };
      } else {
        setError(result.message || 'Failed to resend verification code');
        setErrorAr(result.messageAr || 'فشل إعادة إرسال رمز التحقق');
        return { 
          success: false, 
          error: result.message,
          errorAr: result.messageAr
        };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      const errorMessageAr = 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setErrorAr(errorMessageAr);
      return { 
        success: false, 
        error: errorMessage,
        errorAr: errorMessageAr
      };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);
  }, []);

  return {
    loading,
    error,
    errorAr,
    success,
    successMessage,
    successMessageAr,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset
  };
};

export default useOTP;
