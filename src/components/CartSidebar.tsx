import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '../hooks/useCart';
import CheckoutForm from './CheckoutForm';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  totalPrice,
  onUpdateQty,
  onRemove,
  onClear,
}: CartSidebarProps) {
  const handleOrderSent = () => {
    onClear();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-sidebar__header">
              <h2>🛒 Tu Carrito ({items.length})</h2>
              <button className="cart-sidebar__close" onClick={onClose}>
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty__icon">🛒</div>
                <p className="cart-empty__text">Tu carrito esta vacio</p>
                <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
                  Agrega productos para hacer tu pedido
                </p>
              </div>
            ) : (
              <>
                <div className="cart-sidebar__items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item__img" />
                      <div className="cart-item__info">
                        <div className="cart-item__name">{item.name}</div>
                        {item.sku && (
                          <div className="cart-item__sku">Cod: {item.sku}</div>
                        )}
                        <div className="cart-item__price">
                          RD$ {(item.price * item.qty).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="cart-item__qty">
                        <button onClick={() => onUpdateQty(item.id, item.qty - 1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button className="cart-item__remove" onClick={() => onRemove(item.id)}>
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-sidebar__footer">
                  <div className="cart-sidebar__total">
                    <span className="cart-sidebar__total-label">Total</span>
                    <span className="cart-sidebar__total-amount">
                      RD$ {totalPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="cart-sidebar__section-title">
                  <div className="cart-sidebar__section-line" />
                  <span>Datos personales</span>
                  <div className="cart-sidebar__section-line" />
                </div>

                <CheckoutForm
                  items={items}
                  totalPrice={totalPrice}
                  onOrderSent={handleOrderSent}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
