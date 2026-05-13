import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import { useProducts } from './hooks/useProducts';
import type { CartItem } from './hooks/useCart';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import CategoryPage from './pages/CategoryPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

// The shell decides what chrome to render based on the current route.
// /admin and anything under /admin/* runs in isolation — no public navbar,
// no cart sidebar, no floating WhatsApp button.
function AppShell() {
  const cart = useCart();
  const search = useSearch();
  const products = useProducts();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Load cart from URL parameter (?cart=p0001:2,p0005:1) — used when the
  // supermarket agent clicks the link in a customer's WhatsApp message.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartParam = params.get('cart');
    if (!cartParam) return;

    const loadedItems: CartItem[] = [];
    cartParam.split(',').forEach(entry => {
      const [id, qtyStr] = entry.split(':');
      const qty = parseInt(qtyStr, 10);
      if (!id || !qty || qty <= 0) return;
      const product = products.find(p => p.id === id);
      if (product) loadedItems.push({ ...product, qty });
    });

    if (loadedItems.length > 0) {
      cart.loadCart(loadedItems);
      cart.setIsOpen(true);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!isAdminRoute && (
        <Navbar
          searchQuery={search.query}
          onSearchChange={search.setQuery}
          totalItems={cart.totalItems}
          onCartClick={() => cart.setIsOpen(true)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              getItemQty={cart.getItemQty}
              onAdd={cart.addItem}
              onUpdateQty={cart.updateQty}
            />
          }
        />
        <Route
          path="/catalogo"
          element={
            <CatalogPage
              getItemQty={cart.getItemQty}
              onAdd={cart.addItem}
              onUpdateQty={cart.updateQty}
            />
          }
        />
        <Route
          path="/catalogo/:categoria"
          element={
            <CategoryPage
              getItemQty={cart.getItemQty}
              onAdd={cart.addItem}
              onUpdateQty={cart.updateQty}
            />
          }
        />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      {!isAdminRoute && (
        <CartSidebar
          isOpen={cart.isOpen}
          onClose={() => cart.setIsOpen(false)}
          items={cart.items}
          totalPrice={cart.totalPrice}
          onUpdateQty={cart.updateQty}
          onRemove={cart.removeItem}
          onClear={cart.clearCart}
        />
      )}

      {!isAdminRoute && <WhatsAppButton />}
    </>
  );
}

export default App;
