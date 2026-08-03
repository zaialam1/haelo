import type { Metadata } from "next";
import { AgeVerificationClient } from "@/components/auth/AgeVerificationClient";

export const metadata: Metadata = {
  title: "Age verification — Attune",
  description: "Confirm whether you are 13 or older to continue with Attune.",
};

export default function AgeVerificationPage() {
  return <AgeVerificationClient />;
}
