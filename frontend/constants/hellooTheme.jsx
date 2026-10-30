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

// The app mark, as the founder drew it: two speech bubbles with tails at
// opposite corners, joined by a handset's curve. Four treatments:
//   navy   — navy on white, white dots (as drawn)
//   dots   — navy, the first two dots in GL●●BAL's colours
//   purple — white mark on Gloobal's Royal Purple, purple dots
//   ink    — purple mark on white, coloured dots
var HELLOO_MARK_VARIANTS = {
  navy: { bg: "#F7F6FB", ink: "#1B1838", dots: ["#fff", "#fff", "#fff"] },
  dots: { bg: "#F7F6FB", ink: "#1B1838", dots: ["#2563EB", "#DC2626", "#fff"] },
  purple: { bg: "url(#hlMarkGrad)", ink: "#fff", dots: ["#5B21B6", "#5B21B6", "#5B21B6"], grad: ["#3B0F63", "#7C3AED"] },
  ink: { bg: "#F7F6FB", ink: "#3B0F63", dots: ["#DC2626", "#2563EB", "#3B0F63"] }
};
var HELLOO_MARK_DEFAULT = "dots";

function HellooMark({ size = 64, variant = HELLOO_MARK_DEFAULT }) {
  const v = HELLOO_MARK_VARIANTS[variant] || HELLOO_MARK_VARIANTS.navy;
  const [d1, d2, d3] = v.dots;
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Helloo" role="img" style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 10px 24px rgba(27,24,56,0.22))" }}>{v.grad && <defs><linearGradient id="hlMarkGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={v.grad[0]} /><stop offset="1" stopColor={v.grad[1]} /></linearGradient></defs>}<rect width="100" height="100" rx="22" fill={v.bg} /><rect x="20" y="22" width="28" height="26" rx="7" fill={v.ink} /><path d="M11 13 L33 22 L20 35 Z" fill={v.ink} /><rect x="52" y="52" width="28" height="26" rx="7" fill={v.ink} /><path d="M89 87 L67 78 L80 65 Z" fill={v.ink} /><path d="M27 47 C27 64 36 72 52 72" fill="none" stroke={v.ink} strokeWidth="10.5" strokeLinecap="round" /><circle cx="28" cy="35" r="2.5" fill={d1} /><circle cx="34" cy="35" r="2.5" fill={d2} /><circle cx="40" cy="35" r="2.5" fill={d3} /><circle cx="60" cy="65" r="2.5" fill={d1} /><circle cx="66" cy="65" r="2.5" fill={d2} /><circle cx="72" cy="65" r="2.5" fill={d3} /></svg>;
}

// A person on Helloo. The GLOOBAL ID is the identity; the name, flag and
// city are what the ID resolved to. A shop is a person with a handle.
function hellooInitials(name) {
  return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
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
    : p.group
      ? <span style={{ width: size, height: size, borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><HlUsers size={size * 0.46} /></span>
      : <span style={{ width: size, height: size, borderRadius: "50%", background: hue + "22", color: hue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 800, fontFamily: T.fontDisplay }}>{hellooInitials(p.handle || p.name)}</span>}{flag && p.flag && <span style={{ position: "absolute", right: -3, bottom: -3, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}><FlagEmoji flag={p.flag} size={size * 0.3} shape="circle" border="none" /></span>}{online && <span style={{ position: "absolute", left: -1, bottom: 0, width: size * 0.26, height: size * 0.26, borderRadius: "50%", background: HT.free, border: `2px solid ${T.surface}` }} />}</span>;
}

function hellooName(p) {
  if (!p) return "";
  return p.handle ? p.handle : p.name;
}

function hellooClock(at) {
  const d = at instanceof Date ? at : new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function hellooWhen(at, now = Date.now()) {
  const d = at instanceof Date ? at : new Date(at);
  const diff = now - d.getTime();
  if (diff < 24 * 3600e3 && d.getDate() === new Date(now).getDate()) return hellooClock(d);
  if (diff < 48 * 3600e3) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function hellooDuration(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
