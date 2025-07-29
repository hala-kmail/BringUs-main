import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5001/api';
const STORE_ID = '687c9bb0a7b3f2a0831c4675';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // تحضير البيانات حسب متطلبات API
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'client', // ثابت للعملاء
        store:{_id:STORE_ID}, // Store ID ثابت
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

      console.log('=== API Request ===');
      console.log('URL:', `${API_BASE_URL}/users`);
      console.log('Method: POST');
      console.log('Headers:', {
        'Content-Type': 'application/json'
      });
      console.log('Body:', requestData);

      const response = await fetch(`${API_BASE_URL}/users`, {
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