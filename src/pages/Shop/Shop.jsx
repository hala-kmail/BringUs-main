import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import MobileFilters from '../../components/MobileFilters/MobileFilters';
// Remove static imports
// import { allProducts, categories, features, getSubCategories, getFeatureById, getCategoryById, getMainCategories, getMaxProductPrice  } from '../../data/index';
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
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';
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
  const { products, loading: productsLoading, error: productsError, searchProducts, fetchProductsByCategory } = useProducts();
  const { categories, getMainCategories, getSubCategories, loading: categoriesLoading } = useCategories();
  const { store } = useAppData();

  // Derived data
  const allProducts = products || [];
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Calculate dynamic max price
  const getMaxProductPrice = () => {
    if (!allProducts.length) return 1000;
    return Math.max(...allProducts.map(product => 
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
    status: [],
    sortBy: 'newest'
  });

  // API-based search function
  const performAPISearch = useCallback(async (query) => {
    if (!query.trim()) {
      // If empty search, reset to all products
      setFilteredProducts(allProducts);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchProducts(query);
      if (result && result.products) {
        setFilteredProducts(result.products);
        console.log('Search results:', result.products.length, 'products found');
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchProducts, allProducts]);

  // API-based category filtering
  const performCategoryFilter = useCallback(async (categoryIds) => {
    if (!categoryIds.length) {
      setFilteredProducts(allProducts);
      return;
    }

    setIsSearching(true);
    try {
      // For now, we'll use the first category ID
      // In the future, this could be enhanced to support multiple categories
      const result = await fetchProductsByCategory(categoryIds[0]);
      if (result && result.products) {
        setFilteredProducts(result.products);
        console.log('Category filter results:', result.products.length, 'products found');
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Category filter error:', error);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  }, [fetchProductsByCategory, allProducts]);

  // View mode
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedProducts, setPaginatedProducts] = useState([]);

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
  }, [allProducts]);

  // Initialize filtered products
  useEffect(() => {
    if (allProducts.length > 0) {
      setFilteredProducts(allProducts);
    }
  }, [allProducts]);

  // الآثار الجانبية والتبعيات
  useEffect(() => {
    // Use async function inside useEffect
    const applyFiltersAsync = async () => {
      await applyFilters();
    };
    applyFiltersAsync();
    // eslint-disable-next-line
  }, [filters, searchQuery, allProducts]);

  useEffect(() => {
    applyPagination();
    // eslint-disable-next-line
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const feature = searchParams.get('feature');
    
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
    // eslint-disable-next-line
  }, [allProducts.length]);

//----------------------------------applyPagination------------------------------------------------
  const applyPagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  };

//----------------------------------applyFilters------------------------------------------------
  const applyFilters = async () => {
    let filtered = [...allProducts];

    // If we have a search query, use API search results as base
    if (searchQuery.trim()) {
      // API search is already performed in handleSearch
      filtered = [...filteredProducts];
    } else if (filters.categories.length > 0) {
      // If category filter is applied, use API category results
      await performCategoryFilter(filters.categories);
      filtered = [...filteredProducts];
    } else {
      // Use all products as base
      filtered = [...allProducts];
    }

    // Apply client-side filters for remaining criteria
    
    // Apply price filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.originalPrice || product.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => {
        const productColors = getProductColors(product);
        return productColors.some(color => filters.colors.includes(color));
      });
    }

    // Apply status filters
    if (filters.status.includes('on_sale')) {
      filtered = filtered.filter(product => {
        return product.salePrice && product.salePrice < (product.originalPrice || product.price);
      });
    }

    if (filters.status.includes('in_stock')) {
      filtered = filtered.filter(product => (product.stock || 0) > 0);
    }

    if (filters.status.includes('new')) {
      filtered = filtered.filter(product => product.isNew === true);
    }

    if (filters.status.includes('featured')) {
      filtered = filtered.filter(product => product.isFeatured === true || product.isBestSeller === true);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => {
          const priceA = a.salePrice || a.originalPrice || a.price || 0;
          const priceB = b.salePrice || b.originalPrice || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high-low':
        filtered.sort((a, b) => {
          const priceA = a.salePrice || a.originalPrice || a.price || 0;
          const priceB = b.salePrice || b.originalPrice || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'name-a-z':
        filtered.sort((a, b) => {
          const nameA = a[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || '';
          const nameB = b[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'name-z-a':
        filtered.sort((a, b) => {
          const nameA = a[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || '';
          const nameB = b[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || '';
          return nameB.localeCompare(nameA);
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateA - dateB;
        });
        break;
      default:
        // Default sorting - keep original order
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset pagination when filters change
  };

  // Helper function to get product colors
  const getProductColors = (product) => {
    const colors = [];
    
    // إضافة الألوان الفردية
    const individualColors = getSimpleColorsFromColorsField(product);
    colors.push(...individualColors);
    
    // إضافة الألوان المدمجة
    const simpleColors = getSimpleColorsFromColorsField(product);
    simpleColors.forEach(colorGroup => {
      const mixedColorKey = colorGroup.join('+');
      colors.push(mixedColorKey);
    });
    
    return colors;
  };

//----------------------------------getAllDescendantCategoryIds------------------------------------------------
  // Helper: جلب كل معرفات الفروع المتداخلة لقسم معين (recursive)
  const getAllDescendantCategoryIds = (categoryId) => {
    if (!categories || !getSubCategories) return [categoryId];
    
    const directSubs = getSubCategories(categoryId);
    let ids = [categoryId];
    directSubs.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub._id || sub.id));
    });
    return ids;
  };

//----------------------------------handleFilterChange------------------------------------------------
  const handleFilterChange = async (filterType, value, checked = null) => {
    if (filterType === 'categories') {
      let newCategories;
      if (checked) {
        newCategories = Array.from(new Set([...filters.categories, value]));
      } else {
        newCategories = filters.categories.filter(id => id !== value);
      }
      
      setFilters(prev => ({
        ...prev,
        categories: newCategories
      }));
      
      // If categories changed and no search query, perform API category filter
      if (!searchQuery.trim()) {
        await performCategoryFilter(newCategories);
      }
    } else if (filterType === 'priceRange') {
      // منع الأرقام السالبة وتصحيح القيم
      let min = Math.max(0, value.min);
      let max = Math.max(0, value.max);
      if (min > max) {
        // إذا البداية أكبر من النهاية، اجعل النهاية تساوي البداية
        max = min;
      }
      setFilters(prev => ({ ...prev, priceRange: { min, max } }));
      return;
    } else if (checked !== null) {
      setFilters(prev => ({
        ...prev,
        [filterType]: checked
          ? [...prev[filterType], value]
          : prev[filterType].filter(item => item !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    }
  };

//----------------------------------clearFilters------------------------------------------------
  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: getMaxProductPrice() },
      categories: [],
      subcategories: [], // Clear subcategories too
      features: [],
      colors: [],
      status: [],
      sortBy: 'newest'
    });
    setSearchQuery(''); // امسح نص البحث أيضاً
  };

//----------------------------------removeFilter------------------------------------------------
  const removeFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }));
  };

//----------------------------------handleWishlistToggle------------------------------------------------
  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

//----------------------------------handleAddToCart------------------------------------------------
  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product._id || product.id}`);
  };

//----------------------------------handleMobileSearchToggle------------------------------------------------
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

//----------------------------------handleMobileSearchClose------------------------------------------------       
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

//----------------------------------handleSearch------------------------------------------------
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    // تحديث URL params
    if (query.trim()) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('search', query.trim());
        return newParams;
      });
      
      // Perform API search
      await performAPISearch(query);
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('search');
        return newParams;
      });
      
      // Reset to all products
      setFilteredProducts(allProducts);
    }
  };

//----------------------------------totalPages------------------------------------------------
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

//----------------------------------handlePageChange------------------------------------------------
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

//----------------------------------handleItemsPerPageChange------------------------------------------------
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

//----------------------------------getVisiblePages------------------------------------------------
  const getVisiblePages = () => {
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

//----------------------------------handleSortChange------------------------------------------------
  const handleSortChange = (newSortBy) => {
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
  };

//----------------------------------useScrollToTopOnChange------------------------------------------------
  useScrollToTopOnChange([currentPage, filters, itemsPerPage]);

//----------------------------------Helper function for getAllColors------------------------------------------------
  function getAllColors() {
    const colorSet = new Set();
    allProducts.forEach(product => {
      const simpleColors = getSimpleColorsFromColorsField(product);
      simpleColors.forEach(color => colorSet.add(color));
    });
    return Array.from(colorSet);
  }

  // Helper functions for compatibility
  const getFeatureById = (id) => {
    // This can be implemented when features API is available
    return { id, name: { ar: 'ميزة', en: 'Feature' } };
  };

  const getCategoryById = (id) => {
    if (!categories) return null;
    return categories.find(cat => (cat._id || cat.id) === id);
  };

  // Loading state - include search loading
  if (productsLoading || categoriesLoading || isSearching) {
    return (
      <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar onMobileSearchToggle={handleMobileSearchToggle} />
        <SecondaryNavbar />
        <div className="shop-container">
          <div className="loading-state" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#666'
          }}>
            {isSearching 
              ? (currentLang === 'ar' ? 'جاري البحث...' : 'Searching...') 
              : (currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...')
            }
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar onMobileSearchToggle={handleMobileSearchToggle} />
        <SecondaryNavbar />
        <div className="shop-container">
          <div className="error-state" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#ef4444'
          }}>
            {currentLang === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products'}
          </div>
        </div>
      </div>
    );
  }

//----------------------------------return------------------------------------------------
  return (
    <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar onMobileSearchToggle={handleMobileSearchToggle} />
      <SecondaryNavbar />
      
      {isMobileSearchOpen && (
        <MobileSearch
          isOpen={isMobileSearchOpen}
          onClose={handleMobileSearchClose}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          products={allProducts}
          currentLang={currentLang}
          t={t}
        />
      )}

      <div className="shop-container">
        <div className="shop-main">
          {/* Sidebar Filters */}
          <SidebarFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            removeFilter={removeFilter}
            initialMaxPrice={getMaxProductPrice()}
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            filteredProducts={filteredProducts}
            allProducts={allProducts}
            categories={categories || []}
            getMainCategories={getMainCategories}
            getSubCategories={getSubCategories}
            getAllColors={getAllColors}
          />

          {/* Main Content */}
          <div className="shop-content">
            {/* Mobile Filters Toggle */}
            {isMobile && (
              <button
                className="mobile-filters-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {t('shop.filters')} ({Object.values(filters).flat().length - 2})
              </button>
            )}

            {/* Mobile Filters */}
            {isMobile && showFilters && (
              <MobileFilters
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories || []}
                features={[]} // Features can be added when API is available
                colors={getAllColors()}
                statusOptions={['in_stock', 'on_sale', 'new', 'featured']}
                allProducts={allProducts}
                clearFilters={clearFilters}
                removeFilter={removeFilter}
                initialMaxPrice={getMaxProductPrice()}
                t={t}
                currentLang={currentLang}
              />
            )}

            {/* Shop Toolbar */}
            <ShopToolbar
              filters={filters}
              handleSortChange={handleSortChange}
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={handleItemsPerPageChange}
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentLang={currentLang}
              filteredCount={filteredProducts.length}
              totalCount={allProducts.length}
            />

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductsGrid
                products={paginatedProducts}
                viewMode={viewMode}
                currentLang={currentLang}
                t={t}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={handleAddToCart}
                getFeatureById={getFeatureById}
                getCategoryById={getCategoryById}
              />
            ) : (
              <div className="no-products">
                <h3>{t('shop.no_products_title')}</h3>
                <p>{t('shop.no_products_description')}</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  {t('shop.clear_filters')}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
                getVisiblePages={getVisiblePages}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

 
};

export default Shop; 