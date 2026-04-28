const FALLBACK_TURNSTILE_SITEKEY = "1x00000000000000000000BB";

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function requiredSecret(name: string, fallback: string) {
  const value = env(name, fallback);
  return value;
}

export const appEnv = {
  appName: env("NEXT_PUBLIC_APP_NAME", "endgateway.cc"),
  appUrl: env("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  trustedOrigins: env("TRUSTED_ORIGINS", "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  betterAuthSecret: requiredSecret(
    "BETTER_AUTH_SECRET",
    "replace-this-before-production-endgateway-auth-secret",
  ),
  databasePath: env("DATABASE_PATH", "./data/auth.db"),
  passkeyRpId: env("PASSKEY_RP_ID", "localhost"),
  passkeyRpName: env("PASSKEY_RP_NAME", "endgateway.cc"),
  turnstileSiteKey: env("NEXT_PUBLIC_TURNSTILE_SITE_KEY", FALLBACK_TURNSTILE_SITEKEY),
  turnstileSecretKey: env("TURNSTILE_SECRET_KEY", ""),
  turnstileEnabled: Boolean(env("TURNSTILE_SECRET_KEY")),
  useTurnstileTestKeys: !env("TURNSTILE_SECRET_KEY"),
};
