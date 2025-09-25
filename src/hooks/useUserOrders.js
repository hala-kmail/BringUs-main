import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const useUserOrders = () => {
  const [allOrders, setAllOrders] = useState([]); // جميع الطلبات
  const [filteredOrders, setFilteredOrders] = useState([]); // الطلبات المفلترة
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null); // تتبع الفلتر الحالي
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 5,
    hasNextPage: false,
    hasPrevPage: false
  });

  // جلب جميع طلبات المستخدم
  const getUserOrders = useCallback(async (page = 1, limit = 5, status = null) => {
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

      if (data.success) {
        const ordersData = data.data || [];
        const paginationData = data.pagination || {};
        
        setAllOrders(ordersData);
        setFilteredOrders(ordersData);
        setCurrentFilter(status); // حفظ الفلتر الحالي
        
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
  const filterOrdersByStatus = useCallback(async (status, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // بناء URL مع فلتر الحالة ورقم الصفحة
      let url = `${API_BASE_URL}/orders/my-orders?page=${page}&limit=${pagination.itemsPerPage}`;
      if (status && status !== '') {
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
        throw new Error(data.message || 'Failed to filter orders');
      }

      if (data.success) {
        const ordersData = data.data || [];
        const paginationData = data.pagination || {};
        
        setFilteredOrders(ordersData);
        setCurrentFilter(status); // حفظ الفلتر الحالي
        
        // تحديث الباجينيشن للطلبات المفلترة
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.currentPage || page,
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

    

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

    

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
      
    
      return result;
    } catch (err) {
   
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateOrderStatus]); // Dependency on updateOrderStatus

  // دالة لجلب الطلبات مع الفلتر الحالي وصفحة محددة
  const getOrdersWithCurrentFilter = useCallback(async (page = 1) => {
    if (currentFilter) {
      await filterOrdersByStatus(currentFilter, page);
    } else {
      await getUserOrders(page, pagination.itemsPerPage);
    }
  }, [currentFilter, filterOrdersByStatus, getUserOrders, pagination.itemsPerPage]);

  // إعادة تعيين الحالة
  const reset = useCallback(() => {
    setAllOrders([]);
    setFilteredOrders([]);
    setCurrentFilter(null);
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 5,
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
    currentFilter, // الفلتر الحالي
    getUserOrders,
    filterOrdersByStatus, // دالة الفلترة الجديدة
    getOrdersWithCurrentFilter, // دالة جلب الطلبات مع الفلتر الحالي
    getOrderDetails,
    cancelOrder,
    updateOrderStatus,
    reset
  };
};

export default useUserOrders; 