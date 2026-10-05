"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ padding: 20, fontFamily: "monospace", background: "#fff8e7", color: "#0b1f3a" }}>
        <h2>Something broke</h2>
        <p style={{ wordBreak: "break-word", fontWeight: 700 }}>{error.message}</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, wordBreak: "break-word" }}>{error.stack}</pre>
      </body>
    </html>
  );
}
