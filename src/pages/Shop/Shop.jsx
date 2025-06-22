import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import MobileFilters from '../../components/MobileFilters/MobileFilters';
import { allProducts, categories, features, subcategories, getSubCategories, getFeatureById, getCategoryById, getMainCategories } from '../../data/index';
import './Shop.css';
import namer from 'color-namer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SidebarFilters from '../../components/Shop/SidebarFilters';
import ProductsGrid from '../../components/Shop/ProductsGrid';
import Pagination from '../../components/Shop/Pagination';
import ShopToolbar from '../../components/Shop/ShopToolbar';

const Shop = () => {
  
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Search state - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // احسب أعلى سعر من المنتجات
  const getMaxProductPrice = () => {
    return Math.max(
      ...allProducts.map(p => p.discountPrice || p.originalPrice || 0)
    );
  };

  const initialMaxPrice = getMaxProductPrice();

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: initialMaxPrice },
    categories: [],
    subcategories: [], // Add subcategories filter
    features: [],
    colors: [],
    status: [],
    sortBy: 'default'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // State for expanded categories (to show subcategories)
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // State for collapsed filter sections on desktop
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    categories: false,
    colors: false,
    features: false,
    status: false
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [filterCounts, setFilterCounts] = useState({});

  const currentLang = i18n.language;

  // Get all unique categories from the new data structure
  const getAllCategories = () => {
    return categories.map(category => category.name.en).sort();
  };
  
  const categoriesList = getAllCategories();

  // Helper function to convert category name to translation key
  const getCategoryTranslationKey = (category) => {
    return category.toLowerCase().replace(/\s*&\s*/g, '_').replace(/\s+/g, '_');
  };

  // استخرج جميع الألوان الفريدة من المنتجات
  const getAllColors = () => {
    const colorSet = new Set();
    allProducts.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => colorSet.add(color));
      }
    });
    return Array.from(colorSet);
  };

  const colors = getAllColors();
  
  // Get all unique brands from the new features structure
  const getAllBrands = () => {
    return features.map(feature => feature.name.en).sort();
  };
  
  const brands = getAllBrands();
  const statusOptions = ['in_stock', 'on_sale', 'new', 'featured'];

  // Function to count products by color from filtered products
  const getColorCount = (color) => {
    let baseProducts = [...allProducts];

    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter (شامل كل الفروع المتداخلة)
    if (filters.categories.length > 0) {
      let allCategoryIds = [];
      filters.categories.forEach(catId => {
        allCategoryIds = allCategoryIds.concat(getAllDescendantCategoryIds(catId));
      });
      allCategoryIds = Array.from(new Set(allCategoryIds));
      baseProducts = baseProducts.filter(product => allCategoryIds.includes(product.categoryId));
    }

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.subcategories.includes(product.subcategoryId);
      });
    }

    // Apply feature filter
    if (filters.features.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice || product.discountPercentage);
    }
    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => product.stock && product.stock > 0);
    }
    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }
    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isBestSeller === true);
    }

    // الآن عد المنتجات التي تحتوي على اللون المطلوب فقط
    return baseProducts.filter(product => {
      return product.colors && Array.isArray(product.colors) && product.colors.includes(color);
    }).length;
  };

  // Function to count products by feature from filtered products
  const getFeatureCount = (featureId) => {
    // Get products that match current filters (excluding feature filter)
    let baseProducts = [...allProducts];
    
    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter
    if (filters.categories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.id);
      });
    }

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.subcategories.includes(product.subcategoryId);
      });
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice || product.discountPercentage);
    }

    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => product.stock && product.stock > 0);
    }

    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }

    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isBestSeller === true);
    }

    // Now count products that match this feature
    return baseProducts.filter(product => {
      return product.featureId === featureId;
    }).length;
  };

  // Function to count products by category from filtered products
  const getCategoryCount = (categoryName) => {
    // Get products that match current filters (excluding category filter)
    let baseProducts = [...allProducts];
    
    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.subcategories.includes(product.subcategoryId);
      });
    }

    // Apply feature filter
    if (filters.features.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice || product.discountPercentage);
    }

    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => product.stock && product.stock > 0);
    }

    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }

    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isBestSeller === true);
    }

    // Now count products that match this category
    return baseProducts.filter(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return category && category.name.en === categoryName;
    }).length;
  };

  // Function to count products by subcategory from filtered products
  const getSubcategoryCount = (subcategoryId) => {
    // Get products that match current filters (excluding subcategory filter)
    let baseProducts = [...allProducts];
    
    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter
    if (filters.categories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.id);
      });
    }

    // Apply feature filter
    if (filters.features.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice || product.discountPercentage);
    }

    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => product.stock && product.stock > 0);
    }

    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }

    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isBestSeller === true);
    }

    // Now count products that match this subcategory
    return baseProducts.filter(product => {
      return product.subcategoryId === subcategoryId;
    }).length;
  };

  // Function to toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Function to toggle filter section collapse
  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor URL search parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery]);

  useEffect(() => {
    applyPagination();
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    updateFilterCounts();
  }, [filters, currentLang]);

  useEffect(() => {
    const maxPrice = getMaxProductPrice();
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        max: maxPrice
      }
    }));
    // eslint-disable-next-line
  }, [allProducts.length]);

  const updateFilterCounts = () => {
    const counts = {};
    
    // Count categories
    categories.forEach(category => {
      counts[`category_${category.name.en}`] = getCategoryCount(category.name.en);
    });

    // Count subcategories
    subcategories.forEach(subcategory => {
      counts[`subcategory_${subcategory.id}`] = getSubcategoryCount(subcategory.id);
    });
    
    // Count colors
    colors.forEach(color => {
      counts[`color_${color}`] = getColorCount(color);
    });
    
    // Count features
    features.forEach(feature => {
      counts[`feature_${feature.id}`] = getFeatureCount(feature.id);
    });
    
    setFilterCounts(counts);
  };

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name[currentLang].toLowerCase().includes(searchTerm) ||
        product.description[currentLang].toLowerCase().includes(searchTerm)
      );
    }

    // Apply price filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter
    if (filters.categories.length > 0) {
      // اجمع كل الآيدي المتداخلة لكل قسم مختار
      let allCategoryIds = [];
      filters.categories.forEach(catId => {
        allCategoryIds = allCategoryIds.concat(getAllDescendantCategoryIds(catId));
      });
      allCategoryIds = Array.from(new Set(allCategoryIds));
      filtered = filtered.filter(product => allCategoryIds.includes(product.categoryId));
    }

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter(product => {
        return filters.subcategories.includes(product.subcategoryId);
      });
    }

    // Apply feature filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    // Apply status filter
      if (filters.status.includes('on_sale')) {
        filtered = filtered.filter(product => product.discountPrice || product.discountPercentage);
      }

      if (filters.status.includes('in_stock')) {
        filtered = filtered.filter(product => product.stock && product.stock > 0);
      }

      if (filters.status.includes('new')) {
        filtered = filtered.filter(product => product.isNew === true);
      }

      if (filters.status.includes('featured')) {
        filtered = filtered.filter(product => product.isBestSeller === true);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => (a.discountPrice || a.originalPrice) - (b.discountPrice || b.originalPrice));
        break;
      case 'price-high-low':
        filtered.sort((a, b) => (b.discountPrice || b.originalPrice) - (a.discountPrice || a.originalPrice));
        break;
      case 'name-a-z':
        filtered.sort((a, b) => a.name[currentLang].localeCompare(b.name[currentLang]));
        break;
      case 'name-z-a':
        filtered.sort((a, b) => b.name[currentLang].localeCompare(a.name[currentLang]));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.id - a.id; // Assume higher ID means newer
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      default:
        // Default sorting - keep original order
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset pagination when filters change
  };

  // Helper: جلب كل معرفات الفروع المتداخلة لقسم معين (recursive)
  const getAllDescendantCategoryIds = (categoryId) => {
    const directSubs = getSubCategories(categoryId);
    let ids = [categoryId];
    directSubs.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub.id));
    });
    return ids;
  };

  // عداد المنتجات لكل كاتيجوري (يشمل كل الفروع المتداخلة)
  const getCategoryProductCount = (categoryId) => {
    const allIds = getAllDescendantCategoryIds(categoryId);
    return allProducts.filter(product => allIds.includes(product.categoryId)).length;
  };

  // عند تغيير فلتر الكاتيجوري أو السب كاتيجوري
  const handleFilterChange = (filterType, value, checked = null) => {
    if (filterType === 'categories') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          categories: Array.from(new Set([...prev.categories, value]))
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(id => id !== value)
        }));
      }
    } else if (filterType === 'subcategories') {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          subcategories: Array.from(new Set([...prev.subcategories, value])),
          // إذا أضفت سب كاتيجوري، أزل الكاتيجوري الرئيسي له من الفلتر (حتى لا يكون مكرر)
          categories: prev.categories.filter(id => id !== value)
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          subcategories: prev.subcategories.filter(id => id !== value)
        }));
      }
    } else if (filterType === 'priceRange') {
      setFilters(prev => ({ ...prev, priceRange: value }));
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

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: initialMaxPrice },
      categories: [],
      subcategories: [], // Clear subcategories too
      features: [],
      colors: [],
      status: [],
      sortBy: 'default'
    });
    setExpandedCategories({}); // Collapse all categories
    setSearchQuery(''); // امسح نص البحث أيضاً
  };

  const clearCategoryFilter = () => {
    setFilters(prev => ({ ...prev, categories: [], subcategories: [] })); // Clear both categories and subcategories
    setExpandedCategories({}); // Collapse all categories
  };

  const removeFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }));
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product.id}`);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  // Search function
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Update URL search parameters
    if (query.trim()) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  // Pagination functions
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getVisiblePages = () => {
    if (totalPages <= 1) return [1];
    
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
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index && page <= totalPages);
  };

  const handleSortChange = (newSortBy) => {
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
  };

  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  function getColorLabel(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    // إذا لم توجد ترجمة (أو الترجمة نفسها هي المفتاح)، أظهر الاسم الإنجليزي أو الكود
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }

  // Helper: عرض شجرة الأقسام بشكل متداخل (recursive)
  const renderCategoryTree = (parentId = null, level = 0) => {
    const cats = parentId === null ? getMainCategories() : getSubCategories(parentId);
    if (!cats.length) return null;
    return (
      <div className={`category-tree level-${level}`}> 
        {cats.map(category => {
          const count = getCategoryProductCount(category.id);
          const hasChildren = getSubCategories(category.id).length > 0;
          const isExpanded = expandedCategories[category.id];
          return count > 0 ? (
            <div key={category.id} className="category-filter-item" style={{ marginLeft: level * 16 }}>
              <div className="category-main-filter">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={e => handleFilterChange('categories', category.id, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {category.name[currentLang]} ({count})
                </label>
                {hasChildren && (
                  <button
                    className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCategoryExpansion(category.id)}
                    type="button"
                  >
                    {isExpanded ?  '−' : '+'}
                  </button>
                )}
              </div>
              {/* الفروع - شجري */}
              {hasChildren && isExpanded && (
                <div className="subcategory-filters">
                  {renderCategoryTree(category.id, level + 1)}
                </div>
              )}
            </div>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* <TopBar /> */}
      <Navbar 
        onMobileSearchToggle={handleMobileSearchToggle}
        isMobileSearchOpen={isMobileSearchOpen}
      />
      <SecondaryNavbar />
      <MobileSearch 
        isOpen={isMobileSearchOpen}
        onClose={handleMobileSearchClose}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="shop-container">
        {/* Shop Header with Filter Button */}
        <div className="shop-header">
          <div className="shop-filters-toggle" style={{ display: 'none' }}>
            <button 
              className="filter-button"
              onClick={() => setShowFilters(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>{t('filters.title')}</span>
            </button>
          </div>
          
        
        </div>

        <div className="shop-main">
          {/* Sidebar Filters */}
         
            <SidebarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              filterCounts={filterCounts}
              collapsedSections={collapsedSections}
              toggleSectionCollapse={toggleSectionCollapse}
              expandedCategories={expandedCategories}
              toggleCategoryExpansion={toggleCategoryExpansion}
              categories={categories}
              subcategories={subcategories}
              features={features}
              colors={colors}
              statusOptions={statusOptions}
              clearFilters={clearFilters}
              removeFilter={removeFilter}
              getColorLabel={getColorLabel}
              getCategoryProductCount={getCategoryProductCount}
              renderCategoryTree={renderCategoryTree}
            
              currentLang={currentLang}
              initialMaxPrice={initialMaxPrice}
              searchQuery={searchQuery}
              handleSearch={handleSearch}
            />
       

          {/* Main Content */}
          <main className="shop-content">
            {/* Mobile Toolbar - Show on mobile */}
            <div className="mobile-shop-toolbar">
              {/* Top Row: Search info + Advanced Filters + View Controls */}
              <div className="mobile-filter-controls">
                <button 
                  className="mobile-filter-btn"
                  onClick={() => setShowFilters(true)}
                  title={t('filters.title')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>

                {/* Search Display */}
                {searchQuery && (
                  <div className="mobile-search-display">
                    <span>{t('search.searching_for', { query: searchQuery })}</span>
                    <button 
                      className="mobile-search-clear"
                      onClick={() => handleSearch('')}
                      title={t('search.clear')}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="mobile-view-controls">
                  <button 
                    className={`mobile-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title={t('shop.grid_view')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    className={`mobile-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title={t('shop.list_view')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>

              </div>

              {/* Bottom Row: Results Info */}
              <div className="mobile-results-info">
                <div className="mobile-results-count">
                  {searchQuery ? (
                    t('shop.search_results', { 
                      count: filteredProducts.length,
                      query: searchQuery 
                    })
                  ) : (
                    t('shop.showing_products', { 
                      count: filteredProducts.length 
                    })
                  )}
                </div>
                
                <div className="mobile-items-per-page">
                  <label>{t('shop.items_per_page')}:</label>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="mobile-items-select"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Toolbar (hidden on mobile) */}
            
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
            <ProductsGrid
              paginatedProducts={paginatedProducts}
              viewMode={viewMode}
              ProductCard={ProductCard}
              currentLang={currentLang}
              t={t}
              isInWishlist={isInWishlist}
              handleWishlistToggle={handleWishlistToggle}
              handleAddToCart={handleAddToCart}
              getFeatureById={getFeatureById}
              getCategoryById={getCategoryById}
              showStockInfo={true}
            />

            {/* Pagination */}
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              getVisiblePages={getVisiblePages}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop; 