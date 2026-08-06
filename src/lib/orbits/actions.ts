"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { startOrResumeOrbit } from "@/lib/orbits/progress";
import { createClient } from "@/lib/supabase/server";

export async function beginOrbitAction(formData: FormData) {
  const orbitKey = String(formData.get("orbitKey") ?? "").trim();
  if (!orbitKey) {
    throw new Error("Missing orbit key.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/orbits/${orbitKey}`)}`);
  }

  const progress = await startOrResumeOrbit(user.id, orbitKey);
  revalidatePath("/orbits");
  revalidatePath(`/orbits/${orbitKey}`);

  // Recording flow wiring comes next; for now land on the Orbit detail
  // with progress started so Continue / question list is accurate.
  redirect(`/orbits/${orbitKey}?started=1&q=${progress.current_question_index}`);
}
