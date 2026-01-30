import React from 'react';
import { useData } from '../state/DataContext';
import { useItemsData } from './Items/useItemsData';
import ItemsHeader from './Items/ItemsHeader';
import LoadingSkeleton from './Items/LoadingSkeleton';
import ErrorState from './Items/ErrorState';
import EmptyState from './Items/EmptyState';
import VirtualizedList from './Items/VirtualizedList';
import PaginationControls from './Items/PaginationControls';
import './Items.css';

function Items() {
  const { items, fetchItems, loading, error, pagination } = useData();
  const {
    searchQuery,
    currentPage,
    handleSearchChange,
    handlePageChange,
    handleRetry,
  } = useItemsData(fetchItems);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="items-container">
        <ItemsHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          disabled
        />
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="items-container">
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="items-container">
      <ItemsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {items.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <>
          <div className="items-info">
            <span>
              Showing {items.length} of {pagination.total} items
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>

          <VirtualizedList items={items} />

          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default Items;