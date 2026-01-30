import React from 'react';

function EmptyState({ searchQuery }) {
  return (
    <div className="empty-state">
      <p>No items found{searchQuery && ` matching "${searchQuery}"`}</p>
    </div>
  );
}

export default EmptyState;

