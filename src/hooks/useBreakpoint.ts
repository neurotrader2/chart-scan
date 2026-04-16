"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when window.innerWidth < breakpoint (default 640px = Tailwind `sm:`).
 * Safe for Next.js SSR: always starts as false on the server.
 */
export function useBreakpoint(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}
