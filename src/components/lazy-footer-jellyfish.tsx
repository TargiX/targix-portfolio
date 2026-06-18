"use client";

import { useEffect, useRef, useState } from "react";

type FooterJellyfishComponent = typeof import("@/components/footer-jellyfish")["FooterJellyfish"];

export function LazyFooterJellyfish() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [FooterJellyfish, setFooterJellyfish] = useState<FooterJellyfishComponent | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || FooterJellyfish) return;

    let active = true;
    const load = () => {
      import("@/components/footer-jellyfish").then((module) => {
        if (active) setFooterJellyfish(() => module.FooterJellyfish);
      });
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "600px" },
    );

    observer.observe(host);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [FooterJellyfish]);

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {FooterJellyfish ? <FooterJellyfish /> : null}
    </div>
  );
}
