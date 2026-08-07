"use client";

import { useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { createClient } from "@/lib/supabase/client";

/**
 * HomeNav that reveals the Professional link when the signed-in account is professional.
 */
export function HomeNavWithRole({ pinned = false }: { pinned?: boolean }) {
  const [showProfessional, setShowProfessional] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("account_role")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setShowProfessional(data?.account_role === "professional");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <HomeNav pinned={pinned} showProfessional={showProfessional} />;
}
