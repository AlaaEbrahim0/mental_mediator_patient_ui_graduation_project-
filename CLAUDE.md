# CLAUDE.md

Start with [`AGENTS.md`](AGENTS.md) in this directory — it is the single source of truth
for how this repository works: the verified `npm` scripts (there is no `lint` script;
`CI=true npm run build` fails on ESLint warnings), the repo map, the hard rule that files
listed in `.shared-ui.json` are **vendored** copies that must never be edited in place
(fix upstream in `nexus-shared-ui`, re-pin with `npm run shared-ui:sync -- --ref <sha>`,
re-sync, then `npm run shared-ui:check`), the auth constraints (JWT stored under
`nexus_auth_session`, email/password sign-in only, never change the JWT
audience, never commit secrets), the fact that the .NET API is the sole source of truth
for authorisation, why Vercel preview deployments fail by design, and the current
feature-freeze status. `CONTRIBUTING.md` covers the day-to-day workflow and
`CHANGELOG.md` what has changed. Do not duplicate any of it here.
