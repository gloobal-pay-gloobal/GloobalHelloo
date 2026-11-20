// ─────────────────────────────────────────────────────────────────
// Helloo · WhatsApp history.
//
// WhatsApp's own "Export chat" (⋮ → More → Export chat → Include media),
// shared to Helloo from the phone's share sheet: the chat as a .txt and the
// photos, videos, voice notes and documents beside it. Helloo reads the
// text, matches each "(file attached)" line to its file, asks which Helloo
// chat it belongs to and which name is you, and keeps it ON THIS PHONE
// (IndexedDB) — never sent to GLOOBAL, never shown to the other person.
// In that chat, "WhatsApp history" opens it, read-only, in date order.
// ─────────────────────────────────────────────────────────────────
import { useState as useStateH49, useEffect as useEffectH49 } from "react";
import { MessageCircle as HlWaMsg, Paperclip as HlWaClip } from "lucide-react";

// ── Reading the export ──────────────────────────────────────────────
// Android: 20/11/26, 2:10 pm - Anita Rao: See you at six
// iPhone:  [20/11/26, 2:10:05 PM] Anita Rao: See you at six
// A line that does not start like that continues the message above it.
var HELLOO_WA_LINE = /^\u200e?\[?(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?[\s  ]*([AaPp]\.?\s?[Mm]\.?)?\]?\s*(?:[-–]\s*)?(.*)$/;
var HELLOO_WA_FILE = /^\u200e?(?:<attached:\s*([^>]+)>|(.+?\.[A-Za-z0-9]{2,5})\s+\(file attached\))\s*([\s\S]*)$/;
var HELLOO_WA_OMITTED = /^\u200e?<?(?:media|image|video|audio|sticker|document|GIF|Contact card) omitted>?$/i;

function hellooWaParse(raw) {
  const lines = String(raw || "").replace(/\r\n?/g, "\n").split("\n");
  const heads = [];
  for (const line of lines) {
    const m = HELLOO_WA_LINE.exec(line);
    if (m) heads.push({ a: Number(m[1]), b: Number(m[2]), y: Number(m[3]), h: Number(m[4]), mi: Number(m[5]), s: Number(m[6] || 0), ap: (m[7] || "").replace(/[.\s]/g, "").toLowerCase(), rest: m[8] });
    else if (heads.length) heads[heads.length - 1].rest += "\n" + line;
  }
  if (heads.length < 2) return null;
  // Day first (India and most of the world) unless a date says otherwise.
  const monthFirst = heads.some((x) => x.b > 12) && !heads.some((x) => x.a > 12);
  const names = new Map();
  const messages = [];
  for (const x of heads) {
    const day = monthFirst ? x.b : x.a; const month = monthFirst ? x.a : x.b;
    const year = x.y < 100 ? 2000 + x.y : x.y;
    let hour = x.h; if (x.ap === "pm" && hour < 12) hour += 12; if (x.ap === "am" && hour === 12) hour = 0;
    const at = new Date(year, month - 1, day, hour, x.mi, x.s);
    if (isNaN(at.getTime())) continue;
    const colon = x.rest.indexOf(": ");
    // No "Name: " — a line from WhatsApp itself (encryption notice, someone added).
    if (colon < 0 || colon > 60) { messages.push({ at, system: true, text: x.rest.replace(/^\u200e/, "").trim() }); continue; }
    const name = x.rest.slice(0, colon).replace(/^\u200e/, "").trim();
    const body = x.rest.slice(colon + 2);
    names.set(name, (names.get(name) || 0) + 1);
    const f = HELLOO_WA_FILE.exec(body.trim());
    if (f) messages.push({ at, name, file: (f[1] || f[2]).trim(), text: (f[3] || "").trim() });
    else if (HELLOO_WA_OMITTED.test(body.trim())) messages.push({ at, name, omitted: true, text: "" });
    else messages.push({ at, name, text: body.replace(/\u200e/g, "").trim().replace(/\s*<This message was edited>$/, " (edited)") });
  }
  const people = [...names.entries()].sort((p, q) => q[1] - p[1]).map(([n]) => n);
  if (!people.length) return null;
  return { names: people, messages };
}

// What a file is, by its name: WhatsApp's own names say it (IMG-, VID-, PTT-, AUD-).
function hellooWaKind(name, type) {
  const n = String(name || "").toLowerCase(); const t = String(type || "");
  if (t.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic)$/.test(n)) return n.endsWith(".webp") && n.startsWith("stk-") ? "sticker" : "photo";
  if (t.startsWith("video/") || /\.(mp4|3gp|mov)$/.test(n)) return "video";
  if (t.startsWith("audio/") || /\.(opus|ogg|m4a|mp3|aac|amr)$/.test(n)) return "voice";
  return "file";
}

// The export's chat .txt among the shared files, read and parsed. null if none.
async function hellooWaFromFiles(files) {
  const txt = (files || []).filter((f) => /\.txt$/i.test(f.name) || f.type === "text/plain");
  for (const f of txt) {
    const parsed = hellooWaParse(await f.text());
    if (parsed) {
      const title = (/WhatsApp Chat (?:with|-)\s*(.+?)\.txt$/i.exec(f.name) || [])[1] || "";
      const media = (files || []).filter((x) => x !== f);
      return Object.assign(parsed, { title, media });
    }
  }
  return null;
}

// ── Kept on this phone ──────────────────────────────────────────────
function hellooWaDb() {
  return new Promise((ok, fail) => {
    const req = indexedDB.open("helloo-wa-history", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("chats");
    req.onsuccess = () => ok(req.result);
    req.onerror = () => fail(req.error);
  });
}
async function hellooWaPut(chatId, record) {
  const db = await hellooWaDb();
  await new Promise((ok, fail) => { const t = db.transaction("chats", "readwrite"); t.objectStore("chats").put(record, chatId); t.oncomplete = ok; t.onerror = () => fail(t.error); });
}
async function hellooWaGet(chatId) {
  try {
    const db = await hellooWaDb();
    return await new Promise((ok) => { const r = db.transaction("chats").objectStore("chats").get(chatId); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); });
  } catch (e) { return null; }
}
async function hellooWaDelete(chatId) {
  const db = await hellooWaDb();
  await new Promise((ok) => { const t = db.transaction("chats", "readwrite"); t.objectStore("chats").delete(chatId); t.oncomplete = ok; t.onerror = ok; });
}
// The record: who was who, every message, each file as a Blob.
function hellooWaRecord(parsed, me) {
  const byName = new Map((parsed.media || []).map((f) => [f.name, f]));
  let photos = 0, others = 0;
  const messages = parsed.messages.map((m) => {
    const out = { at: m.at.toISOString(), mine: !m.system && m.name === me, system: Boolean(m.system), name: m.name || "", text: m.text || "" };
    if (m.file) {
      const blob = byName.get(m.file) || null;
      out.file = { name: m.file, kind: hellooWaKind(m.file, blob && blob.type), blob };
      if (blob) { if (out.file.kind === "photo") photos += 1; else others += 1; }
    } else if (m.omitted) out.omitted = true;
    return out;
  });
  return { source: "whatsapp", importedAt: new Date().toISOString(), me, names: parsed.names, title: parsed.title, messages, counts: { messages: messages.filter((m) => !m.system).length, photos, others } };
}

var HELLOO_WA_GREEN = "#25D366";
function HellooWaBadge({ size = 18 }) {
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: "50%", background: HELLOO_WA_GREEN, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HlWaMsg size={Math.round(size * 0.58)} /></span>;
}
var hellooWaDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ── Importing: which chat, which one is you ──────────────────────────
function HellooWaImportSheet({ parsed, chats, onImport, onClose }) {
  const guessMe = parsed.names.find((n) => n !== parsed.title) || parsed.names[0];
  const [me, setMe] = useStateH49(guessMe);
  const [q, setQ] = useStateH49("");
  const [pick, setPick] = useStateH49(null);
  const [busy, setBusy] = useStateH49(false);
  const list = (chats || []).filter((c) => !c.private && c.person);
  const them = parsed.names.find((n) => n !== me) || parsed.title || "";
  const t = (q || "").trim().toLowerCase();
  // The chat whose name looks like the export's, first.
  const score = (c) => { const n = String(c.person.handle || c.person.name || "").toLowerCase(); const w = String(them).toLowerCase(); return n === w ? 2 : w && (n.includes(w.split(" ")[0]) || w.includes(n)) ? 1 : 0; };
  const shown = (t ? list.filter((c) => String(c.person.handle || c.person.name || "").toLowerCase().includes(t)) : [...list].sort((a, b) => score(b) - score(a))).slice(0, 30);
  const msgs = parsed.messages.filter((m) => !m.system);
  const files = parsed.messages.filter((m) => m.file);
  const found = new Set((parsed.media || []).map((f) => f.name));
  const photos = files.filter((m) => found.has(m.file) && hellooWaKind(m.file) === "photo").length;
  const others = files.filter((m) => found.has(m.file)).length - photos;
  const missing = files.filter((m) => !found.has(m.file)).length + parsed.messages.filter((m) => m.omitted).length;
  const first = msgs[0] && msgs[0].at; const last = msgs[msgs.length - 1] && msgs[msgs.length - 1].at;
  const go = async () => { if (!pick || busy) return; setBusy(true); try { await onImport(pick, me); } finally { setBusy(false); } };
  return <HellooSheet label="Import WhatsApp chat" onClose={onClose} zIndex={280}><div data-testid="helloo-wa-import">
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <HellooWaBadge size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Import WhatsApp chat</div>
        <div style={{ fontSize: 12, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{parsed.title ? `Chat with ${parsed.title}` : parsed.names.join(", ")}</div>
      </div>
      <button onClick={onClose} aria-label="Close" className="v2-tap" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: T.surfaceSunk, color: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><HlX size={16} /></button>
    </div>
    <HellooCard style={{ padding: "11px 14px", marginBottom: 12 }}>
      <div data-testid="helloo-wa-counts" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, textAlign: "center" }}>{[[msgs.length, "messages"], [photos, "photos"], [others, "voice & files"]].map(([n, l]) => <div key={l}><div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{n.toLocaleString("en-IN")}</div><div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 700 }}>{l}</div></div>)}</div>
      {first ? <div style={{ fontSize: 11.5, color: T.inkSoft, textAlign: "center", marginTop: 8 }}>{hellooWaDate(first)} – {hellooWaDate(last)}{missing ? ` · ${missing} not included in the export` : ""}</div> : null}
    </HellooCard>
    <div style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, margin: "0 2px 6px" }}>Which one is you?</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>{parsed.names.slice(0, 6).map((n) => <HellooChip key={n} on={me === n} onClick={() => setMe(n)}>{n}</HellooChip>)}</div>
    <div style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, margin: "0 2px 6px" }}>Put it in your Helloo chat with</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 38, borderRadius: 14, background: T.surfaceSunk, marginBottom: 8 }}>
      <HlSearch size={15} color={T.inkFaint} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" aria-label="Search chats" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody }} />
    </div>
    <div style={{ maxHeight: "26vh", overflowY: "auto", marginBottom: 10 }}><HellooCard>{shown.map((c, i) => { const on = pick && pick.id === c.id; return <button key={c.id} data-testid="helloo-wa-chat" onClick={() => setPick(c)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: on ? T.accentSoft : "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>
      <HellooAvatar person={c.person} size={38} flag={false} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, maxWidth: "100%" }}><span style={{ minWidth: 0, fontSize: 14, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.person.handle || c.person.name}</span>{c.person && !c.person.group ? <HellooBadge tier={c.person.badge || 1} size={12.5} /> : null}</span>
      <span style={{ width: 20, height: 20, borderRadius: "50%", border: on ? "none" : `2px solid ${T.line}`, background: on ? T.accent : "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on ? <HlCheck size={13} /> : null}</span>
    </button>; })}</HellooCard></div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11.5, color: T.inkSoft, lineHeight: 1.45, margin: "0 2px 12px" }}><HlLock size={13} style={{ flexShrink: 0, marginTop: 2 }} /><span>Kept on this phone only. {them ? `${them} doesn't` : "The other person doesn't"} see it, and it is never sent to GLOOBAL.</span></div>
    <button data-testid="helloo-wa-import-go" onClick={go} disabled={!pick || busy} className="v2-tap" style={{ width: "100%", height: 48, borderRadius: 999, border: "none", background: pick ? T.accent : T.surfaceSunk, color: pick ? "#fff" : T.inkFaint, fontSize: 15, fontWeight: 800, cursor: pick ? "pointer" : "default", fontFamily: T.fontBody }}>{busy ? "Importing…" : pick ? `Import into ${pick.person.handle || pick.person.name}` : "Choose a chat"}</button>
  </div></HellooSheet>;
}

// The row at the top of a chat that has WhatsApp history.
function HellooWaHistoryRow({ info, onOpen }) {
  return <button data-testid="helloo-wa-row" onClick={onOpen} className="v2-tap" style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, background: T.surface, boxShadow: T.shadowCard, padding: "6px 13px 6px 7px", margin: "4px 0 8px", cursor: "pointer", fontFamily: T.fontBody, maxWidth: "92%" }}><HellooWaBadge size={22} /><span style={{ fontSize: 12, fontWeight: 800, color: T.ink, whiteSpace: "nowrap" }}>WhatsApp history</span><span style={{ fontSize: 11.5, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info.counts.messages.toLocaleString("en-IN")} messages</span></button>;
}

// One kept file, drawn from its Blob.
function HellooWaFile({ file, mine }) {
  const [src, setSrc] = useStateH49("");
  useEffectH49(() => { if (!file.blob) return undefined; const u = URL.createObjectURL(file.blob); setSrc(u); return () => URL.revokeObjectURL(u); }, [file]);
  if (!file.blob) return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontStyle: "italic", opacity: 0.8 }}><HlWaClip size={13} />{file.name} · not in the export</span>;
  if (file.kind === "photo" || file.kind === "sticker") return src ? <img src={src} alt="" style={{ display: "block", width: "100%", maxWidth: 240, borderRadius: 12, marginBottom: 2 }} /> : null;
  if (file.kind === "video") return src ? <video src={src} controls playsInline style={{ display: "block", width: "100%", maxWidth: 240, borderRadius: 12 }} /> : null;
  if (file.kind === "voice") return src ? <audio src={src} controls style={{ width: 220, maxWidth: "100%", height: 36 }} /> : null;
  return <a href={src} download={file.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: mine ? "#fff" : T.accent }}><HlWaClip size={14} />{file.name}</a>;
}

// The kept history, read-only.
function HellooWaHistoryScreen({ chatId, person, onBack, onRemoved }) {
  const [rec, setRec] = useStateH49(null);
  const [limit, setLimit] = useStateH49(300);
  useEffectH49(() => { let live = true; hellooWaGet(chatId).then((r) => { if (live) setRec(r || false); }); return () => { live = false; }; }, [chatId]);
  const all = rec ? rec.messages : [];
  const shown = all.slice(Math.max(0, all.length - limit));
  let lastDay = "";
  const rows = [];
  shown.forEach((m, i) => {
    const day = hellooWaDate(m.at);
    if (day !== lastDay) { rows.push(<div key={"d" + i} style={{ alignSelf: "center", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: T.inkFaint, background: T.surfaceSunk, borderRadius: 999, padding: "4px 11px", margin: "8px 0 4px" }}>{day}</div>); lastDay = day; }
    if (m.system) { rows.push(<div key={i} style={{ alignSelf: "center", maxWidth: "88%", textAlign: "center", fontSize: 11, color: T.inkSoft, background: T.surfaceSunk, borderRadius: 10, padding: "5px 10px", margin: "3px 0" }}>{m.text}</div>); return; }
    const prev = shown[i - 1]; const same = prev && !prev.system && prev.mine === m.mine && hellooWaDate(prev.at) === day;
    const photoOnly = m.file && (m.file.kind === "photo" || m.file.kind === "sticker") && m.file.blob && !m.text;
    rows.push(<div key={i} data-helloo-wa-msg={m.mine ? "me" : "them"} style={{ alignSelf: m.mine ? "flex-end" : "flex-start", maxWidth: "80%", marginTop: same ? 2 : 8 }}><div style={{ padding: photoOnly ? 4 : "8px 12px 6px", borderRadius: 18, borderBottomRightRadius: m.mine ? 6 : 18, borderBottomLeftRadius: m.mine ? 18 : 6, background: m.mine ? (HT.bubbleMine || T.accent) : (HT.bubbleTheirs || T.surface), color: m.mine ? (HT.bubbleMineInk || "#fff") : T.ink, boxShadow: m.mine ? "none" : T.shadowCard, fontSize: 14.5, lineHeight: 1.4, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
      {m.file ? <HellooWaFile file={m.file} mine={m.mine} /> : null}
      {m.omitted ? <span style={{ fontStyle: "italic", opacity: 0.75, fontSize: 13 }}>Media not included in the export</span> : null}
      {m.text ? <div style={{ marginTop: m.file ? 4 : 0, padding: photoOnly ? "0 6px" : 0 }}>{m.text}</div> : null}
      <div style={{ fontSize: 10.5, opacity: 0.65, textAlign: "right", marginTop: 2, padding: photoOnly ? "0 6px 2px" : 0 }}>{new Date(m.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</div>
    </div></div>);
  });
  const remove = async () => { await hellooWaDelete(chatId); onRemoved && onRemoved(); };
  return <HellooScreen style={{ background: HT.chatBg || HT.wash }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "calc(8px + env(safe-area-inset-top, 0px)) 10px 8px", flexShrink: 0 }}>
      <NavBackButton onClick={onBack} />
      <HellooAvatar person={person} size={38} flag={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{person.handle || person.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.inkSoft }}><HellooWaBadge size={13} />WhatsApp history{rec ? ` · ${hellooWaDate(rec.messages[0].at)} – ${hellooWaDate(rec.messages[rec.messages.length - 1].at)}` : ""}</div>
      </div>
    </div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 12px 24px", display: "flex", flexDirection: "column" }}>
      <div style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: HT.free, background: HT.freeSoft, borderRadius: 999, padding: "5px 11px", margin: "4px 0 6px" }}><HlLock size={12} />Imported from WhatsApp · only on this phone</div>
      {all.length > shown.length ? <button onClick={() => setLimit((n) => n + 300)} className="v2-tap" style={{ alignSelf: "center", border: "none", borderRadius: 999, background: T.surface, color: T.accent, fontSize: 12, fontWeight: 800, padding: "6px 14px", margin: "4px 0 8px", cursor: "pointer", fontFamily: T.fontBody, boxShadow: T.shadowCard }}>Earlier messages</button> : null}
      {rec === null ? <div style={{ textAlign: "center", color: T.inkFaint, fontSize: 13, marginTop: 30 }}>Opening…</div> : rows}
      {rec ? <button onClick={remove} className="v2-tap" style={{ alignSelf: "center", border: "none", background: "none", color: T.negative, fontSize: 12.5, fontWeight: 800, padding: "14px 10px 4px", cursor: "pointer", fontFamily: T.fontBody }}>Remove WhatsApp history from this phone</button> : null}
    </div>
  </HellooScreen>;
}
