import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const useCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, categories, updateCategories } = useAppData();
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

  const fetchCategories = useCallback(async (targetStoreId) => {
    if (!targetStoreId) {
      // console.log('No store ID available for fetching categories');
      return null;
    }

    // Don't fetch if we already have categories and they're for the same store
    if (categories !== null && storeId.current === targetStoreId) {
      return categories;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('Fetching categories for store ID:', targetStoreId);
      }
      
      const url = `${API_BASE_URL}/categories/store/${targetStoreId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract data from the response
      if (result.success && result.data) {
        if (process.env.NODE_ENV === 'development') {
          // console.log('Categories fetched successfully:', result.data.length, 'categories');
        }
        // Update categories in context
        updateCategories(result.data);
        storeId.current = targetStoreId;
        return result.data;
      } else {
        // If no categories found, set empty array to prevent re-fetching
        updateCategories([]);
        storeId.current = targetStoreId;
        if (process.env.NODE_ENV === 'development') {
          // console.log('No categories found or invalid format, setting to empty array.');
        }
        return [];
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [categories, updateCategories]);

  // Auto-fetch categories when store changes (only once per store)
  useEffect(() => {
    const currentStoreId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (currentStoreId && (!hasInitialized.current || storeId.current !== currentStoreId)) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Initializing categories for store ID:', currentStoreId);
      }
      hasInitialized.current = true;
      storeId.current = currentStoreId;
      fetchCategories(currentStoreId);
    } else if (!currentStoreId && hasInitialized.current) {
      // Clear categories if no store is available
      if (process.env.NODE_ENV === 'development') {
        // console.log('No store available, clearing categories');
      }
      updateCategories(null);
      hasInitialized.current = false;
      storeId.current = null;
    }
  }, [store?._id, getStoreId, fetchCategories, updateCategories]);

  const loadCategories = useCallback(async (targetStoreId = null) => {
    const id = targetStoreId || getStoreId();
    
    if (!id) {
      //  console.log('No store ID available for loading categories');
      return null;
    }

    const categoriesData = await fetchCategories(id);
    
    if (categoriesData) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Categories loaded manually:', categoriesData.length, 'categories');
      }
      return categoriesData;
    }
    return null;
  }, [getStoreId, fetchCategories]);

  const refreshCategories = useCallback(() => {
    const currentStoreId = getStoreId();
    if (currentStoreId) {
      // Force refresh by clearing current categories
      updateCategories(null);
      hasInitialized.current = false;
      return loadCategories(currentStoreId);
    }
    return null;
  }, [getStoreId, loadCategories, updateCategories]);

  // Helper functions to get main categories and subcategories
  const getMainCategories = useCallback(() => {
    if (!categories) return []; // Protection from null
    return categories.filter(cat => !cat.parent);
  }, [categories]);

  const getSubCategories = useCallback((parentId) => {
    if (!categories) return []; // Protection from null
    return categories.filter(cat => cat.parent && cat.parent._id === parentId);
  }, [categories]);

  const getAllSubCategories = useCallback(() => {
    if (!categories) return []; // Protection from null
    return categories.filter(cat => cat.parent);
  }, [categories]);

  return {
    categories: categories || [], // Return empty array for components
    loading,
    error,
    fetchCategories,
    loadCategories,
    refreshCategories,
    getMainCategories,
    getSubCategories,
    getAllSubCategories
  };
};

export default useCategories; 