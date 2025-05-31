import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { allProducts, categories, features } from '../../data/index';
import './MobileFilters.css';

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
  onFiltersChange
}) => {
  const { t, i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState(['categories', 'status']);

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

    // Function to get base filtered products (excluding the section we're calculating)
    const getBaseFilteredProducts = (excludeSection) => {
      let baseProducts = [...allProducts];

      // Apply price filter
      baseProducts = baseProducts.filter(product => {
        const price = product.discountPrice || product.originalPrice;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });

      // Apply category filter (unless we're calculating categories)
      if (excludeSection !== 'categories' && filters.categories?.length > 0) {
        baseProducts = baseProducts.filter(product => {
          const category = categories.find(cat => cat.id === product.categoryId);
          return category && filters.categories.includes(category.id);
        });
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
                return product.discountPrice || product.discountPercentage;
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
        categories.forEach(category => {
          const count = baseProducts.filter(product => product.categoryId === category.id).length;
          counts.categories[category.id] = count;
        });
      }
      
      else if (section === 'features') {
        features.forEach(feature => {
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
          'on_sale': (product) => product.discountPrice || product.discountPercentage,
          'new': (product) => product.isNew === true,
          'featured': (product) => product.isBestSeller === true
        };
        
        Object.keys(statusChecks).forEach(status => {
          const count = baseProducts.filter(statusChecks[status]).length;
          counts.status[status] = count;
        });
      }
    });

    console.log('Smart filter counts calculated:', counts);
    return { counts, uniqueValues };
  }, [filters, categories, features]);

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
      items: categories.map(category => ({
        id: category.id,
        name: category.name[i18n.language],
        count: filterData.counts.categories[category.id] || 0,
        isSelected: filters.categories?.includes(category.id) || false
      }))
    },
    {
      id: 'features',
      title: t('filters.features'),
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      items: features.map(feature => ({
        id: feature.id,
        name: feature.name[i18n.language],
        count: filterData.counts.features[feature.id] || 0,
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
        name: t(`filters.color_names.${color.toLowerCase()}`),
        count: filterData.counts.colors[color] || 0,
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
        count: filterData.counts.status[status] || 0,
        isSelected: filters.status?.includes(status) || false
      }))
    }
  ], [filterData, filters, i18n.language, t]);

  // Handle expand/collapse all sections (بعد تعريف filterSections)
  const handleExpandCollapseAll = useCallback(() => {
    if (expandedSections.length === filterSections.length) {
      // إذا كانت جميع الأقسام مفتوحة، أغلقها جميعاً
      setExpandedSections([]);
    } else {
      // إذا لم تكن جميع الأقسام مفتوحة، افتحها جميعاً
      setExpandedSections(filterSections.map(section => section.id));
    }
  }, [expandedSections.length, filterSections]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        // إذا كان القسم مفتوحاً، أغلقه
        return prev.filter(id => id !== sectionId);
      } else {
        // إذا كان القسم مغلقاً، افتحه (أضفه للقائمة)
        return [...prev, sectionId];
      }
    });
  }, []);

  // Calculate filtered products count based on current filters
  const filteredProductsCount = useMemo(() => {
    let filtered = [...allProducts];

    // Apply price filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply category filter
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
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
              return product.discountPrice || product.discountPercentage;
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
                <span className="mobile-section-count">
                  ({section.items.filter(item => item.isSelected).length}/{section.items.filter(item => item.count > 0).length})
                  {section.items.filter(item => item.count > 0).length !== section.items.length && (
                    <span className="unavailable-indicator" title={i18n.language === 'ar' ? 'بعض الخيارات غير متاحة' : 'Some options unavailable'}>
                      <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '0.25rem' }}>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                      </svg>
                    </span>
                  )}
                </span>
                <span className="mobile-chevron">
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedSections.includes(section.id) ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </span>
              </button>

              {expandedSections.includes(section.id) && (
                <div className="mobile-section-content">
                  <div className="mobile-filter-grid">
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        className={`mobile-filter-item ${item.isSelected ? 'selected' : ''} ${item.count === 0 ? 'disabled' : ''}`}
                        onClick={() => item.count > 0 && handleFilterToggle(section.id, item.id)}
                        disabled={item.count === 0 && !item.isSelected}
                        aria-pressed={item.isSelected}
                        title={item.count === 0 && !item.isSelected ? 
                          (i18n.language === 'ar' ? 'لا توجد منتجات متوفرة' : 'No products available') : 
                          undefined
                        }
                      >
                        {section.id === 'colors' && (
                          <span className={`mobile-color-dot color-${item.color}`} />
                        )}
                        <span className="mobile-item-name">{item.name}</span>
                        <span className={`mobile-item-count ${item.count === 0 ? 'zero-count' : ''}`}>
                          ({item.count})
                        </span>
                        {item.isSelected && <span className="mobile-selected-indicator">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mobile-filters-footer">
          <div className="footer-stats">
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
          </div>
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