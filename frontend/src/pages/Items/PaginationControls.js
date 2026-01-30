import React from 'react';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="pagination-button"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;

