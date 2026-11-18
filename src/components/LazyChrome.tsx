"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The floating extras (Loop, page help, install prompt, offline notice) are not needed for the page to be usable, so they load
 * after it instead of before it. That shrinks the script the phone must run before buttons start answering.
 */
const LoopGuide = dynamic(() => import("@/components/guide/LoopGuide"), { ssr: false });
const TourGuideButton = dynamic(() => import("@/components/TourGuideButton"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/pwa/InstallPrompt"), { ssr: false });
const NetworkStatus = dynamic(() => import("@/components/pwa/NetworkStatus"), { ssr: false });

export default function LazyChrome() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idle: number | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
        else setReady(true);
      }, 1500);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, []);
  return (
    <>
      {ready && <TourGuideButton />}
      {ready && <LoopGuide />}
      <NetworkStatus />
      {ready && <InstallPrompt />}
    </>
  );
}
