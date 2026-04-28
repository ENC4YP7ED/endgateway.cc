import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { captcha, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { appEnv } from "@/lib/env";

const databaseFile = join(process.cwd(), "data", "auth.db");
mkdirSync(dirname(databaseFile), { recursive: true });

const database = new Database(databaseFile);

const captchaPlugins = appEnv.turnstileSecretKey
  ? [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: appEnv.turnstileSecretKey,
      }),
    ]
  : [];

export const auth = betterAuth({
  appName: appEnv.appName,
  baseURL: appEnv.appUrl,
  secret: appEnv.betterAuthSecret,
  trustedOrigins: appEnv.trustedOrigins.length
    ? appEnv.trustedOrigins
    : [appEnv.appUrl],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  database,
  plugins: [
    twoFactor({
      issuer: appEnv.appName,
    }),
    passkey({
      rpID: appEnv.passkeyRpId,
      rpName: appEnv.passkeyRpName,
    }),
    ...captchaPlugins,
    nextCookies(),
  ],
});
