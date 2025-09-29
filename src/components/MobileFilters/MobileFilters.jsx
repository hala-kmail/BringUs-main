import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import './MobileFilters.css';
import SidebarFilters from '../Shop/SidebarFilters';

const MobileFilters = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  activeFilters,
  categories,
  features,
  allColors,
  allProductLabels,
  maxPrice,
  loading
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  /* ----------  Header + Badge  ---------- */
  const activeCount = activeFilters.length || 0;

  /* ----------  Render ---------- */
  return (
    <div className={`mobile-filters ${isOpen ? 'open' : ''}`}>
      <div className="mobile-filters-overlay" onClick={onClose} />

      <div className="mobile-filters-content">
        {/* Header */}
        <div className="mobile-filters-header">
          <h3>{currentLang === 'ar' ? 'الفلاتر' : 'Filters'}{activeCount > 0 && (
            <span className="active-filters-badge">{activeCount}</span>
          )}</h3>
          
          <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/*  SidebarFilters rendered inside the drawer  */}
        <div className="mobile-filters-body">
          <SidebarFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            onRemoveFilter={onRemoveFilter}
            activeFilters={activeFilters}
            categories={categories}
            features={features}
            allColors={allColors}
            allProductLabels={allProductLabels}
            maxPrice={maxPrice}
            loading={loading}
            isMobile={true}
          />
        </div>

        {/*  Footer – Apply / Clear  */}
        <div className="mobile-filters-footer">
          <button className="mobile-filter-btn mobile-clear-btn"
                  onClick={onClearFilters}>
            {currentLang === 'ar' ? 'مسح' : 'CLEAR'}
          </button>
          <button className="mobile-filter-btn mobile-apply-btn"
                  onClick={onClose}>
            {currentLang === 'ar' ? 'تطبيق الفلتر' : 'APPLY FILTER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;