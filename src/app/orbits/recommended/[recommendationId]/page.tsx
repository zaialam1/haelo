import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { RecommendationDetailClient } from "@/components/recommendations/RecommendationDetailClient";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getUserOrbitProgress } from "@/lib/orbits/progress";
import {
  getOrbitRecommendationDetail,
  markOrbitRecommendationViewed,
} from "@/lib/recommendations/data";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ recommendationId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { recommendationId } = await params;
  const detail = await getOrbitRecommendationDetail(recommendationId);
  const orbit = detail ? getOrbitByKey(detail.orbitKey) : null;
  return {
    title: orbit
      ? `${orbit.title} — Recommended — Haelo`
      : "Recommended Orbit — Haelo",
  };
}

export default async function RecommendedOrbitPage({ params }: PageProps) {
  const { recommendationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orbits/recommended/${recommendationId}`)}`,
    );
  }

  const detail = await getOrbitRecommendationDetail(recommendationId);
  if (!detail || detail.recipientUserId !== user.id) {
    notFound();
  }

  const orbit = getOrbitByKey(detail.orbitKey);
  if (!orbit) {
    notFound();
  }

  if (detail.status === "new") {
    await markOrbitRecommendationViewed(recommendationId);
  }

  const progress = await getUserOrbitProgress(user.id, detail.orbitKey);

  return (
    <div className="relative min-h-dvh">
      <HomeNavWithRole />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-24 sm:px-6">
        <RecommendationDetailClient
          recommendationId={detail.id}
          orbit={orbit}
          purpose={detail.purpose}
          personalMessage={detail.personalMessage}
          professionalUsername={detail.professionalUsername}
          progress={progress}
          status={detail.status === "new" ? "viewed" : detail.status}
        />
      </main>
      <HomeBottomNav />
    </div>
  );
}
