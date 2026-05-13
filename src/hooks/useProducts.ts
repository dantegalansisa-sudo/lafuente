import { useEffect, useState, useMemo } from 'react';
import { products as staticProducts } from '../data/products';
import type { Product } from '../data/products';
import {
  subscribe,
  getOverrides,
  getCustomProducts,
  ensureLoaded,
} from '../lib/productStore';

// Merges the static products list with admin overrides and custom products.
// Subscribes to the store so any admin change re-renders consumers.
export function useProducts(): Product[] {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    ensureLoaded();
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  return useMemo(() => {
    const overrides = getOverrides();
    const overrideMap = new Map(overrides.map(o => [o.product_id, o]));

    const merged: Product[] = [];
    for (const p of staticProducts) {
      const ov = overrideMap.get(p.id);
      if (ov?.hidden) continue;
      if (!ov) {
        merged.push(p);
      } else {
        merged.push({
          ...p,
          price: ov.price ?? p.price,
          image: ov.image_url ?? p.image,
        });
      }
    }

    for (const cp of getCustomProducts()) {
      merged.push({
        id: cp.id,
        sku: cp.sku ?? '',
        name: cp.name,
        category: cp.category,
        price: cp.price,
        image: cp.image_url ?? '/logo-lafuente.jpeg',
      });
    }

    return merged;
    // tick drives re-computation when the store changes
  }, [tick]);
}
