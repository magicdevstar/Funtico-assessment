import { useEffect, useState, useRef } from 'react';

const DEBOUNCE_DELAY = 300;
const ITEMS_PER_PAGE = 10;

export function useItemsData(fetchItems) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Handle search with debouncing and prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounced fetch
    searchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchItems(currentPage, ITEMS_PER_PAGE, searchQuery);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchItems, currentPage, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchItems(currentPage, ITEMS_PER_PAGE, searchQuery);
  };

  return {
    searchQuery,
    currentPage,
    handleSearchChange,
    handlePageChange,
    handleRetry,
  };
}

