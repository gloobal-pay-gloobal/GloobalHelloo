// frontend/screens/Stickers.jsx
//
// Helloo's stickers. A sticker is only a NAME sent in a message: the app
// draws it, so nothing is uploaded and no outside library is asked for
// anything. The pack is Helloo's own — Kullu, a clay chai cup with a face.
// Two of them carry money: tapping one opens Pay with the sticker on it,
// and the sticker goes out with the payment.
import { useState as useStateH44 } from "react";
import { Sticker as SkIcon, Coins as SkCoins, Clock as SkClock } from "lucide-react";

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
function HellooSticker({ id, size = 96 }) {
  const s = HELLOO_STICKERS[id];
  if (!s) return <span data-testid="helloo-sticker-unknown" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 16, background: T.surfaceAlt, color: T.inkSoft, fontSize: 13, fontWeight: 700 }}><SkIcon size={15} color={T.inkSoft} />Sticker</span>;
  return <span role="img" aria-label={`Sticker: ${s.words}`} data-sticker={id} style={{ display: "inline-flex" }}><HellooKullu size={size} mood={s.mood} prop={s.prop} cup={s.cup} words={s.words} tilt={s.tilt === undefined ? -4 : s.tilt} /></span>;
}

// The panel under the message box.
function HellooStickerPanel({ onPick, onPay, onClose }) {
  const [pack, setPack] = useStateH44("kullu");
  const recent = hellooStickerRecent();
  const tabs = [["recent", <SkClock size={19} color={pack === "recent" ? T.accent : T.inkSoft} />, "Recent"], ["kullu", <HellooKullu size={30} tilt={0} />, "Kullu"], ["hindi", <span style={{ fontSize: 16, fontWeight: 900, color: pack === "hindi" ? T.accent : T.ink }}>अ</span>, "हिंदी"]];
  const list = pack === "recent" ? recent : (HELLOO_STICKER_PACKS.find((p) => p[0] === pack) || [0, 0, []])[2];
  const pick = (id) => { hellooStickerUsed(id); onPick(id); };
  const label = (t, right) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 18px 6px" }}><span style={{ fontSize: 15, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{t}</span>{right ? <span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft }}>{right}</span> : null}</div>;
  return <div data-testid="helloo-stickers" style={{ flexShrink: 0, height: 372, display: "flex", flexDirection: "column", background: HT.cardBg || T.surface, borderTop: `1px solid ${T.line}`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>{tabs.map(([k, el, name]) => <button key={k} onClick={() => setPack(k)} aria-label={name} aria-pressed={pack === k} data-testid={`helloo-sticker-pack-${k}`} className="v2-tap" style={{ width: 54, height: 42, borderRadius: 14, border: "none", background: pack === k ? T.accentSoft : "transparent", boxShadow: pack === k ? `inset 0 0 0 1.5px ${T.accent}` : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>{el}</button>)}<span style={{ flex: 1 }} /><button onClick={onClose} aria-label="Close stickers" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlDown size={18} color={T.inkSoft} /></button></div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      {pack !== "recent" && onPay ? <>{label("Send with money", "Only on Helloo")}<div style={{ display: "flex", gap: 10, padding: "2px 14px 4px" }}>{Object.keys(HELLOO_STICKERS).filter((k) => HELLOO_STICKERS[k].pay).map((id) => { const s = HELLOO_STICKERS[id]; const amount = hellooStickerAmount(id); return <button key={id} onClick={() => onPay(id)} data-testid={`helloo-sticker-${id}`} className="v2-tap" style={{ flex: 1, minWidth: 0, borderRadius: 22, border: "none", background: s.tone, padding: "10px 8px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}><HellooSticker id={id} size={64} /><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "#1F2937" }}>{s.title}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, marginTop: 4, padding: "0 9px", borderRadius: 999, background: "rgba(255,255,255,0.85)", color: "#065F46", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}><SkCoins size={11} color="#059669" />{amount ? `sends ${amount}` : "you choose"}</span></span></button>; })}</div></> : null}
      {label(pack === "recent" ? "Recent" : (HELLOO_STICKER_PACKS.find((p) => p[0] === pack) || [0, ""])[1], list.length ? `${list.length} stickers` : "")}
      {list.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px 4px", padding: "6px 12px 16px", justifyItems: "center", alignItems: "end" }}>{list.map((id) => <button key={id} onClick={() => pick(id)} data-testid={`helloo-sticker-${id}`} className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}><HellooSticker id={id} size={70} /></button>)}</div> : <div style={{ padding: "20px 24px", textAlign: "center", fontSize: 13, color: T.inkSoft }}>Stickers you send show here.</div>}
    </div>
  </div>;
}
