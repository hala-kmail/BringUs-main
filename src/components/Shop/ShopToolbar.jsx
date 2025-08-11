import React from 'react';
import { useTranslation } from 'react-i18next';

const defaultSortOptions = [
  { value: 'newest', label: { ar: 'الاحدث', en: 'Newest' } },
  { value: 'oldest', label: { ar: 'الاخير', en: 'Oldest' } },
  { value: 'price_desc', label: { ar: 'الاقل سعرا', en: 'Price Low to High' } },
  { value: 'name_asc', label: { ar: 'الاعلى سعرا', en: 'Price High to Low' } },
  { value: 'name_asc', label: { ar: 'الاسم :؟أ-ي', en: 'Name A-Z' } },
  { value: 'name_desc', label: { ar: 'الاسم :؟ي-أ', en: 'Name Z-A' } },
];

const ShopToolbar = ({
  totalItems,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  onSortChange,
  onItemsPerPageChange,
  onMobileSearchToggle,
  onMobileFiltersToggle,
  sortBy = 'newest',
  loading = false,
  sortOptions
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const sortOpts = sortOptions || defaultSortOptions.map(opt => ({ 
    value: opt.value, 
    label: opt.label[currentLang] 
  }));
  
  return (
    <div className="shop-toolbar desktop-only">
      <div className="toolbar-left">
        <span className="results-count" style= {currentLang === 'ar' ? {marginLeft: '1rem'} : {marginRight: '1rem'}} >
          {loading ? (
            currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'
          ) : (
            currentLang === 'ar'
              ? `عرض ${totalItems} منتج`
              : `Showing ${totalItems} products`
          )}
        </span>
        
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title={currentLang === 'ar' ? 'عرض شبكة' : 'Grid View'}
            disabled={loading}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title={currentLang === 'ar' ? 'عرض قائمة' : 'List View'}
            disabled={loading}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="4" cy="6" r="2"/>
              <circle cx="4" cy="12" r="2"/>
              <circle cx="4" cy="18" r="2"/>
            </svg>
          </button>
          
          {/* Mobile Filter Button */}
          <button 
            className="mobile-filter-toggle"
            onClick={onMobileFiltersToggle}
            title={currentLang === 'ar' ? 'الفلاتر' : 'Filters'}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="sort-controls">
          <label>{currentLang === 'ar' ? 'ترتيب' : 'Sorting'}:</label>
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
            disabled={loading}
          >
            {sortOpts.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="show-controls">
          <label style={{marginRight: '0.5rem'}} >{currentLang === 'ar' ? 'عرض' : 'Show'}:</label>
          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={loading}
          >
            <option value="10">10 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
            <option value="20">20 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
            <option value="50">50 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShopToolbar; 