'use client';

import { useState } from 'react';

const requiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

async function sendMagicLink(email: string) {
  const url = requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const response = await fetch(`${url}/auth/v1/magiclink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      email,
      data: {},
      gotrue_meta_security: {},
      redirect_to: `${window.location.origin}/auth/callback`
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.msg ?? 'Unable to send magic link');
  }
}

type FormValues = {
  email: string;
};

export function AuthForm() {
  const [values, setValues] = useState<FormValues>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!values.email) {
      nextErrors.email = 'Email is required';
    } else if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await sendMagicLink(values.email);
      setStatus('sent');
      setMessage('Check your inbox for the magic link.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unable to send magic link');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="you@cafename.in"
          value={values.email}
          onChange={(event) => setValues({ email: event.target.value })}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Sending magic link…' : 'Send magic link'}
      </button>
      {message && (
        <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm text-slate-600'}>{message}</p>
      )}
    </form>
  );
}
