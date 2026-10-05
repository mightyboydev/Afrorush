"use client";

// src/components/CookieConsent.tsx — Simple essential-only cookie banner.

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("afrorush:cookie-consent");
      if (!consent) setShow(true);
    } catch { /* ignore */ }
  }, []);

  const accept = () => {
    try { localStorage.setItem("afrorush:cookie-consent", "accepted"); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rush-bounce-in rush-glass rounded-3xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🍪</span>
          <div className="flex-1">
            <div className="text-sm font-bold text-rush-navy">Cookies</div>
            <p className="mt-0.5 text-xs text-rush-navy/60">
              We use essential cookies to keep you logged in and save your game.
              No tracking, no ads. See our{" "}
              <a href="/privacy" className="text-rush-green underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
        <button
          onClick={accept}
          className="mt-3 w-full rounded-2xl bg-rush-green px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rush-green/30 active:scale-95"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
