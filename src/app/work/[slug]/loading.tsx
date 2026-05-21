export default function Loading() {
  return (
    <main className="relative mx-auto max-w-[760px] px-5 pb-24 pt-12 sm:px-8">
      <div className="font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim">
        ← back to work
      </div>
      <div className="mt-10 mb-12 animate-pulse border-b border-line-soft pb-10">
        <div className="mb-4 h-3 w-48 rounded bg-bg-2" />
        <div className="mb-6 h-14 w-3/4 rounded bg-bg-2" />
        <div className="h-4 w-2/3 rounded bg-bg-2" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-bg-2" />
        <div className="h-3 w-[92%] rounded bg-bg-2" />
        <div className="h-3 w-[88%] rounded bg-bg-2" />
        <div className="h-3 w-[60%] rounded bg-bg-2" />
      </div>
    </main>
  );
}
