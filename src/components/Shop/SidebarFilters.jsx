import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Remove static imports
// import { getColorLabel, getAllColors } from '../../data/index';
// import { categories, features, getSubCategories, getMainCategories, allProducts } from '../../data/index';
import namer from 'color-namer';
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';

const SidebarFilters = ({
  filters,
  onFilterChange,
  clearFilters,
  removeFilter,
  initialMaxPrice,
  searchQuery,
  handleSearch,
  filteredProducts = [],
  // New props from Shop page
  allProducts = [],
  categories = [],
  getMainCategories,
  getSubCategories,
  getAllColors
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  
  //-----------------------------------State for collapsed filter sections on desktop------------------------------------------------  
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    categories: false,
    colors: false,
    features: false,
    status: false
  });

  //-----------------------------------State for expanded categories (to show subcategories)------------------------------------------------  
  const [expandedCategories, setExpandedCategories] = useState({});
  
  //-----------------------------------Filter counts state------------------------------------------------  
  const [filterCounts, setFilterCounts] = useState({});

  //-----------------------------------toggleSectionCollapse------------------------------------------------  
  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  //-----------------------------------toggleCategoryExpansion------------------------------------------------  
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  //-----------------------------------getAllColors from props or create fallback------------------------------------------------  
  const colors = getAllColors ? getAllColors() : [];

  //-----------------------------------statusOptions------------------------------------------------  
  const statusOptions = [];
  if (allProducts.some(p => (p.stock || 0) > 0)) statusOptions.push('in_stock');
  if (allProducts.some(p => p.salePrice && p.salePrice < (p.originalPrice || p.price))) statusOptions.push('on_sale');
  if (allProducts.some(p => p.isNew)) statusOptions.push('new');
  if (allProducts.some(p => p.isFeatured || p.isBestSeller)) statusOptions.push('featured');

  //-----------------------------------getAllDescendantCategoryIds------------------------------------------------
  const getAllDescendantCategoryIds = (categoryId) => {
    if (!getSubCategories) return [categoryId];
    
    const directSubs = getSubCategories(categoryId);
    let ids = [categoryId];
    directSubs.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub._id || sub.id));
    });
    return ids;
  };

  //-----------------------------------getCategoryProductCount------------------------------------------------
  const getCategoryProductCount = (categoryId) => {
    const allIds = getAllDescendantCategoryIds(categoryId);
    return allProducts.filter(product => {
      const productCategoryId = product.category?._id || product.categoryId;
      return allIds.includes(productCategoryId);
    }).length;
  };

  //-----------------------------------getColorCount------------------------------------------------  
  const getColorCount = (color) => {
    let baseProducts = [...allProducts];
    
    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.salePrice || product.originalPrice || product.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter (شامل كل الفروع المتداخلة)
    if (filters.categories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const productCategoryId = product.category?._id || product.categoryId;
        return filters.categories.some(catId => {
          return getAllDescendantCategoryIds(catId).includes(productCategoryId);
        });
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => {
        return product.salePrice && product.salePrice < (product.originalPrice || product.price);
      });
    }
    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => (product.stock || 0) > 0);
    }
    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }
    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isFeatured === true || product.isBestSeller === true);
    }

    return baseProducts.filter(product => {
      // التحقق من الألوان الفردية والمخلوطة (كلها سترينغ)
      const productColors = getSimpleColorsFromColorsField(product);
      return productColors.includes(color);
    }).length;
  };

  // Helper function to get product colors
  const getProductColors = (product) => {
    // استخدم دالة getProcessedColors من productUtils للحصول على الألوان المعالجة
    return getSimpleColorsFromColorsField(product);
  };

  //-----------------------------------getCategoryCount------------------------------------------------  
  const getCategoryCount = (categoryId) => {
    let baseProducts = [...allProducts];
    
    // Apply price filter
    baseProducts = baseProducts.filter(product => {
      const price = product.salePrice || product.originalPrice || product.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply color filter
    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const productColors = getProductColors(product);
        return productColors.some(color => filters.colors.includes(color));
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => {
        return product.salePrice && product.salePrice < (product.originalPrice || product.price);
      });
    }
    if (filters.status.includes('in_stock')) {
      baseProducts = baseProducts.filter(product => (product.stock || 0) > 0);
    }
    if (filters.status.includes('new')) {
      baseProducts = baseProducts.filter(product => product.isNew === true);
    }
    if (filters.status.includes('featured')) {
      baseProducts = baseProducts.filter(product => product.isFeatured === true || product.isBestSeller === true);
    }

    return baseProducts.filter(product => {
      const productCategoryId = product.category?._id || product.categoryId;
      return getAllDescendantCategoryIds(categoryId).includes(productCategoryId);
    }).length;
  };

  //-----------------------------------updateFilterCounts------------------------------------------------
  const updateFilterCounts = (filteredProducts) => {
    const counts = {};
    
    // Count categories
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const categoryId = category._id || category.id;
        counts[`category_${categoryId}`] = getCategoryCount(categoryId);
      });
    }
    
    // Count colors
    colors.forEach(color => {
      counts[`color_${color}`] = getColorCount(color);
    });
    
    // Count status options بناءً على المنتجات المعروضة فقط
    statusOptions.forEach(status => {
      let count = 0;
      switch (status) {
        case 'in_stock':
          count = filteredProducts.filter(p => (p.stock || 0) > 0).length;
          break;
        case 'on_sale':
          count = filteredProducts.filter(p => {
            return p.salePrice && p.salePrice < (p.originalPrice || p.price);
          }).length;
          break;
        case 'new':
          count = filteredProducts.filter(p => p.isNew).length;
          break;
        case 'featured':
          count = filteredProducts.filter(p => p.isFeatured || p.isBestSeller).length;
          break;
        default:
          count = 0;
      }
      counts[`status_${status}`] = count;
    });
    setFilterCounts(counts);
  };

  //-----------------------------------getColorKey------------------------------------------------
  function getColorKey(hex) {
    if (!hex) return '';
    // تحقق إذا كان اللون مختلطاً (مثل "color1+color2")
    if (hex.includes('+')) {
      return 'mixed';
    }
    // تحقق إذا كان اللون مختلطاً (JSON string)
    if (hex.startsWith('[')) {
      return 'mixed';
    }
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  //-----------------------------------getColorLabel------------------------------------------------
  function getColorLabelLocal(color, t) {
    // تحقق إذا كان اللون مختلطاً (مثل "color1+color2")
    if (color.includes('+')) {
      return t('filters.color_names.mixed');
    }
    
    // تحقق إذا كان اللون مختلطاً (JSON string)
    if (color.startsWith('[')) {
      return t('filters.color_names.mixed');
    }
    
    const colorKey = getColorKey(color);
    const translation = t(`filters.color_names.${colorKey}`);
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== color) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return color;
    }
    return translation;
  }
  
  //-----------------------------------getColorStyle------------------------------------------------
  function getColorStyle(color) {
    // التحقق من الألوان المدمجة (مثل "color1+color2")
    if (color.includes('+')) {
      const colors = color.split('+');
      if (colors.length > 1) {
        return { background: `linear-gradient(135deg, ${colors.join(', ')})` };
      }
    }
    
    // التحقق من الألوان المدمجة (JSON string)
    if (color.startsWith('[')) {
      try {
        const colors = JSON.parse(color);
        if (colors.length > 1) {
          return { background: `linear-gradient(135deg, ${colors.join(', ')})` };
        }
      } catch (e) {
        // Fallback for invalid JSON
        return { backgroundColor: '#ccc' };
      }
    }
    
    return { backgroundColor: color };
  }

  //-----------------------------------renderCategoryTree------------------------------------------------
  const renderCategoryTree = (parentId = null, level = 0) => {
    if (!getMainCategories || !getSubCategories) return null;
    
    const cats = parentId === null ? getMainCategories() : getSubCategories(parentId);
    if (!cats || !cats.length) return null;
    
    return (
      <div className={`category-tree level-${level}`}>
        {cats.map(category => {
          const categoryId = category._id || category.id;
          const count = getCategoryProductCount(categoryId);
          const hasChildren = getSubCategories(categoryId).length > 0;
          const isExpanded = expandedCategories[categoryId];
          const categoryName = category[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || category.name || 'Unknown Category';
          
          return count > 0 ? (
            <div key={categoryId} className="category-filter-item" style={{ marginLeft: level * 16 }}>
              <div className="category-main-filter">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(categoryId)}
                    onChange={e => onFilterChange('categories', categoryId, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {categoryName} ({count})
                </label>
                {hasChildren && (
                  <button
                    className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCategoryExpansion(categoryId)}
                    type="button"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </div>
              {/* الفروع - شجري */}
              {hasChildren && isExpanded && (
                <div className="subcategory-filters">
                  {renderCategoryTree(categoryId, level + 1)}
                </div>
              )}
            </div>
          ) : null;
        })}
      </div>
    );
  };

  // Update filter counts when filters change
  useEffect(() => {
    updateFilterCounts(filteredProducts); // Pass the actual filtered products
  }, [filters, filteredProducts, allProducts, categories]);

  return (
    <aside className={`shop-sidebar`}>
      <div className="shop-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>{currentLang === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
        {(filters.categories.length > 0  || filters.features.length > 0 || filters.colors.length > 0 || filters.status.length > 0 || filters.priceRange.min > 0 || filters.priceRange.max < initialMaxPrice || searchQuery) && (
          <button className="clear-filters-btn" onClick={clearFilters} style={{ marginRight: currentLang === 'ar' ? 0 : 8, marginLeft: currentLang === 'ar' ? 8 : 0, background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 13, color: '#ef4444', cursor: 'pointer' }}>
            {currentLang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
          </button>
        )}
      </div>
      <div className="sidebar-search-box" style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="text"
          className="sidebar-search-input"
          placeholder={currentLang === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'}
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 32px 8px 8px', borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 0, fontFamily: 'Tajawal, sans-serif' }}
        />
        <button
          className="sidebar-search-clear"
          onClick={() => searchQuery ? handleSearch('') : null}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: searchQuery ? 'pointer' : 'default', fontSize: 18, color: '#aaa', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={searchQuery ? currentLang === 'ar' ? 'مسح البحث' : 'Clear Search' : currentLang === 'ar' ? 'بحث' : 'Search'}
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
      {(filters.categories.length > 0 || filters.features.length > 0 || filters.colors.length > 0 || filters.status.length > 0) && (
        <div className="active-filters">
          {filters.categories.map(categoryId => {
            const category = categories.find(cat => (cat._id || cat.id) === categoryId);
            const categoryName = category ? (category[`name${currentLang === 'ar' ? 'Ar' : 'En'}`] || category.name) : categoryId;
            return (
              <span 
                key={categoryId} 
                className="active-filter"
                onClick={() => removeFilter('categories', categoryId)}
                title={`Remove ${categoryName} filter`}
              >
                <span className="filter-close">✕</span> {categoryName}
              </span>
            );
          })}

          {filters.colors.map(color => (
            <span 
              key={color} 
              className="active-filter"
              onClick={() => removeFilter('colors', color)}
              title={`Remove ${color} filter`}
            >
              <span className="filter-close">✕</span> {getColorLabelLocal(color, t)}
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
          <h4>{currentLang === 'ar' ? 'السعر' : 'Price'}</h4>
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
                onChange={(e) => onFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder={t('shop.max_price')}
                value={filters.priceRange.max}
                onChange={(e) => onFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
              />
            </div>
            <div className="price-range-slider">
              <input
                type="range"
                min="0"
                max={initialMaxPrice}
                value={filters.priceRange.min}
                onChange={(e) => onFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                className="range-min"
              />
              <input
                type="range"
                min="0"
                max={initialMaxPrice}
                value={filters.priceRange.max}
                onChange={(e) => onFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                className="range-max"
              />
            </div>
            <div className="price-display" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
             {currentLang === 'ar' ? 'السعر' : 'Price'}: ₪{filters.priceRange.min} — ₪{filters.priceRange.max}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-header" onClick={() => toggleSectionCollapse('categories')}>
            <h4>{currentLang === 'ar' ? 'الفئات' : 'Categories'}</h4>
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
      )}

      {/* Color Filter */}
      {colors && colors.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-header" onClick={() => toggleSectionCollapse('colors')}>
            <h4>{currentLang === 'ar' ? 'اللون' : 'Color'}</h4>
            <button className={`section-collapse-btn ${collapsedSections.colors ? 'collapsed' : 'expanded'}`}>
              {collapsedSections.colors ? '+' : '−'}
            </button>
          </div>
          {!collapsedSections.colors && (
            <div className="color-filters">
              {colors.map(color => {
                const colorCount = filterCounts[`color_${color}`] || 0;
                return colorCount > 0 ? (
                  <label key={color} className="color-filter">
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color)}
                      onChange={(e) => onFilterChange('colors', color, e.target.checked)}
                    />
                    <span 
                      className={`color-swatch color-${getColorKey(color)}`} 
                      style={getColorStyle(color)}
                    ></span>
                    {getColorLabelLocal(color, t)} ({colorCount})
                  </label>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}

      {/* Status Filter */}
      {statusOptions.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-header" onClick={() => toggleSectionCollapse('status')}>
            <h4>{currentLang === 'ar' ? 'الحالة' : 'Status'}</h4>
            <button className={`section-collapse-btn ${collapsedSections.status ? 'collapsed' : 'expanded'}`}>
              {collapsedSections.status ? '+' : '−'}
            </button>
          </div>
          {!collapsedSections.status && (
            <div className="status-filters">
              {statusOptions.map(status => {
                const statusCount = filterCounts[`status_${status}`] || 0;
                return statusCount > 0 ? (
                  <label key={status} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => onFilterChange('status', status, e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    {t(`filters.status_names.${status}`)} ({statusCount})
                  </label>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default SidebarFilters; 