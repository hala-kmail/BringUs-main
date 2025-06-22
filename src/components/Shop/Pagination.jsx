import React from 'react';

const Pagination = ({ totalPages, currentPage, handlePageChange, getVisiblePages }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button 
        className="page-btn prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
      {getVisiblePages().map((page, index) => (
        page === '...'
          ? <span key={`dots-${index}`} className="page-dots">...</span>
          : <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
      ))}
      <button 
        className="page-btn next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination; 