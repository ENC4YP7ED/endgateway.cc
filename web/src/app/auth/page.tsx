import Link from "next/link";

import { SecurityCenter } from "@/components/security-center";
import { Reveal } from "@/components/reveal";
import { getCurrentSession } from "@/lib/session";

type AuthPageProps = {
  searchParams: Promise<{
    step?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [{ step }, session] = await Promise.all([searchParams, getCurrentSession()]);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8 lg:px-10">
      <div className="grain-overlay" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Reveal className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="status-pill">
              <span className={`status-dot ${session ? "approved" : "checking"}`} />
              <span>{session ? "session live" : "auth in progress"}</span>
            </div>
            <h1 className="font-[var(--font-monocraft)] text-4xl text-white md:text-5xl">
              Authentication surface
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              This route handles the post-login security center and the intermediate
              two-factor verification state.
            </p>
          </div>

          <div className="flex gap-3">
            <Link className="glass-button !px-4 !py-2.5" href="/">
              Back to landing
            </Link>
            {!session ? (
              <Link className="glass-button !px-4 !py-2.5" href="/login">
                Login
              </Link>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SecurityCenter step={step} />
        </Reveal>
      </div>
    </main>
  );
}
