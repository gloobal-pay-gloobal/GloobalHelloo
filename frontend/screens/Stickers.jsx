// frontend/screens/Stickers.jsx
//
// Helloo's stickers. A sticker is only a NAME sent in a message: the app
// draws it, so nothing is uploaded and no outside library is asked for
// anything. The pack is Helloo's own — Kullu, a clay chai cup with a face.
// Two of them carry money: tapping one opens Pay with the sticker on it,
// and the sticker goes out with the payment.
import { useState as useStateH44, useRef as useRefH50 } from "react";
import { Coins as SkCoins, Clock as SkClock, Star as SkStar, PenLine as SkPen, Plus as SkPlus, Trash2 as SkTrash } from "lucide-react";

// id → how Kullu is drawn. An id is never renamed once sent in a chat.
var HELLOO_STICKERS = {
  "pay-chai": { mood: "wink", words: "Chai?", pay: true, amount: 30, title: "My treat", tone: "#FEF3C7" },
  "pay-gift": { mood: "love", prop: "🎁", cup: "#D97798", words: "For you", pay: true, amount: 0, title: "A gift", tone: "#FCE7F3" },
  "kullu-haan": { mood: "laugh", words: "Haan!" },
  "kullu-kal": { mood: "sleep", prop: "💤", words: "Kal milte", tilt: 3 },
  "kullu-zabardast": { mood: "wow", prop: "🔥", words: "Zabardast" },
  "kullu-pakka": { mood: "wink", prop: "🤝", words: "Pakka", tilt: 4 },
  "kullu-miss": { mood: "love", words: "Miss you", tilt: 3 },
  "kullu-5min": { mood: "wow", prop: "⏰", words: "5 min" },
  "kullu-shukriya": { mood: "smile", prop: "🙏", cup: "#5FA777", words: "Shukriya", tilt: 2 },
  "kullu-sunday": { mood: "laugh", prop: "🏏", words: "Sunday!" },
  "kullu-ok": { mood: "smile", prop: "👍", words: "Theek hai", tilt: -2 },
  "kullu-sorry": { mood: "sad", words: "Sorry", cup: "#8FA3BF", tilt: 2 },
  "kullu-badhai": { mood: "laugh", prop: "🎉", cup: "#D97798", words: "Badhai ho" },
  "kullu-kahan": { mood: "wow", prop: "❓", words: "Kahan ho?", tilt: 3 },
  "hi-haan": { mood: "laugh", words: "हाँ!" },
  "hi-kal": { mood: "sleep", prop: "💤", words: "कल मिलते हैं", tilt: 3 },
  "hi-zabardast": { mood: "wow", prop: "🔥", words: "ज़बरदस्त" },
  "hi-pakka": { mood: "wink", prop: "🤝", words: "पक्का", tilt: 4 },
  "hi-yaad": { mood: "love", words: "याद आ रही है", tilt: 3 },
  "hi-5min": { mood: "wow", prop: "⏰", words: "5 मिनट" },
  "hi-shukriya": { mood: "smile", prop: "🙏", cup: "#5FA777", words: "शुक्रिया", tilt: 2 },
  "hi-chalo": { mood: "laugh", prop: "🚶", words: "चलो!" },
  "hi-khana": { mood: "smile", prop: "🍛", words: "खाना खाया?", tilt: -2 },
  "hi-maaf": { mood: "sad", words: "माफ़ करना", cup: "#8FA3BF", tilt: 2 },
  "hi-badhai": { mood: "laugh", prop: "🎉", cup: "#D97798", words: "बधाई हो" },
  "hi-kahan": { mood: "wow", prop: "❓", words: "कहाँ हो?", tilt: 3 }
};
var HELLOO_STICKER_PACKS = [
  ["kullu", "Kullu", Object.keys(HELLOO_STICKERS).filter((k) => k.indexOf("kullu-") === 0)],
  ["hindi", "हिंदी", Object.keys(HELLOO_STICKERS).filter((k) => k.indexOf("hi-") === 0)]
];
var HELLOO_STICKER_RECENT = "helloo.stickers.recent";
function hellooStickerRecent() {
  try { const list = JSON.parse(localStorage.getItem(HELLOO_STICKER_RECENT) || "[]"); return Array.isArray(list) ? list.filter((id) => HELLOO_STICKERS[id] && !HELLOO_STICKERS[id].pay).slice(0, 8) : []; } catch (e) { return []; }
}
function hellooStickerUsed(id) {
  try { localStorage.setItem(HELLOO_STICKER_RECENT, JSON.stringify([id, ...hellooStickerRecent().filter((x) => x !== id)].slice(0, 8))); } catch (e) { /* private window */ }
}
// The amount last sent with a pay sticker, so "Chai?" remembers 30.
function hellooStickerAmount(id) {
  const s = HELLOO_STICKERS[id];
  try { const v = Number(localStorage.getItem(`helloo.stickers.amount.${id}`)); if (v > 0) return v; } catch (e) { /* private window */ }
  return (s && s.amount) || 0;
}
function hellooStickerAmountSave(id, amount) {
  try { if (amount > 0) localStorage.setItem(`helloo.stickers.amount.${id}`, String(amount)); } catch (e) { /* private window */ }
}

// Kullu: drawn here, cut out with a white edge like a real sticker.
// The button that opens the stickers: a small sticker of a happy face, in
// colour, with one corner peeling up — it looks like what it opens.
function HellooStickerIcon({ size = 24, on = false }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", transform: on ? "rotate(-8deg) scale(1.08)" : "none", transition: "transform 0.18s ease" }}>
    <defs><linearGradient id="hlStickerFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD86B" /><stop offset="1" stopColor="#FF9F43" /></linearGradient></defs>
    <path d="M7 2.5h10A4.5 4.5 0 0 1 21.500 7v6.200L13.200 21.500H7A4.500 4.500 0 0 1 2.500 17V7A4.500 4.500 0 0 1 7 2.500z" fill="url(#hlStickerFace)" stroke="#fff" strokeWidth="1" />
    <path d="M21.500 13.200L13.200 21.500v-4.300a4 4 0 0 1 4-4z" fill="#fff" stroke="#F0B27A" strokeWidth="0.700" strokeLinejoin="round" />
    <ellipse cx="8.600" cy="9.400" rx="1.250" ry="1.650" fill="#4A2A12" /><ellipse cx="14.600" cy="9.400" rx="1.250" ry="1.650" fill="#4A2A12" />
    <path d="M7.800 13.300q3.400 3.600 6.600 0.300" stroke="#4A2A12" strokeWidth="1.500" fill="none" strokeLinecap="round" />
    <circle cx="6.300" cy="12.300" r="1.100" fill="#FF7A59" opacity="0.550" />
  </svg>;
}
function HellooKullu({ size = 96, mood = "smile", prop = "", cup = "#C97B4A", words = "", tilt = -4 }) {
  const eye = (x) => mood === "sleep" ? <path d={`M${x - 6} 52 q6 5 12 0`} stroke="#3B1F12" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    : mood === "love" ? <path d={`M${x} 58 c-9 -6 -8 -13 -3.5 -13 c2 0 3.5 2 3.5 3.5 c0 -1.500 1.500 -3.500 3.500 -3.500 c4.500 0 5.500 7 -3.500 13 z`} fill="#E11D48" />
    : mood === "wow" ? <><circle cx={x} cy="52" r="6.5" fill="#fff" /><circle cx={x} cy="52" r="3.4" fill="#3B1F12" /></>
    : mood === "wink" && x > 50 ? <path d={`M${x - 6} 53 q6 -6 12 0`} stroke="#3B1F12" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    : <><ellipse cx={x} cy="52" rx="4.2" ry="5.4" fill="#3B1F12" /><circle cx={x + 1.4} cy="50" r="1.5" fill="#fff" /></>;
  const mouth = mood === "wow" ? <ellipse cx="50" cy="68" rx="6" ry="7.5" fill="#7A2E1D" />
    : mood === "sleep" ? <path d="M44 67 q6 3 12 0" stroke="#3B1F12" strokeWidth="3" fill="none" strokeLinecap="round" />
    : mood === "sad" ? <path d="M41 70 q9 -8 18 0" stroke="#3B1F12" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    : mood === "laugh" ? <path d="M38 63 q12 16 24 0 z" fill="#7A2E1D" stroke="#3B1F12" strokeWidth="2" strokeLinejoin="round" />
    : <path d="M40 64 q10 10 20 0" stroke="#3B1F12" strokeWidth="3.2" fill="none" strokeLinecap="round" />;
  const cut = "drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 8px 10px rgba(0,0,0,0.22))";
  return <span style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", width: size, flexShrink: 0, transform: `rotate(${tilt}deg)` }}>
    <svg width={size} height={size} viewBox="-4 -4 108 104" aria-hidden="true" style={{ filter: cut, overflow: "visible" }}>
      <path d="M36 16 q-6 -8 2 -13 M50 14 q-6 -8 2 -13 M64 16 q-6 -8 2 -13" stroke="#D6D3D1" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity={mood === "sleep" || mood === "sad" ? 0.35 : 1} />
      <path d="M20 30 h60 l-8 52 q-2 10 -12 10 h-20 q-10 0 -12 -10 z" fill={cup} />
      <path d="M20 30 h60 l-1.6 10 h-56.8 z" fill="rgba(0,0,0,0.14)" />
      <ellipse cx="50" cy="30" rx="30" ry="7" fill="#8B4A2B" /><ellipse cx="50" cy="30" rx="24" ry="4.4" fill="#5B2E16" />
      <path d="M12 58 q-8 4 -4 12" stroke={cup} strokeWidth="6" fill="none" strokeLinecap="round" /><path d="M88 58 q8 4 4 12" stroke={cup} strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="31" cy="63" r="5" fill="#F87171" opacity="0.55" /><circle cx="69" cy="63" r="5" fill="#F87171" opacity="0.55" />
      {eye(37)}{eye(63)}{mouth}
      {prop ? <text x="84" y="26" fontSize="28" textAnchor="middle">{prop}</text> : null}
    </svg>
    {words ? <span style={{ marginTop: -size * 0.1, fontSize: Math.max(11, size * (words.length > 9 ? 0.15 : 0.19)), fontWeight: 900, fontFamily: T.fontDisplay, color: "#1F2937", WebkitTextStroke: `${Math.max(3, size * 0.045)}px #fff`, paintOrder: "stroke fill", letterSpacing: -0.2, whiteSpace: "nowrap", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.18))" }}>{words}</span> : null}
  </span>;
}
// A sticker by its name. A name this app does not know (a newer pack)
// shows as a plain mark, never as broken art.
function HellooSticker({ id, size = 96, mine = null }) {
  if (id === "mine" && mine && mine.mood) return <span role="img" aria-label={`Sticker: ${mine.words || "Kullu"}`} data-sticker="mine" style={{ display: "inline-flex" }}><HellooKullu size={size} mood={mine.mood} prop={mine.prop || ""} cup={mine.cup || "#C97B4A"} words={mine.words || ""} tilt={mine.tilt === undefined ? -4 : mine.tilt} /></span>;
  const s = HELLOO_STICKERS[id];
  if (!s) return <span data-testid="helloo-sticker-unknown" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 16, background: T.surfaceAlt, color: T.inkSoft, fontSize: 13, fontWeight: 700 }}><HellooStickerIcon size={16} />Sticker</span>;
  return <span role="img" aria-label={`Sticker: ${s.words}`} data-sticker={id} style={{ display: "inline-flex" }}><HellooKullu size={size} mood={s.mood} prop={s.prop} cup={s.cup} words={s.words} tilt={s.tilt === undefined ? -4 : s.tilt} /></span>;
}

// ── MAKE YOUR OWN, AND FAVOURITES ────────────────────────────────────
// Your own Kullu: a face, a cup colour, something beside it and your own
// words. Sent as those few choices (never a picture), so it is drawn the
// same on every phone. Kept on this phone in "Mine"; favourites too.
var HELLOO_KULLU_MOODS = [["smile", "Happy"], ["laugh", "Laugh"], ["wink", "Wink"], ["love", "Love"], ["wow", "Wow"], ["sleep", "Sleepy"], ["sad", "Sad"]];
var HELLOO_KULLU_CUPS = ["#C97B4A", "#D97798", "#5FA777", "#8FA3BF", "#E0A43A", "#8B5CF6", "#EF4444", "#334155"];
var HELLOO_KULLU_PROPS = ["", "🔥", "🎉", "❤️", "🙏", "👍", "🤝", "⏰", "🎁", "☕", "🏏", "🍛", "🌧️", "✨", "😂", "💤"];
var HELLOO_STICKER_MINE = "helloo.stickers.mine";
var HELLOO_STICKER_FAV = "helloo.stickers.fav";
function hellooStickerRead(key) { try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function hellooStickerWrite(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private window */ } }
var hellooStickerToken = (id, mine) => (id === "mine" && mine ? `mine:${mine.key}` : id);

function HellooStickerMaker({ start, onSave, onSend, onCancel }) {
  const [k, setK] = useStateH44(start || { mood: "smile", cup: HELLOO_KULLU_CUPS[0], prop: "", words: "" });
  const set = (patch) => setK((o) => Object.assign({}, o, patch));
  const row = (title, child) => <div style={{ padding: "8px 16px 2px" }}><div style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 7 }}>{title}</div>{child}</div>;
  const scroll = { display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 };
  const ready = Boolean(k.words.trim() || k.prop || k.mood !== "smile" || k.cup !== HELLOO_KULLU_CUPS[0]);
  return <div data-testid="helloo-sticker-maker" style={{ paddingBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px 4px" }}>
      <span style={{ width: 128, height: 128, borderRadius: 24, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HellooKullu size={96} mood={k.mood} cup={k.cup} prop={k.prop} words={k.words.trim()} tilt={-4} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Make your Kullu</div>
        <input value={k.words} maxLength={16} onChange={(e) => set({ words: e.target.value.replace(/[\u0000-\u001f]/g, "") })} placeholder="Your words" aria-label="Words on the sticker" data-testid="helloo-sticker-words" style={{ width: "100%", boxSizing: "border-box", marginTop: 8, height: 42, borderRadius: 14, border: `1.5px solid ${T.line}`, padding: "0 12px", fontSize: 15, fontWeight: 700, color: T.ink, background: HT.cardBg || T.surface, outline: "none", fontFamily: T.fontBody }} />
        <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{16 - k.words.length} letters left · any language</div>
      </div>
    </div>
    {row("Face", <div style={scroll}>{HELLOO_KULLU_MOODS.map(([m, name]) => <button key={m} onClick={() => set({ mood: m })} aria-label={name} aria-pressed={k.mood === m} data-testid={`helloo-kullu-mood-${m}`} className="v2-tap" style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 16, border: "none", cursor: "pointer", background: k.mood === m ? T.accentSoft : T.surfaceAlt, boxShadow: k.mood === m ? `inset 0 0 0 2px ${T.accent}` : "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}><HellooKullu size={40} mood={m} cup={k.cup} tilt={0} /></button>)}</div>)}
    {row("Cup", <div style={scroll}>{HELLOO_KULLU_CUPS.map((c) => <button key={c} onClick={() => set({ cup: c })} aria-label={`Cup colour ${c}`} aria-pressed={k.cup === c} className="v2-tap" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", border: `3px solid ${k.cup === c ? T.ink : "#fff"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.18)", background: c, cursor: "pointer", padding: 0 }} />)}</div>)}
    {row("Beside it", <div style={scroll}>{HELLOO_KULLU_PROPS.map((e) => <button key={e || "none"} onClick={() => set({ prop: e })} aria-label={e || "Nothing"} aria-pressed={k.prop === e} className="v2-tap" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, border: "none", cursor: "pointer", background: k.prop === e ? T.accentSoft : T.surfaceAlt, boxShadow: k.prop === e ? `inset 0 0 0 2px ${T.accent}` : "none", fontSize: 21, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: T.inkSoft }}>{e || <span style={{ fontSize: 12, fontWeight: 800 }}>None</span>}</button>)}</div>)}
    <div style={{ display: "flex", gap: 10, padding: "12px 16px 0" }}>
      <button onClick={onCancel} className="v2-tap" style={{ flex: "0 0 auto", height: 46, padding: "0 16px", borderRadius: 999, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Cancel</button>
      <button onClick={() => onSave(k)} disabled={!ready} data-testid="helloo-sticker-save" className="v2-tap" style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: T.accentSoft, color: T.accent, fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.5, fontFamily: T.fontBody }}>Save to Mine</button>
      <button onClick={() => onSend(k)} disabled={!ready} data-testid="helloo-sticker-make-send" className="v2-tap" style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: T.gradButton, color: HT.onAccent || "#fff", fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.5, fontFamily: T.fontBody }}>Send</button>
    </div>
  </div>;
}

// The panel under the message box: favourites, recent, the packs, and
// your own. Hold a sticker to add it to favourites (or edit / delete one
// of yours).
function HellooStickerPanel({ onPick, onPay, onClose }) {
  const [mine, setMine] = useStateH44(() => hellooStickerRead(HELLOO_STICKER_MINE).filter((m) => m && m.key && m.mood));
  const [fav, setFav] = useStateH44(() => hellooStickerRead(HELLOO_STICKER_FAV).filter((t) => typeof t === "string"));
  const [pack, setPack] = useStateH44(() => (hellooStickerRead(HELLOO_STICKER_FAV).length ? "fav" : "kullu"));
  const [making, setMaking] = useStateH44(null); // null | {} new | {key,...} edit
  useHellooBackLayer(Boolean(making), () => setMaking(null));
  const [held, setHeld] = useStateH44(null); // { id, mine }
  const holdT = useRefH50(null); const holdFired = useRefH50(false);
  const recent = hellooStickerRecent();
  const mineByKey = new Map(mine.map((m) => [m.key, m]));
  const fromToken = (t) => (t.indexOf("mine:") === 0 ? (mineByKey.get(t.slice(5)) ? { id: "mine", mine: mineByKey.get(t.slice(5)) } : null) : HELLOO_STICKERS[t] && !HELLOO_STICKERS[t].pay ? { id: t, mine: null } : null);
  const saveMine = (list) => { setMine(list); hellooStickerWrite(HELLOO_STICKER_MINE, list); };
  const saveFav = (list) => { setFav(list); hellooStickerWrite(HELLOO_STICKER_FAV, list); };
  const toggleFav = (it) => { const t = hellooStickerToken(it.id, it.mine); saveFav(fav.includes(t) ? fav.filter((x) => x !== t) : [t, ...fav].slice(0, 24)); setHeld(null); };
  const send = (it) => { if (it.id !== "mine") hellooStickerUsed(it.id); onPick(it.id, it.mine ? { mood: it.mine.mood, cup: it.mine.cup, prop: it.mine.prop, words: it.mine.words } : null); };
  const keep = (k) => { const key = k.key || `k${Date.now().toString(36)}`; const item = { key, mood: k.mood, cup: k.cup, prop: k.prop, words: k.words.trim() }; saveMine([item, ...mine.filter((m) => m.key !== key)].slice(0, 24)); return item; };
  const tabs = [
    ...(fav.length ? [["fav", <SkStar size={19} color={pack === "fav" ? T.accent : T.inkSoft} fill={pack === "fav" ? T.accent : "none"} />, "Favourites"]] : []),
    ["recent", <SkClock size={19} color={pack === "recent" ? T.accent : T.inkSoft} />, "Recent"],
    ["kullu", <HellooKullu size={30} tilt={0} />, "Kullu"],
    ["hindi", <span style={{ fontSize: 16, fontWeight: 900, color: pack === "hindi" ? T.accent : T.ink }}>अ</span>, "हिंदी"],
    ["mine", <SkPen size={18} color={pack === "mine" ? T.accent : T.inkSoft} />, "Mine"],
  ];
  const items = pack === "fav" ? fav.map(fromToken).filter(Boolean)
    : pack === "recent" ? recent.map((id) => ({ id, mine: null }))
    : pack === "mine" ? mine.map((m) => ({ id: "mine", mine: m }))
    : ((HELLOO_STICKER_PACKS.find((p) => p[0] === pack) || [0, 0, []])[2]).map((id) => ({ id, mine: null }));
  const title = { fav: "Favourites", recent: "Recent", mine: "Mine", kullu: "Kullu", hindi: "हिंदी" }[pack];
  const label = (t, right) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 18px 6px" }}><span style={{ fontSize: 15, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{t}</span>{right ? <span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft }}>{right}</span> : null}</div>;
  const press = (it) => ({
    onPointerDown: () => { holdFired.current = false; clearTimeout(holdT.current); holdT.current = setTimeout(() => { holdFired.current = true; setHeld(it); }, 450); },
    onPointerUp: () => clearTimeout(holdT.current), onPointerLeave: () => clearTimeout(holdT.current), onPointerCancel: () => clearTimeout(holdT.current),
    onContextMenu: (e) => { e.preventDefault(); clearTimeout(holdT.current); holdFired.current = true; setHeld(it); },
    onClick: () => { if (holdFired.current) { holdFired.current = false; return; } send(it); },
  });
  const tile = (it, i) => { const t = hellooStickerToken(it.id, it.mine); const starred = fav.includes(t); const on = held && hellooStickerToken(held.id, held.mine) === t;
    return <button key={t + i} {...press(it)} data-testid={it.id === "mine" ? `helloo-sticker-mine-${i}` : `helloo-sticker-${it.id}`} aria-label={`Sticker: ${it.mine ? it.mine.words || "Kullu" : (HELLOO_STICKERS[it.id] || {}).words}${starred ? ", favourite" : ""}`} className="v2-tap" style={{ position: "relative", border: "none", background: on ? T.accentSoft : "none", borderRadius: 16, padding: 2, cursor: "pointer", WebkitTouchCallout: "none", userSelect: "none" }}><HellooSticker id={it.id} mine={it.mine} size={66} />{starred ? <span aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}><SkStar size={10} color="#fff" fill="#fff" /></span> : null}</button>; };
  return <div data-testid="helloo-stickers" style={{ position: "relative", flexShrink: 0, height: 392, display: "flex", flexDirection: "column", background: HT.cardBg || T.surface, borderTop: `1px solid ${T.line}`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 10px", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>{tabs.map(([k, el, name]) => <button key={k} onClick={() => { setPack(k); setMaking(null); setHeld(null); }} aria-label={name} aria-pressed={pack === k} data-testid={`helloo-sticker-pack-${k}`} className="v2-tap" style={{ flexShrink: 0, width: 46, height: 42, borderRadius: 14, border: "none", background: pack === k ? T.accentSoft : "transparent", boxShadow: pack === k ? `inset 0 0 0 1.5px ${T.accent}` : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>{el}</button>)}</div>
      <button onClick={() => { setPack("mine"); setMaking({}); setHeld(null); }} aria-label="Make your own sticker" data-testid="helloo-sticker-make" title="Make your own" className="v2-tap" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", border: "none", background: T.gradButton, color: HT.onAccent || "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><SkPlus size={19} strokeWidth={2.6} /></button>
      <button onClick={onClose} aria-label="Close stickers" className="v2-tap" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", border: "none", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlDown size={18} color={T.inkSoft} /></button>
    </div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} onScroll={() => clearTimeout(holdT.current)}>
      {making ? <HellooStickerMaker start={making.key ? Object.assign({}, making) : null} onCancel={() => setMaking(null)} onSave={(k) => { keep(Object.assign({}, k, { key: making.key })); setMaking(null); setPack("mine"); }} onSend={(k) => { const item = keep(Object.assign({}, k, { key: making.key })); setMaking(null); setPack("mine"); send({ id: "mine", mine: item }); }} /> : <>
      {(pack === "kullu" || pack === "hindi") && onPay ? <>{label("Send with money", "Only on Helloo")}<div style={{ display: "flex", gap: 10, padding: "2px 14px 4px" }}>{Object.keys(HELLOO_STICKERS).filter((k) => HELLOO_STICKERS[k].pay).map((id) => { const s = HELLOO_STICKERS[id]; const amount = hellooStickerAmount(id); return <button key={id} onClick={() => onPay(id)} data-testid={`helloo-sticker-${id}`} className="v2-tap" style={{ flex: 1, minWidth: 0, borderRadius: 22, border: "none", background: s.tone, padding: "10px 8px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}><HellooSticker id={id} size={64} /><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "#1F2937" }}>{s.title}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, marginTop: 4, padding: "0 9px", borderRadius: 999, background: "rgba(255,255,255,0.85)", color: "#065F46", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}><SkCoins size={11} color="#059669" />{amount ? `sends ${amount}` : "you choose"}</span></span></button>; })}</div></> : null}
      {label(title, items.length ? `${items.length} sticker${items.length === 1 ? "" : "s"}` : "")}
      {items.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px 4px", padding: "6px 12px 16px", justifyItems: "center", alignItems: "end" }}>{items.map(tile)}</div>
        : pack === "mine" ? <div style={{ padding: "14px 24px", textAlign: "center" }}><HellooKullu size={72} mood="wink" words="Your words" /><div style={{ fontSize: 13.5, color: T.inkSoft, margin: "12px 0", lineHeight: 1.5 }}>Make Kullu yours: pick a face, a cup colour, something beside it, and your own words.</div><button onClick={() => setMaking({})} className="v2-tap" style={{ height: 42, padding: "0 18px", borderRadius: 999, border: "none", background: T.gradButton, color: HT.onAccent || "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Make a sticker</button></div>
        : <div style={{ padding: "20px 24px", textAlign: "center", fontSize: 13, color: T.inkSoft }}>{pack === "recent" ? "Stickers you send show here." : "Hold a sticker to add it here."}</div>}
      {!items.length || pack === "fav" ? null : <div style={{ padding: "0 18px 14px", fontSize: 12, color: T.inkFaint, textAlign: "center" }}>Hold a sticker to add it to favourites{pack === "mine" ? ", edit or delete it" : ""}.</div>}
      </>}
    </div>
    {held && !making ? <div data-testid="helloo-sticker-hold" style={{ position: "absolute", left: 10, right: 10, bottom: "calc(10px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 20, background: HT.cardBg || T.surface, boxShadow: "0 8px 28px rgba(0,0,0,0.22)" }}>
      <HellooSticker id={held.id} mine={held.mine} size={40} />
      <span style={{ flex: 1 }} />
      <button onClick={() => toggleFav(held)} data-testid="helloo-sticker-fav" className="v2-tap" style={{ height: 38, padding: "0 12px", borderRadius: 999, border: "none", background: "#FEF3C7", color: "#92400E", fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}><SkStar size={14} color="#D97706" fill={fav.includes(hellooStickerToken(held.id, held.mine)) ? "#D97706" : "none"} />{fav.includes(hellooStickerToken(held.id, held.mine)) ? "Unfavourite" : "Favourite"}</button>
      {held.mine ? <button onClick={() => { setMaking(Object.assign({}, held.mine)); setHeld(null); }} aria-label="Edit" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SkPen size={16} color={T.ink} /></button> : null}
      {held.mine ? <button onClick={() => { saveMine(mine.filter((m) => m.key !== held.mine.key)); saveFav(fav.filter((t) => t !== `mine:${held.mine.key}`)); setHeld(null); }} aria-label="Delete" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SkTrash size={16} color="#DC2626" /></button> : null}
      <button onClick={() => setHeld(null)} aria-label="Done" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={16} color={T.inkSoft} /></button>
    </div> : null}
  </div>;
}
