import { useState, useCallback } from 'react';
import { getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user profile
  const getProfile = useCallback(async (userId = null) => {
    console.log('getProfile');
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // If no userId provided, try to get it from localStorage
      let userToFetch = userId;
      if (!userToFetch) {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userToFetch = parsedUser.id || parsedUser._id;
          } catch (err) {
            console.error('Error parsing stored user info:', err);
          }
        }
      }

      if (!userToFetch) {
        throw new Error('No user ID available');
      }

      // Use the same endpoint as useLogin.js for consistency
      const response = await fetch(`${API_BASE_URL}/users/${userToFetch}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data.data || data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile with addresses
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending profile data:', JSON.stringify(profileData, null, 2));

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      console.log('Addresses in response:', data.user?.addresses);

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      // After successful update, fetch the complete user data using the same endpoint as useLogin.js
      let completeUserData = data.user || data;
      console.log('Initial response user data:', completeUserData);
      console.log('Addresses in initial response:', completeUserData?.addresses);
      
      try {
        // Get user ID from the updated data or localStorage
        const userId = completeUserData.id || completeUserData._id;
        if (userId) {
          // Fetch complete user data directly without using getProfile to avoid dependency cycle
          const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          });

          const userData = await userResponse.json();
          if (userResponse.ok && (userData.data || userData.user)) {
            completeUserData = userData.data || userData.user;
            console.log('Complete user data fetched after update:', completeUserData);
            console.log('Addresses in fetched data:', completeUserData?.addresses);
          }
        }
      } catch (err) {
        console.log('Could not fetch complete user info after update, using response data');
      }

      // Return the complete user data
      console.log('Final complete user data being returned:', completeUserData);
      console.log('Final addresses being returned:', completeUserData?.addresses);
      return completeUserData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = getBearerToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to change password');
      }

      return data.message;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    changePassword
  };
};

export default useProfile; 