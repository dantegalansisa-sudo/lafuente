// Product store abstraction.
// Today: localStorage backend.
// Tomorrow: swap the implementations for Supabase calls and the rest of the
// app keeps working unchanged.

export interface ProductOverride {
  product_id: string;
  price?: number;
  image_url?: string;
  hidden?: boolean;
  updated_at: string;
}

export interface CustomProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

const OVERRIDES_KEY = 'lafuente_product_overrides_v1';
const CUSTOM_KEY = 'lafuente_custom_products_v1';
const SESSION_KEY = 'lafuente_admin_session_v1';

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach(fn => fn());

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Overrides
export function getOverrides(): ProductOverride[] {
  return readJSON<ProductOverride[]>(OVERRIDES_KEY, []);
}

export function getOverride(productId: string): ProductOverride | undefined {
  return getOverrides().find(o => o.product_id === productId);
}

export function setOverride(productId: string, patch: Partial<Omit<ProductOverride, 'product_id' | 'updated_at'>>) {
  const all = getOverrides();
  const idx = all.findIndex(o => o.product_id === productId);
  const now = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch, updated_at: now };
  } else {
    all.push({ product_id: productId, ...patch, updated_at: now });
  }
  writeJSON(OVERRIDES_KEY, all);
  notify();
}

export function deleteOverride(productId: string) {
  const all = getOverrides().filter(o => o.product_id !== productId);
  writeJSON(OVERRIDES_KEY, all);
  notify();
}

// Custom products
export function getCustomProducts(): CustomProduct[] {
  return readJSON<CustomProduct[]>(CUSTOM_KEY, []);
}

export function createCustomProduct(input: Omit<CustomProduct, 'id' | 'created_at' | 'updated_at'>): CustomProduct {
  const now = new Date().toISOString();
  const id = `cp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const product: CustomProduct = { id, ...input, created_at: now, updated_at: now };
  const all = getCustomProducts();
  all.push(product);
  writeJSON(CUSTOM_KEY, all);
  notify();
  return product;
}

export function updateCustomProduct(id: string, patch: Partial<Omit<CustomProduct, 'id' | 'created_at'>>) {
  const all = getCustomProducts();
  const idx = all.findIndex(p => p.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  writeJSON(CUSTOM_KEY, all);
  notify();
}

export function deleteCustomProduct(id: string) {
  const all = getCustomProducts().filter(p => p.id !== id);
  writeJSON(CUSTOM_KEY, all);
  notify();
}

// File upload (today: data URL into localStorage; tomorrow: Supabase Storage URL)
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Auth (today: hardcoded password; tomorrow: Supabase Auth)
const ADMIN_PASSWORD = 'lafuente2026';

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
