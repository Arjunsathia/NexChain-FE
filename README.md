# NexChain Frontend

React 19 + Vite + Tailwind CSS 4 frontend for NexChain, a crypto paper-trading platform. It talks to the [NexChain API](../NexChain-backend) and streams live prices directly from Binance.

## Setup

```bash
npm install
cp .env.example .env     # point it at your API (see below)
npm run dev              # http://localhost:5173
```

The API must be running too (`npm run dev` in `NexChain-backend`), with `CLIENT_URL=http://localhost:5173`.

### Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL, ending in `/api` (e.g. `http://localhost:4001/api`) |
| `VITE_WS_URL` | API WebSocket URL for order and alert notifications. Optional: derived from the API URL |
| `VITE_BINANCE_WS_URL` | Binance stream host (switch to `wss://stream.binance.us:9443` where binance.com is blocked) |
| `VITE_BINANCE_REST_URL` | Binance public REST host for price charts (`https://data-api.binance.vision` allows browser requests) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id; must equal the API's `GOOGLE_CLIENT_ID` |

`VITE_*` values are baked into the build, so restart `npm run dev` (or rebuild) after changing them. Never put secrets here.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Production build / serve it locally |
| `npm test` | Vitest (session handling, route guards, helpers) |
| `npm run lint` | ESLint |

## Notes for contributors

- **Auth:** the access token lives only in memory (`src/api/axiosConfig.js`). On load, `SessionManager` restores the session from the API's httpOnly refresh cookie. Never store tokens or user objects in `localStorage`. Log out with the `useLogout` hook.
- **Route guards:** `ProtectedRoute` (signed in), `AdminRoute` (admin role) and `AuthRoute` (signed out). They're UI guards only; the API enforces every rule itself.
- **Live prices:** use `useLivePrice(coinId)` for one coin (re-renders only when that coin changes) or `useBinanceTicker()` for all. Both share one socket (`src/lib/tickerStore.js`) that opens only while something is subscribed. Coin id → Binance pair mapping lives in `src/utils/coinRegistry.js`.
- **Pages are lazy-loaded** (`src/Routes/AppRoutes.jsx`). Keep heavy libraries out of `App.jsx` and the layouts so the first load stays small.
- **Theme:** `dark:` classes follow the app's toggle (the `.dark` class), configured in `src/index.css`. There is no `tailwind.config.js` in Tailwind 4.
- **Shared helpers:** `utils/format.js` (currency, compact numbers, relative time), `utils/avatar.js`, `utils/a11y.js` (`pressable()` for clickable rows), `utils/safeUrl.js` (third-party links).

## Deploying (Vercel)

Set the `VITE_*` variables in the Vercel project (production values: the Render API URL and the production Google client id). `vercel.json` serves the SPA, caches hashed assets for a year and sets basic security headers.
