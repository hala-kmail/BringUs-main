import { useState, useCallback, useEffect } from 'react';

const useStore = (storeId = null) => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch store information
  const fetchStoreInfo = useCallback(async (id, token = null) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/stores/${id}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch store information');
        return null;
      }

      setStore(data.data);
      return data.data;
          } catch (err) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return null;
      } finally {
      setLoading(false);
    }
  }, []);

  // Load store info from localStorage
  const loadStoredStoreInfo = useCallback(() => {
    const storedStoreInfo = localStorage.getItem('storeInfo');
    
    if (storedStoreInfo) {
      try {
        const storeData = JSON.parse(storedStoreInfo);
        setStore(storeData);
        return storeData;
      } catch (err) {
        console.error('Error parsing stored store info:', err);
        localStorage.removeItem('storeInfo');
      }
    }
    return null;
  }, []);

  // Save store info to localStorage
  const saveStoreInfo = useCallback((storeData) => {
    if (storeData) {
      localStorage.setItem('storeInfo', JSON.stringify(storeData));
    }
  }, []);

  // Clear store info from localStorage
  const clearStoreInfo = useCallback(() => {
    localStorage.removeItem('storeInfo');
    setStore(null);
  }, []);

  // Auto-fetch store info if storeId is provided
  useEffect(() => {
    if (storeId) {
      const token = localStorage.getItem('authToken');
      fetchStoreInfo(storeId, token);
    }
  }, [storeId, fetchStoreInfo]);

  return {
    store,
    loading,
    error,
    fetchStoreInfo,
    loadStoredStoreInfo,
    saveStoreInfo,
    clearStoreInfo,
  };
};

export default useStore; 