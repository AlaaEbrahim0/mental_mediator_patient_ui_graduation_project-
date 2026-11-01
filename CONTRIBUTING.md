# Contributing — patient-ui

The project is in **feature freeze** (graduation project). Contributions should be defect
fixes, accessibility or build corrections, and documentation. Read
[`AGENTS.md`](AGENTS.md) first: it is authoritative on what may not be touched.

## Development setup

Requirements: Node.js 18 or newer (the drift workflow uses Node 24; this portal declares no
`engines` field) and npm.

```bash
npm install                 # react-scripts 5 + Tailwind/DaisyUI, all from package.json

cp .env.example .env        # gitignored; .env is never committed
# set REACT_APP_API_URL (https://nexus-api.runasp.net/) and
# REACT_APP_IMAGE_BASE_URL (/images)

npm start                   # CRA dev server on http://localhost:3000
```

If `REACT_APP_API_URL` is missing, the base URL resolves to an empty string and every
request silently targets the portal's own origin — the app loads but shows no data. That is
the first thing to check.

**Vercel preview URLs do not work.** Preview deployment origins are deliberately absent
from the API's CORS allowlist, so Google sign-in and API calls fail there. This is by
design, not a bug. Develop on `localhost:3000` (localhost origins *are* allowlisted) or on
the production alias.

## Shared UI sync workflow

`@nexus/shared-ui` is **not** an npm package. Everything listed in the `files` array of
`.shared-ui.json` (45 files, currently pinned to
`f082cb5d2f2d45de0b38f43fbea2cc9de9f7d1fd`) is a vendored copy overwritten by each sync.
Never edit those files here — the change is lost and the drift check goes red in the other
portal.

To change shared behaviour, a design token, or a shared component:

1. **Edit upstream.** Open the `nexus-shared-ui` checkout
   (https://github.com/AlaaEbrahim0/nexus-shared-ui), change the file, commit, and
   **push to `master`**. A portal can only pin a SHA that exists on GitHub (unless a
   sibling `../shared-ui` checkout already sits on that commit).
2. **Bump the pin and sync** in this portal:
   ```bash
   npm run shared-ui:sync -- --ref <new-commit-sha>
   ```
   `--ref` rewrites `.shared-ui.json` first, then copies the files in — one command.
   To refresh without moving the pin, run `npm run shared-ui:sync`.
3. **Verify:**
   ```bash
   npm run shared-ui:check        # must print: In sync with @nexus/shared-ui@<sha> (45 files)
   npm test                       # 6 suites / 75 tests
   CI=true npm run build          # clean, no ESLint warnings
   ```
4. **Commit** the re-pinned `.shared-ui.json` **together with** the synced files, in the
   same commit. Then repeat in `doctor-ui` so both portals sit on the same SHA.
5. Push `nexus-shared-ui` **before** the portals, never the other way round.

Useful details:

- `npm run shared-ui:sync -- --clone` ignores the sibling `../shared-ui` checkout and
  clones the pinned ref from GitHub.
- The script **only copies**; it never deletes. Removing a path from `files` leaves the
  stale copy in place — delete it by hand.
- A new third-party import in a shared file must be added to **both** portals'
  dependencies before re-pinning, or the portal without it fails its build.
- To vendor a new file, add its mirrored path to `files` in `.shared-ui.json` after it
  exists upstream.

## Gates

All three must pass before a branch is pushed, and `shared-ui:check` must be clean before a
pin or a vendored path list changes:

```bash
CI=true npm run build
npm test                 # equivalently: CI=true npm test
npm run shared-ui:check
```

There is **no `npm run lint` script** — ESLint runs as part of `npm run build`, and with
`CI=true` warnings are treated as errors, so keep the build warning-free.

Do not deploy from a contribution that has not passed these. Production is a manual
`npx vercel --prod`; the Vercel project is not connected to GitHub.

## Commit conventions

Follow the convention already required for `nexus-shared-ui`: [Conventional
Commits](https://www.conventionalcommits.org/) — `fix:`, `feat:`, `chore:`, `docs:`,
`test:`, with a scope where it helps: `fix(chat): …`, `fix(layout): …`,
`chore(shared-ui): re-pin to <sha>`. Imperative subject, one logical change per commit.

- Work on `master` (this repo's checked-out branch). Note the drift workflow's `on.push`
  filter says `main`, so pushes here do not trigger it — run `npm run shared-ui:check`
  locally.
- Never commit `.env`, `.env.local`, `.env.*.local`, tokens, or anything from
  `build/` or `node_modules/`. `REACT_APP_*` values are inlined into the public bundle —
  put nothing sensitive in them.
- Never change the JWT audience, the `nexus_auth_session` localStorage key, or its
  `{ token, userId, roles, expiresOn }` shape.
- Do not reformat or "tidy" vendored files; they are compared byte-for-byte against
  upstream.

## Pull-request checklist

- [ ] Scope is a fix, not a feature (feature freeze).
- [ ] No file from `.shared-ui.json`'s `files` list was hand-edited.
- [ ] If shared code changed: upstream commit SHA, both portals re-pinned to the same one.
- [ ] `CI=true npm run build`, `npm test`, `npm run shared-ui:check` all pass.
- [ ] Authorisation behaviour untouched — the .NET API decides, the client only renders.
- [ ] `CHANGELOG.md` updated.
