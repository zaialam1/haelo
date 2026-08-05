"use client";

import { PageTransitionProvider } from "@/components/transitions/PageTransitionProvider";

export function TransitionRoot({ children }: { children: React.ReactNode }) {
  return <PageTransitionProvider>{children}</PageTransitionProvider>;
}
