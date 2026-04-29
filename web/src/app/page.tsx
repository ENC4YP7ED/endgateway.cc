import Link from "next/link";

import { Icon } from "@/components/icon";
import { getCurrentSession } from "@/lib/session";

export default async function Home() {
  const session = await getCurrentSession();
  const signedIn = Boolean(session);

  return (
    <>
      <header className="lc-topnav">
        <div className="lc-topnav-inner">
          <div className="lc-brand">
            <span className="lc-brand-logo">
              <Icon icon="lucide:network" width={16} height={16} />
            </span>
            <span className="lc-brand-title lc-display">
              endgateway<em>.cc</em>
            </span>
          </div>
          <nav className="lc-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#trust">Security</a>
          </nav>
          <div className="lc-nav-actions">
            <span className="lc-pill on">
              <span />
              Edge online
            </span>
            {signedIn ? (
              <Link className="lc-btn lc-btn-primary lc-btn-small" href="/auth">
                <Icon icon="lucide:layout-dashboard" width={14} height={14} />
                Account
              </Link>
            ) : (
              <>
                <Link className="lc-btn lc-btn-ghost lc-btn-small" href="/login">
                  Sign in
                </Link>
                <Link className="lc-btn lc-btn-primary lc-btn-small" href="/register">
                  <Icon icon="lucide:arrow-right" width={14} height={14} />
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="lc-page">
        <section className="lc-hero">
          <div>
            <span className="lc-eyebrow">
              <Icon icon="lucide:sparkles" width={12} height={12} />
              Minecraft tunnel router
            </span>
            <h1 className="lc-h1">
              Ship your world to{" "}
              <span className="lc-text-grad">the End</span> in seconds.
            </h1>
            <p className="lc-sub">
              Self-hosted control plane with mTLS-secured yamux tunnels, public TCP
              + UDP for vanilla and Simple Voice Chat, no port forwarding, no
              router config.
            </p>
            <div className="lc-hero-actions">
              <Link
                className="lc-btn lc-btn-primary lc-btn-large"
                href={signedIn ? "/auth" : "/register"}
              >
                <Icon icon="lucide:zap" width={16} height={16} />
                {signedIn ? "Open dashboard" : "Open a portal"}
              </Link>
              <a className="lc-btn lc-btn-ghost lc-btn-large" href="#how">
                <Icon icon="lucide:book-open" width={16} height={16} />
                How it works
              </a>
            </div>
            <div className="lc-hero-stats">
              <div className="lc-stat">
                <span className="lc-stat-k">Ports</span>
                <span className="lc-stat-v">10k</span>
                <span className="lc-stat-c">50000–60000</span>
              </div>
              <div className="lc-stat">
                <span className="lc-stat-k">Transport</span>
                <span className="lc-stat-v">mTLS</span>
                <span className="lc-stat-c">TLS 1.3 + yamux</span>
              </div>
              <div className="lc-stat">
                <span className="lc-stat-k">Edge</span>
                <span className="lc-stat-v">FRA</span>
                <span className="lc-stat-c">Cloudflare-fronted</span>
              </div>
            </div>
          </div>

          <div className="lc-term">
            <div className="lc-term-bar">
              <span className="lc-term-dot r" />
              <span className="lc-term-dot y" />
              <span className="lc-term-dot g" />
              <span className="lc-term-name">~/endgateway</span>
            </div>
            <pre className="lc-term-body">
              <span className="mu"># start the agent on your host</span>
              {"\n"}
              <span className="pp">$</span> endgateway up{" "}
              <span className="am">--world survival</span>
              {"\n"}
              <span className="ok">tunnel established</span>{" "}
              <span className="mu">id=ad81…f02</span>
              {"\n"}
              <span className="ok">tcp</span>{" "}
              <span className="gn">play.endgateway.cc:54213</span>
              {"\n"}
              <span className="ok">udp</span>{" "}
              <span className="gn">voice.endgateway.cc:54213</span>
              {"\n"}
              <span className="mu"># share with friends, no router setup</span>
            </pre>
          </div>
        </section>

        <section className="lc-section" id="features">
          <div className="lc-section-head">
            <span className="lc-eyebrow">
              <Icon icon="lucide:layers" width={12} height={12} />
              Built for vanilla & modded
            </span>
            <h2 className="lc-h2">Everything a Minecraft host needs.</h2>
          </div>
          <div className="lc-grid-3">
            <article className="lc-card">
              <span className="lc-card-icon">
                <Icon icon="lucide:shield-check" width={20} height={20} />
              </span>
              <h3 className="lc-h3">mTLS identity</h3>
              <p>
                Every agent is a TLS 1.3 client cert. CN is identity, no shared
                secrets, no token leaks.
              </p>
            </article>
            <article className="lc-card">
              <span className="lc-card-icon green">
                <Icon icon="lucide:radio" width={20} height={20} />
              </span>
              <h3 className="lc-h3">TCP + UDP framed</h3>
              <p>
                Minecraft Java and Simple Voice Chat ride one yamux session with
                length-prefixed UDP, no PROXY-protocol breakage.
              </p>
            </article>
            <article className="lc-card">
              <span className="lc-card-icon amber">
                <Icon icon="lucide:gauge" width={20} height={20} />
              </span>
              <h3 className="lc-h3">Host networking</h3>
              <p>
                10k port range bound directly on the edge node. No docker-proxy
                bottleneck, no userland NAT.
              </p>
            </article>
          </div>
        </section>

        <section className="lc-section" id="how">
          <div className="lc-section-head">
            <span className="lc-eyebrow">
              <Icon icon="lucide:route" width={12} height={12} />
              Three steps
            </span>
            <h2 className="lc-h2">From localhost to public in under a minute.</h2>
          </div>
          <ol className="lc-steps">
            <li>
              <span className="lc-step-n">1</span>
              <div className="lc-step-body">
                <strong>Issue an agent cert</strong>
                <span>
                  Sign in, claim a slug, download your mTLS bundle. One-shot.
                </span>
              </div>
            </li>
            <li>
              <span className="lc-step-n">2</span>
              <div className="lc-step-body">
                <strong>Run the agent next to your server</strong>
                <span>
                  Single Go binary. Dials the edge over yamux, advertises your TCP
                  and UDP ports.
                </span>
              </div>
            </li>
            <li>
              <span className="lc-step-n">3</span>
              <div className="lc-step-body">
                <strong>Share the address</strong>
                <span>
                  Edge allocates a sticky public port, returns a hostname your
                  friends drop straight into Minecraft.
                </span>
              </div>
            </li>
          </ol>
        </section>

        <section className="lc-trust" id="trust">
          <div>
            <h2 className="lc-h2">Account security baked in.</h2>
            <p className="lc-sub">
              Better Auth, passkeys, TOTP, Turnstile. Your tunnel is only as safe
              as the account that opens it.
            </p>
          </div>
          <Link
            className="lc-btn lc-btn-primary lc-btn-large"
            href={signedIn ? "/auth" : "/register"}
          >
            <Icon icon="lucide:lock" width={16} height={16} />
            {signedIn ? "Security center" : "Create account"}
          </Link>
        </section>

        <footer className="lc-footer">
          <span>© {new Date().getFullYear()} endgateway.cc</span>
          <div className="lc-footer-links">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Sign up</Link>
            <a href="https://github.com" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
