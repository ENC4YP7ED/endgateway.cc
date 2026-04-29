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
        <section className="lc-auth">
          <div>
            <span className="lc-eyebrow">
              <Icon icon="lucide:log-in" width={12} height={12} />
              Operator sign-in
            </span>
            <h1 className="lc-h1">
              Welcome back to <span className="lc-text-grad">the End</span>.
            </h1>
            <p className="lc-sub" style={{ marginTop: 12, maxWidth: 420 }}>
              Email and password, passkeys, and TOTP all live in the same flow,
              behind Turnstile. No second app required.
            </p>
          </div>
          <AuthForms mode="login" />
        </section>
      </main>
    </>
  );
}
