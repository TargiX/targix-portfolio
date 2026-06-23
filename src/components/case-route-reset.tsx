"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export function resetCaseScrollNow() {
  const root = document.documentElement;
  const body = document.body;
  const prevRoot = root.style.scrollBehavior;
  const prevBody = body.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  window.setTimeout(() => {
    root.style.scrollBehavior = prevRoot;
    body.style.scrollBehavior = prevBody;
  }, 350);
}

export function CaseRouteReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!pathname?.startsWith("/work/")) return;
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.scrollBehavior;
    const prevBody = body.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      root.style.scrollBehavior = prevRoot;
      body.style.scrollBehavior = prevBody;
    };
  }, [pathname]);

  return null;
}
