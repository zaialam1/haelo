import type { Metadata } from "next";
import { ParentEmailClient } from "@/components/auth/ParentEmailClient";

export const metadata: Metadata = {
  title: "Parent permission — Haelo",
};

export default function ParentEmailPage() {
  return <ParentEmailClient />;
}
