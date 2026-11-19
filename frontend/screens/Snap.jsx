// frontend/screens/Snap.jsx
//
// Snaps: a photo or a short clip taken inside a chat and sent straight to
// that person. The sender picks a look (a named filter the app draws — the
// picture itself is sent as taken) and how long it stays: in the chat,
// where it can be saved; to be seen once; or for a day. Saving one tells
// the sender, in the chat.
import { useState as useStateH45, useEffect as useEffectH45, useRef as useRefH45 } from "react";
import { Zap as SnFlash, RefreshCcw as SnFlip, Eye as SnOnce, Timer as SnDay, Bookmark as SnKeep, EyeOff as SnGone, Images as SnGallery } from "lucide-react";

var HELLOO_FX = { "": "none", warm: "sepia(0.35) saturate(1.3) brightness(1.05)", cool: "saturate(1.1) hue-rotate(-14deg) brightness(1.04) contrast(1.05)", mono: "grayscale(1) contrast(1.12)", vivid: "saturate(1.6) contrast(1.1)", soft: "brightness(1.08) contrast(0.92) saturate(0.9)" };
var HELLOO_FX_LIST = [["", "Original"], ["warm", "Warm"], ["cool", "Cool"], ["mono", "B & W"], ["vivid", "Vivid"], ["soft", "Soft"]];
var HELLOO_SNAP_MODES = [["keep", SnKeep, "Stays in chat", "they can save it"], ["once", SnOnce, "See once", "gone after opening"], ["day", SnDay, "24 hours", "then it goes"]];
var HELLOO_SNAP_MAX_BYTES = 8 * 1024 * 1024;
var HELLOO_SNAP_MAX_SECONDS = 30;
function hellooFx(name) { return HELLOO_FX[name] || "none"; }
function hellooClipTime(seconds) { const s = Math.max(0, Math.round(seconds || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function hellooBlobToB64(blob) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result).split(",")[1] || ""); r.onerror = () => reject(new Error("Couldn't read that.")); r.readAsDataURL(blob); });
}
// Save a picture or clip to the phone. A picture is saved with its look
// drawn in, where the phone can do that.
async function hellooSaveMedia(url, kind, fx) {
  let href = url;
  if (kind === "photo" && fx && HELLOO_FX[fx]) {
    try {
      const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url; });
      const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if ("filter" in ctx) { ctx.filter = HELLOO_FX[fx]; ctx.drawImage(img, 0, 0); href = c.toDataURL("image/jpeg", 0.92); }
    } catch (e) { /* save it as taken */ }
  }
  const a = document.createElement("a"); a.href = href; a.download = kind === "video" ? "helloo-clip.mp4" : "helloo-photo.jpg"; document.body.appendChild(a); a.click(); a.remove();
}

// ── In the chat ─────────────────────────────────────────────────────────
function HellooSnapChip({ Icon, children, tone, bg }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 999, background: bg || T.surfaceAlt, color: tone || T.inkSoft, fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>{Icon ? <Icon size={11} color={tone || T.inkSoft} /> : null}{children}</span>;
}
// What the sender sees under their own photo or clip.
function HellooSnapFoot({ m }) {
  if (m.from !== "me" || (m.kind !== "photo" && m.kind !== "video")) return null;
  const chips = [];
  if (m.viewMode === "once") chips.push(<HellooSnapChip key="o" Icon={SnOnce}>{m.opened ? "See once · opened" : "See once · not opened yet"}</HellooSnapChip>);
  else if (m.viewMode === "day") chips.push(<HellooSnapChip key="d" Icon={SnDay}>{m.gone ? "24 hours · gone" : "24 hours"}</HellooSnapChip>);
  if (m.saved) chips.push(<HellooSnapChip key="s" Icon={HlDownload} tone={HT.free} bg={HT.freeSoft}>Saved to their phone</HellooSnapChip>);
  if (!chips.length) return null;
  return <span data-testid="helloo-snap-foot" style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>{chips}</span>;
}
// A clip, a see-once photo, or one that has gone: a card to tap, not the
// picture itself.
function HellooSnapCard({ m }) {
  const mine = m.from === "me";
  const video = m.kind === "video";
  const what = video ? `Video · ${hellooClipTime(m.seconds)}` : "Photo";
  if (m.gone) return <span data-testid="helloo-snap-gone" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 18, background: T.surfaceAlt, color: T.inkSoft, fontSize: 13, fontWeight: 700 }}><SnGone size={15} color={T.inkSoft} />{what} · {m.viewMode === "once" ? "opened" : "gone"}</span>;
  const once = m.viewMode === "once";
  const sub = once ? (mine ? "See once · you can't open it again" : "See once · tap to open") : m.viewMode === "day" ? "Here for 24 hours · tap to play" : "Tap to play";
  const Icon = once ? SnOnce : HlPlay;
  const tap = mine && once ? undefined : m.onOpen;
  return <button onClick={tap} disabled={!tap} data-testid="helloo-snap-card" className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 12px 12px", borderRadius: 22, border: "none", background: HT.cardBg || T.surface, boxShadow: "0 10px 24px -16px rgba(15,23,42,0.5)", cursor: tap ? "pointer" : "default", textAlign: "left", fontFamily: T.fontBody, maxWidth: 270 }}><span style={{ width: 46, height: 46, borderRadius: 16, background: T.gradButton, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.busy ? <HlRetry size={20} color="#fff" /> : <Icon size={21} color="#fff" />}</span><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink }}>{what}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft }}>{sub}</span>{m.text ? <span style={{ display: "block", fontSize: 13, color: T.ink, marginTop: 4, overflowWrap: "anywhere" }}>{m.text}</span> : null}</span></button>;
}

// ── The camera ──────────────────────────────────────────────────────────
function HellooSnapCamera({ person, onClose, onSend, onToast }) {
  const [facing, setFacing] = useStateH45("environment");
  const [ready, setReady] = useStateH45(false);
  const [blocked, setBlocked] = useStateH45("");
  const [torch, setTorch] = useStateH45(false);
  const [recording, setRecording] = useStateH45(0); // seconds so far; 0 = not recording
  const [shot, setShot] = useStateH45(null); // { kind, blob, url, width, height, seconds }
  const [fx, setFx] = useStateH45("");
  const [view, setView] = useStateH45("keep");
  const [caption, setCaption] = useStateH45("");
  const [sending, setSending] = useStateH45(false);
  const video = useRefH45(null);
  const stream = useRefH45(null);
  const rec = useRefH45(null);
  const hold = useRefH45(null);
  const tick = useRefH45(null);
  const started = useRefH45(0);
  const pick = useRefH45(null);
  const stop = () => { if (stream.current) { stream.current.getTracks().forEach((t) => t.stop()); stream.current = null; } };
  useEffectH45(() => {
    if (shot) return undefined;
    let gone = false;
    setReady(false); setBlocked("");
    const want = (audio) => navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio });
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setBlocked("This phone's browser can't open the camera here. Pick from your gallery."); return undefined; }
    want(true).catch(() => want(false)).then((s) => {
      if (gone) { s.getTracks().forEach((t) => t.stop()); return; }
      stream.current = s;
      const v = video.current; if (v) { v.srcObject = s; v.play().catch(() => {}); }
      setReady(true);
    }).catch(() => { if (!gone) setBlocked("Allow the camera for Helloo, or pick from your gallery."); });
    return () => { gone = true; stop(); };
  }, [facing, shot]);
  useEffectH45(() => () => { clearInterval(tick.current); clearTimeout(hold.current); stop(); }, []);
  const toggleTorch = () => { const track = stream.current && stream.current.getVideoTracks()[0]; if (!track) return; const on = !torch; track.applyConstraints({ advanced: [{ torch: on }] }).then(() => setTorch(on)).catch(() => onToast("No flash on this camera")); };
  const takePhoto = () => {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (facing === "user") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => { if (blob) setShot({ kind: "photo", blob, url: URL.createObjectURL(blob), width: c.width, height: c.height, seconds: 0 }); }, "image/jpeg", 0.9);
  };
  const startClip = () => {
    if (!stream.current || typeof MediaRecorder === "undefined") { onToast("This phone can't record a clip here"); return; }
    const type = ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const chunks = [];
    let r;
    try { r = new MediaRecorder(stream.current, Object.assign({ videoBitsPerSecond: 1600000, audioBitsPerSecond: 64000 }, type ? { mimeType: type } : {})); } catch (e) { onToast("This phone can't record a clip here"); return; }
    r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = () => {
      clearInterval(tick.current);
      const seconds = Math.min(HELLOO_SNAP_MAX_SECONDS, Math.max(1, (Date.now() - started.current) / 1000));
      const blob = new Blob(chunks, { type: (r.mimeType || type || "video/webm").split(";")[0] });
      const v = video.current;
      setRecording(0);
      if (blob.size > HELLOO_SNAP_MAX_BYTES) { onToast("That clip came out too big. Try a shorter one."); return; }
      setShot({ kind: "video", blob, url: URL.createObjectURL(blob), width: (v && v.videoWidth) || 0, height: (v && v.videoHeight) || 0, seconds });
    };
    rec.current = r; started.current = Date.now(); r.start(); setRecording(1);
    tick.current = setInterval(() => { const s = Math.floor((Date.now() - started.current) / 1000); setRecording(Math.max(1, s)); if (s >= HELLOO_SNAP_MAX_SECONDS && rec.current && rec.current.state === "recording") rec.current.stop(); }, 250);
  };
  const down = () => { if (!ready) return; hold.current = setTimeout(() => { hold.current = null; startClip(); }, 350); };
  const up = () => { if (hold.current) { clearTimeout(hold.current); hold.current = null; takePhoto(); return; } if (rec.current && rec.current.state === "recording") rec.current.stop(); };
  const onFile = (f) => {
    if (!f) return;
    if (/^video\//.test(f.type)) {
      if (f.size > HELLOO_SNAP_MAX_BYTES) { onToast("Videos can be up to 8 MB for now"); return; }
      const url = URL.createObjectURL(f); const v = document.createElement("video"); v.preload = "metadata";
      v.onloadedmetadata = () => { if (v.duration > HELLOO_SNAP_MAX_SECONDS + 1) { URL.revokeObjectURL(url); onToast("A clip can be up to 30 seconds"); return; } setShot({ kind: "video", blob: f, url, width: v.videoWidth, height: v.videoHeight, seconds: v.duration || 1 }); };
      v.onerror = () => onToast("That video can't be read");
      v.src = url; return;
    }
    if (/^image\//.test(f.type) && !/svg/.test(f.type)) { setShot({ kind: "photo", blob: f, url: URL.createObjectURL(f), width: 0, height: 0, seconds: 0 }); return; }
    onToast("Pick a photo or a short video");
  };
  const retake = () => { if (shot) URL.revokeObjectURL(shot.url); setShot(null); setFx(""); setCaption(""); };
  const send = async () => { if (!shot || sending) return; setSending(true); try { await onSend(Object.assign({}, shot, { fx, view, caption: caption.trim() })); } catch (e) { onToast((e && e.message) || "Couldn't send that"); setSending(false); } };
  const round = (Icon, label, fn, on) => <button onClick={fn} aria-label={label} aria-pressed={on} className="v2-tap" style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: on ? "#fff" : "rgba(0,0,0,0.42)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Icon size={19} color={on ? "#111" : "#fff"} /></button>;
  const fileInput = <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => { onFile(e.target.files && e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} data-testid="helloo-snap-file" />;
  const name = person.handle || (person.name || "").split(" ")[0];

  if (shot) return <div data-testid="helloo-snap-review" style={{ position: "absolute", inset: 0, zIndex: 120, background: "#000", overflow: "hidden", fontFamily: T.fontBody }}>
    {shot.kind === "video" ? <video src={shot.url} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "contain", filter: hellooFx(fx) }} /> : <img src={shot.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: hellooFx(fx) }} />}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 18%, transparent 44%, rgba(0,0,0,0.82))", pointerEvents: "none" }} />
    <div style={{ position: "absolute", left: 14, right: 14, top: "calc(14px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{round(HlBack, "Take another", retake)}<span style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px 0 5px", borderRadius: 999, background: "rgba(0,0,0,0.42)", color: "#fff", fontSize: 13, fontWeight: 800, maxWidth: "60%" }}><HellooAvatar person={person} size={26} flag={false} /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>To {name}</span></span>{shot.kind === "video" ? <span style={{ height: 36, padding: "0 12px", borderRadius: 999, background: "rgba(0,0,0,0.42)", color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center" }}>{hellooClipTime(shot.seconds)}</span> : <span style={{ width: 42 }} />}</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", padding: "0 14px" }}>{HELLOO_FX_LIST.map(([k, label]) => <button key={k || "none"} onClick={() => setFx(k)} aria-pressed={fx === k} data-testid={`helloo-fx-${k || "none"}`} className="v2-tap" style={{ flexShrink: 0, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.fontBody }}><span style={{ width: 54, height: 54, borderRadius: 16, overflow: "hidden", boxShadow: fx === k ? "0 0 0 2.5px #fff" : "0 0 0 1px rgba(255,255,255,0.35)", background: "#222" }}>{shot.kind === "video" ? <video src={shot.url + "#t=0.1"} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", filter: hellooFx(k) }} /> : <img src={shot.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: hellooFx(k) }} />}</span><span style={{ fontSize: 11, fontWeight: 800, color: "#fff", opacity: fx === k ? 1 : 0.75 }}>{label}</span></button>)}</div>
      <div style={{ display: "flex", margin: "0 14px", padding: 4, borderRadius: 18, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>{HELLOO_SNAP_MODES.map(([k, I, t1, t2]) => <button key={k} onClick={() => setView(k)} aria-pressed={view === k} data-testid={`helloo-snap-mode-${k}`} className="v2-tap" style={{ flex: 1, minWidth: 0, padding: "8px 4px", borderRadius: 14, border: "none", background: view === k ? "#fff" : "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", fontFamily: T.fontBody }}><I size={16} color={view === k ? "#111" : "#fff"} /><span style={{ fontSize: 12, fontWeight: 800, color: view === k ? "#111" : "#fff", whiteSpace: "nowrap" }}>{t1}</span><span style={{ fontSize: 10, color: view === k ? "#4B5563" : "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{t2}</span></button>)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}><input value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 300))} placeholder="Add words" data-testid="helloo-snap-caption" style={{ flex: 1, minWidth: 0, height: 50, borderRadius: 25, border: "none", outline: "none", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "0 16px", color: "#fff", fontSize: 14.5, fontFamily: T.fontBody }} /><button onClick={send} disabled={sending} aria-label="Send" data-testid="helloo-snap-send" className="v2-tap" style={{ width: 54, height: 54, borderRadius: "50%", border: "none", background: T.gradButton, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, opacity: sending ? 0.6 : 1, boxShadow: "0 10px 24px -8px rgba(0,0,0,0.6)" }}><HlSend size={22} color="#fff" /></button></div>
    </div>
  </div>;

  return <div data-testid="helloo-snap-camera" style={{ position: "absolute", inset: 0, zIndex: 120, background: "#000", overflow: "hidden", fontFamily: T.fontBody }}>{fileInput}
    <video ref={video} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: facing === "user" ? "scaleX(-1)" : "none" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 20%, transparent 62%, rgba(0,0,0,0.75))", pointerEvents: "none" }} />
    <div style={{ position: "absolute", left: 14, right: 14, top: "calc(14px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>{round(HlX, "Close", onClose)}<span style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px 0 5px", borderRadius: 999, background: recording ? "#DC2626" : "rgba(0,0,0,0.42)", color: "#fff", fontSize: 13, fontWeight: 800, maxWidth: "60%" }}>{recording ? <span style={{ padding: "0 6px", fontVariantNumeric: "tabular-nums" }}>● {hellooClipTime(recording)} / 0:30</span> : <><HellooAvatar person={person} size={26} flag={false} /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>To {name}</span></>}</span>{round(SnFlash, "Flash", toggleTorch, torch)}</div>
    {blocked ? <div style={{ position: "absolute", left: 24, right: 24, top: "38%", textAlign: "center", color: "#fff" }}><div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.4 }}>{blocked}</div><button onClick={() => pick.current && pick.current.click()} className="v2-tap" style={{ marginTop: 16, height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "#fff", color: "#111", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Pick from gallery</button></div> : null}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: "calc(30px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}><span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", opacity: 0.9 }}>{recording ? "Let go to finish" : "Tap for a photo · hold for a clip, up to 30 sec"}</span><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44, width: "100%" }}><button onClick={() => pick.current && pick.current.click()} aria-label="Pick from gallery" className="v2-tap" style={{ width: 50, height: 50, borderRadius: 16, border: "none", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SnGallery size={22} color="#fff" /></button><button onPointerDown={down} onPointerUp={up} onPointerCancel={up} onContextMenu={(e) => e.preventDefault()} aria-label="Tap for a photo, hold for a clip" data-testid="helloo-snap-shutter" disabled={!ready} style={{ width: 84, height: 84, borderRadius: "50%", border: `5px solid ${recording ? "#DC2626" : "#fff"}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, touchAction: "none", opacity: ready ? 1 : 0.5 }}><span style={{ width: recording ? 34 : 66, height: recording ? 34 : 66, borderRadius: recording ? 10 : "50%", background: recording ? "#DC2626" : "#fff", transition: "all 0.15s ease" }} /></button><button onClick={() => { setTorch(false); setFacing((f) => (f === "user" ? "environment" : "user")); }} aria-label="Turn the camera round" className="v2-tap" style={{ width: 50, height: 50, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SnFlip size={22} color="#fff" /></button></div></div>
  </div>;
}
