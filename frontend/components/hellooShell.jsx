// frontend/components/hellooShell.jsx
//
// The furniture every Helloo screen shares: the top bar, the tab bar, a
// bottom sheet, and a round icon button. Built on Gloobal's theme so a
// Helloo screen and a Gloobal screen side by side look like one app.
import { useState as useStateH1 } from "react";
import {
  MessageCircle as HlChat, Phone as HlPhone, Video as HlVideo, User as HlUser, Users as HlUsers,
  Search as HlSearch, ScanLine as HlScan, Plus as HlPlus, MoreVertical as HlMore, Mic as HlMic,
  Paperclip as HlClip, Image as HlImage, Camera as HlCamera, FileText as HlDoc, MapPin as HlPin,
  Contact as HlContact, Eye as HlEye, EyeOff as HlEyeOff, Check as HlCheck, CheckCheck as HlCheckCheck, Play as HlPlay, Store as HlStore,
  Copy as HlCopy, QrCode as HlQr, Bell as HlBell, Shield as HlShield, Palette as HlPalette, Ban as HlBan,
  HardDrive as HlDrive, LogOut as HlLogOut, ChevronRight as HlChevron, X as HlX, ArrowLeft as HlBack,
  PhoneIncoming as HlIn, PhoneOutgoing as HlOut, PhoneMissed as HlMissed, MicOff as HlMicOff,
  Volume2 as HlSpeaker, VideoOff as HlVideoOff, Minimize2 as HlMin, PhoneOff as HlEnd, Reply as HlReply,
  Forward as HlForward, ArrowRight as HlArrowRight, Star as HlStar, Trash2 as HlTrash, Pin as HlPinIcon, BellOff as HlBellOff,
  Archive as HlArchive, Timer as HlTimer, Flag as HlFlag, Download as HlDownload, Share2 as HlShare,
  Smartphone as HlMobile, Sparkles as HlSpark, Lock as HlLock, Wallet as HlWallet, IndianRupee as HlRupee,
  Hash as HlHash, Keyboard as HlKeyboard, Fingerprint as HlFinger, ChevronDown as HlDown, Send as HlSend, UserPlus as HlUserPlus, Pencil as HlPencil, Globe2 as HlGlobe, Briefcase as HlBriefcase, Smile as HlSmile, FileText as HlFileText, Pause as HlPause, RefreshCw as HlRetry, Grip as HlGrip, Info as HlInfo, BadgeCheck as HlVerified
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

function HellooTabBar({ active, onChange, badges = {} }) {
  const at = HELLOO_SIDES.findIndex((s) => s.key === active);
  const idx = at < 0 ? 0 : at;
  const accent = HT.onAccent ? T.accent : T.accent;
  return <nav aria-label="Main" style={{ display: "flex", justifyContent: "center", padding: "6px 16px calc(10px + env(safe-area-inset-bottom, 0px))", background: HT.tabBar === "float" ? "transparent" : (HT.tabBg || T.surface), borderTop: HT.tabBar === "float" ? "none" : (HT.tabTopBorder || `1px solid ${T.line}`), flexShrink: 0 }}><div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", maxWidth: 360, height: 56, borderRadius: 28, background: HT.tabBar === "float" ? (HT.tabBg || HT.cardBg || T.surface) : (HT.cardBg && HT.cardBg !== T.surface ? HT.cardBg : T.surfaceSunk), border: HT.cardBorder || "none", boxShadow: HT.tabBar === "float" ? T.shadowFloat : "none", padding: 5, boxSizing: "border-box" }}><span aria-hidden="true" style={{ position: "absolute", top: 5, bottom: 5, left: 5, width: "calc(50% - 5px)", borderRadius: 23, background: T.gradButton, boxShadow: HT.buttonGlow || "0 6px 16px rgba(76,29,149,0.28)", transform: `translateX(${idx * 100}%)`, transition: "transform 0.28s cubic-bezier(.4,0,.2,1)" }} />{HELLOO_SIDES.map(({ key, label, Icon }) => {
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
    ><span style={{ position: "relative", display: "inline-flex" }}><Icon size={22} strokeWidth={on ? 2.4 : 2} />{n > 0 && !on && <span style={{ position: "absolute", top: -7, right: -11, minWidth: 17, height: 17, borderRadius: 9, background: T.negative, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{n}</span>}{!n && dot && <span style={{ position: "absolute", top: -3, right: -5, width: 9, height: 9, borderRadius: "50%", background: on ? "#fff" : T.negative, border: `2px solid ${on ? T.accent : T.surface}` }} />}</span>{on && <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.1 }}>{label}</span>}{on && n > 0 && <span data-testid="helloo-tab-count" style={{ minWidth: 20, height: 20, borderRadius: 10, background: "#fff", color: T.accent, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{n}</span>}</button>;
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
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `calc(${big ? 14 : 10}px + env(safe-area-inset-top, 0px)) 16px 10px`, flexShrink: 0 }}>{left}<div style={{ flex: 1, minWidth: 0 }}>{typeof title === "string" ? <div style={{ fontSize: big ? 24 : 16.5, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: big ? -0.4 : 0 }}>{title}</div> : title}{subtitle && <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>}</div><div style={{ display: "flex", gap: 8, alignItems: "center" }}>{right}</div></div>;
}

function HellooSheet({ title, onClose, children, label, zIndex = 60 }) {
  return <div role="dialog" aria-modal="true" aria-label={label || (typeof title === "string" ? title : "Sheet")} style={{ position: "absolute", inset: 0, zIndex, background: "rgba(15,12,35,0.45)", display: "flex", alignItems: "flex-end" }} onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}><div style={{ width: "100%", maxHeight: "92%", display: "flex", flexDirection: "column", background: T.bg, borderRadius: `${Math.max(HT.radius ?? 26, 10)}px ${Math.max(HT.radius ?? 26, 10)}px 0 0`, boxShadow: T.shadowFloat }}><div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}><span style={{ width: 40, height: 4, borderRadius: 2, background: T.line }} /></div>{title && <div style={{ padding: "8px 18px 4px", fontSize: 18, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{title}</div>}<div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 18px calc(18px + env(safe-area-inset-bottom, 0px))" }}>{children}</div></div></div>;
}

function HellooChip({ on, children, onClick, count }) {
  return <button onClick={onClick} className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 5, border: on ? (HT.chipOnBorder || "none") : (HT.cardBorder || `1px solid ${T.line}`), background: on ? T.accentSoft : (HT.cardBg || T.surface), backdropFilter: HT.blur, color: on ? T.accent : T.inkSoft, borderRadius: HT.chipRadius ?? 999, padding: "7px 13px", fontSize: 12.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", fontFamily: T.fontBody }}>{children}{count > 0 && <span style={{ fontSize: 11, color: on ? T.accent : T.inkFaint }}>{count}</span>}</button>;
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
