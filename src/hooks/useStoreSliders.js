import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const useStoreSliders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, sliders, updateSliders } = useAppData();
  const hasInitialized = useRef(false);
  const storeId = useRef(null);

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

  // Fetch sliders from API
  const fetchSliders = useCallback(async (targetStoreId) => {
    if (!targetStoreId) {
      console.error('No store ID provided for fetching sliders');
      return null;
    }

    // Don't fetch if we already have sliders and they're for the same store
    if (sliders !== null && storeId.current === targetStoreId) {
      return sliders;
    }

    setLoading(true);
    setError(null);

    try {
  
      const headers = {
        'Content-Type': 'application/json',
      };

   
      const response = await fetch(`${API_BASE_URL}/store-sliders/${targetStoreId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sliders');
      }

      if (data.success && data.data) {
        updateSliders(data.data);
        storeId.current = targetStoreId;
        console.log('Sliders loaded successfully:', data.data.length, 'sliders');
        return data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching sliders:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sliders, updateSliders]);

  // Auto-fetch sliders when store changes (only once per store)
  useEffect(() => {
    const currentStoreId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (currentStoreId && (!hasInitialized.current || storeId.current !== currentStoreId)) {
      console.log('Initializing sliders for store ID:', currentStoreId);
      hasInitialized.current = true;
      storeId.current = currentStoreId;
      fetchSliders(currentStoreId);
    } else if (!currentStoreId && sliders !== null) {
      // Clear sliders if no store is available
      console.log('No store available, clearing sliders');
      updateSliders(null);
      hasInitialized.current = false;
      storeId.current = null;
    }
  }, [store?._id, getStoreId, fetchSliders, sliders, updateSliders]);

  // Manual fetch function
  const loadSliders = useCallback((targetStoreId = null) => {
    const id = targetStoreId || getStoreId();
    if (id) {
      return fetchSliders(id);
    } else {
      console.error('No store ID available for loading sliders');
      return null;
    }
  }, [getStoreId, fetchSliders]);

  // Refresh sliders
  const refreshSliders = useCallback(() => {
    const currentStoreId = getStoreId();
    if (currentStoreId) {
      // Force refresh by clearing current sliders
      updateSliders(null);
      hasInitialized.current = false;
      return fetchSliders(currentStoreId);
    }
  }, [getStoreId, fetchSliders, updateSliders]);

  return {
    sliders,
    loading,
    error,
    fetchSliders,
    loadSliders,
    refreshSliders,
  };
};

export default useStoreSliders; 