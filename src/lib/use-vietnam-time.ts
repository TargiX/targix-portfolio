"use client";

import { useEffect, useMemo, useState } from "react";

export function useVietnamTime() {
  const [t, setT] = useState<Date | null>(null);

  useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!t) return "--:--:--";
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(t);
  }, [t]);
}
