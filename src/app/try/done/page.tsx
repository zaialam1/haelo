import type { Metadata } from "next";
import { GuestDoneClient } from "@/components/try/GuestDoneClient";

export const metadata: Metadata = {
  title: "Thanks for trying Halo",
  description: "Try another question, create an account, or leave whenever you want.",
};

type PageProps = {
  searchParams: Promise<{ skipped?: string }>;
};

export default async function GuestDonePage({ searchParams }: PageProps) {
  const { skipped } = await searchParams;

  return (
    <main
      className="min-h-dvh"
      style={{ background: "var(--universe-map)" }}
    >
      <GuestDoneClient skipped={skipped === "1"} />
    </main>
  );
}
