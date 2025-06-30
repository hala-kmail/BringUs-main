import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import Navbar from '../../components/Navbar/Navbar';
import SecondaryNavbar from '../../components/SecondaryNavbar/SecondaryNavbar';
import MobileSearch from '../../components/MobileSearch/MobileSearch';
import MobileFilters from '../../components/MobileFilters/MobileFilters';
import { allProducts, categories, features, getSubCategories, getFeatureById, getCategoryById, getMainCategories, getMaxProductPrice  } from '../../data/index';
import './Shop.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import SidebarFilters from '../../components/Shop/SidebarFilters';
import ProductsGrid from '../../components/Shop/ProductsGrid';
import Pagination from '../../components/Shop/Pagination';
import ShopToolbar from '../../components/Shop/ShopToolbar';
import useScrollToTopOnChange from '../../utils/useScrollToTopOnChange';

const Shop = () => {
  
  const { t, i18n } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  //-----------------------------------getMaxProductPrice------------------------------------------------  
  const initialMaxPrice = getMaxProductPrice();
  //-----------------------------------Filter states------------------------------------------------  
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: initialMaxPrice },
    categories: [],
    subcategories: [], 
    features: [],
    colors: [],
    status: [],
    sortBy: 'newest'
  });

//-----------------------------------View mode------------------------------------------------  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  
  //-----------------------------------Pagination states------------------------------------------------  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedProducts, setPaginatedProducts] = useState([]);

  const currentLang = i18n.language;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // الآثار الجانبية والتبعيات
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [filters, searchQuery]);

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
  const applyFilters = () => {
    let filtered = [...allProducts];

    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(product => {
        const name = (product.name[currentLang] || '').toString().toLowerCase();
        const desc = (product.description[currentLang] || '').toString().toLowerCase();
        return name.includes(searchTerm) || desc.includes(searchTerm);
      });
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
    // if (filters.subcategories.length > 0) {
    //   filtered = filtered.filter(product => filters.subcategories.includes(product.subcategoryId));
    // }

    // Apply feature filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(product => filters.features.includes(product.featureId));
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    // Apply status filters
    if (filters.status.includes('on_sale')) {
      filtered = filtered.filter(product => {
        const now = new Date();
        const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
        const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
        return hasDiscount && validTime;
      });
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

//----------------------------------getAllDescendantCategoryIds------------------------------------------------
  // Helper: جلب كل معرفات الفروع المتداخلة لقسم معين (recursive)
  const getAllDescendantCategoryIds = (categoryId) => {
    const directSubs = getSubCategories(categoryId);
    let ids = [categoryId];
    directSubs.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub.id));
    });
    return ids;
  };

//----------------------------------handleFilterChange------------------------------------------------
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
      setFilters(prev => {
        let newSubcategories = checked
          ? Array.from(new Set([...prev.subcategories, value]))
          : prev.subcategories.filter(id => id !== value);
        // ابحث عن الفئة الرئيسية لهذه الفئة الفرعية عبر جميع الفئات
        let parentCatId = null;
        for (const cat of categories) {
          const subs = getSubCategories(cat.id);
          if (subs.some(sub => sub.id === value)) {
            parentCatId = cat.id;
            break;
          }
        }
        let newCategories = [...prev.categories];
        if (parentCatId) {
          // جميع الفروع لهذه الفئة الرئيسية
          const allSubs = getSubCategories(parentCatId).map(sub => sub.id);
          const allSelected = allSubs.length > 0 && allSubs.every(id => newSubcategories.includes(id));
          if (allSelected) {
            // إذا كل الفروع محددة، أضف الرئيسية
            if (!newCategories.includes(parentCatId)) newCategories.push(parentCatId);
      } else {
            // إذا لم تعد كل الفروع محددة، أزل الرئيسية
            newCategories = newCategories.filter(id => id !== parentCatId);
      }
        }
        return {
          ...prev,
          subcategories: newSubcategories,
          categories: newCategories
        };
      });
      return;
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
      priceRange: { min: 0, max: initialMaxPrice },
      categories: [],
      subcategories: [], // Clear subcategories too
      features: [],
      colors: [],
      status: [],
      sortBy: 'default'
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
  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

//----------------------------------handleAddToCart------------------------------------------------
  const handleAddToCart = (product) => {
    // Navigate to product details page
    navigate(`/product/${product.id}`);
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
  const handleSearch = (query) => {
    setSearchQuery(query);
    // تحديث URL params
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
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => colorSet.add(color));
      }
    });
    return Array.from(colorSet);
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
            initialMaxPrice={initialMaxPrice}
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            filteredProducts={filteredProducts}
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
                categories={categories}
                features={features}
                colors={getAllColors()}
                statusOptions={['in_stock', 'on_sale', 'new', 'featured']}
                clearFilters={clearFilters}
                removeFilter={removeFilter}
                initialMaxPrice={initialMaxPrice}
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