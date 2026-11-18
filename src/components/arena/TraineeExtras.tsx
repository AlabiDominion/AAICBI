"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSessionSummary } from "@/components/useSessionSummary";

const ArenaReturnPill = dynamic(() => import("./ArenaReturnPill"), { ssr: false });
const ChatAlerts = dynamic(() => import("./ChatAlerts"), { ssr: false });

/** Guests and other roles don't download trainee widgets or call their APIs. */
export default function TraineeExtras() {
  const pathname = usePathname() ?? "/";
  const session = useSessionSummary(pathname);
  if (!session?.signedIn || session.role !== "TRAINEE") return null;
  return <><ArenaReturnPill /><ChatAlerts /></>;
}
