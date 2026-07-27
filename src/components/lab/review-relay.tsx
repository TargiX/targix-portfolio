"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ClipboardCheck, Copy, ShieldCheck } from "lucide-react";

import {
  getReviewRelayHistoryPath,
  type DecisionOwner,
  type ProofFocus,
  type ReviewMoment,
  type ReviewRelayInput,
} from "@/lib/review-relay";
import { cn } from "@/lib/utils";

type CopyStatus = "idle" | "relay-copied" | "link-copied" | "error";

const MOMENTS: Array<{ id: ReviewMoment; label: string; detail: string }> = [
  { id: "launch", label: "Before a product bet", detail: "A team needs a real decision before polishing the wrong thing." },
  { id: "incident", label: "During an operating risk", detail: "A visible trade-off needs an accountable call, not a status update." },
  { id: "handoff", label: "At a delivery handoff", detail: "The next owner needs a decision they can act on without a meeting." },
];

const OWNERS: Array<{ id: DecisionOwner; label: string; detail: string }> = [
  { id: "product", label: "Product lead", detail: "Priorities, user value, and the narrowest useful scope." },
  { id: "engineering", label: "Engineering lead", detail: "Implementation boundary, failure state, and technical trade-offs." },
  { id: "client", label: "Client or operator", detail: "The real-world constraint, approval, and timing that change the plan." },
];

const PROOF: Array<{ id: ProofFocus; label: string; detail: string }> = [
  { id: "behavior", label: "Behavior to verify", detail: "Make one user action and its outcome observable." },
  { id: "risk", label: "Risk to expose", detail: "Make the unsafe assumption or failure state easy to challenge." },
  { id: "delivery", label: "Delivery boundary", detail: "Make the handoff, owner, and next checkpoint explicit." },
];

const MOMENT_COPY: Record<ReviewMoment, string> = {
  launch: "We need to decide whether the first release solves one urgent job before expanding the surface.",
  incident: "We need to decide which failure state must stay visible while the operating path is repaired.",
  handoff: "We need to decide what the next owner can safely ship without reopening the whole product conversation.",
};

const OWNER_COPY: Record<DecisionOwner, string> = {
  product: "Product lead: confirm the user outcome and the non-goal.",
  engineering: "Engineering lead: confirm the implementation boundary and recoverable failure state.",
  client: "Client or operator: confirm the real constraint and approval threshold.",
};

const PROOF_COPY: Record<ProofFocus, string> = {
  behavior: "Show the triggering user action, the resulting state, and the signal that proves it worked.",
  risk: "Show the assumption at risk, the correction path, and who can challenge the proposed decision.",
  delivery: "Show the named owner, the exact handoff artifact, and the next checkpoint after delivery.",
};

export function ReviewRelay({ initialRelay }: { initialRelay: ReviewRelayInput }) {
  const [moment, setMoment] = useState<ReviewMoment>(initialRelay.moment);
  const [owner, setOwner] = useState<DecisionOwner>(initialRelay.owner);
  const [proof, setProof] = useState<ProofFocus>(initialRelay.proof);
  const [generated, setGenerated] = useState(initialRelay.ready);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyVersion = useRef(0);

  const relay = useMemo(() => createRelay(moment, owner, proof), [moment, owner, proof]);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      getReviewRelayHistoryPath(
        { moment, owner, proof, ready: generated },
        window.location.search,
        window.location.hash,
      ),
    );
  }, [generated, moment, owner, proof]);

  function invalidateRelay() {
    copyVersion.current += 1;
    setGenerated(false);
    setCopyStatus("idle");
  }

  function chooseMoment(value: ReviewMoment) {
    invalidateRelay();
    setMoment(value);
  }

  function chooseOwner(value: DecisionOwner) {
    invalidateRelay();
    setOwner(value);
  }

  function chooseProof(value: ProofFocus) {
    invalidateRelay();
    setProof(value);
  }

  async function copyRelay() {
    const version = ++copyVersion.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access unavailable");
      await navigator.clipboard.writeText(relay.markdown);
      if (copyVersion.current === version) setCopyStatus("relay-copied");
    } catch {
      if (copyVersion.current === version) setCopyStatus("error");
    }
  }

  async function copyShareLink() {
    const version = ++copyVersion.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access unavailable");
      await navigator.clipboard.writeText(window.location.href);
      if (copyVersion.current === version) setCopyStatus("link-copied");
    } catch {
      if (copyVersion.current === version) setCopyStatus("error");
    }
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-line-soft bg-bg/45 shadow-[0_28px_100px_rgba(0,0,0,.2)]">
      <div className="grid xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-line-soft p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            <span className="grid size-7 place-items-center rounded-md border border-line-soft bg-bg-2/45 text-[var(--accent)]">
              <ShieldCheck className="size-3.5" aria-hidden />
            </span>
            Configure the review
          </div>
          <h2 className="mt-6 max-w-[15ch] font-sans text-[clamp(32px,5vw,58px)] font-medium leading-[0.94] tracking-[-0.045em] text-fg">
            Make the next decision easy to review.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-fg-muted">
            Pick the moment, the person who must decide, and the proof that makes the call defensible. The relay turns those choices into a handoff another person can act on.
          </p>

          <ChoiceGroup label="Review moment" options={MOMENTS} value={moment} onChange={chooseMoment} />
          <ChoiceGroup label="Decision owner" options={OWNERS} value={owner} onChange={chooseOwner} />
          <ChoiceGroup label="Proof focus" options={PROOF} value={proof} onChange={chooseProof} />

          <button
            type="button"
            onClick={() => { setCopyStatus("idle"); setGenerated(true); }}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 font-mono text-[12px] lowercase tracking-[0.06em] text-bg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Build review relay <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="min-w-0 p-5 sm:p-7" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <ClipboardCheck className="size-4 text-[var(--accent)]" aria-hidden />
              {generated ? "Review relay ready" : "Your review relay will appear here"}
            </div>
            {generated && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyShareLink} className="inline-flex h-9 items-center gap-2 rounded-full border border-line-soft bg-bg-2/30 px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                  <Copy className="size-3.5" aria-hidden /> Copy share link
                </button>
                <button type="button" onClick={copyRelay} className="inline-flex h-9 items-center gap-2 rounded-full border border-line-soft bg-bg-2/30 px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                  <Copy className="size-3.5" aria-hidden /> Copy relay
                </button>
              </div>
            )}
          </div>

          {generated ? (
            <article className="mt-5 space-y-4" aria-label="Generated review relay">
              <RelayBlock label="Decision to make" value={relay.decision} />
              <RelayBlock label="Who decides" value={relay.owner} />
              <RelayBlock label="Proof before approval" value={relay.proof} />
              <RelayBlock label="The next message" value={relay.nextMessage} accent />
              <p className="min-h-5 text-[12px] text-fg-dim" role="status">
                {copyStatus === "relay-copied" ? "Relay copied. It belongs to this exact set of choices." : copyStatus === "link-copied" ? "Share link copied. It restores this decision, owner, proof boundary, and ready relay." : copyStatus === "error" ? "Could not copy. Select the relay or URL from the address bar manually." : "This relay is shareable: its URL preserves the current choices and ready state."}
              </p>
            </article>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-line-soft bg-bg-2/[0.12] p-5 text-[13px] leading-relaxed text-fg-muted">
              A good review request makes the decision, evidence, and owner visible at the same time. Configure this one, then generate the relay.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceGroup<T extends string>({ label, options, value, onChange }: { label: string; options: Array<{ id: T; label: string; detail: string }>; value: T; onChange: (value: T) => void }) {
  return (
    <fieldset className="mt-8">
      <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{label}</legend>
      <div className="mt-3 grid gap-2">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button key={option.id} type="button" aria-pressed={selected} onClick={() => onChange(option.id)} className={cn("rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]", selected ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]" : "border-line-soft bg-bg-2/20 hover:border-line hover:bg-bg-2/40")}>
              <span className="block text-[13px] font-medium text-fg">{option.label}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-fg-dim">{option.detail}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function RelayBlock({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <section className={cn("rounded-2xl border p-4", accent ? "border-[var(--accent)]/45 bg-[var(--accent)]/[0.06]" : "border-line-soft bg-bg-2/[0.12]")}><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{label}</div><p className="mt-2 text-[14px] leading-relaxed text-fg">{value}</p></section>;
}

function createRelay(moment: ReviewMoment, owner: DecisionOwner, proof: ProofFocus) {
  const decision = MOMENT_COPY[moment];
  const ownerLine = OWNER_COPY[owner];
  const proofLine = PROOF_COPY[proof];
  const nextMessage = `I need your call on this: ${decision} Please review this proof boundary: ${proofLine} ${ownerLine}`;
  return { decision, owner: ownerLine, proof: proofLine, nextMessage, markdown: `# Review relay\n\n## Decision to make\n${decision}\n\n## Who decides\n${ownerLine}\n\n## Proof before approval\n${proofLine}\n\n## The next message\n${nextMessage}` };
}
