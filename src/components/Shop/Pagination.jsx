import React from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange, 
  visiblePages = [],
  loading = false 
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      {/* Items per page selector */}
      <div className="items-per-page">
        <label>
          {currentLang === 'ar' ? 'عرض' : 'Show'}:
          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={loading}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          {currentLang === 'ar' ? 'عناصر' : 'items'}
        </label>
      </div>

      {/* Results info */}
      <div className="results-info">
        {loading ? (
          <span>{currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
        ) : (
          <span>
            {currentLang === 'ar' 
              ? `عرض ${startItem}-${endItem} من ${totalItems} منتج`
              : `Showing ${startItem}-${endItem} of ${totalItems} products`
            }
          </span>
        )}
      </div>

      {/* Pagination controls */}
      <div className="pagination">
        <button 
          className="page-btn prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          title={currentLang === 'ar' ? 'السابق' : 'Previous'}
        >
          {currentLang === 'ar' ? '‹' : '›'}
        </button>
        
        {visiblePages.map((page, index) => (
          page === '...'
            ? <span key={`dots-${index}`} className="page-dots">...</span>
            : <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                disabled={loading}
              >
                {page}
              </button>
        ))}
        
        <button 
          className="page-btn next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          title={currentLang === 'ar' ? 'التالي' : 'Next'}
        >
          {currentLang === 'ar' ? '›' : '‹'}
        </button>
      </div>
    </div>
  );
};

export default Pagination; 