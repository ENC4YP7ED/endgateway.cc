import { redirect } from "next/navigation";

import { AuthForms } from "@/components/auth-forms";
import { Icon } from "@/components/icon";
import { LcNav } from "@/components/lc-nav";
import { getCurrentSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/auth");
  }

  return (
    <>
      <LcNav signedIn={false} active="register" />
      <main className="lc-page">
        <header className="lc-page-header">
          <div>
            <span className="lc-eyebrow">
              <Icon icon="lucide:user-plus" width={12} height={12} />
              Operator onboarding
            </span>
            <h1 className="lc-page-title" style={{ marginTop: 10 }}>
              Open your <span className="lc-text-grad">portal</span> in seconds.
            </h1>
            <p className="lc-page-sub">
              Create an operator account, then harden it from the security
              center with a passkey and TOTP before opening any public edge.
            </p>
          </div>
        </header>

        <AuthForms mode="register" />
      </main>
    </>
  );
}
