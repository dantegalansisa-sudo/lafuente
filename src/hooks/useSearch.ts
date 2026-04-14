import { useState, useMemo } from 'react';
import { products } from '../data/products';
import type { Product } from '../data/products';

export function useSearch() {
  const [query, setQuery] = useState('');

  const results = useMemo((): Product[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [query]);

  const filterByCategory = useMemo(() => {
    return (category: string): Product[] => {
      return products.filter(p => p.category === category);
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    filterByCategory,
    hasResults: results.length > 0,
    isSearching: query.trim().length > 0,
  };
}
