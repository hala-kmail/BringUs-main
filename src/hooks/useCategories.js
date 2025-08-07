import { useState, useCallback, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const useCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store, categories, updateCategories } = useAppData();

  const fetchCategories = useCallback(async (storeId) => {
    // 1. التحقق من السياق أولاً
    if (categories !== null) {
  
      return categories;
    }

    if (!storeId) {
      console.log('No store ID available for fetching categories');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching categories for store ID:', storeId);
      const url = `${API_BASE_URL}/categories/store/${storeId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract data from the response
      if (result.success && result.data) {
        console.log('Categories fetched successfully:', result.data.length, 'categories');
        // Update categories in context
        updateCategories(result.data); // 2. تحديث السياق
        return result.data;
      } else {
        // إذا لم تنجح العملية ولكن لا يوجد خطأ، ربما لا توجد أصناف
        // نقوم بتحديث السياق بمصفوفة فارغة لمنع إعادة الجلب
        updateCategories([]);
        console.log('No categories found or invalid format, setting to empty array.');
        return [];
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [categories, updateCategories]); // إضافة الاعتماديات

  // useEffect(() => {
  //   console.log('store', store);
  //   console.log('categories', categories);
  //   // جلب الأصناف فقط إذا كانت null
  //   if (store && store._id && categories === null) {
  //     console.log('Initial categories fetch for store ID:', store._id);
  //     // استدعاء fetchCategories مباشرة بدلاً من إضافتها لل dependencies
  //     const loadCategories = async () => {
  //       try {
  //         setLoading(true);
  //         setError(null);
          
  //         const url = `${API_BASE_URL}/categories/store/${store._id}`;
  //         const response = await fetch(url);
          
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
          
  //         const result = await response.json();
          
  //         if (result.success && result.data) {
  //           console.log('Categories fetched successfully:', result.data.length, 'categories');
  //           updateCategories(result.data);
  //         } else {
  //           updateCategories([]);
  //           console.log('No categories found or invalid format, setting to empty array.');
  //         }
  //       } catch (err) {
  //         console.error('Error fetching categories:', err);
  //         setError(err.message);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
      
  //     loadCategories();
  //   } else if (!store && categories !== null) {
  //     console.log('No store available, clearing categories');
  //     updateCategories(null); // مسح الأصناف
  //   }
  // }, [store?._id, categories === null]); // استخدام store._id و categories === null فقط

  const loadCategories = useCallback(async (storeId = null) => {
    const storeIdToUse = storeId || (store && store._id);
    
    if (!storeIdToUse) {
      console.log('No store ID available for loading categories');
      return null;
    }

    const categoriesData = await fetchCategories(storeIdToUse);
    
    if (categoriesData) {
      console.log('Categories loaded manually:', categoriesData.length, 'categories');
      return categoriesData;
    }
    return null;
  }, [store, fetchCategories]);

  const refreshCategories = useCallback(() => {
    if (store && store._id) {
      // Clear existing categories to force refresh
      updateCategories(null); // إعادة التعيين إلى null
      return loadCategories(store._id);
    }
    return null;
  }, [store, loadCategories, updateCategories]);

  // Helper functions to get main categories and subcategories
  const getMainCategories = useCallback(() => {
    if (!categories) return []; // حماية من null
    return categories.filter(cat => !cat.parent);
  }, [categories]);

  const getSubCategories = useCallback((parentId) => {
    if (!categories) return []; // حماية من null
    return categories.filter(cat => cat.parent && cat.parent._id === parentId);
  }, [categories]);

  const getAllSubCategories = useCallback(() => {
    if (!categories) return []; // حماية من null
    return categories.filter(cat => cat.parent);
  }, [categories]);

  return {
    categories: categories || [], // إرجاع مصفوفة فارغة للمكونات
    loading,
    error,
    fetchCategories,
    loadCategories,
    refreshCategories,
    getMainCategories,
    getSubCategories,
    getAllSubCategories
  };
};

export default useCategories; 