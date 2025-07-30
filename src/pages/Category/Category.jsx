import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useWishlistAPI from '../../hooks/useWishlistAPI';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import ProductCard from '../../components/ProductCard/ProductCard';
import SidebarFilters from '../../components/Shop/SidebarFilters';
import ProductsGrid from '../../components/Shop/ProductsGrid';
import Pagination from '../../components/Shop/Pagination';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { useAppData } from '../../contexts/AppDataContext';
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';
import './Category.css';

const Category = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlistAPI();
  const { addToCart } = useCart();
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

  // Scroll to top when category changes
  useScrollToTopOnChange([categorySlug]);

  // Apply filters asynchronously
  const applyFiltersAsync = async () => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      await performAPISearch(searchQuery);
      return; // Search will set filteredProducts
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      await performCategoryFilter(filters.categories);
      return; // Category filter will set filteredProducts
    }

    // Apply other filters locally
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => {
        const productColors = getProductColors(product);
        return filters.colors.some(color => productColors.includes(color));
      });
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(product => {
        if (filters.status.includes('in_stock') && !isInStock(product)) return false;
        if (filters.status.includes('on_sale') && !product.salePrice) return false;
        if (filters.status.includes('new') && !isNewProduct(product)) return false;
        return true;
      });
    }

    // Apply sorting
    filtered = sortProducts(filtered, filters.sortBy);

    setFilteredProducts(filtered);
  };

  // Apply pagination
  const applyPagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  // Apply filters
  const applyFilters = async () => {
    setCurrentPage(1); // Reset to first page when filters change
    await applyFiltersAsync();
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [allProducts, searchQuery, filters]);

  // Apply pagination when filtered products change
  useEffect(() => {
    applyPagination();
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Get product colors
  const getProductColors = (product) => {
    if (!product.allColors) return [];
    
    if (Array.isArray(product.allColors)) {
      return product.allColors.map(color => {
        if (Array.isArray(color)) {
          return color.map(c => getColorKey(c)).join(',');
        }
        return getColorKey(color);
      });
    }
    
    return [getColorKey(product.allColors)];
  };

  // Get all descendant category IDs
  const getAllDescendantCategoryIds = (categoryId) => {
    const descendants = [];
    const addDescendants = (id) => {
      descendants.push(id);
      const subcategories = getSubCategories(id);
      subcategories.forEach(sub => addDescendants(sub.id));
    };
    addDescendants(categoryId);
    return descendants;
  };

  // Handle filter changes
  const handleFilterChange = async (filterType, value, checked = null) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'priceRange') {
        newFilters.priceRange = value;
      } else if (filterType === 'sortBy') {
        newFilters.sortBy = value;
      } else {
        if (checked !== null) {
          // Checkbox filter
          if (checked) {
            newFilters[filterType] = [...prev[filterType], value];
          } else {
            newFilters[filterType] = prev[filterType].filter(item => item !== value);
          }
        } else {
          // Single value filter
          newFilters[filterType] = [value];
        }
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: initialMaxPrice },
      categories: [],
      subcategories: [],
      features: [],
      colors: [],
      status: [],
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  // Remove specific filter
  const removeFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }));
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product) => {
    await toggleWishlist(product);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product._id || product.id}`);
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    // Update URL params
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Get visible pages for pagination
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
  };

  // Get all colors
  function getAllColors() {
    const colors = new Set();
    allProducts.forEach(product => {
      const productColors = getProductColors(product);
      productColors.forEach(color => colors.add(color));
    });
    return Array.from(colors).sort();
  }

  // Get feature by ID
  const getFeatureById = (id) => {
    return features.find(feature => feature.id === id);
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category._id === id);
  };

  // Sort products
  const sortProducts = (products, sortBy) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0));
      case 'price_high':
        return sorted.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0));
      case 'name_az':
        return sorted.sort((a, b) => {
          const nameA = getProductName(a, currentLang).toLowerCase();
          const nameB = getProductName(b, currentLang).toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'name_za':
        return sorted.sort((a, b) => {
          const nameA = getProductName(a, currentLang).toLowerCase();
          const nameB = getProductName(b, currentLang).toLowerCase();
          return nameB.localeCompare(nameA);
        });
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  // Check if product is in stock
  const isInStock = (product) => {
    return product.stockQuantity > 0;
  };

  // Check if product is new
  const isNewProduct = (product) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.createdAt) > thirtyDaysAgo;
  };

  // Get color key
  const getColorKey = (color) => {
    if (typeof color === 'string') return color;
    if (color && color.name) return color.name;
    return 'unknown';
  };

  // Get final price
  const getFinalPrice = (product) => {
    return product.salePrice || product.price || 0;
  };

  // Get main image
  const getMainImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder-product.jpg';
  };

  // Get product name
  const getProductName = (product, lang) => {
    if (product.name && product.name[lang]) {
      return product.name[lang];
    }
    if (product.name && product.name.ar) {
      return product.name.ar;
    }
    if (product.name && product.name.en) {
      return product.name.en;
    }
    return product.name || 'Product';
  };

  // Get cart totals
  const { getCartTotals } = useCart();
  const cartTotals = getCartTotals();
  const cartItemsCount = cartTotals.itemsCount;

  // Get features (placeholder)
  const features = [];

  return (
    <div className="category-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
      />
      
      <div className="category-container">
        {/* Sidebar Filters */}
        {!isMobile && (
          <SidebarFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onRemoveFilter={removeFilter}
            getAllColors={getAllColors}
            getFeatureById={getFeatureById}
            getCategoryById={getCategoryById}
            currentLang={currentLang}
            t={t}
          />
        )}

        {/* Main Content */}
        <div className="category-main">
          {/* Toolbar */}
          <ShopToolbar
            totalProducts={filteredProducts.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSortChange={handleSortChange}
            currentSort={filters.sortBy}
            onShowFilters={() => setShowFilters(true)}
            isMobile={isMobile}
            currentLang={currentLang}
            t={t}
          />

          {/* Products Grid */}
          <ProductsGrid
            products={paginatedProducts}
            viewMode={viewMode}
            loading={productsLoading || isSearching}
            error={productsError}
            isInWishlist={isInWishlist}
            handleWishlistToggle={handleWishlistToggle}
            handleAddToCart={handleAddToCart}
            getFeatureById={getFeatureById}
            getCategoryById={getCategoryById}
            currentLang={currentLang}
            t={t}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
              visiblePages={getVisiblePages()}
              currentLang={currentLang}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobile && showFilters && (
        <div className="mobile-filters-overlay">
          <div className="mobile-filters-modal">
            <SidebarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onRemoveFilter={removeFilter}
              getAllColors={getAllColors}
              getFeatureById={getFeatureById}
              getCategoryById={getCategoryById}
              currentLang={currentLang}
              t={t}
            />
            <button 
              className="close-filters-btn"
              onClick={() => setShowFilters(false)}
            >
              {t('filters.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;