# endgateway.cc web

Next.js 16 App Router site for the `endgateway.cc` landing page and account surface.

## Implemented

- `/` landing page with liquid-glass visual treatment
- `/login`
- `/register`
- `/auth`
- Better Auth with SQLite persistence
- email/password authentication
- passkey support
- TOTP 2FA and backup code verification
- Cloudflare Turnstile support for credential flows
- local JetBrains Mono and Monocraft fonts

## Environment

Copy `.env.example` to `.env` and fill in the values.

Important notes:
- Passkeys require a real RP ID. `localhost` is fine for local development.
- Invisible Turnstile still requires server-side verification.
- If no Turnstile secret is configured, the UI falls back to Cloudflare's official test sitekey on the client and bypassed plugin enforcement on the server. Use real keys in production.

## Local usage

```bash
npm install
npm run auth:migrate
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## Docker

The production container is defined by `Dockerfile`.

Typical deployment flow:

```bash
cp .env.example .env
npm install
npm run auth:migrate
docker compose up -d --build
```

## External blockers

For full production behavior you still need:
- a resolving `endgateway.cc` DNS record
- real Cloudflare Turnstile site and secret keys
- a real passkey RP ID matching the final hostname
