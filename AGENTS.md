# AGENTS.md — patient-ui (Mental Mediator patient portal)

Read this before touching anything in this repository. Most of what looks like a
convention here is a constraint, not a preference.

**Status: FEATURE FREEZE (graduation project).** No new features, no opportunistic
refactors, no dependency upgrades. Fix real defects and do the smallest change that
fixes them. If a change is not required by the task, do not make it.

---

## What this is

React 18 + Create React App (`react-scripts` 5.0.1) SPA. Tailwind CSS 3 + DaisyUI 4
(`nexus` theme), React Router v6 (`createBrowserRouter`), Axios, SignalR 8.

- Package name: `mental_mediator_patient_ui` (version `0.1.0`)
- Production: https://mental-health-ochre-xi.vercel.app
- Backend: ASP.NET Core 8 API at https://nexus-api.runasp.net/ (sibling `../api`)
- Shared design system: https://github.com/AlaaEbrahim0/nexus-shared-ui (**vendored**, see below)
- Git branch: **`master`** (the default branch and the drift workflow's `on.push` filter
  both point at `master`, matching `doctor-ui`)
- This portal is the **patient** half of the platform. Sign-in is email/password only,
  same as the doctor portal. (Google OAuth was removed: the API's external-login flow
  never worked end to end, so the button was a dead end.)

## Commands

These are the only scripts in `package.json`. There is **no `lint` script** — ESLint
runs inside `react-scripts build`.

| Command | What it does |
|---|---|
| `npm start` | CRA dev server on http://localhost:3000 |
| `npm run build` | CRA production build into `build/`; runs ESLint. **With `CI=true`, warnings are treated as errors and the build fails.** |
| `npm test` | `react-scripts test` (Jest + RTL). Watches by default; use `CI=true npm test` for a single run |
| `npm run shared-ui:sync` | Copy the pinned `@nexus/shared-ui` files into this portal |
| `npm run shared-ui:check` | Same script in check mode: exit 1 if any vendored file has drifted from the pin |

Current suite: **6 suites / 75 tests**, all passing with `CI=true npm test`.

## Repo map

```
package.json                 scripts + dependencies (no lint script)
vercel.json                  SPA rewrite: every non-asset path -> /index.html
.shared-ui.json              the pin: upstream repo URL, commit `ref`, and the 45 vendored files
scripts/shared-ui-sync.mjs   the vendoring tool (Node built-ins + git only, no deps)
.env / .env.example          REACT_APP_API_URL, REACT_APP_IMAGE_BASE_URL (gitignored)
.github/workflows/shared-ui-drift.yml  CI: runs `npm run shared-ui:check` on push/PR to `master`
tailwind.config.js           VENDORED — canonical design tokens live upstream
src/index.js                 ReactDOM.createRoot, StrictMode
src/App.js                   ThemeProvider > AuthProvider > ExternalLoginGate > UserProfileProvider > NotificationsProvider > Routes
src/routes/index.js          the single module-scope createBrowserRouter; all routes
src/routes/ProtectedRoute.js token + `user` role check; falls back to persisted session
src/auth/
  authProvider.js            VENDORED — session state, chunked expiry timers, `auth:expired`
  session.js                 VENDORED — localStorage key `nexus_auth_session`, getToken/saveSession/clearSession
  login.js register.js forgotPassword.js resetPassword.js logout.js
src/api/
  client.js                  VENDORED — axios instance, base-URL trim, JWT request interceptor, 401 -> `auth:expired`, RFC 7807 message helpers
  chat.api.js                VENDORED
  notifications.api.js       VENDORED
  auth.api.js appointments.api.js community.api.js doctors.api.js history.api.js profile.api.js   LOCAL
src/components/
  ui/                        VENDORED design system — primitives.js, community.js, index.js, Post, Comment, Reply, …
  chat/                      mixed: ChatComposer, CreateRoomModal, ReportMessageModal, RoomReportsPanel,
                             JoinRoomModal, RoomCard, RoomInviteModal, RoomInvitationList, RoomSettingsModal,
                             roomsFilter are VENDORED; ChatMessageItem and RoomMembersPanel are LOCAL
  layout/                    LOCAL — MainLayout, Sidebar (mobile drawer), TopBar
  profile/                   VENDORED — ProfileView, profileUtils
  media/MediaGallery.js history/PatientHistoryTimeline.js routing/ScrollManager.js   VENDORED
src/hooks/                   VENDORED — useChatHub.js, useModerationStage.js
                             LOCAL — useSignalR.js, useInView.js, useRefreshOnFocus.js
src/context/                 notificationsContext.js VENDORED; profileContext.js LOCAL
src/utils/                   chat.js moderationState.js postComposerConfig.js utcToRelativeTime.js VENDORED; format.js LOCAL
src/pages/                   LOCAL — Home, Doctors, DoctorDetails, BookAppointment, Appointments,
                             PatientHistory, Profile, PublicProfile, Notifications, CommunityLayout,
                             Forums, ForumsDetails, ChatRooms, ChatRoom
```

The authoritative vendored list is the `files` array in `.shared-ui.json` (45 entries).
When in doubt about whether a file is shared, check that array — do not guess.

## The vendored shared-ui rule (hard)

`@nexus/shared-ui` is **not an npm package**. It is not in `node_modules` and is not
resolved at build time. Each portal keeps a byte-for-byte copy of the upstream files at
a commit pinned in `.shared-ui.json` (`ref: f082cb5d2f2d45de0b38f43fbea2cc9de9f7d1fd`
right now, in sync: `In sync with @nexus/shared-ui@f082cb5 (45 files)`).

**NEVER edit a file that appears in `.shared-ui.json`'s `files` list.** Not to fix a bug,
not to tweak a class name, not to "just add one prop". Those copies are overwritten by the
next `npm run shared-ui:sync`, and the drift check in CI turns red in the other portal too.

The correct loop:

1. Edit the file in the upstream `nexus-shared-ui` checkout, commit, and **push it**.
2. In each portal that needs the change: `npm run shared-ui:sync -- --ref <new sha>`
   (rewrites `.shared-ui.json` and copies the files in).
3. `npm run shared-ui:check` — must print "In sync".
4. `npm run build` and `npm test`.
5. Commit the re-pinned `.shared-ui.json` **together with** the synced files.
6. `shared-ui` is pushed **first**, portals after — never the other way round.

Why vendoring at all: `react-scripts`'s Babel rule is `include: paths.appSrc`, so JSX is
transpiled only under this app's `src/`. A `github:`/`node_modules` dependency shipping raw
JSX would fail the build unless craco or react-app-rewired were added, and neither is. Do
not "simplify" this by adding the package to `dependencies`.

Note: `src/index.css` and `tailwind.config.js` are **also vendored**. A token or global-CSS
change belongs upstream, not here.

Portal-owned code imports the vendored copy by relative path, never from `@nexus/shared-ui`:

```jsx
import { Button, Card } from "../components/ui";          // primitives entry only
import { Post, Comment } from "../components/ui/community"; // the react-markdown entry
```

## Auth rules (hard)

- The JWT lives in localStorage under **`nexus_auth_session`** as
  `{ token, userId, roles, expiresOn }`, written and read **only** through
  `src/auth/session.js`. That key and shape are shared with `doctor-ui` through upstream.
- **Never change the JWT audience.** `api/API/appsettings.json` sets
  `JwtSettings:Audience` to `https://mental-health-ochre-xi.vercel.app` with
  `ValidateAudience = true`. The API minting and validating tokens is outside this repo; a
  portal change that alters, re-derives, or re-targets the audience invalidates every
  existing session. Same for the storage key and the `roles` claim casing convention
  (compared case-insensitively against `user`).
- Never commit secrets. No API keys, no tokens, no real credentials in source, fixtures,
  tests, `.env`, or committed `build/` output. `.env`, `.env.local`, and
  `.env.*.local` are gitignored; `.env.example` is the template. Only `REACT_APP_*` values
  reach the client bundle, and **everything inlined there is public** — put nothing
  sensitive in them.
- `ExternalLoginGate` must stay a **parent** of `<Routes/>`: the router is built once at
  module scope, so a sibling cannot navigate, and the gate must decide before the first
  render or `ProtectedRoute` rewrites `/` and destroys `?temporaryToken=`.
- The handoff exchange uses its own bare axios (`handoffClient`), **not** `apiClient`, on
  purpose: `apiClient`'s 401 → `auth:expired` path clears the session the exchange just
  wrote. Do not "clean that up".
- Temporary handoff tokens are single-use. `exchangeOnce` de-dupes them so React
  StrictMode's double mount does not trigger a second call that would 401.

## Authorization: the .NET API is the source of truth

`src/routes/ProtectedRoute.js` and every role/permission helper in `src/utils/chat.js`
only decide **which screen to show**. The ASP.NET Core API authorises every request and
every mutation independently. Frontend checks are UX, not a security boundary:

- Never weaken, bypass, or replicate a server rule in the client to make a screen work.
- Never add a client-side permission that the API does not enforce.
- A `403` means the account genuinely lacks the role — `src/api/client.js` deliberately
  does **not** redirect on 403 (the user *is* authenticated). Leave that alone.
- If a permission seems wrong, the fix is in the API repo, not here.

## Deployment

Vercel, project `mental-health-ochre`, deployed with `npx vercel --prod`. Not connected to
GitHub, so a push does not build anything. `REACT_APP_*` values are inlined at build time
— changing one needs a redeploy, not just an env edit.

**Vercel preview URLs are intentionally not in the API's CORS allowlist**
(`api/API/Configurations/DependencyInjection.cs` lists only the two production aliases
plus localhost). API calls therefore **fail on preview deployments by
design**. That is not a bug to chase: verify on `localhost:3000` against the real API, or
promote the deployment to the production alias.

## Gotchas

- `src/components/ui/index.js` re-exports **only primitives**. `Post`/`Comment`/`Reply`
  import `react-markdown`, which is ESM-only; CRA's Jest never transforms `node_modules`
  and cannot be configured without ejecting, so adding them to that barrel breaks every
  test that imports `"../ui"`. Keep any ESM-only dependency out of `index.js`.
- `CI=true npm run build` fails on ESLint **warnings**, not just errors. Keep the build
  warning-free.
- `authProvider.js` chunks its expiry `setTimeout` because browsers clamp delays to
  `2147483647` ms; a 30-day token used to overflow and wipe the session immediately.
- `API_BASE_URL` trims trailing slashes in `src/api/client.js`; hub URLs are string
  concatenated, so an untrimmed slash produces `//…` and a 404.
- `npm test` with `src/setupTests.js`: no `@testing-library/jest-dom` here — it is not a
  dependency of this portal, and importing it makes every suite fail to start.
- Patient role is `user`, doctor role is `Doctor`. They are not interchangeable; a
  patient token will not unlock a doctor screen and vice versa.

## Known gaps

- `src/components/chat/roomsFilter.test.js` exists here and currently matches upstream, but
  it is **not** listed in `.shared-ui.json`, so `shared-ui:check` neither writes nor audits
  it. Treat it as portal-local; do not let it drift silently.
- `scripts/shared-ui-sync.mjs` **only copies** — it never deletes. A file dropped from the
  `files` array or from upstream stays in this portal until deleted by hand.
- `npm run shared-ui:sync -- --clone` forces a fresh clone from GitHub instead of using a
  sibling `../shared-ui` checkout (use it if the sibling is at a different commit).
- `version` in `.shared-ui.json` is a label; reproducibility comes from `ref` alone.
