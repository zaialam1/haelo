"use client";

import { useEffect } from "react";
import { identifyAnalyticsUser, initAnalytics } from "@/lib/analytics/client";

/**
 * Initializes PostHog on mount (silent no-op without a key) and optionally
 * identifies the signed-in user. Safe to mount more than once.
 */
export function AnalyticsBootstrap({ userId }: { userId?: string | null }) {
  useEffect(() => {
    initAnalytics();
    if (userId) identifyAnalyticsUser(userId);
  }, [userId]);
  return null;
}
