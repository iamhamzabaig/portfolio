import { createClient } from '@supabase/supabase-js';

// Local Supabase defaults so the app still boots before `.env.local` is filled.
// Without real values the network calls just fail and React Query falls back to
// the static placeholder data — the site never hard-crashes.
const url = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:55321';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — run `cd backend && npx supabase status` and add them to frontend/.env.local');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});
