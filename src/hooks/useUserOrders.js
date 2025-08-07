import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });

  // جلب جميع طلبات المستخدم
  const getUserOrders = useCallback(async (page = 1, limit = 10, status = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = `${API_BASE_URL}/orders/my-orders?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('🔍 Fetching user orders from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      console.log('🔍 User orders response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      if (data.success) {
        setOrders(data.data || []);
        setPagination({
          currentPage: page,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.count || data.data?.length || 0,
          itemsPerPage: limit
        });
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return data;
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب تفاصيل طلب محدد
  const getOrderDetails = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_BASE_URL}/orders/my-orders/${orderId}`;

      console.log('🔍 Fetching order details from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      console.log('🔍 Order details response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // تحديث حالة الطلب (للمستخدم)
  const updateOrderStatus = useCallback(async (orderId, status, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_BASE_URL}/orders/${orderId}/status`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ status, notes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      if (data.success) {
        // تحديث قائمة الطلبات بعد التحديث
        await getUserOrders(pagination.currentPage, pagination.itemsPerPage);
        return data;
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserOrders, pagination.currentPage, pagination.itemsPerPage]);

  // إلغاء طلب
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      // استخدام دالة تحديث الحالة لتغيير حالة الطلب إلى "cancelled"
      const result = await updateOrderStatus(orderId, 'cancelled', reason);
      
      console.log('Order cancelled successfully:', result);
      return result;
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateOrderStatus]); // Dependency on updateOrderStatus

  // إعادة تعيين الحالة
  const reset = useCallback(() => {
    setOrders([]);
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10
    });
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    updateOrderStatus,
    reset
  };
};

export default useUserOrders; 