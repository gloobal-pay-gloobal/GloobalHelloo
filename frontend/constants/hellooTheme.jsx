// ── HELLOO KEEPS ITS SIGN-IN UNDER ITS OWN NAME ────────────────────────
//
// Helloo is built from GLOOBAL's code, which keeps the sign-in under
// "gloobal.session.v1". Copies of Helloo left open on a phone from before
// 16 Nov run older code that writes week-old, expired sign-ins back under
// that name — and a phone with such a copy signs out the moment anyone
// signs in (seen on the founder's phone, 16–17 Nov). From here on Helloo
// keeps its sign-in under a name no older copy knows, so nothing they do
// can reach it. A sign-in that is still good under the old name is moved
// across once, so nobody already signed in is signed out by this.
(function hellooOwnSessionKey() {
  var NEW_KEY = "helloo.session.v2";
  var OLD_KEY = GLOOBAL_SESSION_KEY;
  try {
    if (!window.localStorage.getItem(NEW_KEY)) {
      var old = JSON.parse(window.localStorage.getItem(OLD_KEY) || "null");
      if (old && old.token && typeof gloobalAuthTokenLooksLive === "function" && gloobalAuthTokenLooksLive(old.token)) {
        window.localStorage.setItem(NEW_KEY, JSON.stringify(old));
      }
    }
  } catch (e) { /* storage off: nothing to move */ }
  GLOOBAL_SESSION_KEY = NEW_KEY;
})();

// frontend/constants/hellooTheme.jsx
//
// Helloo is built on Gloobal's own theme (T) and components, so the two
// apps read as one account. This file holds only what is Helloo's: the
// wordmark, the green that means "free", and the dark world a call lives
// in.
import { useState as useStateH0, useEffect as useEffectH0 } from "react";

var HT = {
  // "Free" — every call, every message. Gloobal's positive green.
  free: T.positive,
  freeSoft: T.positiveSoft,
  // The call screen: its own dark world, because a call is the one
  // place the app steps back and the person fills the screen.
  callBg: "#120B2E",
  callInk: "#F4F1FF",
  callSoft: "rgba(244,241,255,0.6)",
  // Bubbles.
  bubbleMe: T.accent,
  bubbleThem: T.surface,
  wash: "linear-gradient(180deg, #F6F5FC 0%, #F3EFFD 100%)"
};

var HELLOO_DOT_COLORS = ["#2563EB", "#DC2626", "#EA580C", "#059669", "#9333EA", "#DB2777"];

// HELL●●  — the same device as GL●●BAL: the two Os are two coloured
// discs that drift through the brand colours. Said once, the two marks
// side by side say "same family" without a word.
function HellooWordmark({ suffix = "", size }) {
  const pick = (not) => {
    let c = HELLOO_DOT_COLORS[Math.floor(Math.random() * HELLOO_DOT_COLORS.length)];
    while (c === not) c = HELLOO_DOT_COLORS[Math.floor(Math.random() * HELLOO_DOT_COLORS.length)];
    return c;
  };
  const [c1, setC1] = useStateH0(() => pick());
  const [c2, setC2] = useStateH0(() => pick(c1));
  useEffectH0(() => {
    const t = setInterval(() => { setC1((p) => pick(p)); setC2((p) => pick(p)); }, 3000);
    return () => clearInterval(t);
  }, []);
  const dot = (c) => <span aria-hidden="true" style={{ display: "inline-block", width: "0.85em", height: "0.85em", borderRadius: "50%", background: c, margin: "0 0.03em", verticalAlign: "-0.05em", transition: "background 0.4s ease" }} />;
  return <span aria-label={`Helloo${suffix}`} style={{ textTransform: "uppercase", fontWeight: 800, fontFamily: T.fontWordmark, whiteSpace: "nowrap", fontSize: size }}>Hell{dot(c1)}{dot(c2)}{suffix}</span>;
}

// The app mark: "Bubble G Clean" (25 Nov, founder's pick from the design
// canvas). The same G that is also a speech bubble, now blue, with a green
// phone inside it: Helloo is for talking, and talking with your people is
// free. One drawing, two treatments:
//   app  — white G and a green phone on a blue tile (the app icon)
//   ink  — blue G and a green phone on white
// The older variant names still resolve, so callers need not change.
var HELLOO_BLUE = ["#3B82F6", "#1D4ED8"];
// Lucide's "phone" outline (ISC licence, the icon set the app already uses), filled.
var HELLOO_PHONE_PATH = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";
var HELLOO_MARK_VARIANTS = {
  app: { tile: "url(#hlMarkGrad)", g: "#fff", phone: "#4ADE80" },
  ink: { tile: "#F7F6FB", g: "url(#hlMarkInk)", phone: "#10B981" }
};
HELLOO_MARK_VARIANTS.dots = HELLOO_MARK_VARIANTS.app;
HELLOO_MARK_VARIANTS.purple = HELLOO_MARK_VARIANTS.app;
HELLOO_MARK_VARIANTS.navy = HELLOO_MARK_VARIANTS.ink;
var HELLOO_MARK_DEFAULT = "app";

// The G itself, drawn in a 200 box: the ring with its bar, the bubble's
// tail, the phone. `ink` colours the G; `phone` the phone.
function hellooBubbleGParts(ink, phone) {
  return <><path d="M143.8 56.2 A62 62 0 1 0 162 100 H136" fill="none" stroke={ink} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" /><path d="M47 132 L26 184 L84 160 Z" fill={ink} stroke={ink} strokeWidth="8" strokeLinejoin="round" /><g transform="translate(94 98) scale(2) translate(-12 -12)"><path d={HELLOO_PHONE_PATH} fill={phone} /></g></>;
}
function hellooBlueStops() {
  return [<stop key="a" offset="0" stopColor={HELLOO_BLUE[0]} />, <stop key="b" offset="1" stopColor={HELLOO_BLUE[1]} />];
}

function HellooMark({ size = 64, variant = HELLOO_MARK_DEFAULT }) {
  const v = HELLOO_MARK_VARIANTS[variant] || HELLOO_MARK_VARIANTS.app;
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Helloo" role="img" style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 10px 24px rgba(29,78,216,0.24))" }}><defs><linearGradient id="hlMarkGrad" x1="0" y1="0" x2="1" y2="1">{hellooBlueStops()}</linearGradient><linearGradient id="hlMarkInk" x1="0" y1="0" x2="1" y2="1">{hellooBlueStops()}</linearGradient></defs><rect width="100" height="100" rx="22" fill={v.tile} /><g transform="translate(8 6) scale(0.42)">{hellooBubbleGParts(v.g, v.phone)}</g></svg>;
}

// The G with no tile: the fixed end the splash's line hangs from.
// tone "color" — the blue G (on a light page); "white" — on a dark page.
function HellooBubbleG({ size = 72, tone = "color" }) {
  const white = tone === "white";
  return <svg width={size} height={size} viewBox="0 0 200 200" aria-label="Helloo" role="img" style={{ display: "block", flexShrink: 0 }}>{white ? null : <defs><linearGradient id="hlBubbleGBlue" x1="0" y1="0" x2="1" y2="1">{hellooBlueStops()}</linearGradient></defs>}{hellooBubbleGParts(white ? "#FFFFFF" : "url(#hlBubbleGBlue)", white ? "#34D399" : "#10B981")}</svg>;
}

// A person on Helloo. The GLOOBAL ID is the identity; the name, flag and
// city are what the ID resolved to. A shop is a person with a handle.
function hellooInitials(name) {
  // Letters and digits only: "Ajay (Office)" → "AO", not "A(".
  const firsts = String(name || "").split(/\s+/).map((w) => (w.match(/[\p{L}\p{N}]/u) || [""])[0]).filter(Boolean);
  return firsts.length ? firsts.slice(0, 2).join("").toUpperCase() : "?";
}
var HELLOO_AVATAR_HUES = ["#7C3AED", "#2563EB", "#059669", "#EA580C", "#DB2777", "#0E7490"];
function hellooHue(key) {
  let h = 7;
  for (const ch of String(key || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HELLOO_AVATAR_HUES[h % HELLOO_AVATAR_HUES.length];
}

function HellooAvatar({ person, size = 46, online = false, flag = true }) {
  const p = person || {};
  const hue = hellooHue(p.id || p.name);
  return <span style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "inline-block" }}>{p.photo
    ? <img src={p.photo} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
    : p.emoji
      ? <span data-testid="helloo-avatar-emoji" style={{ width: size, height: size, borderRadius: "50%", background: hue + "1F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.54, lineHeight: 1 }}>{p.emoji}</span>
    : p.group
      ? <span style={{ width: size, height: size, borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><HlUsers size={size * 0.46} /></span>
      : <span style={{ width: size, height: size, borderRadius: "50%", background: hue + "22", color: hue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 800, fontFamily: T.fontDisplay }}>{hellooInitials(p.handle || p.name)}</span>}{flag && p.flag && <span style={{ position: "absolute", right: -3, bottom: -3, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}><FlagEmoji flag={p.flag} size={Math.round(size * 0.42) - 3} shape="circle" border="1px solid rgba(0,0,0,0.14)" /></span>}{online && <span style={{ position: "absolute", left: -1, bottom: 0, width: size * 0.26, height: size * 0.26, borderRadius: "50%", background: HT.free, border: `2px solid ${T.surface}` }} />}</span>;
}

function hellooName(p) {
  if (!p) return "";
  return p.handle ? p.handle : p.name;
}

function hellooClock(at) {
  const d = at instanceof Date ? at : new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
// The time on a message, to the second: "15:11:42".
function hellooClockSec(at) {
  const d = at instanceof Date ? at : new Date(at);
  return `${hellooClock(d)}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function hellooWhen(at, now = Date.now()) {
  const d = at instanceof Date ? at : new Date(at);
  const diff = now - d.getTime();
  if (diff < 24 * 3600e3 && d.getDate() === new Date(now).getDate()) return hellooClock(d);
  if (diff < 48 * 3600e3) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
// How long a call lasted, as written in a chat or the calls list:
// "20s", "4m 05s", "1h 05m 20s".
function hellooDurationHms(s) {
  const t = Math.max(0, Math.round(Number(s) || 0));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const two = (n) => String(n).padStart(2, "0");
  if (h) return `${h}h ${two(m)}m ${two(sec)}s`;
  if (m) return `${m}m ${two(sec)}s`;
  return `${sec}s`;
}

function hellooDuration(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
