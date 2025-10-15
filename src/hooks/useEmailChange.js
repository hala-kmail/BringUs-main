import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

const useEmailChange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorAr, setErrorAr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [successMessageAr, setSuccessMessageAr] = useState(null);
  const token = getBearerToken();

  /**
   * Request email change by userId (no auth required)
   * Sends OTP to the new email address
   */
  const requestEmailChangeByUserId = useCallback(async (userId, newEmail) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/request-email-change-by-userid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Verification code sent to new email');
        setSuccessMessageAr(result.messageAr || 'تم إرسال رمز التحقق إلى البريد الإلكتروني الجديد');
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
  }, []);

  /**
   * Request email change (requires auth)
   * Sends OTP to the new email address
   */
  const requestEmailChange = useCallback(async (newEmail) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Verification code sent to new email');
        setSuccessMessageAr(result.messageAr || 'تم إرسال رمز التحقق إلى البريد الإلكتروني الجديد');
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

  /**
   * Verify email change by userId (no auth required)
   * Verifies the OTP and updates the email
   */
  const verifyEmailChangeByUserId = useCallback(async (userId, otp) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/verify-email-change-by-userid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Email changed successfully');
        setSuccessMessageAr(result.messageAr || 'تم تغيير البريد الإلكتروني بنجاح');
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
  }, []);

  /**
   * Verify email change (requires auth)
   * Verifies the OTP and updates the email
   */
  const verifyEmailChange = useCallback(async (otp) => {
    setLoading(true);
    setError(null);
    setErrorAr(null);
    setSuccess(false);
    setSuccessMessage(null);
    setSuccessMessageAr(null);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          otp
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Email changed successfully');
        setSuccessMessageAr(result.messageAr || 'تم تغيير البريد الإلكتروني بنجاح');
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
    requestEmailChangeByUserId,
    requestEmailChange,
    verifyEmailChangeByUserId,
    verifyEmailChange,
    reset
  };
};

export default useEmailChange;


