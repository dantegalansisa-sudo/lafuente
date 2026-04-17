import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, categories, categoryDisplayNames, getCategorySlug } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import RevealText from '../components/RevealText';
import MagneticButton from '../components/MagneticButton';

const heroSlides = [
  { src: '/imagenes/licores.png', name: 'Licores Premium', category: 'Bebidas' },
  { src: '/imagenes/canasta/arroz.png', name: 'Arroz', category: 'Canasta' },
  { src: '/imagenes/refrescos.png', name: 'Refrescos', category: 'Bebidas' },
  { src: '/imagenes/canasta/pollo.png', name: 'Pollo', category: 'Canasta' },
  { src: '/imagenes/cervezas.png', name: 'Cervezas', category: 'Bebidas' },
  { src: '/imagenes/canasta/habichuelas.png', name: 'Habichuelas', category: 'Canasta' },
  { src: '/imagenes/canasta/leche.png', name: 'Leche', category: 'Canasta' },
  { src: '/imagenes/canasta/platanos.png', name: 'Plátanos', category: 'Canasta' },
  { src: '/imagenes/canasta/cafe.png', name: 'Café', category: 'Canasta' },
  { src: '/imagenes/canasta/huevos.png', name: 'Huevos', category: 'Canasta' },
  { src: '/imagenes/canasta/aceite.png', name: 'Aceite', category: 'Canasta' },
  { src: '/imagenes/canasta/salami.png', name: 'Salami', category: 'Canasta' },
  { src: '/imagenes/canasta/azucar.png', name: 'Azúcar', category: 'Canasta' },
  { src: '/imagenes/canasta/pan.png', name: 'Pan', category: 'Canasta' },
  { src: '/imagenes/canasta/vegetales.png', name: 'Vegetales', category: 'Canasta' },
];

interface HomeProps {
  getItemQty: (id: string) => number;
  onAdd: (product: Product) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const PRODUCT_IMAGE = '/logo-lafuente.jpeg';

const categoryImages: Record<string, string> = {
  'DESPENSAS / ALIMENTOS Y MAS': PRODUCT_IMAGE,
  'PASTA/CAFE/CEREALES': PRODUCT_IMAGE,
  'GALLETAS/PANADERIA': PRODUCT_IMAGE,
  'QUINCALLERIA': PRODUCT_IMAGE,
  'LIQOR STOR DON CHUCHO': PRODUCT_IMAGE,
  'AREA DE BEBES': PRODUCT_IMAGE,
  'CUIDADO PERSONAL Y BELLEZA': PRODUCT_IMAGE,
  'ELECTRODOMESTICOS/HOGAR': PRODUCT_IMAGE,
  'EMBUTIDOS': PRODUCT_IMAGE,
  'FARMACIA': PRODUCT_IMAGE,
  'FERRETERIA': PRODUCT_IMAGE,
  'FRESCOS Y PERESEDEROS': PRODUCT_IMAGE,
  'FRUTOS SECOS': PRODUCT_IMAGE,
  'GRANERO': PRODUCT_IMAGE,
  'LACTEOS': PRODUCT_IMAGE,
  'LACTEOS Y HUEVOS': PRODUCT_IMAGE,
  'LIMPIEZA Y DESECHABLES': PRODUCT_IMAGE,
  'MERCADO': PRODUCT_IMAGE,
  'PANADERIA': PRODUCT_IMAGE,
  'PRODUCTOS VARIADOS': PRODUCT_IMAGE,
  'TECNOLOGIA': PRODUCT_IMAGE,
  'bebidas refrescantes': PRODUCT_IMAGE,
  'combo': PRODUCT_IMAGE,
  'veterinaria': PRODUCT_IMAGE,
};

export default function Home({ getItemQty, onAdd, onUpdateQty }: HomeProps) {
  const featured = products.slice(0, 12);
  const topCategories = categories.slice(0, 10);

  // Horizontal slider state
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = heroSlides.length;

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance every 4s
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [paused, goNext]);

  const slide = heroSlides[current];

  return (
    <main>
      {/* HERO BANNER */}
      <section className="hero">
        <div className="hero__split">
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className="hero__badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              Delivery disponible
            </motion.div>

            <RevealText tag="h1" className="" delay={0.2} animateOnMount>
              Todo lo que necesitas, directo a tu puerta
            </RevealText>

            <motion.p
              className="hero__subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Delivery y Pick-up disponible. Haz tu pedido por WhatsApp.
            </motion.p>

            <motion.div
              className="hero__buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <MagneticButton href="/catalogo" className="btn btn-white">
                Ver Catalogo
              </MagneticButton>
              <MagneticButton href="https://wa.me/18095933919" className="btn btn-orange">
                WhatsApp
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__showcase"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Category badge */}
            <span className="hero__slider-category">{slide.category}</span>

            {/* Slide */}
            <div className="hero__slider-viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  className="hero__slider-slide"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <img
                    src={slide.src}
                    alt={slide.name}
                    className="hero__slider-img"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product name */}
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                className="hero__slider-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {slide.name}
              </motion.span>
            </AnimatePresence>

            {/* Controls */}
            <div className="hero__slider-controls">
              <button className="hero__slider-btn" onClick={goPrev} aria-label="Anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="hero__slider-dots">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`hero__slider-dot ${i === current ? 'active' : ''}`}
                    onClick={() => setCurrent(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <button className="hero__slider-btn" onClick={goNext} aria-label="Siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section">
        <div className="section__header">
          <RevealText tag="h2" className="section__title" delay={0}>
            Categorias
          </RevealText>
          <Link to="/catalogo" className="section__link">
            Ver todas →
          </Link>
        </div>
        <div className="categories-grid">
          {topCategories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/catalogo/${getCategorySlug(cat)}`}
                className="category-circle"
              >
                <img
                  src={categoryImages[cat] || PRODUCT_IMAGE}
                  alt={categoryDisplayNames[cat] || cat}
                  className="category-circle__img"
                />
                <span className="category-circle__name">
                  {categoryDisplayNames[cat] || cat}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="section section--gray">
        <div className="section__header">
          <RevealText tag="h2" className="section__title" delay={0}>
            Productos Seleccionados
          </RevealText>
          <Link to="/catalogo" className="section__link">
            Ver todos →
          </Link>
        </div>
        <div className="products-scroll">
          {featured.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              qty={getItemQty(product.id)}
              onAdd={onAdd}
              onUpdateQty={onUpdateQty}
            />
          ))}
        </div>
      </section>

      {/* DELIVERY BANNER */}
      <section className="delivery-banner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <RevealText tag="h2" className="" delay={0}>
            Quieres tu pedido en casa?
          </RevealText>
          <p style={{ position: 'relative' }}>
            Selecciona tus productos y coordina tu delivery por WhatsApp
          </p>
          <div style={{ position: 'relative', marginTop: 24 }}>
            <MagneticButton href="https://wa.me/18095933919" className="btn btn-orange">
              Hacer Pedido Ahora →
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* TODOS LOS PRODUCTOS POR CATEGORIA */}
      {categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat).slice(0, 8);
        if (catProducts.length === 0) return null;

        return (
          <section key={cat} className="section">
            <div className="section__header">
              <RevealText tag="h2" className="section__title" delay={0}>
                {categoryDisplayNames[cat] || cat}
              </RevealText>
              <Link to={`/catalogo/${getCategorySlug(cat)}`} className="section__link">
                Ver todos →
              </Link>
            </div>
            <motion.div
              className="products-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
            >
              {catProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={getItemQty(product.id)}
                  onAdd={onAdd}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </motion.div>
          </section>
        );
      })}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__grid">
          <div className="footer__brand">
            <h3>
              <img src="/logo-lafuente.jpeg" alt="La Fuente" style={{ height: 50, borderRadius: 6, marginBottom: 8 }} />
              {' '}La Fuente Supermarket
            </h3>
            <p>El aliado a tu despensa siempre. Supermercado, licorera y hogar en Villa Mella.</p>
          </div>
          <div className="footer__col">
            <h4>Navegacion</h4>
            <Link to="/">Inicio</Link>
            <Link to="/catalogo">Catalogo</Link>
            <Link to="/nosotros">Nosotros</Link>
            <a href="https://wa.me/18095933919" target="_blank" rel="noopener noreferrer">Contacto</a>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <a href="tel:+18095933919">Tel: 809-593-3919</a>
            <a href="tel:+18298740312">Tel: 829-874-0312</a>
            <a href="https://wa.me/18095933919" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://instagram.com/lafuentesupermarketrd" target="_blank" rel="noopener noreferrer">Instagram @lafuentesupermarketrd</a>
          </div>
          <div className="footer__col">
            <h4>Ubicacion</h4>
            <a
              href="https://maps.google.com/?q=Carretera+Yamasa+Villa+Mella+Santo+Domingo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carretera Yamasa, local 26
            </a>
            <span>al lado de Stop Out Car Wash</span>
            <span>Villa Mella, Santo Domingo</span>
            <span>Republica Dominicana 11201</span>
          </div>
        </div>
        <div className="footer__bottom">
          &copy; {new Date().getFullYear()} La Fuente Supermarket. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
