# EM — emergency event prototype

**An Express learning project for admission-event processing and notification payloads.**

The server receives an event, reads local JSON records, checks policy state and diagnosis substring matches, then returns separate hospital and insurer payloads.

[Español — descripción original](README.es.md) · [Server](server.js) · [Web interface](public/index.html)

## Implemented flow

1. `GET /api/pacientes` joins patient and policy records from local JSON files.
2. `POST /api/webhook/emergencia` accepts `pacienteId`, `diagnostico` and an optional `hospital`.
3. It returns `APROBADO`, `RECHAZADO` or `ALERTA_PREEXISTENCIA`, with two notification objects.
4. If `webhookSiteUrl` is supplied, the server attempts an outbound HTTP request.

The two payloads are returned to the web interface. This is not evidence of delivery to real hospital or insurance systems. The outbound flag does not verify a successful HTTP status from the recipient.

## Run locally

Use Node.js 22 or later and pnpm. From an inspected checkout:

```bash
pnpm install --frozen-lockfile
pnpm start
```

Open `http://localhost:3000`. Use synthetic records only, on an isolated local development machine. Do not expose the port to a network. The current server uses the default listen host, so restrict inbound access in the local environment. Leave the external webhook field blank.

## Request shape

```json
{
  "pacienteId": "<synthetic-id-in-your-local-fixture>",
  "diagnostico": "synthetic diagnosis",
  "hospital": "Demo facility"
}
```

This is a request template, not a claim that the placeholder matches a bundled record. Missing required fields return 400; an unknown patient ID returns 404.

## Prototype boundaries

There is no authentication or authorization. The patient endpoint exposes the loaded records. Outbound webhook destinations are not restricted to an approved host, and user input is interpolated into HTML in the frontend. These require engineering work before any public deployment. Diagnosis matching is simple text matching, not clinical reasoning or a real coverage decision.

Do not use real patient, identity, policy or financial data. No production deployment, security certification or live integration is claimed. No screenshot containing record data is republished here.

## Project map

| Path | Purpose |
| --- | --- |
| `server.js` | Express routes and prototype rules |
| `public/` | Browser interface |
| `data/` | Local JSON records; keep examples synthetic |
| `package.json` | Runtime dependencies and start command |

Documentation contributions and tests with synthetic fixtures are welcome. Report security-sensitive details through a private channel agreed with the maintainer; do not post personal data in Issues. Package metadata declares ISC, but no standalone license file was present during this update.
