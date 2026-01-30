import React from 'react';
import { Link } from 'react-router-dom';

function ItemRow({ index, style, items: itemsList }) {
  const item = itemsList[index];
  
  if (!item) return null;
  
  return (
    <div style={style} className="item-row">
      <Link to={`/items/${item.id}`} className="item-link">
        <div className="item-content">
          <span className="item-name">{item.name}</span>
          <span className="item-category">{item.category}</span>
          <span className="item-price">${item.price.toLocaleString()}</span>
        </div>
      </Link>
    </div>
  );
}

export default ItemRow;

