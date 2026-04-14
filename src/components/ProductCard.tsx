import { motion } from 'framer-motion';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  qty: number;
  onAdd: (product: Product) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

export default function ProductCard({ product, qty, onAdd, onUpdateQty }: ProductCardProps) {
  return (
    <motion.div
      className="product-card"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {qty > 0 && (
        <motion.span
          className="qty-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {qty}
        </motion.span>
      )}

      <img
        src={product.image}
        alt={product.name}
        className="product-card__img"
        loading="lazy"
      />

      <div className="product-card__body">
        <div className="product-card__name">{product.name}</div>
        <div className="product-card__price">RD$ {product.price.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

        {qty === 0 ? (
          <button
            className="product-card__add"
            onClick={() => onAdd(product)}
          >
            + Agregar
          </button>
        ) : (
          <div className="product-card__qty">
            <button
              className="product-card__qty-btn"
              onClick={() => onUpdateQty(product.id, qty - 1)}
            >
              -
            </button>
            <span className="product-card__qty-num">{qty}</span>
            <button
              className="product-card__qty-btn"
              onClick={() => onUpdateQty(product.id, qty + 1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { cardVariants };
