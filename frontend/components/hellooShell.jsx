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
  Contact as HlContact, Check as HlCheck, CheckCheck as HlCheckCheck, Play as HlPlay, Store as HlStore,
  Copy as HlCopy, QrCode as HlQr, Bell as HlBell, Shield as HlShield, Palette as HlPalette, Ban as HlBan,
  HardDrive as HlDrive, LogOut as HlLogOut, ChevronRight as HlChevron, X as HlX, ArrowLeft as HlBack,
  PhoneIncoming as HlIn, PhoneOutgoing as HlOut, PhoneMissed as HlMissed, MicOff as HlMicOff,
  Volume2 as HlSpeaker, VideoOff as HlVideoOff, Minimize2 as HlMin, PhoneOff as HlEnd, Reply as HlReply,
  Forward as HlForward, Star as HlStar, Trash2 as HlTrash, Pin as HlPinIcon, BellOff as HlBellOff,
  Archive as HlArchive, Timer as HlTimer, Flag as HlFlag, Download as HlDownload, Share2 as HlShare,
  Smartphone as HlMobile, Sparkles as HlSpark, Lock as HlLock, Wallet as HlWallet, IndianRupee as HlRupee,
  Hash as HlHash, Keyboard as HlKeyboard, Fingerprint as HlFinger, ChevronDown as HlDown, Send as HlSend, UserPlus as HlUserPlus, Pencil as HlPencil, Globe2 as HlGlobe, Briefcase as HlBriefcase, Smile as HlSmile, FileText as HlFileText, Pause as HlPause, RefreshCw as HlRetry
} from "lucide-react";

var HELLOO_TABS = [
  { key: "chats", label: "Chats", Icon: HlChat },
  { key: "calls", label: "Calls", Icon: HlPhone },
  { key: "dial", label: "Dial", Icon: HlHash },
  { key: "me", label: "Me", Icon: HlUser }
];

function HellooTabBar({ active, onChange, badges = {} }) {
  const float = HT.tabBar === "float";
  return <nav aria-label="Main" style={float
    ? { display: "flex", margin: "0 14px calc(12px + env(safe-area-inset-bottom, 0px))", padding: "6px 6px", borderRadius: 26, background: HT.tabBg || HT.cardBg || T.surface, border: HT.cardBorder || "none", backdropFilter: HT.blur || "blur(14px)", WebkitBackdropFilter: HT.blur || "blur(14px)", boxShadow: T.shadowFloat, flexShrink: 0 }
    : { display: "flex", borderTop: HT.tabTopBorder || `1px solid ${T.line}`, background: HT.tabBg || T.surface, padding: "6px 8px calc(8px + env(safe-area-inset-bottom, 0px))", flexShrink: 0 }}>{HELLOO_TABS.map(({ key, label, Icon }) => {
    const on = active === key;
    const n = badges[key] || 0;
    return <button
      key={key}
      onClick={() => onChange && onChange(key)}
      aria-current={on ? "page" : undefined}
      className="v2-tap"
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", padding: "6px 0 2px", cursor: "pointer", color: on ? T.accent : T.inkFaint, fontFamily: T.fontBody }}
    ><span style={{ position: "relative", width: 44, height: 28, borderRadius: HT.chipRadius ?? 14, background: on ? T.accentSoft : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}><Icon size={20} />{n > 0 && <span style={{ position: "absolute", top: -4, right: 2, minWidth: 17, height: 17, borderRadius: 9, background: T.negative, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: `2px solid ${T.surface}` }}>{n}</span>}</span><span style={{ fontSize: 10.5, fontWeight: on ? 800 : 700 }}>{label}</span></button>;
  })}</nav>;
}

function HellooRoundButton({ Icon, label, onClick, solid = false, size = 40, color }) {
  return <button onClick={onClick} aria-label={label} title={label} className="v2-tap" style={{ width: size, height: size, borderRadius: HT.iconRadius ?? "50%", border: solid ? "none" : (HT.cardBorder || "none"), background: solid ? T.gradButton : (HT.cardBg || T.surface), backdropFilter: solid ? undefined : HT.blur, boxShadow: solid ? (HT.buttonGlow || "0 8px 20px -10px rgba(76,29,149,0.9)") : (HT.cardShadow ?? T.shadowCard), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}><Icon size={size * 0.45} color={solid ? (HT.onAccent || "#fff") : (color || T.ink)} /></button>;
}

// The screen frame: a fixed, full-height column with Gloobal's wash.
function HellooScreen({ children, style, dark = false }) {
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: dark ? HT.callBg : (HT.screenBg || T.bg), color: dark ? HT.callInk : T.ink, fontFamily: T.fontBody, overflow: "hidden", ...style }}>{children}</div>;
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
  return <button onClick={onPress} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", border: "none", borderTop: first ? "none" : `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 38, height: 38, borderRadius: 12, background: (danger ? T.negative : color) + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={danger ? T.negative : color} /></span><span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: danger ? T.negative : T.ink }}>{title}</span>{value && <span style={{ fontSize: 12.5, color: T.inkSoft }}>{value}</span>}<HlChevron size={16} color={T.inkFaint} /></button>;
}

function HellooCard({ children, style }) {
  // flexShrink 0: inside a scrolling flex column, a card with overflow
  // hidden would otherwise be squeezed to its padding (min-height: 0).
  return <div style={{ background: HT.cardBg || T.surface, borderRadius: HT.radius ?? 20, boxShadow: HT.cardShadow ?? T.shadowCard, border: HT.cardBorder || "none", backdropFilter: HT.blur || undefined, WebkitBackdropFilter: HT.blur || undefined, overflow: "hidden", flexShrink: 0, ...style }}>{children}</div>;
}

function HellooPrimary({ children, onClick, disabled, Icon, color }) {
  return <button onClick={onClick} disabled={disabled} className="v2-tap" style={{ width: "100%", minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: HT.buttonRadius ?? 999, border: "none", background: disabled ? T.gradButtonDisabled : (color || T.gradButton), boxShadow: disabled ? "none" : (HT.buttonGlow || "none"), color: color ? "#fff" : (HT.onAccent || "#fff"), fontSize: 15, fontWeight: 800, cursor: disabled ? "default" : "pointer", fontFamily: T.fontBody, letterSpacing: HT.buttonTracking || 0, textTransform: HT.buttonCase || "none" }}>{Icon && <Icon size={18} color={color ? "#fff" : (HT.onAccent || "#fff")} />}{children}</button>;
}
function HellooSecondary({ children, onClick, Icon }) {
  return <button onClick={onClick} className="v2-tap" style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: HT.buttonRadius ?? 999, border: HT.cardBorder || `1px solid ${T.line}`, background: HT.cardBg || T.surface, backdropFilter: HT.blur, color: T.ink, fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{Icon && <Icon size={18} color={T.ink} />}{children}</button>;
}
