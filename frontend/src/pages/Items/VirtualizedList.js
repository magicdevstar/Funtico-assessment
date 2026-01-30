import React, { useCallback } from 'react';
import { List } from 'react-window';
import ItemRow from './ItemRow';

function VirtualizedList({ items }) {
  const RowComponent = useCallback((props) => (
    <ItemRow {...props} />
  ), []);

  return (
    <div className="virtualized-list-container">
      <List
        rowComponent={RowComponent}
        rowCount={items.length}
        rowHeight={60}
        rowProps={{ items }}
        style={{ height: 600, width: '100%' }}
        className="virtualized-list"
      />
    </div>
  );
}

export default VirtualizedList;

