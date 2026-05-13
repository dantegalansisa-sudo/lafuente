import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories, categoryDisplayNames } from '../data/products';
import type { Product } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import {
  adminLogin,
  adminLogout,
  isAdminAuthed,
  setOverride,
  deleteOverride,
  getOverride,
  createCustomProduct,
  updateCustomProduct,
  deleteCustomProduct,
  uploadImage,
} from '../lib/productStore';

const ITEMS_PER_PAGE = 25;

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => isAdminAuthed());

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

// ============================================================
// Login
// ============================================================
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      onSuccess();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <main className="admin admin--login">
      <form className="admin-login" onSubmit={submit}>
        <img src="/logo-lafuente.jpeg" alt="La Fuente" className="admin-login__logo" />
        <h1>Panel de Administración</h1>
        <p>Acceso solo para personal autorizado</p>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          placeholder="Contraseña"
          autoFocus
        />
        {error && <span className="admin-login__error">{error}</span>}
        <button type="submit">Entrar</button>
        <Link to="/" className="admin-login__back">← Volver al sitio</Link>
      </form>
    </main>
  );
}

// ============================================================
// Dashboard (product manager)
// ============================================================
function Dashboard({ onLogout }: { onLogout: () => void }) {
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
            <p>{filtered.length.toLocaleString()} productos</p>
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
  const isCustom = product.id.startsWith('cp_');
  const override = !isCustom ? getOverride(product.id) : undefined;
  const edited = isCustom || !!override;

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    if (isCustom) {
      deleteCustomProduct(product.id);
    } else {
      setOverride(product.id, { hidden: true });
    }
  };

  const handleRestore = () => {
    if (isCustom) return;
    if (!confirm(`¿Restaurar "${product.name}" a su valor original?`)) return;
    deleteOverride(product.id);
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
        <button className="admin__icon-btn" onClick={onEdit} title="Editar">Editar</button>
        {edited && !isCustom && (
          <button className="admin__icon-btn" onClick={handleRestore} title="Restaurar original">↺</button>
        )}
        <button
          className="admin__icon-btn admin__icon-btn--danger"
          onClick={handleDelete}
          title="Eliminar"
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
  const isCustom = product.id.startsWith('cp_');
  const [price, setPrice] = useState(product.price.toString());
  const [imagePreview, setImagePreview] = useState(product.image);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [name, setName] = useState(product.name);
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    setImageDataUrl(url);
    setImagePreview(url);
  };

  const handleSave = async () => {
    setSaving(true);
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Precio inválido');
      setSaving(false);
      return;
    }

    if (isCustom) {
      updateCustomProduct(product.id, {
        price: newPrice,
        name,
        ...(imageDataUrl ? { image_url: imageDataUrl } : {}),
      });
    } else {
      setOverride(product.id, {
        price: newPrice,
        ...(imageDataUrl ? { image_url: imageDataUrl } : {}),
      });
    }
    setSaving(false);
    onClose();
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
    const url = await uploadImage(file);
    setImageDataUrl(url);
    setImagePreview(url);
  };

  const handleSave = async () => {
    if (!name.trim()) { alert('Falta el nombre'); return; }
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) { alert('Precio inválido'); return; }

    setSaving(true);
    createCustomProduct({
      sku: sku.trim(),
      name: name.trim(),
      category,
      price: newPrice,
      image_url: imageDataUrl,
    });
    setSaving(false);
    onClose();
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
