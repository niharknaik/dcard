'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {RewardTransaction, RewardWallet} from '@/lib/types';
import {Icon} from '@/components/icons';
import {Spinner} from '@/components/dashboard/StatCard';

export default function RewardsPage() {
  const [wallet, setWallet] = React.useState<RewardWallet | null>(null);
  const [transactions, setTransactions] = React.useState<RewardTransaction[]>([]);
  const [points, setPoints] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');

  const load = React.useCallback(async () => {
    const [w, txns] = await Promise.all([
      apiFetch<RewardWallet>('/rewards/wallet'),
      apiFetch<RewardTransaction[]>('/rewards/transactions'),
    ]);
    setWallet(w);
    setTransactions(txns);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wallet.');
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(points, 10);
    if (!n || n <= 0) {
      setError('Enter a valid number of points.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      // The redeem endpoint returns the updated wallet + the new ledger entry,
      // so we update from the response instead of re-fetching (avoids a request
      // burst against the write we just made).
      const res = await apiFetch<{wallet: RewardWallet; transaction: RewardTransaction}>('/rewards/redeem', {
        method: 'POST',
        body: JSON.stringify({points: n}),
      });
      setWallet(res.wallet);
      setTransactions(prev => [res.transaction, ...prev]);
      setMessage(`Redeemed ${n} points.`);
      setPoints('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not redeem points.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Reward Wallet</h1>
      <p className="mt-1 text-ink-soft">Earn points from referrals and rewards, then redeem them.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-accent-600">{message}</p> : null}

      {/* Balance hero */}
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-brand-gradient bg-[length:150%_150%] p-7 text-white shadow-glow">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_10%,rgba(255,255,255,0.2),transparent)]"
          aria-hidden
        />
        <p className="relative text-sm font-medium text-white/85">Available points</p>
        <p className="relative mt-1 font-display text-5xl font-extrabold">{wallet?.balance ?? 0}</p>
        <div className="relative mt-4 flex gap-6 text-sm text-white/85">
          <span>Earned {wallet?.lifetime_earned ?? 0}</span>
          <span>Redeemed {wallet?.lifetime_redeemed ?? 0}</span>
        </div>
      </div>

      {/* Redeem */}
      <form onSubmit={onRedeem} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex-1">
          <label htmlFor="points" className="block text-sm font-medium text-ink">
            Redeem points
          </label>
          <input
            id="points"
            type="number"
            min={1}
            value={points}
            onChange={e => setPoints(e.target.value)}
            placeholder="e.g. 100"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer rounded-xl bg-brand-gradient bg-[length:160%_160%] px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_50%] disabled:opacity-60">
          {busy ? 'Redeeming…' : 'Redeem'}
        </button>
      </form>

      {/* History */}
      <h2 className="mt-8 text-lg font-semibold">History</h2>
      {transactions.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No activity yet. Earn points by referring friends.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {transactions.map(txn => (
            <li key={txn.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    txn.type === 'credit' ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary'
                  }`}>
                  <Icon name={txn.type === 'credit' ? 'download' : 'arrowRight'} width={16} height={16} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{txn.source_label}</p>
                  <p className="text-xs text-ink-muted">
                    {txn.description ?? new Date(txn.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-bold ${txn.signed_points >= 0 ? 'text-accent-600' : 'text-ink-soft'}`}>
                {txn.signed_points > 0 ? '+' : ''}
                {txn.signed_points}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
