import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import CategoryPage from './pages/CategoryPage';

function App() {
  const cart = useCart();
  const search = useSearch();

  return (
    <BrowserRouter>
      <CustomCursor />

      <Navbar
        searchQuery={search.query}
        onSearchChange={search.setQuery}
        totalItems={cart.totalItems}
        onCartClick={() => cart.setIsOpen(true)}
      />

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
      </Routes>

      <CartSidebar
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        totalPrice={cart.totalPrice}
        onUpdateQty={cart.updateQty}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
      />

      <WhatsAppButton />
    </BrowserRouter>
  );
}

export default App;
