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

// The app mark: a speech bubble holding the two discs.
function HellooMark({ size = 64 }) {
  const r = size * 0.22;
  return <span style={{ width: size, height: size, borderRadius: r, background: T.gradWallet, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(76,29,149,0.28)", position: "relative" }}><svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5c4.8 0 8.5 3.4 8.5 7.6s-3.7 7.6-8.5 7.6c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.6C4.3 15 3.5 13.1 3.5 11.1 3.5 6.9 7.2 3.5 12 3.5z" fill="#fff" /><circle cx="9.2" cy="11.2" r="1.9" fill="#DC2626" /><circle cx="14.8" cy="11.2" r="1.9" fill="#2563EB" /></svg></span>;
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
      : <span style={{ width: size, height: size, borderRadius: "50%", background: hue + "22", color: hue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 800, fontFamily: T.fontDisplay }}>{hellooInitials(p.handle || p.name)}</span>}{flag && p.flag && <span style={{ position: "absolute", right: -3, bottom: -3, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}><FlagEmoji flag={p.flag} size={size * 0.3} shape="circle" border="none" /></span>}{online && <span style={{ position: "absolute", left: -1, bottom: 0, width: size * 0.26, height: size * 0.26, borderRadius: "50%", background: HT.free, border: "2px solid #fff" }} />}</span>;
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
