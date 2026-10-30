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

## Added 30 Oct (afternoon), all accepted
- "Message on Helloo" inside Gloobal: on receipts, shop pages, Pay & Services search.
- Requests also land in Gloobal (notification + history, same Pay button). One record, two apps.
- Shop ordering in the thread: Menu button → items → basket → Pay on GLOOBAL; order card
  both sides see; owner quick replies (Order received / Ready in 10 min / Ready / Sold out).
- Split a bill in groups: one card, a request per person, each pays on GLOOBAL. Groups ≤ 50.
- Calls: voice only in v1 (WebRTC + relay); video a release later.
- Voice notes first (hold-to-record, ≤ 2 min), photos next, then documents/location.
- Tab renamed Pad → Dial. Me shows one line ("₹0 in fees · 31 free minutes this month").
- Presence: Online only while open, Last seen otherwise, switchable off; typing only 1-to-1.
- Server: one Helloo service on Render accepting only a Gloobal token; messages in Mongo
  (90-day retention option), presence in memory, push via Gloobal's subscriptions; every
  money card read from Gloobal's API by transaction id, never copied.

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

## Why Helloo exists (decided 30 Oct, evening) — your attention has a price
- Mutual contacts (both saved each other) reach you free. So does anyone you tap Allow on.
- Everyone else sees your price card BEFORE the first message or call and must agree.
- Two bars, 0–7 in your currency, same scale: "People I don't know" and "Businesses".
  One value = per message AND per started minute. 0 = Free. A switch blocks the group.
- Charged on delivery: a message when it reaches you; a call per started minute, first
  10 seconds free (a misdial costs nothing). Taken from their Gloobal balance, settled to
  yours at once, 100% yours. Gloobal takes nothing.
- Reply or Allow makes that person free from then on. Block ends it.
- Paid messages carry a "Paid you ₹2" badge; a paid call shows a meter to both sides.
- Me → Who can reach me (bars, earned this month, turned away, always-free list) and
  Me → Paid to reach me (who paid, what for).
- Server: price stored per account; a stranger's first send/call goes through an
  "agree" step; each delivery/minute posts a Gloobal transfer (type `attention`) from
  payer to receiver; refused when the payer's balance can't cover the next unit.
- Tomorrow, satellite: the same protocol — store-and-forward messages, low-bitrate voice —
  carried over a satellite link where there is no network. Designed in from the start:
  every message is a small signed record that can wait and be delivered later.
- Give some back: after a paid call (or any paid chat), the receiver can refund any
  share, 0–100% on a bar (quick chips Keep all / 25% / 50% / All of it). It is an
  ordinary Gloobal payment back to the payer; both chats get a "gave back" card.
  Available right after the call ends and any time from Paid to reach me.
