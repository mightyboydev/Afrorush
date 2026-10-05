// src/app/privacy/page.tsx — Privacy Policy (Nigerian NDPA-friendly).

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — AfroRush",
  description: "How AfroRush collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-rush-cream px-4 py-8 safe-pt safe-pb">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm font-bold uppercase tracking-wider text-rush-navy/60 hover:text-rush-navy">
          ← Back to AfroRush
        </Link>
        <h1 className="font-display text-3xl text-rush-navy">Privacy Policy</h1>
        <p className="mt-1 text-xs text-rush-navy/50">Last updated: October 2026</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-rush-navy/80">
          <Section title="1. Who we are">
            AfroRush (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a 3D African street-culture game built in Nigeria.
            We respect your privacy and comply with the Nigerian Data Protection Act (NDPA) 2023.
          </Section>

          <Section title="2. What we collect">
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Account data:</strong> your email address, rider name, and avatar.</li>
              <li><strong>Game data:</strong> your rep, cash, gold, loadout, high scores, and crew membership.</li>
              <li><strong>Presence data:</strong> whether you are online (so other players can see you).</li>
              <li><strong>Device data:</strong> browser type and approximate location (city-level) for fraud prevention.</li>
            </ul>
            We do <strong>not</strong> collect payment card details — AfroRush is free to play.
          </Section>

          <Section title="3. How we use it">
            <ul className="ml-4 list-disc space-y-1">
              <li>To create and manage your account.</li>
              <li>To save your game progress across devices.</li>
              <li>To show other players you are online and let you see them.</li>
              <li>To prevent cheating, fraud, and abuse.</li>
              <li>To send you in-game notifications (rewards, warnings, crew invites).</li>
            </ul>
          </Section>

          <Section title="4. Who we share it with">
            We use Firebase (Google) for authentication and data storage. Your data is stored on Google servers.
            We do not sell your data to anyone. We only share data with authorities if required by Nigerian law.
          </Section>

          <Section title="5. Your rights under NDPA">
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Access:</strong> you can see all your data in Phone → Settings.</li>
              <li><strong>Correction:</strong> you can change your rider name and avatar any time.</li>
              <li><strong>Deletion:</strong> you can delete your account from Phone → Settings → Delete Account.</li>
              <li><strong>Withdrawal:</strong> you can log out at any time. Your presence data is cleared immediately.</li>
            </ul>
            To exercise any of these rights, email <a href="mailto:privacy@afrorush.game" className="text-rush-green underline">privacy@afrorush.game</a>.
          </Section>

          <Section title="6. Data retention">
            We keep your account data for as long as your account is active. If you don&apos;t log in for 2 years,
            we may delete your account. Admin logs are kept for 1 year for audit purposes.
          </Section>

          <Section title="7. Children">
            AfroRush is for players 13+. We do not knowingly collect data from children under 13.
            If you believe a child under 13 has an account, contact us and we will delete it.
          </Section>

          <Section title="8. Contact">
            Questions? Email <a href="mailto:privacy@afrorush.game" className="text-rush-green underline">privacy@afrorush.game</a>.
          </Section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-rush-navy/50 hover:text-rush-navy">
            ← Back to AfroRush
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg text-rush-navy">{title}</h2>
      <div className="text-sm text-rush-navy/70">{children}</div>
    </section>
  );
}
