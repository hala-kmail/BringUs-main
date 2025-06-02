import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import MobileFilters from '../../components/MobileFilters/MobileFilters';
import { allProducts, categories, features, subcategories, getSubcategoriesByCategory } from '../../data/index';
import './Shop.css';

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
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 100 },
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

  const colors = ['Green', 'Red', 'Yellow', 'Orange', 'Blue', 'Purple'];
  
  // Get all unique brands from the new features structure
  const getAllBrands = () => {
    return features.map(feature => feature.name.en).sort();
  };
  
  const brands = getAllBrands();
  const statusOptions = ['in_stock', 'on_sale', 'new', 'featured'];

  // Function to count products by color from filtered products
  const getColorCount = (color) => {
    // Get products that match current filters (excluding color filter)
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

    // Now count products that match this color
    return baseProducts.filter(product => {
      // Check if product has colors array
      if (product.colors && Array.isArray(product.colors)) {
        return product.colors.includes(color);
      }
      
      // Fallback: check product name for color keywords
      const productName = product.name[currentLang].toLowerCase();
      const colorKeywords = {
        'Red': ['red', 'أحمر', 'tomato', 'طماطم', 'apple', 'تفاح'],
        'Green': ['green', 'أخضر', 'spinach', 'سبانخ', 'lettuce', 'خس'],
        'Yellow': ['yellow', 'أصفر', 'banana', 'موز', 'lemon', 'ليمون'],
        'Orange': ['orange', 'برتقالي', 'carrot', 'جزر', 'pumpkin', 'يقطين'],
        'Blue': ['blue', 'أزرق', 'blueberry', 'توت أزرق'],
        'Purple': ['purple', 'بنفسجي', 'eggplant', 'باذنجان', 'grape', 'عنب']
      };
      
      const keywords = colorKeywords[color] || [color.toLowerCase()];
      return keywords.some(keyword => productName.includes(keyword));
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
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors)) {
          return filters.colors.some(color => 
            product.colors.includes(color)
          );
        }
        
        // Fallback: check product name for color keywords
        const productName = product.name[currentLang].toLowerCase();
        const colorKeywords = {
          'Red': ['red', 'أحمر', 'tomato', 'طماطم', 'apple', 'تفاح'],
          'Green': ['green', 'أخضر', 'spinach', 'سبانخ', 'lettuce', 'خس'],
          'Yellow': ['yellow', 'أصفر', 'banana', 'موز', 'lemon', 'ليمون'],
          'Orange': ['orange', 'برتقالي', 'carrot', 'جزر', 'pumpkin', 'يقطين'],
          'Blue': ['blue', 'أزرق', 'blueberry', 'توت أزرق'],
          'Purple': ['purple', 'بنفسجي', 'eggplant', 'باذنجان', 'grape', 'عنب']
        };
        
        return filters.colors.some(color => {
          const keywords = colorKeywords[color] || [color.toLowerCase()];
          return keywords.some(keyword => productName.includes(keyword));
        });
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
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors)) {
          return filters.colors.some(color => 
            product.colors.includes(color)
          );
        }
        
        // Fallback: check product name for color keywords
        const productName = product.name[currentLang].toLowerCase();
        const colorKeywords = {
          'Red': ['red', 'أحمر', 'tomato', 'طماطم', 'apple', 'تفاح'],
          'Green': ['green', 'أخضر', 'spinach', 'سبانخ', 'lettuce', 'خس'],
          'Yellow': ['yellow', 'أصفر', 'banana', 'موز', 'lemon', 'ليمون'],
          'Orange': ['orange', 'برتقالي', 'carrot', 'جزر', 'pumpkin', 'يقطين'],
          'Blue': ['blue', 'أزرق', 'blueberry', 'توت أزرق'],
          'Purple': ['purple', 'بنفسجي', 'eggplant', 'باذنجان', 'grape', 'عنب']
        };
        
        return filters.colors.some(color => {
          const keywords = colorKeywords[color] || [color.toLowerCase()];
          return keywords.some(keyword => productName.includes(keyword));
        });
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
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors)) {
          return filters.colors.some(color => 
            product.colors.includes(color)
          );
        }
        
        // Fallback: check product name for color keywords
        const productName = product.name[currentLang].toLowerCase();
        const colorKeywords = {
          'Red': ['red', 'أحمر', 'tomato', 'طماطم', 'apple', 'تفاح'],
          'Green': ['green', 'أخضر', 'spinach', 'سبانخ', 'lettuce', 'خس'],
          'Yellow': ['yellow', 'أصفر', 'banana', 'موز', 'lemon', 'ليمون'],
          'Orange': ['orange', 'برتقالي', 'carrot', 'جزر', 'pumpkin', 'يقطين'],
          'Blue': ['blue', 'أزرق', 'blueberry', 'توت أزرق'],
          'Purple': ['purple', 'بنفسجي', 'eggplant', 'باذنجان', 'grape', 'عنب']
        };
        
        return filters.colors.some(color => {
          const keywords = colorKeywords[color] || [color.toLowerCase()];
          return keywords.some(keyword => productName.includes(keyword));
        });
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
      filtered = filtered.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.id);
      });
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
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors)) {
          return filters.colors.some(color => 
            product.colors.includes(color)
          );
        }
        
        // Fallback: check product name for color keywords
        const productName = product.name[currentLang].toLowerCase();
        const colorKeywords = {
          'Red': ['red', 'أحمر', 'tomato', 'طماطم', 'apple', 'تفاح'],
          'Green': ['green', 'أخضر', 'spinach', 'سبانخ', 'lettuce', 'خس'],
          'Yellow': ['yellow', 'أصفر', 'banana', 'موز', 'lemon', 'ليمون'],
          'Orange': ['orange', 'برتقالي', 'carrot', 'جزر', 'pumpkin', 'يقطين'],
          'Blue': ['blue', 'أزرق', 'blueberry', 'توت أزرق'],
          'Purple': ['purple', 'بنفسجي', 'eggplant', 'باذنجان', 'grape', 'عنب']
        };
        
        return filters.colors.some(color => {
          const keywords = colorKeywords[color] || [color.toLowerCase()];
          return keywords.some(keyword => productName.includes(keyword));
        });
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

  const handleFilterChange = (filterType, value, checked = null) => {
    if (filterType === 'priceRange') {
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
      priceRange: { min: 0, max: 100 },
      categories: [],
      subcategories: [], // Clear subcategories too
      features: [],
      colors: [],
      status: [],
      sortBy: 'default'
    });
    setExpandedCategories({}); // Collapse all categories
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

  return (
    <div className="shop-page" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <TopBar />
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
          
          {/* Hero Banner */}
          <div className="shop-hero">
            <div className="shop-hero-content">
              <span className="shop-hero-badge">{t('shop.only_this_week')}</span>
              <h1 className="shop-hero-title">{t('shop.hero_title')}</h1>
              <p className="shop-hero-subtitle">{t('shop.hero_subtitle')}</p>
              <button className="shop-hero-btn">
                {t('shop.shop_now')} {currentLang === 'ar' ? '←' : '→'}
              </button>
            </div>
            <div className="shop-hero-image">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80" alt="Grocery" />
            </div>
          </div>
        </div>

        <div className="shop-main">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="shop-sidebar-header">
              <h3>{t('shop.filters')}</h3>
              <button className="clear-filters-btn" onClick={clearFilters}>
                ✕ {t('shop.clear_filters')}
              </button>
            </div>

            {/* Active Filters */}
            {(filters.categories.length > 0 || filters.subcategories.length > 0 || filters.features.length > 0 || filters.colors.length > 0 || filters.status.length > 0) && (
              <div className="active-filters">
                {filters.categories.map(categoryId => {
                  const category = categories.find(cat => cat.id === categoryId);
                  return (
                    <span 
                      key={categoryId} 
                      className="active-filter"
                      onClick={() => removeFilter('categories', categoryId)}
                      title={`Remove ${category?.name[currentLang] || categoryId} filter`}
                    >
                      <span className="filter-close">✕</span> {category?.name[currentLang] || categoryId}
                    </span>
                  );
                })}
                {filters.subcategories.map(subcategoryId => {
                  const subcategory = subcategories.find(sub => sub.id === subcategoryId);
                  return (
                    <span 
                      key={subcategoryId} 
                      className="active-filter"
                      onClick={() => removeFilter('subcategories', subcategoryId)}
                      title={`Remove ${subcategory?.name[currentLang] || subcategoryId} filter`}
                    >
                      <span className="filter-close">✕</span> {subcategory?.name[currentLang] || subcategoryId}
                    </span>
                  );
                })}
                {filters.features.map(feature => (
                  <span 
                    key={feature} 
                    className="active-filter"
                    onClick={() => removeFilter('features', feature)}
                    title={`Remove ${feature} filter`}
                  >
                    <span className="filter-close">✕</span> {features.find(f => f.id === feature)?.name[currentLang] || feature}
                  </span>
                ))}
                {filters.colors.map(color => (
                  <span 
                    key={color} 
                    className="active-filter"
                    onClick={() => removeFilter('colors', color)}
                    title={`Remove ${color} filter`}
                  >
                    <span className="filter-close">✕</span> {t(`shop.colors.${color.toLowerCase()}`)}
                  </span>
                ))}
                {filters.status.map(status => (
                  <span 
                    key={status} 
                    className="active-filter"
                    onClick={() => removeFilter('status', status)}
                    title={`Remove ${status} filter`}
                  >
                    <span className="filter-close">✕</span> {t(`filters.status_names.${status}`)}
                  </span>
                ))}
                <button className="clear-category-btn" onClick={clearFilters}>
                  ✕ {t('shop.clear_filters')}
                </button>
              </div>
            )}

            {/* Price Filter */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSectionCollapse('price')}>
                <h4>{t('shop.price_filter')}</h4>
                <button className={`section-collapse-btn ${collapsedSections.price ? 'collapsed' : 'expanded'}`}>
                  {collapsedSections.price ? '+' : '−'}
                </button>
              </div>
              {!collapsedSections.price && (
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder={t('shop.min_price')}
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', 
                        { ...filters.priceRange, min: Number(e.target.value) }
                      )}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder={t('shop.max_price')}
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', 
                        { ...filters.priceRange, max: Number(e.target.value) }
                      )}
                    />
                  </div>
                  <div className="price-range-slider">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', 
                        { ...filters.priceRange, min: Number(e.target.value) }
                      )}
                      className="range-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', 
                        { ...filters.priceRange, max: Number(e.target.value) }
                      )}
                      className="range-max"
                    />
                  </div>
                  <div className="price-display">
                    {t('shop.price')}: ${filters.priceRange.min} — ${filters.priceRange.max}
                  </div>
                  <button className="filter-btn">{t('shop.filter')}</button>
                </div>
              )}
            </div>

            {/* Product Categories with Subcategories */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSectionCollapse('categories')}>
                <h4>{t('shop.product_categories')}</h4>
                <button className={`section-collapse-btn ${collapsedSections.categories ? 'collapsed' : 'expanded'}`}>
                  {collapsedSections.categories ? '+' : '−'}
                </button>
              </div>
              {!collapsedSections.categories && (
                <div className="category-list">
                  {categories.map(category => {
                    const count = filterCounts[`category_${category.name.en}`] || 0;
                    const categorySubcategories = getSubcategoriesByCategory(category.id);
                    const hasSubcategories = categorySubcategories.length > 0;
                    const isExpanded = expandedCategories[category.id];
                    
                    return count > 0 ? (
                      <div key={category.id} className="category-filter-item">
                        <div className="category-main-filter">
                          <label className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category.id)}
                              onChange={(e) => handleFilterChange('categories', category.id, e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            {category.name[currentLang]} ({count})
                          </label>
                          {hasSubcategories && (
                            <button
                              className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => toggleCategoryExpansion(category.id)}
                              type="button"
                            >
                              {isExpanded ? (currentLang === 'ar' ? '−' : '−') : (currentLang === 'ar' ? '+' : '+')}
                            </button>
                          )}
                        </div>
                        
                        {/* Subcategories - show when expanded */}
                        {hasSubcategories && isExpanded && (
                          <div className="subcategory-filters">
                            {categorySubcategories.map(subcategory => {
                              const subcategoryCount = filterCounts[`subcategory_${subcategory.id}`] || 0;
                              return subcategoryCount > 0 ? (
                                <label key={subcategory.id} className="filter-checkbox subcategory-filter">
                                  <input
                                    type="checkbox"
                                    checked={filters.subcategories.includes(subcategory.id)}
                                    onChange={(e) => handleFilterChange('subcategories', subcategory.id, e.target.checked)}
                                  />
                                  <span className="checkmark"></span>
                                  {subcategory.name[currentLang]} ({subcategoryCount})
                                </label>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Filter by Color */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSectionCollapse('colors')}>
                <h4>{t('shop.filter_by_color')}</h4>
                <button className={`section-collapse-btn ${collapsedSections.colors ? 'collapsed' : 'expanded'}`}>
                  {collapsedSections.colors ? '+' : '−'}
                </button>
              </div>
              {!collapsedSections.colors && (
                <div className="color-filters">
                  {colors.map(color => {
                    const count = filterCounts[`color_${color}`] || 0;
                    return count > 0 ? (
                      <label key={color} className="color-filter">
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(color)}
                          onChange={(e) => handleFilterChange('colors', color, e.target.checked)}
                        />
                        <span className={`color-swatch color-${color.toLowerCase()}`}></span>
                        {t(`shop.colors.${color.toLowerCase()}`)} ({count})
                      </label>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Filter by Features */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSectionCollapse('features')}>
                <h4>{t('shop.filter_by_features')}</h4>
                <button className={`section-collapse-btn ${collapsedSections.features ? 'collapsed' : 'expanded'}`}>
                  {collapsedSections.features ? '+' : '−'}
                </button>
              </div>
              {!collapsedSections.features && (
                <div className="feature-filters">
                  {features.map(feature => {
                    const count = filterCounts[`feature_${feature.id}`] || 0;
                    return count > 0 ? (
                      <label key={feature.id} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature.id)}
                          onChange={(e) => handleFilterChange('features', feature.id, e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        {feature.name[currentLang]} ({count})
                      </label>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Product Status */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSectionCollapse('status')}>
                <h4>{t('shop.product_status')}</h4>
                <button className={`section-collapse-btn ${collapsedSections.status ? 'collapsed' : 'expanded'}`}>
                  {collapsedSections.status ? '+' : '−'}
                </button>
              </div>
              {!collapsedSections.status && (
                <div className="status-filters">
                  {statusOptions.map(status => (
                    <label key={status} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => handleFilterChange('status', status, e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      {t(`filters.status_names.${status}`)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

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

                <div className="mobile-sort-control">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="mobile-sort-select"
                  >
                    <option value="default">{t('shop.sort.default')}</option>
                    <option value="price-low-high">{t('shop.sort.price_low_high')}</option>
                    <option value="price-high-low">{t('shop.sort.price_high_low')}</option>
                    <option value="name-a-z">{t('shop.sort.name_a_z')}</option>
                    <option value="name-z-a">{t('shop.sort.name_z_a')}</option>
                    <option value="newest">{t('shop.sort.newest')}</option>
                    <option value="oldest">{t('shop.sort.oldest')}</option>
                  </select>
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
            <div className="shop-toolbar desktop-only">
              <div className="toolbar-left">
                <button 
                  className="mobile-filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  ☰ {t('shop.filters')}
                </button>
                <span className="results-count">
                  {t('shop.showing_results', { 
                    start: (currentPage - 1) * itemsPerPage + 1,
                    end: Math.min(currentPage * itemsPerPage, filteredProducts.length),
                    total: filteredProducts.length 
                  })}
                </span>
              </div>
              
              <div className="toolbar-right">
                <div className="sort-controls">
                  <label>{t('shop.sorting')}:</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="default">{t('shop.sort.default')}</option>
                    <option value="price-low-high">{t('shop.sort.price_low_high')}</option>
                    <option value="price-high-low">{t('shop.sort.price_high_low')}</option>
                    <option value="name-a-z">{t('shop.sort.name_a_z')}</option>
                    <option value="name-z-a">{t('shop.sort.name_z_a')}</option>
                    <option value="newest">{t('shop.sort.newest')}</option>
                    <option value="oldest">{t('shop.sort.oldest')}</option>
                  </select>
                </div>
                
                <div className="show-controls">
                  <label>{t('shop.show')}:</label>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  >
                    <option value="10">10 {t('shop.items')}</option>
                    <option value="20">20 {t('shop.items')}</option>
                    <option value="50">50 {t('shop.items')}</option>
                  </select>
                </div>

                <div className="view-controls">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`products-grid desktop-grid ${viewMode}`}>
              {paginatedProducts.map((product) => (
                <div key={product.id} className="product-card">
                  {/* Product Image */}
                  <div className="product-image">
                    <Link to={`/product/${product.id}`}>
                      <img src={product.image} alt={product.name[currentLang]} />
                    </Link>
                    
                    {/* Wishlist Heart */}
                    <div 
                      className="wishlist-btn"
                      onClick={() => handleWishlistToggle(product)}
                    >
                      <svg 
                        width="24"
                        height="24"
                        viewBox="0 0 24 24" 
                        fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                        stroke={isInWishlist(product.id) ? '#ef4444' : '#6b7280'}
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>

                    {/* Discount Badge */}
                    {product.discountPercentage && (
                      <div className="discount-badge">
                        -{product.discountPercentage}%
                      </div>
                    )}

                    {/* Feature Badge */}
                    {product.feature && (
                      <div className="feature-badge">
                        {product.feature[currentLang]}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="quick-actions">
                      <Link to={`/product/${product.id}`} className="quick-btn" title={t('shop.quick_view')}>
                        👁
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <Link to={`/product/${product.id}`} className="product-link">
                      <h3 className="product-name">{product.name[currentLang]}</h3>
                    </Link>
                    
                    {/* Price */}
                    <div className="product-price">
                      {product.discountPrice ? (
                        <>
                          <span className="current-price">
                            ${product.discountPrice.toFixed(2)}
                          </span>
                          <span className="original-price">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="stock-status in-stock">
                      <span className="stock-icon">✓</span>
                      {t('shop.in_stock')}
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="button-text">{t('shop.add_to_cart')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {currentLang === 'ar' ? '›' : '‹'}
                </button>
                
                {getVisiblePages().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="page-dots">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button 
                  className="page-btn next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {currentLang === 'ar' ? '‹' : '›'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop; 