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

    // Now count products that match this color
    return baseProducts.filter(product => {
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
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="shop-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3>{t('shop.filters')}</h3>
              {/* زر مسح الكل يظهر فقط عند وجود فلاتر نشطة */}
              {(filters.categories.length > 0 || filters.subcategories.length > 0 || filters.features.length > 0 || filters.colors.length > 0 || filters.status.length > 0 || filters.priceRange.min > 0 || filters.priceRange.max < initialMaxPrice || searchQuery) && (
                <button className="clear-filters-btn" onClick={clearFilters} style={{ marginRight: currentLang === 'ar' ? 0 : 8, marginLeft: currentLang === 'ar' ? 8 : 0, background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 13, color: '#ef4444', cursor: 'pointer' }}>
                  {t('shop.clear_filters')}
                </button>
              )}
            </div>

            {/* مربع البحث داخل الفلاتر الجانبية */}
            <div className="sidebar-search-box" style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type="text"
                className="sidebar-search-input"
                placeholder={t('search.placeholder') || 'ابحث عن منتج...'}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 32px 8px 8px', borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 0 }}
              />
              <button
                className="sidebar-search-clear"
                onClick={() => searchQuery ? handleSearch('') : null}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: searchQuery ? 'pointer' : 'default', fontSize: 18, color: '#aaa', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={searchQuery ? t('search.clear') : t('search.search')}
                tabIndex={-1}
                type="button"
              >
                {searchQuery ? (
                  '✕'
                ) : (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="7" stroke="#aaa" strokeWidth="2" />
                    <line x1="14.1213" y1="14.1213" x2="18" y2="18" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
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
                  const subcategory =  getSubCategories(subcategoryId);
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
                    <span className="filter-close">✕</span> {getColorLabel(color, t)}
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
                  {t('shop.price')}: ₪{filters.priceRange.min} — ₪{filters.priceRange.max}
                </div>
               
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
                {renderCategoryTree()}
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
                    return (
                      <label key={color} className="color-filter" style={{ opacity: count === 0 ? 0.5 : 1 }}>
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(color)}
                          onChange={e => handleFilterChange('colors', color, e.target.checked)}
                          disabled={count === 0 && !filters.colors.includes(color)}
                        />
                        <span
                          className="color-swatch"
                          style={
                            color === "mixed"
                              ? { background: "linear-gradient(90deg, #eab308 0%, #ef4444 50%, #3b82f6 100%)" }
                              : color && color.startsWith('#')
                                ? { background: color, border: color === "#fff" ? "2px solid #e2e8f0" : undefined }
                                : { background: '#e5e7eb', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }
                          }
                        >
                          {(!color.startsWith('#') && color !== 'mixed') && '?'}
                        </span>
                        <span className="color-name">{getColorLabel(color, t)}</span> ({count})
                        {count === 0 && !filters.colors.includes(color) && (
                          <span style={{ fontSize: '10px', color: '#aaa', marginLeft: 4 }}>{t('filters.not_available')}</span>
                        )}
                      </label>
                    );
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
                  {statusOptions.map(status => {
                    const count = filterCounts[`status_${status}`] || filteredProducts.filter(product => {
                      switch (status) {
                        case 'on_sale': return product.discountPrice || product.discountPercentage;
                        case 'in_stock': return product.stock && product.stock > 0;
                        case 'new': return product.isNew === true;
                        case 'featured': return product.isBestSeller === true;
                        default: return false;
                      }
                    }).length;
                    return (
                      <label key={status} className="filter-checkbox" style={{ opacity: count === 0 ? 0.5 : 1 }}>
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={e => handleFilterChange('status', status, e.target.checked)}
                          disabled={count === 0 && !filters.status.includes(status)}
                        />
                        <span className="checkmark"></span>
                        {t(`filters.status_names.${status}`)} ({count})
                        {count === 0 && !filters.status.includes(status) && (
                          <span style={{ fontSize: '10px', color: '#aaa', marginLeft: 4 }}>{t('filters.not_available')}</span>
                        )}
                      </label>
                    );
                  })}
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
                <ProductCard
                key={product.id}
                product={product}
                currentLang={currentLang}
                t={t}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={handleAddToCart}
                getFeatureById={getFeatureById}
                getCategoryById={getCategoryById}
                showStockInfo={true}
              />
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
                 ‹
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
                 ›
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