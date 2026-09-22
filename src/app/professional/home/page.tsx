import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Professional — Halo",
  description: "Halo professional tools.",
};

/** Back-compat: Professional Mode home now lives at /professional */
export default function ProfessionalHomeRedirect() {
  redirect("/professional");
}
