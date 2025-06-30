import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { allProducts, categories, features, getAllColors } from '../../data/index';
import './MobileFilters.css';
import namer from 'color-namer';

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
  categories: categoriesProp = categories,
  features: featuresProp = features,
  colors: colorsProp = getAllColors(),
  statusOptions = ['in_stock', 'on_sale', 'new', 'featured'],
  t: tProp,
  currentLang
}) => {
  const { t: tHook, i18n } = useTranslation();
  const t = tProp || tHook;
  const [expandedSections, setExpandedSections] = useState(['categories', 'status']);
  const colors = colorsProp;
  // Calculate filter data with smart availability checking
  const filterData = useMemo(() => {
    const counts = {
      categories: {},
      features: {},
      colors: {},
      status: {}
    };

    const uniqueValues = {
      colors: new Set(),
      status: new Set(['in_stock', 'on_sale', 'new', 'featured'])
    };

    // Helper function to get all descendant category IDs (same as getAllDescendantCategoryIds below)
    const getDescendantIds = (categoryId) => {
      const result = [categoryId];
      const getChildren = (parentId) => {
        const children = categoriesProp.filter(cat => cat.parentId === parentId);
        children.forEach(child => {
          result.push(child.id);
          getChildren(child.id);
        });
      };
      getChildren(categoryId);
      return result;
    };

    // Helper function to get category product count (including descendants)
    const getCategoryProductCount = (categoryId, baseProducts) => {
      const allIds = getDescendantIds(categoryId);
      return baseProducts.filter(product => allIds.includes(product.categoryId)).length;
    };

    // Function to get base filtered products (excluding the section we're calculating)
    const getBaseFilteredProducts = (excludeSection) => {
      let baseProducts = [...allProducts];

      // Apply price filter
      baseProducts = baseProducts.filter(product => {
        const price =  product.originalPrice;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });

      // Apply category filter (unless we're calculating categories)
      if (excludeSection !== 'categories' && filters.categories?.length > 0) {
        let allCategoryIds = [];
        filters.categories.forEach(catId => {
          allCategoryIds = allCategoryIds.concat(getDescendantIds(catId));
        });
        allCategoryIds = Array.from(new Set(allCategoryIds));
        baseProducts = baseProducts.filter(product => allCategoryIds.includes(product.categoryId));
      }

      // Apply features filter (unless we're calculating features)
      if (excludeSection !== 'features' && filters.features?.length > 0) {
        baseProducts = baseProducts.filter(product => {
          return filters.features.includes(product.featureId);
        });
      }

      // Apply colors filter (unless we're calculating colors)
      if (excludeSection !== 'colors' && filters.colors?.length > 0) {
        baseProducts = baseProducts.filter(product => {
          if (product.colors && Array.isArray(product.colors)) {
            return filters.colors.some(color => product.colors.includes(color));
          }
          return false;
        });
      }

      // Apply status filter (unless we're calculating status)
      if (excludeSection !== 'status' && filters.status?.length > 0) {
        baseProducts = baseProducts.filter(product => {
          return filters.status.some(status => {
            switch (status) {
              case 'on_sale':
                const now = new Date();
                const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
                const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
                return hasDiscount && validTime;
              case 'in_stock':
                return product.stock && product.stock > 0;
              case 'new':
                return product.isNew === true;
              case 'featured':
                return product.isBestSeller === true;
              default:
                return false;
            }
          });
        });
      }

      return baseProducts;
    };

    // Calculate counts for each section
    const sections = ['categories', 'features', 'colors', 'status'];
    
    sections.forEach(section => {
      const baseProducts = getBaseFilteredProducts(section);
      
      if (section === 'categories') {
        categoriesProp.forEach(category => {
          const count = getCategoryProductCount(category.id, baseProducts);
          counts.categories[category.id] = count;
        });
      }
      
      else if (section === 'features') {
        featuresProp.forEach(feature => {
          const count = baseProducts.filter(product => product.featureId === feature.id).length;
          counts.features[feature.id] = count;
        });
      }
      
      else if (section === 'colors') {
        baseProducts.forEach(product => {
          if (product.colors && Array.isArray(product.colors)) {
            product.colors.forEach(color => {
              uniqueValues.colors.add(color);
            });
          }
        });
        
        Array.from(uniqueValues.colors).forEach(color => {
          const count = baseProducts.filter(product => {
            return product.colors && Array.isArray(product.colors) && product.colors.includes(color);
          }).length;
          counts.colors[color] = count;
        });
      }
      
      else if (section === 'status') {
        const statusChecks = {
          'in_stock': (product) => product.stock && product.stock > 0,
          'on_sale': (product) => {
            const now = new Date();
            const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
            const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
            return hasDiscount && validTime;
          },
          'new': (product) => product.isNew === true,
          'featured': (product) => product.isBestSeller === true
        };
        
        Object.keys(statusChecks).forEach(status => {
          const count = baseProducts.filter(statusChecks[status]).length;
          counts.status[status] = count;
        });
      }
    });

   
    return { counts, uniqueValues };
  }, [filters, categoriesProp, featuresProp]);

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
    console.log('handleFilterToggle called:', sectionId, itemId);
    if (!onFiltersChange) {
      console.error('onFiltersChange is not provided!');
      return;
    }

    const newFilters = { ...filters };
    const currentArray = newFilters[sectionId] || [];
    
    if (currentArray.includes(itemId)) {
      newFilters[sectionId] = currentArray.filter(id => id !== itemId);
    } else {
      newFilters[sectionId] = [...currentArray, itemId];
    }
    
    console.log('Filter toggled:', sectionId, itemId, 'New filters:', newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    if (!onFiltersChange) return;
    
    console.log('Clearing all filters');
    onFiltersChange({
      categories: [],
      features: [],
      colors: [],
      status: [],
      priceRange: { min: 0, max: 1000 }
    });
  }, [onFiltersChange]);

  function getColorKey(hex) {
    if (!hex) return '';
    if (hex === 'mixed') return 'mixed';
    try {
      return namer(hex).ntc[0].name.toLowerCase();
    } catch {
      return hex;
    }
  }

  // Filter sections configuration
  const filterSections = useMemo(() => [
    {
      id: 'categories',
      title: t('filters.categories'),
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      items: [],
      isHierarchical: true,
      renderHierarchical: () => {
        const renderCategoryLevel = (parentId = null, level = 0) => {
          const cats = parentId === null ? getMainCategories() : getSubCategories(parentId);
          if (!cats.length) return null;
          
          return cats.map(category => {
            const count = filterData.counts.categories[category.id] || 0;
            const hasChildren = getSubCategories(category.id).length > 0;
            const isSelected = filters.categories?.includes(category.id) || false;
            
            return (
              <div key={category.id} className="mobile-category-group" style={{ marginLeft: level * 16 }}>
                <button
                  className={`mobile-filter-item mobile-category-item ${isSelected ? 'selected' : ''} ${count === 0 ? 'disabled' : ''}`}
                  onClick={() => handleCategoryToggle(category.id)}
                  disabled={count === 0 && !isSelected}
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  <span className="mobile-item-name">{category.name[i18n.language]}</span>
                  {isSelected && <span className="mobile-selected-indicator">✓</span>}
                </button>
                {hasChildren && (
                  <div className="mobile-subcategories" style={{ marginLeft: '12px', marginBottom: '8px' }}>
                    {renderCategoryLevel(category.id, level + 1)}
                  </div>
                )}
              </div>
            );
          });
        };
        
        return renderCategoryLevel();
      }
    },
    {
      id: 'features',
      title: t('filters.features'),
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      items: featuresProp.map(feature => ({
        id: feature.id,
        name: feature.name[i18n.language],
        isSelected: filters.features?.includes(feature.id) || false
      }))
    },
    {
      id: 'colors',
      title: t('filters.colors'),
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3V1" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3h7a2 2 0 012 2v7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 12h9" />
          <circle cx="16" cy="8" r="2" fill="#ff4444" stroke="none" />
          <circle cx="19" cy="11" r="2" fill="#44ff44" stroke="none" />
          <circle cx="16" cy="14" r="2" fill="#4444ff" stroke="none" />
        </svg>
      ),
        items: Array.from(filterData.uniqueValues.colors).map(color => ({
        id: color,
        name: t(`filters.color_names.${getColorKey(color)}`),
        isSelected: filters.colors?.includes(color) || false,
        color: color.toLowerCase()
      }))
    },
    {
      id: 'status',
      title: t('filters.status'),
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: Array.from(filterData.uniqueValues.status).map(status => ({
        id: status,
        name: t(`filters.status_names.${status}`),
        isSelected: filters.status?.includes(status) || false
      }))
    }
  ], [filterData, filters, i18n.language, t, categoriesProp, featuresProp]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Category hierarchy functions
  const getMainCategories = () => {
    return categoriesProp.filter(cat => !cat.parentId);
  };

  const getSubCategories = (parentId) => {
    return categoriesProp.filter(cat => cat.parentId === parentId);
  };

  const getAllDescendantCategoryIds = (categoryId) => {
    const descendants = [];
    const getChildren = (parentId) => {
      const children = getSubCategories(parentId);
      children.forEach(child => {
        descendants.push(child.id);
        getChildren(child.id);
      });
    };
    getChildren(categoryId);
    return descendants;
  };

  // Enhanced filter toggle for categories with hierarchy
  const handleCategoryToggle = useCallback((categoryId) => {
    if (!onFiltersChange) return;

    const newFilters = { ...filters };
    const currentArray = newFilters.categories || [];
    
    if (currentArray.includes(categoryId)) {
      // If unchecking, remove this category and all its descendants
      const descendantIds = getAllDescendantCategoryIds(categoryId);
      newFilters.categories = currentArray.filter(id => 
        id !== categoryId && !descendantIds.includes(id)
      );
    } else {
      // If checking a main category, add it
      // If checking a subcategory, add it and check if all siblings are selected to auto-select parent
      newFilters.categories = [...currentArray, categoryId];
      
      const category = categoriesProp.find(cat => cat.id === categoryId);
      if (category && category.parentId) {
        // This is a subcategory, check if all siblings are now selected
        const siblings = getSubCategories(category.parentId);
        const allSiblingsSelected = siblings.every(sibling => 
          newFilters.categories.includes(sibling.id)
        );
        
        if (allSiblingsSelected && !newFilters.categories.includes(category.parentId)) {
          newFilters.categories.push(category.parentId);
        }
      }
    }
    
    console.log('Category toggled:', categoryId, 'New filters:', newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange, categoriesProp]);

  // Handle expand/collapse all sections
  const handleExpandCollapseAll = () => {
    if (expandedSections.length === filterSections.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(filterSections.map(section => section.id));
    }
  };

  // Calculate filtered products count based on current filters
  const filteredProductsCount = useMemo(() => {
    let filtered = [...allProducts];

    // Apply price filter
    filtered = filtered.filter(product => {
      const price =  product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(product => {
        const category = categoriesProp.find(cat => cat.id === product.categoryId);
        return category && filters.categories.includes(category.id);
      });
    }

    // Apply features filter
    if (filters.features?.length > 0) {
      filtered = filtered.filter(product => {
        return filters.features.includes(product.featureId);
      });
    }

    // Apply colors filter
    if (filters.colors?.length > 0) {
      filtered = filtered.filter(product => {
        if (product.colors && Array.isArray(product.colors)) {
          return filters.colors.some(color => product.colors.includes(color));
        }
        return false;
      });
    }

    // Apply status filter
    if (filters.status?.length > 0) {
      filtered = filtered.filter(product => {
        return filters.status.some(status => {
          switch (status) {
            case 'on_sale':
              const now = new Date();
              const hasDiscount = (product.discountPrice || product.discountPercentage > 0);
              const validTime = !product.discountEndTime || new Date(product.discountEndTime) > now;
              return hasDiscount && validTime;
            case 'in_stock':
              return product.stock && product.stock > 0;
            case 'new':
              return product.isNew === true;
            case 'featured':
              return product.isBestSeller === true;
            default:
              return false;
          }
        });
      });
    }

    return filtered.length;
  }, [filters]);

  return (
    <div className={`mobile-filters ${isOpen ? 'open' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mobile-filters-overlay" onClick={onClose} />
      
      <div className="mobile-filters-content">
        {/* Header */}
        <div className="mobile-filters-header">
          <div className="header-content">
            <h3>{t('filters.title')}</h3>
            {activeFiltersCount > 0 && (
              <span className="active-filters-badge">{activeFiltersCount}</span>
            )}
          </div>
          <button className="close-button" onClick={onClose} aria-label={t('filters.close')}>
            ✕
          </button>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-summary">
            <span className="summary-text">
              {t('filters.activeFilters', { count: activeFiltersCount })}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="clear-all-btn" 
                onClick={handleExpandCollapseAll}
                style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
              >
                {expandedSections.length === filterSections.length ? 
                  (i18n.language === 'ar' ? 'إغلاق الكل' : 'Collapse All') : 
                  (i18n.language === 'ar' ? 'فتح الكل' : 'Expand All')
                }
              </button>
              <button className="clear-all-btn" onClick={handleClearAll}>
                {t('filters.clearAll')}
              </button>
            </div>
          </div>
        )}

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
                {/* Active filter indicator */}
                {(() => {
                  if (section.id === 'categories' && filters.categories && filters.categories.length > 0) {
                    return <span className="mobile-section-indicator" title={t('filters.active')}>●</span>;
                  }
                  if (section.id === 'features' && filters.features && filters.features.length > 0) {
                    return <span className="mobile-section-indicator" title={t('filters.active')}>●</span>;
                  }
                  if (section.id === 'colors' && filters.colors && filters.colors.length > 0) {
                    return <span className="mobile-section-indicator" title={t('filters.active')}>●</span>;
                  }
                  if (section.id === 'status' && filters.status && filters.status.length > 0) {
                    return <span className="mobile-section-indicator" title={t('filters.active')}>●</span>;
                  }
                  return null;
                })()}
                <span className="mobile-chevron">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedSections.includes(section.id) ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </span>
              </button>

              {expandedSections.includes(section.id) && (
                <div className="mobile-section-content">
                  {section.isHierarchical ? (
                    <div className="mobile-hierarchical-content">
                      {section.renderHierarchical()}
                    </div>
                  ) : (
                    <div className="mobile-filter-grid">
                      {section.items.map(item => (
                        <button
                          key={item.id}
                          className={`mobile-filter-item ${item.isSelected ? 'selected' : ''}`}
                          onClick={() => handleFilterToggle(section.id, item.id)}
                          aria-pressed={item.isSelected}
                        >
                          {section.id === 'colors' && (
                            <span
                              className="mobile-color-dot"
                              style={
                                item.id === "mixed"
                                  ? { background: "linear-gradient(90deg, #eab308 0%, #ef4444 50%, #3b82f6 100%)" }
                                  : item.id && item.id.startsWith('#')
                                    ? { background: item.id, border: item.id === "#fff" ? "2px solid #e2e8f0" : undefined }
                                    : { background: '#e5e7eb', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }
                              }
                            >
                              {(item.id && !item.id.startsWith('#') && item.id !== 'mixed') && '?'}
                            </span>
                          )}
                          <span className="mobile-item-name">{item.name}</span>
                          {item.isSelected && <span className="mobile-selected-indicator">✓</span>}
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
          {/* <div className="footer-stats">
            {activeFiltersCount > 0 ? (
              <span>
                {t('filters.totalProducts', { count: filteredProductsCount })} 
                {filteredProductsCount !== allProducts.length && (
                  <span style={{ opacity: 0.7, fontSize: '0.65rem', marginRight: '0.25rem' }}>
                    {i18n.language === 'ar' ? `من أصل ${allProducts.length}` : `of ${allProducts.length}`}
                  </span>
                )}
              </span>
            ) : (
              <span>{t('filters.totalProducts', { count: allProducts.length })}</span>
            )}
          </div> */}
          <div className="footer-actions">
            {activeFiltersCount > 0 && (
              <button className="reset-button" onClick={handleClearAll}>
                {t('filters.reset')}
              </button>
            )}
            <button className="apply-button" onClick={onClose}>
              {t('filters.viewResults')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters; 