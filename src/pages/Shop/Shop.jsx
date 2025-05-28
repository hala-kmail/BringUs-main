import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import TopBar from '../../components/TopBar/TopBar';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import { allProducts, categories, features } from '../../data/index';
import './Shop.css';

const Shop = () => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 100 },
    categories: [],
    colors: [],
    brands: [],
    status: [],
    sortBy: 'latest'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
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
  const statusOptions = ['In Stock', 'On Sale'];

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
        return category && filters.categories.includes(category.name.en);
      });
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const feature = features.find(feat => feat.id === product.featureId);
        if (feature) {
          return filters.brands.some(brand => 
            feature.name.en.toLowerCase() === brand.toLowerCase()
          );
        }
        return false;
      });
    }

    // Apply status filter
    if (filters.status.includes('On Sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice);
    }

    if (filters.status.includes('In Stock')) {
      baseProducts = baseProducts.filter(product => product.stock > 0);
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

  // Function to count products by brand from filtered products
  const getBrandCount = (brandName) => {
    // Get products that match current filters (excluding brand filter)
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
        return category && filters.categories.includes(category.name.en);
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
    if (filters.status.includes('On Sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice);
    }

    if (filters.status.includes('In Stock')) {
      baseProducts = baseProducts.filter(product => product.stock > 0);
    }

    // Now count products that match this brand
    return baseProducts.filter(product => {
      const feature = features.find(feat => feat.id === product.featureId);
      return feature && feature.name.en.toLowerCase() === brandName.toLowerCase();
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

    // Apply brand filter
    if (filters.brands.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const feature = features.find(feat => feat.id === product.featureId);
        if (feature) {
          return filters.brands.some(brand => 
            feature.name.en.toLowerCase() === brand.toLowerCase()
          );
        }
        return false;
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
    if (filters.status.includes('On Sale')) {
      baseProducts = baseProducts.filter(product => product.discountPrice);
    }

    if (filters.status.includes('In Stock')) {
      baseProducts = baseProducts.filter(product => product.stock > 0);
    }

    // Now count products that match this category
    return baseProducts.filter(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return category && category.name.en === categoryName;
    }).length;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  useEffect(() => {
    applyPagination();
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    updateFilterCounts();
  }, [filters, currentLang]);

  const updateFilterCounts = () => {
    const counts = {};
    
    // Count categories
    categoriesList.forEach(category => {
      counts[`category_${category}`] = getCategoryCount(category);
    });
    
    // Count colors
    colors.forEach(color => {
      counts[`color_${color}`] = getColorCount(color);
    });
    
    // Count brands
    brands.forEach(brand => {
      counts[`brand_${brand}`] = getBrandCount(brand);
    });
    
    setFilterCounts(counts);
  };

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredProducts.slice(startIndex, endIndex);
    setPaginatedProducts(paginated);
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    let filtered = [...allProducts];

    // Price filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });
    console.log('After price filter:', filtered.length);

    // Category filter - using new structure
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.name.en);
      });
      console.log('After category filter:', filtered.length);
    }

    // Brand filter - using new features structure
    if (filters.brands.length > 0) {
      console.log('Selected brands:', filters.brands);
      filtered = filtered.filter(product => {
        const feature = features.find(feat => feat.id === product.featureId);
        if (feature) {
          const matches = filters.brands.some(brand => 
            feature.name.en.toLowerCase() === brand.toLowerCase()
          );
          if (matches) {
            console.log('Product matches brand filter:', product.name.en, 'Feature:', feature.name.en);
          }
          return matches;
        }
        return false;
      });
      console.log('After brand filter:', filtered.length);
    }

    // Color filter (based on product colors array or name)
    if (filters.colors.length > 0) {
      console.log('Selected colors:', filters.colors);
      filtered = filtered.filter(product => {
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors)) {
          const matches = filters.colors.some(color => 
            product.colors.includes(color)
          );
          if (matches) {
            console.log('Product matches color filter (colors array):', product.name.en);
          }
          return matches;
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
        
        const matches = filters.colors.some(color => {
          const keywords = colorKeywords[color] || [color.toLowerCase()];
          return keywords.some(keyword => productName.includes(keyword));
        });
        
        if (matches) {
          console.log('Product matches color filter (name):', product.name.en);
        }
        return matches;
      });
      console.log('After color filter:', filtered.length);
    }

    // Status filter
    if (filters.status.includes('On Sale')) {
      filtered = filtered.filter(product => product.discountPrice);
    }

    if (filters.status.includes('In Stock')) {
      // Using the new stock field
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.originalPrice) - (b.discountPrice || b.originalPrice));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.originalPrice) - (a.discountPrice || a.originalPrice));
        break;
      case 'name':
        filtered.sort((a, b) => a.name[currentLang].localeCompare(b.name[currentLang]));
        break;
      default:
        // latest - keep original order
        break;
    }

    console.log('Final filtered products:', filtered.length);
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'priceRange') {
        newFilters.priceRange = value;
      } else if (Array.isArray(newFilters[filterType])) {
        if (checked) {
          newFilters[filterType] = [...newFilters[filterType], value];
        } else {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        }
      } else {
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 100 },
      categories: [],
      colors: [],
      brands: [],
      status: [],
      sortBy: 'latest'
    });
  };

  const clearCategoryFilter = () => {
    setFilters(prev => ({ ...prev, categories: [] }));
  };

  // Individual filter removal functions
  const removeFilter = (filterType, value) => {
    console.log('Removing filter:', filterType, value);
    setFilters(prev => {
      const newFilters = { ...prev };
      if (Array.isArray(newFilters[filterType])) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
      console.log('Updated filters:', newFilters);
      return newFilters;
    });
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
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
      />

      <div className="shop-container">
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
            {(filters.categories.length > 0 || filters.brands.length > 0 || filters.colors.length > 0 || filters.status.length > 0) && (
              <div className="active-filters">
                {filters.categories.map(category => (
                  <span 
                    key={category} 
                    className="active-filter"
                    onClick={() => removeFilter('categories', category)}
                    title={`Remove ${category} filter`}
                  >
                    <span className="filter-close">✕</span> {category}
                  </span>
                ))}
                {filters.brands.map(brand => (
                  <span 
                    key={brand} 
                    className="active-filter"
                    onClick={() => removeFilter('brands', brand)}
                    title={`Remove ${brand} filter`}
                  >
                    <span className="filter-close">✕</span> {t(`shop.brands.${brand.toLowerCase()}`)}
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
                    <span className="filter-close">✕</span> {t(`shop.${status.toLowerCase().replace(' ', '_')}`)}
                  </span>
                ))}
                <button className="clear-category-btn" onClick={clearFilters}>
                  ✕ {t('shop.clear_filters')}
                </button>
              </div>
            )}

            {/* Price Filter */}
            <div className="filter-section">
              <h4>{t('shop.price_filter')}</h4>
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
            </div>

            {/* Product Categories */}
            <div className="filter-section">
              <h4>{t('shop.product_categories')}</h4>
              <div className="category-list">
                {categoriesList.map(category => {
                  const count = filterCounts[`category_${category}`] || 0;
                  return count > 0 ? (
                    <label key={category} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => handleFilterChange('categories', category, e.target.checked)}
                      />
                      <span className="checkmark">+</span>
                      {t(`categories.${getCategoryTranslationKey(category)}`, category)} ({count})
                    </label>
                  ) : null;
                })}
              </div>
            </div>

            {/* Filter by Color */}
            <div className="filter-section">
              <h4>{t('shop.filter_by_color')}</h4>
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
            </div>

            {/* Filter by Brands */}
            <div className="filter-section">
              <h4>{t('shop.filter_by_brands')}</h4>
              <div className="brand-filters">
                {brands.map(brand => {
                  const count = filterCounts[`brand_${brand}`] || 0;
                  return count > 0 ? (
                    <label key={brand} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => handleFilterChange('brands', brand, e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      {t(`shop.brands.${brand.toLowerCase()}`)} ({count})
                    </label>
                  ) : null;
                })}
              </div>
            </div>

            {/* Product Status */}
            <div className="filter-section">
              <h4>{t('shop.product_status')}</h4>
              <div className="status-filters">
                {statusOptions.map(status => (
                  <label key={status} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => handleFilterChange('status', status, e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    {t(`shop.${status.toLowerCase().replace(' ', '_')}`)}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="shop-content">
            {/* Toolbar */}
            <div className="shop-toolbar">
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
                  <label>{t('shop.sort')}:</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="latest">{t('shop.sort_by_latest')}</option>
                    <option value="price-low">{t('shop.sort_by_price_low')}</option>
                    <option value="price-high">{t('shop.sort_by_price_high')}</option>
                    <option value="name">{t('shop.sort_by_name')}</option>
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
            <div className={`products-grid ${viewMode}`}>
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