"use client";

import dynamic from "next/dynamic";

const ProductTour = dynamic(
  () => import("@/components/onboarding/ProductTour").then((m) => m.ProductTour),
  { ssr: false },
);

export function LazyProductTour({ autoStart = false }: { autoStart?: boolean }) {
  return <ProductTour autoStart={autoStart} />;
}
