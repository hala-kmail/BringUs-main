import { useState, useCallback, useEffect } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const usePaymentMethods = (storeId) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment methods for a specific store
  const fetchPaymentMethods = useCallback(async (storeId, page = 1, limit = 10) => {
    if (!storeId) {
      console.log('No store ID provided for payment methods');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/payment-methods/store/${storeId}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
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
        return activeMethods;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load payment methods when storeId changes
  useEffect(() => {
    if (storeId) {
      fetchPaymentMethods(storeId);
    }
  }, [storeId, fetchPaymentMethods]);

  // Refresh payment methods
  const refreshPaymentMethods = useCallback(() => {
    if (storeId) {
      fetchPaymentMethods(storeId);
    }
  }, [storeId, fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    refreshPaymentMethods
  };
};

export default usePaymentMethods; 