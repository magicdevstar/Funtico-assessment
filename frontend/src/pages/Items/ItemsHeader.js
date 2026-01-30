import React from 'react';

function ItemsHeader({ searchQuery, onSearchChange, disabled = false }) {
  return (
    <div className="items-header">
      <h1>Items</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={onSearchChange}
          className="search-input"
          aria-label="Search items"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default ItemsHeader;

