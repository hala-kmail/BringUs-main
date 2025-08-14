import { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '../utils/tokenManager';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const useDeliveryMethods = () => {
  const [deliveryMethods, setDeliveryMethods] = useState([]);
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

  const fetchDeliveryMethods = useCallback(async () => {
    const storeId = getStoreId();
    
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/delivery-methods/store/${storeId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // فلترة طرق التوصيل النشطة فقط وترتيبها حسب الأولوية
        const activeDeliveryMethods = result.data
          .filter(method => method.isActive === true)
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setDeliveryMethods(activeDeliveryMethods);
      } else {
        throw new Error(result.message || 'Failed to fetch delivery methods');
      }
    } catch (err) {
      console.error('Error fetching delivery methods:', err);
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
        // console.log('Initializing delivery methods for store ID:', storeId);
      }
      hasInitialized.current = true;
      currentStoreId.current = storeId;
      fetchDeliveryMethods();
    } else if (!storeId && deliveryMethods.length > 0) {
      // Clear delivery methods if no store is available
      if (process.env.NODE_ENV === 'development') {
        // console.log('No store available, clearing delivery methods');
      }
      setDeliveryMethods([]);
      hasInitialized.current = false;
      currentStoreId.current = null;
    }
  }, [store?._id, getStoreId, fetchDeliveryMethods, deliveryMethods.length]);

  return {
    deliveryMethods,
    loading,
    error,
    refetch: fetchDeliveryMethods
  };
}; 