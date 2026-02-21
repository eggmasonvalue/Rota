import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client or throw ONLY if we are actually trying to use it at runtime?
// Or better: warn and use placeholder strings.
// Supabase client creation might validate the URL, so empty string could fail.
// But valid URL structure is required.

const validUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  // Check if we are in a browser environment to avoid spamming server logs during build
  if (typeof window !== 'undefined') {
    console.warn('Missing Supabase environment variables. Realtime features will not work.');
  }
}

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
