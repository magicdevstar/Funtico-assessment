import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchItems = useCallback(async (page = 1, limit = 10, searchQuery = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      const res = await fetch(`http://localhost:3001/api/items?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch items: ${res.statusText}`);
      }
      
      const json = await res.json();
      setItems(json.items || []);
      setPagination({
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 10,
        totalPages: json.totalPages || 0
      });
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems, loading, error, pagination }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);