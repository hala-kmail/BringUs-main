import { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { getBearerToken } from '../utils/tokenManager';
const API_BASE_URL = 'http://localhost:5001/api';

export const useSocialComments = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store } = useAppData();

  const fetchComments = async () => {
    if (!store?._id) {
      setError('Store ID not available');
      return;
    }

    const token = getBearerToken();
    if (!token) {
      setError('Authentication required. Please login to view comments.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/social-comments/by-store/${store._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
  };

  useEffect(() => {
    if (store?._id) {
      fetchComments();
    }
  }, [store?._id]);

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments
  };
}; 