import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getColorLabel, getAllColors } from '../../data/index';
import { categories, features, getSubCategories, getMainCategories, allProducts } from '../../data/index';
import namer from 'color-namer';

const SidebarFilters = ({
  filters,
  onFilterChange,
  clearFilters,
  removeFilter,
  initialMaxPrice,
  searchQuery,
  handleSearch,
  filteredProducts = allProducts
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

  //-----------------------------------getAllColors------------------------------------------------  
 
  const colors = getAllColors();

  //-----------------------------------statusOptions------------------------------------------------  
  const statusOptions = [];
  if (allProducts.some(p => p.stock && p.stock > 0)) statusOptions.push('in_stock');
  if (allProducts.some(p => (p.discountPrice || p.discountPercentage))) statusOptions.push('on_sale');
  if (allProducts.some(p => p.isNew)) statusOptions.push('new');
  if (allProducts.some(p => p.isBestSeller)) statusOptions.push('featured');

  //-----------------------------------getAllDescendantCategoryIds------------------------------------------------
  const getAllDescendantCategoryIds = (categoryId) => {
    const directSubs = getSubCategories(categoryId);
    let ids = [categoryId];
    directSubs.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub.id));
    });
    return ids;
  };

  //-----------------------------------getCategoryProductCount------------------------------------------------
  const getCategoryProductCount = (categoryId) => {
    const allIds = getAllDescendantCategoryIds(categoryId);
    return allProducts.filter(product => allIds.includes(product.categoryId)).length;
  };

  //-----------------------------------getColorCount------------------------------------------------  
  const getColorCount = (color) => {
    let baseProducts = [...allProducts];
    baseProducts = baseProducts.filter(product => {
      const price = product.originalPrice;
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

    // Apply feature filter
    if (filters.features.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply status filter
    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => {
        const now = new Date();
        const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
        const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
        return hasDiscount && validTime;
      });
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

    return baseProducts.filter(product => {
      return product.colors && Array.isArray(product.colors) && product.colors.includes(color);
    }).length;
  };

  //-----------------------------------getFeatureCount------------------------------------------------  
  const getFeatureCount = (featureId) => {
    let baseProducts = [...allProducts];
    
    baseProducts = baseProducts.filter(product => {
      const price = product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    if (filters.categories.length > 0) {
      baseProducts = baseProducts.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.id);
      });
    }

    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => {
        const now = new Date();
        const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
        const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
        return hasDiscount && validTime;
      });
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

    return baseProducts.filter(product => {
      return product.featureId === featureId;
    }).length;
  };

  //-----------------------------------getCategoryCount------------------------------------------------  
  const getCategoryCount = (categoryName) => {
    let baseProducts = [...allProducts];
    
    baseProducts = baseProducts.filter(product => {
      const price = product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    if (filters.features.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    if (filters.colors.length > 0) {
      baseProducts = baseProducts.filter(product => {
        return product.colors && Array.isArray(product.colors) && filters.colors.some(color => product.colors.includes(color));
      });
    }

    if (filters.status.includes('on_sale')) {
      baseProducts = baseProducts.filter(product => {
        const now = new Date();
        const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
        const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
        return hasDiscount && validTime;
      });
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

    return baseProducts.filter(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return category && category.name.en === categoryName;
    }).length;
  };

  //-----------------------------------updateFilterCounts------------------------------------------------
  const updateFilterCounts = (filteredProducts) => {
    const counts = {};
    // Count categories
    categories.forEach(category => {
      counts[`category_${category.name.en}`] = getCategoryCount(category.name.en);
    });
    // Count colors
    colors.forEach(color => {
      counts[`color_${color}`] = getColorCount(color);
    });
    // Count features
    features.forEach(feature => {
      counts[`feature_${feature.id}`] = getFeatureCount(feature.id);
    });
    // Count status options بناءً على المنتجات المعروضة فقط
    statusOptions.forEach(status => {
      let count = 0;
      switch (status) {
        case 'in_stock':
          count = filteredProducts.filter(p => p.stock && p.stock > 0).length;
          break;
        case 'on_sale':
          count = filteredProducts.filter(p => {
            const now = new Date();
            const hasDiscount = (p.discountPrice || p.discountPercentage > 0);
            const validTime = !p.discountEndTime || new Date(p.discountEndTime) > now;
            return hasDiscount && validTime;
          }).length;
          break;
        case 'new':
          count = filteredProducts.filter(p => p.isNew).length;
          break;
        case 'featured':
          count = filteredProducts.filter(p => p.isBestSeller).length;
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
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  //-----------------------------------getColorLabel------------------------------------------------
  function getColorLabelLocal(hex, t) {
    const colorKey = getColorKey(hex);
    const translation = t(`filters.color_names.${colorKey}`);
    // إذا لم توجد ترجمة (أو الترجمة نفسها هي المفتاح)، أظهر الاسم الإنجليزي أو الكود
    if (!translation || translation === `filters.color_names.${colorKey}`) {
      if (colorKey && colorKey !== hex) return colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
      return hex;
    }
    return translation;
  }

  //-----------------------------------renderCategoryTree------------------------------------------------
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
                    onChange={e => onFilterChange('categories', category.id, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {category.name[currentLang]}  
                </label>
                {hasChildren && (
                  <button
                    className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCategoryExpansion(category.id)}
                    type="button"
                  >
                    {isExpanded ? '−' : '+'}
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

  // Update filter counts when filters change
  useEffect(() => {
    updateFilterCounts(filteredProducts); // Pass the actual filtered products
  }, [filters, filteredProducts]);

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
{/* -----------------------------category tree------------------------------------------------ */}
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
{/* -----------------------------color------------------------------------------------ */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSectionCollapse('colors')}>
          <h4>{currentLang === 'ar' ? 'اللون' : 'Color'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.colors ? 'collapsed' : 'expanded'}`}>
            {collapsedSections.colors ? '+' : '−'}
          </button>
        </div>
        {!collapsedSections.colors && (
          <div className="color-filters">
            {colors.map(color => (
                <label key={color} className="color-filter">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={(e) => onFilterChange('colors', color, e.target.checked)}
                  />
                  <span className={`color-swatch color-${getColorKey(color)}`} style={{ backgroundColor: color }}></span>
                  {getColorLabelLocal(color, t)}
                </label>
            ))}
          </div>
        )}
      </div>
{/* -----------------------------features------------------------------------------------ */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSectionCollapse('features')}>
          <h4>{currentLang === 'ar' ? 'الميزات' : 'Features'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.features ? 'collapsed' : 'expanded'}`}>
            {collapsedSections.features ? '+' : '−'}
          </button>
        </div>
        {!collapsedSections.features && (
          <div className="feature-filters">
            {features.map(feature => (
                <label key={feature.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature.id)}
                    onChange={(e) => onFilterChange('features', feature.id, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {feature.name[currentLang]}
                </label>
            ))}
          </div>
        )}
      </div>
{/* -----------------------------status------------------------------------------------ */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSectionCollapse('status')}>
          <h4>{currentLang === 'ar' ? 'الحالة' : 'Status'}</h4>
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
                    onChange={(e) => onFilterChange('status', status, e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {t(`filters.status_names.${status}`)}
                </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFilters; 