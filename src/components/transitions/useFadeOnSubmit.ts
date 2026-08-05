"use client";

import type { FormEventHandler } from "react";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";

/**
 * Starts a soft fade overlay when a form begins submitting.
 * Works alongside server actions / redirects that change the route.
 */
export function useFadeOnSubmit(): FormEventHandler<HTMLFormElement> {
  const transition = useOptionalPageTransition();

  return () => {
    transition?.cover("fade");
  };
}
