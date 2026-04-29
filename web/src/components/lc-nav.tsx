import Link from "next/link";

import { Icon } from "@/components/icon";

type LcNavProps = {
  signedIn: boolean;
  active?: "home" | "login" | "register" | "auth";
};

export function LcNav({ signedIn, active }: LcNavProps) {
  return (
    <header className="lc-topnav">
      <div className="lc-topnav-inner">
        <Link className="lc-brand" href="/">
          <span className="lc-brand-logo">
            <Icon icon="lucide:network" width={16} height={16} />
          </span>
          <span className="lc-brand-title lc-display">
            endgateway<em>.cc</em>
          </span>
        </Link>
        <nav className="lc-nav-links">
          <a href="/#features">Features</a>
          <a href="/#how">How it works</a>
          <a href="/#trust">Security</a>
        </nav>
        <div className="lc-nav-actions">
          <span className="lc-pill on">
            <span />
            Edge online
          </span>
          {signedIn ? (
            <Link
              className="lc-btn lc-btn-primary lc-btn-small"
              href="/auth"
              aria-current={active === "auth" ? "page" : undefined}
            >
              <Icon icon="lucide:layout-dashboard" width={14} height={14} />
              Account
            </Link>
          ) : (
            <>
              <Link
                className="lc-btn lc-btn-ghost lc-btn-small"
                href="/login"
                aria-current={active === "login" ? "page" : undefined}
              >
                Sign in
              </Link>
              <Link
                className="lc-btn lc-btn-primary lc-btn-small"
                href="/register"
                aria-current={active === "register" ? "page" : undefined}
              >
                <Icon icon="lucide:arrow-right" width={14} height={14} />
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
