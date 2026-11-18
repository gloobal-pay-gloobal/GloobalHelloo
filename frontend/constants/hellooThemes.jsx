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

// ── GLOOBAL's own themes ─────────────────────────────────────────────
//
// Helloo wears the same themes as GLOOBAL (Peacock, Lotus, Chai…), and the
// same way: each is a pair, one colour for your own side and one for the
// shop. Which half you see follows the side you use Helloo as, so a shop
// owner talking as the shop sees the shop colours, like in GLOOBAL. Read
// from GLOOBAL_THEMES in GLOOBAL's bundle, so a theme added there shows up
// here with no copy to keep in step. One font everywhere (the body face):
// headings, names and numbers all read as one app.
var HELLOO_GLOOBAL_PREFIX = "g-";
function hellooSideNow() {
  try { return hellooFaceNow && hellooFaceNow.as && hellooFaceNow.as !== "self" ? "creator" : "personal"; } catch (e) { return "personal"; }
}
function hellooGloobalTheme(name, side) {
  if (typeof GLOOBAL_THEMES !== "object" || !GLOOBAL_THEMES || !GLOOBAL_THEMES[name]) return null;
  const g = GLOOBAL_THEMES[name];
  const p = g[side] || g.personal;
  if (!p) return null;
  const font = HELLOO_FONT_BODY;
  return {
    key: HELLOO_GLOOBAL_PREFIX + name, name: g.name, note: g.looks ? `${g.looks.personal} · ${g.looks.creator}` : (g.tagline || ""), dark: !!p.dark, gloobal: true,
    swatch: [g.personal.accent, g.personal.bg, g.creator.accent],
    t: { bg: p.bg, surface: p.surface, surfaceAlt: p.surfaceAlt, surfaceSunk: p.surfaceSunk, ink: p.ink, inkSoft: p.inkSoft, inkFaint: p.inkFaint, line: p.line, accent: p.accent, accent2: p.accent2, accentSoft: p.accentSoft, gradButton: p.gradButton, gradButtonDisabled: p.gradButtonDisabled, gradWallet: p.gradWallet, positive: p.positive, positiveSoft: p.positiveSoft, negative: p.negative, negativeSoft: p.negativeSoft, shadowCard: p.shadowCard, shadowFloat: p.shadowFloat, fontDisplay: font, fontBody: font },
    ht: { wash: p.bg, bubbleMe: p.gradButton || p.accent, bubbleThem: p.surface, callBg: p.accentDeep || "#0B1020" }
  };
}
function hellooGloobalThemeList(side) {
  if (typeof GLOOBAL_THEMES !== "object" || !GLOOBAL_THEMES) return [];
  return Object.keys(GLOOBAL_THEMES).map((k) => hellooGloobalTheme(k, side)).filter(Boolean);
}
function hellooFindTheme(key) {
  if (key && key.indexOf(HELLOO_GLOOBAL_PREFIX) === 0) return hellooGloobalTheme(key.slice(HELLOO_GLOOBAL_PREFIX.length), hellooSideNow());
  return HELLOO_THEMES.find((x) => x.key === key) || null;
}
// A new phone opens in GLOOBAL's Peacock: the same look as GLOOBAL.
var HELLOO_DEFAULT_THEME = "g-peacock";

// Style keys a theme may set on HT; cleared before each apply so a key
// one theme sets never leaks into the next.
var HELLOO_THEME_STYLE_KEYS = ["screenBg", "chatBg", "cardBg", "cardBorder", "cardShadow", "blur", "barBg", "tabBar", "tabBg", "tabTopBorder", "radius", "chipRadius", "buttonRadius", "iconRadius", "bubbleRadius", "bubbleTail", "bubbleBorder", "bubbleMeShadow", "bubbleMeInk", "buttonGlow", "onAccent", "chipOnBorder", "buttonTracking", "buttonCase"];

var HELLOO_THEME_KEY = "helloo.theme.v1";

// Writes a theme into T and HT. Callers re-render after.
function applyHellooTheme(key) {
  const theme = hellooFindTheme(key) || hellooFindTheme(HELLOO_DEFAULT_THEME) || HELLOO_THEMES[0];
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
  // Helloo wears GLOOBAL's colours only; an older pick of one of Helloo's
  // own looks opens on the default.
  try { const k = localStorage.getItem(HELLOO_THEME_KEY) || ""; return k.indexOf(HELLOO_GLOOBAL_PREFIX) === 0 && hellooFindTheme(k) ? k : HELLOO_DEFAULT_THEME; } catch (e) { return HELLOO_DEFAULT_THEME; }
}

// ── PICKING COLOURS ──────────────────────────────────────────────────
//
// No names: a grid of colours. Each is one GLOOBAL theme — the left half
// your own colour, the right half your shop's. Tapping one changes the app
// (or the chat) behind the picker at once, so what it is needs no words.
function HellooThemeSwatch({ name, on, onPick, size = 54 }) {
  const g = typeof GLOOBAL_THEMES === "object" && GLOOBAL_THEMES ? GLOOBAL_THEMES[name] : null;
  if (!g) return null;
  const a = g.personal.gradButton || g.personal.accent;
  const b = g.creator.gradButton || g.creator.accent;
  return <button onClick={() => onPick && onPick(HELLOO_GLOOBAL_PREFIX + name)} aria-pressed={on} aria-label={on ? "These colours · chosen" : "Use these colours"} data-helloo-swatch={name} className="v2-tap" style={{ width: size + 10, height: size + 10, borderRadius: "50%", border: on ? `3px solid ${T.ink}` : "3px solid transparent", padding: 2, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", justifySelf: "center" }}><span style={{ position: "relative", width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "block", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.45)" }}><span style={{ position: "absolute", inset: 0, background: a, clipPath: "polygon(0 0, 100% 0, 0 100%)" }} /><span style={{ position: "absolute", inset: 0, background: b, clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />{on ? <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}><HlCheck size={13} color="#111" /></span></span> : null}</span></button>;
}
function HellooThemeGrid({ current, onPick, lead = null }) {
  const keys = typeof GLOOBAL_THEMES === "object" && GLOOBAL_THEMES ? Object.keys(GLOOBAL_THEMES) : [];
  return <div data-testid="helloo-theme-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", rowGap: 14, columnGap: 6, padding: "6px 0" }}>{lead}{keys.map((k) => <HellooThemeSwatch key={k} name={k} on={current === HELLOO_GLOOBAL_PREFIX + k} onPick={onPick} />)}</div>;
}

// Me → Colours. The app changes behind the grid as you tap.
function HellooThemeScreen({ current, onPick, onBack }) {
  // Which side the button column sits on (the same as sliding it across).
  const [rail, setRail] = useStateH1(() => (typeof hellooRailSide === "function" ? hellooRailSide() : "right"));
  const pickRail = (v) => { if (typeof hellooSaveRailSide === "function") hellooSaveRailSide(v); setRail(v); };
  const railPick = <div style={{ marginTop: 18 }}><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: T.inkFaint, margin: "0 4px 8px", textTransform: "uppercase" }}>Buttons</div><HellooCard style={{ padding: 6, display: "flex", gap: 6 }}>{[["left", "Left"], ["right", "Right"]].map(([k, l]) => <button key={k} role="radio" aria-checked={rail === k} data-testid={`helloo-rail-${k}`} onClick={() => pickRail(k)} className="v2-tap" style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: rail === k ? T.accentSoft : "transparent", color: rail === k ? T.accent : T.inkSoft, fontFamily: T.fontBody, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: k === "left" ? "flex-start" : "flex-end", padding: "0 14px", gap: 8 }}>{k === "left" ? <span style={{ width: 6, height: 22, borderRadius: 3, background: rail === k ? T.accent : T.line }} /> : null}{l}{k === "right" ? <span style={{ width: 6, height: 22, borderRadius: 3, background: rail === k ? T.accent : T.line }} /> : null}</button>)}</HellooCard><div style={{ fontSize: 11.5, color: T.inkFaint, margin: "8px 4px 0" }}>Or slide the buttons across the screen.</div></div>;
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title="Colours" /><div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 30px" }}><HellooCard style={{ padding: "16px 10px" }}><HellooThemeGrid current={current} onPick={onPick} /></HellooCard><div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, fontSize: 12, color: T.inkSoft }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><HlUser size={14} color={T.inkSoft} />left · you</span><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><HlStore size={14} color={T.inkSoft} />right · your shop</span></div>{railPick}</div></HellooScreen>;
}

// A chat's own colours, over the open chat: it recolours as you tap. The
// first circle goes back to the app's colours.
function HellooChatThemeSheet({ current = "", appTheme, onPick, onClose }) {
  const reset = <button key="app" onClick={() => onPick && onPick("")} aria-pressed={!current} aria-label={!current ? "App colours · chosen" : "Use the app colours"} data-helloo-swatch="app" className="v2-tap" style={{ width: 64, height: 64, borderRadius: "50%", border: !current ? `3px solid ${T.ink}` : "3px solid transparent", padding: 2, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", justifySelf: "center" }}><span style={{ width: 54, height: 54, borderRadius: "50%", border: `2px dashed ${T.inkFaint}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}><HlRetry size={20} color={T.inkSoft} /></span></button>;
  return <HellooSheet label="Chat colours" onClose={onClose}><div data-testid="helloo-chat-theme"><HellooThemeGrid current={current} onPick={onPick} lead={reset} /></div></HellooSheet>;
}
