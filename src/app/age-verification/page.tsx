import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue — Haelo",
  description: "Continue into Haelo.",
};

/** Age verification is no longer required — send people into the app. */
export default function AgeVerificationPage() {
  redirect("/home");
}
