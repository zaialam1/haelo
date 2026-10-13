import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue — Halo",
};

/** Parental approval is retired with the age gate. */
export default function ParentApprovePage() {
  redirect("/home");
}
