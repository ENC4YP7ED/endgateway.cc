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

  return (
    <div className="liquid-shell relative rounded-[2rem] p-6 md:p-8">
      <div className="mesh-bg" />
      <div className="relative space-y-6">
        <div className="space-y-2">
          <div className="status-pill">
            <span className="status-dot approved" />
            <span>{mode === "login" ? "secure sign-in" : "secure sign-up"}</span>
          </div>
          <h1 className="font-[var(--font-monocraft)] text-3xl tracking-tight text-white md:text-4xl">
            {mode === "login" ? "Access control plane" : "Create operator account"}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            {mode === "login"
              ? "Use email and password, continue through TOTP if required, or use a passkey from a device you already trust."
              : "Register a new operator account, then add TOTP and passkeys from the security center."}
          </p>
        </div>

        <div className="grid gap-4">
          {mode === "register" ? (
            <>
              <label className="grid gap-2 text-sm text-white">
                <span>Display name</span>
                <input
                  autoComplete="name"
                  className="field"
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Operator name"
                  required
                  value={name}
                />
              </label>
              <label className="grid gap-2 text-sm text-white">
                <span>Email address</span>
                <input
                  autoComplete="email"
                  className="field"
                  name="email"
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="operator@endgateway.cc"
                  required
                  type="email"
                  value={registerEmail}
                />
              </label>
              <label className="grid gap-2 text-sm text-white">
                <span>Password</span>
                <input
                  autoComplete="new-password"
                  className="field"
                  name="password"
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  type="password"
                  value={registerPassword}
                />
              </label>
            </>
          ) : (
            <>
              <label className="grid gap-2 text-sm text-white">
                <span>Email address</span>
                <input
                  autoComplete="username webauthn"
                  className="field"
                  name="email"
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="operator@endgateway.cc"
                  required
                  type="email"
                  value={loginEmail}
                />
              </label>
              <label className="grid gap-2 text-sm text-white">
                <span>Password</span>
                <input
                  autoComplete="current-password webauthn"
                  className="field"
                  name="password"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Your password"
                  required
                  type="password"
                  value={loginPassword}
                />
              </label>
            </>
          )}
        </div>

        <TurnstileGate ref={turnstileRef} />

        {error ? (
          <div className="rounded-2xl border border-[rgba(255,125,125,0.28)] bg-[rgba(60,13,17,0.44)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="glass-button"
            disabled={pending}
            onClick={submitCredentials}
            type="button"
          >
            <Icon
              className="text-[var(--accent)]"
              height={18}
              icon="lucide:key-round"
              width={18}
            />
            <span>
              {pending
                ? "Processing"
                : mode === "login"
                  ? "Continue with password"
                  : "Create account"}
            </span>
          </button>

          {mode === "login" ? (
            <button
              className="glass-button"
              disabled={pending}
              onClick={signInWithPasskey}
              type="button"
            >
              <Icon
                className="text-[var(--accent-warm)]"
                height={18}
                icon="lucide:scan-face"
                width={18}
              />
              <span>Use passkey</span>
            </button>
          ) : (
            <Link className="glass-button" href="/login">
              <Icon
                className="text-[var(--accent)]"
                height={18}
                icon="lucide:log-in"
                width={18}
              />
              <span>Already have an account</span>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          <Link href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Need a new account" : "Return to login"}
          </Link>
          <Link href="/">Back to landing</Link>
        </div>
      </div>
    </div>
  );
}
