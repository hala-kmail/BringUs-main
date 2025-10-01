import { useState, useEffect, useRef } from 'react';
import { PAYMENT_API_CONFIG } from '../contexts/payment';

const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

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
     
      
      if (data.status === true) {
        // إذا كان API يعيد status: true، فهذا يعني نجاح الدفع
        result.status = 'success';
        result.message = 'Payment completed successfully';
       
      } else if (data.status === false) {
        // إذا كان API يعيد status: false، فهذا يعني فشل الدفع
        result.status = 'failed';
        result.message = 'Payment failed';
       
      } else if (data.data) {
        const paymentData = data.data;
        console.log('🔍 Payment data details:', paymentData);
        
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
    const reference = urlParams.get('reference') || urlParams.get('trxref') || urlParams.get('tap_id') || urlParams.get('transaction_id') || urlParams.get('id');
    
    if (!reference) {
      return null;
    }

  
    // حفظ reference في localStorage إذا لم يكن موجوداً
    if (!localStorage.getItem('lahza_reference')) {
      localStorage.setItem('lahza_reference', reference);
    }

    return await verifyPayment(reference);
  };

  const clearPaymentParams = () => {
    // تنظيف URL من معاملات الدفع
    const url = new URL(window.location);
    url.searchParams.delete('reference');
    url.searchParams.delete('trxref');
    url.searchParams.delete('tap_id');
    url.searchParams.delete('transaction_id');
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url);
    
    // تنظيف localStorage
    localStorage.removeItem('lahza_reference');
  };

  // التحقق التلقائي عند تحميل الصفحة - معطل للسماح للتحكم اليدوي
  // useEffect(() => {
  //   // منع إعادة التشغيل إذا تم التحقق بالفعل
  //   if (hasChecked) {
  //     return;
  //   }

  //   const checkPayment = async () => {
  //     try {
  //       const result = await checkPaymentFromURL();
  //       if (result) {
  //         console.log('📊 Payment verification result:', result);
  //         // لا ننظف المعاملات هنا - نتركها للفحص اليدوي
  //         // سيتم تنظيفها لاحقاً عند إغلاق بوب أب الفحص
  //       }
  //       setHasChecked(true);
  //     } catch (error) {
  //       console.error('Error in payment check:', error);
  //       // تنظيف المعاملات عند حدوث خطأ لتجنب الحلقة اللانهائية
  //       clearPaymentParams();
  //       setHasChecked(true);
  //     }
  //   };

  //   checkPayment();
  // }, [hasChecked]);

  return {
    verifyPayment,
    checkPaymentFromURL,
    clearPaymentParams,
    isVerifying,
    verificationResult,
    hasChecked
  };
};

export default usePaymentVerification;
