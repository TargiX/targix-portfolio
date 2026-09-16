import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { IOS_APPS } from "@/lib/data";

export function PublishedIOSApps() {
  return (
    <section id="ios-apps" aria-labelledby="ios-apps-title" className="mx-auto max-w-[1280px] scroll-mt-20 border-t border-line-soft px-5 py-10 sm:px-8 sm:py-12">
      <div className="mb-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-dim">Independent products · App Store</p>
        <h2 id="ios-apps-title" className="mt-2 font-sans text-[28px] font-medium tracking-tight text-fg">Published iOS apps</h2>
        <p className="mt-2 max-w-[65ch] font-sans text-[15px] leading-relaxed text-fg-muted">Products I designed, built, and brought to the App Store.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {IOS_APPS.map((app) => (
          <article key={app.title} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 rounded-lg border border-line-soft bg-bg-2/30 p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 sm:p-6 lg:grid-cols-[100px_minmax(0,1fr)] lg:gap-4 lg:p-4">
            <a href={app.links[0].href} target="_blank" rel="noreferrer" aria-label={`${app.title} screenshots on the App Store`} className="self-start overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
              <Image src={app.thumb!} alt={app.imageAlt} width={221} height={480} sizes="(min-width: 1024px) 100px, (min-width: 640px) 150px, 100px" className="h-auto w-full" />
            </a>
            <div className="flex min-w-0 flex-col items-start">
              <h3 className="font-sans text-[23px] font-medium text-fg">{app.title}</h3>
              <p className="mt-2 font-sans text-[14px] leading-relaxed text-fg-muted">{app.blurb}</p>
              <p className="mt-4 font-sans text-[13px] leading-relaxed text-fg-muted"><strong className="font-medium text-fg">Interaction decision: </strong>{app.decision}</p>
              <a href={app.links[0].href} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-fg underline decoration-line underline-offset-4 transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
                View on App Store <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
