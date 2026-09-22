import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { StoreClient } from "@/components/cosmetics/StoreClient";
import { loadCosmeticsStateForUser } from "@/lib/cosmetics/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Store — Halo",
  description: "Spend Stardust on decorations for your private Universe.",
};

export default async function StorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/store");
  }

  const state = (await loadCosmeticsStateForUser(user.id)) ?? {
    balance: 0,
    owned: [],
    assignments: [],
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 z-0 opacity-40"
        aria-hidden="true"
      />
      <HomeNavWithRole />
      <main className="relative z-10 w-full pb-28 pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-8 lg:px-12">
          <StoreClient initialState={state} />
        </div>
      </main>
      <HomeBottomNav />
    </div>
  );
}
