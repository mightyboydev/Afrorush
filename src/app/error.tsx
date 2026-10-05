"use client";

// Shows the real error on screen (useful on mobile where there's no console).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 20, fontFamily: "monospace", background: "#fff8e7", minHeight: "100vh", color: "#0b1f3a" }}>
      <h2>Something broke</h2>
      <p style={{ wordBreak: "break-word", fontWeight: 700 }}>{error.message}</p>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, wordBreak: "break-word" }}>{error.stack}</pre>
      <button onClick={reset} style={{ padding: "10px 16px", marginTop: 12 }}>Try again</button>
    </div>
  );
}
