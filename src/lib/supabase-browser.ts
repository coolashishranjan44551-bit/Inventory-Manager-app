'use client';

const requiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export function getSupabaseRestUrl(path: string) {
  const baseUrl = requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getSupabaseHeaders() {
  const anonKey = requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`
  };
}
