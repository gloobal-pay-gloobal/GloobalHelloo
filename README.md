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

**Today this is a demo.** Every person, chat, figure and payment comes
from `frontend/HellooDemoData.jsx` and the samples in `HellooApp.jsx`;
nothing is sent anywhere. Sign-in, chats, calls and pricing go live once
the Helloo server is built (Release 1 order in `docs/SPEC-v1.md`).
