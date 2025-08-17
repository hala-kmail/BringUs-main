import { useState, useEffect } from 'react';
import { PAYMENT_API_CONFIG } from '../contexts/payment';

const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const verifyPayment = async (reference) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY}/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Payment verification response:', data);

      const result = {
        success: true,
        status: 'unknown',
        message: 'Payment verification completed',
        data: data
      };

      // تحليل حالة الدفع من الاستجابة
      if (data.data) {
        const paymentData = data.data;
        
        if (paymentData.status === 'CAPTURED' || paymentData.status === 'SUCCESS' || paymentData.status === 'COMPLETED') {
          result.status = 'success';
          result.message = 'Payment completed successfully';
        } else if (paymentData.status === 'PENDING' || paymentData.status === 'INITIATED' || paymentData.status === 'AUTHORIZED') {
          result.status = 'pending';
          result.message = 'Payment is still pending';
        } else if (paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED' || paymentData.status === 'DECLINED' || paymentData.status === 'VOIDED') {
          result.status = 'failed';
          result.message = 'Payment failed or was cancelled';
        }
      }

      setVerificationResult(result);
      return result;

    } catch (error) {
      console.error('Payment verification error:', error);
      
      const result = {
        success: false,
        status: 'unknown',
        message: `Verification failed: ${error.message}`
      };

      setVerificationResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  const checkPaymentFromURL = async () => {
    // التحقق من وجود reference في URL
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('tap_id') || urlParams.get('transaction_id') || urlParams.get('id');
    
    if (!reference) {
      return null;
    }

    // حفظ reference في localStorage إذا لم يكن موجوداً
    if (!localStorage.getItem('lahza_reference')) {
      localStorage.setItem('lahza_reference', reference);
    }

    return await verifyPayment(reference);
  };

  // التحقق التلقائي عند تحميل الصفحة
  useEffect(() => {
    const checkPayment = async () => {
      const result = await checkPaymentFromURL();
      if (result && result.status === 'success') {
        // إزالة reference من localStorage بعد التحقق الناجح
        localStorage.removeItem('lahza_reference');
      }
    };

    checkPayment();
  }, []);

  return {
    verifyPayment,
    checkPaymentFromURL,
    isVerifying,
    verificationResult
  };
};

export default usePaymentVerification;
