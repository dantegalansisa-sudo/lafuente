import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Surface this loudly during dev — silent failure here would be confusing.
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Set them in .env (local) and in Vercel → Settings → Environment Variables (prod).'
  );
}

export const supabase = createClient(
  url ?? 'http://invalid.local',
  anonKey ?? 'invalid',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'lafuente_admin_session',
    },
  }
);

export const isSupabaseConfigured = Boolean(url && anonKey);
