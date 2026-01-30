import React from 'react';

function LoadingSkeleton() {
  return (
    <div className="loading-container">
      <div className="skeleton-list">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="skeleton-item" />
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;

