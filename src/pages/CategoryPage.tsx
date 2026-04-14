import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, getCategoryFromSlug, categoryDisplayNames } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';

interface CategoryPageProps {
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

export default function CategoryPage({ getItemQty, onAdd, onUpdateQty }: CategoryPageProps) {
  const { categoria } = useParams<{ categoria: string }>();
  const category = categoria ? getCategoryFromSlug(categoria) : undefined;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = useMemo(() => {
    if (!category) return [];
    return products.filter(p => p.category === category);
  }, [category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (!category) {
    return (
      <main className="catalog" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Categoria no encontrada</h1>
        <p style={{ color: '#999', marginBottom: 24 }}>
          La categoria que buscas no existe.
        </p>
        <Link to="/catalogo" className="btn btn-red">
          Ver todos los productos
        </Link>
      </main>
    );
  }

  return (
    <main className="catalog">
      <div className="catalog__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/catalogo" style={{ color: '#999', fontSize: 14 }}>
            ← Catalogo
          </Link>
        </div>
        <h1>{categoryDisplayNames[category] || category}</h1>
        <p className="catalog__count">
          {filtered.length.toLocaleString()} producto{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <motion.div
        className="products-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={visibleCount}
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
