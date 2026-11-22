// frontend/screens/Calls.jsx
//
// Calls are free and over data, so the list says "free" where another
// app would show a cost, and the call screen is its own dark world: the
// person fills it and the app steps back.
import { useState as useStateH12, useRef as useRefH12 } from "react";


// The call screen (16 Nov). Light, not the dark screen every calling app
// has: the name large at the top, and in the middle ONE picture — the
// other person's. A person is their photo (or the emoji they show in its
// place, or their initials); a shop is its logo, with the shop mark on it
// and its handle for a name. Soft rings leave the picture while it rings
// and it breathes once the call is live. The controls are one small bar
// and a red dot.
// ── A PAID CALL ─────────────────────────────────────────────────────────
// Someone who charges for calls (a creator: "call me, 1.00 a minute"). It
// is billed per second from when they pick up, from your GLOOBAL balance —
// the same money Ads & Earn pays into. Before it rings you see what you
// have and how long that lets you talk. Nothing is lent: at zero it does
// not ring, and it ends by itself when the balance is used up.
var hellooCallCost = (seconds, perMinute) => Math.round((Math.max(0, seconds) * perMinute) / 60 * 100) / 100;
function hellooTalkTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60); const r = s % 60;
  if (m >= 60) return "1 hour";
  if (!m) return `${r} sec`;
  return r ? `${m} min ${r} sec` : `${m} min`;
}
function HellooPaidCallSheet({ person, video = false, perMinute, currency, wallet = null, busy = false, onCall, onEarn, onClose }) {
  const first = person.handle || (person.name || "").split(" ")[0] || "They";
  const w = wallet || { balance: 0, seconds: 0, sameMoney: true };
  const empty = !(w.seconds >= 1);
  const other = w.sameMoney === false;
  const capped = w.seconds >= 3600;
  const fill = Math.max(empty ? 0 : 0.04, Math.min(1, w.seconds / 3600));
  const line = (Icon, text, color) => <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.45 }}><Icon size={15} color={color || T.inkFaint} style={{ flexShrink: 0, marginTop: 1 }} /><span>{text}</span></div>;
  return <HellooSheet title={video ? "Paid video call" : "Paid call"} onClose={busy ? undefined : onClose}><div data-testid="helloo-paidcall" style={{ fontFamily: T.fontBody }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <HellooAvatar person={person} size={52} />
      <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 16, fontWeight: 800, color: T.ink }}><HellooNameB p={person} /></span><span style={{ display: "block", fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>takes paid calls</span></span>
      <span data-testid="helloo-paidcall-rate" style={{ textAlign: "right", flexShrink: 0 }}><span style={{ display: "block", fontSize: 19, fontWeight: 900, fontFamily: T.fontDisplay, color: T.ink, whiteSpace: "nowrap" }}>{hellooMoneyText(perMinute, currency)}</span><span style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: T.inkSoft }}>a minute</span></span>
    </div>
    <div data-testid="helloo-paidcall-wallet" style={{ marginTop: 16, padding: 14, borderRadius: 18, background: empty || other ? "#FEF3C7" : T.surfaceAlt }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.4, textTransform: "uppercase" }}>Your balance</span>
        <span data-testid="helloo-paidcall-balance" style={{ fontSize: 17, fontWeight: 900, fontFamily: T.fontDisplay, color: T.ink, whiteSpace: "nowrap" }}>{hellooMoneyText(w.balance, w.currency || currency)}</span>
      </div>
      {other ? <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 800, color: "#92400E", lineHeight: 1.4 }}>Paid calls work between people with the same money for now.</div>
        : empty ? <div data-testid="helloo-paidcall-empty" style={{ marginTop: 8, fontSize: 13.5, fontWeight: 800, color: "#92400E", lineHeight: 1.4 }}>Your balance is empty, so this call can't connect.</div>
        : <>
          <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>You can talk for up to</div>
          <div data-testid="helloo-paidcall-time" style={{ fontSize: 24, fontWeight: 900, fontFamily: T.fontDisplay, color: T.ink, lineHeight: 1.15 }}>{hellooTalkTime(w.seconds)}</div>
          <div aria-hidden="true" style={{ marginTop: 10, height: 6, borderRadius: 3, background: "rgba(23,19,43,0.08)", overflow: "hidden" }}><div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 3, background: HT.free }} /></div>
          {capped ? <div style={{ marginTop: 6, fontSize: 11.5, color: T.inkFaint }}>One call can run up to an hour.</div> : null}
        </>}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 2px 16px" }}>
      {line(HlTimer, `Billed per second from when ${first} picks up — 10 sec is ${hellooMoneyText(hellooCallCost(10, perMinute), currency)}.`, HT.free)}
      {line(HlLock, "Ends by itself when your balance runs out. Nothing is borrowed, nothing is owed later.")}
      {line(HlPhone, "Not answered or declined? Nothing is charged.")}
    </div>
    {empty || other
      ? <span data-testid="helloo-paidcall-earn" style={{ display: "flex" }}><HellooPrimary onClick={onEarn} Icon={HlRupee}>Earn with Ads & Earn</HellooPrimary></span>
      : <span data-testid="helloo-paidcall-pay" style={{ display: "flex" }}><HellooPrimary onClick={onCall} disabled={busy} Icon={video ? HlVideo : HlPhone}>{busy ? "Calling…" : "Call · billed per second"}</HellooPrimary></span>}
    {empty ? <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: T.inkFaint }}>Or add money to your GLOOBAL balance.</div> : null}
  </div></HellooSheet>;
}

// ── REPLY WITH A MESSAGE ────────────────────────────────────────────────
// When a call comes and you can't pick up: decline it with a line instead.
// Four quick replies, yours to rewrite ("Ruk ja bhai, bas 5 min"), kept on
// this phone for your account — and Custom, to type one just for now.
var HELLOO_CALL_REPLIES = ["Sorry, I can't talk right now.", "Can't talk now. Please text me.", "I'm on my way.", "In a meeting. Call you later."];
var HELLOO_CALL_REPLY_MAX = 80;
function hellooCallRepliesLoad(accountId) {
  try { const v = JSON.parse(localStorage.getItem("helloo.callReplies." + (accountId || "")) || "null"); if (Array.isArray(v) && v.length === 4) return v.map((t, i) => (typeof t === "string" && t.trim() ? t.trim().slice(0, HELLOO_CALL_REPLY_MAX) : HELLOO_CALL_REPLIES[i])); } catch (e) { /* private window */ }
  return HELLOO_CALL_REPLIES.slice();
}
function hellooCallRepliesSave(accountId, list) { try { localStorage.setItem("helloo.callReplies." + (accountId || ""), JSON.stringify(list)); } catch (e) { /* private window */ } }
function HellooCallReplySheet({ me, person, onSend, onClose }) {
  const mine = (me && me.accountId) || "";
  const [list, setList] = useStateH12(() => hellooCallRepliesLoad(mine));
  const [mode, setMode] = useStateH12("pick"); // pick | custom | edit
  const [text, setText] = useStateH12("");
  const [draft, setDraft] = useStateH12(list);
  const who = person.handle || (person.name || "").split(" ")[0] || "them";
  const row = { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: "none", borderTop: `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, fontSize: 15, fontWeight: 600, color: T.ink };
  const field = { flex: 1, minWidth: 0, height: 46, borderRadius: 14, border: `1.5px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 15, fontFamily: T.fontBody, padding: "0 14px", outline: "none", boxSizing: "border-box" };
  if (mode === "edit") return <HellooSheet title="Your quick replies" label="Edit quick replies" zIndex={210} onClose={() => setMode("pick")}><div data-testid="helloo-call-reply-edit" style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: T.fontBody }}>
    <div style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.45 }}>Four lines you can send with one tap when you can't pick up. Write them your way.</div>
    {draft.map((t, i) => <label key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 22, textAlign: "center", fontSize: 13, fontWeight: 800, color: T.inkFaint }}>{i + 1}</span><input value={t} maxLength={HELLOO_CALL_REPLY_MAX} onChange={(e) => setDraft((d) => d.map((x, k) => (k === i ? e.target.value : x)))} placeholder={HELLOO_CALL_REPLIES[i]} aria-label={`Quick reply ${i + 1}`} data-testid={`helloo-call-reply-edit-${i}`} style={field} /></label>)}
    <span data-testid="helloo-call-reply-save" style={{ display: "flex", marginTop: 4 }}><HellooPrimary onClick={() => { const next = draft.map((t, i) => (t.trim() ? t.trim().slice(0, HELLOO_CALL_REPLY_MAX) : HELLOO_CALL_REPLIES[i])); hellooCallRepliesSave(mine, next); setList(next); setDraft(next); setMode("pick"); }}>Save</HellooPrimary></span>
    <HellooSecondary onClick={() => { setDraft(HELLOO_CALL_REPLIES.slice()); }}>Put the usual four back</HellooSecondary>
  </div></HellooSheet>;
  return <HellooSheet title="Reply with message" zIndex={210} onClose={onClose}><div data-testid="helloo-call-reply" style={{ fontFamily: T.fontBody }}>
    <div style={{ fontSize: 12.5, color: T.inkSoft, margin: "0 2px 10px" }}>The call is declined and {who} gets your message.</div>
    <HellooCard>
      {list.map((t, i) => <button key={i} onClick={() => onSend(t)} data-testid="helloo-call-reply-option" className="v2-tap" style={Object.assign({}, row, i === 0 ? { borderTop: "none" } : {})}><span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{t}</span><HlSend size={16} color={T.inkFaint} style={{ flexShrink: 0 }} /></button>)}
      {mode === "custom"
        ? <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderTop: `1px solid ${T.line}` }}><input autoFocus value={text} maxLength={HELLOO_CALL_REPLY_MAX} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) onSend(text.trim()); }} placeholder="Type a message" aria-label="Custom message" data-testid="helloo-call-reply-custom-input" style={field} /><button onClick={() => text.trim() && onSend(text.trim())} disabled={!text.trim()} aria-label="Send message" data-testid="helloo-call-reply-custom-send" className="v2-tap" style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: text.trim() ? T.gradButton : T.gradButtonDisabled, display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0 }}><HlSend size={18} color="#fff" /></button></div>
        : <button onClick={() => setMode("custom")} data-testid="helloo-call-reply-custom" className="v2-tap" style={row}><span style={{ flex: 1 }}>Custom</span><HlPencil size={16} color={T.inkFaint} /></button>}
    </HellooCard>
    <button onClick={() => { setDraft(list); setMode("edit"); }} data-testid="helloo-call-reply-edit-open" className="v2-tap" style={{ width: "100%", marginTop: 12, height: 44, borderRadius: 14, border: "none", background: T.surfaceAlt, color: T.accent, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Edit my four quick replies</button>
  </div></HellooSheet>;
}

function HellooCallScreen({ reached = false, paidCall = null, me = null, onReply, person, video = false, state = "ringing", seconds = 0, muted = false, speaker = false, cameraOff = false, onMute, onSpeaker, onCamera, onFlip, onEnd, onMinimise, onChat, onShop, meter = null, localVideoRef, remoteVideoRef, remoteAudioRef, incoming = false, onAccept, note = "", paid = false }) {
  const live = state === "live";
  const [replying, setReplying] = useStateH12(false);
  const showVideo = video && (live || state === "connecting");
  const shop = hellooIsBusiness(person);
  const INK = "#17132B"; const SOFT = "rgba(23,19,43,0.56)"; const PAPER = "#F6F4FF";
  const ink = showVideo ? "#fff" : INK; const soft = showVideo ? "rgba(255,255,255,0.78)" : SOFT;
  // A paid call: the rate, and once live what it has cost so far — and for
  // the caller, the time their balance has left.
  const paidMax = paidCall && paidCall.maxSeconds ? paidCall.maxSeconds : 0;
  const paidRan = live ? Math.min(seconds, paidMax || seconds) : 0;
  const paidSoFar = paidCall ? hellooCallCost(paidRan, paidCall.perMinute) : 0;
  const paidLeft = Math.max(0, paidMax - paidRan);
  const paidLow = paidCall && live && !incoming && paidLeft <= 30;
  const paidClock = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  const paidPill = paidCall && paidCall.perMinute ? <div data-testid="helloo-call-paid" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, padding: "7px 12px", borderRadius: 999, background: paidLow ? "#F59E0B" : showVideo ? "rgba(255,255,255,0.18)" : "#fff", color: paidLow ? "#fff" : ink, boxShadow: showVideo || paidLow ? "none" : "0 6px 18px rgba(60,40,140,0.10)", fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums", fontFamily: T.fontBody, backdropFilter: showVideo ? "blur(10px)" : undefined, maxWidth: "100%", boxSizing: "border-box" }}><HlRupee size={14} color={paidLow ? "#fff" : (showVideo ? "#fff" : HT.free)} style={{ flexShrink: 0 }} /><span>{incoming
      ? (live ? `Paid call · you've earned ${hellooMoneyText(paidSoFar, paidCall.currency)}` : `Paid call · ${hellooMoneyText(paidCall.perMinute, paidCall.currency)}/min to you`)
      : (live ? `${hellooMoneyText(paidSoFar, paidCall.currency)} · ${paidClock(paidLeft)} left` : `${hellooMoneyText(paidCall.perMinute, paidCall.currency)}/min · up to ${hellooTalkTime(paidMax)}`)}</span></div> : null;
  // Calling… (on its way) → Ringing (their phone has it) → Connecting… →
  // the time. Like any phone, so you know where it is.
  const status = incoming && state === "ringing" ? `Incoming ${video ? "video" : "voice"} call` : state === "ringing" ? (reached ? "Ringing…" : (video ? "Video calling…" : "Calling…")) : state === "connecting" ? "Connecting…" : state === "ended" ? "Call ended" : hellooDuration(seconds);
  // The one picture: photo or logo, else the emoji, else the first letters
  // on the person's own colour.
  const D = 176;
  const hue = hellooHue(person.id || person.gloobalId || person.name);
  const picture = <span data-testid="helloo-call-picture" style={{ position: "relative", width: D, height: D, borderRadius: "50%", flexShrink: 0, background: person.photo ? "#fff" : person.emoji ? hue + "24" : hue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: person.emoji && !person.photo ? D * 0.52 : D * 0.34, lineHeight: 1, fontWeight: 800, fontFamily: T.fontDisplay, letterSpacing: -1, boxShadow: `0 22px 48px ${hue}3D` }}>{person.photo ? <img src={person.photo} alt="" style={{ width: D, height: D, borderRadius: "50%", objectFit: "cover", display: "block" }} /> : person.emoji ? person.emoji : hellooInitials(person.handle || person.name)}{shop && <button data-testid="helloo-call-shop-mark" onClick={onShop} disabled={!onShop} aria-label="See the shop's menu" className="v2-tap" style={{ position: "absolute", right: 0, bottom: 0, width: 50, height: 50, borderRadius: "50%", border: "none", padding: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(23,19,43,0.2)", cursor: onShop ? "pointer" : "default" }}><HlStore size={23} color={T.accent} /></button>}</span>;
  const ring = (delay) => <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${hue}`, opacity: 0, animation: `hlCallRing 2.2s ease-out ${delay}s infinite` }} />;
  const tool = (Icon, label, on, onClick) => <button onClick={onClick} aria-label={label} aria-pressed={on} className="v2-tap" style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: on ? (showVideo ? "#fff" : INK) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon size={22} color={on ? (showVideo ? INK : "#fff") : ink} /></button>;
  const round = (Icon, label, bg, onClick, word) => <button onClick={onClick} aria-label={label} className="v2-tap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: "none", background: "none", cursor: "pointer", color: soft, fontFamily: T.fontBody, fontSize: 12, fontWeight: 700 }}><span style={{ width: 68, height: 68, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 28px ${bg}55` }}><Icon size={27} color="#fff" /></span>{word}</button>;
  return <HellooScreen style={{ background: showVideo ? "#000" : PAPER, color: ink, overflow: "hidden" }}>
    {video && <video ref={remoteVideoRef} autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#000", opacity: showVideo ? 1 : 0, transition: "opacity 0.4s" }} />}
    {!video && <audio ref={remoteAudioRef} autoPlay />}
    {showVideo && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 190, background: "linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0))", zIndex: 1 }} />}
    {showVideo && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.55))", zIndex: 1 }} />}
    {video && <video ref={localVideoRef} autoPlay playsInline muted data-testid="helloo-call-self" style={{ position: "absolute", right: 18, bottom: "calc(118px + env(safe-area-inset-bottom, 0px))", width: 104, height: 104, objectFit: "cover", borderRadius: "50%", background: "#111", border: "3px solid #fff", boxShadow: "0 10px 28px rgba(0,0,0,0.45)", transform: "scaleX(-1)", zIndex: 3, display: cameraOff || !showVideo ? "none" : "block" }} />}
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "calc(14px + env(safe-area-inset-top, 0px)) 18px 0 24px" }}><div data-testid="helloo-call-name" style={{ flex: 1, minWidth: 0, fontSize: showVideo ? 22 : 34, fontWeight: 800, fontFamily: T.fontDisplay, letterSpacing: showVideo ? -0.4 : -1, lineHeight: 1.08, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: "100%", minWidth: 0 }}><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{shop ? <CreatorHandleText handle={person.handle} icon={false} color={ink} /> : hellooName(person)}</span>{!person.group ? <HellooBadge tier={person.badge || 1} size={showVideo ? 20 : 26} /> : null}</span></div><button onClick={onMinimise} aria-label="Minimise" data-testid="helloo-call-flag" title={person.country ? `${person.country} · tap to make the call small` : "Make the call small"} className="v2-tap" style={{ position: "relative", width: 44, height: 44, flexShrink: 0, borderRadius: "50%", border: "none", padding: 0, background: showVideo ? "rgba(255,255,255,0.9)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(23,19,43,0.14)", cursor: "pointer" }}>{person.flag ? <FlagEmoji flag={person.flag} size={32} shape="circle" border="none" /> : <HlDown size={20} color={INK} />}{person.flag ? <span aria-hidden="true" style={{ position: "absolute", right: -3, bottom: -3, width: 20, height: 20, borderRadius: "50%", background: INK, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><HlDown size={12} color="#fff" strokeWidth={3} /></span> : null}</button></div>
    <div style={{ position: "relative", zIndex: 2, padding: showVideo ? "4px 20px 0" : "6px 24px 0" }}><div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: soft, marginTop: 2, fontWeight: 600 }}>{shop ? "Shop" : null}</div><div data-testid="helloo-call-status" style={{ marginTop: showVideo ? 4 : 14, fontSize: live ? (showVideo ? 17 : 30) : 15, fontWeight: live ? 800 : 700, fontFamily: live ? T.fontDisplay : T.fontBody, letterSpacing: live ? -0.5 : 0, color: live ? (showVideo ? "#fff" : HT.free) : soft, fontVariantNumeric: "tabular-nums" }}>{status}</div>{paidPill}</div>
    <div style={{ position: "relative", zIndex: 2, flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{!showVideo && <span style={{ position: "relative", display: "inline-flex", animation: live ? "hlBreathe 2.8s ease-in-out infinite" : "none" }}>{state === "ringing" && ring(0)}{state === "ringing" && ring(0.7)}{state === "ringing" && ring(1.4)}{picture}</span>}<style>{"@keyframes hlCallRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.55);opacity:0}}@keyframes hlBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@media (prefers-reduced-motion: reduce){[data-testid=helloo-call-picture]{animation:none}}"}</style></div>
    <div style={{ position: "relative", zIndex: 2, padding: "0 20px calc(26px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 18 }}>{meter}<div data-testid="helloo-call-lock" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 800, color: soft, letterSpacing: 0.2 }}><HlLock size={13} color={soft} />Helloo · {paid ? "paid" : "free"}</div>{incoming && state === "ringing"
      ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 14px" }}>{round(HlEnd, "Decline", T.negative, onEnd, "Decline")}{onReply ? <button onClick={() => setReplying(true)} aria-label="Reply with message" data-testid="helloo-call-reply-open" className="v2-tap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: "none", background: "none", cursor: "pointer", color: soft, fontFamily: T.fontBody, fontSize: 12, fontWeight: 700 }}><span style={{ width: 56, height: 56, marginTop: 6, borderRadius: "50%", background: "#fff", boxShadow: "0 8px 22px rgba(60,40,140,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}><HlChat size={23} color={T.accent} /></span>Message</button> : null}{round(video ? HlVideo : HlPhone, "Answer", "#0B9E6B", onAccept, "Answer")}</div>
      : <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}><div role="toolbar" aria-label="Call controls" style={{ display: "flex", alignItems: "center", gap: 4, padding: 6, borderRadius: 999, background: showVideo ? "rgba(20,16,40,0.55)" : "#fff", backdropFilter: showVideo ? "blur(14px)" : undefined, WebkitBackdropFilter: showVideo ? "blur(14px)" : undefined, boxShadow: showVideo ? "none" : "0 8px 24px rgba(60,40,140,0.10)" }}>{tool(muted ? HlMicOff : HlMic, muted ? "Unmute" : "Mute", muted, onMute)}{video ? tool(cameraOff ? HlVideoOff : HlVideo, cameraOff ? "Camera on" : "Camera off", cameraOff, onCamera) : tool(HlSpeaker, "Speaker", speaker, onSpeaker)}{video && tool(HlRetry, "Flip", false, onFlip)}{tool(HlChat, "Chat", false, onChat)}</div><button onClick={onEnd} aria-label="End" className="v2-tap" style={{ width: 64, height: 64, borderRadius: "50%", border: "none", background: T.negative, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 12px 28px rgba(220,38,38,0.38)" }}><HlEnd size={26} color="#fff" /></button></div>}</div>
  {replying && incoming && state === "ringing" && onReply ? <HellooCallReplySheet me={me} person={person} onClose={() => setReplying(false)} onSend={(t) => { setReplying(false); onReply(t); }} /> : null}</HellooScreen>;
}

// Rings over whatever is open. Push wakes the app when it is closed.
function HellooIncomingBanner({ person, video = false, onAccept, onDecline }) {
  return <div role="alertdialog" aria-label={`Incoming ${video ? "video" : "voice"} call from ${hellooName(person)}`} style={{ position: "absolute", left: 12, right: 12, top: "calc(10px + env(safe-area-inset-top, 0px))", zIndex: 80, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 22, background: HT.callBg, color: HT.callInk, boxShadow: T.shadowFloat }}><HellooAvatar person={person} size={46} flag={false} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}><HellooNameB p={person} /></span><span style={{ display: "block", fontSize: 11.5, color: HT.callSoft, marginTop: 1 }}>Helloo {video ? "video" : "voice"} call · {person.country} · free</span></span><button onClick={onDecline} aria-label="Decline" className="v2-tap" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: T.negative, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlEnd size={20} color="#fff" /></button><button onClick={onAccept} aria-label="Accept" className="v2-tap" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: HT.free, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{video ? <HlVideo size={20} color="#fff" /> : <HlPhone size={20} color="#fff" />}</button></div>;
}

// ── THE CALLS SIDE ────────────────────────────────────────────────────
//
// Like the phone's own dialler: Recents fill the screen (All / Missed),
// each row with its direction, the name (red when missed), voice or
// video and how long, the time, and an (i) for the person. The dial pad
// is a round button bottom-right that opens it as a sheet; it slips away
// while the list scrolls. + top-right adds somebody; the scanner sits
// beside it. The header says HELLOO, the same as the Messages side.
function HellooCallsHome({ me, calls = [], onCallBack, onInfo, onOpenDial, onAdd, onSearch, onScan, onMe, filter = "all", onFilter, when = "all", onWhen, children }) {
  const [scrolling, setScrolling] = useStateH12(false);
  const scrollTimer = useRefH12(null);
  const onScroll = () => { setScrolling(true); clearTimeout(scrollTimer.current); scrollTimer.current = setTimeout(() => setScrolling(false), 650); };
  const inWhen = calls.filter((c) => hellooInPeriod(c.at, when));
  const shown = filter === "missed" ? inWhen.filter((c) => c.missed) : inWhen;
  // What that period held, in one line: calls, time talking, missed.
  const talked = inWhen.reduce((n, c) => n + (c.status === "ended" ? Number(c.seconds) || 0 : 0), 0);
  const missedN = inWhen.filter((c) => c.missed).length;
  const periodWords = hellooPeriodWords(when);
  const [picking, setPicking] = useStateH12(false);
  useHellooBackLayer(picking, () => setPicking(false));
  const callDays = new Set(calls.map((c) => hellooDayKey(new Date(c.at))));
  const line = (c) => `${c.video ? "Video" : "Voice"}${c.status === "ended" && c.seconds ? ` · ${hellooDurationHms(c.seconds)}` : c.missed ? " · Missed" : c.status === "declined" ? " · Declined" : c.status === "cancelled" ? " · Cancelled" : ""}`;
  const dayOf = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };
  const rows = [];
  let lastDay = null;
  shown.forEach((c) => { const d = dayOf(c.at); if (d !== lastDay) { rows.push({ day: hellooDayLabel(new Date(c.at)), key: "d" + d }); lastDay = d; } rows.push(c); });
  // The same top bar as Messages (logo, scan, you), so switching between
  // them in the side column never moves anything at the top.
  return <HellooScreen><HellooTop big title={<span style={{ fontSize: 26 }}><HellooWordmark /></span>} right={<><button onClick={onMe} aria-label="Me: profile, price and settings" className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", borderRadius: "50%", display: "inline-flex" }}><HellooMeAvatar me={me} size={40} /></button></>} /><div style={{ padding: "0 16px 8px", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ flex: 1, fontSize: 20, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, letterSpacing: -0.3 }}>Recents</span><HellooRoundButton Icon={HlCalendar} label="Find calls by date" onClick={() => setPicking(true)} size={38} color={when !== "all" ? T.accent : T.inkSoft} /></div><div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><HellooPeriodPill value={when} onOpen={() => setPicking(true)} onClear={() => onWhen && onWhen("all")} />{missedN || filter === "missed" ? <><HellooChip on={filter === "all"} onClick={() => onFilter && onFilter("all")}>Every call</HellooChip><HellooChip on={filter === "missed"} onClick={() => onFilter && onFilter("missed")} count={missedN}>Missed</HellooChip></> : null}</div><span data-testid="helloo-calls-summary" style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{inWhen.length} {inWhen.length === 1 ? "call" : "calls"}{periodWords ? ` ${periodWords}` : ""}{talked ? ` · ${hellooDurationHms(talked)} talking` : ""}{missedN ? <span style={{ color: T.negative }}> · {missedN} missed</span> : null}</span></div>{picking ? <HellooDateSheet aboveNav title="Find calls by date" value={when} marks={callDays} onClose={() => setPicking(false)} onPick={(k) => { setPicking(false); onWhen && onWhen(k); }} /> : null}<div onScroll={onScroll} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 290px" }}>{shown.length === 0 ? <HellooCard style={{ padding: "22px 16px", textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{filter === "missed" ? `No missed calls${periodWords ? " " + periodWords : ""}` : periodWords ? `No calls ${periodWords}` : "No calls yet"}</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4, lineHeight: 1.45 }}>{filter === "missed" ? "Calls you didn't answer show here." : "Tap the dial button to call a GLOOBAL ID, or call from any chat. Free, over data."}</div></HellooCard> : <HellooCard>{rows.map((r, i) => r.day ? <div key={r.key} style={{ padding: "10px 14px 4px", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.inkFaint, borderTop: i ? `1px solid ${T.line}` : "none" }}>{r.day}</div> : <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px 9px 14px" }}><button onClick={() => onCallBack && onCallBack(r)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 22, display: "flex", justifyContent: "center", flexShrink: 0 }}>{r.missed ? <HlMissed size={18} color={T.negative} /> : r.direction === "out" ? <HlOut size={18} color={T.inkSoft} /> : <HlIn size={18} color={HT.free} />}</span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: r.missed ? T.negative : T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><HellooNameB p={r.person} /></span><span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{r.video ? <HlVideo size={12} /> : <HlPhone size={12} />}{line(r)}</span></span><span style={{ fontSize: 12, color: T.inkFaint, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{hellooClock(r.at)}</span></button><button onClick={() => onInfo && onInfo(r)} aria-label={`About ${hellooName(r.person)}`} className="v2-tap" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><HlInfo size={20} color={T.inkSoft} /></button></div>)}</HellooCard>}</div>{children}</HellooScreen>;
}

// The dial pad as a sheet: the symbols you have typed appear only once you
// start; then who it found, and Message · Call · Video.
// The ID being dialled: twelve places in three fours, the way an ID is
// read out. Filled places hold their symbol, the next one waits with a
// soft ring, the rest are quiet. Always there, so nothing jumps when the
// first symbol lands.
function HellooDialBox({ value = "", done = false, bad = false }) {
  const tone = bad ? T.negative : done ? HT.free : T.accent;
  const soft = bad ? `${T.negative}14` : done ? HT.freeSoft : T.accentSoft;
  const slot = (i) => {
    const ch = value[i]; const next = i === value.length;
    return <span key={i} data-filled={ch ? "1" : undefined} style={{ flex: 1, minWidth: 0, aspectRatio: "1 / 1", borderRadius: "30%", display: "flex", alignItems: "center", justifyContent: "center", background: ch ? soft : next ? (HT.cardBg || T.surface) : T.surfaceSunk, boxShadow: next ? `inset 0 0 0 2px ${tone}` : ch ? `inset 0 0 0 1px ${tone}33` : "none", color: tone, fontSize: 16, fontWeight: 800, lineHeight: 1, transition: "background 0.15s ease, box-shadow 0.15s ease" }}>{ch || (next ? <span style={{ width: 2, height: 13, borderRadius: 1, background: tone, animation: "hellooCaret 1s steps(2) infinite" }} /> : <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.line }} />)}</span>;
  };
  return <div data-testid="helloo-dial-box" aria-label={`${value.length} of 12 symbols dialled`} style={{ width: "100%", display: "flex", gap: 10, padding: "12px 10px", borderRadius: HT.radius ?? 20, background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, border: HT.cardBorder || "none", boxSizing: "border-box" }}><style>{"@keyframes hellooCaret{0%{opacity:1}50%{opacity:0}}"}</style>{[0, 4, 8].map((g) => <span key={g} style={{ flex: 1, minWidth: 0, display: "flex", gap: 3 }}>{[0, 1, 2, 3].map((k) => slot(g + k))}</span>)}</div>;
}

function HellooDialSheet({ dial = "", onDial, match, status, onMessage, onCall, onVideo, onClose, title = "Dial a GLOOBAL ID", contacts = [], saved = false, saving = false, onSave, onUnsave, mode = "id", onMode, phone = "", onPhone, dialCode = "+91", dialCountry = null, onCountry }) {
  const byMobile = mode === "mobile";
  const digits = String(phone).replace(/\D/g, "");
  const key = (k) => <button key={k} onClick={() => onPhone && onPhone(k === "⌫" ? digits.slice(0, -1) : (digits + k).slice(0, maxDigits))} aria-label={k === "⌫" ? "Delete" : `Number ${k}`} className="v2-tap" style={{ justifySelf: "center", width: 64, height: 64, borderRadius: "50%", border: "none", background: k === "⌫" ? "transparent" : T.surfaceAlt, boxShadow: "none", fontSize: 26, fontWeight: 700, color: T.ink, cursor: "pointer", fontFamily: T.fontDisplay, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>{k === "⌫" ? <HlDelete size={24} color={T.inkSoft} /> : k}</button>;
  // The number as people say it: 98765 43210 in India, otherwise in threes.
  const spaced = dialCode === "+91" ? digits.replace(/^(\d{5})(?=\d)/, "$1 ") : digits.replace(/(\d{3})(?=\d)/g, "$1 ");
  const found = status === "found" && match;
  // The country as its flag, in a circle (the code is only in the label).
  const dialFlag = (dialCountry && dialCountry.flag) || "";
  // Tap the flag: GLOOBAL's own country list, searched by name or code.
  const [picking, setPicking] = useStateH12(false);
  useHellooBackLayer(picking, () => setPicking(false));
  const [pickQ, setPickQ] = useStateH12("");
  const maxDigits = (dialCountry && typeof MOBILE_DIGIT_RANGE_BY_ISO === "object" && MOBILE_DIGIT_RANGE_BY_ISO[dialCountry.iso] && MOBILE_DIGIT_RANGE_BY_ISO[dialCountry.iso][1]) || 13;
  const people = contacts.filter((c) => c && c.gloobalId && !c.group).slice(0, 12);
  // People you already have whose GLOOBAL ID starts with what is dialled.
  const near = !byMobile && dial.length > 0 && dial.length < 12 ? contacts.filter((c) => c.gloobalId && c.gloobalId.startsWith(dial)).slice(0, 6) : [];
  const idRest = (id) => <span style={{ fontSize: 12, letterSpacing: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span style={{ color: T.accent, fontWeight: 800 }}>{id.slice(0, dial.length)}</span><span style={{ color: T.inkFaint }}>{id.slice(dial.length)}</span></span>;
  // A whole screen, not a sheet: the box, who it matches, and the pad each
  // get their room, and the three buttons stay at the bottom.
  return <div role="dialog" aria-modal="true" aria-label={byMobile ? "Find by mobile number" : title} data-testid="helloo-dial-screen" style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", background: HT.screenBg || T.bg, fontFamily: T.fontBody }}><div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px calc(14px + env(safe-area-inset-bottom, 0px))", boxSizing: "border-box" }}>
    <div style={{ width: "100%", flexShrink: 0, padding: "10px 4px 0", textAlign: "center" }}><div data-testid="helloo-dial-mark" style={{ fontSize: 23, fontWeight: 900, fontFamily: T.fontDisplay, color: status === "none" ? T.negative : T.ink, letterSpacing: -0.4, lineHeight: 1.15 }}>{found ? <><span style={{ color: HT.free }}>{(match.handle || match.name || "").split(" ")[0]}</span> <HellooBadge tier={match.badge || 1} size={20} /> is on GLOOBAL</> : status === "none" ? "Not on GLOOBAL yet" : status === "looking" ? "Looking…" : "Find someone"}</div><div style={{ fontSize: 13, fontWeight: 700, color: T.inkSoft, marginTop: 5, lineHeight: 1.35 }}>{found ? "Message, call or video them now" : status === "none" ? (byMobile ? "Check the number, or invite them to GLOOBAL" : "Check the symbols and try again") : byMobile ? "By their mobile number · no need to save it" : "By their 12-symbol GLOOBAL ID"}</div></div>
    {/* The box and who it matches sit a third of the way down the room between the top and the pad. */}
    {onMode ? <div role="tablist" aria-label="Find by" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: T.surfaceAlt, flexShrink: 0, marginTop: 14 }}>{[["mobile", HlMobile, "Mobile number"], ["id", HlDial, "GLOOBAL ID"]].map(([k, Icon, label]) => <button key={k} role="tab" onClick={() => onMode(k)} aria-pressed={mode === k} aria-selected={mode === k} aria-label={label} title={label} data-testid={`helloo-dial-mode-${k}`} className="v2-tap" style={{ width: 64, height: 44, borderRadius: 999, border: "none", background: mode === k ? (HT.cardBg || T.surface) : "transparent", boxShadow: mode === k ? T.shadowCard : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, transition: "background 0.2s ease" }}><Icon size={22} color={mode === k ? T.accent : T.inkSoft} /></button>)}</div> : null}
    <div style={{ flex: 1, minHeight: 0 }} />
    
    {byMobile ? <div data-testid="helloo-dial-phone" aria-label={`${dialCode} ${digits || "no number yet"}`} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "6px 0", minHeight: 56, flexShrink: 0 }}><button type="button" onClick={() => onCountry && setPicking(true)} data-testid="helloo-dial-country" aria-label={`Country: ${(dialCountry && dialCountry.name) || dialCode} ${dialCode}. Change`} title={`${(dialCountry && dialCountry.name) || ""} ${dialCode}`} className="v2-tap" style={{ position: "relative", display: "inline-flex", flexShrink: 0, border: "none", background: "none", padding: 0, cursor: onCountry ? "pointer" : "default", borderRadius: "50%" }}>{dialFlag ? <span style={{ display: "inline-flex", borderRadius: "50%", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}><FlagEmoji flag={dialFlag} size={38} shape="circle" /></span> : <span style={{ fontSize: 15, fontWeight: 800, color: T.inkSoft }}>{dialCode}</span>}{onCountry ? <span aria-hidden="true" style={{ position: "absolute", right: -3, bottom: -3, width: 17, height: 17, borderRadius: "50%", background: HT.cardBg || T.surface, boxShadow: "0 1px 3px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><HlChevron size={11} color={T.ink} style={{ transform: "rotate(90deg)" }} /></span> : null}</button><span style={{ minWidth: 0, display: "inline-flex", alignItems: "center", fontSize: digits.length > 11 ? "min(26px, 6.6vw)" : "min(32px, 7.6vw)", fontWeight: 800, letterSpacing: 0.5, color: status === "none" ? T.negative : found ? HT.free : T.ink, fontFamily: T.fontDisplay, whiteSpace: "nowrap", overflow: "hidden" }}>{digits ? spaced : <span style={{ color: T.inkFaint, fontWeight: 700, letterSpacing: 0, fontSize: 18 }}>Mobile number</span>}<span aria-hidden="true" style={{ width: 2, height: 28, marginLeft: 3, borderRadius: 1, background: T.accent, animation: "hellooCaret 1s steps(2) infinite", flexShrink: 0 }} /><style>{"@keyframes hellooCaret{0%{opacity:1}50%{opacity:0}}"}</style></span></div> : <HellooDialBox value={dial} done={Boolean(found)} bad={status === "none"} />}
    <div style={{ width: "100%", flex: "0 1 auto", minHeight: 62, maxHeight: "44%", overflowY: "auto", padding: "4px 4px 12px", margin: "0 -4px", boxSizing: "content-box" }}>{found
      ? <HellooCard style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px" }}><HellooAvatar person={match} size={44} /><span style={{ flex: 1, minWidth: 0 }}><HellooVerifiedName person={match} size={15.5} /><span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{match.country}{match.online && <span style={{ color: HT.free, fontWeight: 700 }}> · Online</span>}</span>{byMobile && match.gloobalId ? <span data-testid="helloo-dial-their-id" className="helloo-id-line" style={{ display: "block", marginTop: 3, fontSize: 12, letterSpacing: 0.4, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden" }}><style>{".helloo-id-line>span{flex-wrap:nowrap!important;gap:1px!important}"}</style>{typeof ColoredGloobalId === "function" ? <ColoredGloobalId id={match.gloobalId} /> : match.gloobalId}</span> : null}</span>{saved
          ? <button onClick={onUnsave} disabled={saving || !onUnsave} data-testid="helloo-dial-saved" aria-label="Saved. Tap to unsave" title="Tap to unsave" className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: HT.free, background: HT.freeSoft, border: "none", borderRadius: 999, padding: "8px 11px", flexShrink: 0, cursor: onUnsave ? "pointer" : "default", fontFamily: T.fontBody, opacity: saving ? 0.6 : 1 }}><HlCheck size={13} color={HT.free} />Saved</button>
          : onSave ? <button onClick={onSave} disabled={saving} data-testid="helloo-dial-save" className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", borderRadius: 999, background: T.accentSoft, color: T.accent, fontSize: 12.5, fontWeight: 800, padding: "8px 12px", cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0, opacity: saving ? 0.6 : 1 }}><HlUserPlus size={14} color={T.accent} />{saving ? "Saving…" : "Save"}</button> : null}</HellooCard>
      : near.length ? <HellooCard data-testid="helloo-dial-near">{near.map((c, i) => <button key={c.id} onClick={() => onDial(c.gloobalId)} data-testid="helloo-dial-near-row" className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><HellooAvatar person={c} size={34} flag={false} /><span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: "100%" }}><span style={{ minWidth: 0, fontSize: 14, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.handle || c.name}</span>{c && !c.group ? <HellooBadge tier={c.badge || 1} size={12.5} /> : null}</span>{idRest(c.gloobalId)}</span><span style={{ fontSize: 11, fontWeight: 800, color: T.inkFaint, flexShrink: 0 }}>Saved</span></button>)}</HellooCard>
      : false && people.length ? <div data-testid="helloo-dial-people"><div style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.3, textTransform: "uppercase", margin: "4px 4px 8px" }}>Your people</div><div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "2px 4px 4px" }}>{people.map((c) => <button key={c.accountId || c.gloobalId} onClick={() => { if (byMobile && onMode) onMode("id"); onDial(c.gloobalId); }} data-testid="helloo-dial-person" className="v2-tap" style={{ flexShrink: 0, width: 62, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.fontBody }}><HellooAvatar person={c} size={52} /><span style={{ maxWidth: "100%", fontSize: 11.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.handle || (c.name || "").split(" ")[0]}</span></button>)}</div></div>
      : <div style={{ fontSize: 12.5, color: status === "none" ? T.negative : T.inkFaint, textAlign: "center", padding: "8px 0", fontWeight: 700 }}>{byMobile ? (status === "none" ? "" : status === "looking" ? "Checking…" : digits.length ? "Keep going" : "") : status === "none" ? "" : status === "looking" ? "Checking…" : dial.length ? `${12 - dial.length} more${contacts.length ? " · nobody saved starts like this" : ""}` : ""}</div>}</div>
    <div style={{ flex: 2.2, minHeight: 0 }} />
    {byMobile ? <div data-testid="helloo-dial-numbers" style={{ flexShrink: 0, width: "100%", maxWidth: 300, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 10 }}>{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(key)}<span />{key("0")}{key("⌫")}</div> : <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", width: "100%" }}><SymbolDialPad value={dial} onChange={onDial} length={12} soundWhileTyping /></div>}
    <div data-testid="helloo-dial-actions" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 30, width: "100%", marginTop: 14, flexShrink: 0 }}>{[[HlChat, "Message", onMessage, T.accent], [HlPhone, "Call", onCall, HT.free], [HlVideo, "Video", onVideo, "#DB2777"]].map(([Icon, label, fn, color]) => <button key={label} onClick={fn} disabled={!found} aria-label={label} title={label} className="v2-tap" style={{ width: 64, height: 60, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", color: found ? color : T.inkFaint, opacity: found ? 1 : 0.55, cursor: found ? "pointer" : "default", padding: 0, flexShrink: 0, transition: "color 0.2s ease, opacity 0.2s ease" }}><Icon size={40} color={found ? color : T.inkFaint} fill={found ? color : T.inkFaint} strokeWidth={1.8} /></button>)}</div>
  </div>{picking && typeof CountryPickerScreen === "function" ? <CountryPickerScreen topCountries={TOP_COUNTRIES} countries={ALL_COUNTRIES} search={pickQ} onSearch={setPickQ} selectedIso={dialCountry && dialCountry.iso} onSelect={(c) => { setPicking(false); setPickQ(""); if (onCountry) onCountry(c); }} onClose={() => { setPicking(false); setPickQ(""); }} /> : null}</div>;
}
