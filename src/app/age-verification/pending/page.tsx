import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue — Halo",
};

/** Parental consent wait screen is retired with the age gate. */
export default function ParentPendingPage() {
  redirect("/home");
}
