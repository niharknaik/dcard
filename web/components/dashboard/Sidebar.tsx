'use client';

import * as React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {clearToken} from '@/lib/auth';
import {Icon} from '../icons';

const nav = [
  {label: 'Overview', href: '/dashboard', icon: 'chart'},
  {label: 'Cards', href: '/dashboard/cards', icon: 'card'},
  {label: 'Templates', href: '/dashboard/templates', icon: 'sparkle'},
  {label: 'Rewards', href: '/dashboard/rewards', icon: 'star'},
  {label: 'Referrals', href: '/dashboard/referrals', icon: 'users'},
  {label: 'Leads', href: '/dashboard/leads', icon: 'inbox'},
  {label: 'Plans', href: '/dashboard/plans', icon: 'bolt'},
  {label: 'Profile', href: '/dashboard/profile', icon: 'portfolio'},
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    clearToken();
    router.replace('/login');
  };

  return (
    <aside className="flex shrink-0 flex-row gap-1 border-b border-line bg-white/80 p-3 backdrop-blur md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:gap-2 md:border-b-0 md:border-r md:p-4">
      <a href="/dashboard" className="mb-0 flex items-center gap-2.5 px-2 md:mb-6 md:py-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-glow">
          D
        </span>
        <span className="hidden font-display text-lg font-bold text-ink md:inline">DCard</span>
      </a>

      <nav className="flex flex-1 flex-row gap-1 md:flex-col">
        {nav.map(item => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-600 shadow-ring ring-1 ring-primary-100'
                  : 'text-ink-soft hover:bg-surface-alt hover:text-ink'
              }`}>
              <Icon name={item.icon} width={18} height={18} />
              <span className="hidden md:inline">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-surface-alt hover:text-ink">
        <Icon name="arrowRight" width={18} height={18} />
        <span className="hidden md:inline">Log out</span>
      </button>
    </aside>
  );
}
