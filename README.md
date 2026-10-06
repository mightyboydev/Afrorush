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
