import type { Metadata } from "next";
import { ParentPendingClient } from "@/components/auth/ParentPendingClient";

export const metadata: Metadata = {
  title: "Waiting for approval — Haelo",
};

export default function ParentPendingPage() {
  return <ParentPendingClient />;
}
