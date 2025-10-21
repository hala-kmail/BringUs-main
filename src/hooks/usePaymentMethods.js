import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { PAYMENT_API_CONFIG, CURRENCY_CONVERSION, getCallbackUrl } from '../contexts/payment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api';

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


  // Initialize Lahza payment - NOW USING SECURE BACKEND WITH ORDER CREATION
  const initializeLahzaPayment = useCallback(async (fullOrderData) => {
    try {
      console.log('🔒 Initializing Lahza payment via backend with full order data');
      
      // Get store data
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?._id) {
        throw new Error('Store information not available');
      }

      // Prepare payment data for backend
      const paymentData = {
        // Payment info
        amount: fullOrderData.total, // Backend will convert to smallest unit
        currency: fullOrderData.currency || 'ILS',
        email: fullOrderData.email || fullOrderData.customerInfo?.email || 'customer@example.com',
        first_name: fullOrderData.customerInfo?.firstName || fullOrderData.shippingAddress?.firstName,
        last_name: fullOrderData.customerInfo?.lastName || fullOrderData.shippingAddress?.lastName,
        phone: fullOrderData.customerInfo?.phone || fullOrderData.shippingAddress?.phone,
        callback_url: getCallbackUrl(),
        metadata: {
          order_type: fullOrderData.deliveryMethod || fullOrderData.shippingInfo?.method,
          customer_address: fullOrderData.customerInfo?.address || fullOrderData.shippingAddress?.street,
          order_number: fullOrderData.orderNumber
        },
        // FULL ORDER DATA - Backend will create order with "unpaid" status
        orderData: {
          user: fullOrderData.user,
          store: fullOrderData.store || {
            _id: storeData._id,
            nameAr: storeData.nameAr,
            nameEn: storeData.nameEn,
            logo: storeData.logo,
            contact: storeData.contact,
            slug: storeData.slug
          },
          items: fullOrderData.items,
          cartItems: fullOrderData.cartItems,
          shippingAddress: fullOrderData.shippingAddress,
          billingAddress: fullOrderData.billingAddress,
          paymentInfo: fullOrderData.paymentInfo,
          shippingInfo: fullOrderData.shippingInfo,
          notes: fullOrderData.notes,
          isGift: fullOrderData.isGift,
          giftMessage: fullOrderData.giftMessage,
          deliveryArea: fullOrderData.deliveryArea,
          currency: fullOrderData.currency
        }
      };

      console.log('📤 Sending payment + order data to backend:', paymentData);

      // Call backend API
      const backendUrl = `${PAYMENT_API_CONFIG.BACKEND_URL}${PAYMENT_API_CONFIG.ENDPOINTS.INITIALIZE(storeData._id)}`;
      console.log('🌐 Backend URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed - backend handles the secret key
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('✅ Backend payment response:', result);

      if (!response.ok) {
        throw new Error(result.message || result.messageAr || 'Failed to initialize Lahza payment');
      }

      // Check if the response contains the payment URL
      if (result.success && result.data) {
        // Look for payment URL in different possible locations
        const paymentUrl = result.data.authorization_url || result.data.payment_url || result.data.url;
        
        console.log('📦 Backend response data:', {
          hasOrderId: !!result.data.orderId,
          hasReference: !!result.data.reference,
          orderId: result.data.orderId,
          reference: result.data.reference,
          orderNumber: result.data.orderNumber
        });
        
        if (paymentUrl) {
          return {
            success: true,
            paymentUrl: paymentUrl,
            transactionId: result.data.transaction_id || result.data.reference,
            data: {
              ...result.data,
              // Ensure these are at the top level for easy access
              orderId: result.data.orderId,
              reference: result.data.reference,
              orderNumber: result.data.orderNumber
            },
            // Keep for backward compatibility
            paymentData: result.data
          };
        } else {
          console.error('Payment URL not found in response:', result);
          throw new Error('Payment URL not found in response');
        }
      } else {
        throw new Error(result.message || result.messageAr || 'Invalid response from backend');
      }
    } catch (error) {
      console.error('❌ Error initializing Lahza payment:', error);
      throw error;
    }
  }, []);

  // Verify Lahza payment - NOW USING SECURE BACKEND
  const verifyLahzaPayment = useCallback(async (transactionId) => {
    try {
      console.log('🔍 Verifying Lahza payment via backend for transaction:', transactionId);
      
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?._id) {
        throw new Error('Store information not available');
      }

      // Call backend API instead of Lahza directly
      const backendUrl = `${PAYMENT_API_CONFIG.BACKEND_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY(storeData._id, transactionId)}`;
      console.log('🌐 Backend verification URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed - backend handles the secret key
        }
      });

      const result = await response.json();
      console.log('✅ Backend verification response:', result);

      if (!response.ok) {
        throw new Error(result.message || result.messageAr || 'Failed to verify Lahza payment');
      }

      return {
        success: result.success,
        paymentStatus: result.data?.status,
        paymentData: result.data
      };
    } catch (error) {
      console.error('❌ Error verifying Lahza payment:', error);
      throw error;
    }
  }, []);

  // Verify payment by reference - NOW USING SECURE BACKEND
  const verifyPayment = useCallback(async (reference) => {
    try {
      console.log('🔍 Verifying payment via backend for reference:', reference);
      
      const storeData = JSON.parse(localStorage.getItem('storeData'));
      if (!storeData?._id) {
        throw new Error('Store information not available');
      }

      // Call backend API instead of Lahza directly
      const backendUrl = `${PAYMENT_API_CONFIG.BACKEND_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY(storeData._id, reference)}`;
      console.log('🌐 Backend verification URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed - backend handles the secret key
        }
      });

      const result = await response.json();
      console.log('✅ Backend verification response:', result);

      if (!response.ok) {
        throw new Error(result.message || result.messageAr || 'Failed to verify payment');
      }

      return {
        success: result.success,
        paymentStatus: result.data?.status,
        paymentData: result.data
      };
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
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
        
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      
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