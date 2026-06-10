"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

export type LightboxImage = { src: string; alt?: string; label?: string };

type LightboxCtx = {
  /** Open the viewer on `images[index]`. Pass the whole gallery so ←/→ work. */
  open: (images: LightboxImage[], index?: number) => void;
};

const Ctx = createContext<LightboxCtx | null>(null);

/** Hook for galleries to open the shared fullscreen viewer. */
export function useLightbox(): LightboxCtx {
  const ctx = useContext(Ctx);
  // No-op fallback so a stray gallery outside the provider never crashes.
  return ctx ?? { open: () => {} };
}

/** Mount once around case-study content; renders the fullscreen overlay. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  const open = useCallback((images: LightboxImage[], index = 0) => {
    if (images.length) setState({ images, index });
  }, []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback(
    (delta: number) =>
      setState((s) => (s ? { ...s, index: (s.index + delta + s.images.length) % s.images.length } : s)),
    [],
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close, step]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-10"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 font-mono text-[15px] text-white/80 transition-colors hover:border-white/30 hover:text-white sm:right-5 sm:top-5"
            >
              ✕
            </button>

            {state.images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[20px] text-white/80 transition-colors hover:border-white/30 hover:text-white sm:left-5"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[20px] text-white/80 transition-colors hover:border-white/30 hover:text-white sm:right-5"
                >
                  ›
                </button>
              </>
            )}

            <motion.figure
              key={state.images[state.index].src}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full max-w-full flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.images[state.index].src}
                alt={state.images[state.index].alt ?? ""}
                className="max-h-[84vh] max-w-[94vw] rounded-md object-contain shadow-2xl shadow-black/50"
              />
              {(state.images[state.index].label || state.images.length > 1) && (
                <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.06em] text-white/70">
                  {state.images[state.index].label && <span>{state.images[state.index].label}</span>}
                  {state.images.length > 1 && (
                    <span className="text-white/45">
                      {state.index + 1} / {state.images.length}
                    </span>
                  )}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
