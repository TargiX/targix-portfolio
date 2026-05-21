"use client";

import { useEffect, useState } from "react";

export function Typed({ text, speed = 55 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= text.length) return;
    const id = setTimeout(() => setN(n + 1), speed);
    return () => clearTimeout(id);
  }, [n, text, speed]);

  return (
    <>
      {text.slice(0, n)}
      <span className="caret" />
    </>
  );
}
