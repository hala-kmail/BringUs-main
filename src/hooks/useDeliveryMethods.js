import { useState, useEffect } from 'react';
import { getToken } from '../utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const useDeliveryMethods = (storeId) => {
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveryMethods = async () => {
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
  };

  useEffect(() => {
    fetchDeliveryMethods();
  }, [storeId]);

  return {
    deliveryMethods,
    loading,
    error,
    refetch: fetchDeliveryMethods
  };
}; 