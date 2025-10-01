import { useState } from 'react';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // الحصول على معرف المتجر من localStorage
      let storeId;
      try {
        const storeData = localStorage.getItem('storeData');
        if (storeData) {
          const parsedStoreData = JSON.parse(storeData);
          storeId = parsedStoreData._id;
        }
      } catch (parseError) {
        console.error('Error parsing store data from localStorage:', parseError);
      }
      
      if (!storeId) {
        // Try to get store ID from URL if not in localStorage
        const pathSegments = window.location.pathname.split('/');
        const storeSlug = pathSegments[1];
        
        if (storeSlug && storeSlug !== 'affiliate') {
          // For now, we'll use a default store ID or handle this differently
          // You might want to fetch store data by slug here
          console.warn('Store ID not found in localStorage, using fallback approach');
        }
        
        // For now, let's proceed without store ID and let the backend handle it
        // or you can set a default store ID here
        storeId = null; // Let the backend handle store assignment
      }

      console.log('Store ID for registration:', storeId);

      // تحضير البيانات حسب متطلبات API
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'client', // ثابت للعملاء
        addresses: [
          {
            type: 'home',
            street: userData.address,
            city: userData.city,
            state: userData.state || userData.city,
            zipCode: userData.zipCode || '',
            country: userData.country || 'فلسطين',
            isDefault: true
          }
        ],
        status: 'active'
      };

      // Add store ID to request if available
      if (storeId) {
        requestData.store = storeId;
      }

      console.log('=== API Request ===');
      console.log('URL:', `${API_BASE_URL}/auth/register`);
      console.log('Method: POST');
      console.log('Headers:', {
        'Content-Type': 'application/json'
      });
      console.log('Body:', requestData);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // يمكن إضافة Authorization header هنا إذا كان مطلوباً
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'فشل في إنشاء المستخدم');
      }

      setUser(result.data);
      return { success: true, data: result.data };
      
    } catch (err) {
      const errorMessage = err.message || 'حدث خطأ أثناء إنشاء المستخدم';
      setError(errorMessage);
      console.error('=== Error Details ===');
      console.error('Error:', err);
      console.error('Error Message:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setUser(null);
  };

  return {
    createUser,
    loading,
    error,
    user,
    reset
  };
}; 