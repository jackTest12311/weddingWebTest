"use client";

import { ReactNode, useEffect, useState } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // hydration 이후에만 렌더링
  if (!mounted) return null;

  return <>{children}</>;
}