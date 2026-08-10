import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Professional — Haelo",
  description: "Haelo professional tools.",
};

/** Back-compat: Professional Mode home now lives at /professional */
export default function ProfessionalHomeRedirect() {
  redirect("/professional");
}
