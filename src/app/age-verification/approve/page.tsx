import type { Metadata } from "next";
import { ParentApproveClient } from "@/components/auth/ParentApproveClient";

export const metadata: Metadata = {
  title: "Approve Haelo access — Haelo",
};

export default function ParentApprovePage() {
  return <ParentApproveClient />;
}
