'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api-client';
import {setToken} from '@/lib/auth';
import type {AuthPayload} from '@/lib/types';
import {Icon} from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await apiFetch<AuthPayload>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({email: email.trim(), password}),
      });
      setToken(payload.token);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-5">
      <div className="aurora left-[-10%] top-[-10%] h-[26rem] w-[26rem] bg-violet-400/30" aria-hidden />
      <div className="aurora right-[-10%] bottom-[-10%] h-[24rem] w-[24rem] bg-fuchsia-400/25 [animation-delay:3s]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-lg font-bold text-white shadow-glow">
              D
            </span>
            <span className="font-display text-xl font-bold text-ink">DCard</span>
          </a>
          <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to manage your cards</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur-xl">
          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100"
          />

          <label className="mt-4 block text-sm font-medium text-ink" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100"
          />

          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:160%_160%] px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_50%] hover:shadow-glow-lg disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading ? <Icon name="arrowRight" width={16} height={16} /> : null}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to DCard?{' '}
          <a href="/#download" className="cursor-pointer font-semibold text-primary hover:underline">
            Get the app
          </a>
        </p>
      </div>
    </main>
  );
}
