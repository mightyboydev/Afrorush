"use client";

// src/app/location/page.tsx — Redirects to /hub (locations are now overlays in the hub).

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/hub"); }, [router]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-rush-cream">
      <div className="text-sm text-rush-navy/50">Redirecting to hub…</div>
    </main>
  );
}
