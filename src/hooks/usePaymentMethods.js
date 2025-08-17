import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { PAYMENT_API_CONFIG, CURRENCY_CONVERSION } from '../contexts/payment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { store } = useAppData();
  const hasInitialized = useRef(false);
  const currentStoreId = useRef(null);

  // Get store ID from localStorage or store context
  const getStoreId = useCallback(() => {
    if (store && store._id) {
      return store._id;
    }
    
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        const parsedStore = JSON.parse(storedStore);
        return parsedStore._id;
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    
    return null;
  }, [store]);


  // amount: '',
  // email: '',
  // currency: 'USD',
  // first_name: '',
  // last_name: '',
  // callback_url: PAYMENT_API_CONFIG.CALLBACK_URL,
  // metadata: JSON.stringify({ storeId, userId })
  // Initialize Lahza payment
  const initializeLahzaPayment = useCallback(async (orderData) => {
    try {
      console.log('Initializing Lahza payment for order:', orderData);
      
      // Get store data for Lahza configuration
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?.settings?.lahzaToken) {
        throw new Error('Lahza token not configured for this store');
      }
      console.log('storeData', storeData?.settings?.lahzaToken);

      // Prepare payment data for Lahza
      const paymentData = {
        amount: Math.round(orderData.total * CURRENCY_CONVERSION[orderData.currency || 'ILS']), // Convert to smallest unit
        currency: orderData.currency || 'ILS',
        email: orderData.email,
        first_name: orderData.customerInfo.firstName,
        last_name: orderData.customerInfo.lastName,
        // customer: {
        //   name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        //   email: orderData.customerInfo.email || 'customer@example.com',
        //   phone: orderData.customerInfo.phone
        // },
        callback_url: PAYMENT_API_CONFIG.CALLBACK_URL,
        metadata: {
          store_id: storeData._id,
          order_type: orderData.deliveryMethod,
          customer_address: orderData.customerInfo.address
        }
      };

      console.log('Lahza payment data:', paymentData);

      // Initialize payment with Lahza API
      const response = await fetch(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.CHARGES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('Lahza payment response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to initialize Lahza payment');
      }

      // Check if the response contains the payment URL
      if ((result.success || result.status) && result.data) {
        // Look for payment URL in different possible locations
        const paymentUrl = result.data.payment_url || result.data.url || result.data.checkout_url || result.data.redirect_url || result.data.authorization_url;
        
        if (paymentUrl) {
          return {
            success: true,
            paymentUrl: paymentUrl,
            transactionId: result.data.transaction_id || result.data.id,
            paymentData: result.data
          };
        } else {
          console.error('Payment URL not found in response:', result);
          throw new Error('Payment URL not found in response');
        }
      } else {
        throw new Error(result.message || 'Invalid response from Lahza');
      }
    } catch (error) {
      console.error('Error initializing Lahza payment:', error);
      throw error;
    }
  }, []);

  // Verify Lahza payment
  const verifyLahzaPayment = useCallback(async (transactionId) => {
    try {
      console.log('Verifying Lahza payment for transaction:', transactionId);
      
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?.settings?.lahzaToken) {
        throw new Error('Lahza token not configured for this store');
      }

      const response = await fetch(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY}/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`
        }
      });

      const result = await response.json();
      console.log('Lahza verification response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify Lahza payment');
      }

      return {
        success: result.success,
        paymentStatus: result.data?.status,
        paymentData: result.data
      };
    } catch (error) {
      console.error('Error verifying Lahza payment:', error);
      throw error;
    }
  }, []);

  // Verify payment by reference
  const verifyPayment = useCallback(async (reference) => {
    try {
      console.log('Verifying payment for reference:', reference);
      
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?.settings?.lahzaToken) {
        throw new Error('Lahza token not configured for this store');
      }

      const response = await fetch(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY}/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`
        }
      });

      const result = await response.json();
      console.log('Payment verification response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify payment');
      }

      return {
        success: result.success,
        paymentStatus: result.data?.status,
        paymentData: result.data
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }, []);

  // Fetch payment methods for a specific store
  const fetchPaymentMethods = useCallback(async () => {
    const storeId = getStoreId();
    
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/payment-methods/store/${storeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment methods');
      }

      if (data.success && data.data) {
        // Filter only active payment methods
        const activeMethods = data.data.filter(method => method.isActive);
        setPaymentMethods(activeMethods);
        console.log('Payment methods loaded:', activeMethods);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getStoreId]);

  useEffect(() => {
    const storeId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (storeId && (!hasInitialized.current || currentStoreId.current !== storeId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Initializing payment methods for store ID:', storeId);
      }
      hasInitialized.current = true;
      currentStoreId.current = storeId;
      fetchPaymentMethods();
    } else if (!storeId && paymentMethods.length > 0) {
      // Clear payment methods if no store is available
      if (process.env.NODE_ENV === 'development') {
        console.log('No store available, clearing payment methods');
      }
      setPaymentMethods([]);
      hasInitialized.current = false;
      currentStoreId.current = null;
    }
  }, [store?._id, getStoreId, fetchPaymentMethods, paymentMethods.length]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
    initializeLahzaPayment,
    verifyLahzaPayment,
    verifyPayment
  };
};

export default usePaymentMethods; 