// frontend/hellooClient.jsx
//
// Helloo talking to the real GLOOBAL API: the /api/helloo routes, the live
// socket, push, voice notes, and the adapters that turn what the server
// sends into the shapes the screens draw.
//
// Everything rides on Gloobal's own client (gloobalApiClient, the session
// store, the sliding token), which is in this bundle because Helloo is
// built on top of Gloobal's. Same ID, same PIN, same token.
import { useState as useStateH11, useEffect as useEffectH11, useRef as useRefH11 } from "react";

var HELLOO_SITE = "https://gloobalhelloo.netlify.app";
var HELLOO_GLOOBAL_SITE = "https://gloobalv3.netlify.app";

// ── Sides ───────────────────────────────────────────────────────────────
//
// One GLOOBAL account can use Helloo as the person or as a shop it runs.
// The side in use is remembered per account on this phone and sent with
// every Helloo request as ?as= : "self", or the shop's account id. Empty
// means nothing was chosen (an account with no shop never chooses).
var HELLOO_FACE_KEY = "helloo.face";
var hellooFaceNow = { account: "", as: "" };
function hellooFaceLoad(accountId) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(HELLOO_FACE_KEY) || "null"); } catch (e) { /* private window */ }
  hellooFaceNow = saved && accountId && saved.account === accountId && typeof saved.as === "string" ? { account: accountId, as: saved.as } : { account: accountId || "", as: "" };
  return hellooFaceNow.as;
}
function hellooFaceSave(accountId, as) {
  hellooFaceNow = { account: accountId || "", as: as || "" };
  try { localStorage.setItem(HELLOO_FACE_KEY, JSON.stringify(hellooFaceNow)); } catch (e) { /* private window */ }
}
function hellooAs(path) {
  const as = hellooFaceNow.as;
  return as ? `${path}${path.indexOf("?") === -1 ? "?" : "&"}as=${encodeURIComponent(as)}` : path;
}
var hellooHttp = {
  get: (path, options) => gloobalApiClient.get(hellooAs(path), options),
  post: (path, body, options) => gloobalApiClient.post(hellooAs(path), body, options),
  put: (path, body, options) => gloobalApiClient.put(hellooAs(path), body, options)
};
// When a shop takes calls, in a few words: "Calls 10:00–18:00".
function hellooCallsText(calls) {
  if (!calls || calls.mode === "always") return "Always";
  return calls.mode === "off" ? "Off" : `${calls.from}–${calls.to}`;
}

var hellooApi = {
  // Who this account can be here. Asked without a side, so a stale one
  // can never lock the account out of finding its sides again.
  faces: () => gloobalApiClient.get("/api/helloo/faces"),
  saveCalls: (calls) => hellooHttp.put("/api/helloo/faces/calls", calls),
  contacts: () => hellooHttp.get("/api/helloo/contacts"),
  lookup: (id, face) => hellooHttp.get(`/api/helloo/people/lookup?id=${encodeURIComponent(id)}${face ? `&face=${face}` : ""}`),
  photos: (ids) => hellooHttp.post("/api/helloo/photos", { ids }),
  chats: () => hellooHttp.get("/api/helloo/chats"),
  open: (withId, face) => hellooHttp.post("/api/helloo/chats", face ? { with: withId, face } : { with: withId }),
  messages: (chatId, before) =>
    hellooHttp.get(`/api/helloo/chats/${encodeURIComponent(chatId)}/messages?limit=50${before ? `&before=${encodeURIComponent(before)}` : ""}`),
  send: (chatId, body) =>
    hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/messages`, body, { timeoutMs: GLOOBAL_API_COLD_START_TIMEOUT_MS }),
  read: (chatId) => hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/read`, {}),
  voice: (messageId) => hellooHttp.get(`/api/helloo/voice/${encodeURIComponent(messageId)}`),
  media: (messageId) => hellooHttp.get(`/api/helloo/media/${encodeURIComponent(messageId)}`, { timeoutMs: 120e3 }),
  chatMedia: (chatId) => hellooHttp.get(`/api/helloo/chats/${encodeURIComponent(chatId)}/media`),
  takeBack: (messageId) => hellooHttp.post(`/api/helloo/messages/${encodeURIComponent(messageId)}/takeback`, {}),
  saved: (messageId) => hellooHttp.post(`/api/helloo/messages/${encodeURIComponent(messageId)}/saved`, {}),
  prefs: (chatId, prefs) => hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/prefs`, prefs),
  clear: (chatId) => hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/clear`, {}),
  orderStatus: (messageId, status) => hellooHttp.post(`/api/helloo/messages/${encodeURIComponent(messageId)}/order`, { status }),
  remove: (messageId, everyone) => hellooHttp.post(`/api/helloo/messages/${encodeURIComponent(messageId)}/delete`, { everyone: Boolean(everyone) }),
  presence: (accountId) => hellooHttp.get(`/api/helloo/people/${encodeURIComponent(accountId)}/presence`),
  block: (accountId, blocked) => hellooHttp.post("/api/helloo/block", { accountId, blocked }),
  blocked: () => hellooHttp.get("/api/helloo/blocked"),
  reach: () => hellooHttp.get("/api/helloo/reach"),
  saveReach: (prices) => hellooHttp.put("/api/helloo/reach", prices),
  allow: (accountId, allowed) => hellooHttp.post("/api/helloo/reach/allow", { accountId, allowed }),
  // Who can reach me, just for one person: "free" | "pay" (price 1–7, or
  // none for the usual one) | "never".
  reachPerson: (accountId, mode, price) => hellooHttp.put(`/api/helloo/reach/people/${encodeURIComponent(accountId)}`, price ? { mode, price } : { mode }),
  // The shops a person chose to show on their personal profile.
  personShops: (accountId) => hellooHttp.get(`/api/helloo/people/${encodeURIComponent(accountId)}/shops`),
  // Show the shop you are acting as on your personal profile, or not.
  saveShow: (show) => hellooHttp.put("/api/helloo/faces/show", { show }),
  // Take somebody out of your contacts until you pay or chat again.
  hideContact: (accountId, hidden) => hellooHttp.post("/api/helloo/contacts/hide", { accountId, hidden }),
  // A private chat both keep: release it once for them (your PIN), and
  // open one released for you (your PIN, within ten minutes).
  releaseChat: (chatId, pin) => hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/release`, { pin }),
  openReleased: (chatId, pin) => hellooHttp.post(`/api/helloo/chats/${encodeURIComponent(chatId)}/release/open`, { pin }),
  reachCard: (accountId) => hellooHttp.get(`/api/helloo/people/${encodeURIComponent(accountId)}/reach`),
  ask: (to, text, kind) => hellooHttp.post("/api/helloo/asks", { to, text, kind: kind || "message" }),
  asks: () => hellooHttp.get("/api/helloo/asks"),
  answerAsk: (id, action, price) => hellooHttp.post(`/api/helloo/asks/${encodeURIComponent(id)}`, price ? { action, price } : { action }),
  earnings: (month) => hellooHttp.get(`/api/helloo/earnings${month ? `?month=${encodeURIComponent(month)}` : ""}`),
  together: (accountId) => hellooHttp.get(`/api/helloo/people/${encodeURIComponent(accountId)}/together`),
  startCall: (to, video, face) => hellooHttp.post("/api/helloo/calls", face ? { to, video: Boolean(video), face } : { to, video: Boolean(video) }),
  calls: () => hellooHttp.get("/api/helloo/calls"),
  activeCall: () => hellooHttp.get("/api/helloo/calls/active"),
  callAction: (id, action) => hellooHttp.post(`/api/helloo/calls/${encodeURIComponent(id)}/${action}`, {})
};

// "Last seen today at 14:05" / "yesterday at 21:10" / "12 Oct".
function hellooLastSeenText(at) {
  if (!at) return "";
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  const day = hellooDayLabel(d);
  const clock = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (day === "Today") return `last seen today at ${clock}`;
  if (day === "Yesterday") return `last seen yesterday at ${clock}`;
  return `last seen ${day}`;
}

// A short line for a quoted or previewed message.
function hellooPreviewOf(m) {
  if (!m) return "";
  if (m.kind === "deleted") return "This message was deleted";
  if (m.kind === "voice") return `Voice note · ${Math.round((m.voice && m.voice.seconds) || m.seconds || 0)}s`;
  if (m.kind === "photo") return m.text ? `Photo · ${m.text}` : "Photo";
  if (m.kind === "sticker") return "Sticker";
  if (m.kind === "video") return m.text ? `Video · ${m.text}` : "Video";
  if (m.kind === "payment") return "Payment on GLOOBAL";
  if (m.kind === "order") { const n = ((m.order && m.order.items) || []).reduce((t, l) => t + (Number(l.qty) || 0), 0); return `Order · ${n} ${n === 1 ? "thing" : "things"}`; }
  return String(m.text || "").replace(/\s+/g, " ").trim().slice(0, 120);
}

// A picture from the phone, made small enough to send: at most 1600 px
// on its long side, JPEG, stepping the quality down until it is under
// ~550 KB (the server takes 600).
async function hellooCompressPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error("That file is not a picture.")); i.src = url; });
    let scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      for (const q of [0.82, 0.7, 0.58]) {
        const dataUrl = canvas.toDataURL("image/jpeg", q);
        const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        if (b64.length * 0.75 <= 550 * 1024) return { image: b64, mime: "image/jpeg", width: w, height: h, preview: dataUrl };
      }
      scale *= 0.75;
    }
    throw new Error("That picture is too big to send.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function hellooClientId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── People ──────────────────────────────────────────────────────────────

function hellooCountry(iso) {
  const code = String(iso || "").toUpperCase();
  const c = typeof COUNTRY_BY_ISO === "object" && COUNTRY_BY_ISO ? COUNTRY_BY_ISO[code] : null;
  return { iso: code, name: (c && c.name) || code, flag: code.length === 2 ? isoToFlag(code) : "" };
}

// Every amount in Helloo reads the way GLOOBAL's receipt does: the number
// first, then the unit — "300.00 CEL | ₹", never "CEL | ₹ 300". A sign, when
// one is wanted, goes in front of the number ("+300.00 CEL | ₹").
function hellooMoneyText(amount, currency, sign) {
  const n = Math.abs(Number(amount) || 0);
  const num = typeof fmt === "function" ? fmt(n, currency) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const code = String(currency || "").toUpperCase();
  const coin = typeof COIN_CURRENCY === "string" && code === COIN_CURRENCY;
  const ticker = typeof COIN_TICKER !== "undefined" ? COIN_TICKER : "CEL";
  const symbol = (typeof CURRENCY_SYMBOL === "object" && CURRENCY_SYMBOL[code]) || code;
  const head = sign === "+" ? "+" : sign === "-" || sign === "−" ? "−" : (Number(amount) < 0 ? "−" : "");
  return coin || !symbol ? `${head}${num} ${ticker}` : `${head}${num} ${ticker} | ${symbol}`;
}

// What a paid message earned you, the way a chat says it: "+ 3 CEL". The
// amount in GLOOBAL's own unit (the number is the same one the app shows
// beside any currency's sign); whole amounts lose their ".00".
function hellooEarnedText(amount) {
  const n = Math.round((Number(amount) || 0) * 100) / 100;
  const text = n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `+ ${text} ${typeof COIN_TICKER !== "undefined" ? COIN_TICKER : "CEL"}`;
}
// A business is a GLOOBAL shop: it comes under its own name, never one you
// gave it, and its paid messages may be shown on Home.
function hellooIsBusiness(person) {
  return Boolean(person && (person.handle || person.business));
}

function hellooShortDate(at) {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// A contact card from the server → the person object the screens draw.
// How long a photo or clip stays, and what has happened to it.
function hellooSnapFields(m) {
  const view = m.view || {};
  const mode = view.mode || "keep";
  const gone = Boolean(m.takenBack) || (mode === "once" && Boolean(view.opened)) || (mode === "day" && view.expiresAt && new Date(view.expiresAt).getTime() < Date.now());
  return { viewMode: mode, opened: Boolean(view.opened), gone: Boolean(gone), takenBack: Boolean(m.takenBack), fx: m.fx || "", saved: Boolean(m.saved), canSave: mode === "keep" && view.save !== false && !(m.view && m.view.mode && view.save !== true), opens: Number(m.opens) || 0, lastOpenAt: m.lastOpenAt || null };
}
function hellooPersonFrom(card, photos) {
  if (!card) return null;
  const country = hellooCountry(card.countryIso);
  const paid = card.lastPaid;
  return {
    id: card.accountId,
    accountId: card.accountId,
    gloobalId: card.gloobalId,
    name: card.name || card.gloobalId || "",
    handle: card.handle || null,
    // A shop's calling hours ({ mode, from, to, open }); null for a person.
    calls: card.handle ? card.calls || null : null,
    iso: country.iso,
    flag: country.flag,
    country: country.name,
    hasPhoto: Boolean(card.hasPhoto),
    // A shop is pictured by its own logo (kept under "logo:<id>"); a
    // person by their photo, or by the emoji they chose to show instead.
    logo: Boolean(card.logo),
    emoji: card.emoji || null,
    photo: (photos && photos[(card.logo ? "logo:" : "") + card.accountId]) || null,
    lastPaid: paid
      ? `${paid.direction === "sent" ? "You paid" : "Paid you"} ${hellooMoneyText(paid.amount, paid.currency)} · ${hellooShortDate(paid.at)}`
      : card.chatted ? "Chatted on Helloo" : "",
    // The same, in parts, for rows that draw it rather than say it.
    lastPay: paid ? { out: paid.direction === "sent", amountText: hellooMoneyText(paid.amount, paid.currency), when: hellooShortDate(paid.at) } : null
  };
}

// The signed-in account → the "me" object the screens draw.
function hellooMeFrom(user, photo) {
  if (!user) return null;
  const country = hellooCountry(user.countryIso);
  return {
    id: user.symbolId,
    gloobalId: user.symbolId,
    accountId: user.accountId || "",
    name: user.fullName || user.symbolId,
    about: "",
    iso: country.iso,
    flag: country.flag,
    country: country.name,
    city: "",
    currency: (typeof COUNTRY_CURRENCY === "object" && COUNTRY_CURRENCY[country.iso]) || "INR",
    photo: photo || null
  };
}

// ── Messages ────────────────────────────────────────────────────────────

function hellooDayLabel(d) {
  const now = new Date();
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86400e3);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

// A server message → a bubble. `theyReadAt` turns my ticks blue; a message
// still on its way (no server id yet) shows one grey tick.
function hellooBubbleFrom(m, meAccountId, theyReadAt, voiceState, names) {
  const mine = m.from === meAccountId || m.from === "me";
  const at = new Date(m.at || Date.now());
  const base = {
    id: m.id || m.clientId,
    clientId: m.clientId,
    from: mine ? "me" : "them",
    at,
    delivered: Boolean(m.id),
    read: Boolean(mine && m.id && theyReadAt && new Date(theyReadAt) >= at),
    seenAt: mine && m.id && theyReadAt && new Date(theyReadAt) >= at ? theyReadAt : null,
    pending: !m.id
  };
  if (m.replyTo) {
    const quotedMine = m.replyTo.from === meAccountId;
    base.replyTo = { id: m.replyTo.id, who: quotedMine ? "You" : (names && names.them) || "Them", preview: m.replyTo.preview };
  }
  base.preview = hellooPreviewOf(m);
  base.source = m;
  if (m.paid && m.paid.amount) { base.paidText = hellooMoneyText(m.paid.amount, m.paid.currency); base.earnedText = hellooEarnedText(m.paid.amount, m.paid.currency); }
  if (m.kind === "deleted") return Object.assign(base, { kind: "deleted" });
  if (m.kind === "sticker") return Object.assign(base, { kind: "sticker", stickerId: (m.sticker && m.sticker.id) || "" });
  if (m.kind === "call") {
    const c = m.call || {};
    const v = voiceState || {};
    const missed = c.status === "missed" || (c.status === "cancelled" && !mine) || (c.status === "declined" && !mine);
    return Object.assign(base, { kind: "call", video: Boolean(c.video), seconds: c.seconds || 0, missed, statusText: c.status === "ended" ? "" : missed ? "" : c.status === "declined" ? "Declined" : c.status === "cancelled" ? "Cancelled" : "", onCallBack: v.onCallBack });
  }
  if (m.kind === "photo") {
    const v = voiceState || {};
    return Object.assign(base, hellooSnapFields(m), { kind: "photo", text: m.text || "", width: (m.photo && m.photo.width) || 0, height: (m.photo && m.photo.height) || 0, src: v.src || m.localSrc || null, onOpen: v.onOpen, busy: Boolean(v.busy), watchId: v.watchId || "" });
  }
  if (m.kind === "video") {
    const v = voiceState || {};
    return Object.assign(base, hellooSnapFields(m), { kind: "video", text: m.text || "", seconds: (m.video && m.video.seconds) || 0, onOpen: v.onOpen, busy: Boolean(v.busy) });
  }
  if (m.kind === "voice") {
    const v = voiceState || {};
    return Object.assign(base, { kind: "voice", seconds: Math.round((m.voice && m.voice.seconds) || 0), playing: Boolean(v.playing), progress: v.progress, onPlay: v.onPlay });
  }
  if (m.kind === "payment" && m.payment && m.payment.purpose === "giveback") {
    const p = m.payment;
    return Object.assign(base, {
      kind: "refund",
      amountText: mine ? hellooMoneyText(p.amount, p.currency) : hellooMoneyText(p.destAmount || p.amount, p.destCurrency || p.currency),
      percent: p.percent || 0,
      ofText: "",
      what: "paid to reach",
      referenceId: p.referenceId
    });
  }
  if (m.kind === "order") {
    // An order from the shop's Bazaar price list, paid when it was placed.
    const o = m.order || {};
    const v = voiceState || {};
    return Object.assign(base, {
      kind: "order",
      items: (o.items || []).map((l) => ({ qty: l.qty, name: l.title, lineText: hellooMoneyText((Number(l.price) || 0) * (Number(l.qty) || 0), o.currency) })),
      totalText: hellooMoneyText(o.total, o.currency),
      total: o.total,
      currency: o.currency,
      note: o.note || "",
      paid: true,
      status: o.status || "placed",
      referenceId: m.payment && m.payment.referenceId,
      onOpenReceipt: v.onOpenReceipt,
      onStatus: v.onStatus,
      onRefund: v.onRefund,
      statusBusy: Boolean(v.statusBusy)
    });
  }
  if (m.kind === "payment") {
    const p = m.payment || {};
    return Object.assign(base, {
      kind: "receipt",
      amountText: mine ? hellooMoneyText(p.amount, p.currency, "-") : hellooMoneyText(p.destAmount || p.amount, p.destCurrency || p.currency, "+"),
      note: p.note || "",
      referenceId: p.referenceId,
      onOpenReceipt: voiceState && voiceState.onOpenReceipt
    });
  }
  return Object.assign(base, { kind: "text", text: m.text || "" });
}

function hellooThreadBubbles(messages, meAccountId, theyReadAt, voiceFor, names) {
  const out = [{ kind: "system", text: "Private to you two · same GLOOBAL account" }];
  let lastDay = "";
  for (const m of messages) {
    const bubble = hellooBubbleFrom(m, meAccountId, theyReadAt, voiceFor ? voiceFor(m) : null, names);
    const day = hellooDayLabel(bubble.at);
    if (day !== lastDay) {
      out.push({ kind: "day", text: day });
      lastDay = day;
    }
    out.push(bubble);
  }
  return out;
}

// A chat-list row from the server → the chat object HellooChatRow reads
// (it draws the last element of `messages`).
function hellooChatRowFrom(chat, photos) {
  const person = hellooPersonFrom(chat.person, photos);
  const last = chat.last
    ? {
        kind: "text",
        text: chat.last.preview,
        from: chat.last.from === chat.person.accountId ? "them" : "me",
        at: new Date(chat.lastAt),
        read: Boolean(chat.theyReadAt && new Date(chat.theyReadAt) >= new Date(chat.lastAt)),
        // Their last message paid to reach you: the row says so.
        paidText: chat.last.paid && chat.last.paid.amount ? hellooMoneyText(chat.last.paid.amount, chat.last.paid.currency) : ""
      }
    : null;
  if (person) person.online = Boolean(chat.online);
  // The name on a chat is the one YOU saved it under, when you saved one:
  // "Papa", "()+". Their own account name is kept beside it for the places
  // that must say who they really are (a payment, their profile).
  const savedName = typeof chat.savedName === "string" ? chat.savedName : "";
  if (person && savedName) { person.accountName = person.name; person.name = savedName; }
  return { id: chat.id, person, unread: chat.unread || 0, muted: Boolean(chat.muted), pinned: Boolean(chat.pinned), savedName, private: Boolean(chat.private), offHome: Boolean(chat.offHome), theme: typeof chat.theme === "string" ? chat.theme : "", released: chat.released || null, releaseState: chat.releaseState || null, messages: last ? [last] : [], lastAt: chat.lastAt, theyReadAt: chat.theyReadAt };
}

// ── FINDING A CHAT ──────────────────────────────────────────────────────
//
// Home shows no chats. A chat list is a history anyone can read at a
// glance — who you talk to, and how lately — so Helloo keeps it off the
// screen and a chat is CALLED UP by typing its name:
//
//   * an ordinary chat appears as soon as the first letters of its name
//     are typed (the start of any word in it), or four or more symbols of
//     its GLOOBAL ID;
//   * a PRIVATE chat appears only when its whole saved name is typed,
//     exactly. "()" does not find "()+", and a private chat is never found
//     by the person's own name or ID. A near miss looks the same as a name
//     that does not exist: an empty screen.
//
// `privateLocked` is the pause after too many wrong tries (HellooApp):
// while it holds, private chats do not answer at all.
var HELLOO_PRIVATE_NAME_MIN = 3;
function hellooNameKey(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().toLowerCase();
}
function hellooChatsFor(rows, query, privateLocked) {
  const q = hellooNameKey(query);
  if (!q) return [];
  const raw = String(query || "").trim();
  return (rows || []).filter((c) => {
    if (c.private) return !privateLocked && hellooNameKey(c.savedName) === q;
    const name = hellooNameKey(c.person && c.person.name);
    if (name.indexOf(q) === 0 || name.split(" ").some((word) => word.indexOf(q) === 0)) return true;
    return raw.length >= 4 && String((c.person && c.person.gloobalId) || "").indexOf(raw) >= 0;
  });
}
// ── WHAT HOME MAY SHOW ──────────────────────────────────────────────────
//
// One kind of message is not personal: a BUSINESS that paid to reach you.
// Those are shown on Home as cards — who, and what they said — because
// being seen is what the business paid for, and nothing about you is in
// them. The amount is not on the card: what you earn appears inside the
// chat, once you open it.
//
// A chat is a card only while it is all of: from a business, its latest
// message paid and still unread, not private, and not one you chose to
// keep off Home. Everything else stays a number.
function hellooHomeCards(rows) {
  return (rows || []).filter((c) => {
    const last = c.messages && c.messages[c.messages.length - 1];
    return hellooIsBusiness(c.person) && !c.private && !c.offHome && c.unread > 0 && last && last.from === "them" && Boolean(last.paidText);
  });
}
// Whether typed text is exactly some private chat's saved name.
function hellooIsPrivateName(rows, query) {
  const q = hellooNameKey(query);
  return Boolean(q) && (rows || []).some((c) => c.private && hellooNameKey(c.savedName) === q);
}

// ── Live socket ─────────────────────────────────────────────────────────
//
// One socket while signed in. It authenticates with the first frame, comes
// back by itself (1 s, 2 s, 4 s … 30 s) after a drop or a Render cold
// start, and reconnects at once when the app returns to the foreground.
function hellooLiveUrl() {
  return `${GLOOBAL_API_BASE.replace(/^http/i, "ws")}/api/helloo/live`;
}

function useHellooLive(enabled, onEvent, sendRef) {
  const [status, setStatus] = useStateH11("offline");
  const handler = useRefH11(onEvent);
  handler.current = onEvent;
  useEffectH11(() => {
    if (!enabled || typeof WebSocket === "undefined") return undefined;
    let ws = null;
    let stopped = false;
    let retry = 0;
    let timer = null;
    const connect = () => {
      if (stopped) return;
      const token = gloobalAuthToken();
      if (!token) { setStatus("offline"); return; }
      setStatus("connecting");
      try { ws = new WebSocket(hellooLiveUrl()); } catch (e) { schedule(); return; }
      ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));
      if (sendRef) {
        const mine = ws;
        sendRef.current = (frame) => { try { if (mine.readyState === 1) mine.send(JSON.stringify(frame)); } catch (err) { /* closing */ } };
      }
      ws.onmessage = (e) => {
        let frame;
        try { frame = JSON.parse(e.data); } catch (err) { return; }
        if (frame.type === "ready") {
          retry = 0;
          setStatus("live");
          if (handler.current) handler.current({ type: "ready" });
          return;
        }
        if (handler.current) handler.current(frame);
      };
      ws.onclose = (e) => {
        ws = null;
        if (stopped) return;
        setStatus("offline");
        if (e && e.code === 4401) return; // token refused: the session-expired path takes over
        schedule();
      };
      ws.onerror = () => {};
    };
    const schedule = () => {
      if (stopped) return;
      clearTimeout(timer);
      const wait = Math.min(30000, 1000 * Math.pow(2, retry));
      retry += 1;
      timer = setTimeout(connect, wait);
    };
    const wake = () => {
      if (document.visibilityState === "visible" && !ws) { retry = 0; clearTimeout(timer); connect(); }
    };
    connect();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      if (ws) try { ws.close(); } catch (e) { /* closing */ }
    };
  }, [enabled]);
  return status;
}

// ── Voice notes ─────────────────────────────────────────────────────────

var HELLOO_VOICE_MAX_SECONDS = 120;

function hellooVoiceMime() {
  if (typeof MediaRecorder === "undefined") return null;
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/aac"];
  for (const o of options) {
    try { if (MediaRecorder.isTypeSupported(o)) return o; } catch (e) { /* older browser */ }
  }
  return "";
}

// start() asks for the microphone and records; stop() resolves with
// { audio (base64), mime, seconds }; cancel() throws it away. Stops by
// itself at two minutes.
function hellooVoiceRecorder(onTick, onAutoStop) {
  let recorder = null;
  let stream = null;
  let chunks = [];
  let startedAt = 0;
  let tick = null;
  let cancelled = false;
  let resolveStop = null;
  const cleanup = () => {
    clearInterval(tick);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
  };
  return {
    async start() {
      const mime = hellooVoiceMime();
      if (mime === null) throw new Error("This browser cannot record audio.");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 24000 }) : new MediaRecorder(stream);
      chunks = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        const seconds = (Date.now() - startedAt) / 1000;
        cleanup();
        if (cancelled || !resolveStop) { if (resolveStop) resolveStop(null); return; }
        const type = (recorder.mimeType || mime || "audio/webm").split(";")[0];
        const blob = new Blob(chunks, { type });
        const buf = new Uint8Array(await blob.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        resolveStop({ audio: btoa(bin), mime: type, seconds: Math.max(1, Math.min(HELLOO_VOICE_MAX_SECONDS, seconds)) });
      };
      startedAt = Date.now();
      recorder.start(250);
      tick = setInterval(() => {
        const s = (Date.now() - startedAt) / 1000;
        if (onTick) onTick(s);
        if (s >= HELLOO_VOICE_MAX_SECONDS && onAutoStop) onAutoStop();
      }, 250);
    },
    stop() {
      return new Promise((resolve) => {
        resolveStop = resolve;
        if (recorder && recorder.state !== "inactive") recorder.stop();
        else resolve(null);
      });
    },
    cancel() {
      cancelled = true;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      cleanup();
    }
  };
}

// ── Push ────────────────────────────────────────────────────────────────

function hellooB64ToBytes(b64) {
  const padded = (b64 + "===".slice((b64.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function hellooPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

// Subscribes this device for Helloo message notifications (app: "helloo",
// so Gloobal's payment pushes are never sent here). `ask` = false only
// re-syncs a permission already given; it never prompts.
async function hellooPushSync(ask) {
  if (!hellooPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") {
    if (!ask) return "off";
    const answer = await Notification.requestPermission();
    if (answer !== "granted") return answer === "denied" ? "blocked" : "off";
  }
  const key = await GloobalApi.getPushPublicKey();
  if (!key.enabled || !key.publicKey) return "unavailable";
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: hellooB64ToBytes(key.publicKey) });
  const json = sub.toJSON();
  await gloobalApiClient.post("/api/push/subscribe", {
    endpoint: json.endpoint,
    keys: json.keys || {},
    userAgent: navigator.userAgent,
    app: "helloo"
  });
  return "on";
}

// A call from the server → the row the Calls side draws.
function hellooCallFrom(c, photos) {
  const person = hellooPersonFrom(c.person, photos);
  const missed = c.status === "missed" || (c.direction === "in" && (c.status === "cancelled" || c.status === "declined"));
  return { id: c.id, chatId: c.chatId, person, direction: c.direction, video: Boolean(c.video), status: c.status, seconds: c.seconds || 0, at: new Date(c.at), missed };
}

// Which side to open on: whatever happened last. A message (sent or
// received) → Messages; a call (made, received or missed) → Calls.
function hellooLatestSide(chats, calls) {
  // A chat whose newest item is a call counts for the Calls side.
  const lastChat = (chats || []).filter((c) => !(c.last && c.last.kind === "call")).reduce((t, c) => Math.max(t, new Date(c.lastAt || 0).getTime()), 0);
  const lastCall = Math.max(
    (calls || []).reduce((t, c) => Math.max(t, new Date(c.at || 0).getTime()), 0),
    (chats || []).filter((c) => c.last && c.last.kind === "call").reduce((t, c) => Math.max(t, new Date(c.lastAt || 0).getTime()), 0)
  );
  if (!lastChat && !lastCall) return "chats";
  return lastCall > lastChat ? "calls" : "chats";
}

// ── A call between two phones (WebRTC) ──────────────────────────────────
//
// The server only passes the handshake along; the sound and picture go
// phone to phone. The caller makes the offer once the other side answers;
// the callee answers it. Network candidates are exchanged as they come.
function hellooPeer(iceServers, sendSignal, onRemoteStream, onState) {
  const pc = new RTCPeerConnection({ iceServers: iceServers && iceServers.length ? iceServers : [{ urls: "stun:stun.l.google.com:19302" }] });
  const remote = new MediaStream();
  const pending = [];
  let remoteSet = false;
  pc.onicecandidate = (e) => { if (e.candidate) sendSignal({ candidate: e.candidate.toJSON() }); };
  pc.ontrack = (e) => { e.streams[0] ? e.streams[0].getTracks().forEach((t) => remote.addTrack(t)) : remote.addTrack(e.track); onRemoteStream(remote); };
  pc.onconnectionstatechange = () => onState && onState(pc.connectionState);
  return {
    pc,
    addLocal(stream) { stream.getTracks().forEach((t) => pc.addTrack(t, stream)); },
    async offer() { const d = await pc.createOffer(); await pc.setLocalDescription(d); sendSignal({ sdp: pc.localDescription.toJSON() }); },
    async handle(data) {
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        remoteSet = true;
        while (pending.length) { try { await pc.addIceCandidate(pending.shift()); } catch (e) { /* stale */ } }
        if (data.sdp.type === "offer") { const d = await pc.createAnswer(); await pc.setLocalDescription(d); sendSignal({ sdp: pc.localDescription.toJSON() }); }
      } else if (data.candidate) {
        const c = new RTCIceCandidate(data.candidate);
        if (remoteSet) { try { await pc.addIceCandidate(c); } catch (e) { /* stale */ } } else pending.push(c);
      }
    },
    close() { try { pc.getSenders().forEach((s) => s.track && s.track.stop()); } catch (e) { /* closed */ } try { pc.close(); } catch (e) { /* closed */ } }
  };
}

async function hellooLocalMedia(video, facing) {
  const constraints = { audio: { echoCancellation: true, noiseSuppression: true }, video: video ? { facingMode: facing || "user", width: { ideal: 640 }, height: { ideal: 480 } } : false };
  return navigator.mediaDevices.getUserMedia(constraints);
}

// A ringtone and a ringback made on the phone, so an incoming call is
// heard without any audio file.
function hellooTone(kind) {
  let ctx = null, timer = null;
  const beep = (f, when, len) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = f; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(0.25, when + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, when + len); o.start(when); o.stop(when + len + 0.05); };
  const cycle = () => { const t = ctx.currentTime; if (kind === "ring") { beep(880, t, 0.25); beep(1046, t + 0.3, 0.25); beep(880, t + 0.6, 0.25); beep(1046, t + 0.9, 0.25); } else { beep(440, t, 0.9); } };
  return {
    start() { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); cycle(); timer = setInterval(cycle, kind === "ring" ? 2200 : 3000); if (navigator.vibrate && kind === "ring") navigator.vibrate([400, 300, 400]); } catch (e) { /* no audio */ } },
    stop() { clearInterval(timer); if (ctx) { try { ctx.close(); } catch (e) { /* closed */ } ctx = null; } if (navigator.vibrate) try { navigator.vibrate(0); } catch (e) { /* ignore */ } }
  };
}
