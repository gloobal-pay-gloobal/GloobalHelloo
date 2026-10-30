# Gloobal Helloo

A communication app you enter with your GLOOBAL ID. Free calls and
messages, every country; paying somebody is one tap away because they are
the same account as on Gloobal.

- Lives at `D:\Gloobal-helloo`, beside `D:\gloobalv3`. Separate repo, own
  patches (`patches-helloo\0001-…`), own Netlify site.
- Signs in against the Gloobal API: same GLOOBAL ID, same PIN, same token.
- `docs/prototype/Gloobal_Helloo.html` is the founder's design prototype,
  the reference for every screen. It is a prototype: everything in it is
  on one phone with no server.

## Run it and put it live

The app is a Vite PWA in `gloobal-helloo-preview/`. Its `src/HellooApp.jsx`
is generated: Gloobal's bundle first, then Helloo's modules from
`frontend/`, stacked by `build_app.mjs`. The generated file is committed, so
Netlify builds it without needing the Gloobal checkout.

```powershell
cd D:\Gloobal-helloo\gloobal-helloo-preview
npm install
npm run dev          # http://localhost:5173
```

After changing anything in `frontend/` (or after Gloobal changes):

```powershell
cd D:\Gloobal-helloo
node build_app.mjs   # reads ..\gloobalv3\gloobal-essentials-preview\src\GloobalApp.jsx
```

then commit the regenerated `gloobal-helloo-preview/src/HellooApp.jsx` with
the change.

Netlify settings live in `netlify.toml` (base `gloobal-helloo-preview`,
command `npm run build`, publish `dist`).

**What is live (Release 1, steps 1–4).** Sign in with a GLOOBAL ID and
PIN; contacts are the people you have paid or been paid by on GLOOBAL; chats,
voice notes and Pay-in-chat run on the GLOOBAL API (`/api/helloo/...` in
GloobalV3's `server/lib/helloo.js`) with a live WebSocket and Web Push for
when the app is closed. Calls, prices for strangers, Share nearby, letters
and Activity are the next steps in `docs/SPEC-v1.md`; their screens are in
`frontend/` but the app does not open them yet.

To run against a local GLOOBAL server, copy `gloobal-helloo-preview/.env.example`
to `.env` and set `VITE_API_URL` (the server must list your dev origin in
`ALLOWED_ORIGINS`). `frontend/HellooDemoData.jsx` holds sample people for
screenshots only; it is not in the build.
