import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const useUserOrders = () => {
  const [allOrders, setAllOrders] = useState([]); // جميع الطلبات
  const [filteredOrders, setFilteredOrders] = useState([]); // الطلبات المفلترة
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
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

      // بناء URL مع المعاملات
      let url = `${API_BASE_URL}/orders/my-orders?page=${page}&limit=${limit}`;
      if (status && status !== '') {
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
        const ordersData = data.data || [];
        const paginationData = data.pagination || {};
        
        setAllOrders(ordersData);
        setFilteredOrders(ordersData);
        
        // تحديث الباجينيشن من الـ response
        setPagination({
          currentPage: paginationData.currentPage || page,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalItems || ordersData.length,
          itemsPerPage: paginationData.itemsPerPage || limit,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false
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

  // دالة فلترة الطلبات حسب الحالة
  const filterOrdersByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // بناء URL مع فلتر الحالة
      let url = `${API_BASE_URL}/orders/my-orders?page=1&limit=${pagination.itemsPerPage}`;
      if (status && status !== '') {
        url += `&status=${status}`;
      }

      console.log('🔍 Filtering orders by status:', status, 'URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to filter orders');
      }

      if (data.success) {
        const ordersData = data.data || [];
        const paginationData = data.pagination || {};
        
        setFilteredOrders(ordersData);
        
        // تحديث الباجينيشن للطلبات المفلترة
        setPagination(prev => ({
          ...prev,
          currentPage: 1, // العودة للصفحة الأولى
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalItems || ordersData.length,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false
        }));
      }
    } catch (err) {
      console.error('Error filtering orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

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
    setAllOrders([]);
    setFilteredOrders([]);
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false
    });
  }, []);

  return {
    orders: filteredOrders, // استخدام الطلبات المفلترة
    allOrders, // جميع الطلبات للاستخدام الداخلي
    loading,
    error,
    pagination,
    getUserOrders,
    filterOrdersByStatus, // دالة الفلترة الجديدة
    getOrderDetails,
    cancelOrder,
    updateOrderStatus,
    reset
  };
};

export default useUserOrders; 