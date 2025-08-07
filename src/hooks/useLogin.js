import React, { useState, useCallback } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { saveToken, getToken, removeToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';
const STORE_ID = '687c9bb0a7b3f2a0831c4675';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { user, store, updateUser, updateStore, clearData, isAuthenticated } = useAppData();



//-----------------------------------fetchStoreInfo------------------------------------------------
  const fetchStoreInfo = useCallback(async (storeId, token) => {
 
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
   

      if (!response.ok) {
        console.error('Failed to fetch store info:', data.message);
        return null;
      }

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error('Failed to fetch store info');
      }
    } catch (err) {
      console.error('Error fetching store info:', err);
      return null;
    }
  }, []);
//-----------------------------------fetchUserInfo------------------------------------------------
  // Function to fetch complete user information by user ID
  const fetchUserInfo = useCallback(async (userId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch user info:', data.message);
        return null;
      }

      return data.data || data.user; // Return user data
    } catch (err) {
      console.error('Error fetching user info:', err);
      return null;
    }
  }, []);
//-----------------------------------loadStoreInfo------------------------------------------------
  const loadStoreInfo = useCallback(async (storeId = STORE_ID) => {
    const token = getToken();
    if (!token) {
      console.error('No auth token found');
      return null;
    }

    const storeInfo = await fetchStoreInfo(storeId, token);
    if (storeInfo) {
      updateStore(storeInfo);
    }
    return storeInfo;
  }, [fetchStoreInfo, updateStore]);
//-----------------------------------loadUserInfo------------------------------------------------
  const loadUserInfo = useCallback(async (userId = null) => {
    const token = getToken();
    if (!token) {
      console.error('No auth token found');
      return null;
    }

    // If no userId provided, try to get it from localStorage or current user state
    let userToFetch = userId;
    if (!userToFetch) {
      const currentUser = user;
      if (currentUser && currentUser.id) {
        userToFetch = currentUser.id;
      } else if (currentUser && currentUser._id) {
        userToFetch = currentUser._id;
      } else {
        console.error('No user ID available');
        return null;
      }
    }

    console.log('Loading user info for ID:', userToFetch);
    const userInfo = await fetchUserInfo(userToFetch, token);
    if (userInfo) {
      updateUser(userInfo);
      console.log('User info loaded manually:', userInfo);
    }
    return userInfo;
  }, [fetchUserInfo, user, updateUser]);
//-----------------------------------loadUserAndStoreInfo------------------------------------------------
  const loadUserAndStoreInfo = useCallback(async (userId = null) => {
    const token = getToken();
    if (!token) {
      console.error('No auth token found');
      return null;
    }

    // Check if we already have the data
    if (user && store) {
    
      return { user, store };
    }

    // If no userId provided, try to get it from localStorage or current user state
    let userToFetch = userId;
    if (!userToFetch) {
      const currentUser = user;
      if (currentUser && currentUser.id) {
        userToFetch = currentUser.id;
      } else if (currentUser && currentUser._id) {
        userToFetch = currentUser._id;
      } else {
        // Try to get from localStorage if available
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
    }

    if (!userToFetch) {
      console.error('No user ID available for fetching user info');
      return null;
    }

    // Prevent multiple simultaneous calls
    if (isLoadingData) {
      console.log('Data loading already in progress, skipping...');
      return null;
    }

    setIsLoadingData(true);

    try {
          // Load user info first
    const userInfo = await fetchUserInfo(userToFetch, token);
    if (userInfo) {
      updateUser(userInfo);
      console.log('User info loaded:', userInfo);

      // Determine store ID from user info
      let storeIdToUse = STORE_ID;
      if (userInfo.store && userInfo.store._id) {
        storeIdToUse = userInfo.store._id;
        console.log('Using store ID from user info:', storeIdToUse);
      } else if (userInfo.stores && userInfo.stores.length > 0) {
        storeIdToUse = userInfo.stores[0]._id || userInfo.stores[0];
        console.log('Using store ID from stores array:', storeIdToUse);
      }

      // Load store info
      const storeInfo = await fetchStoreInfo(storeIdToUse, token);
      if (storeInfo) {
        updateStore(storeInfo);
        console.log('Store info loaded:', storeInfo);
        console.log('Store ID for categories:', storeInfo._id);
        console.log('Store main color:', storeInfo.settings?.mainColor);
        console.log('Store settings:', storeInfo.settings);
      }

      return { user: userInfo, store: storeInfo };
    }

    return null;
  } catch (err) {
    console.error('Error loading user and store info:', err);
    return null;
  } finally {
    setIsLoadingData(false);
  }
  }, [fetchUserInfo, fetchStoreInfo, user, store, isLoadingData, updateUser, updateStore]);
//-----------------------------------login------------------------------------------------
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 401) {
          setError('Invalid email or password');
        } else if (response.status === 422) {
          // Validation errors
          const validationErrors = data.errors || {};
          const errorMessages = Object.values(validationErrors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store token in localStorage first
      if (data.token) {
        const tokenSaved = saveToken(data.token);
        if (tokenSaved) {
          // Verify token was saved
          const savedToken = getToken();
          if (savedToken === data.token) {
            console.log('Token verification successful');
          } else {
            console.error('Token verification failed');
          }
        } else {
          console.error('Failed to save token');
        }
      } else {
        console.error('No token received from login response');
      }

      // Try to get complete user information
      let completeUserData = data.user;
      try {
        // Use user ID from login response to fetch complete user info
        const userId = data.user.id || data.user._id;
        if (userId) {
          const userInfo = await fetchUserInfo(userId, data.token);
          if (userInfo) {
            completeUserData = userInfo;
            
          }
        }
      } catch (err) {
        console.log('Could not fetch complete user info, using login response');
      }

      // Success - store user data
      updateUser(completeUserData);

      // Determine which store ID to use
      let storeIdToUse = STORE_ID; // Default to constant store ID
      
      console.log('Complete user data:', completeUserData);
      console.log('User store:', completeUserData?.store);
      console.log('User stores:', completeUserData?.stores);
      
      // If user has a store, use it
      if (completeUserData && completeUserData.store && completeUserData.store._id) {
        storeIdToUse = completeUserData.store._id;
      }
      // If user has stores array and it's not empty, use the first one
      else if (completeUserData && completeUserData.stores && completeUserData.stores.length > 0) {
        storeIdToUse = completeUserData.stores[0]._id || completeUserData.stores[0];
        console.log('Using first store from stores array:', storeIdToUse);
      }
      else {
        console.log('Using default store ID:', storeIdToUse);
      }

      // Fetch store information
      const storeInfo = await fetchStoreInfo(storeIdToUse, data.token);
      if (storeInfo) {
        updateStore(storeInfo);
      }

      return { 
        success: true, 
        user: completeUserData, 
        token: data.token,
        store: storeInfo 
      };
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStoreInfo, fetchUserInfo, updateUser, updateStore]);

  // دالة لحذف التوكن
  const removeAuthToken = useCallback(() => {
    const success = removeToken();
    if (success) {
      console.log('Token removed from localStorage');
    } else {
      console.error('Failed to remove token');
    }
    return success;
  }, []);

  // دالة للتحقق من وجود التوكن
  const checkAuthToken = useCallback(() => {
    const token = getToken();
    if (token) {
      console.log('Auth token found in localStorage');
    } else {
      console.log('No auth token found in localStorage');
    }
    return token;
  }, []);

  // دالة لحفظ التوكن
  const saveAuthToken = useCallback((token) => {
    const success = saveToken(token);
    if (success) {
      console.log('Token saved successfully');
    } else {
      console.error('Failed to save token');
    }
    return success;
  }, []);

//-----------------------------------logout------------------------------------------------
  const logout = useCallback(() => {
    setError(null);
    const tokenRemoved = removeAuthToken();
    clearData();
    if (tokenRemoved) {
      console.log('User logged out successfully');
    } else {
      console.error('Failed to remove token during logout');
    }
  }, [clearData, removeAuthToken]);

  return {
    login,
    logout,
    loading,
    error,
    user,
    store,
    isAuthenticated,
    loadStoreInfo,
    loadUserInfo,
    loadUserAndStoreInfo,
    checkAuthToken,
    saveAuthToken,
    removeAuthToken,
  };
};

export default useLogin; 