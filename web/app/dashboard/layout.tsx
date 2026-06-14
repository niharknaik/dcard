'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {isAuthenticated} from '@/lib/auth';
import {Sidebar} from '@/components/dashboard/Sidebar';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      <Sidebar />
      <main className="flex-1 px-5 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
