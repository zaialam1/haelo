"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventName, AnalyticsProps } from "@/lib/analytics/events";

/** Fire a page/open analytics event once on mount. Never blocks render. */
export function PageView({
  event,
  props,
}: {
  event: AnalyticsEventName;
  props?: AnalyticsProps;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, props);
  }, [event, props]);
  return null;
}
