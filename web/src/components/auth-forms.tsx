"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icon";
import {
  TurnstileGate,
  type TurnstileGateHandle,
} from "@/components/turnstile-gate";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type AuthFormsProps = {
  mode: AuthMode;
};

export function AuthForms({ mode }: AuthFormsProps) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileGateHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const submitCredentials = () => {
    startTransition(async () => {
      try {
        setError(null);
        const turnstileToken = await turnstileRef.current?.execute();

        if (!turnstileToken) {
          throw new Error("Security verification did not produce a token.");
        }

        if (mode === "login") {
          const result = await authClient.signIn.email({
            email: loginEmail,
            password: loginPassword,
            fetchOptions: {
              headers: {
                "x-captcha-response": turnstileToken,
              },
            },
          });

          if (result.error) {
            throw new Error(result.error.message || "Unable to sign in.");
          }

          router.push("/auth");
          router.refresh();
          return;
        }

        const result = await authClient.signUp.email({
          name,
          email: registerEmail,
          password: registerPassword,
          fetchOptions: {
            headers: {
              "x-captcha-response": turnstileToken,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message || "Unable to create account.");
        }

        router.push("/auth");
        router.refresh();
      } catch (issue) {
        const message =
          issue instanceof Error ? issue.message : "Authentication failed.";
        setError(message);
      }
    });
  };

  const signInWithPasskey = () => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await authClient.signIn.passkey();

        if (result.error) {
          throw new Error(result.error.message || "Passkey sign-in failed.");
        }

        router.push("/auth");
        router.refresh();
      } catch (issue) {
        const message =
          issue instanceof Error ? issue.message : "Passkey sign-in failed.";
        setError(message);
      }
    });
  };

  const isLogin = mode === "login";

  return (
    <div className="lc-panel">
      <div className="lc-panel-title">
        {isLogin ? "Access control plane" : "Create operator account"}
      </div>
      <p className="lc-panel-sub">
        {isLogin
          ? "Email and password, then TOTP if enabled — or skip straight to a passkey."
          : "Register your operator account, then add TOTP and passkeys from the security center."}
      </p>

      <form
        className="lc-form"
        onSubmit={(event) => {
          event.preventDefault();
          submitCredentials();
        }}
      >
        {!isLogin ? (
          <label className="lc-field">
            <span className="lc-field-label">Display name</span>
            <input
              autoComplete="name"
              className="lc-input"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Operator name"
              required
              value={name}
            />
          </label>
        ) : null}

        <label className="lc-field">
          <span className="lc-field-label">Email address</span>
          <input
            autoComplete={isLogin ? "username webauthn" : "email"}
            className="lc-input"
            name="email"
            onChange={(event) =>
              isLogin
                ? setLoginEmail(event.target.value)
                : setRegisterEmail(event.target.value)
            }
            placeholder="operator@endgateway.cc"
            required
            type="email"
            value={isLogin ? loginEmail : registerEmail}
          />
        </label>

        <label className="lc-field">
          <span className="lc-field-label">Password</span>
          <input
            autoComplete={isLogin ? "current-password webauthn" : "new-password"}
            className="lc-input"
            name="password"
            onChange={(event) =>
              isLogin
                ? setLoginPassword(event.target.value)
                : setRegisterPassword(event.target.value)
            }
            placeholder={isLogin ? "Your password" : "Minimum 8 characters"}
            required
            type="password"
            value={isLogin ? loginPassword : registerPassword}
          />
        </label>

        <TurnstileGate ref={turnstileRef} />

        {error ? <div className="lc-alert">{error}</div> : null}

        <button
          className="lc-btn lc-btn-primary lc-btn-large lc-btn-block"
          disabled={pending}
          type="submit"
        >
          <Icon
            icon={isLogin ? "lucide:key-round" : "lucide:user-plus"}
            width={16}
            height={16}
          />
          <span>
            {pending
              ? "Processing…"
              : isLogin
                ? "Continue with password"
                : "Create account"}
          </span>
        </button>

        {isLogin ? (
          <>
            <div className="lc-divider">or</div>
            <button
              className="lc-btn lc-btn-large lc-btn-block"
              disabled={pending}
              onClick={signInWithPasskey}
              type="button"
            >
              <Icon icon="lucide:scan-face" width={16} height={16} />
              <span>Use a passkey</span>
            </button>
          </>
        ) : null}

        <div className="lc-form-meta">
          <Link href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Need an account" : "Return to sign in"}
          </Link>
          <Link href="/">Back to landing</Link>
        </div>
      </form>
    </div>
  );
}
