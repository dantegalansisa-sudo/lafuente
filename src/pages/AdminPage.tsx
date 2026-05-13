import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories, categoryDisplayNames } from '../data/products';
import type { Product } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  adminLogin,
  adminLogout,
  getCurrentUser,
  onAuthChange,
  setOverride,
  deleteOverride,
  getOverride,
  createCustomProduct,
  updateCustomProduct,
  deleteCustomProduct,
  uploadImage,
} from '../lib/productStore';
import type { AuthUser } from '../lib/productStore';

const ITEMS_PER_PAGE = 25;

// Static catalog ids look like `p0001`; admin-created products use Supabase
// UUIDs (e.g. `550e8400-e29b-41d4-a716-446655440000`), which contain hyphens.
const isCustomId = (id: string) => id.includes('-');

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useDocumentTitle('Panel de Administración');

  useEffect(() => {
    getCurrentUser().then(setUser);
    return onAuthChange(setUser);
  }, []);

  if (user === undefined) {
    return <main className="admin admin--loading">Cargando...</main>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Dashboard user={user} onLogout={async () => { await adminLogout(); }} />;
}

// ============================================================
// Login
// ============================================================
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email.trim(), password);
      // onAuthChange will update the parent state
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(
        msg.toLowerCase().includes('invalid')
          ? 'Email o contraseña incorrectos'
          : msg,
      );
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin admin--login">
      <form className="admin-login" onSubmit={submit}>
        <img src="/logo-lafuente.jpeg" alt="La Fuente" className="admin-login__logo" />
        <h1>Panel de Administración</h1>
        <p>Acceso solo para personal autorizado</p>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="Email"
          autoFocus
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          placeholder="Contraseña"
          required
        />
        {error && <span className="admin-login__error">{error}</span>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <Link to="/" className="admin-login__back">← Volver al sitio</Link>
      </form>
    </main>
  );
}

// ============================================================
// Dashboard (product manager)
// ============================================================
function Dashboard({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const products = useProducts();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    let result = products;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    return result;
  }, [products, query, categoryFilter]);

  const visible = filtered.slice(0, visibleCount);

  // reset pagination when filters change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [query, categoryFilter]);

  return (
    <main className="admin">
      <header className="admin__header">
        <div className="admin__header-left">
          <img src="/logo-lafuente.jpeg" alt="La Fuente" />
          <div>
            <h1>Panel de Administración</h1>
            <p>
              {filtered.length.toLocaleString()} productos
              {user.email && <span className="admin__user"> · {user.email}</span>}
            </p>
          </div>
        </div>
        <div className="admin__header-right">
          <button className="admin__btn admin__btn--add" onClick={() => setCreating(true)}>
            + Agregar producto
          </button>
          <Link to="/" className="admin__btn admin__btn--ghost">Ver sitio</Link>
          <button className="admin__btn admin__btn--ghost" onClick={onLogout}>Salir</button>
        </div>
      </header>

      <div className="admin__filters">
        <input
          type="text"
          className="admin__search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, SKU o ID..."
        />
        <select
          className="admin__select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {categoryDisplayNames[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      <div className="admin__table">
        <div className="admin__table-head">
          <span>Foto</span>
          <span>Nombre</span>
          <span>SKU</span>
          <span>Precio</span>
          <span>Acciones</span>
        </div>
        {visible.map(p => (
          <ProductRow key={p.id} product={p} onEdit={() => setEditing(p)} />
        ))}
        {visible.length === 0 && (
          <div className="admin__empty">No se encontraron productos</div>
        )}
      </div>

      {visibleCount < filtered.length && (
        <button
          className="admin__load-more"
          onClick={() => setVisibleCount(c => c + ITEMS_PER_PAGE)}
        >
          Cargar más ({filtered.length - visibleCount} restantes)
        </button>
      )}

      {editing && (
        <EditModal product={editing} onClose={() => setEditing(null)} />
      )}
      {creating && (
        <CreateModal onClose={() => setCreating(false)} />
      )}
    </main>
  );
}

// ============================================================
// Product row
// ============================================================
function ProductRow({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const isCustom = isCustomId(product.id);
  const override = !isCustom ? getOverride(product.id) : undefined;
  const edited = isCustom || !!override;
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    setBusy(true);
    try {
      if (isCustom) await deleteCustomProduct(product.id);
      else await setOverride(product.id, { hidden: true });
    } catch (err) {
      alert(`Error al eliminar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (isCustom) return;
    if (!confirm(`¿Restaurar "${product.name}" a su valor original?`)) return;
    setBusy(true);
    try {
      await deleteOverride(product.id);
    } catch (err) {
      alert(`Error al restaurar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`admin__row ${edited ? 'admin__row--edited' : ''}`}>
      <div className="admin__cell admin__cell--img">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="admin__cell admin__cell--name">
        <span>{product.name}</span>
        {isCustom && <span className="admin__tag admin__tag--new">Nuevo</span>}
        {!isCustom && override && <span className="admin__tag admin__tag--edited">Editado</span>}
      </div>
      <div className="admin__cell admin__cell--sku">{product.sku || '—'}</div>
      <div className="admin__cell admin__cell--price">
        RD${product.price.toFixed(2)}
      </div>
      <div className="admin__cell admin__cell--actions">
        <button className="admin__icon-btn" onClick={onEdit} title="Editar" disabled={busy}>Editar</button>
        {edited && !isCustom && (
          <button className="admin__icon-btn" onClick={handleRestore} title="Restaurar original" disabled={busy}>↺</button>
        )}
        <button
          className="admin__icon-btn admin__icon-btn--danger"
          onClick={handleDelete}
          title="Eliminar"
          disabled={busy}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Edit modal
// ============================================================
function EditModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const isCustom = isCustomId(product.id);
  const [price, setPrice] = useState(product.price.toString());
  const [imagePreview, setImagePreview] = useState(product.image);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [name, setName] = useState(product.name);
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setImageDataUrl(url);
      setImagePreview(url);
    } catch (err) {
      alert(`Error al cargar imagen: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSave = async () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Precio inválido');
      return;
    }

    setSaving(true);
    try {
      if (isCustom) {
        await updateCustomProduct(product.id, {
          price: newPrice,
          name,
          ...(imageDataUrl ? { image_url: imageDataUrl } : {}),
        });
      } else {
        await setOverride(product.id, {
          price: newPrice,
          ...(imageDataUrl ? { image_url: imageDataUrl } : {}),
        });
      }
      onClose();
    } catch (err) {
      alert(`Error al guardar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal__content" onClick={e => e.stopPropagation()}>
        <header className="admin-modal__header">
          <h2>Editar producto</h2>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </header>

        <div className="admin-modal__body">
          <div className="admin-modal__image">
            <img src={imagePreview} alt={product.name} />
            <label className="admin-modal__upload">
              📷 Cambiar foto
              <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
          </div>

          <div className="admin-modal__fields">
            {isCustom && (
              <label className="admin-modal__label">
                Nombre
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </label>
            )}
            {!isCustom && (
              <div className="admin-modal__readonly">
                <span>Nombre</span>
                <strong>{product.name}</strong>
              </div>
            )}
            <div className="admin-modal__readonly">
              <span>Categoría</span>
              <strong>{categoryDisplayNames[product.category] || product.category}</strong>
            </div>
            <div className="admin-modal__readonly">
              <span>SKU</span>
              <strong>{product.sku || '—'}</strong>
            </div>
            <label className="admin-modal__label">
              Precio (RD$)
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </label>
          </div>
        </div>

        <footer className="admin-modal__footer">
          <button className="admin__btn admin__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="admin__btn admin__btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// Create modal
// ============================================================
function CreateModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [price, setPrice] = useState('');
  const [imagePreview, setImagePreview] = useState('/logo-lafuente.jpeg');
  const [imageDataUrl, setImageDataUrl] = useState('/logo-lafuente.jpeg');
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setImageDataUrl(url);
      setImagePreview(url);
    } catch (err) {
      alert(`Error al cargar imagen: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { alert('Falta el nombre'); return; }
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) { alert('Precio inválido'); return; }

    setSaving(true);
    try {
      await createCustomProduct({
        sku: sku.trim() || null,
        name: name.trim(),
        category,
        price: newPrice,
        image_url: imageDataUrl,
      });
      onClose();
    } catch (err) {
      alert(`Error al crear: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal__content" onClick={e => e.stopPropagation()}>
        <header className="admin-modal__header">
          <h2>Agregar nuevo producto</h2>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </header>

        <div className="admin-modal__body">
          <div className="admin-modal__image">
            <img src={imagePreview} alt="preview" />
            <label className="admin-modal__upload">
              📷 Subir foto
              <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
          </div>

          <div className="admin-modal__fields">
            <label className="admin-modal__label">
              Nombre del producto *
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: ARROZ CAMPO 5 LB"
              />
            </label>
            <label className="admin-modal__label">
              Código / SKU
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Código de barras (opcional)"
              />
            </label>
            <label className="admin-modal__label">
              Categoría
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {categoryDisplayNames[cat] || cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-modal__label">
              Precio (RD$) *
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </label>
          </div>
        </div>

        <footer className="admin-modal__footer">
          <button className="admin__btn admin__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="admin__btn admin__btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Crear producto'}
          </button>
        </footer>
      </div>
    </div>
  );
}
