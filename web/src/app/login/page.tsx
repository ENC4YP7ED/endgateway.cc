import { redirect } from "next/navigation";

import { AuthForms } from "@/components/auth-forms";
import { Icon } from "@/components/icon";
import { LcNav } from "@/components/lc-nav";
import { getCurrentSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/auth");
  }

  return (
    <>
      <LcNav signedIn={false} active="login" />
      <main className="lc-page">
        <header className="lc-page-header">
          <div>
            <span className="lc-eyebrow">
              <Icon icon="lucide:log-in" width={12} height={12} />
              Operator sign-in
            </span>
            <h1 className="lc-page-title" style={{ marginTop: 10 }}>
              Welcome back to <span className="lc-text-grad">the End</span>.
            </h1>
            <p className="lc-page-sub">
              Email and password, passkeys, and TOTP — all in one flow, behind
              Turnstile. No second app.
            </p>
          </div>
        </header>

        <AuthForms mode="login" />
      </main>
    </>
  );
}
