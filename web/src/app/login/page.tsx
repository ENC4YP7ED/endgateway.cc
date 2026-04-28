import { redirect } from "next/navigation";

import { AuthForms } from "@/components/auth-forms";
import { Reveal } from "@/components/reveal";
import { getCurrentSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/auth");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8 lg:px-10">
      <div className="grain-overlay" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal className="space-y-6">
          <div className="status-pill">
            <span className="status-dot approved" />
            <span>operator sign-in</span>
          </div>
          <h1 className="font-[var(--font-monocraft)] text-5xl leading-tight text-white md:text-6xl">
            Sign in through the glass, not around it.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
            Password access is challenge-protected, passkeys are first-class, and
            TOTP remains in the same flow rather than breaking the user into a second
            application.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <AuthForms mode="login" />
        </Reveal>
      </div>
    </main>
  );
}
