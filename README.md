# Nexus — Patient Portal

**React frontend for the Mental Mediator platform.** The patient-facing experience: finding a doctor, booking a session, taking part in the peer-support community, and chatting in real time.

- **Production URL:** https://mental-health-ochre-xi.vercel.app
- **Backend API:** https://nexus-api.runasp.net/
- **Doctor portal:** https://mental-mediator-doctor-ui-graduation-project.vercel.app
- **Shared UI library:** https://github.com/AlaaEbrahim0/nexus-shared-ui
- **Repository:** https://github.com/AlaaEbrahim0/mental_mediator_patient_ui_graduation_project- (branch `main`)

---

## Features

| Area | Description |
|------|-------------|
| **Doctor discovery** | Paged, filterable doctor list (12 per page) with a detail page per doctor |
| **Booking** | Reads a doctor's schedule and available slots, then books with a start time, location, and reason |
| **Appointments** | Paged list of your appointments (20 per page) with upcoming view and cancellation with a reason |
| **Community forums** | Anonymous support posts with categories, tags, images, likes, and nested comments and replies |
| **News** | Editor articles surfaced from `GET /api/articles` |
| **Chat rooms** | Real-time group chat over SignalR: join, leave, members, send, delete, report, and moderator role handling |
| **Notifications** | In-app notification list with read state, updated over SignalR |
| **Profile** | Patient profile at `GET/PUT /api/users/me` |
| **Auth** | Sign in, registration (`user` role), email confirmation link, and password reset |
| **Chatbot** | Third-party Chatbase widget embedded from `public/index.html` |

Signed-in areas are guarded client-side by `src/routes/ProtectedRoute.js`, which requires the `user` role. The server authorises every request independently — the guard only decides which screen to show.

---

## Routes

| Path | Screen | Access |
|------|--------|--------|
| `/` | Home | signed-in patient |
| `/doctors` | Doctor discovery | signed-in patient |
| `/doctors/:doctorId` | Doctor detail, schedule, slots | signed-in patient |
| `/doctors/:doctorId/book` | Booking form | signed-in patient |
| `/appointments` | Your appointments | signed-in patient |
| `/profile` | Your profile | signed-in patient |
| `/notifications` | Notifications | signed-in patient |
| `/community` | Forums feed | signed-in patient |
| `/community/rooms`, `/community/rooms/:id` | Chat rooms | signed-in patient |
| `/forums/:id` | Single post with comments | signed-in patient |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth | signed-out only |
| `*` | Redirects to `/` | — |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Create React App / `react-scripts` 5) |
| Styling | Tailwind CSS 3 + DaisyUI 4 (`nexus` theme) |
| Routing | React Router v6 (`createBrowserRouter`) |
| HTTP | Axios with a JWT request interceptor |
| Real-time | `@microsoft/signalr` 8 |
| Toasts | react-hot-toast |
| Animation | framer-motion |
| Content | react-markdown, react-infinite-scroll-component |
| Dates | date-fns, moment |
| Icons | react-icons |
| Shared UI | vendored from [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) |

---

## Quick start

### Prerequisites

- Node.js ≥ 18 (LTS recommended)
- npm

### Install and run

```bash
git clone https://github.com/AlaaEbrahim0/mental_mediator_patient_ui_graduation_project-.git
cd mental_mediator_patient_ui_graduation_project-

npm install

cp .env.example .env
# Edit .env — see "Environment variables" below

npm start        # http://localhost:3000
```

### Build for production

```bash
npm run build    # Output: build/
```

---

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API base URL. Production: `https://nexus-api.runasp.net` |
| `REACT_APP_IMAGE_BASE_URL` | No | Path to bundled static images. Default: `/images` |

Both values are non-secret. A trailing slash in `REACT_APP_API_URL` is normalised in
`src/api/client.js` — an unnormalised slash produced `//api/...` requests and a broken SignalR
hub URL, so the trimming is intentional and should be kept.

> If `REACT_APP_API_URL` is missing, the base URL resolves to an empty string and every request
> silently targets the portal's own origin instead of the API. This is the failure mode to check
> first if the deployed app loads but shows no data.

> `.env` is gitignored. Never commit credentials or tokens.

---

## Shared UI

This portal vendors **23 files** from [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui): `tailwind.config.js`, `src/index.css`, the UI primitives under `src/components/ui/` (plus the explicit `ui/community.js` entry), the Axios client, auth/session helpers, `notificationsContext`, `profileUtils`, `useChatHub`, and `convertUtcToRelativeTime`.

`src/components/ui/index.js` re-exports only the primitives. The community components are reached
through `src/components/ui/community.js` or by direct path, because they import `react-markdown`
(ESM only) and Create React App's Jest cannot transform `node_modules` — pulling them into the
primitives entry point breaks every test that imports `"../ui"`.

Vendoring rather than a `node_modules` import is a constraint of the stack, not a shortcut: `react-scripts` transpiles JSX only under this app's `src/`, so raw-JSX sources installed from Git would fail the build. The pinned upstream commit lives in `.shared-ui.json`.

```bash
npm run shared-ui:check                    # CI guard: fail if a vendored file has drifted
npm run shared-ui:sync                     # re-copy the pinned files
npm run shared-ui:sync -- --ref <sha>      # move to a newer upstream commit, then sync
```

Do not edit `src/components/ui/*` here — those copies are overwritten by the next sync. Change
the file in `nexus-shared-ui`, then re-pin and sync.

`src/context/profileContext.js` is **not** shared: the patient profile shape differs from the
doctor's, so this portal owns it. The doctor-only profile components
(`ProfileView`, `CertificateModal`, `QualificationModal`) are intentionally absent here.

---

## Project structure

```
src/
├── api/            # appointments, auth, chat, client, community, doctors, notifications
├── auth/           # AuthProvider, session helpers, login/register/reset screens
├── components/
│   ├── chat/       # message list, composer, members panel, report modal
│   ├── form/       # booking and profile forms
│   ├── layout/     # MainLayout, Sidebar, TopBar
│   ├── profile/    # profileUtils (vendored)
│   └── ui/         # vendored design system: primitives, Post, Comment, Reply, …
├── context/        # notificationsContext (vendored), profileContext (portal-owned)
├── hooks/          # useChatHub (vendored) and portal-specific hooks
├── pages/          # Home, Doctors, DoctorDetails, BookAppointment, Appointments,
│                   # Profile, Notifications, CommunityLayout, Forums, ForumsDetails,
│                   # ChatRooms, ChatRoom
├── routes/         # router definition + ProtectedRoute
└── utils/          # date formatting (vendored) and helpers
```

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server at `http://localhost:3000` |
| `npm run build` | Production build in `build/` |
| `npm run shared-ui:sync` | Copy the pinned `@nexus/shared-ui` files into this portal |
| `npm run shared-ui:check` | Fail if a vendored file has drifted from the pinned upstream |
| `npm test` | Run the Jest suite bundled with `react-scripts` (single run when `CI=true`) |

The suite covers credential-free logic in `src/utils/chat.js`: room permissions
(`canDeleteChatMessage`, `canReportChatMessage`, `canManageChatMemberRole`, `canModerateRoom`),
optimistic/server message merging, and the room-event merges that must not import another user's
role or message content. No test framework was added — `react-scripts` ships Jest, and the tests
assert plain functions, so no DOM library is required. `src/setupTests.js` no longer imports
`@testing-library/jest-dom` (that package is not a dependency here, and the scaffolded import made
every suite fail to start).

---

## Deployment

Hosted on [Vercel](https://vercel.com) as project **`mental-health-ochre`** in the
`alaa-ebrahims-projects` team.

**The project is not connected to GitHub**, so pushing does **not** trigger a build. Production is
deployed from the CLI:

```bash
npx vercel --prod
```

`REACT_APP_API_URL` and `REACT_APP_IMAGE_BASE_URL` are stored as **Production** and **Development**
environment variables in the Vercel project settings; they are not read from `.env` during a hosted
build. A `Preview` environment value was not configured because preview builds require a Git
connection. Because `REACT_APP_*` values are inlined at build time, changing one requires a
redeploy.

The `vercel.json` at the project root rewrites every non-asset path to `/index.html` so
client-side routes such as `/doctors/123` resolve on a hard refresh.

Older deployments stay under the same project, so a previous release can be promoted again as a
rollback.

---

## Known limitations

- Registration creates a patient (`user` role); doctor accounts are created through the separate doctor flow.
- The whole signed-in area requires a token **and** the `user` role; unauthenticated or wrongly-roled visitors are redirected to `/login`.
- Booking requires an authenticated session.
- The chatbot is a third-party Chatbase embed with a fixed `chatbotId` in `public/index.html`; it is not configurable by environment variable.
- Unit coverage exists for chat permission and merging logic only. Sign-in, booking, chat, and
  payment flows have **not** been exercised end to end in a browser, and the portal has no
  component-level tests.
- Vercel Git integration is not enabled, so deployments are manual (see above).

---

## Related repositories

| Repository | Description |
|-----------|-------------|
| [mental-mediator-api-graduation-project](https://github.com/AlaaEbrahim0/mental-mediator-api-graduation-project) | ASP.NET Core 8 backend API |
| [mental_mediator_doctor_ui_graduation_project](https://github.com/AlaaEbrahim0/mental_mediator_doctor_ui_graduation_project) | Doctor portal |
| [nexus-shared-ui](https://github.com/AlaaEbrahim0/nexus-shared-ui) | Shared UI library (canonical source) |

---

> Graduation project · Computer Science 2026 · Alaa Ebrahim
