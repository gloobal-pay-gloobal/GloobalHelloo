// ─────────────────────────────────────────────────────────────────
// Helloo · Share in.
//
// Something shared INTO Helloo from another app — a GLOOBAL QR from the
// GLOOBAL app, a photo, a link. Two ways it arrives:
//   - the phone's own share sheet (Android, Helloo installed): the
//     manifest's share_target posts to /share-in, src/sw.js keeps the
//     text and the picture in a cache and opens "/?share=in";
//   - GLOOBAL's own "Helloo" button: "/?sharetext=…" with the words only.
// Then: "Send to…", your chats; tap one and it is sent there. Private
// chats are never listed — they make no sign until opened by name.
// ─────────────────────────────────────────────────────────────────
import { useState as useStateH48, useEffect as useEffectH48 } from "react";

var HELLOO_SHARE_CACHE = "helloo-share-in";

// What came in, read once and then thrown away. { text, file } or null.
async function hellooReadShareIn() {
  try {
    const url = new URL(window.location.href);
    const typed = url.searchParams.get("sharetext");
    if (typed) return { text: typed.slice(0, 2000), file: null };
    if (url.searchParams.get("share") !== "in" || typeof caches === "undefined") return null;
    const cache = await caches.open(HELLOO_SHARE_CACHE);
    const meta = await cache.match("/share-in/meta");
    if (!meta) return null;
    const m = await meta.json();
    const pic = await cache.match("/share-in/file");
    const blob = pic ? await pic.blob() : null;
    await caches.delete(HELLOO_SHARE_CACHE);
    const text = [m.text, m.url].filter(Boolean).filter((v, i, all) => !(i === 1 && all[0].includes(v))).join(" ").trim() || String(m.title || "").trim();
    const file = blob && blob.size ? new File([blob], m.fileName || "shared.png", { type: blob.type || m.fileType || "image/png" }) : null;
    return text || file ? { text: text.slice(0, 2000), file } : null;
  } catch (e) {
    return null;
  }
}

function HellooShareInSheet({ share, chats, onSend, onClose }) {
  const [q, setQ] = useStateH48("");
  const [busy, setBusy] = useStateH48("");
  const [pic, setPic] = useStateH48("");
  useEffectH48(() => {
    if (!share || !share.file) return undefined;
    const u = URL.createObjectURL(share.file);
    setPic(u);
    return () => URL.revokeObjectURL(u);
  }, [share]);
  const list = (chats || []).filter((c) => !c.private && c.person);
  const t = q.trim().toLowerCase();
  const shown = (t ? list.filter((c) => String(c.person.handle || c.person.name || "").toLowerCase().includes(t)) : list).slice(0, 40);
  const send = async (c) => {
    if (busy) return;
    setBusy(c.id);
    try { await onSend(c); } finally { setBusy(""); }
  };
  return <HellooSheet label="Send to" onClose={onClose} zIndex={280}><div data-testid="helloo-share-in">
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Send to</div>
      <button onClick={onClose} aria-label="Close" className="v2-tap" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: T.surfaceSunk, color: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><HlX size={16} /></button>
    </div>
    <HellooCard style={{ display: "flex", alignItems: "center", gap: 11, padding: 10, marginBottom: 10 }}>
      {pic ? <img src={pic} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: T.surfaceSunk }} /> : null}
      <div data-testid="helloo-share-in-text" style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>{share.text || "Photo"}</div>
    </HellooCard>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 40, borderRadius: 14, background: T.surfaceSunk, marginBottom: 10 }}>
      <HlSearch size={15} color={T.inkFaint} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" aria-label="Search chats" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody }} />
    </div>
    <div style={{ maxHeight: "48vh", overflowY: "auto" }}>{shown.length ? <HellooCard>{shown.map((c, i) => <button key={c.id} data-testid="helloo-share-in-chat" onClick={() => send(c)} disabled={Boolean(busy)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>
      <HellooAvatar person={c.person} size={42} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.person.handle || c.person.name}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800, color: T.accent, background: T.accentSoft, borderRadius: 999, padding: "6px 11px", flexShrink: 0 }}>{busy === c.id ? "Sending…" : <><HlSend size={13} />Send</>}</span>
    </button>)}</HellooCard> : <HellooCard style={{ padding: "16px", fontSize: 13, color: T.inkSoft, textAlign: "center" }}>{t ? "No chat by that name" : "No chats yet. Start one, then share again."}</HellooCard>}</div>
  </div></HellooSheet>;
}
