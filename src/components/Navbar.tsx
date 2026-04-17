import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categories, categoryDisplayNames, getCategorySlug } from '../data/products';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalItems: number;
  onCartClick: () => void;
}

export default function Navbar({ searchQuery, onSearchChange, totalItems, onCartClick }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__logo">
          <img src="/logo-lafuente.jpeg" alt="La Fuente Supermarket" className="navbar__logo-img" />
        </Link>

        <form className="navbar__search" onSubmit={handleSearchSubmit}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </form>

        <div className="navbar__actions">
          <a
            href="tel:+18298740312"
            className="navbar__social"
            title="Llamar: 829-874-0312"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
          <a
            href="https://wa.me/18095933919"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__social"
            title="WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </a>
          <a
            href="https://instagram.com/lafuentesupermarketrd"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__social"
            title="Instagram @lafuentesupermarketrd"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

          <button className="navbar__cart" onClick={onCartClick}>
            🛒 Carrito
            {totalItems > 0 && (
              <span className="navbar__cart-count">{totalItems}</span>
            )}
          </button>
        </div>
      </nav>

      <div className="cat-navbar">
        <Link
          to="/catalogo"
          className={`cat-navbar-item ${location.pathname === '/catalogo' && !location.search ? 'active' : ''}`}
        >
          Todos
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            to={`/catalogo/${getCategorySlug(cat)}`}
            className={`cat-navbar-item ${
              location.pathname === `/catalogo/${getCategorySlug(cat)}` ? 'active' : ''
            }`}
          >
            {categoryDisplayNames[cat] || cat}
          </Link>
        ))}
        <Link
          to="/nosotros"
          className={`cat-navbar-item ${location.pathname === '/nosotros' ? 'active' : ''}`}
        >
          Nosotros
        </Link>
      </div>
    </>
  );
}
