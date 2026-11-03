# Kuru Telemetry

Privacy-first, first-party analytics for kuru-kuru.ru. The static site SDK is consent-gated; the Worker stores only a random WBUID and a small allowlist of event metadata.

## Data policy

- No IP address is read by application code or stored in D1.
- No fingerprinting, geolocation, cross-site tracking, form contents, referrer, or full user-agent is collected.
- WBUID is a random UUID generated only after explicit consent.
- Events are allowlisted and retained for 90 days.
- A visitor can reject consent or revoke it from /privacy.html. Revocation deletes their visitor row and cascading events.
- Dashboard and admin API must be protected by Cloudflare Access before production use.

Cloudflare itself may process connection metadata to provide its network and security services. This application cannot prevent infrastructure-level processing by the hosting provider.

## Deploy

Run commands from this directory.

1. Create D1 and note its database ID:

```sh
npx wrangler d1 create kuru-telemetry
```

2. Put the returned ID into `wrangler.toml` as `database_id`. Keep `database_name = "kuru-telemetry"`.

3. Apply the schema:

```sh
npx wrangler d1 execute kuru-telemetry --remote --file=./schema.sql
```

4. Create a Cloudflare Access self-hosted application with these protected paths:
   - `kuru-kuru.ru/telemetry/*`
   - `kuru-kuru.ru/api/telemetry/admin/*`

   Set the policy to **Allow** only your own verified email identity. Do not use a public/bypass policy. Copy the Access team domain (without https://) and the application's AUD tag into `wrangler.toml` vars.

5. Deploy the Worker:

```sh
npm install
npx wrangler deploy
```

The Worker route is configured for `kuru-kuru.ru/api/telemetry/*`. Confirm the route is attached to the correct Cloudflare zone and that the zone is active on this account.

6. Confirm the static Pages deployment publishes `telemetry/dashboard.html`, `telemetry/dashboard.css`, `telemetry/dashboard.js`, `telemetry/sdk.js`, and `privacy.html`. Open `https://kuru-kuru.ru/telemetry/dashboard.html`; Cloudflare Access must challenge you before the dashboard HTML loads.

7. In Cloudflare Security > WAF, add a rate-limiting rule for `/api/telemetry/collect` (for example, 60 requests per minute per IP, block or managed challenge). This is an edge anti-abuse control; application-level throttling additionally limits each consented WBUID to 30 events per minute.

## API

- `POST /api/telemetry/collect`: consented, validated events.
- `POST /api/telemetry/revoke`: delete visitor and linked events.
- `GET /api/telemetry/admin/summary`: dashboard totals and latest WBUIDs (Cloudflare Access required).
- `GET /api/telemetry/admin/events`: latest events (Cloudflare Access required).

The scheduled Worker trigger removes records older than 90 days daily.

## Security notes

The static dashboard shell contains no data; its API requests fail closed unless a valid Cloudflare Access JWT is present. Do not loosen the Access application policy. Keep the D1 database ID and account configuration out of public issues. Never add an admin password or API token to browser JavaScript.

A public static website cannot prevent visitors from inspecting its HTML, CSS, JavaScript, or network requests. Protect secrets and write operations on the server; do not rely on minification or anti-debugging tricks as security controls.
