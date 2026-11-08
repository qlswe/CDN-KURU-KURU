# Kuru Telemetry

Privacy-first, first-party analytics for kuru-kuru.ru. The static site SDK is consent-gated; the Worker stores only a random WBUID and a small allowlist of event metadata.

## Data policy

- No IP address is read by application code or stored in D1.
- No fingerprinting, geolocation, cross-site tracking, form contents, referrer, or full user-agent is collected.
- WBUID is a random UUID generated only after explicit consent.
- Events are allowlisted and retained for 90 days.
- A visitor can reject consent or revoke it from /privacy.html. Revocation deletes their visitor row and linked events.
- The dashboard API requires a password-authenticated, signed, HttpOnly session cookie. No password or signing key is shipped to browser code.

Cloudflare itself may process connection metadata to provide its network and security services. This application cannot prevent infrastructure-level processing by the hosting provider.

## Deploy

1. Create the D1 database and apply `schema.sql` remotely.
2. The database ID is configured in `wrangler.toml`.
3. From this directory, set two Worker secrets (use different random values):

```sh
npx wrangler secret put TELEMETRY_ADMIN_PASSWORD
npx wrangler secret put COOKIE_SECRET
```

Use a long, unique admin password (at least 20 characters) and a separate random COOKIE_SECRET of at least 32 characters. Do not commit either value to GitHub or put them in frontend files.

4. Deploy:

```sh
npm install
npx wrangler deploy
```

5. Ensure the static site publishes the files in this folder. Open `https://kuru-kuru.ru/telemetry/login.html`, sign in, and confirm the dashboard loads.

## API

- `POST /api/telemetry/collect`: consented, validated events.
- `POST /api/telemetry/revoke`: delete visitor and linked events.
- `POST /api/telemetry/admin/login`: verifies the admin password and issues a 12-hour signed HttpOnly cookie.
- `POST /api/telemetry/admin/logout`: clears the session cookie.
- `GET /api/telemetry/admin/summary`: dashboard totals and latest WBUIDs (signed session required).
- `GET /api/telemetry/admin/events`: latest events (signed session required).

The cookie is Secure, HttpOnly, SameSite=Strict and scoped to the admin API path. The scheduled Worker trigger removes records older than 90 days daily. Apply an edge rate-limit rule to the login endpoint in Cloudflare WAF if available.

A public static website cannot prevent visitors from inspecting its HTML, CSS, JavaScript, or network requests. Protect secrets and write operations on the server; do not rely on minification or anti-debugging tricks as security controls.
