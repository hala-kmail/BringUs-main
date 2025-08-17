import React, { useState, useCallback } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { saveToken, getToken, removeToken } from '../utils/tokenManager';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = 'http://localhost:5001/api';


const useLogin = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
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
  const loadStoreInfo = useCallback(async (storeId = null) => {
    // الحصول على معرف المتجر من localStorage إذا لم يتم تمريره
    if (!storeId) {
      storeId = JSON.parse(localStorage.getItem('storeData'))._id;
    }
    
    if (!storeId) {
      console.error('No store ID available');
      return null;
    }
    const token = getToken();
    if (!token) {
      console.error('No auth token found');
      return null;
    }

    const storeInfo = await fetchStoreInfo(storeId, token);
    if (storeInfo) {
      updateStore(storeInfo);
      
      // حفظ معرف المتجر في localStorage
      try {
        localStorage.setItem('storeId', storeId);
        console.log('Store ID saved to localStorage:', storeId);
      } catch (e) {
        console.warn('Could not save store ID to localStorage:', e);
      }
    }
    return storeInfo;
  }, [fetchStoreInfo, updateStore]);
//-----------------------------------loadUserInfo------------------------------------------------
  const loadUserInfo = useCallback(async (userId = null) => {
    const token = getToken();
    if (!token) {
      console.log('No auth token found - user not authenticated');
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
        // Try to get from localStorage if available
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userToFetch = parsedUser.id || parsedUser._id;
          } catch (err) {
            console.log('Error parsing stored user info:', err);
          }
        }
      }
    }

    if (!userToFetch) {
      console.log('No user ID available - user not authenticated');
      return null;
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
      console.log('No auth token found - user not authenticated');
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
            console.log('Error parsing stored user info:', err);
          }
        }
      }
    }

    if (!userToFetch) {
      console.log('No user ID available for fetching user info - user not authenticated');
      return null;
    }

    // Prevent multiple simultaneous calls
    if (isLoadingData) {
      console.log('Data loading already in progress, skipping...');
      return null;
    }

    // Prevent too frequent calls (debounce)
    const now = Date.now();
    if (now - lastLoadTime < 2000) { // 2 seconds debounce
      console.log('Data loading called too frequently, skipping...');
      return null;
    }

    setLastLoadTime(now);
    setIsLoadingData(true);

    try {
          // Load user info first
    const userInfo = await fetchUserInfo(userToFetch, token);
    if (userInfo) {
      updateUser(userInfo);
      // console.log('User info loaded:', userInfo);

      // الحصول على معرف الستور المطلوب
      let targetStoreId = null;
      try {
        const storeData = localStorage.getItem('storeData');
        if (storeData) {
          targetStoreId = JSON.parse(storeData)._id;
        }
      } catch (e) {
        console.warn('Could not parse storeData from localStorage:', e);
      }

      // التحقق من صلاحيات المستخدم للستور المطلوب
      if (targetStoreId) {
        const accessCheck = checkStoreAccess(userInfo, targetStoreId);
        console.log('Store access check in loadUserAndStoreInfo:', accessCheck);
        
        if (!accessCheck.hasAccess) {
          const errorMessage = t('auth.store_access.access_denied');
          console.error(`Store access denied: ${accessCheck.reason}`);
          return { 
            success: false, 
            error: errorMessage,
            storeAccessDenied: true 
          };
        }
      }

      // تحديد معرف الستور للاستخدام
      let storeIdToUse = targetStoreId;
      
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
        
        // حفظ معرف المتجر في localStorage
        try {
          localStorage.setItem('storeId', storeIdToUse);
          console.log('Store ID saved to localStorage:', storeIdToUse);
        } catch (e) {
          console.warn('Could not save store ID to localStorage:', e);
        }
        
        // console.log('Store info loaded:', storeInfo);
        // console.log('Store ID for categories:', storeInfo._id);
        // console.log('Store main color:', storeInfo.settings?.mainColor);
        // console.log('Store settings:', storeInfo.settings);
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
  }, [fetchUserInfo, fetchStoreInfo, user, store, isLoadingData, updateUser, updateStore, lastLoadTime]);
//-----------------------------------login------------------------------------------------
  const  login = useCallback(async (email, password) => {
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
          if(data.message==='Email is not verified'){
            return { success: false, error: 'Email is not verified', isEmailVerified: false };
          }
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

      // Check if email is verified from the user data
      if (data.user && data.user.isEmailVerified === false) {
        return { 
          success: false, 
          error: 'Email not verified', 
          isEmailVerified: false,
          data: data.user 
        };
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
      
      // Use the original login response data directly to preserve discount information
      // Only fetch additional user info if needed for other fields
      try {
        // Use user ID from login response to fetch complete user info
        const userId = data.user.id || data.user._id;
        if (userId) {
          const userInfo = await fetchUserInfo(userId, data.token);
          if (userInfo) {
            // Merge the original login response with fetched user info
            // This preserves discount information from login response
            completeUserData = {
              ...userInfo,
              store: {
                ...userInfo.store,
                // Preserve discount from login response if available
                discount: data.user.store?.discount || userInfo.store?.discount
              },
              stores: data.user.stores || userInfo.stores
            };
            console.log('Merged user data with discount:', completeUserData);
          }
        }
      } catch (err) {
        console.log('Could not fetch complete user info, using login response');
        // Even if fetchUserInfo fails, we still have the discount from login response
        completeUserData = data.user;
      }

      // Success - store user data
      updateUser(completeUserData);

      // الحصول على معرف الستور المطلوب من localStorage أو URL
      let targetStoreId = null;
      try {
        const storeData = localStorage.getItem('storeData');
        if (storeData) {
          targetStoreId = JSON.parse(storeData)._id;
        }
      } catch (e) {
        console.warn('Could not parse storeData from localStorage:', e);
      }

      console.log('Complete user data:', completeUserData);
      console.log('User store:', completeUserData?.store);
      console.log('User stores:', completeUserData?.stores);
      console.log('Target store ID:', targetStoreId);
      
      // التحقق من صلاحيات المستخدم للستور المطلوب
      if (targetStoreId) {
        const accessCheck = checkStoreAccess(completeUserData, targetStoreId);
        console.log('Store access check:', accessCheck);
        
        if (!accessCheck.hasAccess) {
          const errorMessage = t('auth.store_access.access_denied');
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage,
            storeAccessDenied: true 
          };
        }
      }

      // تحديد معرف الستور للاستخدام
      let storeIdToUse = targetStoreId;
      
      // إذا كان المستخدم لديه ستور محدد، استخدمه
      if (completeUserData && completeUserData.store && completeUserData.store._id) {
        storeIdToUse = completeUserData.store._id;
        console.log('Using user store ID:', storeIdToUse);
      }
      // إذا كان لديه مصفوفة ستورز، استخدم الأول
      else if (completeUserData && completeUserData.stores && completeUserData.stores.length > 0) {
        storeIdToUse = completeUserData.stores[0]._id || completeUserData.stores[0];
        console.log('Using first store from stores array:', storeIdToUse);
      }
      else {
        console.log('Using target store ID:', storeIdToUse);
      }

      // Fetch store information
      const storeInfo = await fetchStoreInfo(storeIdToUse, data.token);
      if (storeInfo) {
        updateStore(storeInfo);
        
        // حفظ معرف المتجر في localStorage
        try {
          localStorage.setItem('storeId', storeIdToUse);
          console.log('Store ID saved to localStorage:', storeIdToUse);
        } catch (e) {
          console.warn('Could not save store ID to localStorage:', e);
        }
        
        // Persist slug to localStorage for routing/branding needs
        try {
          const slugFromStore = storeInfo.slug || storeInfo.slugAr || storeInfo.slugEn;
          const slugFromUser = completeUserData?.store?.slug || (completeUserData?.stores?.[0]?.slug);
          const slugToSave = slugFromStore || slugFromUser;
          if (slugToSave) {
            localStorage.setItem('storeSlug', slugToSave);
          }
        } catch (e) {
          console.warn('Could not persist store slug:', e);
        }
      }

      return { 
        success: true, 
        user: completeUserData, 
        token: data.token,
        store: storeInfo,
        isEmailVerified: completeUserData.isEmailVerified
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



  // دالة للتحقق من صلاحيات المستخدم للستور
  const checkStoreAccess = useCallback((userData, targetStoreId) => {
    if (!userData || !targetStoreId) {
      return { hasAccess: false, reason: t('auth.store_access.user_data_missing') };
    }

    // التحقق من أن المستخدم لديه متجر محدد
    if (userData.store && userData.store._id) {
      if (userData.store._id === targetStoreId) {
        return { hasAccess: true, reason: t('auth.store_access.store_permission') };
      } else {
        return { hasAccess: false, reason: t('auth.store_access.no_store_access') };
      }
    }

    // التحقق من مصفوفة المتاجر
    if (userData.stores && userData.stores.length > 0) {
      const hasAccess = userData.stores.some(store => {
        const storeId = store._id || store;
        return storeId === targetStoreId;
      });
      
      if (hasAccess) {
        return { hasAccess: true, reason: t('auth.store_access.access_from_stores_list') };
      } else {
        return { hasAccess: false, reason: t('auth.store_access.no_store_access') };
      }
    }

    return { hasAccess: false, reason: t('auth.store_access.no_stores') };
  }, [t]);

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
    try { localStorage.removeItem('storeSlug'); } catch {}
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
    saveAuthToken,
    removeAuthToken,
    checkStoreAccess,
  };
};

export default useLogin; 