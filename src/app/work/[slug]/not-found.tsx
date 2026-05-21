import Link from "next/link";

export default function CaseNotFound() {
  return (
    <main className="mx-auto flex min-h-[60svh] max-w-[760px] flex-col items-start justify-center px-5 sm:px-8">
      <div className="mb-3 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
        404 / case not found
      </div>
      <h1 className="mb-5 font-sans text-[44px] font-medium tracking-[-0.025em] text-fg">
        No case study at that URL.
      </h1>
      <p className="mb-8 max-w-[48ch] font-mono text-fg-muted">
        Either I haven&apos;t written it yet, or you followed a broken link. Most likely the former
        — case studies trickle out as time permits.
      </p>
      <Link
        href="/#work"
        className="group inline-flex items-center gap-2 border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
        back to work
      </Link>
    </main>
  );
}
