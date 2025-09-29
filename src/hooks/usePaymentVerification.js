import { useState, useEffect, useRef } from 'react';
import { PAYMENT_API_CONFIG } from '../contexts/payment';

const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const hasChecked = useRef(false);

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
      console.log('Payment status:', data.data?.status);

      const result = {
        success: true,
        status: 'unknown',
        message: 'Payment verification completed',
        data: data
      };

      // تحليل حالة الدفع من الاستجابة
      if (data.data) {
        const paymentData = data.data;
        
        // Handle Lahza API specific status values
        if (paymentData.status === 'success' || paymentData.status === 'CAPTURED' || paymentData.status === 'SUCCESS' || paymentData.status === 'COMPLETED') {
          result.status = 'success';
          result.message = 'Payment completed successfully';
        } else if (paymentData.status === 'pending' || paymentData.status === 'PENDING' || paymentData.status === 'INITIATED' || paymentData.status === 'AUTHORIZED') {
          result.status = 'pending';
          result.message = 'Payment is still pending';
        } else if (paymentData.status === 'failed' || paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED' || paymentData.status === 'DECLINED' || paymentData.status === 'VOIDED') {
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

  // التحقق التلقائي عند تحميل الصفحة - مرة واحدة فقط
  useEffect(() => {
    if (hasChecked.current) {
      return; // لا تتحقق مرة أخرى
    }

    const checkPayment = async () => {
      hasChecked.current = true; // علامة أن التحقق تم
      
      const result = await checkPaymentFromURL();
      
      if (result) {
        if (result.status === 'success') {
          // إزالة reference من localStorage بعد التحقق الناجح
          localStorage.removeItem('lahza_reference');
          console.log('✅ Payment verification successful:', result);
        } else if (result.status === 'failed') {
          console.log('❌ Payment verification failed:', result);
          console.log('Payment status:', result.data?.data?.status);
          console.log('Full response:', result.data);
        } else if (result.status === 'pending') {
          console.log('⏳ Payment is still pending:', result);
          console.log('Payment status:', result.data?.data?.status);
        } else {
          console.log('❓ Unknown payment status:', result);
          console.log('Payment status:', result.data?.data?.status);
          console.log('Full response:', result.data);
        }
      }
    };

    checkPayment();
  }, []); // dependency array فارغ = يعمل مرة واحدة فقط

  return {
    verifyPayment,
    checkPaymentFromURL,
    isVerifying,
    verificationResult
  };
};

export default usePaymentVerification;
