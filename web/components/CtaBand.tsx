import * as React from 'react';
import {ButtonLink} from './ui/Button';
import {Icon} from './icons';

export function CtaBand() {
  return (
    <section id="download" className="container-px py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white shadow-float sm:px-12 sm:py-20">
        {/* Aurora + grid inside the band */}
        <div
          className="pointer-events-none absolute -left-1/4 top-[-30%] h-[28rem] w-[28rem] rounded-full bg-violet-500/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 bottom-[-40%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]"
          aria-hidden
        />

        <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
          <Icon name="sparkle" width={13} height={13} className="text-fuchsia-400" />
          Free forever — no credit card needed
        </span>

        <h2 className="relative mt-6 text-3xl font-bold sm:text-5xl">
          Ready to go <span className="text-gradient">digital</span>?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/75">
          Create your card in minutes and start sharing today. Join 10,000+ professionals who
          never run out of business cards again.
        </p>

        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink
            href="#"
            variant="secondary"
            className="border-transparent bg-white px-6 text-ink hover:bg-white">
            <Icon name="apple" />
            App Store
          </ButtonLink>
          <ButtonLink
            href="#"
            variant="secondary"
            className="border-transparent bg-white px-6 text-ink hover:bg-white">
            <Icon name="play" />
            Google Play
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
