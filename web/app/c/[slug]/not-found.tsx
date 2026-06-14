import {ButtonLink} from '@/components/ui/Button';

export default function CardNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary-50 font-display text-3xl font-bold text-primary">
          D
        </div>
        <h1 className="text-2xl font-bold">Card not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          This card doesn’t exist, or it may have been unpublished by its owner.
        </p>
        <ButtonLink href="/" className="mt-7">
          Go to DCard
        </ButtonLink>
      </div>
    </main>
  );
}
