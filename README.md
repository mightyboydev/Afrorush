# AfroRush

AfroRush is a Lagos-flavoured life-sim / okada racing game built on **Next.js 16 + React 19 + React Three Fiber + Firebase**. You live in a "yard / motor-park corner", keep your needs up, race through Lagos traffic, run jobs, buy bikes & outfits, manage your crew, and DM other players in real time.

## Quick start

```bash
bun install          # or: npm install / pnpm install
bun run dev          # or: npm run dev
# open http://localhost:3000
```

You will need a `.env` file in the project root with Firebase Admin credentials (see `.env.example`). The browser-side Firebase config is hard-coded in `src/lib/firebase.ts` — replace it with your own project if you fork.

## What's in this build

### `/hub` — the player's home (this redesign)
- **3D yard** (`src/world/HomeRoom.tsx`): an isometric compound with concrete slab + dirt edges, perimeter block fence with an entrance gap, Ankara cloth on the fence, grass tufts, a parked **okada**, three **plastic chairs**, a **suya grill** with glowing coals + suya sticks + animated smoke, a **generator**, a **side table with pure-water sachets** and a soft drink, a **clothes line** with hanging Ankara clothes, a **potted plant**, and a **spinning fan mounted on a pole**.
- Smaller player avatar standing in the scene (not a giant mannequin), with idle sway and soft contact shadows.
- **WebGL fallback**: if WebGL is unavailable, the scene degrades to a warm CSS-gradient + emoji character — the page never hard-crashes.
- **Top status bar** (`src/app/hub/page.tsx`): compact frosted-glass pill — avatar + clock + weather + level on the left, money pill with `+` button on the right, tiny online/streak/rep chips below.
- **Removed** the horizontal location pills — locations now live only in the Map tab. The Home tab has one "Explore Lagos" button to jump to Map.
- **Needs** (`src/components/NeedsBar.tsx`): tight horizontal row of circular SVG progress rings, pulsing red when low.
- Today's Task + Daily Gems are small secondary cards.

### Real DMs (the "I can't text other users" fix)
The Messages app now uses **real Firestore DMs** instead of mock contacts:
- `searchPlayersByUsername(prefix)` — case-insensitive prefix search in `users` collection.
- `sendDm(from, toUid, toName, text)` — writes to `dm_chats` with a stable `chatId` (sorted uid pair).
- `subscribeToDms(uid, cb)` — live `onSnapshot` of all DMs where you are sender or recipient. Falls back to two queries if the composite index isn't built yet.
- `MessagesApp` (`src/components/PhoneScreen.tsx`) lists real conversations, supports debounced username search, sends real messages, and updates in real time.

### Real peer-to-peer cash transfer (the Lagos Life viral hook)
The Bank app now does **real** transfers — not the previous demo that only debited the sender:
- `findPlayerByUsername(username)` — exact-match lookup in `users` collection.
- `transferCash(from, recipientUsername, amount, note)` — atomically debits sender, credits recipient (with refund-on-failure), and **sends the recipient a DM notification** (`💸 You don receive ₦X from @sender`) so they see the money land in real time. This is the killer viral loop from Lagos Life.
- Bank UI shows a "Your Handle" card with **Share to WhatsApp / Share to X / Copy handle** buttons so players can post their handle on social media and ask for "blessings".
- Bank also lists recent transfer DMs as a transaction history.

### Share score (viral loop)
- After every race, the **RaceResultOverlay** now has Share to WhatsApp and Tweet buttons with
  auto-generated shareable text including distance/score/cash/handle.
- The Home hub top bar has an always-visible Handle chip (@username) with the same
  share buttons — drop your handle on Twitter/WhatsApp anytime to ask for blessings.

### Multiplayer Race (serverless — no socket server needed)
Following the Lagos Life "lightweight architecture" rule: complex 3D is stripped out in favor of a 2D `<canvas>` rendering engine synced over atomic Firestore fields.

- **`race_rooms/{roomId}`** Firestore document — one doc per race. Players write their own `players[uid]` sub-object (lane / distance / speed / yOffset / isJumping / lastUpdated) and listen via `onSnapshot` for opponents' positions. No socket server, no Cloud Function needed.
- **Throttled writes** — client pushes to Firestore ~12 times/sec (every 5 animation frames), so a room with 4 players = ~48 writes/sec total — well under Firestore's free-tier 1k docs/sec budget.
- **3-lane runner** with Lagos obstacles: danfo buses (yellow), agbero (street toll collectors), potholes, suya carts, pure-water sellers. Some obstacles can be jumped over.
- **Tracks**: Third Mainland Bridge, Ikeja Traffic, V/I Beach Road — each with a distinct colour theme.
- **3 input methods**: arrow keys, swipe (mobile), tap (jump).
- **Matchmaking**: Host creates a room → gets a 6-char code → shares on WhatsApp/X → friends open AfroRush → tap Multiplayer → enter code → race.
- **Win condition**: First to 2000m wins; placement calculated from opponents' distances. Cash/rep rewards for top 3.

#### Firestore helpers (`lib/firestore.ts`)
- `createRaceRoom(host, track)` — generates a 6-char code, creates the room doc, returns the code.
- `joinRaceRoom(player, code)` — adds the player to `players[uid]`.
- `subscribeToRaceRoom(code, cb)` — live `onSnapshot` of the room doc.
- `updateRacePlayerState(code, uid, partial)` — throttled sub-field update.
- `startRaceRoom(code, host_uid)` — host-only flip from lobby → racing.
- `leaveRaceRoom(code, uid, isHost)` — removes player, promotes next host if host left, deletes room if empty.

### Firestore rules
`firestore.rules` now contains a `dm_chats` block:
- `read` — only signed-in participants (`fromUid` or `toUid` == `auth.uid`).
- `create` — only the sender (`fromUid` == `auth.uid`), text 1–1000 chars.
- `update` — only the recipient, and only the `read` field.
- `delete` — never.

You **must publish these rules** in the Firebase Console (Firestore Database → Rules → paste → Publish) for DMs to work in production.

### Composite indexes (auto-created)
The `subscribeToDms` `or()` query needs a composite index on `dm_chats`: `(fromUid ASC, createdAt ASC)` and `(toUid ASC, createdAt ASC)`. Firestore auto-generates these the first time the query runs — click the link in the console error to create them with one click. If you'd rather skip indexes, the code already falls back to two simpler queries and merges client-side.

## Project layout

```
src/
  app/
    hub/page.tsx          # Home screen (3D scene + top bar + tabs + overlays)
    admin/                # Admin panel (users, moderation)
    privacy, terms        # Static legal pages
  components/
    BottomNav, NeedsBar, PhoneScreen, BuyScreen, MapScreen, Joystick,
    Race3D, RaceResultOverlay, SuyaOverlay, CrewOverlay, MotorParkOverlay, …
    ui/                   # shadcn/ui primitives
  world/
    HomeRoom.tsx          # 3D yard (this redesign)
    City.tsx              # Open-world Motor Park scene
    Player, NPCs, Roads, Buildings, Environment, Weather, OtherPlayers
  lib/
    firebase.ts           # Browser Firebase init (hard-coded project)
    firebase-admin.ts     # Admin SDK (server-side, .env credentials)
    firestore.ts          # Profiles, crews, presence, leaderboards, DMs
    storage.ts            # Catalog data, types, pure helpers
    auth.tsx              # AuthProvider context
  game/
    AfroRushScene.ts      # Phaser race engine
```

## Available scripts

```bash
bun run dev      # next dev -p 3000 (tee dev.log)
bun run build     # next build
bun run start     # bun .next/standalone/server.js (after build:self)
bun run build:self # standalone build + copy static + public
bun run lint
```

## Tech stack

- **Next.js 16** (Turbopack), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** + `tw-animate-css`
- **@react-three/fiber** + **@react-three/drei** + **three** for 3D
- **Phaser 3** for the racing mini-game
- **Firebase** (Auth + Firestore + Admin SDK)
- **shadcn/ui** components
- **framer-motion**, **sonner**, **vaul** for UI polish

## Mobile-first
Everything is sized for a phone screen — bottom-tab navigation, frosted glass dock, safe-area padding (`safe-pt` / `safe-pb`), touch-friendly tap targets.

## Known pre-existing issues (not introduced by this redesign)
- `Race3D` returns a result without `newHighScore` / `prevHighScore` fields; `hub/page.tsx` `setRaceResult` has a type mismatch. Doesn't block runtime.
- Some Phaser callback signatures in `AfroRushScene.ts` use `void` where Phaser expects `boolean | null`. Doesn't block runtime.
- `src/app/admin/*` has a few `Record<string, unknown>` casts. Doesn't block runtime.

All of the above pre-date this redesign.

## License
Proprietary — AfroRush.
