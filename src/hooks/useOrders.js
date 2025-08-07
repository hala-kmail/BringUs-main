import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // التحقق من وجود storeId
      if (!orderData.store || !orderData.store._id) {
        throw new Error('Store ID is required');
      }

      const storeId = orderData.store._id;
      console.log('Creating order with data:', orderData);
      console.log('Store ID:', storeId);

      const response = await fetch(`${API_BASE_URL}/orders/store/${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to create order');
      }

      console.log('Order created successfully:', data);
      return data.data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user orders
  const getUserOrders = useCallback(async (page = 1, limit = 10, status = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = `${API_BASE_URL}/orders?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single order
  const getOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      return data.data;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to cancel order');
      }

      return data;
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createOrder,
    getUserOrders,
    getOrder,
    cancelOrder
  };
};

export default useOrders; 