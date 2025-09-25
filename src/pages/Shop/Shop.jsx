import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAffiliateNavigation } from '../../hooks/useAffiliateNavigation';

import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import MobileFilters from '../../components/MobileFilters/MobileFilters';
import './Shop.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import SidebarFilters from '../../components/Shop/SidebarFilters';
import ProductsGrid from '../../components/Shop/ProductsGrid';
import Pagination from '../../components/Shop/Pagination';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
// Add dynamic data hooks
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useAppData } from '../../contexts/AppDataContext';
import { getSimpleColorsFromColorsField, hexToColorName } from '../../utils/productUtils';
import { useWishlist } from '../../contexts/WishlistContext';

const Shop = () => {
  
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  //  const navigate = useNavigate();
  const {store} = useAppData();
  const { navigate } = useAffiliateNavigation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isSearching, setIsSearching] = useState(false);

  // Use dynamic data hooks
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    pagination,
    searchProducts, 
    fetchProductsByCategory,
    fetchProductsWithFilters,
    fetchProductsWithComprehensiveFilters,
    fetchAllProductsByStore,
    getAllAvailableColors,
    getAllAvailableColorsForDisplay,
    getAllAvailableProductLabels
  } = useProducts();
  const { categories, getMainCategories, getSubCategories, loading: categoriesLoading } = useCategories();
    const { features } = useAppData();

  // API-based products state
  const [apiProducts, setApiProducts] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiPagination, setApiPagination] = useState(null);
  
  // Calculate dynamic max price from all products - IMPROVED VERSION
  const getMaxProductPrice = useCallback(() => {
    const allAvailableProducts = products || [];
    if (!allAvailableProducts || !allAvailableProducts.length) return 1000;
    return Math.max(...allAvailableProducts.map(product => 
      Math.max(product.originalPrice || 0, product.salePrice || 0, product.price || 0)
    ));
  }, [products]);

  const initialMaxPrice = useMemo(() => getMaxProductPrice(), [getMaxProductPrice]);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: initialMaxPrice },
    categories: [],
    subcategories: [], 
    features: [],
    colors: [],
    productLabels: [],
    status: [],
    sortBy: 'newest',
    search: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // View mode
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentLang = i18n.language;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update filters when max price changes
  useEffect(() => {
    const newMaxPrice = getMaxProductPrice();
    if (newMaxPrice !== initialMaxPrice) {
      setFilters(prev => ({
        ...prev,
        priceRange: { ...prev.priceRange, max: newMaxPrice }
      }));
    }
  }, [products, initialMaxPrice]);

  // API-based filtering function with comprehensive filters support
  const applyAPIFilters = useCallback(async () => {
    if (!store?._id) return;

    setApiLoading(true);
    setApiError(null);

    try {
    

      const apiFilters = {
        page: currentPage,
        limit: itemsPerPage,
        sort: filters.sortBy
      };

      // 1. فلترة الفئات (دعم متعدد)
      if (filters.categories.length > 0) {
        if (filters.categories.length === 1) {
          // فئة واحدة
          apiFilters.category = filters.categories[0];
        
        } else {
          // عدة فئات - استخدام || separator
          apiFilters.category = filters.categories.join('||');
         
        }
      }

      // 2. فلترة السعر
      if (filters.priceRange.min > 0) {
        apiFilters.minPrice = filters.priceRange.min;
      
      }
      if (filters.priceRange.max < initialMaxPrice) {
        apiFilters.maxPrice = filters.priceRange.max;
       
      }

      // 3. فلترة الألوان
      if (filters.colors.length > 0) {
        apiFilters.colors = filters.colors;
       
      }

      // 4. فلترة العلامات
      if (filters.productLabels.length > 0) {
        apiFilters.productLabels = filters.productLabels;

      }

      // 5. فلترة الميزات (إذا كانت مدعومة)
      if (filters.features.length > 0) {
        apiFilters.features = filters.features;
       
      }

      // 6. فلترة الحالة (إذا كانت مدعومة)
      if (filters.status.length > 0) {
        apiFilters.status = filters.status;
      
      }

      // 7. فلترة البحث
      if (filters.search && filters.search.trim()) {
        apiFilters.search = filters.search.trim();
     
      }

      

      const result = await fetchProductsWithComprehensiveFilters(apiFilters);
      
      if (result && result.products) {
        setApiProducts(result.products);
        setApiPagination(result.pagination);
      } else {
        setApiProducts([]);
        setApiPagination(null);
       
      }
    } catch (error) {
     
      setApiError(error.message);
      setApiProducts([]);
    } finally {
      setApiLoading(false);
    }
  }, [store?._id, currentPage, itemsPerPage, filters, initialMaxPrice, fetchProductsWithComprehensiveFilters]);

  // Update URL parameters based on current filters with comprehensive support
  const updateURLParams = useCallback(() => {
    const newParams = new URLSearchParams();
    
    // 1. فلترة الفئات (دعم متعدد)
    if (filters.categories.length > 0) {
      if (filters.categories.length === 1) {
        // فئة واحدة
      newParams.set('category', filters.categories[0]);
      } else {
        // عدة فئات - استخدام || separator
        newParams.set('category', filters.categories.join('||'));
      }
    }
    
    // 2. فلترة الألوان
    if (filters.colors.length > 0) {
      newParams.set('colors', filters.colors.join(','));
    }
    
    // 3. فلترة العلامات
    if (filters.productLabels.length > 0) {
      filters.productLabels.forEach((id) => newParams.append('productLabels[]', id));
    }
    
    // 4. فلترة الميزات
    if (filters.features.length > 0) {
      if (filters.features.length === 1) {
      newParams.set('feature', filters.features[0]);
      } else {
        newParams.set('feature', filters.features.join('||'));
      }
    }
    
    // 5. فلترة الحالة
    if (filters.status.length > 0) {
      if (filters.status.length === 1) {
        newParams.set('status', filters.status[0]);
      } else {
        newParams.set('status', filters.status.join('||'));
      }
    }
    
    // 6. نطاق السعر
    if (filters.priceRange.min > 0) {
      newParams.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max < initialMaxPrice) {
      newParams.set('maxPrice', filters.priceRange.max.toString());
    }
    
    // 7. الترتيب
    if (filters.sortBy && filters.sortBy !== 'newest') {
      newParams.set('sort', filters.sortBy);
    }
    
    // 8. البحث
    if (filters.search && filters.search.trim()) {
      newParams.set('search', filters.search.trim());
     
    }
   
    setSearchParams(newParams);
  }, [filters, setSearchParams, initialMaxPrice]);

  // Apply filters when dependencies change - IMPROVED VERSION
  useEffect(() => {
 
    // Clear previous results immediately when filters change
    setApiProducts([]);
    setApiPagination(null);
    
    // Apply filters with a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
    applyAPIFilters();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [applyAPIFilters]);

  // Debounced search effect
  useEffect(() => {
    if (filters.search && filters.search.trim()) {
      setIsSearching(true);
      const searchTimeout = setTimeout(() => {
        
        applyAPIFilters();
        setIsSearching(false);
      }, 500); // 500ms debounce for search
      
      return () => {
        clearTimeout(searchTimeout);
        setIsSearching(false);
      };
    } else {
      setIsSearching(false);
    }
  }, [filters.search, applyAPIFilters]);

  // Update URL parameters when filters change - IMPROVED VERSION
  useEffect(() => {
  
    updateURLParams();
  }, [updateURLParams]);

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const feature = searchParams.get('feature');
    const colorsArrayParams = searchParams.getAll('colors[]');
    const colorsLegacy = searchParams.get('colors');
    const productLabelsArrayParams = searchParams.getAll('productLabels[]');
    const productLabelsLegacy = searchParams.get('productLabels');
    
    // Handle search parameter
    if (search) {
     
      setSearchQuery(search);
      setFilters(prev => ({
        ...prev,
        search: search
      }));
    }
    
    if (category) {
      const categoryId = category;
    
      if (!isNaN(categoryId)) {
        setFilters(prev => ({
          ...prev,
          categories: [categoryId]
        }));
      }
    }
    
    if (feature) {
      const featureId = feature;
   
      if (!isNaN(featureId)) {
        setFilters(prev => ({
          ...prev,
          features: [featureId]
        }));
      }
    }

    // Parse colors (support both colors[] and legacy colors)
    if ((colorsArrayParams && colorsArrayParams.length > 0) || colorsLegacy) {
      const collected = [];
      const source = colorsArrayParams && colorsArrayParams.length > 0
        ? colorsArrayParams
        : colorsLegacy.split(',').filter(Boolean);
      source.forEach(item => {
        const parts = item.split('+').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
          const name = p;
          if (name && !collected.includes(name)) collected.push(name);
        });
      });
   
      setFilters(prev => ({
        ...prev,
        colors: collected
      }));
    }

    // Parse product labels (support both productLabels[] and legacy)
    if ((productLabelsArrayParams && productLabelsArrayParams.length > 0) || productLabelsLegacy) {
      const labels = productLabelsArrayParams && productLabelsArrayParams.length > 0
        ? productLabelsArrayParams
        : productLabelsLegacy.split(',').filter(Boolean);
    
      setFilters(prev => ({
        ...prev,
        productLabels: labels
      }));
    }
  }, [searchParams]);

  // Handle filter changes with comprehensive support - IMPROVED VERSION
  const handleFilterChange = async (filterType, value, checked = null) => {
    setCurrentPage(1); // Reset to first page when filters change

   

    if (filterType === 'category') {
      const getAllDescendants = (id) => {
        const directSubs = getSubCategories(id);
        let all = [...directSubs.map(s => s._id || s.id)];
        for (let sub of directSubs) {
          all = [...all, ...getAllDescendants(sub._id || sub.id)];
        }
        return all;
      };
    
      const getParentId = (id) => {
        const cat = categories.find(c => (c._id || c.id) === id);
        return cat?.parent?._id || cat?.parentId || null;
      };
    
      setFilters(prev => {
        let newSelected = [...prev.categories];
    
        if (checked) {
          
          const descendants = getAllDescendants(value);
          newSelected = Array.from(new Set([...newSelected, value, ...descendants]));
    
          
          let parentId = getParentId(value);
          while (parentId) {
            const siblings = getSubCategories(parentId).map(s => s._id || s.id);
            const allSelected = siblings.every(sid => newSelected.includes(sid));
            if (allSelected && !newSelected.includes(parentId)) {
              newSelected.push(parentId);
            }
            parentId = getParentId(parentId);
          }
        } else {
        
          const descendants = getAllDescendants(value);
          newSelected = newSelected.filter(id => id !== value && !descendants.includes(id));
    
         
          let parentId = getParentId(value);
          while (parentId) {
            const siblings = getSubCategories(parentId).map(s => s._id || s.id);
            const hasAnySelected = siblings.some(sid => newSelected.includes(sid));
            if (!hasAnySelected) {
              newSelected = newSelected.filter(id => id !== parentId);
            }
            parentId = getParentId(parentId);
          }
        }
    
        return {
          ...prev,
          categories: newSelected
        };
      });
    }
    
    
    else if (filterType === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: value
      }));
     
    } 
    
    else if (filterType === 'color') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          colors: [...prev.colors, value]
        }));
        
      } else {
        setFilters(prev => ({
          ...prev,
          colors: prev.colors.filter(color => color !== value)
        }));
       
      }
      }
    
    else if (filterType === 'productLabel') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          productLabels: [...prev.productLabels, value]
        }));
        
      } else {
        setFilters(prev => ({
          ...prev,
          productLabels: prev.productLabels.filter(id => id !== value)
        }));
       
      }
      }
    
    else if (filterType === 'feature') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          features: [...prev.features, value]
        }));
      
      } else {
        setFilters(prev => ({
          ...prev,
          features: prev.features.filter(feat => feat !== value)
        }));
       
      }
      }
    
    else if (filterType === 'status') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          status: [...prev.status, value]
        }));
       
      } else {
        setFilters(prev => ({
          ...prev,
          status: prev.status.filter(status => status !== value)
        }));
       
      }
    }
    
    else if (filterType === 'search') {
      setFilters(prev => ({
        ...prev,
        search: value
      }));
      setSearchQuery(value);
    
      
      // Clear search results immediately when typing
      if (value.trim() === '') {
        setApiProducts([]);
        setApiPagination(null);
      }
    }

    // Force immediate refresh of products
  
    setApiProducts([]); // Clear current products immediately
    setApiPagination(null);
  };

  // Clear all filters - IMPROVED VERSION
  const clearFilters = () => {
  
    setFilters({
      priceRange: { min: 0, max: initialMaxPrice },
      categories: [],
      subcategories: [],
      features: [],
      colors: [],
      productLabels: [],
      status: [],
      sortBy: 'newest',
      search: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
    
    // Force immediate refresh
    setApiProducts([]);
    setApiPagination(null);
  };

  // Remove specific filter - IMPROVED VERSION
  const removeFilter = (filterType, value) => {
     
    if (filterType === 'category') {
      setFilters(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat !== value)
      }));
    } else if (filterType === 'color') {
      setFilters(prev => ({
        ...prev,
        colors: prev.colors.filter(color => color !== value)
      }));
    } else if (filterType === 'productLabel') {
      setFilters(prev => ({
        ...prev,
        productLabels: prev.productLabels.filter(id => id !== value)
      }));
    } else if (filterType === 'feature') {
      setFilters(prev => ({
        ...prev,
        features: prev.features.filter(feat => feat !== value)
      }));
    } else if (filterType === 'status') {
      setFilters(prev => ({
        ...prev,
        status: prev.status.filter(status => status !== value)
      }));
    } else if (filterType === 'search') {
      setFilters(prev => ({
        ...prev,
        search: ''
      }));
      setSearchQuery('');
    } else if (filterType === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: { min: 0, max: initialMaxPrice }
      }));
    }
    
    // Force immediate refresh
    setApiProducts([]);
    setApiPagination(null);
  };



  // Handle add to cart
  const handleAddToCart = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product._id || product.id}`);
  };



  // Handle mobile filters toggle
  const handleMobileFiltersToggle = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Handle mobile filters close
  const handleMobileFiltersClose = () => {
    setIsMobileFiltersOpen(false);
  };

 

  // Handle page change - IMPROVED VERSION
  const handlePageChange = (page) => {
   
    setCurrentPage(page);
    
    // Force immediate refresh
    setApiProducts([]);
    setApiPagination(null);
  };

  // Handle items per page change - IMPROVED VERSION
  const handleItemsPerPageChange = (newItemsPerPage) => {
   
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    
    // Force immediate refresh
    setApiProducts([]);
    setApiPagination(null);
  };

  // Get visible pages for pagination
  const getVisiblePages = () => {
    if (!apiPagination) return [1];
    
    const totalPages = apiPagination.totalPages;
    if (totalPages <= 1) return [1];
    
    const maxVisiblePages = 5;
    const current = currentPage;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    const rangeWithDots = [];
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) rangeWithDots.push('...');
    }
    rangeWithDots.push(...range);
    if (end < totalPages) {
      if (end < totalPages - 1) rangeWithDots.push('...');
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index && page <= totalPages);
  };

  // Handle sort change - IMPROVED VERSION
  const handleSortChange = (sortBy) => {
   
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
    
    // Force immediate refresh
    setApiProducts([]);
    setApiPagination(null);
  };

  // Use scroll to top on change
  useScrollToTopOnChange([currentPage, filters, itemsPerPage]);

  // Get all available colors from products (color names for filtering)
  const allColors = getAllAvailableColors();
  
  // Get all available colors for display (hex codes for UI)
  const allColorsForDisplay = getAllAvailableColorsForDisplay();

  // Get all available product labels from products
  const allProductLabels = getAllAvailableProductLabels();

  const getLabelById = (id) => {
    if (!allProductLabels || allProductLabels.length === 0) return null;
    return allProductLabels.find(lbl => (lbl._id || lbl.id) === id);
  };

  // Helper functions to work with real API data
  const getFeatureById = (id) => {
    if (!features) return null;
    return features.find(feature => feature.id === id);
  };

  const getCategoryById = (id) => {
    if (!categories) return null;
    return categories.find(category => category.id === id);
  };

  // Get product colors
  const getProductColors = (product) => {
    if (!product) return [];
    return getSimpleColorsFromColorsField(product);
  };

  // Get all descendant category IDs
  const getAllDescendantCategoryIds = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return [categoryId];
    
    const descendants = [categoryId];
    const subcategories = getSubCategories(categoryId);
    
    subcategories.forEach(sub => {
      descendants.push(sub.id);
      descendants.push(...getAllDescendantCategoryIds(sub.id));
    });
    
    return descendants;
  };

  // Get active filters for display with comprehensive support
  const getActiveFilters = () => {
    const active = [];
    
    // 1. فلاتر الفئات
    filters.categories.forEach(catId => {
      const category = getCategoryById(catId);
      if (category) {
        active.push({ 
          type: 'category', 
          value: catId, 
          label: currentLang === 'ar' ? category.nameAr : category.nameEn 
        });
      }
    });
    
    // 2. فلاتر الألوان
    filters.colors.forEach(color => {
      active.push({ 
        type: 'color', 
        value: color, 
        label: color,
        isColor: true // Add flag to identify color filters
      });
    });

    // 3. فلاتر العلامات
    filters.productLabels.forEach(labelId => {
      const label = getLabelById(labelId);
      if (label) {
        active.push({ 
          type: 'productLabel', 
          value: labelId, 
          label: (currentLang === 'ar' ? label.nameAr : label.nameEn) || labelId 
        });
      } else {
        active.push({ type: 'productLabel', value: labelId, label: labelId });
      }
    });
    
    // 4. فلاتر الميزات
    filters.features.forEach(featId => {
      const feature = getFeatureById(featId);
      if (feature) {
        active.push({ type: 'feature', value: featId, label: feature.name });
      }
    });
    
    // 5. فلاتر الحالة
    filters.status.forEach(status => {
      active.push({ type: 'status', value: status, label: status });
    });
    
    // 6. نطاق السعر (إذا كان محدد)
    if (filters.priceRange.min > 0 || filters.priceRange.max < initialMaxPrice) {
      active.push({ 
        type: 'priceRange', 
        value: `${filters.priceRange.min}-${filters.priceRange.max}`, 
        label: `${filters.priceRange.min} - ${filters.priceRange.max}` 
      });
    }
    
    // 7. البحث (إذا كان محدد) - مخفي من الفلاتر النشطة
    // if (filters.search && filters.search.trim()) {
    //   active.push({ 
    //     type: 'search', 
    //     value: filters.search, 
    //     label: `"${filters.search}"` 
    //   });
    // }
    
    return active;
  };

  // Loading state - IMPROVED VERSION
  const isLoading = productsLoading || categoriesLoading || apiLoading;

  // Error state - IMPROVED VERSION
  const hasError = productsError || apiError;

  // Products to display (use API products when available, fallback to all products) - IMPROVED VERSION
  const displayProducts = useMemo(() => {
   
    // If we have API products (from filtering), use them
    if (apiProducts.length > 0) {
  
      return apiProducts;
    }
    
    // If we're loading API products, show empty array to prevent showing old data
    if (apiLoading) {
     
      return [];
    }
    
    // If we have context products and no API loading, use them as fallback
    if (products && products.length > 0 && !apiLoading) {
   
      return products;
    }
    
    // Default to empty array
    
    return [];
  }, [apiProducts, products, apiLoading, productsLoading]);

  // Total items count - IMPROVED VERSION
  const totalItems = useMemo(() => {
    if (apiPagination && apiPagination.totalItems) {
      return apiPagination.totalItems;
    }
    return displayProducts.length;
  }, [apiPagination, displayProducts.length]);

  return (
    <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <SecondaryNavbar />
      
      {/* Mobile Search */}
     

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={handleMobileFiltersClose}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onRemoveFilter={removeFilter}
        activeFilters={getActiveFilters()}
        categories={categories}
        features={features}
        allColors={allColorsForDisplay}
        allProductLabels={allProductLabels}
        maxPrice={initialMaxPrice}
        loading={categoriesLoading}
      />

      <div className="shop-container">
        {/* Hero Section */}
       
        <div className="shop-main">
          {/* Sidebar Filters */}
          <div className="shop-sidebar">
            <SidebarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onRemoveFilter={removeFilter}
              activeFilters={getActiveFilters()}
              categories={categories}
              features={features}
              allColors={allColorsForDisplay}
              allProductLabels={allProductLabels}
              maxPrice={initialMaxPrice}
              loading={categoriesLoading}
              isSearching={isSearching}
            />
          </div>


          {/* Main Content */}
          <div className="shop-content">
            {/* Breadcrumb */}
           

            {/* Toolbar */}
            
            {/* Mobile Toolbar */}
            <div className="mobile-shop-toolbar">
              <div className="mobile-filter-controls">
                <button 
                  className="mobile-filter-btn"
                  onClick={handleMobileFiltersToggle}
                  title={currentLang === 'ar' ? 'الفلاتر' : 'Filters'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                  </svg>
                </button>
                
                <div className="mobile-view-controls">
                  <button 
                    className={`mobile-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title={currentLang === 'ar' ? 'عرض شبكة' : 'Grid View'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </button>
                  <button 
                    className={`mobile-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title={currentLang === 'ar' ? 'عرض قائمة' : 'List View'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <circle cx="4" cy="6" r="2"/>
                      <circle cx="4" cy="12" r="2"/>
                      <circle cx="4" cy="18" r="2"/>
                    </svg>
                  </button>
                </div>
                
           
              </div>
              
              <div className="mobile-results-info">
                <div className="mobile-results-count">
                  {isLoading ? (
                    currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'
                  ) : (
                    currentLang === 'ar'
                      ? `عرض ${totalItems} منتج`
                      : `Showing ${totalItems} products`
                  )}
                </div>
                
                <div className="mobile-sort-control">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="mobile-sort-select"
                    disabled={isLoading}
                  >
                    <option value="newest">{currentLang === 'ar' ? 'الاحدث' : 'Newest'}</option>
                    <option value="oldest">{currentLang === 'ar' ? 'الاقدم' : 'Oldest'}</option>
                    <option value="price_asc">{currentLang === 'ar' ? 'الاقل سعرا' : 'Price Low to High'}</option>
                    <option value="price_desc">{currentLang === 'ar' ? 'الاعلى سعرا' : 'Price High to Low'}</option>
                    <option value={currentLang === 'ar' ? 'name_ar_asc' : 'name_asc'}>{currentLang === 'ar' ? 'الاسم أ-ي' : 'Name A-Z'}</option>
                    <option value={currentLang === 'ar' ? 'name_ar_desc' : 'name_desc'}>{currentLang === 'ar' ? 'الاسم ي-أ' : 'Name Z-A'}</option>
                  </select>
                </div>
              </div>
            </div>

            <ShopToolbar
              totalItems={totalItems}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSortChange={handleSortChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onMobileFiltersToggle={handleMobileFiltersToggle}
              sortBy={filters.sortBy}
              loading={isLoading}
            />

            {/* Products Grid */}
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : hasError ? (
              <div className="error-container">
                <p>{t('common.error')}: {hasError}</p>
                <button onClick={applyAPIFilters}>{t('common.retry')}</button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="no-products">
                <h3>{t('shop.noProducts.title')}</h3>
                <p>{t('shop.noProducts.description')}</p>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  {t('shop.noProducts.clearFilters')}
                </button>
              </div>
            ) : (
              <>
                <ProductsGrid
                  products={displayProducts}
                  viewMode={viewMode}
                  onWishlistToggle={toggleWishlist}
                  onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist}
                />

                {/* Pagination */}
                {apiPagination && apiPagination.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={apiPagination.totalPages}
                    totalItems={apiPagination.totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    visiblePages={getVisiblePages()}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop; 