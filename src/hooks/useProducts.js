import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { getBearerToken } from '../utils/tokenManager';
import { getSimpleColorsFromColorsField, getOriginalColorsFromColorsField } from '../utils/productUtils';

const API_BASE_URL = 'http://localhost:5001/api';

// Global flag to prevent multiple simultaneous fetches
let isGlobalFetching = false;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 500; // Reduced from 1000ms to 500ms for better responsiveness
let fetchTimeout = null;

const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const { store, products, updateProducts, updateAllProducts } = useAppData();
  const hasInitialized = useRef(false);
  const storeId = useRef(null);
  const token = getBearerToken();

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
  }, [store?._id]); // Only depend on store._id, not the entire store object

  // Extract all available colors from products
  const getAllAvailableColors = useCallback(() => {
    if (!products || !Array.isArray(products)) return [];
    
    const colorSet = new Set();
    products.forEach(product => {
      const simpleColors = getSimpleColorsFromColorsField(product);
      simpleColors.forEach(color => colorSet.add(color));
    });
    
    return Array.from(colorSet).sort();
  }, [products]);

  // Extract all available product labels from products
  const getAllAvailableProductLabels = useCallback(() => {
    if (!products || !Array.isArray(products)) return [];
    
    const labelSet = new Set();
    products.forEach(product => {
      if (product.productLabels && Array.isArray(product.productLabels)) {
        product.productLabels.forEach(label => {
          if (label && label._id) {
            labelSet.add(JSON.stringify({
              _id: label._id,
              nameAr: label.nameAr,
              nameEn: label.nameEn,
              color: label.color
            }));
          }
        });
      }
    });
    
    return Array.from(labelSet).map(labelStr => JSON.parse(labelStr));
  }, [products]);

  // Extract all available colors for display (hex codes)
  const getAllAvailableColorsForDisplay = useCallback(() => {
    if (!products || !Array.isArray(products)) return [];
    
    const colorSet = new Set();
    products.forEach(product => {
      const originalColors = getOriginalColorsFromColorsField(product);
      originalColors.forEach(color => colorSet.add(color));
    });
    
    return Array.from(colorSet).sort();
  }, [products]);

  const fetchProducts = useCallback(async (targetStoreId, options = {}) => {
    if (!targetStoreId) {
      console.log('No store ID available for fetching products');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Build comprehensive parameters for the API endpoint
      const params = new URLSearchParams();
      
      console.log('🔍 Building comprehensive filter with multiple criteria...');
      
      // Pagination parameters
      if (options.page) {
        params.append('page', options.page.toString());
        console.log('📄 Applied page filter:', options.page);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
        console.log('📄 Applied limit filter:', options.limit);
      }
      
      // 1. فلترة الفئات (دعم متعدد)
      if (options.category) {
        // دعم فئة واحدة أو عدة فئات مفصولة بـ ||
        if (Array.isArray(options.category)) {
          // إذا كانت مصفوفة، ادمجها بـ ||
          const categoryFilter = options.category.join('||');
          params.append('category', categoryFilter);
          console.log('📂 Applied multi-category filter:', options.category);
        } else if (typeof options.category === 'string' && options.category.includes('||')) {
          // إذا كانت سلسلة نصية تحتوي على ||
          params.append('category', options.category);
          console.log('📂 Applied multi-category filter (string):', options.category);
        } else {
          // فئة واحدة
          params.append('category', options.category);
          console.log('📂 Applied single category filter:', options.category);
        }
      }
      
      // 2. فلترة السعر
      if (options.minPrice) {
        params.append('minPrice', options.minPrice.toString());
        console.log('💰 Applied min price filter:', options.minPrice);
      }
      if (options.maxPrice) {
        params.append('maxPrice', options.maxPrice.toString());
        console.log('💰 Applied max price filter:', options.maxPrice);
      }
      
      // 3. فلترة البحث
      if (options.search) {
        params.append('search', options.search);
        console.log('🔍 Applied search filter:', options.search);
      }
      
      // 4. فلترة الألوان
      if (options.colors && options.colors.length > 0) {
        // Send colors as a single comma-separated string instead of array
        params.append('colors', options.colors.join(','));
        console.log('🎨 Applied colors filter:', options.colors);
      }
      
      // 5. فلترة العلامات
      if (options.productLabels && options.productLabels.length > 0) {
        options.productLabels.forEach((labelId) => params.append('productLabels[]', labelId));
        console.log('🏷️ Applied product labels filter:', options.productLabels);
      }
      
      // 6. فلترة الترتيب
      if (options.sort) {
        params.append('sort', options.sort);
        console.log('📊 Applied sort filter:', options.sort);
      }
      
      const url = `${API_BASE_URL}/products/${targetStoreId}/without-variants?${params}`;
      console.log('✅ Final URL with comprehensive filters:', url);
 
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract data from the response
      if (result.success && result.data) {
        // Only update products in Context if no specific filtering options
        // This prevents overwriting filtered results with all products
        const hasFilters = options.category || options.search || options.minPrice || 
                          options.maxPrice || options.colors || options.productLabels;
        
        if (!hasFilters) {
          updateProducts(result.data);
          console.log('✅ Updated products in context (no filters applied)');
        } else {
          console.log('✅ Products fetched with filters, not updating context');
        }
        
        setPagination(result.pagination);
        console.log('✅ Products fetched successfully with comprehensive filters:', result.data.length, 'products');
        return { products: result.data, pagination: result.pagination };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
    
  }, [updateProducts, token]);

  // Auto-fetch products when store changes (only once per store) - IMPROVED VERSION
  useEffect(() => {
    const currentStoreId = getStoreId();
    
    // Only fetch if we have a store ID and haven't initialized for this store
    if (currentStoreId && (!hasInitialized.current || storeId.current !== currentStoreId)) {
      // Prevent multiple simultaneous fetches and add cooldown
      const now = Date.now();
      if (isGlobalFetching || (now - lastFetchTime < FETCH_COOLDOWN)) {
        if (process.env.NODE_ENV === 'development') {
          // console.log('Products fetch blocked - already in progress or cooldown active');
        }
        return;
      }
      
      // Clear any existing timeout
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      
      // Set a timeout to prevent rapid successive calls
      fetchTimeout = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Initializing products for store ID:', currentStoreId);
        }
        
        hasInitialized.current = true;
        storeId.current = currentStoreId;
        isGlobalFetching = true;
        lastFetchTime = now;
        
        const loadProducts = async () => {
          try {
            setLoading(true);
            setError(null);
            
            const url = `${API_BASE_URL}/products/${currentStoreId}/without-variants?page=1&limit=20&sort=newest`;
            if (process.env.NODE_ENV === 'development') {
              // console.log('Fetching products from:', url);
            }
            
            const response = await fetch(url, {
              headers: {
                'accept': 'application/json',
                'Authorization': token
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
              updateProducts(result.data);
              setPagination(result.pagination);
              if (process.env.NODE_ENV === 'development') {
                // console.log('Products fetched successfully:', result.data.length, 'products');
              }
            } else {
              throw new Error('Failed to fetch products');
            }
          } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
          } finally {
            setLoading(false);
            isGlobalFetching = false;
          }
        };
        
        loadProducts();
      }, 50); // Reduced delay for better responsiveness
      
    } else if (!currentStoreId && hasInitialized.current) {
      // Clear products if no store is available
      if (process.env.NODE_ENV === 'development') {
        // console.log('No store available, clearing products');
      }
      updateProducts(null);
      hasInitialized.current = false;
      storeId.current = null;
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
    };
  }, [store?._id, getStoreId, updateProducts, token]);


  //-----------------------------------Fetch all products by store------------------------------------------------   
  const fetchAllProductsByStore = useCallback(async (targetStoreId = null) => {
    // alert('fetchAllProductsByStore');
    // Check if we're already fetching for this store
    if (isGlobalFetching && storeId.current === targetStoreId) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Already fetching all products for store:', targetStoreId);
      }
      return null;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      if (process.env.NODE_ENV === 'development') {
        // console.log('Fetch cooldown active, skipping fetch for store:', targetStoreId);
      }
      return null;
    }

    if (!targetStoreId) {
      // console.log('No store ID available for fetching all products');
      return null;
    }

    try {
      // Set global fetching state and update last fetch time
      isGlobalFetching = true;
      storeId.current = targetStoreId;
      lastFetchTime = now;
      
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/products/by-store/${targetStoreId}`;
      
      const headers = {
        'accept': 'application/json',
      };
      
      if (token) {
        headers.Authorization = token;
      }

    

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setAllProducts(result.data);
        // Update the products in the context
      
        if (updateAllProducts) {
          updateAllProducts(result.data);
        }
        
        return {
          allProducts: result.data,
          total: result.data.length,
          success: true,
          error: null
        };
      } else {
        throw new Error(result.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('❌ Error fetching all products by store:', err);
      setError(err.message);
      return {
        products: [],
        total: 0,
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
      isGlobalFetching = false;
    }
  }, [updateAllProducts]);
  useEffect(() => {
    if (store?._id) {
      // Check if we already have all products for this store
      const currentStoreId = store._id;
      
      // First check if we already have products in state
      if (allProducts.length > 0) {
        const firstProduct = allProducts[0];
        if (firstProduct && (firstProduct.storeId === currentStoreId || firstProduct.store?._id === currentStoreId)) {
          if (process.env.NODE_ENV === 'development') {
            // console.log('Using existing all products from state:', allProducts.length, 'products');
          }
          return; // Don't fetch if we already have valid data in state
        }
      }
      
      // Then check localStorage
      const storedAllProducts = localStorage.getItem('allProductsInfo');
      if (storedAllProducts) {
        try {
          const parsedProducts = JSON.parse(storedAllProducts);
          // Check if we have products and they're not empty
          if (parsedProducts && Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            // Check if the first product has the same store ID (basic validation)
            const firstProduct = parsedProducts[0];
            if (firstProduct && (firstProduct.storeId === currentStoreId || firstProduct.store?._id === currentStoreId)) {
              if (process.env.NODE_ENV === 'development') {
                // console.log('Using cached all products from localStorage:', parsedProducts.length, 'products');
              }
              setAllProducts(parsedProducts);
              if (updateAllProducts) {
                updateAllProducts(parsedProducts);
              }
              return; // Don't fetch if we already have valid cached data
            }
          }
        } catch (err) {
          console.warn('Error parsing cached all products:', err);
          localStorage.removeItem('allProductsInfo');
        }
      }
      
      // Only fetch if we don't have valid data anywhere
      if (process.env.NODE_ENV === 'development') {
        // console.log('Fetching all products for store:', currentStoreId);
      }
      fetchAllProductsByStore(currentStoreId);
    }
  }, [store?._id, updateAllProducts, allProducts.length]);

  // Fetch single product by ID
  const fetchProductById = useCallback(async (productId) => {
    if (!productId) {
      // console.log('No product ID provided');
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

  // Fetch single product with its variants
  const fetchProductWithVariants = useCallback(async (productId) => {
    if (!productId) {
      // console.log('No product ID provided');
      return null;
    }

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      // console.log('No store ID available for fetching product with variants');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/products/${currentStoreId}/${productId}/with-variants`;

      const headers = {
        accept: 'application/json',
      };
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Expecting shape: { product, variants, variantsCount }
        return {
          
          product: result.data.product || result.data,
          variants: result.data.variants || [],
          variantsCount: result.data.variantsCount ?? (result.data.variants ? result.data.variants.length : 0),
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product with variants:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, token]);

  // Fetch specific variant details
  const fetchSpecificVariant = useCallback(async (productId, variantId) => {
    if (!productId || !variantId) {
      console.log('No product ID or variant ID provided');
      return null;
    }

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      console.log('No store ID available for fetching specific variant');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/products/${currentStoreId}/${productId}/variants/${variantId}`;

      const headers = {
        accept: 'application/json',
      };
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // The API returns data in the format: { parentProduct, variant }
        // We want to return the variant data
        const variantData = result.data.variant || result.data;
        
        if (variantData) {
          console.log('✅ Specific variant fetched successfully:', {
            id: variantData._id,
            name: variantData.nameAr || variantData.nameEn,
            price: variantData.price,
            stock: variantData.availableQuantity,
            images: variantData.images?.length || 0,
            mainImage: variantData.mainImage,
            specificationValues: variantData.specificationValues?.length || 0,
            category: variantData.category?.nameAr || variantData.category?.nameEn
          });
          
          // Ensure the variant has all required fields
          const enrichedVariantData = {
            ...variantData,
            // Ensure these fields exist
            images: variantData.images || [],
            mainImage: variantData.mainImage || (variantData.images && variantData.images[0]),
            specificationValues: variantData.specificationValues || [],
            availableQuantity: variantData.availableQuantity || 0,
            price: variantData.price || 0,
            // Ensure other important fields
            nameAr: variantData.nameAr || variantData.nameEn,
            nameEn: variantData.nameEn || variantData.nameAr,
            descriptionAr: variantData.descriptionAr || variantData.descriptionEn,
            descriptionEn: variantData.descriptionEn || variantData.descriptionAr
          };
          
          return enrichedVariantData;
        } else {
          throw new Error('Variant data not found in response');
        }
      } else {
        throw new Error('Variant not found');
      }
    } catch (err) {
      console.error('Error fetching specific variant:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getStoreId, token]);

  // Fetch products by category with pagination and filters
  const fetchProductsByCategory = useCallback(async (categoryId, options = {}) => {
    if (!categoryId) {
      // console.log('No category ID provided');
      return null;
    }

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      // console.log('No store ID available');
      return null;
    }

    return fetchProducts(currentStoreId, { ...options, category: categoryId });
  }, [getStoreId, fetchProducts]);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async (options = {}) => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      // console.log('No store ID available');
      return null;
    }
    // API does not support featured flag, so we fetch all products
    // and let the frontend handle filtering if needed.
    return fetchProducts(currentStoreId, { ...options });
  }, [getStoreId, fetchProducts]);

  // Fetch new arrivals
  const fetchNewArrivals = useCallback(async (options = {}) => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      // console.log('No store ID available');
      return null;
    }
    return fetchProducts(currentStoreId, { ...options, sort: 'newest' });
  }, [getStoreId, fetchProducts]);

  // Fetch best sellers
  const fetchBestSellers = useCallback(async (options = {}) => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      console.log('No store ID available');
      return null;
    }
    // API does not support best sellers sorting, so we fetch all products
    // and let the frontend handle sorting if needed.
    return fetchProducts(currentStoreId, { ...options });
  }, [getStoreId, fetchProducts]);

  // Search products with pagination
  const searchProducts = useCallback(async (query, options = {}) => {
    if (!query || query.trim() === '') {
      console.log('No search query provided');
      return null;
    }

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      console.log('No store ID available');
      return null;
    }

    return fetchProducts(currentStoreId, { ...options, search: query.trim() });
  }, [getStoreId, fetchProducts]);

  // Fetch products with comprehensive filtering
  const fetchProductsWithFilters = useCallback(async (filters = {}) => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      console.log('No store ID available');
      return null;
    }

    console.log('🔍 Applying comprehensive filters:', filters);

    const options = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      sort: filters.sort || 'newest'
    };

    // Add comprehensive filter parameters
    if (filters.category) {
      // دعم فئة واحدة أو عدة فئات
      if (Array.isArray(filters.category)) {
        options.category = filters.category; // سيتم معالجتها في fetchProducts
      } else {
        options.category = filters.category;
      }
    }
    
    if (filters.categories && Array.isArray(filters.categories)) {
      // دعم خاصية categories كبديل لـ category
      options.category = filters.categories;
    }
    
    if (filters.minPrice !== undefined) {
      options.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      options.maxPrice = filters.maxPrice;
    }
    if (filters.search) {
      options.search = filters.search;
    }
    if (filters.colors && filters.colors.length > 0) {
      options.colors = filters.colors;
    }
    if (filters.productLabels && filters.productLabels.length > 0) {
      options.productLabels = filters.productLabels;
    }

    console.log('✅ Final options for comprehensive filtering:', options);
    return fetchProducts(currentStoreId, options);
  }, [getStoreId, fetchProducts]);

  // Check if product is in stock
  const isInStock = useCallback((product) => {
    // Allow adding products that are low stock or in stock
    return product && 
           (product.stockStatus === 'in_stock' || product.stockStatus === 'low_stock') && 
           product.availableQuantity > 0;
  }, []);

  // Calculate final price with discount
  const getFinalPrice = useCallback((product) => {
    if (!product) return 0;
    // If there's finalPrice (price after discount), use it
    if (product.finalPrice !== undefined && product.finalPrice !== null) {
      return product.finalPrice;
    }
    // Otherwise use regular price
    return product.price || 0;
  }, []);

  // Calculate discount percentage
  const getDiscountPercentage = useCallback((product) => {
    if (!product) return 0;
    return product.salePercentage || 0;
  }, []); 

  // Get main image
  const getMainImage = useCallback((product) => {
    if (!product) return null;
    return product.mainImage || (product.images && product.images[0]) || null;
  }, []);

  // Get product name by language
  const getProductName = useCallback((product, language = 'ar') => {
    if (!product) return '';
    return language === 'ar' ? product.nameAr : product.nameEn;
  }, []);

  // Get product description by language
  const getProductDescription = useCallback((product, language = 'ar') => {
    if (!product) return '';
    return language === 'ar' ? product.descriptionAr : product.descriptionEn;
  }, []);

  // Refresh products
  const refreshProducts = useCallback(() => {
    const currentStoreId = getStoreId();
    if (currentStoreId) {
      // Force refresh by clearing current products but don't reset hasInitialized
      // to prevent triggering the useEffect again
      updateProducts(null);
      // Don't reset hasInitialized here as it could cause loops
      return fetchProducts(currentStoreId);
    }
    return null;
  }, [getStoreId, fetchProducts, updateProducts]);

  // Comprehensive filtering with multiple categories and filters
  const fetchProductsWithComprehensiveFilters = useCallback(async (comprehensiveFilters = {}) => {
    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      console.log('No store ID available for comprehensive filtering');
      return null;
    }

    console.log('🚀 Applying comprehensive filters with multiple categories:', comprehensiveFilters);

    const options = {
      page: comprehensiveFilters.page || 1,
      limit: comprehensiveFilters.limit || 20,
      sort: comprehensiveFilters.sort || 'newest'
    };

    // Handle multiple categories
    if (comprehensiveFilters.categories && Array.isArray(comprehensiveFilters.categories)) {
      options.category = comprehensiveFilters.categories;
      console.log('📂 Multiple categories provided:', comprehensiveFilters.categories);
    } else if (comprehensiveFilters.category) {
      options.category = comprehensiveFilters.category;
      console.log('📂 Single category provided:', comprehensiveFilters.category);
    }

    // Handle price range
    if (comprehensiveFilters.priceRange) {
      if (comprehensiveFilters.priceRange.min !== undefined) {
        options.minPrice = comprehensiveFilters.priceRange.min;
      }
      if (comprehensiveFilters.priceRange.max !== undefined) {
        options.maxPrice = comprehensiveFilters.priceRange.max;
      }
      console.log('💰 Price range applied:', comprehensiveFilters.priceRange);
    } else {
      // Direct price filters
      if (comprehensiveFilters.minPrice !== undefined) {
        options.minPrice = comprehensiveFilters.minPrice;
      }
      if (comprehensiveFilters.maxPrice !== undefined) {
        options.maxPrice = comprehensiveFilters.maxPrice;
      }
    }

    // Handle search
    if (comprehensiveFilters.search) {
      options.search = comprehensiveFilters.search;
      console.log('🔍 Search term applied:', comprehensiveFilters.search);
    }

    // Handle colors
    if (comprehensiveFilters.colors && comprehensiveFilters.colors.length > 0) {
      options.colors = comprehensiveFilters.colors;
      console.log('🎨 Colors filter applied:', comprehensiveFilters.colors);
    }

    // Handle product labels
    if (comprehensiveFilters.productLabels && comprehensiveFilters.productLabels.length > 0) {
      options.productLabels = comprehensiveFilters.productLabels;
      console.log('🏷️ Product labels filter applied:', comprehensiveFilters.productLabels);
    }

    console.log('✅ Final comprehensive options:', options);
    return fetchProducts(currentStoreId, options);
  }, [getStoreId, fetchProducts]);

  return {
    products,
    allProducts,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProductById,
    fetchProductWithVariants,
    fetchSpecificVariant,
    fetchProductsByCategory,
    fetchFeaturedProducts,
    fetchNewArrivals,
    fetchBestSellers,
    searchProducts,
    fetchProductsWithFilters,
    fetchProductsWithComprehensiveFilters, // دالة جديدة للفلترة الشاملة
    refreshProducts,
    isInStock,
    getFinalPrice,
    getDiscountPercentage,
    getMainImage,
    getProductName,
    getProductDescription,
    getAllAvailableColors,
    getAllAvailableColorsForDisplay,
    getAllAvailableProductLabels,
    fetchAllProductsByStore
  };
};

export default useProducts; 