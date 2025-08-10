import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';

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
    refetch: fetchPaymentMethods
  };
};

export default usePaymentMethods; 