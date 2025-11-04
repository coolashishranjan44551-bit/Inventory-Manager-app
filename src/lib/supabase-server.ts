const requiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export function getSupabaseRestUrl(path: string) {
  const baseUrl = process.env.SUPABASE_REST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const resolved = requiredEnv(baseUrl, 'SUPABASE_REST_URL or NEXT_PUBLIC_SUPABASE_URL');
  return `${resolved}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getServiceRoleKey() {
  return requiredEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
}
