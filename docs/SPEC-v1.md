# Gloobal Helloo — version 1

Decided with the founder on 30 Oct 2026. The prototype in
`docs/prototype/Gloobal_Helloo.html` is the reference for how every screen looks.

## Decisions
- Chat first, calls second: text, photos, voice notes go live first;
  voice/video calls (WebRTC, own relay) are the next release.
- Pay opens Gloobal: Helloo never moves money. Send opens Gloobal's Send
  Money with the person filled in; Request drops a card the other person taps.
  Payments show as receipt cards in the thread; Complain reachable from them.
- Server-stored chat: private to its people, works across phones, support can
  read if asked. Not end-to-end encrypted.
- Tabs: Chats · Calls · Pad · Me.
- Communities, broadcast lists, linked devices and scheduled calls: KEPT in
  the plan (founder did not cut them); build after the core, before calls.

## Entry
- Splash → symbol pad. GLOOBAL ID (or mobile number) + Gloobal PIN, against
  the Gloobal API. Same token, same App lock (5 min away → PIN).
- Unknown ID → "Create it on Gloobal" (opens Gloobal registration).

## Tabs
- Chats: list, search, Unread/Groups chips, pinned, muted, archived; long-press menu.
- Calls: history (voice/video/missed), favourites, call back.
- Pad: circular symbol pad; dial any GLOOBAL ID → message or call; Scan QR.
- Me: Gloobal's ID card (photo, name, symbols, Copy), My QR, Notifications,
  Privacy, App theme, Blocked, Storage.

## People
- By GLOOBAL ID only: dialled, scanned, paid before, or they messaged first.
  No phone-book upload. Suggested: people you've paid / who paid you.
- Shops show as their shop name with a Store button.

## Thread
- Text, photos, voice notes, reply, forward, react, star, delete (me/everyone),
  search in chat. Ticks, typing. Header: name, presence, call/video, menu
  (mute, disappearing, wallpaper, block, report, export).
- Pay button in the composer (Send / Request).

## Groups (v1): create, name + photo, admins, leave. Group calls later.
## Notifications: push via Gloobal's push setup; tap opens the thread.
## Server: separate Render service (helloo-api) verifying the Gloobal token;
   chats, presence, later the call relay. Netlify site: gloobal-helloo.

## Build order
login → Me + ID card → Pad + contacts → chat server + thread → groups →
Pay cards → push → communities/broadcast/linked/scheduled → calls.
