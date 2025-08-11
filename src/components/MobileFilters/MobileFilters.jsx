import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MobileFilters.css';
import namer from 'color-namer';
import { getSimpleColorsFromColorsField } from '../../utils/productUtils';

const MobileFilters = ({ 
  isOpen, 
  onClose, 
  filters = {
    categories: [],
    features: [],
    colors: [],
    status: [],
    priceRange: { min: 0, max: 1000 }
  },
  onFiltersChange,
  categories: categoriesProp = [],
  features: featuresProp = [],
  colors: colorsProp = [],
  statusOptions = ['in_stock', 'on_sale', 'new', 'featured'],
  allProducts = [],
  t: tProp,
  currentLang
}) => {
  const { t: tHook, i18n } = useTranslation();
  const t = tProp || tHook;
  const [expandedSections, setExpandedSections] = useState(['categories', 'price']);
  
  // Calculate filter data
  const filterData = useMemo(() => {
    const counts = {
      categories: {},
      features: {},
      colors: {},
      status: {}
    };

    // Helper function to get all descendant category IDs
    const getDescendantIds = (categoryId) => {
      const result = [categoryId];
      const getChildren = (parentId) => {
        const children = categoriesProp.filter(cat => (cat.parent?._id || cat.parentId) === parentId);
        children.forEach(child => {
          const childId = child._id || child.id;
          result.push(childId);
          getChildren(childId);
        });
      };
      getChildren(categoryId);
      return result;
    };

    // Calculate counts for each section
    if (categoriesProp.length > 0) {
        categoriesProp.forEach(category => {
          const categoryId = category._id || category.id;
        const count = allProducts.filter(product => {
          const productCategoryId = product.category?._id || product.categoryId;
          return getDescendantIds(categoryId).includes(productCategoryId);
        }).length;
          counts.categories[categoryId] = count;
        });
      }
      
    if (featuresProp && featuresProp.length > 0) {
        featuresProp.forEach(feature => {
        const count = allProducts.filter(product => product.featureId === feature._id).length;
        counts.features[feature._id] = count;
      });
    }

    if (colorsProp && colorsProp.length > 0) {
      colorsProp.forEach(color => {
        const count = allProducts.filter(product => {
          const productColors = getSimpleColorsFromColorsField(product);
            return productColors.includes(color);
          }).length;
          counts.colors[color] = count;
        });
      }
      
    return counts;
  }, [categoriesProp, featuresProp, colorsProp, allProducts]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories?.length > 0) count += filters.categories.length;
    if (filters.features?.length > 0) count += filters.features.length;
    if (filters.colors?.length > 0) count += filters.colors.length;
    if (filters.status?.length > 0) count += filters.status.length;
    return count;
  }, [filters]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((sectionId, itemId) => {
    if (!onFiltersChange) return;

    const newFilters = { ...filters };
    const currentArray = newFilters[sectionId] || [];
    
    if (currentArray.includes(itemId)) {
      newFilters[sectionId] = currentArray.filter(id => id !== itemId);
    } else {
      newFilters[sectionId] = [...currentArray, itemId];
    }
    
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    if (!onFiltersChange) return;
    
    onFiltersChange({
      categories: [],
      features: [],
      colors: [],
      status: [],
      priceRange: { min: 0, max: 1000 }
    });
  }, [onFiltersChange]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // Get color style
  function getColorStyle(color) {
    if (!color) return { backgroundColor: '#ccc' };
    
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    
    // Map color names to hex values
    const colorMap = {
      'red': '#ef4444',
      'green': '#22c55e',
      'blue': '#3b82f6',
      'yellow': '#eab308',
      'orange': '#f97316',
      'purple': '#a855f7',
      'white': '#ffffff',
      'black': '#000000',
      'brown': '#92400e',
      'pink': '#ec4899',
      'gray': '#6b7280',
      'grey': '#6b7280'
    };
    
    return { backgroundColor: colorMap[color.toLowerCase()] || '#ccc' };
  }

  // Filter sections configuration
  const filterSections = [
    {
      id: 'categories',
      title: currentLang === 'ar' ? 'الفئات' : 'Categories',
      icon: '📂',
      items: categoriesProp.map(cat => ({
        id: cat._id || cat.id,
        name: cat.name,
        count: filterData.categories[cat._id || cat.id] || 0,
        isSelected: filters.categories?.includes(cat._id || cat.id)
      }))
    },
    {
      id: 'features',
      title: currentLang === 'ar' ? 'المميزات' : 'Features',
      icon: '⭐',
      items: (featuresProp || []).map(feat => ({
        id: feat._id,
        name: feat.name,
        count: filterData.features[feat._id] || 0,
        isSelected: filters.features?.includes(feat._id)
      }))
    },
    {
      id: 'colors',
      title: currentLang === 'ar' ? 'الألوان' : 'Colors',
      icon: '🎨',
      items: (colorsProp || []).map(color => ({
        id: color,
        name: color,
        count: filterData.colors[color] || 0,
        isSelected: filters.colors?.includes(color)
      }))
    },
    {
      id: 'status',
      title: currentLang === 'ar' ? 'الحالة' : 'Status',
      icon: '🏷️',
      items: [
        { id: 'in_stock', name: currentLang === 'ar' ? 'متوفر' : 'In Stock', isSelected: filters.status?.includes('in_stock') },
        { id: 'on_sale', name: currentLang === 'ar' ? 'في العرض' : 'On Sale', isSelected: filters.status?.includes('on_sale') },
        { id: 'new', name: currentLang === 'ar' ? 'جديد' : 'New', isSelected: filters.status?.includes('new') },
        { id: 'featured', name: currentLang === 'ar' ? 'مميز' : 'Featured', isSelected: filters.status?.includes('featured') }
      ]
    }
  ];

  return (
    <div className={`mobile-filters ${isOpen ? 'open' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mobile-filters-overlay" onClick={onClose} />
      
      <div className="mobile-filters-content">
        {/* Header */}
        <div className="mobile-filters-header">
          <div className="header-content">
            <h3>{currentLang === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
            {activeFiltersCount > 0 && (
              <span className="active-filters-badge">{activeFiltersCount}</span>
            )}
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Price Range Slider */}
        <div className="mobile-filter-section">
          <div className="mobile-section-header">
            <span className="mobile-section-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </span>
            <span className="mobile-section-title">
              {currentLang === 'ar' ? 'نطاق السعر' : 'Price Range'}
            </span>
          </div>
          <div className="mobile-section-content">
            <div className="mobile-price-range">
              <div className="mobile-price-inputs">
                <div className="mobile-price-input">
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => {
                      const newFilters = { ...filters };
                      newFilters.priceRange.min = Number(e.target.value);
                      onFiltersChange(newFilters);
                    }}
                    min="0"
                    max={filters.priceRange.max}
                    placeholder="0"
                  />
                  <label>{currentLang === 'ar' ? 'الحد الأدنى' : 'Min'}</label>
                </div>
                <div className="mobile-price-input">
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => {
                      const newFilters = { ...filters };
                      newFilters.priceRange.max = Number(e.target.value);
                      onFiltersChange(newFilters);
                    }}
                    min={filters.priceRange.min}
                    placeholder="1000"
                  />
                  <label>{currentLang === 'ar' ? 'الحد الأقصى' : 'Max'}</label>
                </div>
              </div>
              <div className="mobile-price-display">
                <span>{currentLang === 'ar' ? 'السعر:' : 'Price:'} ${filters.priceRange.min}</span>
                <span>-</span>
                <span>${filters.priceRange.max}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="mobile-filters-body">
          {filterSections.map(section => (
            <div key={section.id} className="mobile-filter-section">
              <button 
                className={`mobile-section-header ${expandedSections.includes(section.id) ? 'expanded' : ''}`}
                onClick={() => toggleSection(section.id)}
                aria-expanded={expandedSections.includes(section.id)}
              >
                <span className="mobile-section-icon">{section.icon}</span>
                <span className="mobile-section-title">{section.title}</span>
                <span className="mobile-chevron">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedSections.includes(section.id) ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </span>
              </button>

              {expandedSections.includes(section.id) && (
                <div className="mobile-section-content">
                  {section.id === 'categories' ? (
                    <div className="mobile-categories-grid">
                      {section.items.map(item => (
                        <button
                          key={item.id}
                          className={`mobile-category-item ${item.isSelected ? 'selected' : ''}`}
                          onClick={() => handleFilterToggle(section.id, item.id)}
                          aria-pressed={item.isSelected}
                        >
                          <div className="mobile-category-checkbox">
                            {item.isSelected && (
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="mobile-category-name">{item.name}</span>
                          <span className="mobile-category-count">({item.count || 0})</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mobile-filter-grid">
                      {section.items.map(item => (
                        <button
                          key={item.id}
                          className={`mobile-filter-item ${item.isSelected ? 'selected' : ''}`}
                          onClick={() => handleFilterToggle(section.id, item.id)}
                          aria-pressed={item.isSelected}
                          data-section={section.id}
                        >
                          {section.id === 'colors' ? (
                            <span
                              className="mobile-color-dot"
                              style={getColorStyle(item.id)}
                              title={item.name}
                            />
                          ) : (
                            <>
                              <span className="mobile-item-name">{item.name}</span>
                              {item.isSelected && <span className="mobile-selected-indicator">✓</span>}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mobile-filters-footer">
          <button className="mobile-filter-btn mobile-clear-btn" onClick={handleClearAll}>
            {currentLang === 'ar' ? 'مسح' : 'CLEAR'}
              </button>
          <button className="mobile-filter-btn mobile-apply-btn" onClick={onClose}>
            {currentLang === 'ar' ? 'تطبيق الفلتر' : 'APPLY FILTER'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters; 