import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-[760px] flex-col items-start justify-center px-5 sm:px-8">
      <div className="mb-3 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
        404 / lost in space
      </div>
      <h1 className="mb-5 font-sans text-[64px] font-medium leading-none tracking-[-0.025em] text-fg">
        nothing here.
      </h1>
      <p className="mb-8 max-w-[48ch] font-mono text-fg-muted">
        You followed a link to a page that isn&apos;t a page. Sorry. The interesting stuff
        lives at the root.
      </p>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
        back home
      </Link>
    </main>
  );
}
