import Link from "next/link";

import { Icon } from "@/components/icon";
import { LcNav } from "@/components/lc-nav";
import { SecurityCenter } from "@/components/security-center";
import { getCurrentSession } from "@/lib/session";

type AuthPageProps = {
  searchParams: Promise<{
    step?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [{ step }, session] = await Promise.all([
    searchParams,
    getCurrentSession(),
  ]);
  const signedIn = Boolean(session);

  return (
    <>
      <LcNav signedIn={signedIn} active="auth" />
      <main className="lc-page">
        <section className="lc-section" style={{ marginBlock: 0 }}>
          <div
            className="lc-section-head"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              maxWidth: "none",
            }}
          >
            <div>
              <span className={`lc-pill ${signedIn ? "on" : "purple"}`}>
                <span />
                {signedIn ? "Session live" : "Auth in progress"}
              </span>
              <h1 className="lc-h1" style={{ marginTop: 14 }}>
                Authentication <span className="lc-text-grad">surface</span>
              </h1>
              <p className="lc-sub" style={{ marginTop: 10, maxWidth: 620 }}>
                Post-login security center and intermediate two-factor flow.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {!signedIn ? (
                <Link className="lc-btn lc-btn-ghost lc-btn-small" href="/login">
                  <Icon icon="lucide:log-in" width={14} height={14} />
                  Sign in
                </Link>
              ) : null}
              <Link className="lc-btn lc-btn-small" href="/">
                <Icon icon="lucide:arrow-left" width={14} height={14} />
                Landing
              </Link>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <SecurityCenter step={step} />
          </div>
        </section>
      </main>
    </>
  );
}
