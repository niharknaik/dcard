import type {Metadata} from 'next';

type Params = {params: {code: string}};

export function generateMetadata({params}: Params): Metadata {
  return {
    title: `Join DCard with code ${params.code}`,
    description: 'You have been invited to DCard. Download the app and enter this code when you sign up.',
  };
}

export default function ReferralInvitePage({params}: Params) {
  const code = decodeURIComponent(params.code).toUpperCase();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-16 text-ink">
      <div className="aurora left-[-10%] top-[-8%] h-[28rem] w-[28rem] bg-violet-400/30" aria-hidden />
      <div className="aurora right-[-10%] bottom-[-8%] h-[24rem] w-[24rem] bg-fuchsia-400/25 [animation-delay:3s]" aria-hidden />

      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white/80 p-8 text-center shadow-soft backdrop-blur sm:p-10">
        <div className="flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mark.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-xl shadow-glow" />
          <span className="font-display text-xl font-bold text-ink">DCard</span>
        </div>

        <h1 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">You&rsquo;re invited to DCard</h1>
        <p className="mt-3 text-ink-soft">
          A friend wants you to join DCard — your digital visiting card. Share by QR or link, capture leads, and
          ditch paper cards for good.
        </p>

        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Your invite code</p>
          <div className="mt-2 select-all rounded-2xl border border-dashed border-primary/40 bg-primary-50 px-6 py-4 font-display text-2xl font-extrabold tracking-widest text-primary">
            {code}
          </div>
        </div>

        <a
          href="/"
          className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-opacity hover:opacity-90">
          Get DCard
        </a>

        <ol className="mt-8 space-y-3 text-left text-sm text-ink-soft">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">1</span>
            Download the DCard app and create your account.
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">2</span>
            Enter the invite code <span className="font-semibold text-ink">{code}</span> when you sign up.
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">3</span>
            You both earn reward points. 🎉
          </li>
        </ol>
      </div>
    </main>
  );
}
