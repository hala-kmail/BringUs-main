import { useState, useCallback, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

const API_BASE_URL = 'http://localhost:5001/api';

const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { store, products, updateProducts } = useAppData();

  const fetchProducts = useCallback(async (storeId, options = {}) => {
    
    if (!storeId) {
      console.log('No store ID available for fetching products');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // بناء parameters للAPI
      const params = new URLSearchParams({
        store: storeId
      });
      
      // إضافة category و search فقط إذا كانت موجودة
      if (options.category) {
        params.append('category', options.category);
      }
      if (options.search) {
        params.append('search', options.search);
      }
      
      const url = `${API_BASE_URL}/products/by-store/${storeId}?${params}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract data from the response
      if (result.success && result.data) {
        console.log('Products fetched successfully:', result.data.length, 'products');
        
        // تحديث المنتجات في Context إذا لم تكن هناك خيارات تصفية محددة
        if (!options.category && !options.search && !options.featured) {
          updateProducts(result.data);
        }
        
        setPagination(result.pagination);
        return { products: result.data, pagination: result.pagination };
      } else {
        console.log('Invalid response format:', result);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateProducts]);

  // جلب المنتجات تلقائياً عند توفر الستور
  useEffect(() => {
    console.log(store?._id,'store?._idstore?._idstore?._id');
    // تجنب جلب البيانات إذا كانت متوفرة بالفعل
    if (products && products.length > 0) {
      console.log('products already fetched');
      return;
    }

    if (store && store._id) {
      console.log('Auto-fetching products for store:', store._id);
      // استدعاء fetchProducts مباشرة بدلاً من إضافتها لل dependencies
      const loadProducts = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const url = `${API_BASE_URL}/products/by-store/${store._id}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success && result.data) {
            console.log('Products fetched successfully:', result.data.length, 'products');
            updateProducts(result.data);
          } else {
            throw new Error('Failed to fetch products');
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      loadProducts();
    }
  }, []); // استخدام store._id فقط

  // جلب منتج واحد بالID
  const fetchProductById = useCallback(async (productId) => {
    if (!productId) {
      console.log('No product ID provided');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/products/${productId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب المنتجات حسب الفئة
  const fetchProductsByCategory = useCallback(async (categoryId, options = {}) => {
    if (!categoryId) {
      console.log('No category ID provided');
      return null;
    }

    const storeId = store?._id;
    if (!storeId) {
      console.log('No store ID available');
      return null;
    }

    return fetchProducts(storeId, { ...options, category: categoryId });
  }, [store, fetchProducts]);

  // جلب المنتجات المميزة
  const fetchFeaturedProducts = useCallback(async (options = {}) => {
    const storeId = store?._id;
    if (!storeId) {
      console.log('No store ID available');
      return null;
    }
    // API does not support featured flag, so we fetch all products
    // and let the frontend handle filtering if needed.
    return fetchProducts(storeId, { ...options });
  }, [store, fetchProducts]);

  // جلب أحدث المنتجات
  const fetchNewArrivals = useCallback(async (options = {}) => {
    const storeId = store?._id;
    if (!storeId) {
      console.log('No store ID available');
      return null;
    }
    // API does not support sorting, so we fetch all products
    // and let the frontend handle sorting if needed.
    return fetchProducts(storeId, { ...options });
  }, [store, fetchProducts]);

  // جلب أفضل المنتجات مبيعاً
  const fetchBestSellers = useCallback(async (options = {}) => {
    const storeId = store?._id;
    if (!storeId) {
      console.log('No store ID available');
      return null;
    }
    // API does not support sorting, so we fetch all products
    // and let the frontend handle sorting if needed.
    return fetchProducts(storeId, { ...options });
  }, [store, fetchProducts]);

  // البحث في المنتجات
  const searchProducts = useCallback(async (query, options = {}) => {
    if (!query || query.trim() === '') {
      console.log('No search query provided');
      return null;
    }

    const storeId = store?._id;
    if (!storeId) {
      console.log('No store ID available');
      return null;
    }

    return fetchProducts(storeId, { ...options, search: query.trim() });
  }, [store, fetchProducts]);

  // تحديد ما إذا كان المنتج في المخزون
  const isInStock = useCallback((product) => {
    // السماح بإضافة المنتجات التي أوشكت على الانتهاء (منخفضة المخزون)
    return product && 
           (product.stockStatus === 'in_stock' || product.stockStatus === 'low_stock') && 
           product.availableQuantity > 0;
  }, []);

  // حساب السعر النهائي مع الخصم
  const getFinalPrice = useCallback((product) => {
    if (!product) return 0;
    // إذا كان هناك finalPrice (سعر بعد الخصم)، استخدمه
    if (product.finalPrice !== undefined && product.finalPrice !== null) {
      return product.finalPrice;
    }
    // وإلا استخدم السعر العادي
    return product.price || 0;
  }, []);

  // حساب نسبة الخصم
  const getDiscountPercentage = useCallback((product) => {
    if (!product) return 0;
    return product.salePercentage || 0;
  }, []); 

  // الحصول على الصورة الرئيسية
  const getMainImage = useCallback((product) => {
    if (!product) return null;
    return product.mainImage || (product.images && product.images[0]) || null;
  }, []);

  // الحصول على اسم المنتج حسب اللغة
  const getProductName = useCallback((product, language = 'ar') => {
    if (!product) return '';
    return language === 'ar' ? product.nameAr : product.nameEn;
  }, []);

  // الحصول على وصف المنتج حسب اللغة
  const getProductDescription = useCallback((product, language = 'ar') => {
    if (!product) return '';
    return language === 'ar' ? product.descriptionAr : product.descriptionEn;
  }, []);

  // تحديث المنتجات
  const refreshProducts = useCallback(() => {
    if (store && store._id) {
      // مسح المنتجات الحالية لإجبار التحديث
      updateProducts([]);
      return fetchProducts(store._id);
    }
    return null;
  }, [store, fetchProducts, updateProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    fetchFeaturedProducts,
    fetchNewArrivals,
    fetchBestSellers,
    searchProducts,
    refreshProducts,
    isInStock,
    getFinalPrice,
    getDiscountPercentage,
    getMainImage,
    getProductName,
    getProductDescription
  };
};

export default useProducts; 