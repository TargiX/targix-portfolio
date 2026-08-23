"use client";

import { useEffect, useRef, useState } from "react";

export type ActiveSection = "top" | "work" | "about" | "evidence" | "github";

export const SECTION_SEQUENCE = [
  { id: "top", n: "01", label: "Introduction", shortLabel: "Top" },
  { id: "work", n: "02", label: "Work", shortLabel: "Work" },
  { id: "about", n: "03", label: "About", shortLabel: "About" },
  { id: "evidence", n: "04", label: "Case Study Routes", shortLabel: "Routes" },
  { id: "github", n: "05", label: "GitHub", shortLabel: "GitHub" },
] as const satisfies ReadonlyArray<{
  id: ActiveSection;
  n: string;
  label: string;
  shortLabel: string;
}>;

export function useActiveSection() {
  const [active, setActive] = useState<ActiveSection>("top");
  const activeRef = useRef<ActiveSection>("top");

  useEffect(() => {
    let raf = 0;

    const setNext = (next: ActiveSection) => {
      if (activeRef.current === next) return;
      activeRef.current = next;
      setActive(next);
    };

    const update = () => {
      raf = 0;

      const work = document.getElementById("work");
      const about = document.getElementById("about");
      const evidence = document.getElementById("evidence");
      const github = document.getElementById("github");
      const scrollMarker = window.scrollY + window.innerHeight * 0.42;
      const workTop = work
        ? window.scrollY + work.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const aboutTop = about
        ? window.scrollY + about.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const evidenceTop = evidence
        ? window.scrollY + evidence.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const githubTop = github
        ? window.scrollY + github.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;

      if (scrollMarker >= githubTop) {
        setNext("github");
        return;
      }

      if (scrollMarker >= evidenceTop) {
        setNext("evidence");
        return;
      }

      if (scrollMarker >= aboutTop) {
        setNext("about");
        return;
      }

      if (scrollMarker >= workTop) {
        setNext("work");
        return;
      }

      setNext("top");
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}
