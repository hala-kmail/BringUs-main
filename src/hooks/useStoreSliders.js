import { useState, useCallback, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const useStoreSliders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, sliders, updateSliders } = useAppData(); // استخدام السياق

  // Fetch sliders from API
  const fetchSliders = useCallback(async (storeId) => {
    // 1. التحقق من السياق أولاً
    if (sliders !== null) { // التحقق من أن القيمة ليست null
    
      return sliders;
    }
    
    if (!storeId) {
      console.error('No store ID provided for fetching sliders');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/store-sliders?storeId=${storeId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sliders');
      }

      console.log('Sliders API response:', data);
      
      if (data.success && data.data) {
        updateSliders(data.data); // 2. تحديث السياق
        console.log('Sliders loaded successfully and updated in context:', data.data);
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
  }, [sliders, updateSliders]); // إضافة الاعتماديات

  // Auto-fetch sliders when store changes
  useEffect(() => {
    if (store && store._id) {
      console.log('Store changed, attempting to fetch sliders for store ID:', store._id);
      // استدعاء fetchSliders مباشرة بدلاً من إضافتها لل dependencies
      const loadSliders = async () => {
        // التحقق من السياق أولاً
        if (sliders !== null) {
          return sliders;
        }
        
        setLoading(true);
        setError(null);

        try {
          const token = localStorage.getItem('authToken');
          const headers = {
            'Content-Type': 'application/json',
          };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${API_BASE_URL}/store-sliders?storeId=${store._id}`, {
            method: 'GET',
            headers,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch sliders');
          }

          console.log('Sliders API response:', data);
          
          if (data.success && data.data) {
            updateSliders(data.data);
            console.log('Sliders loaded successfully and updated in context:', data.data);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (err) {
          console.error('Error fetching sliders:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      loadSliders();
    } else if (store === null && sliders !== null) { // إذا تم تسجيل الخروج
      console.log('No store available, clearing sliders');
      updateSliders(null); // مسح السلايدر من السياق
    }
  }, [store?._id]); // استخدام store._id فقط

  // Manual fetch function
  const loadSliders = useCallback((storeId = null) => {
    const targetStoreId = storeId || (store && store._id);
    if (targetStoreId) {
      return fetchSliders(targetStoreId);
    } else {
      console.error('No store ID available for loading sliders');
      return null;
    }
  }, [store, fetchSliders]);

  // Refresh sliders
  const refreshSliders = useCallback(() => {
    // إجبار إعادة الجلب عن طريق مسح السياق أولاً
    updateSliders(null); 
    if (store && store._id) {
      return fetchSliders(store._id);
    }
  }, [store, fetchSliders, updateSliders]);

  return {
    sliders, // 3. إرجاع السلايدر من السياق مباشرة
    loading,
    error,
    fetchSliders,
    loadSliders,
    refreshSliders,
  };
};

export default useStoreSliders; 