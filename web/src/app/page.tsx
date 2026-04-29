import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { getCurrentSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getCurrentSession();
  const ctaPrimaryHref = session ? "/auth" : "/register";
  const ctaSecondaryHref = session ? "/auth" : "/login";
  const ctaPrimaryLabel = session ? "Re-enter the End" : "Open a portal";
  const ctaSecondaryLabel = session ? "Account console" : "I already have a key";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="end-void" aria-hidden />
      <div className="end-stars" aria-hidden />
      <div className="grain-overlay" aria-hidden />
      <FloatingIslands />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <PortalGlyph className="h-9 w-9" />
          <span className="font-[var(--font-monocraft)] text-base tracking-[0.18em] text-white/90">
            endgateway<span className="text-[var(--accent)]">.cc</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
          <a href="#features" className="hover:text-white">Realms</a>
          <a href="#how" className="hover:text-white">Portal mechanics</a>
          <a href="#trust" className="hover:text-white">Obsidian guard</a>
          <Link
            href={ctaSecondaryHref}
            className="rounded-full border border-[var(--stroke)] px-4 py-1.5 text-white/90 hover:border-[var(--accent)] hover:text-white"
          >
            {ctaSecondaryLabel}
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
        <Reveal className="space-y-7">
          <div className="status-pill">
            <span className="status-dot approved" />
            <span>portal stabilised · mTLS &amp; voice carried</span>
          </div>
          <h1 className="font-[var(--font-monocraft)] text-5xl leading-[1.05] text-white md:text-6xl lg:text-7xl">
            Open the
            <span className="end-text-glow"> End Portal </span>
            to your server.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
            endgateway.cc routes Java edition Minecraft and Simple Voice Chat through
            a hardened gateway running on dedicated end-stone. No router fiddling, no
            exposed home IP, no broken voice. Just one address — and the portal opens.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={ctaPrimaryHref} className="end-cta-primary">
              <span>{ctaPrimaryLabel}</span>
              <PortalGlyph className="h-4 w-4" />
            </Link>
            <Link href={ctaSecondaryHref} className="end-cta-ghost">
              {ctaSecondaryLabel}
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-6 pt-6 text-left">
            <Stat label="latency" value="<5ms" caption="agent ↔ gateway" />
            <Stat label="uptime" value="99.95%" caption="rolling 30d" />
            <Stat label="ports forwarded" value="0" caption="on your router" />
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <PortalArt />
        </Reveal>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 md:px-10">
        <Reveal className="mb-12 max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
            three realms, one gateway
          </p>
          <h2 className="font-[var(--font-monocraft)] text-3xl text-white md:text-4xl">
            Built from end-stone, lit by ender pearls.
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            kind="pearl"
            title="Ender pearl routing"
            body="Outbound mTLS tunnel from your home agent to the VPS. Port-mapping happens server-side, sticky to your server id between sessions."
          />
          <Feature
            kind="obsidian"
            title="Obsidian-fortified auth"
            body="Better-Auth backbone with passkeys, TOTP and Cloudflare Turnstile. No password reuse paths through the dragon arena."
          />
          <Feature
            kind="chorus"
            title="Chorus-bloom voice"
            body="Simple Voice Chat datagrams carried framed over yamux. No shredding, no phantom packet loss in the void."
          />
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 md:px-10">
        <div className="end-portal-grid">
          <Reveal className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
              portal mechanics
            </p>
            <h2 className="font-[var(--font-monocraft)] text-3xl text-white md:text-4xl">
              Twelve eyes you don&apos;t have to find.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
              Every server gets a stable public address, a matched UDP port for voice,
              and a heartbeat-driven cleanup loop so dormant tunnels collapse instead
              of squatting your allocation.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ol className="end-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Run the agent.</strong> One binary on your gameplay machine
                  loads the issued client certificate.
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Agent dials home.</strong> Outbound TLS 1.3 + yamux to the
                  gateway — no ingress on your router needed.
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Portal frame lights.</strong> A matched TCP/UDP pair is
                  allocated, DNS is updated, and the address is yours.
                </div>
              </li>
              <li>
                <span>4</span>
                <div>
                  <strong>Friends step through.</strong> Vanilla client, voice chat,
                  done.
                </div>
              </li>
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="trust" className="relative z-10 mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <Reveal className="end-bedrock">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
              obsidian guard
            </p>
            <h2 className="font-[var(--font-monocraft)] text-3xl text-white md:text-4xl">
              Enderdragon-grade hardening.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
              mTLS pinning end-to-end, sandboxed read-only containers, no privileged
              capabilities, length-prefixed UDP framing so voice cannot smuggle
              malformed payloads, and rate-limited control plane.
            </p>
          </div>
          <Link href={ctaPrimaryHref} className="end-cta-primary self-start">
            <span>{ctaPrimaryLabel}</span>
            <PortalGlyph className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--stroke)] pt-6 text-xs text-[var(--muted)] md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} endgateway.cc — built in the End.</span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-white">login</Link>
            <Link href="/register" className="hover:text-white">register</Link>
            <a
              href="https://github.com/ENC4YP7ED/endgateway.cc"
              className="hover:text-white"
            >
              source
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="end-stat">
      <dt className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 font-[var(--font-monocraft)] text-2xl text-white">{value}</dd>
      <dd className="text-[11px] text-[var(--muted)]">{caption}</dd>
    </div>
  );
}

function Feature({ kind, title, body }: { kind: "pearl" | "obsidian" | "chorus"; title: string; body: string }) {
  return (
    <article className={`end-feature end-feature-${kind}`}>
      <div className={`end-feature-glyph end-feature-glyph-${kind}`} aria-hidden />
      <h3 className="font-[var(--font-monocraft)] text-xl text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
    </article>
  );
}

function PortalGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="12" cy="12" r="5" fill="url(#endPortalGradient)" />
      <circle cx="9" cy="10" r="0.6" fill="#cdeaff" />
      <circle cx="14" cy="11" r="0.5" fill="#9bffcf" />
      <circle cx="11" cy="14" r="0.4" fill="#ffffff" />
      <defs>
        <radialGradient id="endPortalGradient" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#1a0d3d" />
          <stop offset="60%" stopColor="#0a0420" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function PortalArt() {
  return (
    <div className="end-portal-art">
      <div className="end-portal-frame">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`eye eye-${i}`} />
        ))}
        <div className="end-portal-core">
          <div className="end-portal-stars" />
        </div>
      </div>
      <div className="end-portal-base" />
    </div>
  );
}

function FloatingIslands() {
  return (
    <div className="end-islands" aria-hidden>
      <div className="island island-a" />
      <div className="island island-b" />
      <div className="island island-c" />
    </div>
  );
}
