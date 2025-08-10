import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

export const useSocialComments = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store } = useAppData();
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

  const fetchComments = useCallback(async () => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      setError('Store ID not available');
      return;
    }

  

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/social-comments/by-store/${currentStoreId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view these comments.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      // Filter only active comments and transform data structure
      const activeComments = (data.data || data || [])
        .filter(comment => comment.active === true)
        .map(comment => ({
          _id: comment._id,
          user: {
            name: comment.personName,
            avatar: comment.image
          },
          rating: 5, // Default rating since it's not in the response
          comment: comment.comment,
          createdAt: comment.createdAt,
          platform: comment.platform,
          product: {
            name: comment.personTitle || 'منتج عام'
          },
          images: comment.image ? [comment.image] : []
        }));
      setComments(activeComments);
    } catch (err) {
      console.error('Error fetching social comments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getStoreId]);

  // Auto-fetch comments when store changes (only once per store)
  useEffect(() => {
    const currentStoreId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (currentStoreId && (!hasInitialized.current || storeId.current !== currentStoreId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Initializing social comments for store ID:', currentStoreId);
      }
      hasInitialized.current = true;
      storeId.current = currentStoreId;
      fetchComments();
    } else if (!currentStoreId && comments.length > 0) {
      // Clear comments if no store is available
      if (process.env.NODE_ENV === 'development') {
        console.log('No store available, clearing social comments');
      }
      setComments([]);
      hasInitialized.current = false;
      storeId.current = null;
    }
  }, [store?._id, getStoreId, fetchComments, comments.length]);

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments
  };
}; 