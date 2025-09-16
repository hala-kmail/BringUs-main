import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import namer from 'color-namer';
import { getSimpleColorsFromColorsField, hexToColorName } from '../../utils/productUtils';
import { formatPrice } from '../../utils/currencyUtils';

const SidebarFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  activeFilters = [],
  categories = [],
  features = [],
  allColors = [],
  allProductLabels = [],
  maxPrice = 1000,
  loading = false,
  isMobile = false
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  
  // State for collapsed filter sections on desktop
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    categories: false,
    colors: false,
    features: false,
    productLabels: false,
    status: false
  });

  // State for expanded categories (to show subcategories)
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Toggle section collapse
  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Status options
  const statusOptions = [
    { value: 'in_stock', label: { ar: 'متوفر', en: 'In Stock' } },
    { value: 'on_sale', label: { ar: 'على الخصم', en: 'On Sale' } },
    { value: 'new', label: { ar: 'جديد', en: 'New' } },
   
  ];

  // Helper function to get product colors
  const getProductColors = (product) => {
    
    return getSimpleColorsFromColorsField(product);
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category.id === id || category._id === id);
  };

  // Get feature by ID
  const getFeatureById = (id) => {
    return features.find(feature => feature.id === id || feature._id === id);
  };

  // Get subcategories for a category
  const getSubCategories = (categoryId) => {
    return categories.filter(cat => {
      // console.log('cat', cat.parent?._id);
      return cat.parent?._id === categoryId || cat.parent?._id === categoryId
    });
  };

  // Get all descendant category IDs
  const getAllDescendantCategoryIds = useCallback((categoryId) => {
    const subcategories = getSubCategories(categoryId);
    let ids = [categoryId];
    subcategories.forEach(sub => {
      ids = ids.concat(getAllDescendantCategoryIds(sub.id || sub._id));
    });
    return ids;
  }, [categories]);

  // Get category product count (placeholder for now)
  const getCategoryProductCount = useCallback((categoryId) => {
    return 0; // Hide counts for now
  }, []);

  // Get color count (placeholder for now)
  const getColorCount = useCallback((color) => {
    return 0; // Hide counts for now
  }, []);

  // Get category count (placeholder for now)
  const getCategoryCount = useCallback((categoryId) => {
    return 0; // Hide counts for now
  }, []);

  // Color utility functions
  function getColorKey(hex) {
    if (typeof hex === 'string' && hex.includes('+')) {
      return 'mixed';
    }
    try {
      const colorName = namer(hex);
      return colorName.ntc[0]?.name || hex;
    } catch (error) {
      return hex;
    }
  }

 
 

  // Render category tree
  const renderCategoryTree = (parentId = null, level = 0) => {
    const mainCategories = categories.filter(cat => 
      (cat.parentId === parentId || cat.parent === parentId) && 
      (!parentId && !cat.parentId && !cat.parent)
    );

    const renderCategory = (category) => {
      const categoryId = category.id || category._id;
      const subcategories = getSubCategories(categoryId);
      const isExpanded = expandedCategories[categoryId];
      const isSelected = filters.categories.includes(categoryId);
      const hasSubcategories = subcategories.length > 0;
    
      return (
        <div key={categoryId} className="category-filter-item">
          <div className="category-main-filter">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onFilterChange('category', categoryId, e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              <span className="category-name">
                {currentLang === 'ar' ? category.nameAr : category.nameEn}
              </span>
            </label>
    
            {hasSubcategories && (
              <button
                className={`category-expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategoryExpansion(categoryId)}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
            )}
          </div>
    
          {hasSubcategories && isExpanded && (
            <div className="subcategory-filters">
              {subcategories.map((sub) => renderCategory(sub))}
            </div>
          )}
        </div>
      );
    };
    
    // في مكان return الرئيسي
    return mainCategories.map((category) => renderCategory(category));
    
  };

  return (
    <div >
      {/* Header */}
      <div className="shop-sidebar-header">
        <h3>{currentLang === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
        <button 
          className="clear-filters-btn" 
          onClick={onClearFilters}
          disabled={loading}
        >
          {currentLang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter, index) => (
            <div key={`${filter.type}-${filter.value}`} className="active-filter">
              <span>{filter.label}</span>
              <button
                className="filter-close"
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Price Range Filter */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSectionCollapse('price')}
        >
          <h4>{currentLang === 'ar' ? 'السعر' : 'Price'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.price ? 'collapsed' : 'expanded'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>
        
        {!collapsedSections.price && (
          <div className="price-range">
            <div className="price-inputs">
              <input
                type="number"
                placeholder={currentLang === 'ar' ? 'من' : 'From'}
                value={filters.priceRange.min}
                onChange={(e) => onFilterChange('priceRange', {
                  ...filters.priceRange,
                  min: parseFloat(e.target.value) || 0
                })}
                disabled={loading}
              />
              <span>-</span>
              <input
                type="number"
                placeholder={currentLang === 'ar' ? 'إلى' : 'To'}
                value={filters.priceRange.max}
                onChange={(e) => onFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: parseFloat(e.target.value) || maxPrice
                })}
                disabled={loading}
              />
            </div>
            <div className="price-display">
              {formatPrice(filters.priceRange.min, currentLang)} - {formatPrice(filters.priceRange.max, currentLang)}
            </div>
          </div>
        )}
      </div>

      {/* Categories Filter */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSectionCollapse('categories')}
        >
          <h4>{currentLang === 'ar' ? 'الفئات' : 'Categories'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.categories ? 'collapsed' : 'expanded'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>
        
        {!collapsedSections.categories && (
          <div className={isMobile ? "mobile-categories-tabs" : "category-list"}>
            {isMobile ? (
              // Mobile: Show categories as tabs
              categories.filter(cat => !cat.parentId && !cat.parent).map(category => {
                const categoryId = category.id || category._id;
                const isSelected = filters.categories.includes(categoryId);
                return (
                  <button
                    key={categoryId}
                    className={`mobile-category-tab ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFilterChange('category', categoryId, !isSelected)}
                    disabled={loading}
                  >
                    <span className="mobile-category-tab-name">
                      {currentLang === 'ar' ? category.nameAr : category.nameEn}
                    </span>
                    <span className="mobile-category-tab-count">(0)</span>
                  </button>
                );
              })
            ) : (
              // Desktop: Show category tree
              renderCategoryTree()
            )}
          </div>
        )}
      </div>

      {/* Colors Filter */}
      {allColors.length > 0 && (
        // console.log('allColors', allColors),
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSectionCollapse('colors')}
          >
            <h4>{currentLang === 'ar' ? 'الألوان' : 'Colors'}</h4>
            <button className={`section-collapse-btn ${collapsedSections.colors ? 'collapsed' : 'expanded'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
          </div>
          
          {!collapsedSections.colors && (
            <div className="color-filters">
              {allColors.map(color => {
                 const isMixed = color.includes('+');
                return (
                
                <label key={color} className="color-filter">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={(e) => onFilterChange('color', color, e.target.checked)}
                    disabled={loading}
                  />
                  <span 
                    className={`color-swatch color-${getColorKey(color).toLowerCase()}`}
                    style={{
                      background: isMixed ? `linear-gradient(45deg, ${color.split('+').join(', ')})` : color,
                      border: color === "#fff" || color === "#ffffff" ? "2px solid #e2e8f0" : undefined
                    }}
                   
                  ></span>
                </label>
              )})}
            </div>
          )}
        </div>
      )}

      {/* Product Labels Filter */}
      {allProductLabels.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSectionCollapse('productLabels')}
          >
            <h4>{currentLang === 'ar' ? 'الملصقات' : 'Labels'}</h4>
            <button className={`section-collapse-btn ${collapsedSections.productLabels ? 'collapsed' : 'expanded'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
          </div>

          {!collapsedSections.productLabels && (
            <div className={isMobile ? "mobile-labels-tabs" : "feature-filters"}>
              {isMobile ? (
                // Mobile: Show labels as tabs
                allProductLabels.map(label => {
                  const isSelected = filters.productLabels.includes(label._id);
                  return (
                    <button
                      key={label._id}
                      className={`mobile-label-tab ${isSelected ? 'selected' : ''}`}
                      onClick={() => onFilterChange('productLabel', label._id, !isSelected)}
                      disabled={loading}
                    >
                      <span className="mobile-label-tab-name">
                        {currentLang === 'ar' ? label.nameAr : label.nameEn}
                      </span>
                      <span className="mobile-label-tab-count">(0)</span>
                    </button>
                  );
                })
              ) : (
                // Desktop: Show labels as checkboxes
                allProductLabels.map(label => (
                  <label key={label._id} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.productLabels.includes(label._id)}
                      onChange={(e) => onFilterChange('productLabel', label._id, e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    <span>{currentLang === 'ar' ? label.nameAr : label.nameEn}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Features Filter */}
      {features.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSectionCollapse('features')}
          >
            <h4>{currentLang === 'ar' ? 'المميزات' : 'Features'}</h4>
            <button className={`section-collapse-btn ${collapsedSections.features ? 'collapsed' : 'expanded'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
          </div>
          
          {!collapsedSections.features && (
            <div className="feature-filters">
              {features.map(feature => {
                const featureId = feature.id || feature._id;
                return (
                  <label key={featureId} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(featureId)}
                      onChange={(e) => onFilterChange('feature', featureId, e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    <span>{currentLang === 'ar' ? feature.nameAr : feature.nameEn}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Status Filter */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSectionCollapse('status')}
        >
          <h4>{currentLang === 'ar' ? 'الحالة' : 'Status'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.status ? 'collapsed' : 'expanded'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>
        
        {!collapsedSections.status && (
          <div className={isMobile ? "mobile-status-tabs" : "status-filters-shop-sidebar"}>
            {isMobile ? (
              // Mobile: Show status as tabs
              statusOptions.map(status => {
                const isSelected = filters.status.includes(status.value);
                return (
                  <button
                    key={status.value}
                    className={`mobile-status-tab ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFilterChange('status', status.value, !isSelected)}
                    disabled={loading}
                  >
                    <span className="mobile-status-tab-name">
                      {status.label[currentLang]}
                    </span>
                    <span className="mobile-status-tab-count">(0)</span>
                  </button>
                );
              })
            ) : (
              // Desktop: Show status as checkboxes
              statusOptions.map(status => (
                <label key={status.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={(e) => onFilterChange('status', status.value, e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  <span>{status.label[currentLang]}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters; 