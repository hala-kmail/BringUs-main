import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from '../components/Toast/Toast';
import { getToken, getBearerToken } from '../utils/tokenManager';

const API_BASE_URL = 'http://localhost:5001/api';

const useWishlistAPI = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  //------------------------------------- جلب الأمنيات من API -------------------------------------
  const fetchWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log('No auth token found, cannot fetch wishlist');
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/likes`, {
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
  }, []);
  //------------------------------------- إضافة منتج للأمنيات -------------------------------------
  const addToWishlist = useCallback(async (product) => {
    const token = getToken();
    if (!token) {
    //   showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'error');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const productId = product._id || product.id;
      const response = await fetch(`${API_BASE_URL}/likes/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

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
        // تحديث الحالة المحلية مباشرة بدلاً من إعادة جلب البيانات
        const newWishlistItem = {
          _id: data.data?._id || Date.now().toString(),
          productId: product._id || product.id,
          product: product,
          createdAt: new Date().toISOString()
        };
        
        setWishlistItems(prev => [...prev, newWishlistItem]);
        
       
        
    //     showToast(message, 'success');
        return true;
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
    //   showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  //------------------------------------- إزالة منتج من الأمنيات -------------------------------------
  const removeFromWishlist = useCallback(async (productId) => {
    const token = getToken();
    if (!token) {
    //   showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'error');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/likes/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first');
        } else if (response.status === 404) {
          throw new Error('Like not found');
        }
        throw new Error(data.message || 'Failed to remove from wishlist');
      }

      if (data.success) {
        // تحديث الحالة المحلية مباشرة بدلاً من إعادة جلب البيانات
        setWishlistItems(prev => {
          const updatedItems = prev.filter(item => {
            const itemProductId = item.productId || item._id || (item.product && item.product._id);
            return itemProductId !== productId;
          });
          
          // الحصول على اسم المنتج قبل حذفه
          const removedProduct = prev.find(item => {
            const itemProductId = item.productId || item._id || (item.product && item.product._id);
            return itemProductId === productId;
          });
          
          const productName = removedProduct?.product?.name?.[currentLang] || removedProduct?.product?.name?.ar || removedProduct?.product?.name?.en || removedProduct?.product?.name;
          const message = currentLang === 'ar' 
            ? `تم إزالة ${productName} من المفضلة بنجاح!`
            : `${productName} removed from wishlist successfully!`;
          
        //     showToast(message, 'success');
          return updatedItems;
        });
        
        return true;
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
    //   showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  //-- التحقق من وجود منتج في الأمنيات
  const isInWishlist = useCallback((productId) => {
    const result = wishlistItems.some(item => {
      // التحقق من مختلف أشكال البيانات من API
      const itemProductId = item.productId || item._id || (item.product && item.product._id) || item.productId;
      return itemProductId === productId;
    });
    
    return result;
  }, [wishlistItems]);

  //------------------------------------- تبديل حالة المنتج في الأمنيات -------------------------------------
  const toggleWishlist = useCallback(async (product) => {
    const productId = product._id || product.id;
    
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  //------------------------------------- مسح جميع الأمنيات (لا يوجد endpoint لهذا في الباك إند الحالي) -------------------------------------
  const clearWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
    //   showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'error');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // حذف كل منتج على حدة
      const deletePromises = wishlistItems.map(item => {
        const productId = item.productId || item._id;
        return fetch(`${API_BASE_URL}/likes/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': getBearerToken(),
            'Content-Type': 'application/json',
          },
        });
      });

      await Promise.all(deletePromises);
      
      // تحديث الحالة المحلية مباشرة
      setWishlistItems([]);
      
      const message = currentLang === 'ar' 
        ? 'تم مسح جميع المفضلة بنجاح!'
        : 'All wishlist items cleared successfully!';
      
    //   showToast(message, 'success');
      return true;
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      setError(err.message);
    //   showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [wishlistItems, currentLang]);

  //------------------------------------- جلب الأمنيات عند تحميل الصفحة -------------------------------------
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchWishlist();
    }
  }, []); // إزالة fetchWishlist من dependencies

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
    count: wishlistItems.length, // إضافة count للتوافق مع المكونات
    wishlist: wishlistItems, // إضافة wishlist للتوافق مع المكونات
    items: wishlistItems, // إضافة items للتوافق مع المكونات
  };
};

export default useWishlistAPI; 