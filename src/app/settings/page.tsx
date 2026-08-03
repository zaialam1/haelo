import type { Metadata } from "next";
import { SettingsClient } from "@/components/home/SettingsClient";

export const metadata: Metadata = {
  title: "Settings — Haelo",
  description: "Manage your Haelo appearance and account preferences.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
