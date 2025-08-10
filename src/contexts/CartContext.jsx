import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken, getBearerToken } from '../utils/tokenManager';
import { useAppData } from './AppDataContext';
import Toast from '../components/Toast/Toast';
import { getEffectivePrice, getPriceByUserRole } from '../utils/productUtils';

const API_BASE_URL = 'http://localhost:5001/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const { i18n } = useTranslation();
  const { store } = useAppData();
  const currentLang = i18n.language;
  const hasInitialized = useRef(false);
  const storeId = useRef(null);

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
      console.log('📂 Retrieved Guest ID from localStorage:', guestId);
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
    
    // Ensure we have a Guest ID (generate if needed)
    const guestId = generateStableGuestId();
    if (guestId) {
      headers['X-Guest-ID'] = guestId;
    }
    
    // Add authorization header if user is logged in
    if (token) {
      headers['Authorization'] = getBearerToken();
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

  // Helper functions to work with real API data
  const getDefaultAreaIdFromLocalStorage = () => {
    return localStorage.getItem('defaultAreaId') || null;
  };

  const getShippingPriceByAreaId = (areaId) => {
    // This should be implemented based on your delivery areas API
    // For now, return a default value
    return 0;
  };

  // جلب الكارت من API
  const fetchCart = useCallback(async () => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for fetching cart');
      }
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;
      
      console.log('Fetching cart - Request details:', {
        url: `${API_BASE_URL}/cart?${queryParam}`,
        method: 'GET',
        storeId: currentStoreId,
        storeSlug: currentStoreSlug
      });

      const response = await fetch(`${API_BASE_URL}/cart?${queryParam}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      console.log('Fetching cart - Response:', {
        status: response.status,
        data: data,
        items: data.data?.items?.map(item => ({
          productId: item.product,
          price: item.price,
          finalPrice: item.product.finalPrice,
          priceAtAdd: item.priceAtAdd,
          quantity: item.quantity
        }))
      });

      if (!response.ok) {
        if (response.status === 401) {
          setCartItems([]);
          return;
        }
        throw new Error(data.message || 'Failed to fetch cart');
      }

      if (data.success && data.data) {
        // إضافة finalPrice لكل عنصر إذا لم يكن موجوداً
        const itemsWithFinalPrice = (data.data.items || []).map(item => {
          if (!item.product.finalPrice && item.product) {
            // إذا لم يكن هناك finalPrice، استخدم priceAtAdd أو price
            return {
              ...item,
              finalPrice: item.priceAtAdd || item.price || 0
            };
          }
          return item;
        });
        setCartItems(itemsWithFinalPrice);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // جلب الكارت عند تحميل الصفحة
  useEffect(() => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    const storeIdentifier = currentStoreId || currentStoreSlug;
    
    // Only fetch if we have a store identifier and haven't initialized for this store
    if (storeIdentifier && (!hasInitialized.current || storeId.current !== storeIdentifier)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Initializing cart for store:', storeIdentifier);
      }
      hasInitialized.current = true;
      storeId.current = storeIdentifier;
      
      // تهيئة نظام الضيوف أولاً
      initializeGuestSystem().then(() => {
        // ثم جلب الكارت
        fetchCart();
      });
    } else if (!storeIdentifier && cartItems.length > 0) {
      // Clear cart if no store is available
      if (process.env.NODE_ENV === 'development') {
        console.log('No store available, clearing cart');
      }
      setCartItems([]);
      hasInitialized.current = false;
      storeId.current = null;
    }
  }, [store?._id, store?.slug, getStoreId, getStoreSlug, fetchCart, cartItems.length]);

  // تهيئة النظام عند تحميل الصفحة
  const initializeGuestSystem = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Initializing guest cart system...');
    }
    
    // Ensure we have a stable Guest ID
    const guestId = generateStableGuestId();
    if (guestId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 Guest cart session ready:', guestId);
      }
    }
  }, [generateStableGuestId]);

  // دالة لإظهار الإشعارات
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // دالة لإخفاء الإشعارات
  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // دالة لتحويل المواصفات إلى التنسيق المطلوب
  const formatSpecifications = (specs) => {
    const selectedSpecifications = [];
    
    Object.entries(specs).forEach(([specificationId, specData]) => {
      if (specData && specData !== '' && specificationId !== 'selectedColor' && specificationId !== 'quantity') {
        // إذا كان specData كائن يحتوي على valueId (البنية الجديدة)
        if (typeof specData === 'object' && specData.valueId) {
          selectedSpecifications.push({
            specificationId: specificationId, // هذا هو ObjectId
            valueId: specData.valueId,
            valueAr: specData.valueAr || specData.value,
            valueEn: specData.valueEn || specData.value,
            titleAr: specData.titleAr || specData.title || specificationId,
            titleEn: specData.titleEn || specData.title || specificationId
          });
        } else if (typeof specData === 'object' && specData._id) {
          // للتوافق مع البنية القديمة
          selectedSpecifications.push({
            specificationId: specData._id,
            valueId: specData.value || specData.name || specData,
            valueAr: specData.valueAr || specData.value || specData.name || specData,
            valueEn: specData.valueEn || specData.value || specData.name || specData,
            titleAr: specData.titleAr || specData.title || specificationId,
            titleEn: specData.titleEn || specData.title || specificationId
          });
        } else {
          // إذا كان specData نص عادي (للتوافق مع البنية القديمة)
          selectedSpecifications.push({
            specificationId: specificationId,
            valueId: specData,
            valueAr: specData,
            valueEn: specData,
            titleAr: specificationId,
            titleEn: specificationId
          });
        }
      }
    });
    
    return selectedSpecifications;
  };

  // إضافة منتج للكارت
  const addToCart = useCallback(async (product, options = {}) => {
    const { 
      selectedColor = '', 
      quantity = 1,
      ...otherSpecs // جميع المواصفات الأخرى
    } = options;

    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for adding to cart');
      }
      showToast(currentLang === 'ar' ? 'معلومات المتجر غير متوفرة' : 'Store information not available', 'error');
      return false;
    }

    console.log('Store information available:', {
      storeId: currentStoreId,
      storeSlug: currentStoreSlug,
      storeName: store?.nameAr || store?.nameEn
    });

    setLoading(true);
    setError(null);

    try {
      // الحصول على السعر الصحيح حسب دور المستخدم
      const finalPrice = getPriceByUserRole(product);
      
      const requestBody = {
        product: product._id || product.id,
        quantity: quantity,
        price: finalPrice // إضافة السعر الصحيح للطلب
      };

      // إضافة storeId أو storeSlug
      if (currentStoreId) {
        requestBody.storeId = currentStoreId;
      } else if (currentStoreSlug) {
        requestBody.storeSlug = currentStoreSlug;
      }

      // إضافة المواصفات المختارة
      const selectedSpecifications = formatSpecifications(otherSpecs);
      if (selectedSpecifications.length > 0) {
        requestBody.selectedSpecifications = selectedSpecifications;
      }

      // إضافة الألوان المختارة
      if (selectedColor) {
        requestBody.selectedColors = [selectedColor];
      }

      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;

      console.log('Adding to cart - Request details:', {
        url: `${API_BASE_URL}/cart?${queryParam}`,
        method: 'POST',
        storeId: currentStoreId,
        storeSlug: currentStoreSlug,
        productId: product._id || product.id,
        requestBody: requestBody,
        productPrice: product.price,
        productFinalPrice: product.finalPrice,
        sentPrice: finalPrice
      });

      const response = await fetch(`${API_BASE_URL}/cart?${queryParam}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestBody),
      });

      const data = await handleApiResponse(response);

      console.log('Adding to cart - Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid request');
        } else if (response.status === 401) {
          throw new Error('Please login first');
        }
        throw new Error(data.message || 'Failed to add to cart');
      }

      if (data.success) {
        // تحديث الكارت من API
        await fetchCart();
        
        // إظهار رسالة نجاح
        const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
        const message = currentLang === 'ar' 
          ? `تم إضافة ${productName} إلى السلة بنجاح!`
          : `${productName} added to cart successfully!`;
        
        showToast(message, 'success');
        return true;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentLang, fetchCart, getStoreId, getStoreSlug, getHeaders, handleApiResponse, store]);

  // إزالة منتج من الكارت
  const removeFromCart = useCallback(async (productId) => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for removing from cart');
      }
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;

      console.log('Removing from cart - Request details:', {
        url: `${API_BASE_URL}/cart/${productId}?${queryParam}`,
        method: 'DELETE',
        storeId: currentStoreId,
        storeSlug: currentStoreSlug,
        productId: productId
      });

      const response = await fetch(`${API_BASE_URL}/cart/${productId}?${queryParam}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      console.log('Removing from cart - Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first');
        }
        throw new Error(data.message || 'Failed to remove from cart');
      }

      if (data.success) {
        // تحديث الكارت من API
        await fetchCart();
        return true;
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart, getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // دالة للحصول على الكمية المتوفرة لعنصر معين في الكارت
  const getAvailableQuantityForCartItem = useCallback((productId, selectedColor = '', otherSpecs = {}) => {
    // البحث عن المنتج في الكارت للحصول على بيانات المنتج
    const cartItem = cartItems.find(item => {
      const matchesProduct = item.product === productId || item.product._id === productId;
      return matchesProduct;
    });

    if (!cartItem) {
      return 0;
    }

    const product = cartItem.product;
    
    // إذا كان المنتج يحتوي على مواصفات محددة
    if (Object.keys(otherSpecs).length > 0) {
      // البحث عن المواصفة المحددة في specificationValues
      if (product.specificationValues && product.specificationValues.length > 0) {
        // البحث عن المواصفات المختارة في specificationValues
        for (const [specName, specData] of Object.entries(otherSpecs)) {
          const valueId = typeof specData === 'object' && specData.valueId ? specData.valueId : specData;
          
          // البحث عن المواصفة المطابقة
          const matchingSpec = product.specificationValues.find(spec => 
            spec.specificationId === specName && spec.valueId === valueId
          );
          
          if (matchingSpec) {
            return matchingSpec.quantity || 0;
          }
        }
      }
    }
    
    // إذا لم تكن هناك مواصفات محددة، استخدم الكمية العامة للمنتج
    return product.availableQuantity || product.stock || 0;
  }, [cartItems]);

  // تحديث كمية منتج في الكارت
  const updateQuantity = useCallback(async (productId, newQuantity, options = {}) => {
    const { 
      selectedColor = '', 
      ...otherSpecs 
    } = options;

    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for updating cart');
      }
      return false;
    }

    // التحقق من الكمية المتوفرة قبل التحديث
    const availableQuantity = getAvailableQuantityForCartItem(productId, selectedColor, otherSpecs);
    
    if (newQuantity > availableQuantity) {
      const message = currentLang === 'ar' 
        ? `الكمية المتوفرة هي ${availableQuantity} فقط`
        : `Only ${availableQuantity} items available`;
      showToast(message, 'error');
      return false;
    }

    if (newQuantity < 1) {
      // إذا كانت الكمية أقل من 1، احذف المنتج من الكارت
      return await removeFromCart(productId);
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = { 
        quantity: newQuantity
      };

      // إضافة المواصفات المختارة إذا تم تمريرها
      const selectedSpecifications = formatSpecifications(otherSpecs);
      if (selectedSpecifications.length > 0) {
        requestBody.selectedSpecifications = selectedSpecifications;
      }

      // إضافة الألوان المختارة إذا تم تمريرها
      if (selectedColor) {
        requestBody.selectedColors = [selectedColor];
      }

      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;

      console.log('Updating cart quantity - Request details:', {
        url: `${API_BASE_URL}/cart/${productId}?${queryParam}`,
        method: 'PUT',
        storeId: currentStoreId,
        storeSlug: currentStoreSlug,
        productId: productId,
        requestBody: requestBody,
        availableQuantity: availableQuantity,
        requestedQuantity: newQuantity
      });

      const response = await fetch(`${API_BASE_URL}/cart/${productId}?${queryParam}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(requestBody),
      });

      const data = await handleApiResponse(response);

      console.log('Updating cart quantity - Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid quantity');
        } else if (response.status === 401) {
          throw new Error('Please login first');
        }
        throw new Error(data.message || 'Failed to update cart');
      }

      if (data.success) {
        // تحديث الكارت من API
        await fetchCart();
        return true;
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart, getStoreId, getStoreSlug, getHeaders, handleApiResponse, currentLang, showToast, removeFromCart]);

  // الحصول على كمية منتج في الكارت
  const getItemQuantity = useCallback((productId, selectedColor = '', otherSpecs = {}) => {
    const item = cartItems.find(item => {
      const matchesProduct = item.product === productId || item.product._id === productId;
      
      // إذا لم يتم تحديد مواصفات، نتحقق من المنتج فقط
      if (!selectedColor && Object.keys(otherSpecs).length === 0) {
        return matchesProduct;
      }
      
      // التحقق من الألوان
      if (selectedColor) {
        const hasColor = item.selectedColors && item.selectedColors.includes(selectedColor);
        if (!hasColor) return false;
      }
      
      // التحقق من المواصفات
      if (Object.keys(otherSpecs).length > 0) {
        if (!item.selectedSpecifications || item.selectedSpecifications.length === 0) {
          return false;
        }
        
        // التحقق من كل مواصفة
        for (const [specName, specData] of Object.entries(otherSpecs)) {
          // إذا كان specData كائن يحتوي على valueId
          const valueId = typeof specData === 'object' && specData.valueId ? specData.valueId : specData;
          const hasSpec = item.selectedSpecifications.some(spec => 
            spec.specificationId === specName && spec.valueId === valueId
          );
          if (!hasSpec) return false;
        }
      }
      
      return matchesProduct;
    });
    return item ? item.quantity : 0;
  }, [cartItems]);

  // دالة للتحقق من إمكانية زيادة الكمية
  const canIncreaseQuantity = useCallback((productId, selectedColor = '', otherSpecs = {}) => {
    const currentQuantity = getItemQuantity(productId, selectedColor, otherSpecs);
    const availableQuantity = getAvailableQuantityForCartItem(productId, selectedColor, otherSpecs);
    
    // التحقق من أن الكمية الحالية أقل من الكمية المتوفرة وأن الكمية المتوفرة أكبر من صفر
    return currentQuantity < availableQuantity && availableQuantity > 0;
  }, [getItemQuantity, getAvailableQuantityForCartItem]);
  

  // دالة للتحقق من إمكانية تقليل الكمية
  const canDecreaseQuantity = useCallback((productId, selectedColor = '', otherSpecs = {}) => {
    const currentQuantity = getItemQuantity(productId, selectedColor, otherSpecs);
    return currentQuantity > 1;
  }, [getItemQuantity]);

  // مسح الكارت بالكامل
  const clearCart = useCallback(async () => {
    const currentStoreId = getStoreId();
    const currentStoreSlug = getStoreSlug();
    
    if (!currentStoreId && !currentStoreSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store ID and slug not available for clearing cart');
      }
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Use storeId if available, otherwise use storeSlug
      const queryParam = currentStoreId ? `storeId=${currentStoreId}` : `storeSlug=${currentStoreSlug}`;

      console.log('Clearing cart - Request details:', {
        url: `${API_BASE_URL}/cart?${queryParam}`,
        method: 'DELETE',
        storeId: currentStoreId,
        storeSlug: currentStoreSlug
      });

      const response = await fetch(`${API_BASE_URL}/cart?${queryParam}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await handleApiResponse(response);

      console.log('Clearing cart - Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first');
        }
        throw new Error(data.message || 'Failed to clear cart');
      }

      if (data.success) {
        setCartItems([]);
        return true;
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, getStoreSlug, getHeaders, handleApiResponse]);

  // دمج guest cart مع user cart عند تسجيل الدخول
  const mergeGuestCartAfterLogin = useCallback(async () => {
    try {
      const guestId = getStoredGuestId();
      if (!guestId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ No guest ID found, nothing to merge');
        }
        return;
      }

      const currentStoreId = getStoreId();
      if (!currentStoreId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ No store ID found, cannot merge guest cart');
        }
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Merging guest cart to user account...');
      }

      const response = await fetch(`${API_BASE_URL}/cart/merge-guest`, {
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
          console.log('✅ Guest cart merged successfully:', result.message);
          console.log(`📊 Merged: ${result.mergedCount}, Updated: ${result.updatedCount}`);
        }
        
        // حذف Guest ID من localStorage بعد الدمج الناجح
        clearGuestId();
        
        // إعادة جلب الكارت المحدث
        await fetchCart();
        
        return result;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to merge guest cart:', result.message);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Error merging guest cart:', error);
      return null;
    }
  }, [getStoredGuestId, getStoreId, getHeaders, clearGuestId, fetchCart]);

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      // استخدم السعر الصحيح (بعد الخصم)
      const itemPrice = item.product.finalPrice || item.price || 0;
      return total + (itemPrice * (item.quantity || 1));
    }, 0);

    // Count unique products instead of total quantity
    const itemsCount = cartItems.length;

    // الشحن: يمكنك تعديله حسب الحاجة
    const shipping = getShippingPriceByAreaId(getDefaultAreaIdFromLocalStorage());
    const total = subtotal + shipping;

    return {
      subtotal,
      shipping,
      total,
      itemsCount
    };
  };

  // التحقق من وجود منتج في الكارت
  const isInCart = (productId, selectedColor = '', otherSpecs = {}) => {
    return cartItems.some(item => {
      const matchesProduct = item.product === productId || item.product._id === productId;
      
      // إذا لم يتم تحديد مواصفات، نتحقق من المنتج فقط
      if (!selectedColor && Object.keys(otherSpecs).length === 0) {
        return matchesProduct;
      }
      
      // التحقق من الألوان
      if (selectedColor) {
        const hasColor = item.selectedColors && item.selectedColors.includes(selectedColor);
        if (!hasColor) return false;
      }
      
      // التحقق من المواصفات
      if (Object.keys(otherSpecs).length > 0) {
        if (!item.selectedSpecifications || item.selectedSpecifications.length === 0) {
          return false;
        }
        
        // التحقق من كل مواصفة
        for (const [specName, specData] of Object.entries(otherSpecs)) {
          // إذا كان specData كائن يحتوي على valueId
          const valueId = typeof specData === 'object' && specData.valueId ? specData.valueId : specData;
          const hasSpec = item.selectedSpecifications.some(spec => 
            spec.specificationId === specName && spec.valueId === valueId
          );
          if (!hasSpec) return false;
        }
      }
      
      return matchesProduct;
    });
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    isInCart,
    getItemQuantity,
    fetchCart,
    showToast,
    hideToast,
    toast,
    mergeGuestCartAfterLogin,
    canIncreaseQuantity,
    canDecreaseQuantity,
    getAvailableQuantityForCartItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </CartContext.Provider>
  );
};

export default CartContext; 