import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken, getBearerToken } from '../utils/tokenManager';
import { useAppData } from './AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();
  const { store, isAuthenticated, user } = useAppData();
  const hasInitialized = useRef(false);
  const storeId = useRef(null);
  const currentLang = i18n.language;

  // ===== Guest ID Management =====
  
  // Save Guest ID to localStorage
  const saveGuestId = useCallback((guestId) => {
    if (guestId) {
      localStorage.setItem('guestId', guestId);
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Guest ID saved to localStorage:', guestId);
      }
    }
  }, []);

  // Get Guest ID from localStorage
  const getStoredGuestId = useCallback(() => {
    const guestId = localStorage.getItem('guestId');
    if (guestId && process.env.NODE_ENV === 'development') {
      // console.log('📂 Retrieved Guest ID from localStorage:', guestId);
    }
    return guestId;
  }, []);

  // Generate a stable Guest ID if none exists
  const generateStableGuestId = useCallback(() => {
    const existingGuestId = getStoredGuestId();
    if (!existingGuestId) {
      // Generate a stable guest ID using timestamp and random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const stableGuestId = `guest_${timestamp}_${randomStr}`;
      saveGuestId(stableGuestId);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Generated stable Guest ID:', stableGuestId);
      }
      return stableGuestId;
    }
    return existingGuestId;
  }, [getStoredGuestId, saveGuestId]);
  
  // Clear Guest ID from localStorage (when user logs in)
  const clearGuestId = useCallback(() => {
    localStorage.removeItem('guestId');
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ Guest ID cleared from localStorage');
    }
  }, []);

  // Get store ID from localStorage or store context
  const getStoreId = useCallback(() => {
    if (store && store._id) {
      return store._id;
    }
    
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        const parsedStore = JSON.parse(storedStore);
        return parsedStore._id;
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    
    return null;
  }, [store]);

  // Get store slug from localStorage or store context
  const getStoreSlug = useCallback(() => {
    if (store && store.slug) {
      return store.slug;
    }
    
    try {
      const storedStore = localStorage.getItem('storeData');
      if (storedStore) {
        const parsedStore = JSON.parse(storedStore);
        return parsedStore.slug;
      }
    } catch (err) {
      console.warn('Could not parse stored store data:', err);
    }
    
    return null;
  }, [store]);

  // Get headers based on authentication status and Guest ID
  const getHeaders = useCallback(() => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if user is logged in
    if (token) {
      headers['Authorization'] = getBearerToken();
    } else {
      // Only send Guest ID if user is not authenticated
      const guestId = generateStableGuestId();
      if (guestId) {
        headers['X-Guest-ID'] = guestId;
      }
    }
    
    return headers;
  }, [generateStableGuestId]);

  // Handle API response and extract Guest ID
  const handleApiResponse = useCallback(async (response) => {
    // Extract Guest ID from response headers
    const guestId = response.headers.get('X-Guest-ID');
    if (guestId) {
      // Only save Guest ID if we don't already have one
      const existingGuestId = getStoredGuestId();
      if (!existingGuestId) {
        saveGuestId(guestId);
        if (process.env.NODE_ENV === 'development') {
          console.log('🆕 New Guest ID received and saved:', guestId);
        }
      } else if (existingGuestId !== guestId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Guest ID mismatch - keeping existing:', existingGuestId, 'vs received:', guestId);
        }
      }
    }
    
    return response.json();
  }, [saveGuestId, getStoredGuestId]);

  // جلب الأمنيات من API
  const fetchWishlist = useCallback(async () => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for fetching wishlist');
      }
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;
      const response = await fetch(`${API_BASE_URL}/likes?${queryParam}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          setWishlistItems([]);
          return;
        }
        throw new Error(data.message || 'Failed to fetch wishlist');
      }

      if (data.success && data.data) {
        setWishlistItems(data.data);
        if (process.env.NODE_ENV === 'development') {
          // console.log('Wishlist fetched successfully:', data.data.length, 'items');
        }
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // إضافة منتج للأمنيات
  const addToWishlist = useCallback(async (product) => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Store ID and slug not available for adding to wishlist');
      }
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log('Adding product to wishlist:', product._id, product.nameAr || product.nameEn);
    }

    setLoading(true);
    setError(null);

    try {
      const productId = product._id || product.id;
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;
      
      const response = await fetch(`${API_BASE_URL}/likes/${productId}?${queryParam}`, {
        method: 'POST',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      if (process.env.NODE_ENV === 'development') {
        // console.log('Add to wishlist response:', { status: response.status, data });
      }

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || 'Product already liked');
        } else if (response.status === 401) {
          throw new Error('Please login first');
        } else if (response.status === 403) {
          throw new Error('Cross-store like attempt');
        } else if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(data.message || 'Failed to add to wishlist');
      }

      if (data.success) {
        const newWishlistItem = {
          _id: data.data?._id || Date.now().toString(),
          productId: product._id || product.id,
          product: product,
          createdAt: new Date().toISOString()
        };
        
        setWishlistItems(prev => [...prev, newWishlistItem]);
        if (process.env.NODE_ENV === 'development') {
          // console.log('Product added to wishlist successfully');
        }
        return true;
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // إزالة منتج من الأمنيات
  const removeFromWishlist = useCallback(async (productId) => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Store ID and slug not available for removing from wishlist');
      }
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log('Removing product from wishlist:', productId);
    }

    setLoading(true);
    setError(null);

    try {
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;
      
      const response = await fetch(`${API_BASE_URL}/likes/${productId}?${queryParam}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      if (process.env.NODE_ENV === 'development') {
        // console.log('Remove from wishlist response:', { status: response.status, data });
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first');
        } else if (response.status === 404) {
          throw new Error('Like not found');
        }
        throw new Error(data.message || 'Failed to remove from wishlist');
      }

      if (data.success) {
        setWishlistItems(prev => {
          const updatedItems = prev.filter(item => {
            const itemProductId = item.productId || item._id || (item.product && item.product._id);
            return itemProductId !== productId;
          });
          
          if (process.env.NODE_ENV === 'development') {
            // console.log('Product removed from wishlist successfully');
          }
          return updatedItems;
        });
        return true;
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // التحقق من وجود منتج في الأمنيات
  const isInWishlist = useCallback((productId) => {
    const result = wishlistItems.some(item => {
      const itemProductId = item.productId || item._id || (item.product && item.product._id);
      return itemProductId === productId;
    });
    return result;
  }, [wishlistItems]);

  // تبديل حالة المنتج في الأمنيات
  const toggleWishlist = useCallback(async (product) => {
    const productId = product._id || product.id;
    
    // التحقق من وجود المنتج في القائمة الحالية
    const isCurrentlyInWishlist = wishlistItems.some(item => {
      const itemProductId = item.productId || item._id || (item.product && item.product._id);
      return itemProductId === productId;
    });
    
    if (isCurrentlyInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  }, [wishlistItems, removeFromWishlist, addToWishlist]);

  // مسح جميع الأمنيات
  const clearWishlist = useCallback(async () => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Store ID and slug not available for clearing wishlist');
      }
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // حذف كل منتج على حدة
      const currentWishlistItems = [...wishlistItems];
      const deletePromises = currentWishlistItems.map(item => {
        const productId = item.productId || item._id;
        // Use storeId if available, otherwise use storeSlug
        const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;
        
        return fetch(`${API_BASE_URL}/likes/${productId}?${queryParam}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
      });

      await Promise.all(deletePromises);
      
      // تحديث الحالة المحلية مباشرة
      setWishlistItems([]);
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('Wishlist cleared successfully');
      }
      return true;
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [wishlistItems, getStoreId, getStoreSlug, getHeaders]);

  // دمج guest likes مع user likes عند تسجيل الدخول
  const mergeGuestLikesAfterLogin = useCallback(async () => {
    try {
      const guestId = getStoredGuestId();
      if (!guestId) {
        if (process.env.NODE_ENV === 'development') {
          // console.log('ℹ️ No guest ID found, nothing to merge');
        }
        return;
      }

      const currentStoreId = getStoreId();
      if (!currentStoreId) {
        if (process.env.NODE_ENV === 'development') {
          //  console.log('ℹ️ No store ID found, cannot merge guest likes');
        }
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        // console.log('🔄 Merging guest likes to user account...');
      }

      const response = await fetch(`${API_BASE_URL}/likes/merge-guest`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          guestId: guestId,
          storeId: currentStoreId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        if (process.env.NODE_ENV === 'development') {
          // console.log('✅ Guest likes merged successfully:', result.message);
          // console.log(`📊 Merged: ${result.mergedCount}, Skipped: ${result.skippedCount}`);
        }
        
        // حذف Guest ID من localStorage بعد الدمج الناجح
        clearGuestId();
        
        // إعادة جلب اللايكات المحدثة
        await fetchWishlist();
        
        return result;
      } else {
        if (process.env.NODE_ENV === 'development') {
          // console.error('❌ Failed to merge guest likes:', result.message);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Error merging guest likes:', error);
      return null;
    }
  }, [getStoredGuestId, getStoreId, getHeaders, clearGuestId, fetchWishlist]);

  // تهيئة النظام عند تحميل الصفحة
  const initializeGuestSystem = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🚀 Initializing guest system...');
    }
    
    // Ensure we have a stable Guest ID
    const guestId = generateStableGuestId();
    if (guestId) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('👤 Guest session ready:', guestId);
      }
    }
  }, [generateStableGuestId]);

  // Auto-fetch wishlist when store changes (only once per store)
  useEffect(() => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    const storeIdentifier = currentStoreId || currentStoreSlug;
    
    // Only fetch if we have a store identifier and haven't initialized for this store
    if (storeIdentifier && (!hasInitialized.current || storeId.current !== storeIdentifier)) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Initializing wishlist for store:', storeIdentifier);
      }
      hasInitialized.current = true;
      storeId.current = storeIdentifier;
      
      // تهيئة نظام الضيوف أولاً
      initializeGuestSystem().then(() => {
        // ثم جلب اللايكات
        fetchWishlist();
      });
    } else if (!storeIdentifier && wishlistItems.length > 0) {
      // Clear wishlist if no store is available
      if (process.env.NODE_ENV === 'development') {
        // console.log('No store available, clearing wishlist');
      }
      setWishlistItems([]);
      hasInitialized.current = false;
      storeId.current = null;
    }
  }, [store?._id, store?.slug, getStoreId, getStoreSlug, fetchWishlist, wishlistItems.length, initializeGuestSystem]);

  // Monitor authentication state changes to merge guest likes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is authenticated, clear guest ID and fetch user's wishlist
      if (process.env.NODE_ENV === 'development') {
        // console.log('🔐 User authenticated, clearing guest ID and fetching user wishlist');
      }
      clearGuestId();
      fetchWishlist();
    } else if (!isAuthenticated) {
      // User is not authenticated, ensure guest system is initialized
      if (process.env.NODE_ENV === 'development') {
        // console.log('👤 User not authenticated, initializing guest system');
      }
      initializeGuestSystem();
    }
  }, [isAuthenticated, user, clearGuestId, fetchWishlist, initializeGuestSystem]);

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
    mergeGuestLikesAfterLogin,
    count: wishlistItems.length,
    wishlist: wishlistItems,
    items: wishlistItems,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};