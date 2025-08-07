import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken, getBearerToken } from '../utils/tokenManager';
import { useAppData } from './AppDataContext';
import Toast from '../components/Toast/Toast';
import { getEffectivePrice } from '../utils/productUtils';

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
    const token = getToken();
    if (!token) {
      setCartItems([]);
      return;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching cart - Request details:', {
        url: `${API_BASE_URL}/cart?storeId=${store._id}`,
        method: 'GET',
        storeId: store._id
      });

      const response = await fetch(`${API_BASE_URL}/cart?storeId=${store._id}`, {
        method: 'GET',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

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
  }, [store]);

  // جلب الكارت عند تحميل الصفحة
  useEffect(() => {
    const token = getToken();
    if (token && store && store._id) {
      fetchCart();
    }
  }, [fetchCart, store]);

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

    const token = getToken();
    if (!token) {
      showToast(currentLang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      console.log('Store object:', store);
      showToast(currentLang === 'ar' ? 'معلومات المتجر غير متوفرة' : 'Store information not available', 'error');
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
      // الحصول على السعر الصحيح (بعد الخصم)
      const finalPrice = getEffectivePrice(product);
      
      const requestBody = {
        product: product._id || product.id,
        quantity: quantity,
        storeId: store._id,
        price: finalPrice // إضافة السعر الصحيح للطلب
      };

      // إضافة المواصفات المختارة
      const selectedSpecifications = formatSpecifications(otherSpecs);
      if (selectedSpecifications.length > 0) {
        requestBody.selectedSpecifications = selectedSpecifications;
      }

      // إضافة الألوان المختارة
      if (selectedColor) {
        requestBody.selectedColors = [selectedColor];
      }

      console.log('Adding to cart - Request details:', {
        url: `${API_BASE_URL}/cart?storeId=${store._id}`,
        method: 'POST',
        storeId: store._id,
        productId: product._id || product.id,
        requestBody: requestBody,
        productPrice: product.price,
        productFinalPrice: product.finalPrice,
        sentPrice: finalPrice
      });

      const response = await fetch(`${API_BASE_URL}/cart?storeId=${store._id}`, {
        method: 'POST',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

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
  }, [currentLang, fetchCart, store]);

  // إزالة منتج من الكارت
  const removeFromCart = useCallback(async (productId) => {
    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Removing from cart - Request details:', {
        url: `${API_BASE_URL}/cart/${productId}?storeId=${store._id}`,
        method: 'DELETE',
        storeId: store._id,
        productId: productId
      });

      const response = await fetch(`${API_BASE_URL}/cart/${productId}?storeId=${store._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

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
  }, [fetchCart, store]);

  // تحديث كمية منتج في الكارت
  const updateQuantity = useCallback(async (productId, newQuantity, options = {}) => {
    const { 
      selectedColor = '', 
      ...otherSpecs 
    } = options;

    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = { 
        quantity: newQuantity,
        storeId: store._id
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

      console.log('Updating cart quantity - Request details:', {
        url: `${API_BASE_URL}/cart/${productId}?storeId=${store._id}`,
        method: 'PUT',
        storeId: store._id,
        productId: productId,
        requestBody: requestBody
      });

      const response = await fetch(`${API_BASE_URL}/cart/${productId}?storeId=${store._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

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
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart, store]);

  // مسح الكارت بالكامل
  const clearCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return false;
    }

    if (!store || !store._id) {
      console.error('Store information not available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Clearing cart - Request details:', {
        url: `${API_BASE_URL}/cart?storeId=${store._id}`,
        method: 'DELETE',
        storeId: store._id
      });

      const response = await fetch(`${API_BASE_URL}/cart?storeId=${store._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

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
  }, [store]);

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

  // الحصول على كمية منتج في الكارت
  const getItemQuantity = (productId, selectedColor = '', otherSpecs = {}) => {
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
    toast
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