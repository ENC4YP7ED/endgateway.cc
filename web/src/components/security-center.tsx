"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import QRCode from "qrcode";

import { Icon } from "@/components/icon";
import { SignOutButton } from "@/components/sign-out-button";
import { authClient } from "@/lib/auth-client";

type SecurityCenterProps = {
  step?: string;
};

export function SecurityCenter({ step }: SecurityCenterProps) {
  const session = authClient.useSession();
  const passkeys = authClient.useListPasskeys();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const activeSession = session.data;
  const twoFactorEnabled = Boolean(activeSession?.user?.twoFactorEnabled);
  const passkeyRows = passkeys.data ?? [];
  const showVerification = step === "2fa" || Boolean(totpUri && !twoFactorEnabled);

  useEffect(() => {
    if (!totpUri) {
      return;
    }

    QRCode.toDataURL(totpUri, {
      margin: 1,
      color: {
        dark: "#effaff",
        light: "#0000",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [totpUri]);

  const backupCodeColumns = useMemo(() => {
    if (!backupCodes.length) {
      return [];
    }

    return backupCodes.reduce<string[][]>((accumulator, code, index) => {
      const bucket = Math.floor(index / 4);
      accumulator[bucket] ??= [];
      accumulator[bucket].push(code);
      return accumulator;
    }, []);
  }, [backupCodes]);

  const withHandledState = (task: () => Promise<void>) => {
    startTransition(async () => {
      try {
        setMessage(null);
        setError(null);
        await task();
      } catch (issue) {
        setError(
          issue instanceof Error ? issue.message : "The security action failed.",
        );
      }
    });
  };

  const enableTwoFactor = () =>
    withHandledState(async () => {
      const result = await authClient.twoFactor.enable({
        password,
        issuer: "endgateway.cc",
      });

      if (result.error) {
        throw new Error(result.error.message || "Unable to enable 2FA.");
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
      }

      if (result.data?.backupCodes) {
        setBackupCodes(result.data.backupCodes);
      }

      setMessage("Scan the QR code, then verify the TOTP code below.");
    });

  const verifyTotp = () =>
    withHandledState(async () => {
      const result = await authClient.twoFactor.verifyTotp({
        code: totpCode,
        trustDevice: true,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid TOTP code.");
      }

      await session.refetch();
      setTotpCode("");
      setTotpUri(null);
      setQrDataUrl(null);
      setMessage("Two-factor authentication is now active.");
    });

  const verifyBackupCode = () =>
    withHandledState(async () => {
      const result = await authClient.twoFactor.verifyBackupCode({
        code: backupCode,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid backup code.");
      }

      await session.refetch();
      setBackupCode("");
      setMessage("Backup code accepted.");
    });

  const disableTwoFactor = () =>
    withHandledState(async () => {
      const result = await authClient.twoFactor.disable({ password });

      if (result.error) {
        throw new Error(result.error.message || "Unable to disable 2FA.");
      }

      await session.refetch();
      setPassword("");
      setBackupCodes([]);
      setTotpUri(null);
      setQrDataUrl(null);
      setMessage("Two-factor authentication has been disabled.");
    });

  const addPasskey = () =>
    withHandledState(async () => {
      const label = `endgateway-${new Date().toISOString().slice(0, 10)}`;
      const result = await authClient.passkey.addPasskey({
        name: label,
        authenticatorAttachment: "platform",
      });

      if (result.error) {
        throw new Error(result.error.message || "Unable to add passkey.");
      }

      await passkeys.refetch();
      setMessage("Passkey registered successfully.");
    });

  if (session.isPending) {
    return (
      <div className="liquid-shell rounded-[2rem] p-8 text-sm text-[var(--muted)]">
        Loading session state.
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="liquid-shell rounded-[2rem] p-8">
        <div className="space-y-4">
          <div className="status-pill">
            <span className="status-dot checking" />
            <span>Authentication required</span>
          </div>
          <h1 className="font-[var(--font-monocraft)] text-3xl text-white">
            Continue authentication
          </h1>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            {step === "2fa"
              ? "A valid password was accepted. Complete the second factor with your authenticator application or a backup code."
              : "No active session is present. Sign in or register to access the security center."}
          </p>

          {showVerification ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-white">
                <span>TOTP code</span>
                <input
                  className="field"
                  inputMode="numeric"
                  onChange={(event) => setTotpCode(event.target.value)}
                  placeholder="123456"
                  value={totpCode}
                />
              </label>
              <label className="grid gap-2 text-sm text-white">
                <span>Backup code</span>
                <input
                  className="field"
                  onChange={(event) => setBackupCode(event.target.value)}
                  placeholder="AAAA-BBBB"
                  value={backupCode}
                />
              </label>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-[rgba(255,125,125,0.28)] bg-[rgba(60,13,17,0.44)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-[rgba(141,245,191,0.24)] bg-[rgba(11,35,24,0.48)] px-4 py-3 text-sm text-[var(--success)]">
              {message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              className="glass-button"
              disabled={!totpCode || pending}
              onClick={verifyTotp}
              type="button"
            >
              Verify TOTP
            </button>
            <button
              className="glass-button"
              disabled={!backupCode || pending}
              onClick={verifyBackupCode}
              type="button"
            >
              Use backup code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="liquid-shell rounded-[2rem] p-6 md:p-8">
        <div className="mesh-bg" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="status-pill">
                <span className={`status-dot ${twoFactorEnabled ? "approved" : "checking"}`} />
                <span>{twoFactorEnabled ? "2FA enabled" : "2FA optional"}</span>
              </div>
              <h1 className="font-[var(--font-monocraft)] text-3xl text-white md:text-4xl">
                Security center
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Manage the operator session, register new passkeys, and enforce
                TOTP before tunnel or control-plane access.
              </p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.48)] p-4">
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                User
              </div>
              <div className="text-lg text-white">{activeSession.user.name}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {activeSession.user.email}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.48)] p-4">
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Registered passkeys
              </div>
              <div className="text-lg text-white">{passkeyRows.length}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                Platform or hardware authenticators
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.48)] p-4">
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Session state
              </div>
              <div className="text-lg text-white">Authenticated</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {twoFactorEnabled ? "Password + TOTP enforced" : "Password only"}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4 rounded-[1.75rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.56)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                    Passkeys
                  </div>
                  <div className="mt-1 text-xl text-white">WebAuthn devices</div>
                </div>
                <button className="glass-button" onClick={addPasskey} type="button">
                  <Icon icon="lucide:scan-face" />
                  <span>Add passkey</span>
                </button>
              </div>

              <div className="grid gap-3">
                {passkeyRows.length ? (
                  passkeyRows.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="rounded-[1.2rem] border border-[rgba(208,241,255,0.14)] bg-[rgba(5,14,25,0.58)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {passkey.name || "Unnamed passkey"}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                            {passkey.deviceType || "device"} /{" "}
                            {passkey.backedUp ? "backed up" : "local only"}
                          </div>
                        </div>
                        <div className="status-pill">
                          <span className="status-dot approved" />
                          <span>ready</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-[rgba(208,241,255,0.18)] p-4 text-sm text-[var(--muted)]">
                    No passkeys registered yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.56)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                    Two-factor authentication
                  </div>
                  <div className="mt-1 text-xl text-white">TOTP control</div>
                </div>
                <div className="status-pill">
                  <span className={`status-dot ${twoFactorEnabled ? "approved" : "checking"}`} />
                  <span>{twoFactorEnabled ? "enabled" : "disabled"}</span>
                </div>
              </div>

              <label className="grid gap-2 text-sm text-white">
                <span>Current password</span>
                <input
                  className="field"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Required for 2FA changes"
                  type="password"
                  value={password}
                />
              </label>

              {!twoFactorEnabled ? (
                <button
                  className="glass-button"
                  disabled={!password || pending}
                  onClick={enableTwoFactor}
                  type="button"
                >
                  <Icon icon="lucide:shield-check" />
                  <span>Enable TOTP</span>
                </button>
              ) : (
                <button
                  className="glass-button"
                  disabled={!password || pending}
                  onClick={disableTwoFactor}
                  type="button"
                >
                  <Icon icon="lucide:shield-off" />
                  <span>Disable TOTP</span>
                </button>
              )}

              {qrDataUrl ? (
                <div className="grid gap-4 rounded-[1.4rem] border border-[rgba(208,241,255,0.16)] bg-[rgba(5,14,25,0.54)] p-4 md:grid-cols-[180px_1fr]">
                  <div className="rounded-[1.2rem] border border-[rgba(208,241,255,0.12)] bg-[rgba(255,255,255,0.04)] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="TOTP QR code"
                      className="h-full w-full rounded-xl"
                      src={qrDataUrl}
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      Scan this QR code in your authenticator app, then verify the
                      current six-digit code to activate TOTP.
                    </p>
                    <label className="grid gap-2 text-sm text-white">
                      <span>TOTP code</span>
                      <input
                        className="field"
                        inputMode="numeric"
                        onChange={(event) => setTotpCode(event.target.value)}
                        placeholder="123456"
                        value={totpCode}
                      />
                    </label>
                    <button
                      className="glass-button"
                      disabled={!totpCode || pending}
                      onClick={verifyTotp}
                      type="button"
                    >
                      <Icon icon="lucide:shield-check" />
                      <span>Verify TOTP</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {backupCodeColumns.length ? (
                <div className="rounded-[1.4rem] border border-[rgba(208,241,255,0.16)] bg-[rgba(5,14,25,0.54)] p-4">
                  <div className="mb-3 text-sm font-medium text-white">
                    Backup codes
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {backupCodeColumns.map((column, index) => (
                      <div key={`backup-${index}`} className="space-y-2">
                        {column.map((code) => (
                          <div
                            key={code}
                            className="rounded-xl border border-[rgba(208,241,255,0.12)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--accent)]"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-[rgba(141,245,191,0.24)] bg-[rgba(11,35,24,0.48)] px-4 py-3 text-sm text-[var(--success)]">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-[rgba(255,125,125,0.28)] bg-[rgba(60,13,17,0.44)] px-4 py-3 text-sm text-[var(--danger)]">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="liquid-shell rounded-[2rem] p-6">
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Route inventory
            </div>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <div className="rounded-[1.2rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.52)] p-4">
                <span className="text-white">/login</span> handles credential and passkey
                sign-in with invisible Turnstile status.
              </div>
              <div className="rounded-[1.2rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.52)] p-4">
                <span className="text-white">/register</span> creates operator accounts
                behind the same challenge flow.
              </div>
              <div className="rounded-[1.2rem] border border-[var(--stroke)] bg-[rgba(8,18,28,0.52)] p-4">
                <span className="text-white">/auth</span> is the live security surface for
                TOTP enrollment, passkeys, and session control.
              </div>
            </div>
          </div>
        </div>

        <div className="liquid-shell rounded-[2rem] p-6">
          <div className="space-y-4">
            <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Turnstile note
            </div>
            <p className="text-sm leading-7 text-[var(--muted)]">
              The UI uses an invisible Turnstile widget and exposes its state as a
              visible indicator. If you have not provided production site and secret
              keys yet, the app falls back to Cloudflare&apos;s official test keys so
              flows remain testable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
