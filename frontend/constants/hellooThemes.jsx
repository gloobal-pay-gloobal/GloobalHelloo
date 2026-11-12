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

var HELLOO_FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";

// Each theme is more than a palette: shape (corner radii, bubble tails),
// surface (shadowed, bordered or glass), type (display face), the chat
// wallpaper and the tab bar (flat or floating). Fonts load from Google
// Fonts in index.html: Space Grotesk, Fraunces, Baloo 2, Poppins, DM Mono.
var HELLOO_THEMES = [
  {
    key: "gloobal", name: "GLOOBAL", note: "The house style", dark: false, swatch: ["#7C3AED", "#F6F5FC", "#0FA372"],
    t: { bg: "#F6F5FC", surface: "#FFFFFF", surfaceAlt: "#F3F1FA", surfaceSunk: "#EEEBF9", ink: "#15132A", inkSoft: "#6B6580", inkFaint: "#9C96AF", line: "#EAE6F7", accent: "#7C3AED", accent2: "#3B6EF5", accentSoft: "#F1ECFC", gradButton: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)", gradButtonDisabled: "linear-gradient(135deg,#D9D3F3,#E6DFF8)", gradWallet: "linear-gradient(150deg,#1E1B4B 0%,#3E2E8E 42%,#7C3AED 80%,#C026D3 100%)", positive: "#0FA372", positiveSoft: "#E3F8EE", negative: "#E23F45", negativeSoft: "#FCEAEA", shadowCard: "0 6px 20px rgba(76,29,149,0.07)", shadowFloat: "0 20px 48px rgba(30,20,70,0.24)", fontDisplay: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif", fontBody: HELLOO_FONT_BODY },
    ht: { wash: "linear-gradient(180deg, #F6F5FC 0%, #F3EFFD 100%)", bubbleMe: "#7C3AED", bubbleThem: "#FFFFFF", callBg: "#120B2E" }
  },
  {
    // Dark, with depth: an aurora behind everything and frosted glass on top.
    key: "aurora", name: "Aurora", note: "Dark glass over a slow aurora", dark: true, swatch: ["#8C69FF", "#0B0A1A", "#2EE6A6"],
    t: { bg: "#0B0A1A", surface: "#16142B", surfaceAlt: "rgba(255,255,255,0.07)", surfaceSunk: "rgba(255,255,255,0.05)", ink: "#F4F2FF", inkSoft: "#BBB5D8", inkFaint: "#857FA6", line: "rgba(255,255,255,0.09)", accent: "#A98BFF", accent2: "#6EC3FF", accentSoft: "rgba(169,139,255,0.18)", gradButton: "linear-gradient(135deg,#7C5CFF 0%,#C05CFF 100%)", gradButtonDisabled: "linear-gradient(135deg,#2A2745,#2F2B4E)", gradWallet: "linear-gradient(150deg,rgba(124,92,255,0.55) 0%,rgba(192,92,255,0.35) 60%,rgba(46,230,166,0.25) 100%)", positive: "#2EE6A6", positiveSoft: "rgba(46,230,166,0.14)", negative: "#FF6B7A", negativeSoft: "rgba(255,107,122,0.14)", shadowCard: "none", shadowFloat: "0 20px 50px rgba(0,0,0,0.6)", fontDisplay: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif", fontBody: HELLOO_FONT_BODY },
    ht: { screenBg: "radial-gradient(120% 60% at 0% 0%, rgba(124,92,255,0.38) 0%, transparent 60%), radial-gradient(90% 50% at 100% 30%, rgba(46,230,166,0.20) 0%, transparent 60%), radial-gradient(80% 50% at 50% 100%, rgba(192,92,255,0.25) 0%, transparent 60%), #0B0A1A", wash: "transparent", chatBg: "transparent", cardBg: "rgba(255,255,255,0.06)", cardBorder: "1px solid rgba(255,255,255,0.10)", cardShadow: "none", blur: "blur(18px)", barBg: "rgba(11,10,26,0.55)", tabBar: "float", tabBg: "rgba(22,20,43,0.72)", radius: 22, bubbleMe: "linear-gradient(135deg,#7C5CFF,#B05CFF)", bubbleThem: "rgba(255,255,255,0.08)", bubbleBorder: "1px solid rgba(255,255,255,0.10)", bubbleMeShadow: "0 8px 22px -10px rgba(124,92,255,0.9)", buttonGlow: "0 10px 30px -8px rgba(160,92,255,0.75)", callBg: "#07061A" }
  },
  {
    // Editorial. Paper-white, ink-black, hairlines instead of shadows, a
    // serif for headings, square-ish corners. Reads like a letter.
    key: "paper", name: "Paper", note: "Ink on white, serif, hairlines", dark: false, swatch: ["#111111", "#FFFFFF", "#D93F1F"],
    t: { bg: "#FFFFFF", surface: "#FFFFFF", surfaceAlt: "#F4F4F2", surfaceSunk: "#EFEFEC", ink: "#111111", inkSoft: "#5C5C58", inkFaint: "#93938E", line: "#E3E3DF", accent: "#111111", accent2: "#2D5BD7", accentSoft: "#EFEFEC", gradButton: "#111111", gradButtonDisabled: "#D6D6D2", gradWallet: "#111111", positive: "#127A4B", positiveSoft: "#E6F2EC", negative: "#D93F1F", negativeSoft: "#FBEAE5", shadowCard: "none", shadowFloat: "0 18px 40px rgba(0,0,0,0.16)", fontDisplay: "'Fraunces', Georgia, 'Times New Roman', serif", fontBody: "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif" },
    ht: { wash: "#FFFFFF", chatBg: "#FAFAF9", cardBorder: "1px solid #E3E3DF", cardShadow: "none", radius: 8, chipRadius: 6, buttonRadius: 8, iconRadius: 8, bubbleRadius: 10, bubbleTail: 2, bubbleMe: "#111111", bubbleThem: "#FFFFFF", bubbleBorder: "1px solid #E3E3DF", tabTopBorder: "1px solid #111111", chipOnBorder: "1px solid #111111", buttonTracking: 0.4, callBg: "#111111" }
  },
  {
    // Festive and local: marigold and peacock teal, rounder everything, a
    // rangoli dot pattern behind the chat, Baloo 2 for headings (it has
    // Devanagari, so Hindi names look right too).
    key: "bazaar", name: "Bazaar", note: "Marigold, peacock, rangoli", dark: false, swatch: ["#E8590C", "#FFF7EC", "#0F766E"],
    t: { bg: "#FFF7EC", surface: "#FFFFFF", surfaceAlt: "#FFF0DC", surfaceSunk: "#FDE8CC", ink: "#2B1A0E", inkSoft: "#7A5E48", inkFaint: "#AE927A", line: "#F6E2C6", accent: "#E8590C", accent2: "#0F766E", accentSoft: "#FFE8D4", gradButton: "linear-gradient(135deg,#D9480F 0%,#F59F00 100%)", gradButtonDisabled: "linear-gradient(135deg,#F3DCC2,#F8E6D2)", gradWallet: "linear-gradient(150deg,#0F766E 0%,#115E59 45%,#E8590C 100%)", positive: "#0F766E", positiveSoft: "#D8F3EE", negative: "#C92A2A", negativeSoft: "#FDE4E4", shadowCard: "0 8px 22px rgba(232,89,12,0.10)", shadowFloat: "0 20px 48px rgba(43,26,14,0.22)", fontDisplay: "'Baloo 2', 'Poppins', system-ui, sans-serif", fontBody: "'Poppins', -apple-system, 'Segoe UI', sans-serif" },
    ht: { wash: "#FFF7EC", chatBg: "radial-gradient(circle at 12px 12px, rgba(232,89,12,0.14) 2px, transparent 2.5px) 0 0 / 24px 24px, radial-gradient(circle at 0 0, rgba(15,118,110,0.10) 1.5px, transparent 2px) 0 0 / 24px 24px, #FFF7EC", radius: 26, chipRadius: 999, buttonRadius: 999, bubbleRadius: 22, bubbleTail: 6, bubbleMe: "linear-gradient(135deg,#E8590C,#F59F00)", bubbleThem: "#FFFFFF", bubbleBorder: "1px solid #F6E2C6", tabBar: "float", tabBg: "rgba(255,255,255,0.92)", callBg: "#0B3B37" }
  },
  {
    // Soft and airy: a pastel sky behind glass-white cards, big radii,
    // Poppins. Light that never feels flat.
    key: "sky", name: "Sky", note: "Pastel sky, soft glass", dark: false, swatch: ["#4F7BFF", "#EEF3FF", "#FF7AB6"],
    t: { bg: "#EEF3FF", surface: "#FFFFFF", surfaceAlt: "rgba(255,255,255,0.7)", surfaceSunk: "rgba(255,255,255,0.55)", ink: "#13203D", inkSoft: "#5B6A8B", inkFaint: "#8E9BB8", line: "rgba(19,32,61,0.08)", accent: "#4F7BFF", accent2: "#FF7AB6", accentSoft: "rgba(79,123,255,0.14)", gradButton: "linear-gradient(135deg,#4F7BFF 0%,#9B7BFF 55%,#FF7AB6 100%)", gradButtonDisabled: "linear-gradient(135deg,#D6DFF5,#E5EAF8)", gradWallet: "linear-gradient(150deg,#4F7BFF 0%,#9B7BFF 55%,#FF7AB6 100%)", positive: "#10A37F", positiveSoft: "rgba(16,163,127,0.13)", negative: "#E5484D", negativeSoft: "rgba(229,72,77,0.12)", shadowCard: "0 10px 30px rgba(79,123,255,0.12)", shadowFloat: "0 24px 60px rgba(19,32,61,0.22)", fontDisplay: "'Poppins', system-ui, sans-serif", fontBody: "'Poppins', -apple-system, 'Segoe UI', sans-serif" },
    ht: { screenBg: "linear-gradient(170deg, #E3ECFF 0%, #F2E9FF 45%, #FFE9F3 100%)", wash: "transparent", chatBg: "transparent", cardBg: "rgba(255,255,255,0.72)", cardBorder: "1px solid rgba(255,255,255,0.9)", blur: "blur(16px)", barBg: "rgba(255,255,255,0.6)", radius: 28, chipRadius: 999, bubbleRadius: 22, bubbleTail: 22, bubbleMe: "linear-gradient(135deg,#4F7BFF,#9B7BFF)", bubbleThem: "rgba(255,255,255,0.85)", bubbleMeShadow: "0 10px 24px -12px rgba(79,123,255,0.9)", tabBar: "float", tabBg: "rgba(255,255,255,0.7)", buttonGlow: "0 12px 30px -10px rgba(155,123,255,0.8)", callBg: "#1B2A55" }
  },
  {
    // Built for night and for work: near-black, amber, square corners,
    // borders not shadows, mono numerals. A tool, not a toy.
    key: "graphite", name: "Graphite", note: "Near-black, amber, sharp", dark: true, swatch: ["#F5B700", "#0E0F11", "#3DD68C"],
    t: { bg: "#0E0F11", surface: "#17181B", surfaceAlt: "#1F2024", surfaceSunk: "#131416", ink: "#EDEDEA", inkSoft: "#A7A8A4", inkFaint: "#6F706C", line: "#2A2C30", accent: "#F5B700", accent2: "#5AB0FF", accentSoft: "rgba(245,183,0,0.14)", gradButton: "#F5B700", gradButtonDisabled: "#2A2C30", gradWallet: "linear-gradient(150deg,#17181B 0%,#25221A 60%,#4A3A0C 100%)", positive: "#3DD68C", positiveSoft: "rgba(61,214,140,0.13)", negative: "#FF6B6B", negativeSoft: "rgba(255,107,107,0.13)", shadowCard: "none", shadowFloat: "0 20px 48px rgba(0,0,0,0.6)", fontDisplay: "'DM Mono', ui-monospace, Menlo, monospace", fontBody: HELLOO_FONT_BODY },
    ht: { wash: "#0E0F11", chatBg: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 100% 28px, #0E0F11", cardBorder: "1px solid #2A2C30", cardShadow: "none", radius: 6, chipRadius: 4, buttonRadius: 6, iconRadius: 6, bubbleRadius: 8, bubbleTail: 2, bubbleMe: "#F5B700", bubbleMeInk: "#1A1400", bubbleThem: "#1F2024", bubbleBorder: "1px solid #2A2C30", onAccent: "#1A1400", buttonTracking: 0.6, buttonCase: "uppercase", tabTopBorder: "1px solid #2A2C30", callBg: "#08090A" }
  }
];

// Style keys a theme may set on HT; cleared before each apply so a key
// one theme sets never leaks into the next.
var HELLOO_THEME_STYLE_KEYS = ["screenBg", "chatBg", "cardBg", "cardBorder", "cardShadow", "blur", "barBg", "tabBar", "tabBg", "tabTopBorder", "radius", "chipRadius", "buttonRadius", "iconRadius", "bubbleRadius", "bubbleTail", "bubbleBorder", "bubbleMeShadow", "bubbleMeInk", "buttonGlow", "onAccent", "chipOnBorder", "buttonTracking", "buttonCase"];

var HELLOO_THEME_KEY = "helloo.theme.v1";

// Writes a theme into T and HT. Callers re-render after.
function applyHellooTheme(key) {
  const theme = HELLOO_THEMES.find((x) => x.key === key) || HELLOO_THEMES[0];
  const values = Object.assign({}, theme.t, { fontWordmark: theme.key === "paper" ? "Inter, sans-serif" : T.fontWordmark });
  // Gloobal's T became a set of getters over its active palette (its themes,
  // 0233–0235), so a value can no longer be written onto T itself: it goes
  // into the palette T reads from. A key T does not carry yet gets a getter
  // of the same kind. (An older Gloobal bundle, with a plain T, still works.)
  if (typeof GLOOBAL_PALETTE_ACTIVE === "object" && GLOOBAL_PALETTE_ACTIVE) {
    Object.assign(GLOOBAL_PALETTE_ACTIVE, values);
    for (const k of Object.keys(values)) {
      if (!(k in T)) Object.defineProperty(T, k, { enumerable: true, configurable: true, get() { return GLOOBAL_PALETTE_ACTIVE[k]; } });
    }
  } else {
    Object.assign(T, values);
  }
  for (const k of HELLOO_THEME_STYLE_KEYS) HT[k] = undefined;
  Object.assign(HT, { free: theme.t.positive, freeSoft: theme.t.positiveSoft, bubbleMeInk: "#fff" }, theme.ht);
  try { if (typeof document !== "undefined") { document.documentElement.style.colorScheme = theme.dark ? "dark" : "light"; document.body && (document.body.style.background = theme.t.bg); } } catch (e) { /* no DOM */ }
  return theme;
}

function hellooSavedTheme() {
  try { return localStorage.getItem(HELLOO_THEME_KEY) || "gloobal"; } catch (e) { return "gloobal"; }
}

// Me → App theme. Each card is a tiny live chat in that theme's colours.
function HellooThemeScreen({ current, onPick, onBack }) {
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title="App theme" subtitle="The whole app changes, money colours keep their meaning" /><div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, alignContent: "start" }}>{HELLOO_THEMES.map((th) => { const on = th.key === current; const t = th.t; return <button key={th.key} onClick={() => onPick && onPick(th.key)} aria-pressed={on} className="v2-tap" style={{ border: on ? `2px solid ${T.accent}` : `1px solid ${T.line}`, borderRadius: 20, padding: 0, overflow: "hidden", background: th.ht.screenBg || th.ht.chatBg || t.bg, cursor: "pointer", textAlign: "left", boxShadow: on ? T.shadowCard : "none" }}><div style={{ padding: "12px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontFamily: t.fontDisplay, fontSize: 15, fontWeight: 800, color: t.ink }}>Helloo</span><span style={{ alignSelf: "flex-start", maxWidth: "80%", background: (th.ht.bubbleThem), border: th.ht.bubbleBorder || "none", color: t.ink, borderRadius: `${th.ht.bubbleRadius ?? 12}px ${th.ht.bubbleRadius ?? 12}px ${th.ht.bubbleRadius ?? 12}px ${th.ht.bubbleTail ?? 4}px`, padding: "6px 9px", fontSize: 11 }}>Did it land?</span><span style={{ alignSelf: "flex-end", maxWidth: "80%", background: th.ht.bubbleMe, color: th.ht.bubbleMeInk || "#fff", borderRadius: `${th.ht.bubbleRadius ?? 12}px ${th.ht.bubbleRadius ?? 12}px ${th.ht.bubbleTail ?? 4}px ${th.ht.bubbleRadius ?? 12}px`, padding: "6px 9px", fontSize: 11 }}>Yes, in seconds</span><span style={{ alignSelf: "flex-end", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: t.positive, background: t.positiveSoft, borderRadius: 999, padding: "3px 8px" }}>₹ Paid 500</span></div><div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: t.surface, borderTop: `1px solid ${t.line}` }}><span style={{ display: "flex" }}>{th.swatch.map((c, i) => <i key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, marginLeft: i ? -4 : 0, border: `2px solid ${t.surface}` }} />)}</span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 800, color: t.ink }}>{th.name}</span><span style={{ display: "block", fontSize: 10, color: t.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{th.note}</span></span>{on && <HlCheck size={16} color={t.accent} />}{!on && th.dark && <span style={{ fontSize: 10, fontWeight: 800, color: t.inkFaint }}>dark</span>}</div></button>; })}<div style={{ gridColumn: "1 / -1", fontSize: 11.5, color: T.inkFaint, lineHeight: 1.5, padding: "4px 2px" }}>Follow the phone: GLOOBAL in light mode, Aurora in dark mode — or pick one to keep.</div></div></HellooScreen>;
}
