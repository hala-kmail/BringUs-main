import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Use dynamic data hooks
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    pagination,
    searchProducts, 
    fetchProductsByCategory,
    fetchProductsWithFilters,
    getAllAvailableColors,
    getAllAvailableColorsForDisplay,
    getAllAvailableProductLabels
  } = useProducts();
  const { categories, getMainCategories, getSubCategories, loading: categoriesLoading } = useCategories();
  const { store, features } = useAppData();

  // API-based products state
  const [apiProducts, setApiProducts] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiPagination, setApiPagination] = useState(null);
  
  // Calculate dynamic max price from all products
  const getMaxProductPrice = () => {
    if (!products || !products.length) return 1000;
    return Math.max(...products.map(product => 
      Math.max(product.originalPrice || 0, product.salePrice || 0, product.price || 0)
    ));
  };

  const initialMaxPrice = getMaxProductPrice();

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: initialMaxPrice },
    categories: [],
    subcategories: [], 
    features: [],
    colors: [],
    productLabels: [],
    status: [],
    sortBy: 'newest'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // View mode
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 

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

  // API-based filtering function
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

      // Add category filter
      if (filters.categories.length > 0) {
        apiFilters.category = filters.categories[0]; // API supports single category
      }

      // Add price filters
      if (filters.priceRange.min > 0) {
        apiFilters.minPrice = filters.priceRange.min;
      }
      if (filters.priceRange.max < initialMaxPrice) {
        apiFilters.maxPrice = filters.priceRange.max;
      }

      // Add search filter
      if (searchQuery.trim()) {
        apiFilters.search = searchQuery.trim();
      }

      // Add color filters
      if (filters.colors.length > 0) {
        apiFilters.colors = filters.colors;
      }

      // Add product labels filters
      if (filters.productLabels.length > 0) {
        apiFilters.productLabels = filters.productLabels;
      }

      const result = await fetchProductsWithFilters(apiFilters);

      if (result && result.products) {
        setApiProducts(result.products);
        setApiPagination(result.pagination);
      } else {
        setApiProducts([]);
        setApiPagination(null);
      }
    } catch (error) {
      console.error('API filter error:', error);
      setApiError(error.message);
      setApiProducts([]);
    } finally {
      setApiLoading(false);
    }
  }, [store?._id, currentPage, itemsPerPage, filters, searchQuery, initialMaxPrice, fetchProductsWithFilters]);

  // Update URL parameters based on current filters
  const updateURLParams = useCallback(() => {
    const newParams = new URLSearchParams();
    
    if (filters.categories.length > 0) {
      newParams.set('category', filters.categories[0]);
    }
    if (filters.colors.length > 0) {
      filters.colors.forEach((c) => newParams.append('colors[]', c));
    }
    if (filters.productLabels.length > 0) {
      filters.productLabels.forEach((id) => newParams.append('productLabels[]', id));
    }
    if (filters.features.length > 0) {
      newParams.set('feature', filters.features[0]);
    }
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    }
    
    setSearchParams(newParams);
  }, [filters, searchQuery, setSearchParams]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyAPIFilters();
  }, [applyAPIFilters]);

  // Update URL parameters when filters change
  useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const feature = searchParams.get('feature');
    const colorsArrayParams = searchParams.getAll('colors[]');
    const colorsLegacy = searchParams.get('colors');
    const productLabelsArrayParams = searchParams.getAll('productLabels[]');
    const productLabelsLegacy = searchParams.get('productLabels');
    
    if (category) {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        setFilters(prev => ({
          ...prev,
          categories: [categoryId]
        }));
      }
    }
    
    if (feature) {
      const featureId = parseInt(feature);
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
          const name = p.startsWith('#') ? hexToColorName(p) : p;
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

  // Handle filter changes
  const handleFilterChange = async (filterType, value, checked = null) => {
    setCurrentPage(1); // Reset to first page when filters change

    if (filterType === 'category') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          categories: [...prev.categories, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat !== value)
        }));
      }
    } else if (filterType === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: value
      }));
    } else if (filterType === 'color') {
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
    } else if (filterType === 'productLabel') {
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
    } else if (filterType === 'feature') {
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
    } else if (filterType === 'status') {
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
  };

  // Clear all filters
  const clearFilters = async () => {
    setFilters({
      priceRange: { min: 0, max: initialMaxPrice },
      categories: [],
      subcategories: [],
      features: [],
      colors: [],
      status: [],
      sortBy: 'newest'
    });
    setCurrentPage(1);
    setSearchQuery('');
    
    // Clear URL params
    setSearchParams({});
  };

  // Remove specific filter
  const removeFilter = async (filterType, value) => {
    setCurrentPage(1);
    
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
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Implement add to cart logic
    console.log('Adding to cart:', product);
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(true);
  };

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    // Update URL params
    if (query.trim()) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('search', query.trim());
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('search');
        return newParams;
      });
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
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

  // Handle sort change
  const handleSortChange = async (newSortBy) => {
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
    setCurrentPage(1);
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

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    
    filters.categories.forEach(catId => {
      const category = getCategoryById(catId);
      if (category) {
        active.push({ type: 'category', value: catId, label: category.name });
      }
    });
    
    filters.colors.forEach(color => {
      active.push({ type: 'color', value: color, label: color });
    });

    filters.productLabels.forEach(labelId => {
      const label = getLabelById(labelId);
      if (label) {
        active.push({ type: 'productLabel', value: labelId, label: (currentLang === 'ar' ? label.nameAr : label.nameEn) || labelId });
      } else {
        active.push({ type: 'productLabel', value: labelId, label: labelId });
      }
    });
    
    filters.features.forEach(featId => {
      const feature = getFeatureById(featId);
      if (feature) {
        active.push({ type: 'feature', value: featId, label: feature.name });
      }
    });
    
    return active;
  };

  // Loading state
  const isLoading = productsLoading || categoriesLoading || apiLoading;

  // Error state
  const hasError = productsError || apiError;

  // Products to display (use API products when available, fallback to all products)
  const displayProducts = apiProducts.length > 0 ? apiProducts : (products || []);

  // Total items for pagination
  const totalItems = apiPagination ? apiPagination.totalItems : (products ? products.length : 0);

  return (
    <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <SecondaryNavbar />
      
      {/* Mobile Search */}
      <MobileSearch 
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      <div className="shop-container">
        {/* Hero Section */}
        <div className="shop-hero">
          <div className="shop-hero-content">
            <div className="shop-hero-badge">
              {t('shop.hero.badge')}
            </div>
            <h1 className="shop-hero-title">
              {t('shop.hero.title')}
            </h1>
            <p className="shop-hero-subtitle">
              {t('shop.hero.subtitle')}
            </p>
            <Link to="/" className="shop-hero-btn">
              {t('shop.hero.button')}
            </Link>
          </div>
          <div className="shop-hero-image">
            <img src="/images/shop-hero.jpg" alt="Shop Hero" />
          </div>
        </div>

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
            />
          </div>

          {/* Main Content */}
          <div className="shop-content">
            {/* Breadcrumb */}
            <div className="shop-breadcrumb">
              <Link to="/">{t('common.home')}</Link>
              <span className="breadcrumb-separator">/</span>
              <span>{t('shop.title')}</span>
            </div>

            {/* Toolbar */}
            <ShopToolbar
              totalItems={totalItems}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSortChange={handleSortChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onMobileSearchToggle={handleMobileSearchToggle}
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
                  onWishlistToggle={handleWishlistToggle}
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