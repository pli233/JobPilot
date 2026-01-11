import { getPreferences } from "@/lib/actions/config";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const preferences = await getPreferences();
  return <SettingsClient initialPreferences={preferences} />;
}
