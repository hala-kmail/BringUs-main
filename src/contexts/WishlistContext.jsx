import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const { store } = useAppData();
  const currentLang = i18n.language;

  // جلب الأمنيات من API
  const fetchWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlistItems([]);
      return;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      console.log('Store object:', store);
      setWishlistItems([]);
      return;
    }

    console.log('Store information available:', {
      storeId: store._id,
      storeName: store.nameAr || store.nameEn,
      storeSlug: store.slug
    });

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/likes?storeId=${store._id}`, {
        method: 'GET',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setWishlistItems([]);
          return;
        }
        throw new Error(data.message || 'Failed to fetch wishlist');
      }

      if (data.success && data.data) {
        setWishlistItems(data.data);
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
  }, [store]);

  // إضافة منتج للأمنيات
  const addToWishlist = useCallback(async (product) => {
    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      console.log('Store object:', store);
      return false;
    }

    console.log('Store information available:', {
      storeId: store._id,
      storeName: store.nameAr || store.nameEn,
      storeSlug: store.slug
    });

    setLoading(true);
    setError(null);

    try {
      const productId = product._id || product.id;
      const requestBody = {
        storeId: store._id
      };

      console.log('Adding to wishlist - Request details:', {
        url: `${API_BASE_URL}/likes/${productId}`,
        method: 'POST',
        storeId: store._id,
        productId: productId,
        requestBody: requestBody
      });

      // محاولة إرسال storeId في query parameters بدلاً من body
      const response = await fetch(`${API_BASE_URL}/likes/${productId}?storeId=${store._id}`, {
        method: 'POST',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('Adding to wishlist - Response:', {
        status: response.status,
        data: data
      });

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
        return true;
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [store]);

  // إزالة منتج من الأمنيات
  const removeFromWishlist = useCallback(async (productId) => {
    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      console.log('Store object:', store);
      return false;
    }

    console.log('Store information available:', {
      storeId: store._id,
      storeName: store.nameAr || store.nameEn,
      storeSlug: store.slug
    });

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        storeId: store._id
      };

      console.log('Removing from wishlist - Request details:', {
        url: `${API_BASE_URL}/likes/${productId}?storeId=${store._id}`,
        method: 'DELETE',
        storeId: store._id,
        productId: productId,
        requestBody: requestBody
      });

      // محاولة إرسال storeId في query parameters بدلاً من body
      const response = await fetch(`${API_BASE_URL}/likes/${productId}?storeId=${store._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('Removing from wishlist - Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first');
        } else if (response.status === 404) {
          throw new Error('Like not found');
        }
        throw new Error(data.message || 'Failed to remove from wishlist');
      }

      if (data.success) {
        setWishlistItems(prev => prev.filter(item => {
          const itemProductId = item.productId || item._id || (item.product && item.product._id);
          return itemProductId !== productId;
        }));
        return true;
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [store]);

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
    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      console.log('Store object:', store);
      return false;
    }

    console.log('Store information available:', {
      storeId: store._id,
      storeName: store.nameAr || store.nameEn,
      storeSlug: store.slug
    });

    setLoading(true);
    setError(null);

    try {
      // حذف كل منتج على حدة
      const currentWishlistItems = [...wishlistItems];
      const deletePromises = currentWishlistItems.map(item => {
        const productId = item.productId || item._id;
        const requestBody = {
          storeId: store._id
        };
        
        return fetch(`${API_BASE_URL}/likes/${productId}?storeId=${store._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': getBearerToken(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      });

      await Promise.all(deletePromises);
      
      // تحديث الحالة المحلية مباشرة
      setWishlistItems([]);
      
      return true;
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [wishlistItems, store]);

  // جلب الأمنيات عند تحميل الصفحة
  useEffect(() => {
    const token = getToken();
    if (token && store && store._id) {
      fetchWishlist();
    }
  }, [fetchWishlist, store]);

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