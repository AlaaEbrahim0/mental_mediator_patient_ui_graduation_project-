# Changelog

All notable changes to this project are documented in this file.

The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). The portal's own version is
`0.1.0` in `package.json`; the reproducible identifier for shared code is the commit pin
in `.shared-ui.json`.

## [Unreleased]

### Changed — premium feature cards (2026-11-03)

- The flat bordered cards became gradient-framed surfaces: a 1px frame that
  lights in the card's accent hue on hover, a cursor-following spotlight, a
  corner bloom, glowing gradient icon tiles with a spring lift, and a mono
  trust badge naming the mechanism behind each claim (SignalR, fail-closed
  ML, PBKDF2-style server rules). Component in `FeatureCards.js`.

### Added — platform hero (2026-11-03)

- **Hero carousel.** The booking mock left the hero (it repeats two
  scrolls down) and a product tour cycles four surfaces in one window
  frame — community post with photo, live room with animated typing,
  appointment confirmation, private check-in with trend ring — auto-
  advancing, pausing on hover, with clickable dots.
- **Rotating slogans** under the headline ("For the 3am thoughts." …).
- **Feature marquee** under the hero: two infinite opposite-direction
  rows naming twelve platform capabilities.
- **Anonymity interactive demo** between the community band and Safety:
  a switch morphs a post's author between Anonymous and a named member.
- **Two more feature cards** (private check-ins, patient ratings); the
  grid rebalanced to three columns.

### Added — hero redesign (2026-11-03)

- **Product-forward hero.** The line-art card is replaced by an app-preview
  mock — a window-framed booking screen (clinician row with rating badge,
  open-day chips, time slots, fee summary and confirm button) built from the
  same availability data the booking demo uses, tilted in 3D with one photo
  chip over the corner. A social-proof row (clinician avatars, 4.4 average
  from 14 patient ratings) sits under the checklist; the overlapping floating
  stat cards and the second photo chip were removed.
- **Community band** now shows three threads per category.

### Added — 2026-11-02 pass

- **Brand logo.** New inline-SVG `BrandLogo` (heart-pulse + ECG mark on a
  navy→teal gradient tile) replaces the raster `logo-no-background.png` and the
  bootstrap heart glyph in `TopBar`, `AuthLayout` and the landing header/footer.
  Favicon, `logo192/512` and the PWA manifest icons are rendered from the same
  SVG.
- **Landing photography.** License-free photos hosted on the project's own
  Cloudinary: two hero photo chips, room-cover images in the Rooms showcase,
  and a group-circle accent on the Final CTA.
- **Landing interactivity.** "What brings you here today?" mood chips scroll to
  and highlight the matching section; Live numbers count up on view; the hero
  figure drifts in a gentle loop. All reduced-motion-safe.
- **Doctor ratings UI.** Average + count badge on doctor cards; a Patient
  ratings card on `DoctorDetails` with a star picker, optional comment,
  upsert/remove of the caller's own rating and the recent list.

### Fixed — 2026-11-02 pass

- **Horizontal scroll on 320px phones.** The Rooms showcase grid could inflate
  past the viewport via grid children's automatic minimum size; pinned with
  `min-w-0` on both columns.
- **Booking day strip did not scroll.** `fieldset`'s UA default
  `min-width: min-content` sized the day row to its chips (752px inside a
  616px card), so `overflow-x-auto` had nothing to scroll and later days were
  clipped. Fixed with `min-w-0` on the fieldset and `minmax(0,…)` on the
  landing fr grids; a right-edge fade marks the strip scrollable past five
  open days.
- **Live numbers jittered at zero.** `CountUp` rebuilt its match array every
  render, re-triggering its own effect in an infinite loop; memoised and the
  animation now runs once on view.
- **Community band overflowed the showcase.** Capped at five threads per
  filter (the badge still reports the true total) and seeded posts with photos
  now show their first image as a thumbnail. Hero photo chips appear from md
  up.

### Added

- **Landing artwork.** Hand-drawn SVG figures in `src/components/figures/Figures.js`:
  a telehealth hero illustration replacing the reused `loginPhoto.png` in the 3D tilt
  card, a calendar/chat/heart motif beside the Features header, a faint community-node
  motif behind the dark Community band, and a brain-and-nervous-system diagram in the
  Safety band. Static SVG — no new keyframes, no vendored file touched — so they
  respect reduced motion by construction.
- **Auth shell upgrade.** The `AuthLayout` left panel now carries a navy→primary
  gradient with a new brain/dendrite line-art figure; applies to sign-in, registration
  and forgot-password.
- **Community media previews.** Home dashboard "From the community" cards show up to
  three attachment thumbnails (videos as a play tile), mirroring the media
  normalisation in `Post.js`.

### Changed

- `resetPassword.js` now renders through `AuthLayout` instead of its own
  near-duplicate split shell.

### Docs

- AGENTS.md: dropped the stale `ExternalLoginGate`/`handoffClient` rules (code removed
  in `711103c`) and corrected the suite count to 5 suites / 59 tests.

## [0.1.0] - 2026-11-01

Navigation, chat-media, and vendoring polish pass. No routes, no data contracts, and no
authorisation behaviour changed — the .NET API remains the source of truth for who may do
what.

### Added

- **Chat photo and video attachments.** The message composer (`ChatComposer.js`, now
  vendored) has an attach control accepting `image/*,video/*`, a local size pre-check
  against the API's storage caps (5 MB images, 20 MB videos) so an oversized pick fails
  before a long upload starts, a thumbnail preview with the file name, an accessible
  percentage progress bar (`role="progressbar"`), an "Uploaded" / failure line, and a
  remove-attachment button. Media is uploaded immediately on pick to
  `POST /api/chat/rooms/{roomId}/media`; the draft and attachment stay on screen until the
  send succeeds, and sending is blocked while an upload is running or has failed.

### Changed

- **Re-pinned `@nexus/shared-ui` to `f082cb5d2f2d45de0b38f43fbea2cc9de9f7d1fd`.**
  This portal now vendors **45 files** and `npm run shared-ui:check` reports
  `In sync with @nexus/shared-ui@f082cb5 (45 files)`.
- **Chat code moved upstream.** `src/api/chat.api.js`, `src/utils/chat.js`, and the chat
  components `ChatComposer.js`, `CreateRoomModal.js`, `ReportMessageModal.js`, and
  `RoomReportsPanel.js` joined the vendored set, so their portal-local copies are now
  synced artifacts and must not be edited here.
- **Sidebar room list is collapsible.** The "Rooms" section toggles with
  `aria-expanded`, shows a count badge, keeps a separate "View all" link, and renders an
  empty state when the patient has joined nothing yet.

### Fixed

- **Mobile navigation drawer.** The drawer and its backdrop now have explicit stacking
  levels — backdrop `z-30`, panel `z-50`, top-bar dropdowns `z-[60]` — so an open drawer
  is no longer painted below page content. The panel is `fixed` under 1024px and
  `lg:sticky` above it.
- **Sidebar viewport and collapse behaviour.** The drawer tracks a `< 1024px` viewport on
  resize, closes on `Escape` and on backdrop click, restores focus to `#sidebar-toggle`,
  locks background scroll while open, sizes itself with `100dvh` instead of `100vh` so
  mobile browser chrome cannot clip the footer, and the closed panel is marked `inert`
  with `aria-hidden` and `tabIndex={-1}` on its links so it cannot be tabbed into.
- **Failed messages are withdrawn from the transcript.** When a send is rejected, the
  optimistic message added on submit is removed by its `clientMessageId` and an error
  toast is shown, instead of leaving an unsent bubble in the list.
- Chat rendering no longer depends on portal-local copies of the composer and report
  panels, so the patient and doctor views of the same room stay consistent.

## Notes on this release

`npm test` (Jest via `react-scripts`): **6 suites / 75 tests**, all passing.
`CI=true npm run build` is clean; with `CI=true` ESLint warnings fail the build.
