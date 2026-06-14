'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import {CheckoutCancelled, purchasePlan} from '@/lib/razorpay';
import type {CurrentSubscription, Plan, User} from '@/lib/types';
import {Icon} from '@/components/icons';
import {Spinner} from '@/components/dashboard/StatCard';

export default function PlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [currentCode, setCurrentCode] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState('');

  const load = React.useCallback(async () => {
    const [list, current] = await Promise.all([
      apiFetch<Plan[]>('/plans'),
      apiFetch<CurrentSubscription>('/subscription'),
    ]);
    setPlans(list);
    setCurrentCode(current.plan?.code ?? null);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await load();
        try {
          setUser(await apiFetch<User>('/auth/me'));
        } catch {
          // prefill is optional
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load plans.');
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onUpgrade = async (plan: Plan) => {
    setBusy(plan.id);
    setMessage('');
    setError('');
    try {
      await purchasePlan(plan, {
        name: user?.name,
        email: user?.email,
        contact: user?.phone ?? undefined,
      });
      setMessage('Subscription activated. Welcome to ' + plan.name + '!');
      await load();
    } catch (e) {
      if (e instanceof CheckoutCancelled) {
        return;
      }
      setError(e instanceof Error ? e.message : 'Checkout failed.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Plans</h1>
      <p className="mt-1 text-ink-soft">Choose the plan that fits how you work.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-accent-600">{message}</p> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {plans.map(plan => {
          const isCurrent = plan.code === currentCode;
          const paid = plan.price > 0;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 ${
                isCurrent ? 'border-primary shadow-glow' : 'border-line shadow-soft'
              }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {isCurrent ? (
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>

              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-3xl font-bold text-ink">
                  {plan.price > 0 ? `₹${plan.price}` : 'Free'}
                </span>
                {paid ? <span className="mb-1 text-sm text-ink-muted">/{plan.billing_period}</span> : null}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Icon name="check" width={18} height={18} className="mt-0.5 shrink-0 text-accent-600" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="mt-6 w-full cursor-default rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink-muted">
                  Your plan
                </button>
              ) : paid ? (
                <button
                  type="button"
                  onClick={() => onUpgrade(plan)}
                  disabled={busy !== null}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
                  {busy === plan.id ? 'Processing…' : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <span className="mt-6 block w-full rounded-xl border border-line px-5 py-2.5 text-center text-sm font-medium text-ink-muted">
                  Included
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        Payments are processed securely by Razorpay.
      </p>
    </div>
  );
}
