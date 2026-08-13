import { NextResponse } from "next/server";
import { toClientSafeErrorMessage } from "@/lib/openai";
import { processSessionAnalysis } from "@/lib/sessions/processAnalysis";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

/**
 * Starts (or re-runs) transcript + analysis processing for a session.
 * Idempotent enough for client fire-and-forget after save.
 */
export async function POST(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing session id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processSessionAnalysis(sessionId, user.id);
    if (result.analysisStatus !== "ready") {
      console.error(
        `[sessions/process] ${sessionId} analysis=${result.analysisStatus}: ${result.message}`,
      );
    } else {
      console.info(`[sessions/process] ${sessionId} analysis ready`);
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = toClientSafeErrorMessage(
      e,
      "Could not process this session.",
    );
    console.error(`[sessions/process] ${sessionId} threw:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
