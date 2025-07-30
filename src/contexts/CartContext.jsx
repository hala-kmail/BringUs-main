import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from '../components/Toast/Toast';
import { getDefaultAreaIdFromLocalStorage, getShippingPriceByAreaId } from '../data/deliveryAreas';
import { getEffectivePrice } from '../utils/productUtils';
import { getToken, getBearerToken } from '../utils/tokenManager';

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
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

  // جلب الكارت من API
  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setCartItems([]);
          return;
        }
        throw new Error(data.message || 'Failed to fetch cart');
      }

      if (data.success && data.data) {
        setCartItems(data.data.items || []);
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
  }, []);

  // جلب الكارت عند تحميل الصفحة
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // دالة لإظهار الإشعارات
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // دالة لإخفاء الإشعارات
  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // إضافة منتج للكارت
  const addToCart = useCallback(async (product, options = {}) => {
    const { 
      selectedColor = '', 
      quantity = 1,
      ...otherSpecs // جميع المواصفات الأخرى (بما في ذلك الحجم)
    } = options;

    const token = getToken();
    if (!token) {
      showToast(currentLang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        product: product._id || product.id,
        quantity: quantity
      };

      // تجميع جميع المواصفات في variant
      const variantParts = [];
      
      if (selectedColor) {
        variantParts.push(`Color:${selectedColor}`);
      }
      
      // إضافة جميع المواصفات الأخرى (بما في ذلك الحجم)
      Object.entries(otherSpecs).forEach(([specName, specValue]) => {
        if (specValue && specValue !== '') {
          variantParts.push(`${specName}:${specValue}`);
        }
      });
      
      // إنشاء variant string
      if (variantParts.length > 0) {
        requestBody.variant = variantParts.join('|');
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

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
  }, [currentLang, fetchCart]);

  // إزالة منتج من الكارت
  const removeFromCart = useCallback(async (productId) => {
    const token = getToken();
    if (!token) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
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
  }, [fetchCart]);

  // تحديث كمية منتج في الكارت
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    const token = getToken();
    if (!token) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

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
  }, [fetchCart]);

  // مسح الكارت بالكامل
  const clearCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
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
  }, []);

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      // استخدم priceAtAdd المخزن في السلة
      return total + ((item.priceAtAdd || 0) * (item.quantity || 1));
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
      
      // التحقق من المواصفات
      if (!item.variant) return false;
      
      const variantParts = item.variant.split('|');
      const variantSpecs = {};
      
      variantParts.forEach(part => {
        const [specName, specValue] = part.split(':');
        if (specName && specValue) {
          variantSpecs[specName] = specValue;
        }
      });
      
      // التحقق من اللون
      if (selectedColor && variantSpecs.Color !== selectedColor) return false;
      
      // التحقق من باقي المواصفات (بما في ذلك الحجم)
      for (const [specName, specValue] of Object.entries(otherSpecs)) {
        if (specValue && variantSpecs[specName] !== specValue) return false;
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
      
      // التحقق من المواصفات
      if (!item.variant) return false;
      
      const variantParts = item.variant.split('|');
      const variantSpecs = {};
      
      variantParts.forEach(part => {
        const [specName, specValue] = part.split(':');
        if (specName && specValue) {
          variantSpecs[specName] = specValue;
        }
      });
      
      // التحقق من اللون
      if (selectedColor && variantSpecs.Color !== selectedColor) return false;
      
      // التحقق من باقي المواصفات (بما في ذلك الحجم)
      for (const [specName, specValue] of Object.entries(otherSpecs)) {
        if (specValue && variantSpecs[specName] !== specValue) return false;
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