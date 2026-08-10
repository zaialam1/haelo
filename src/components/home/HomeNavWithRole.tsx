"use client";

import { useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { createClient } from "@/lib/supabase/client";
import { formatUsernameDisplay } from "@/lib/profiles/username";

/**
 * HomeNav that reveals the Personal | Professional mode switch for professionals.
 */
export function HomeNavWithRole({ pinned = false }: { pinned?: boolean }) {
  const [showModeSwitch, setShowModeSwitch] = useState(false);
  const [usernameDisplay, setUsernameDisplay] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_role, username")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled || profile?.account_role !== "professional") return;

      setShowModeSwitch(true);
      if (profile.username) {
        setUsernameDisplay(formatUsernameDisplay(profile.username));
      }

      const { data: pro } = await supabase
        .from("professional_profiles")
        .select("verification_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      const status = pro?.verification_status ?? "verified";
      setVerified(status === "verified");
      setPending(status === "pending");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HomeNav
      pinned={pinned}
      showModeSwitch={showModeSwitch}
      professionalUsername={usernameDisplay}
      professionalVerified={verified}
      professionalPending={pending}
    />
  );
}
