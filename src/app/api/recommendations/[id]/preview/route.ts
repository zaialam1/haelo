import { NextResponse } from "next/server";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getOrbitRecommendationDetail } from "@/lib/recommendations";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/** Lightweight preview for Universe notification panel. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const detail = await getOrbitRecommendationDetail(id);
  if (!detail || detail.recipientUserId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const orbit = getOrbitByKey(detail.orbitKey);
  return NextResponse.json({
    orbitKey: detail.orbitKey,
    orbitTitle: orbit?.title ?? null,
    status: detail.status,
  });
}
