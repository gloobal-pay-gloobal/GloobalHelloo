// frontend/components/hellooShell.jsx
//
// The furniture every Helloo screen shares: the top bar, the tab bar, a
// bottom sheet, and a round icon button. Built on Gloobal's theme so a
// Helloo screen and a Gloobal screen side by side look like one app.
import { useState as useStateH1, useRef as useRefH1 } from "react";
import {
  MessageCircle as HlChat, Phone as HlPhone, Video as HlVideo, User as HlUser, Users as HlUsers,
  Search as HlSearch, ScanLine as HlScan, Plus as HlPlus, MoreVertical as HlMore, Mic as HlMic,
  Paperclip as HlClip, Image as HlImage, Camera as HlCamera, FileText as HlDoc, MapPin as HlPin,
  Contact as HlContact, Eye as HlEye, EyeOff as HlEyeOff, Check as HlCheck, CheckCheck as HlCheckCheck, Play as HlPlay, Store as HlStore,
  Copy as HlCopy, QrCode as HlQr, Bell as HlBell, Shield as HlShield, Palette as HlPalette, Ban as HlBan,
  HardDrive as HlDrive, LogOut as HlLogOut, ChevronRight as HlChevron, ChevronLeft as HlChevronLeft, CalendarSearch as HlCalendar, X as HlX, ArrowLeft as HlBack,
  PhoneIncoming as HlIn, PhoneOutgoing as HlOut, PhoneMissed as HlMissed, MicOff as HlMicOff,
  Volume2 as HlSpeaker, VideoOff as HlVideoOff, Minimize2 as HlMin, PhoneOff as HlEnd, Reply as HlReply,
  Forward as HlForward, ArrowRight as HlArrowRight, Star as HlStar, Trash2 as HlTrash, Pin as HlPinIcon, BellOff as HlBellOff,
  Archive as HlArchive, Timer as HlTimer, Flag as HlFlag, Download as HlDownload, Share2 as HlShare,
  Smartphone as HlMobile, Sparkles as HlSpark, Lock as HlLock, Wallet as HlWallet, IndianRupee as HlRupee,
  Hash as HlHash, Keyboard as HlKeyboard, Fingerprint as HlFinger, ChevronDown as HlDown, Send as HlSend, UserPlus as HlUserPlus, Pencil as HlPencil, Globe2 as HlGlobe, Briefcase as HlBriefcase, Smile as HlSmile, FileText as HlFileText, Pause as HlPause, RefreshCw as HlRetry, Grip as HlGrip, Info as HlInfo, BadgeCheck as HlVerified, Clapperboard as HlSocial
} from "lucide-react";

var HELLOO_TABS = [
  { key: "chats", label: "Chats", Icon: HlChat },
  { key: "calls", label: "Calls", Icon: HlPhone },
  { key: "dial", label: "Dial", Icon: HlHash },
  { key: "me", label: "Me", Icon: HlUser }
];

// ── TWO SIDES, ONE BAR ────────────────────────────────────────────────
//
// Helloo is two things: messages and calls. The bar at the bottom says
// exactly that — two icons in one rounded bar. The side you are on sits
// in a coloured pill with its name; the other side is just its icon. The
// pill slides across when you switch. Badges: a count of unread messages,
// a dot for a missed call.
var HELLOO_SIDES = [
  { key: "chats", label: "Messages", Icon: HlChat },
  { key: "calls", label: "Calls", Icon: HlPhone }
];

// The home buttons, one column on the right, top to bottom: Calls,
// Messages, GLOOBAL बाज़ार, and + (start something new). Icons only. The
// tab you are on is the filled one; a count or a dot sits on its corner.
// Which side of the screen the button column sits on: the person's choice,
// kept on this phone. Right by default.
var HELLOO_RAIL_SIDE_KEY = "helloo.rail.side";
function hellooRailSide() {
  try { return localStorage.getItem(HELLOO_RAIL_SIDE_KEY) === "left" ? "left" : "right"; } catch (e) { return "right"; }
}
function hellooSaveRailSide(side) {
  try { localStorage.setItem(HELLOO_RAIL_SIDE_KEY, side === "left" ? "left" : "right"); } catch (e) { /* this phone only */ }
}

// The button column: Scan, Calls, Messages, GLOOBAL बाज़ार and +, icons only.
// It sits on the right or the left, whichever thumb the person uses: slide
// it across the screen and it moves to the other side and stays there.
function HellooSideRail({ active, onChange, badges = {}, onBazaar, onScan, social = false, fold = false, onPlus, plusLabel = "New chat or call", side: sideProp, onSide }) {
  const [sideOwn, setSideOwn] = useStateH1(hellooRailSide);
  const side = sideProp || sideOwn;
  const [dx, setDx] = useStateH1(0);
  // Folded (over a feed, where the column would cover the posts): one
  // button in the corner; a tap opens the column, a pick or a tap away
  // folds it again.
  const [unfolded, setUnfolded] = useStateH1(false);
  const drag = useRefH1(null);
  const moved = useRefH1(false);
  const setSide = (v) => { hellooSaveRailSide(v); setSideOwn(v); if (onSide) onSide(v); };
  const round = (size, filled) => ({ position: "relative", width: size, height: size, borderRadius: "50%", border: filled ? "none" : (HT.cardBorder || `1px solid ${T.line}`), background: filled ? T.gradButton : (HT.cardBg || T.surface), boxShadow: filled ? (HT.buttonGlow || "0 10px 24px rgba(76,29,149,0.32)") : (HT.cardShadow ?? T.shadowCard), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0 });
  const guard = (fn) => (e) => { if (moved.current) { e.preventDefault(); moved.current = false; return; } setUnfolded(false); if (fn) fn(e); };
  const tab = (key, label, Icon) => {
    const on = active === key; const n = badges[key] || 0; const dot = badges[key + "Dot"];
    return <button key={key} onClick={guard(() => { setUnfolded(false); if (onChange) onChange(key); })} aria-current={on ? "page" : undefined} aria-label={label} title={label} className="v2-tap" style={round(52, on)}><Icon size={22} strokeWidth={on ? 2.4 : 2} color={on ? (HT.onAccent || "#fff") : T.inkSoft} />{n > 0 ? <span data-testid={on ? "helloo-tab-count" : undefined} style={{ position: "absolute", top: -3, right: -3, minWidth: 19, height: 19, borderRadius: 10, background: T.negative, color: "#fff", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", border: `2px solid ${T.bg}` }}>{n}</span> : dot ? <span style={{ position: "absolute", top: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: T.negative, border: `2px solid ${T.bg}` }} /> : null}</button>;
  };
  // Sliding: the column follows the finger sideways; let go past a third of
  // the way across and it settles on the other side.
  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, w: (e.currentTarget.parentElement && e.currentTarget.parentElement.clientWidth) || 390 }; moved.current = false; };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const ddx = e.clientX - d.x;
    if (!moved.current && Math.abs(ddx) > 12 && Math.abs(ddx) > Math.abs(e.clientY - d.y)) { moved.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } }
    if (moved.current) setDx(side === "right" ? Math.min(0, ddx) : Math.max(0, ddx));
  };
  const up = (e) => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    if (moved.current && Math.abs(dx) > d.w / 3) setSide(side === "right" ? "left" : "right");
    setDx(0);
    if (moved.current) setTimeout(() => { moved.current = false; }, 0);
  };
  const pos = side === "left" ? { left: 16 } : { right: 16 };
  if (fold && !unfolded) return <button onClick={() => setUnfolded(true)} data-testid="helloo-rail-fold" aria-label="Calls, messages and more" title="Menu" className="v2-tap" style={{ ...round(56, true), position: "absolute", ...pos, bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", zIndex: 30 }}><HlGrip size={24} color={HT.onAccent || "#fff"} /></button>;
  return <>{fold ? <div onClick={() => setUnfolded(false)} style={{ position: "absolute", inset: 0, zIndex: 29, background: "rgba(15,12,35,0.25)" }} /> : null}<nav aria-label="Main" data-testid="helloo-rail" data-side={side} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ position: "absolute", ...pos, bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: dx ? `translateX(${dx}px)` : "none", transition: dx ? "none" : "transform 0.22s ease", touchAction: "pan-y", userSelect: "none" }}>{onScan ? <button onClick={guard(onScan)} data-testid="helloo-rail-scan" aria-label="Scan a GLOOBAL QR" title="Scan" className="v2-tap" style={round(52, false)}><HlScan size={22} color={T.inkSoft} /></button> : null}{tab("calls", "Calls", HlPhone)}{tab("chats", "Messages", HlChat)}{social ? tab("social", "GLOOBAL Social", HlSocial) : null}{onBazaar ? <button onClick={guard(onBazaar)} data-testid="helloo-bazaar-button" aria-label="GLOOBAL बाज़ार: find a shop" title="GLOOBAL बाज़ार" className="v2-tap" style={round(52, false)}><HlStore size={22} color={T.accent} /></button> : null}<button onClick={guard(onPlus)} data-testid="helloo-new-chat" aria-label={plusLabel} title={plusLabel} className="v2-tap" style={round(60, true)}><HlPlus size={28} strokeWidth={2.6} color={HT.onAccent || "#fff"} /></button></nav></>;
}

function HellooTabBar({ active, onChange, badges = {} }) {
  const at = HELLOO_SIDES.findIndex((s) => s.key === active);
  const idx = at < 0 ? 0 : at;
  const accent = HT.onAccent ? T.accent : T.accent;
  return <nav aria-label="Main" style={{ display: "flex", justifyContent: "center", padding: "6px 16px calc(10px + env(safe-area-inset-bottom, 0px))", background: HT.tabBar === "float" ? "transparent" : (HT.tabBg || T.surface), borderTop: HT.tabBar === "float" ? "none" : (HT.tabTopBorder || `1px solid ${T.line}`), flexShrink: 0 }}><div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", maxWidth: 220, height: 56, borderRadius: 28, background: HT.tabBar === "float" ? (HT.tabBg || HT.cardBg || T.surface) : (HT.cardBg && HT.cardBg !== T.surface ? HT.cardBg : T.surfaceSunk), border: HT.cardBorder || "none", boxShadow: HT.tabBar === "float" ? T.shadowFloat : "none", padding: 5, boxSizing: "border-box" }}><span aria-hidden="true" style={{ position: "absolute", top: 5, bottom: 5, left: 5, width: "calc(50% - 5px)", borderRadius: 23, background: T.gradButton, boxShadow: HT.buttonGlow || "0 6px 16px rgba(76,29,149,0.28)", transform: `translateX(${idx * 100}%)`, transition: "transform 0.28s cubic-bezier(.4,0,.2,1)" }} />{HELLOO_SIDES.map(({ key, label, Icon }) => {
    const on = active === key;
    const n = badges[key] || 0;
    const dot = badges[key + "Dot"];
    return <button
      key={key}
      onClick={() => onChange && onChange(key)}
      aria-current={on ? "page" : undefined}
      aria-label={label}
      className="v2-tap"
      style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: "none", cursor: "pointer", color: on ? (HT.onAccent || "#fff") : T.inkSoft, fontFamily: T.fontBody, transition: "color 0.2s", padding: 0 }}
    ><span style={{ position: "relative", display: "inline-flex" }}><Icon size={22} strokeWidth={on ? 2.4 : 2} />{n > 0 && <span data-testid={on ? "helloo-tab-count" : undefined} style={{ position: "absolute", top: -7, right: -11, border: on ? "2px solid #fff" : "none", minWidth: 17, height: 17, borderRadius: 9, background: T.negative, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{n}</span>}{!n && dot && <span style={{ position: "absolute", top: -3, right: -5, width: 9, height: 9, borderRadius: "50%", background: on ? "#fff" : T.negative, border: `2px solid ${on ? T.accent : T.surface}` }} />}</span></button>;
  })}</div></nav>;
}

function HellooRoundButton({ Icon, label, onClick, solid = false, size = 40, color }) {
  return <button onClick={onClick} aria-label={label} title={label} className="v2-tap" style={{ width: size, height: size, borderRadius: HT.iconRadius ?? "50%", border: solid ? "none" : (HT.cardBorder || "none"), background: solid ? T.gradButton : (HT.cardBg || T.surface), backdropFilter: solid ? undefined : HT.blur, boxShadow: solid ? (HT.buttonGlow || "0 8px 20px -10px rgba(76,29,149,0.9)") : (HT.cardShadow ?? T.shadowCard), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}><Icon size={size * 0.45} color={solid ? (HT.onAccent || "#fff") : (color || T.ink)} /></button>;
}

// The screen frame: a fixed, full-height column with Gloobal's wash.
function HellooScreen({ children, style, dark = false, onClick }) {
  return <div onClick={onClick} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: dark ? HT.callBg : (HT.screenBg || T.bg), color: dark ? HT.callInk : T.ink, fontFamily: T.fontBody, overflow: "hidden", ...style }}>{children}</div>;
}

function HellooTop({ left, title, subtitle, right, big = false }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `calc(${big ? 14 : 10}px + env(safe-area-inset-top, 0px)) 16px 10px`, flexShrink: 0 }}>{left}<div style={{ flex: 1, minWidth: 0 }}>{typeof title === "string" ? <div style={{ fontSize: big ? 24 : 16.5, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: big ? -0.4 : 0 }}>{title}</div> : <div style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }}>{title}</div>}{subtitle && <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>}</div><div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{right}</div></div>;
}

function HellooSheet({ title, onClose, children, label, zIndex = 60 }) {
  return <div role="dialog" aria-modal="true" aria-label={label || (typeof title === "string" ? title : "Sheet")} style={{ position: "absolute", inset: 0, zIndex, background: "rgba(15,12,35,0.45)", display: "flex", alignItems: "flex-end" }} onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}><div style={{ width: "100%", maxHeight: "92%", display: "flex", flexDirection: "column", background: T.bg, borderRadius: `${Math.max(HT.radius ?? 26, 10)}px ${Math.max(HT.radius ?? 26, 10)}px 0 0`, boxShadow: T.shadowFloat }}><div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}><span style={{ width: 40, height: 4, borderRadius: 2, background: T.line }} /></div>{title && <div style={{ padding: "8px 18px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 18, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{title}</div>}<div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 18px calc(18px + env(safe-area-inset-bottom, 0px))" }}>{children}</div></div></div>;
}

function HellooChip({ on, children, onClick, count }) {
  return <button onClick={onClick} className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 5, border: on ? (HT.chipOnBorder || "none") : (HT.cardBorder || `1px solid ${T.line}`), background: on ? T.accentSoft : (HT.cardBg || T.surface), backdropFilter: HT.blur, color: on ? T.accent : T.inkSoft, borderRadius: HT.chipRadius ?? 999, padding: "7px 13px", fontSize: 12.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", fontFamily: T.fontBody }}>{children}{count > 0 && <span style={{ fontSize: 11, color: on ? T.accent : T.inkFaint }}>{count}</span>}</button>;
}

// When something happened, to look at calls or messages by: a quick span
// (today, yesterday, this week from Monday, this month) or one day picked
// on the calendar ("d:2026-11-15"). "all" is everything.
var HELLOO_PERIODS = [["today", "Today"], ["yesterday", "Yesterday"], ["week", "Week"], ["month", "Month"]];
var HELLOO_PERIOD_WORDS = { all: "", today: "today", yesterday: "yesterday", week: "this week", month: "this month" };
function hellooDayKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function hellooPeriodRange(key, now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "today") return [day.getTime(), Infinity];
  if (key === "yesterday") return [day.getTime() - 86400e3, day.getTime()];
  if (key === "week") return [day.getTime() - ((day.getDay() + 6) % 7) * 86400e3, Infinity];
  if (key === "month") return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), Infinity];
  const m = /^d:(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
  if (m) { const from = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); const to = new Date(from); to.setDate(to.getDate() + 1); return [from.getTime(), to.getTime()]; }
  return [-Infinity, Infinity];
}
function hellooInPeriod(at, key) {
  if (!key || key === "all") return true;
  const t = new Date(at).getTime();
  const [from, to] = hellooPeriodRange(key);
  return t >= from && t < to;
}
// How a choice reads: "Today", "This week", "Sun, 15 Nov".
function hellooPeriodLabel(key) {
  const quick = { today: "Today", yesterday: "Yesterday", week: "This week", month: "This month" }[key];
  if (quick) return quick;
  const m = /^d:(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
  if (!m) return "Everything";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}
function hellooPeriodWords(key) {
  if (HELLOO_PERIOD_WORDS[key] !== undefined) return HELLOO_PERIOD_WORDS[key];
  return `on ${hellooPeriodLabel(key)}`;
}

// The calendar in the top-right corner: the quick spans along the top, a
// month to page through, and a dot on each day that had something. Days
// still to come cannot be picked.
function HellooDateSheet({ value = "all", marks, onPick, onClose, title = "Find by date", aboveNav = false }) {
  const today = new Date();
  const picked = /^d:/.test(value || "") ? new Date(hellooPeriodRange(value)[0]) : null;
  const [month, setMonth] = useStateH1(() => { const d = picked || today; return new Date(d.getFullYear(), d.getMonth(), 1); });
  const first = (month.getDay() + 6) % 7; // Monday first
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: first }, () => null).concat(Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)));
  const atThisMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const nav = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  return <HellooSheet label={title} onClose={onClose} zIndex={260}><div data-testid="helloo-date-sheet" style={{ paddingBottom: aboveNav ? 84 : 0 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{title}</span>{value && value !== "all" ? <button onClick={() => onPick("all")} className="v2-tap" style={{ border: "none", background: "none", color: T.accent, fontWeight: 800, fontSize: 13, fontFamily: T.fontBody, cursor: "pointer" }}>Show everything</button> : null}</div>
    <div style={{ display: "flex", gap: 6, margin: "12px 0 14px", flexWrap: "wrap" }}>{HELLOO_PERIODS.map(([k, l]) => <HellooChip key={k} on={value === k} onClick={() => onPick(k)}>{l}</HellooChip>)}</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><button onClick={() => nav(-1)} aria-label="Earlier month" className="v2-tap" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlChevronLeft size={18} color={T.ink} /></button><span style={{ fontSize: 14.5, fontWeight: 800, color: T.ink }}>{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span><button onClick={() => nav(1)} disabled={atThisMonth} aria-label="Later month" className="v2-tap" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center", cursor: atThisMonth ? "default" : "pointer", opacity: atThisMonth ? 0.35 : 1 }}><HlChevron size={18} color={T.ink} /></button></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>{["M", "T", "W", "T", "F", "S", "S"].map((w, i) => <span key={"w" + i} style={{ fontSize: 11, fontWeight: 800, color: T.inkFaint, padding: "4px 0" }}>{w}</span>)}{cells.map((d, i) => { if (!d) return <span key={"e" + i} />; const key = hellooDayKey(d); const future = d > today; const on = picked && hellooDayKey(picked) === key; const isToday = hellooDayKey(today) === key; const has = marks && marks.has(key); return <button key={key} disabled={future} aria-label={d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} aria-pressed={Boolean(on)} onClick={() => onPick("d:" + key)} className="v2-tap" style={{ position: "relative", height: 40, borderRadius: "50%", border: isToday && !on ? `1.5px solid ${T.accent}` : "none", background: on ? T.accent : "transparent", color: on ? "#fff" : future ? T.inkFaint : T.ink, opacity: future ? 0.4 : 1, fontFamily: T.fontBody, fontSize: 14, fontWeight: on || isToday ? 800 : 600, cursor: future ? "default" : "pointer" }}>{d.getDate()}{has && !on ? <span aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: 5, width: 4, height: 4, marginLeft: -2, borderRadius: "50%", background: T.accent }} /> : null}</button>; })}</div>
  </div></HellooSheet>;
}
// What is being shown, with a way back to everything.
function HellooPeriodPill({ value, onClear, onOpen }) {
  if (!value || value === "all") return null;
  return <span data-testid="helloo-period-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 4px 4px 11px", borderRadius: 999, background: T.accentSoft, color: T.accent, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}><button onClick={onOpen} style={{ border: "none", background: "none", padding: 0, color: T.accent, fontWeight: 800, fontSize: 12.5, fontFamily: T.fontBody, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><HlCalendar size={14} color={T.accent} />{hellooPeriodLabel(value)}</button><button onClick={onClear} aria-label="Show everything" className="v2-tap" style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: T.accent, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><HlX size={12} color="#fff" /></button></span>;
}

function HellooRow({ Icon, color = T.accent, title, value, onPress, danger = false, first = false }) {
  return <button onClick={onPress} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", border: "none", borderTop: first ? "none" : `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 38, height: 38, borderRadius: 12, background: (danger ? T.negative : color) + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={danger ? T.negative : color} /></span><span style={{ flex: "0 1 auto", minWidth: 0, fontSize: 14, fontWeight: 700, color: danger ? T.negative : T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span><span style={{ flex: "1 1 0", minWidth: 0, fontSize: 12.5, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }}>{value || ""}</span><HlChevron size={16} color={T.inkFaint} /></button>;
}

function HellooCard({ children, style }) {
  // flexShrink 0: inside a scrolling flex column, a card with overflow
  // hidden would otherwise be squeezed to its padding (min-height: 0).
  return <div style={{ background: HT.cardBg || T.surface, borderRadius: HT.radius ?? 20, boxShadow: HT.cardShadow ?? T.shadowCard, border: HT.cardBorder || "none", backdropFilter: HT.blur || undefined, WebkitBackdropFilter: HT.blur || undefined, overflow: "hidden", flexShrink: 0, ...style }}>{children}</div>;
}

function HellooPrimary({ children, onClick, disabled, Icon, color }) {
  return <button onClick={onClick} disabled={disabled} className="v2-tap" style={{ width: "100%", minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: HT.buttonRadius ?? 999, border: "none", background: disabled ? T.gradButtonDisabled : (color || T.gradButton), boxShadow: disabled ? "none" : (HT.buttonGlow || "none"), color: color ? "#fff" : (HT.onAccent || "#fff"), fontSize: 15, fontWeight: 800, cursor: disabled ? "default" : "pointer", fontFamily: T.fontBody, letterSpacing: HT.buttonTracking || 0, textTransform: HT.buttonCase || "none", padding: "0 18px", whiteSpace: "nowrap", minWidth: 0 }}>{Icon && <Icon size={18} color={color ? "#fff" : (HT.onAccent || "#fff")} style={{ flexShrink: 0 }} />}<span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span></button>;
}
function HellooSecondary({ children, onClick, Icon }) {
  return <button onClick={onClick} className="v2-tap" style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: HT.buttonRadius ?? 999, border: HT.cardBorder || `1px solid ${T.line}`, background: HT.cardBg || T.surface, backdropFilter: HT.blur, color: T.ink, fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, padding: "0 14px", whiteSpace: "nowrap", minWidth: 0 }}>{Icon && <Icon size={18} color={T.ink} style={{ flexShrink: 0 }} />}<span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span></button>;
}

// The round dial, as an icon: eight keys around a centre, like the pad it
// opens.
function HlDial({ size = 24, color = "#fff" }) {
  const r = size / 2, k = size * 0.11, ring = size * 0.33;
  const dots = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2; return <circle key={i} cx={r + Math.cos(a) * ring} cy={r + Math.sin(a) * ring} r={k} fill={color} />; });
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">{dots}<circle cx={r} cy={r} r={k * 1.35} fill={color} /></svg>;
}

// Your own face in Helloo: your photo, or your initials on a tint — never
// a logo standing in for a person.
function HellooMeAvatar({ me, size = 38 }) {
  return <HellooAvatar person={{ id: me.gloobalId || me.id, name: me.name, photo: me.photo, flag: "" }} size={size} flag={false} />;
}

// A name with GLOOBAL's verified mark: the account exists, the name is the
// one on it.
function HellooVerifiedName({ person, size = 15 }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 }}><span style={{ fontSize: size, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{person.handle ? <CreatorHandleText handle={person.handle} icon={false} /> : person.name}</span><HlVerified size={size + 2} color={HT.free} style={{ flexShrink: 0 }} /></span>;
}
