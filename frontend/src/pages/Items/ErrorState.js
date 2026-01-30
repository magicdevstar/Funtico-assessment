import React from 'react';

function ErrorState({ error, onRetry }) {
  return (
    <div className="error-container">
      <p className="error-message">Error: {error}</p>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    </div>
  );
}

export default ErrorState;

