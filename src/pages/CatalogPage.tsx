import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, categoryDisplayNames } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

interface CatalogPageProps {
  getItemQty: (id: string) => number;
  onAdd: (product: Product) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const ITEMS_PER_PAGE = 40;

export default function CatalogPage({ getItemQty, onAdd, onUpdateQty }: CatalogPageProps) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <main className="catalog">
      <div className="catalog__header">
        <h1>
          {searchQuery
            ? `Resultados para "${searchQuery}"`
            : selectedCategory
            ? categoryDisplayNames[selectedCategory] || selectedCategory
            : 'Todos los Productos'}
        </h1>
        <p className="catalog__count">
          {filtered.length.toLocaleString()} producto{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <CategoryFilter selected={selectedCategory} onSelect={(cat) => {
        setSelectedCategory(cat);
        setVisibleCount(ITEMS_PER_PAGE);
      }} />

      <motion.div
        className="products-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${selectedCategory}-${searchQuery}-${visibleCount}`}
      >
        {visible.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            qty={getItemQty(product.id)}
            onAdd={onAdd}
            onUpdateQty={onUpdateQty}
          />
        ))}
      </motion.div>

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#555' }}>
            No se encontraron productos
          </p>
          <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
            Intenta con otro termino de busqueda o categoria
          </p>
        </div>
      )}

      {hasMore && (
        <div className="load-more">
          <button
            className="load-more__btn"
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
          >
            Cargar mas productos ({filtered.length - visibleCount} restantes)
          </button>
        </div>
      )}
    </main>
  );
}
