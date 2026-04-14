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

        <button className="navbar__cart" onClick={onCartClick}>
          🛒 Carrito
          {totalItems > 0 && (
            <span className="navbar__cart-count">{totalItems}</span>
          )}
        </button>
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
      </div>
    </>
  );
}
