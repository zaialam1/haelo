import type { Metadata } from "next";
import { AgeVerificationClient } from "@/components/auth/AgeVerificationClient";

export const metadata: Metadata = {
  title: "Age verification — Haelo",
  description: "Confirm whether you are 13 or older to continue with Haelo.",
};

export default function AgeVerificationPage() {
  return <AgeVerificationClient />;
}
