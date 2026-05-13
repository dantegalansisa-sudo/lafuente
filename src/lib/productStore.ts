// Product store backed by Supabase.
// - Reads (overrides + custom products) are cached in memory and broadcast via
//   `subscribe` so the rest of the app re-renders when the admin makes changes.
// - Writes call Supabase directly and update the local cache on success.
// - Image uploads currently embed the file as a data URL (works without R2).
//   When R2 credentials are wired up, swap `uploadImage` to push to R2 and
//   return the public URL — no other code change needed.

import { supabase, isSupabaseConfigured } from './supabase';

export interface ProductOverride {
  product_id: string;
  price?: number | null;
  image_url?: string | null;
  hidden?: boolean | null;
  updated_at: string;
}

export interface CustomProduct {
  id: string;
  sku: string | null;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach(fn => fn());

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// In-memory cache
let overridesCache: ProductOverride[] = [];
let customCache: CustomProduct[] = [];
let initialFetchStarted = false;
let initialFetchDone = false;

async function fetchAll() {
  if (!isSupabaseConfigured) return;
  const [ovRes, cpRes] = await Promise.all([
    supabase.from('product_overrides').select('*'),
    supabase.from('custom_products').select('*'),
  ]);
  if (ovRes.error) {
    console.error('Failed to load overrides:', ovRes.error);
  } else {
    overridesCache = (ovRes.data ?? []) as ProductOverride[];
  }
  if (cpRes.error) {
    console.error('Failed to load custom products:', cpRes.error);
  } else {
    customCache = (cpRes.data ?? []) as CustomProduct[];
  }
  initialFetchDone = true;
  notify();
}

export function ensureLoaded() {
  if (initialFetchStarted) return;
  initialFetchStarted = true;
  void fetchAll();
}

// Realtime subscription so multiple devices stay in sync without a refresh.
if (isSupabaseConfigured && typeof window !== 'undefined') {
  supabase
    .channel('admin-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_overrides' }, () => {
      void fetchAll();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_products' }, () => {
      void fetchAll();
    })
    .subscribe();
}

// Overrides
export function getOverrides(): ProductOverride[] {
  return overridesCache;
}

export function getOverride(productId: string): ProductOverride | undefined {
  return overridesCache.find(o => o.product_id === productId);
}

export async function setOverride(
  productId: string,
  patch: Partial<Omit<ProductOverride, 'product_id' | 'updated_at'>>,
) {
  const row = { product_id: productId, ...patch };
  const { error, data } = await supabase
    .from('product_overrides')
    .upsert(row, { onConflict: 'product_id' })
    .select()
    .single();
  if (error) throw error;
  const idx = overridesCache.findIndex(o => o.product_id === productId);
  if (idx >= 0) overridesCache[idx] = data as ProductOverride;
  else overridesCache.push(data as ProductOverride);
  notify();
}

export async function deleteOverride(productId: string) {
  const { error } = await supabase
    .from('product_overrides')
    .delete()
    .eq('product_id', productId);
  if (error) throw error;
  overridesCache = overridesCache.filter(o => o.product_id !== productId);
  notify();
}

// Custom products
export function getCustomProducts(): CustomProduct[] {
  return customCache;
}

export async function createCustomProduct(
  input: Omit<CustomProduct, 'id' | 'created_at' | 'updated_at'>,
): Promise<CustomProduct> {
  const { error, data } = await supabase
    .from('custom_products')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  const created = data as CustomProduct;
  customCache.push(created);
  notify();
  return created;
}

export async function updateCustomProduct(
  id: string,
  patch: Partial<Omit<CustomProduct, 'id' | 'created_at'>>,
) {
  const { error, data } = await supabase
    .from('custom_products')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const idx = customCache.findIndex(p => p.id === id);
  if (idx >= 0) customCache[idx] = data as CustomProduct;
  notify();
}

export async function deleteCustomProduct(id: string) {
  const { error } = await supabase.from('custom_products').delete().eq('id', id);
  if (error) throw error;
  customCache = customCache.filter(p => p.id !== id);
  notify();
}

// Image upload — pushes the compressed file to Cloudflare R2 via the
// /api/upload-image Vercel function. If the function is unreachable (e.g.
// `vite dev` without `vercel dev`), falls back to embedding as a data URL so
// the panel remains usable for local testing.
export async function uploadImage(file: File, productId?: string): Promise<string> {
  const compressed = await compressImage(file, { maxDim: 1024, quality: 0.82 });
  const base64 = await blobToBase64(compressed);

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No active session');

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: compressed.type || 'image/jpeg',
        base64,
        productId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { url: string };
    return json.url;
  } catch (err) {
    console.warn(
      'R2 upload unavailable, falling back to data URL:',
      err instanceof Error ? err.message : err,
    );
    return `data:${compressed.type || 'image/jpeg'};base64,${base64}`;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the `data:<type>;base64,` prefix
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function compressImage(
  file: File,
  { maxDim, quality }: { maxDim: number; quality: number },
): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  const img = await loadImage(file);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>(resolve => {
    canvas.toBlob(
      blob => resolve(blob ?? file),
      'image/jpeg',
      quality,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

// Auth — Supabase email/password
export interface AuthUser {
  id: string;
  email: string | null;
}

export async function adminLogin(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');
  return { id: data.user.id, email: data.user.email ?? null };
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

export function onAuthChange(cb: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) cb(null);
    else cb({ id: session.user.id, email: session.user.email ?? null });
  });
  return () => data.subscription.unsubscribe();
}

export const initialDataReady = () => initialFetchDone;
