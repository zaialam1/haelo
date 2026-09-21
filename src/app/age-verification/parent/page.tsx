import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue — Haelo",
};

/** Parent email consent is retired with the age gate. */
export default function ParentEmailPage() {
  redirect("/home");
}
