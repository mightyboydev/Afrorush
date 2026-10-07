"use client";

// src/components/CookieConsent.tsx — Lagos Life-style cookie banner.
// Floats above bottom dock (bottom-[150px]) with two-button choice:
// "Essential only" (secondary) / "Accept" (primary green). 🍪 emoji.

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("afrorush:cookie-consent");
      if (!consent) setShow(true);
    } catch { /* ignore */ }
  }, []);

  const accept = (mode: "essential" | "accepted") => {
    try { localStorage.setItem("afrorush:cookie-consent", mode); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-[150px] z-[60] mx-auto max-w-md px-3 md:left-4 md:right-auto md:max-w-sm">
      <div className="panel rush-glass rush-bounce-in rounded-[22px] p-4 text-sm shadow-[0_12px_40px_rgba(22,32,60,0.2)]">
        <div className="flex gap-2.5">
          <span className="text-xl">🍪</span>
          <div className="flex-1">
            <p className="text-xs leading-relaxed text-rush-ink">
              We use a cookie to keep you signed in, and another to count visits.
              No ad trackers, ever.{" "}
              <a
                href="/privacy"
                className="font-semibold text-rush-lagoon underline-offset-2 hover:underline"
              >
                Privacy
              </a>
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => accept("essential")}
            className="btn-press rounded-full bg-rush-mist px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-rush-ink"
          >
            Essential only
          </button>
          <button
            onClick={() => accept("accepted")}
            className="btn-press rounded-full bg-rush-leaf px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_6px_16px_-6px_rgba(34,181,115,0.7)]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
