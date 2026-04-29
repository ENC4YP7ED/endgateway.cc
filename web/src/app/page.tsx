import Link from "next/link";

import { Icon } from "@/components/icon";
import { LcNav } from "@/components/lc-nav";
import { getCurrentSession } from "@/lib/session";

export default async function Home() {
  const session = await getCurrentSession();
  const signedIn = Boolean(session);

  return (
    <>
      <LcNav signedIn={signedIn} active="home" />

      <main className="lc-page">
        <header className="lc-page-header">
          <div>
            <span className="lc-eyebrow">
              <Icon icon="lucide:sparkles" width={12} height={12} />
              Minecraft tunnel router
            </span>
            <h1 className="lc-page-title" style={{ marginTop: 10 }}>
              Ship your world to{" "}
              <span className="lc-text-grad">the End</span> in seconds.
            </h1>
            <p className="lc-page-sub">
              Self-hosted control plane with mTLS-secured yamux tunnels, public
              TCP and UDP for vanilla and Simple Voice Chat. No port forwarding,
              no router config.
            </p>
          </div>
          <div className="lc-page-actions">
            <a className="lc-btn lc-btn-ghost lc-btn-small" href="#how">
              <Icon icon="lucide:book-open" width={14} height={14} />
              How it works
            </a>
            <Link
              className="lc-btn lc-btn-primary lc-btn-small"
              href={signedIn ? "/auth" : "/register"}
            >
              <Icon icon="lucide:zap" width={14} height={14} />
              {signedIn ? "Open dashboard" : "Open a portal"}
            </Link>
          </div>
        </header>

        <nav className="lc-tabbar" aria-label="Sections">
          <a className="lc-tab active" href="#overview">
            <Icon icon="lucide:layout-dashboard" width={14} height={14} />
            Overview
          </a>
          <a className="lc-tab" href="#features">
            <Icon icon="lucide:layers" width={14} height={14} />
            Features
          </a>
          <a className="lc-tab" href="#how">
            <Icon icon="lucide:route" width={14} height={14} />
            How it works
          </a>
          <a className="lc-tab" href="#trust">
            <Icon icon="lucide:shield" width={14} height={14} />
            Security
          </a>
        </nav>

        <section className="lc-block" id="overview">
          <div className="lc-card-head">
            <div className="lc-card-head-l">
              <span className="lc-card-head-icon purple">
                <Icon icon="lucide:terminal" width={18} height={18} />
              </span>
              <div className="lc-card-head-text">
                <div className="lc-card-head-title">Live edge example</div>
                <div className="lc-card-head-desc">
                  One command, public TCP and UDP, no router setup
                </div>
              </div>
            </div>
            <span className="lc-pill on">
              <span />
              FRA · 50000–60000
            </span>
          </div>
          <div className="lc-card-body" style={{ padding: 0 }}>
            <div className="lc-term" style={{ border: 0, borderRadius: 0 }}>
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
                <span className="gn">--world survival</span>
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
          </div>
          <div className="lc-stat-row">
            <div className="lc-stat-cell">
              <span className="k">Ports</span>
              <span className="v">10k</span>
              <span className="c">50000–60000 reserved</span>
            </div>
            <div className="lc-stat-cell">
              <span className="k">Transport</span>
              <span className="v">mTLS</span>
              <span className="c">TLS 1.3 + yamux</span>
            </div>
            <div className="lc-stat-cell">
              <span className="k">Edge</span>
              <span className="v">FRA</span>
              <span className="c">Cloudflare-fronted control</span>
            </div>
          </div>
        </section>

        <section className="lc-block" id="features">
          <div className="lc-card-head">
            <div className="lc-card-head-l">
              <span className="lc-card-head-icon green">
                <Icon icon="lucide:layers" width={18} height={18} />
              </span>
              <div className="lc-card-head-text">
                <div className="lc-card-head-title">Built for vanilla and modded</div>
                <div className="lc-card-head-desc">
                  TCP and UDP framed over a single yamux session
                </div>
              </div>
            </div>
          </div>
          <div className="lc-feat-grid">
            <article className="lc-feat">
              <span className="lc-feat-icon">
                <Icon icon="lucide:shield-check" width={16} height={16} />
              </span>
              <div className="lc-feat-title">mTLS identity</div>
              <p className="lc-feat-desc">
                Every agent is a TLS 1.3 client cert. CN is identity, no shared
                secrets, no token leaks.
              </p>
            </article>
            <article className="lc-feat">
              <span className="lc-feat-icon green">
                <Icon icon="lucide:radio" width={16} height={16} />
              </span>
              <div className="lc-feat-title">TCP + UDP framed</div>
              <p className="lc-feat-desc">
                Vanilla Minecraft and Simple Voice Chat share one yamux session
                with length-prefixed UDP, no PROXY-protocol breakage.
              </p>
            </article>
            <article className="lc-feat">
              <span className="lc-feat-icon">
                <Icon icon="lucide:gauge" width={16} height={16} />
              </span>
              <div className="lc-feat-title">Host networking</div>
              <p className="lc-feat-desc">
                10k ports bound directly on the edge node. No docker-proxy
                bottleneck, no userland NAT.
              </p>
            </article>
          </div>
        </section>

        <section className="lc-block" id="how">
          <div className="lc-card-head">
            <div className="lc-card-head-l">
              <span className="lc-card-head-icon purple">
                <Icon icon="lucide:route" width={18} height={18} />
              </span>
              <div className="lc-card-head-text">
                <div className="lc-card-head-title">From localhost to public</div>
                <div className="lc-card-head-desc">Three steps, under a minute</div>
              </div>
            </div>
          </div>
          <div className="lc-card-body">
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
                    Single Go binary. Dials the edge over yamux, advertises your
                    TCP and UDP ports.
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
          </div>
        </section>

        <section className="lc-block" id="trust">
          <div className="lc-card-head">
            <div className="lc-card-head-l">
              <span className="lc-card-head-icon green">
                <Icon icon="lucide:shield" width={18} height={18} />
              </span>
              <div className="lc-card-head-text">
                <div className="lc-card-head-title">Account security baked in</div>
                <div className="lc-card-head-desc">
                  Better Auth, passkeys, TOTP, Turnstile
                </div>
              </div>
            </div>
            <Link
              className="lc-btn lc-btn-primary lc-btn-small"
              href={signedIn ? "/auth" : "/register"}
            >
              <Icon icon="lucide:lock" width={14} height={14} />
              {signedIn ? "Security center" : "Create account"}
            </Link>
          </div>
          <div className="lc-card-body">
            <p className="lc-feat-desc">
              Your tunnel is only as safe as the account that opens it. Passkeys
              are first-class, TOTP lives in the same flow, and Turnstile gates
              every credential attempt.
            </p>
          </div>
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
