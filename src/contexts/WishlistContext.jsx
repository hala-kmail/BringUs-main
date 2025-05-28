import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from '../components/Toast/Toast';

// إنشاء Context للمفضلة
const WishlistContext = createContext();

// الحالة الأولية
const initialState = {
  items: [],
  count: 0
};

// Reducer لإدارة حالة المفضلة
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      // التحقق من وجود المنتج مسبقاً
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // المنتج موجود مسبقاً
      }
      
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        count: newItems.length
      };

    case 'REMOVE_FROM_WISHLIST':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        count: filteredItems.length
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        count: 0
      };

    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload,
        count: action.payload.length
      };

    default:
      return state;
  }
};

// Provider Component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const { t } = useTranslation();

  // تحميل المفضلة من localStorage عند بدء التطبيق
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // حفظ المفضلة في localStorage عند تغيير الحالة
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }, [state.items]);

  // دالة لإظهار الإشعارات
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // دالة لإخفاء الإشعارات
  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // إضافة منتج للمفضلة
  const addToWishlist = (product) => {
    const isAlreadyInWishlist = state.items.some(item => item.id === product.id);
    if (!isAlreadyInWishlist) {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      showToast(t('wishlist.added_to_wishlist'), 'success');
    }
  };

  // إزالة منتج من المفضلة
  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    showToast(t('wishlist.removed_from_wishlist'), 'success');
  };

  // التحقق من وجود منتج في المفضلة
  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // مسح جميع المنتجات من المفضلة
  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  // تبديل حالة المنتج في المفضلة
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const value = {
    items: state.items,
    count: state.count,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    toggleWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </WishlistContext.Provider>
  );
};

// Hook لاستخدام Context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext; 