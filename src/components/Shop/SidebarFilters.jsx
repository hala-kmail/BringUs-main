import React from 'react';
import { useTranslation } from 'react-i18next';

const SidebarFilters = ({
  filters,
  onFilterChange,
  filterCounts,
  collapsedSections,
  toggleSectionCollapse,
  expandedCategories,
  toggleCategoryExpansion,
  categories,
  getSubCategories,
  features,
  colors,
  statusOptions,
  clearFilters,
  removeFilter,
  getColorLabel,
  getCategoryProductCount,
  renderCategoryTree,

  initialMaxPrice,
  searchQuery,
  handleSearch
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  return (
    <aside className={`shop-sidebar`}>
      <div className="shop-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>{currentLang === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
        {(filters.categories.length > 0 || filters.subcategories.length > 0 || filters.features.length > 0 || filters.colors.length > 0 || filters.status.length > 0 || filters.priceRange.min > 0 || filters.priceRange.max < initialMaxPrice || searchQuery) && (
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
            let foundSub = null;
            for (const cat of categories) {
              const subs = getSubCategories(cat.id);
              const match = subs.find(sub => sub.id === subcategoryId);
              if (match) { foundSub = match; break; }
            }
            return (
              <span 
                key={subcategoryId} 
                className="active-filter"
                onClick={() => removeFilter('subcategories', subcategoryId)}
                title={`Remove ${foundSub?.name?.[currentLang] || subcategoryId} filter`}
              >
                <span className="filter-close">✕</span> {foundSub?.name?.[currentLang] || subcategoryId}
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
      {/* Product Categories with Subcategories */}
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
      {/* Filter by Color */}
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
              const count = filterCounts[`color_${color}`] || 0;
              return (
                <label key={color} className="color-filter" style={{ opacity: count === 0 ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={e => onFilterChange('colors', color, e.target.checked)}
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
          <h4>{currentLang === 'ar' ? 'الميزات' : 'Features'}</h4>
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
                    onChange={(e) => onFilterChange('features', feature.id, e.target.checked)}
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
          <h4>{currentLang === 'ar' ? 'الحالة' : 'Status'}</h4>
          <button className={`section-collapse-btn ${collapsedSections.status ? 'collapsed' : 'expanded'}`}>
            {collapsedSections.status ? '+' : '−'}
          </button>
        </div>
        {!collapsedSections.status && (
          <div className="status-filters">
            {statusOptions.map(status => {
              const count = filterCounts[`status_${status}`] || 0;
              return (
                <label key={status} className="filter-checkbox" style={{ opacity: count === 0 ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={e => onFilterChange('status', status, e.target.checked)}
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
  );
};

export default SidebarFilters; 