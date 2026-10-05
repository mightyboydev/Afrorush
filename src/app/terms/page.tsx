// src/app/terms/page.tsx — Terms of Service.

import Link from "next/link";

export const metadata = {
  title: "Terms of Service — AfroRush",
  description: "The rules of the AfroRush streets.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-rush-cream px-4 py-8 safe-pt safe-pb">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm font-bold uppercase tracking-wider text-rush-navy/60 hover:text-rush-navy">
          ← Back to AfroRush
        </Link>
        <h1 className="font-display text-3xl text-rush-navy">Terms of Service</h1>
        <p className="mt-1 text-xs text-rush-navy/50">Last updated: October 2026</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-rush-navy/80">
          <Section title="1. Welcome to the streets">
            By playing AfroRush, you agree to these terms. AfroRush is a free-to-play 3D African street-culture game.
            You must be 13+ to play. If you break the rules, we may suspend or ban your account.
          </Section>

          <Section title="2. Your account">
            <ul className="ml-4 list-disc space-y-1">
              <li>One account per person. No sharing or selling accounts.</li>
              <li>Use your real email. We use it for password recovery and important notifications.</li>
              <li>You are responsible for everything done from your account.</li>
              <li>Keep your password secret. We will never ask for it.</li>
            </ul>
          </Section>

          <Section title="3. Fair play">
            <ul className="ml-4 list-disc space-y-1">
              <li>No cheating, hacking, or exploiting bugs.</li>
              <li>No bots, macros, or automated tools.</li>
              <li>No selling in-game currency or items for real money (Naira, gold, or items).</li>
              <li>No abusive, hateful, or sexual content in names, chat, or crew names.</li>
              <li>No impersonating admins, moderators, or other players.</li>
            </ul>
            Breaking these rules may result in a warning, mute, temporary ban, or permanent ban.
          </Section>

          <Section title="4. In-game currency">
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Naira (₦)</strong> is the in-game currency earned by playing.</li>
              <li><strong>Gold (🪙)</strong> is the premium currency, given daily or purchasable later.</li>
              <li>Both currencies have no real-world value and cannot be exchanged for real money.</li>
              <li>If your account is banned, all currency and items are forfeit.</li>
            </ul>
          </Section>

          <Section title="5. User content">
            You may create content in AfroRush (rider name, crew name, chat messages).
            You grant us a licence to display this content in the game. You must not post content that
            is illegal, hateful, or infringes someone else&apos;s rights.
          </Section>

          <Section title="6. Acceptable use of chat">
            Chat is for friendly conversation. No spamming, no advertising, no sharing personal info,
            no harassment. Admins can mute or ban players who break these rules. Every message can be reported.
          </Section>

          <Section title="7. Limitation of liability">
            AfroRush is provided &ldquo;as is&rdquo;. We are not liable for any lost items, lost progress,
            or downtime. We will do our best to keep the game running, but we cannot guarantee 100% uptime.
          </Section>

          <Section title="8. Changes to these terms">
            We may update these terms. We will notify players in-game of major changes.
            Continued play after changes means you accept the new terms.
          </Section>

          <Section title="9. Governing law">
            These terms are governed by the laws of the Federal Republic of Nigeria.
            Disputes will be resolved in Nigerian courts.
          </Section>

          <Section title="10. Contact">
            Questions? Email <a href="mailto:legal@afrorush.game" className="text-rush-green underline">legal@afrorush.game</a>.
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
