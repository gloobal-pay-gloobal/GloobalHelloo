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

## Share nearby (creator side) — decided 30 Oct, night
- A creator writes a message (+ photo, Open shop button), picks a circle (1/2/5/10 km),
  the most they'll pay one person (bar 0–7), and a budget. Live estimate shows how many
  people at each price the budget reaches.
- Who: Gloobal already knows — the address every account registered with its bank.
  Helloo asks Gloobal's server for the people in the circle; it never tracks anyone.
- Each person is paid THEIR OWN Businesses price, nearest first, only if ≤ the creator's
  max, until the budget is spent. Blocked never hear of it.
- Budget held from the creator's Gloobal balance at Share (PIN on Gloobal); each delivery
  pays that person at once; unused comes back after 48 h.
- The offer lands as a card: photo, "1.4 km from you", "Paid you ₹2", Open shop, Reply · free.
  A reply opens a free chat both ways.
- Results screen: delivered / opened shop / replied, paid so far, held, coming back,
  replies list, Add budget.
- No receiver-side caps: unknown senders always pay or ask.

## Ask instead (free) — both message and call
- The price card offers "Ask first instead · free": one line (≤120 chars), nothing delivered
  until the other person decides. Same for calls ("Ask to call · free").
- Receiver: a "people want to reach you" row on Chats → Requests screen → Decline,
  Allow once / Allow this call, or Allow · free (makes them a contact on your side).

## Me → Money (decided 30 Oct, night) — all time, month picker
- Earned: total + vs last month + payers; daily bars (messages vs calls); people vs
  businesses; top payers; gave back / attention kept (hours) / turned away; "if your price
  had been" what-if from the month's traffic with one line of advice; all-time in Gloobal Bank.
- Spent (creators): total, orders it brought, back per rupee, cost per order; reach per
  rupee per share (delivered/opened/replied/ordered, cost/order); where it landed by area
  (never a point); best hour and best max price from own shares; orders within 48 h of a share.

## Activity (Time · Earned · Spent) and Professional mode — decided 30 Oct, night
- Me → Activity: three faces. Time: minutes on calls and in chats by day; personal vs
  professional; free vs paid-to-you; busiest hour/day; with whom (bars, calls, msgs);
  daily limit, quiet hours, per-person limits — Helloo tells you, never stops you.
- Every chat has a Personal ↔ Pro switch. Pro turns the composer into a letter
  (subject, greeting, body, sign-off with name and title), landing as a letter card with
  "Read on <date, time>", Reply and PDF. Quick professional replies above the composer.
- 19 prebuilt letters in four sets: Business (Quotation, Invoice reminder, Order
  confirmation, Delivery update, Meeting request, Thank you), Work & jobs (Job application,
  Leave request, Appointment, Follow-up, Resignation), Government & bank (Complaint, KYC /
  documents, Loan query, Address change), Personal formal (Notice to landlord, School leave
  note, Invitation, Condolence), plus Blank. Blanks are tapped through; preview updates live.

## Improvements accepted (30 Oct, late) and RELEASE 1 scope
- Letters in the other person's language: each template carries translations (Hindi,
  Tamil, Bengali, … ); the one offered follows the script of the other person's name.
- Voice-to-letter: hold the mic in Pro mode, Helloo fills the blanks; receiver has Hear it.
- One card family for all money: green = money moved (receipt, order paid, refund given,
  paid-to-reach, offer paid), purple = money asked (request, split share, order unpaid).
  One server record type (`attention` / `request` / `payment` by Gloobal transaction id).
- Price follows you to Gloobal: the "Who can reach me" bars also gate Gloobal's
  payment-request notifications and shop messages. One setting, both apps.
- Share estimate shows "~N have Helloo and see it now; the rest get a GLOOBAL notification".
- Seed contacts from Gloobal payments: paid / paid-by → mutual contacts on first run.
- Pro mode default by contact type (shop, business, titled → Pro); remembered per chat.
- Limits and quiet hours OFF by default; the Time page leads with facts, not "over by".

### Release 1 (build in this order)
1. Login against the Gloobal API (Continue with GLOOBAL handoff; ID/mobile + PIN fallback)
2. Me with the ID card, My QR; seeded contacts
3. Dial + Scan + contacts by GLOOBAL ID
4. Helloo server: chats, presence, voice notes (hold-to-record), text; the thread
5. Price bars, price card, pay-to-reach (messages), Ask, Requests
6. Share nearby (creator) + offer card
7. Business letters (Pro mode), in the other person's language
8. Activity: Time + Earned
9. Push notifications
Later: calls (voice), groups + split, orders in thread, Spent face, area map, best hour/price,
per-person limits, quiet hours, Government & Personal letter sets, communities etc.

## Themes (30 Oct, late)
- Six app themes in Me → App theme, each with its own shape, surface, type and wallpaper,
  not just colours: GLOOBAL (house style), Aurora (dark glass over an aurora, floating tab
  bar), Paper (ink on white, Fraunces serif, hairlines, square corners), Bazaar (marigold +
  peacock teal, Baloo 2 / Poppins, rangoli chat wallpaper, round), Sky (pastel sky, glass
  cards, Poppins, floating bar), Graphite (near-black, amber, DM Mono, sharp, ruled chat).
  Default follows the phone: GLOOBAL in light mode, Aurora in dark mode. Remembered per device.
  index.html must load: Space Grotesk, Fraunces, Baloo 2, Poppins, DM Mono, Inter.
- A theme is one set of tokens written into T and HT (applyHellooTheme); no screen knows
  which theme it is in. Money colours keep their meaning: green = moved/free, red = warning.
