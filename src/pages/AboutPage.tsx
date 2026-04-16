import { motion } from 'framer-motion';
import RevealText from '../components/RevealText';
import MagneticButton from '../components/MagneticButton';

const departments = [
  { name: 'Despensa y Alimentos', description: 'Productos basicos, aceites, conservas y todo para la cocina' },
  { name: 'Licores', description: 'Liquor Store Don Chucho: rones, whiskies, vinos y mas' },
  { name: 'Farmacia', description: 'Medicamentos, vitaminas y cuidado de la salud' },
  { name: 'Cuidado Personal y Belleza', description: 'Higiene, cosmetica y cuidado personal' },
  { name: 'Hogar y Electrodomesticos', description: 'Articulos para el hogar y pequenos electrodomesticos' },
  { name: 'Ferreteria', description: 'Herramientas, materiales y soluciones para el hogar' },
  { name: 'Area de Bebes', description: 'Leche, panales, formulas y articulos infantiles' },
  { name: 'Frescos y Perecederos', description: 'Frutas, verduras, carnes y productos frescos' },
  { name: 'Panaderia', description: 'Pan fresco, reposteria y productos horneados' },
  { name: 'Embutidos y Lacteos', description: 'Quesos, jamones, yogurts y derivados lacteos' },
  { name: 'Limpieza y Desechables', description: 'Detergentes, jabones y articulos desechables' },
  { name: 'Veterinaria', description: 'Alimentos y cuidado para mascotas' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
  },
};

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <motion.div
          className="about-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="about-hero__badge">Sobre Nosotros</div>
          <RevealText tag="h1" className="about-hero__title" delay={0.1} animateOnMount>
            El aliado a tu despensa siempre
          </RevealText>
          <motion.p
            className="about-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            La Fuente Supermarket — Tu supermercado de confianza en Villa Mella,
            con todo lo que necesitas en un solo lugar.
          </motion.p>
        </motion.div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="section">
        <div className="section__header">
          <RevealText tag="h2" className="section__title" delay={0}>
            Contacto
          </RevealText>
        </div>

        <motion.div
          className="contact-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* PHONE */}
          <motion.div className="contact-card" variants={itemVariants}>
            <div className="contact-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3 className="contact-card__title">Telefonos</h3>
            <a href="tel:+18095933919" className="contact-card__link">809-593-3919</a>
            <a href="tel:+18298740312" className="contact-card__link">829-874-0312</a>
            <a href="https://wa.me/18095933919" target="_blank" rel="noopener noreferrer" className="contact-card__cta">
              Escribir por WhatsApp →
            </a>
          </motion.div>

          {/* INSTAGRAM */}
          <motion.div className="contact-card" variants={itemVariants}>
            <div className="contact-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </div>
            <h3 className="contact-card__title">Instagram</h3>
            <a
              href="https://instagram.com/lafuentesupermarketrd"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__link"
            >
              @lafuentesupermarketrd
            </a>
            <span className="contact-card__meta">88.5K seguidores</span>
            <a
              href="https://instagram.com/lafuentesupermarketrd"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__cta"
            >
              Seguirnos →
            </a>
          </motion.div>

          {/* LOCATION */}
          <motion.div className="contact-card" variants={itemVariants}>
            <div className="contact-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="contact-card__title">Ubicacion</h3>
            <p className="contact-card__text">
              Carretera Yamasa, local 26<br />
              al lado de Stop Out Car Wash<br />
              Villa Mella, Santo Domingo<br />
              Republica Dominicana 11201
            </p>
            <a
              href="https://maps.google.com/?q=Carretera+Yamasa+Villa+Mella+Santo+Domingo"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__cta"
            >
              Ver en Maps →
            </a>
          </motion.div>

          {/* HOURS / DELIVERY */}
          <motion.div className="contact-card" variants={itemVariants}>
            <div className="contact-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h3 className="contact-card__title">Servicios</h3>
            <p className="contact-card__text">
              Delivery y Pick-up<br />
              Pedidos por WhatsApp<br />
              Atencion personalizada
            </p>
            <a href="https://wa.me/18095933919" target="_blank" rel="noopener noreferrer" className="contact-card__cta">
              Hacer pedido →
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* DEPARTMENTS */}
      <section className="section section--gray">
        <div className="section__header">
          <RevealText tag="h2" className="section__title" delay={0}>
            Nuestros Departamentos
          </RevealText>
        </div>
        <p className="about-intro">
          En La Fuente Supermarket tenemos todo bajo un mismo techo. Conoce nuestras areas:
        </p>

        <motion.div
          className="departments-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {departments.map((dept, i) => (
            <motion.div key={dept.name} className="department-card" variants={itemVariants}>
              <span className="department-card__number">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="department-card__name">{dept.name}</h3>
              <p className="department-card__desc">{dept.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TEAM PLACEHOLDER */}
      <section className="section">
        <div className="section__header">
          <RevealText tag="h2" className="section__title" delay={0}>
            Nuestro Equipo
          </RevealText>
        </div>

        <motion.div
          className="team-placeholder"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="team-placeholder__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="team-placeholder__title">Proximamente</h3>
          <p className="team-placeholder__text">
            Estamos preparando la presentacion de nuestro equipo.<br />
            Pronto conoceras a las personas detras de La Fuente Supermarket.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="delivery-banner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <RevealText tag="h2" className="" delay={0}>
            Visitanos o haz tu pedido hoy
          </RevealText>
          <p style={{ position: 'relative' }}>
            Estamos listos para atenderte, por WhatsApp o en nuestra tienda fisica
          </p>
          <div style={{ position: 'relative', marginTop: 24 }}>
            <MagneticButton href="https://wa.me/18095933919" className="btn btn-orange">
              Contactar Ahora →
            </MagneticButton>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
