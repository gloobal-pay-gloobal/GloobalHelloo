// frontend/constants/hellooThemes.jsx
//
// ── THEMES ──────────────────────────────────────────────────────────────
//
// Six looks for the whole app, chosen in Me → App theme. Every Helloo
// screen reads its colours from T (Gloobal's theme object) and HT, so a
// theme is one set of tokens written into both and a re-render — no
// screen knows which theme it is in.
//
// Two dark (Midnight, Graphite), four light. The money colours keep their
// meaning in every theme: green is money that moved and "free", red is a
// warning or a debit, so a payment never reads as decoration.

var HELLOO_THEMES = [
  {
    key: "gloobal", name: "GLOOBAL", dark: false, swatch: ["#7C3AED", "#F6F5FC", "#0FA372"],
    t: { bg: "#F6F5FC", surface: "#FFFFFF", surfaceAlt: "#F3F1FA", surfaceSunk: "#EEEBF9", ink: "#15132A", inkSoft: "#6B6580", inkFaint: "#9C96AF", line: "#EAE6F7", accent: "#7C3AED", accent2: "#3B6EF5", accentSoft: "#F1ECFC", gradButton: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)", gradButtonDisabled: "linear-gradient(135deg,#D9D3F3,#E6DFF8)", gradWallet: "linear-gradient(150deg,#1E1B4B 0%,#3E2E8E 42%,#7C3AED 80%,#C026D3 100%)", positive: "#0FA372", positiveSoft: "#E3F8EE", negative: "#E23F45", negativeSoft: "#FCEAEA", shadowCard: "0 6px 20px rgba(76,29,149,0.07)", shadowFloat: "0 20px 48px rgba(30,20,70,0.24)" },
    ht: { wash: "linear-gradient(180deg, #F6F5FC 0%, #F3EFFD 100%)", bubbleMe: "#7C3AED", bubbleThem: "#FFFFFF", callBg: "#120B2E" }
  },
  {
    key: "midnight", name: "Midnight", dark: true, swatch: ["#8C69FF", "#0F0D1F", "#22C58B"],
    t: { bg: "#0F0D1F", surface: "#1A1730", surfaceAlt: "#221E3D", surfaceSunk: "#141127", ink: "#F1EEFF", inkSoft: "#B3ADCC", inkFaint: "#7F79A0", line: "#2B2648", accent: "#8C69FF", accent2: "#5B8CFF", accentSoft: "#2A2152", gradButton: "linear-gradient(135deg,#6D5BFF 0%,#A35BFF 100%)", gradButtonDisabled: "linear-gradient(135deg,#2B2648,#332D55)", gradWallet: "linear-gradient(150deg,#1B1640 0%,#3B2A8C 55%,#8C3BD6 100%)", positive: "#22C58B", positiveSoft: "#0F3A2B", negative: "#FF5C63", negativeSoft: "#3A1418", shadowCard: "0 6px 20px rgba(0,0,0,0.35)", shadowFloat: "0 20px 48px rgba(0,0,0,0.55)" },
    ht: { wash: "linear-gradient(180deg, #0F0D1F 0%, #15112A 100%)", bubbleMe: "#6D5BFF", bubbleThem: "#1F1B38", callBg: "#07051A" }
  },
  {
    key: "emerald", name: "Emerald", dark: false, swatch: ["#058B5D", "#F1FAF6", "#0B5FD8"],
    t: { bg: "#F1FAF6", surface: "#FFFFFF", surfaceAlt: "#E8F6EF", surfaceSunk: "#DDF1E7", ink: "#0F2219", inkSoft: "#587266", inkFaint: "#8AA398", line: "#D4ECE0", accent: "#058B5D", accent2: "#0B5FD8", accentSoft: "#DCF5EA", gradButton: "linear-gradient(135deg,#047857 0%,#10B981 100%)", gradButtonDisabled: "linear-gradient(135deg,#C9E9DA,#DCF2E7)", gradWallet: "linear-gradient(150deg,#05241A 0%,#065F46 50%,#10B981 100%)", positive: "#0B9F6A", positiveSoft: "#DCF5EA", negative: "#D93A3A", negativeSoft: "#FBE6E6", shadowCard: "0 6px 20px rgba(5,95,70,0.08)", shadowFloat: "0 20px 48px rgba(5,40,30,0.22)" },
    ht: { wash: "linear-gradient(180deg, #F1FAF6 0%, #E7F6EE 100%)", bubbleMe: "#058B5D", bubbleThem: "#FFFFFF", callBg: "#05241A" }
  },
  {
    key: "ocean", name: "Ocean", dark: false, swatch: ["#1D4ED8", "#F2F6FF", "#0E9F8A"],
    t: { bg: "#F2F6FF", surface: "#FFFFFF", surfaceAlt: "#EAF0FF", surfaceSunk: "#DFE8FF", ink: "#0C1A33", inkSoft: "#5A6A88", inkFaint: "#8E9AB3", line: "#DCE5F7", accent: "#1D4ED8", accent2: "#0891B2", accentSoft: "#E3EBFF", gradButton: "linear-gradient(135deg,#1E40AF 0%,#2563EB 100%)", gradButtonDisabled: "linear-gradient(135deg,#CFDAF3,#DDE6F8)", gradWallet: "linear-gradient(150deg,#0B1B3F 0%,#1E3A8A 50%,#0891B2 100%)", positive: "#0E9F8A", positiveSoft: "#DDF6F1", negative: "#E0413F", negativeSoft: "#FCE8E8", shadowCard: "0 6px 20px rgba(29,78,216,0.08)", shadowFloat: "0 20px 48px rgba(12,26,51,0.22)" },
    ht: { wash: "linear-gradient(180deg, #F2F6FF 0%, #E8EFFF 100%)", bubbleMe: "#1D4ED8", bubbleThem: "#FFFFFF", callBg: "#0B1B3F" }
  },
  {
    key: "rose", name: "Rose", dark: false, swatch: ["#D41F6D", "#FFF4F8", "#0FA372"],
    t: { bg: "#FFF4F8", surface: "#FFFFFF", surfaceAlt: "#FDEBF2", surfaceSunk: "#FBE0EB", ink: "#2A0F1C", inkSoft: "#82657A", inkFaint: "#B096A6", line: "#F6D8E5", accent: "#D41F6D", accent2: "#7C3AED", accentSoft: "#FCE3EE", gradButton: "linear-gradient(135deg,#BE185D 0%,#EC4899 100%)", gradButtonDisabled: "linear-gradient(135deg,#F3D3E1,#F8E2EC)", gradWallet: "linear-gradient(150deg,#2A0718 0%,#831843 50%,#EC4899 100%)", positive: "#0FA372", positiveSoft: "#E3F8EE", negative: "#C81E3A", negativeSoft: "#FCE6EA", shadowCard: "0 6px 20px rgba(212,31,109,0.08)", shadowFloat: "0 20px 48px rgba(42,7,24,0.22)" },
    ht: { wash: "linear-gradient(180deg, #FFF4F8 0%, #FDECF3 100%)", bubbleMe: "#D41F6D", bubbleThem: "#FFFFFF", callBg: "#2A0718" }
  },
  {
    key: "graphite", name: "Graphite", dark: true, swatch: ["#F5B700", "#121316", "#3DD68C"],
    t: { bg: "#121316", surface: "#1C1D21", surfaceAlt: "#24262B", surfaceSunk: "#16171A", ink: "#F2F2F0", inkSoft: "#B0B1AE", inkFaint: "#7A7B78", line: "#2C2E33", accent: "#F5B700", accent2: "#5AB0FF", accentSoft: "#3A2F0A", gradButton: "linear-gradient(135deg,#B57600 0%,#D99A00 100%)", gradButtonDisabled: "linear-gradient(135deg,#2C2E33,#34363C)", gradWallet: "linear-gradient(150deg,#1C1D21 0%,#2E2A1E 55%,#6B5410 100%)", positive: "#3DD68C", positiveSoft: "#123526", negative: "#FF6B6B", negativeSoft: "#3A1717", shadowCard: "0 6px 20px rgba(0,0,0,0.4)", shadowFloat: "0 20px 48px rgba(0,0,0,0.6)" },
    ht: { wash: "#121316", bubbleMe: "#F5B700", bubbleMeInk: "#1A1400", bubbleThem: "#24262B", callBg: "#0B0C0E" }
  }
];

var HELLOO_THEME_KEY = "helloo.theme.v1";

// Writes a theme into T and HT. Callers re-render after.
function applyHellooTheme(key) {
  const theme = HELLOO_THEMES.find((x) => x.key === key) || HELLOO_THEMES[0];
  Object.assign(T, theme.t);
  Object.assign(HT, { free: theme.t.positive, freeSoft: theme.t.positiveSoft, bubbleMeInk: "#fff" }, theme.ht);
  try { if (typeof document !== "undefined") { document.documentElement.style.colorScheme = theme.dark ? "dark" : "light"; document.body && (document.body.style.background = theme.t.bg); } } catch (e) { /* no DOM */ }
  return theme;
}

function hellooSavedTheme() {
  try { return localStorage.getItem(HELLOO_THEME_KEY) || "gloobal"; } catch (e) { return "gloobal"; }
}

// Me → App theme. Each card is a tiny live chat in that theme's colours.
function HellooThemeScreen({ current, onPick, onBack }) {
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title="App theme" subtitle="The whole app changes, money colours keep their meaning" /><div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, alignContent: "start" }}>{HELLOO_THEMES.map((th) => { const on = th.key === current; const t = th.t; return <button key={th.key} onClick={() => onPick && onPick(th.key)} aria-pressed={on} className="v2-tap" style={{ border: on ? `2px solid ${T.accent}` : `1px solid ${T.line}`, borderRadius: 20, padding: 0, overflow: "hidden", background: t.bg, cursor: "pointer", textAlign: "left", boxShadow: on ? T.shadowCard : "none" }}><div style={{ padding: "12px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}><span style={{ alignSelf: "flex-start", maxWidth: "80%", background: (th.ht.bubbleThem), color: t.ink, borderRadius: "12px 12px 12px 4px", padding: "6px 9px", fontSize: 11, boxShadow: t.shadowCard }}>Did it land?</span><span style={{ alignSelf: "flex-end", maxWidth: "80%", background: th.ht.bubbleMe, color: th.ht.bubbleMeInk || "#fff", borderRadius: "12px 12px 4px 12px", padding: "6px 9px", fontSize: 11 }}>Yes, in seconds</span><span style={{ alignSelf: "flex-end", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: t.positive, background: t.positiveSoft, borderRadius: 999, padding: "3px 8px" }}>₹ Paid 500</span></div><div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: t.surface, borderTop: `1px solid ${t.line}` }}><span style={{ display: "flex" }}>{th.swatch.map((c, i) => <i key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, marginLeft: i ? -4 : 0, border: `2px solid ${t.surface}` }} />)}</span><span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: t.ink }}>{th.name}</span>{on && <HlCheck size={16} color={t.accent} />}{!on && th.dark && <span style={{ fontSize: 10, fontWeight: 800, color: t.inkFaint }}>dark</span>}</div></button>; })}<div style={{ gridColumn: "1 / -1", fontSize: 11.5, color: T.inkFaint, lineHeight: 1.5, padding: "4px 2px" }}>Follow the phone: GLOOBAL in light mode, Midnight in dark mode — or pick one to keep.</div></div></HellooScreen>;
}
