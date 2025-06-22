import React from 'react';
import { useTranslation } from 'react-i18next';

const defaultSortOptions = [
  { value: 'default', label: { ar: 'الافتراضي', en: 'Default' } },
  { value: 'price-low-high', label: { ar: 'الاقل سعرا', en: 'Price Low to High' } },
  { value: 'price-high-low', label: { ar: 'الاعلى سعرا', en: 'Price High to Low' } },
  { value: 'name-a-z', label: { ar: 'الاسم :؟أ-ي', en: 'Name A-Z' } },
  { value: 'name-z-a', label: { ar: 'الاسم :؟ي-أ', en: 'Name Z-A' } },
  { value: 'newest', label: { ar: 'الاحدث', en: 'Newest' } },
  { value: 'oldest', label: { ar: 'الاخير', en: 'Oldest' } },
];

const ShopToolbar = ({
  filters,
  handleSortChange,
  itemsPerPage,
  handleItemsPerPageChange,
  viewMode,
  setViewMode,
  currentLang,
  filteredCount,
  totalCount,
  sortOptions
}) => {
  const { t } = useTranslation();
  const sortOpts = sortOptions || defaultSortOptions.map(opt => ({ value: opt.value, label: opt.label[currentLang] }));
  return (
    <div className="shop-toolbar desktop-only">
     
      <div className="toolbar-right">
        <div className="sort-controls">
          <label>{currentLang === 'ar' ? 'ترتيب' : 'Sorting'}:</label>
          <select 
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            {sortOpts.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="show-controls">
          <label>{currentLang === 'ar' ? 'عرض' : 'Show'}:</label>
          <select 
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
            <option value="20">20 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
            <option value="50">50 {currentLang === 'ar' ? 'عناصر' : 'Items'}</option>
          </select>
        </div>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title={currentLang === 'ar' ? 'عرض شبكة' : 'Grid View'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title={currentLang === 'ar' ? 'عرض قائمة' : 'List View'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="4" cy="18" r="2"/></svg>
          </button>
        </div>
      </div>

      <div className="toolbar-left">
        <span className="results-count">
          {currentLang === 'ar'
            ? `عرض ${filteredCount} من ${totalCount} منتج`
            : `Showing ${filteredCount} of ${totalCount} products`}
        </span>
      </div>
    </div>
  );
};

export default ShopToolbar; 