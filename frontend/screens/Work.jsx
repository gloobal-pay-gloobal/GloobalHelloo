// ─────────────────────────────────────────────────────────────────────────
// Helloo · Social · Work.
//
// A Work tab on every Social profile, beside Posts and Videos:
//   - your own: your Work card, a switch to show or hide it, Edit, Find;
//   - a person's: their card if they show it, and their openings;
//   - a shop's: its openings, and (for its owner) Post an opening.
// "Work near you" finds people and openings by skill and distance. Applying
// opens a Helloo chat with the poster, with a line ready to send. GLOOBAL
// only connects people and keeps 0%. The server is server/lib/work.js.
// ─────────────────────────────────────────────────────────────────────────
import { useState as useStateH47, useEffect as useEffectH47, useCallback as useCallbackH47 } from "react";
import { Briefcase as WxBag, BadgeCheck as WxReal, MapPin as WxPin, ShieldAlert as WxWarn, Search as WxFind, Pencil as WxEdit, X as WxX, ChevronRight as WxGo, Plus as WxPlus, LocateFixed as WxLocate, Flag as WxFlag } from "lucide-react";

var WORK_STATUS = { open: ["Open to work", "#0E9F6E", "#E3F8EE"], hiring: ["Hiring", "#2563EB", "#E0EAFF"], team: ["Building a team", "#7C3AED", "#EEE6FF"] };
var WORK_KM = [2, 5, 10, 25];
var workWhere = (w) => (w ? `&lat=${w.lat}&lng=${w.lng}` : "");
var workApi = {
  me: () => gloobalApiClient.get("/api/work/me"),
  save: (body) => gloobalApiClient.put("/api/work/me", body),
  card: (accountId, where) => gloobalApiClient.get(`/api/work/card/${encodeURIComponent(accountId)}?x=1${workWhere(where)}`),
  people: (q, km, where) => gloobalApiClient.get(`/api/work/people?q=${encodeURIComponent(q || "")}${where && km ? `&km=${km}` : ""}${workWhere(where)}`),
  openings: (q, km, where) => gloobalApiClient.get(`/api/work/openings?q=${encodeURIComponent(q || "")}${where && km ? `&km=${km}` : ""}${workWhere(where)}`),
  // Posted as whoever you are on Social right now: yourself or your shop.
  post: (body) => socialHttp.post("/api/work/openings", body),
  close: (id) => gloobalApiClient.post(`/api/work/openings/${id}/close`, {}),
  apply: (id) => gloobalApiClient.post(`/api/work/openings/${id}/apply`, {}),
  report: (id) => gloobalApiClient.post(`/api/work/openings/${id}/report`, {})
};
// Where you are, asked once while Work is open and kept for this visit only.
var workHere = null;
function workLocate() { return workHere ? Promise.resolve(workHere) : adsLocate().then((w) => { workHere = w; return w; }); }

var workCardStyle = () => ({ background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, borderRadius: 20 });
var workOne = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
var workField = () => ({ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, padding: "0 14px", outline: "none" });
var workLabel = (t) => <div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, margin: "0 2px 8px" }}>{t}</div>;
function WorkStatus({ k, small }) { const s = WORK_STATUS[k]; return s ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: small ? "3px 8px" : "5px 10px", borderRadius: 999, background: s[2], color: s[1], fontSize: small ? 11 : 12, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: s[1] }} />{s[0]}</span> : null; }
function WorkChip({ on, children, onClick, testid, disabled }) { return <button onClick={onClick} disabled={disabled} data-testid={testid} aria-pressed={Boolean(on)} className="v2-tap" style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 999, border: "none", background: on ? T.accentSoft : (HT.cardBg || T.surface), color: on ? T.accent : T.inkSoft, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : (HT.cardShadow ?? T.shadowCard), fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap", opacity: disabled ? 0.6 : 1 }}>{children}</button>; }
function WorkNote({ title, text }) { return <div style={{ textAlign: "center", color: T.inkSoft, fontSize: 13.5, padding: "30px 20px", lineHeight: 1.5 }}><b style={{ display: "block", color: T.ink, fontSize: 15.5, marginBottom: 4 }}>{title}</b>{text}</div>; }

// One card: status, what they do, where, a few skills, the rate.
function WorkCardBody({ c, isMe }) {
  const where = [c.area, isMe || c.km === null || c.km === undefined ? "" : `${c.km} km`, c.years ? `${c.years} yrs` : ""].filter(Boolean).join(" · ");
  return <div data-testid="work-cardbody" style={{ ...workCardStyle(), padding: 16 }}>
    {c.status ? <WorkStatus k={c.status} /> : null}
    <div style={{ fontSize: 19, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, lineHeight: 1.25, marginTop: c.status ? 10 : 0, overflowWrap: "break-word" }}>{c.title || "Say what you do"}</div>
    {where ? <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: T.inkSoft, marginTop: 4, minWidth: 0 }}><WxPin size={13} color={T.inkSoft} style={{ flexShrink: 0 }} /><span style={workOne}>{where}</span></div> : null}
    {(c.skills || []).length ? <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginTop: 12, overflowWrap: "break-word" }}>{c.skills.slice(0, 5).join(" · ")}</div> : null}
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}`, fontSize: 15, fontWeight: 800, color: c.rate ? T.ink : T.inkSoft }}>{c.rate || "Rate: discuss"}</div>
  </div>;
}
function WorkFindRow({ onClick, title }) {
  return <button onClick={onClick} data-testid="work-find" className="v2-tap" style={{ ...workCardStyle(), display: "flex", alignItems: "center", gap: 12, padding: 14, border: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, width: "100%" }}><span style={{ width: 38, height: 38, borderRadius: 12, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><WxFind size={18} color={T.accent} /></span><span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: T.ink }}>{title}</span><WxGo size={18} color={T.inkFaint} style={{ flexShrink: 0 }} /></button>;
}
function WorkOpening({ o, photos, onApply, onClose, busy }) {
  return <div data-testid="work-opening" style={{ ...workCardStyle(), display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
    <SocialFace card={o.by} photos={photos} size={40} />
    <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, overflowWrap: "break-word" }}>{o.title}</span><span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: o.pay ? T.ink : T.inkSoft, marginTop: 3 }}>{o.pay || "Pay: discuss"}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 1, ...workOne }}>{[o.by && (o.by.handle || o.by.name), o.km !== null && o.km !== undefined ? `${o.km} km` : o.area].filter(Boolean).join(" · ")}</span></span>
    {o.mine ? (onClose ? <button onClick={onClose} disabled={busy} data-testid="work-close" className="v2-tap" style={{ height: 34, padding: "0 12px", borderRadius: 12, border: "none", background: T.surfaceAlt, color: T.inkSoft, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}>Close</button> : <span data-testid="work-yours" style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, flexShrink: 0 }}>Yours</span>)
      : o.sent ? <span style={{ fontSize: 12.5, fontWeight: 800, color: HT.free, flexShrink: 0 }}>Sent ✓</span>
      : <button onClick={onApply} disabled={busy} data-testid="work-apply" className="v2-tap" style={{ height: 36, padding: "0 14px", borderRadius: 12, border: "none", background: T.gradButton, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}>Apply</button>}
  </div>;
}
// Apply: a short warning, then the chat opens with a line ready to send.
function WorkApplySheet({ o, onClose, onSent, onToast, onChat }) {
  const [busy, setBusy] = useStateH47(false);
  const send = async () => {
    setBusy(true);
    try { const r = await workApi.apply(o.id); onSent(o.id); onClose(); if (r.to && onChat) onChat(r.to, r.message); }
    catch (e) { onToast((e && e.message) || "Couldn't apply. Try again."); setBusy(false); }
  };
  return <HellooSheet title="Apply" onClose={onClose}><div data-testid="work-apply-sheet">
    <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5, marginBottom: 12 }}>A chat with <b>{o.by && (o.by.handle || o.by.name)}</b> opens with your Work card in the box, ready to send. Never your number.</div>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 16, background: "#FEF3C7", marginBottom: 14 }}><WxWarn size={18} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.45 }}><b>Never pay to get a job.</b> Report anyone who asks.</span></div>
    <HellooPrimary onClick={send} disabled={busy}>{busy ? "Opening the chat…" : "Apply in chat"}</HellooPrimary>
    <button onClick={async () => { try { await workApi.report(o.id); onToast("Reported. Thank you."); onClose(); } catch (e) { onToast("Couldn't report that."); } }} data-testid="work-report" className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px auto 0", border: "none", background: "none", color: T.inkSoft, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}><WxFlag size={14} color={T.inkSoft} />Report this opening</button>
  </div></HellooSheet>;
}

// The Work tab on a Social profile, beside Posts and Videos.
function WorkTab({ p, card, photos, tick, onOpen, onMessage, onChat, onToast }) {
  const [data, setData] = useStateH47(null);
  const [apply, setApply] = useStateH47(null);
  const [saving, setSaving] = useStateH47(false);
  const mineShop = p.isMe && p.side === "shop";
  const load = useCallbackH47(() => {
    const ask = p.isMe && p.side !== "shop" ? workApi.me().then((r) => ({ card: r.card, openings: (r.openings || []).filter((o) => o.status === "open" && o.by && o.by.side !== "shop") })) : workApi.card(card.accountId, workHere).then((r) => ({ card: r.card, openings: r.openings || [] }));
    ask.then(setData).catch(() => setData({ error: true }));
  }, [p.isMe, p.side, card.accountId]);
  useEffectH47(() => { load(); }, [load, tick]);
  const pad = { padding: "12px 16px 40px", display: "flex", flexDirection: "column", gap: 12 };
  if (!data) return <div data-testid="work-tab" style={pad}><WorkNote title="Loading…" /></div>;
  if (data.error) return <div data-testid="work-tab" style={pad}><WorkNote title="Couldn't load Work" text="Check your connection and try again." /></div>;
  const close = async (o) => { setSaving(true); try { await workApi.close(o.id); onToast("Opening closed"); load(); } catch (e) { onToast((e && e.message) || "Couldn't close it."); } setSaving(false); };
  const openings = (data.openings || []).map((o) => <WorkOpening key={o.id} o={o} photos={photos} busy={saving} onApply={() => setApply(o)} onClose={o.mine && p.isMe ? () => close(o) : undefined} />);
  const sheet = apply ? <WorkApplySheet o={apply} onClose={() => setApply(null)} onSent={() => load()} onToast={onToast} onChat={onChat} /> : null;
  if (p.side === "shop") {
    return <div data-testid="work-tab" style={pad}>
      {openings.length ? openings : <WorkNote title={mineShop ? "No openings yet" : "Not hiring right now"} text={mineShop ? "Post what you need. People near your shop can apply in chat." : ""} />}
      {mineShop ? <HellooPrimary Icon={WxPlus} onClick={() => onOpen("post")}>Post an opening</HellooPrimary> : null}
      <WorkFindRow onClick={() => onOpen("people")} title={mineShop ? "Find people near your shop" : "Find people and work near you"} />
      {sheet}
    </div>;
  }
  if (p.isMe) {
    const c = data.card || { shown: false };
    const toggle = async () => {
      if (!c.title) { onOpen("mine"); onToast("Say what you do first"); return; }
      setSaving(true);
      try { const r = await workApi.save({ shown: !c.shown }); setData((d) => Object.assign({}, d, { card: r.card })); onToast(r.card.shown ? "Your Work card is shown" : "Your Work card is hidden"); } catch (e) { onToast((e && e.message) || "Couldn't save that."); }
      setSaving(false);
    };
    return <div data-testid="work-tab" style={pad}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px" }}><span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800, color: c.shown ? T.ink : T.inkSoft }}>{c.shown ? "Shown on your profile" : "Hidden from everyone"}</span><button onClick={toggle} disabled={saving} role="switch" aria-checked={Boolean(c.shown)} aria-label="Show my Work card" data-testid="work-show" className="v2-tap" style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: c.shown ? HT.free : T.line, display: "flex", alignItems: "center", justifyContent: c.shown ? "flex-end" : "flex-start", padding: 3, cursor: "pointer", flexShrink: 0 }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff" }} /></button></div>
      {c.title ? <div style={{ opacity: c.shown ? 1 : 0.5 }}><WorkCardBody c={c} isMe /></div> : <WorkNote title="Show what you do" text="Add your work and skills. People near you can find you, and you can find them." />}
      <div style={{ display: "flex", gap: 10 }}><HellooSecondary Icon={WxEdit} onClick={() => onOpen("mine")}>{c.title ? "Edit" : "Add"}</HellooSecondary><span style={{ flex: 1.3, display: "flex" }}><HellooPrimary Icon={WxFind} onClick={() => onOpen("people")}>Find people</HellooPrimary></span></div>
      {openings.length ? <><div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, margin: "6px 2px 0" }}>My openings</div>{openings}</> : null}
      <button onClick={() => onOpen("post")} data-testid="work-post-open" className="v2-tap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", background: "none", color: T.accent, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, padding: 6 }}><WxPlus size={16} color={T.accent} />Post an opening</button>
    </div>;
  }
  return <div data-testid="work-tab" style={pad}>
    {data.card ? <><WorkCardBody c={data.card} /><HellooPrimary Icon={HlChat} onClick={onMessage}>Message</HellooPrimary></> : !openings.length ? <WorkNote title="No Work card" text="They haven't shown their work." /> : null}
    {openings}
    <WorkFindRow onClick={() => onOpen("people")} title="Find people and work near you" />
    {sheet}
  </div>;
}

// The full screens: find, someone's card, edit my card, post an opening.
function HellooWorkScreen({ start = "people", photos, shopName, onClose, onToast, onChat, onChanged }) {
  const [at, setAt] = useStateH47(start === "mine" || start === "post" ? start : "find");
  const [who, setWho] = useStateH47(null);
  const [tab, setTab] = useStateH47(start === "openings" ? "openings" : "people");
  const [q, setQ] = useStateH47("");
  const [km, setKm] = useStateH47(0);
  const [where, setWhere] = useStateH47(workHere);
  const [rows, setRows] = useStateH47(null);
  const [apply, setApply] = useStateH47(null);
  const [busy, setBusy] = useStateH47("");
  const back = (to) => (start === to ? onClose : () => setAt("find"));
  const top = (title, sub, onBack) => <HellooTop left={<HellooRoundButton Icon={HlBack} label="Back" onClick={onBack} size={38} />} title={title} subtitle={sub} />;
  const wrap = (body) => <div data-testid="work-screen" style={{ position: "absolute", inset: 0, zIndex: 80, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody, overflow: "hidden" }}>{body}</div>;
  const locate = async () => { setBusy("place"); try { const w = await workLocate(); setWhere(w); setBusy(""); return w; } catch (e) { setBusy(""); onToast(e.message); return null; } };
  const pickKm = async (k) => { if (!k) { setKm(0); return; } const w = where || await locate(); if (w) setKm(k); };

  useEffectH47(() => {
    if (at !== "find") return undefined;
    let live = true; setRows(null);
    const t = setTimeout(() => { (tab === "people" ? workApi.people(q.trim(), km, where).then((r) => r.people || []) : workApi.openings(q.trim(), km, where).then((r) => r.openings || [])).then((x) => { if (live) setRows(x); }).catch(() => { if (live) setRows({ error: true }); }); }, q ? 350 : 0);
    return () => { live = false; clearTimeout(t); };
  }, [at, tab, q, km, where]);

  if (at === "card" && who) {
    return wrap(<>
      {top(who.person.name, "Real person on GLOOBAL", () => setAt("find"))}
      <div data-testid="work-card" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 30px", display: "flex", flexDirection: "column", gap: 12 }}>
        <WorkCardBody c={who} />
        <HellooPrimary Icon={HlChat} onClick={() => onChat(who.person, "")}>Message</HellooPrimary>
      </div>
    </>);
  }
  if (at === "mine") return wrap(<WorkEdit top={top} back={back("mine")} where={where} locate={locate} busy={busy} onToast={onToast} onSaved={() => { onChanged(); if (start === "mine") onClose(); else setAt("find"); }} />);
  if (at === "post") return wrap(<WorkPost top={top} back={back("post")} where={where} locate={locate} busy={busy} shopName={shopName} onToast={onToast} onPosted={() => { onChanged(); if (start === "post") onClose(); else { setTab("openings"); setAt("find"); } }} />);

  const list = Array.isArray(rows) ? rows : [];
  return wrap(<>
    {top("Work near you", "", onClose)}
    <div style={{ padding: "0 16px 8px", flexShrink: 0 }}><label style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999, padding: "10px 14px" }}><WxFind size={17} color={T.inkFaint} /><input value={q} onChange={(e) => setQ(e.target.value.slice(0, 40))} data-testid="work-q" aria-label="Skill" placeholder="A skill: mason, React, tailor…" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: T.fontBody }} />{q ? <button onClick={() => setQ("")} aria-label="Clear" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><WxX size={16} color={T.inkFaint} /></button> : null}</label></div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", padding: "0 16px 10px", scrollbarWidth: "none", flexShrink: 0 }}><WxPin size={16} color={T.accent} style={{ flexShrink: 0 }} />{WORK_KM.map((k) => <WorkChip key={k} on={km === k} disabled={busy === "place"} onClick={() => pickKm(k)} testid={`work-km-${k}`}>{k} km</WorkChip>)}<WorkChip on={!km} onClick={() => pickKm(0)} testid="work-km-0">Anywhere</WorkChip></div>
    <div style={{ display: "flex", background: T.surfaceAlt, borderRadius: 14, padding: 4, margin: "0 16px 10px", flexShrink: 0 }}>{[["people", "People"], ["openings", "Openings"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} data-testid={`work-tab-${k}`} aria-pressed={tab === k} className="v2-tap" style={{ flex: 1, height: 38, borderRadius: 11, border: "none", background: tab === k ? (HT.cardBg || T.surface) : "none", boxShadow: tab === k ? T.shadowCard : "none", color: tab === k ? T.ink : T.inkSoft, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{l}</button>)}</div>
    <div data-testid="work-find-list" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "2px 16px 30px", display: "flex", flexDirection: "column", gap: 10 }}>
      {rows === null ? <WorkNote title={busy === "place" ? "Finding where you are…" : "Loading…"} /> : rows.error ? <WorkNote title="Couldn't load" text="Check your connection and try again." />
        : !list.length ? <WorkNote title={tab === "people" ? "Nobody found yet" : "No openings yet"} text={km ? "Try a wider distance or another skill." : "Try another skill."} />
        : tab === "people" ? list.map((c, i) => <button key={c.person.accountId + i} data-testid="work-person" onClick={() => { setWho(c); setAt("card"); }} className="v2-tap" style={{ ...workCardStyle(), display: "flex", alignItems: "center", gap: 12, padding: 12, border: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, width: "100%" }}><SocialFace card={c.person} photos={photos} size={44} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, ...workOne }}>{c.person.name}</span><WxReal size={15} color={HT.free} style={{ flexShrink: 0 }} /></span><span style={{ display: "block", fontSize: 12.5, color: T.inkSoft, marginTop: 2, ...workOne }}>{c.title}</span>{c.status === "open" ? <span style={{ display: "block", marginTop: 4 }}><WorkStatus k="open" small /></span> : null}</span><span style={{ flexShrink: 0, textAlign: "right" }}><span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: c.rate ? T.ink : T.inkSoft, whiteSpace: "nowrap" }}>{c.rate || "Discuss"}</span>{c.km !== null && c.km !== undefined ? <span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{c.km} km</span> : null}</span></button>)
        : list.map((o) => <WorkOpening key={o.id} o={o} photos={photos} onApply={() => setApply(o)} />)}
    </div>
    {apply ? <WorkApplySheet o={apply} onClose={() => setApply(null)} onSent={(id) => setRows((r) => (Array.isArray(r) ? r.map((x) => (x.id === id ? Object.assign({}, x, { sent: true }) : x)) : r))} onToast={onToast} onChat={onChat} /> : null}
  </>);
}

function WorkPlace({ where, locate, busy }) {
  return <button onClick={locate} disabled={busy === "place"} data-testid="work-locate" className="v2-tap" style={{ ...workCardStyle(), borderRadius: 14, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginTop: 8, width: "100%", border: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><WxLocate size={18} color={where ? HT.free : T.accent} style={{ flexShrink: 0 }} /><span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, color: T.ink }}>{where ? "Location added" : busy === "place" ? "Finding where you are…" : "Add my location"}</span><span style={{ fontSize: 11.5, color: T.inkSoft, flexShrink: 0 }}>for distance</span></button>;
}
function WorkEdit({ top, back, where, locate, busy, onToast, onSaved }) {
  const [c, setC] = useStateH47(null);
  const [rateOn, setRateOn] = useStateH47(false);
  const [saving, setSaving] = useStateH47(false);
  const [err, setErr] = useStateH47("");
  useEffectH47(() => { workApi.me().then((r) => { const k = r.card || {}; setC({ shown: k.shown, status: k.status || "", title: k.title || "", skills: (k.skills || []).join(", "), years: k.years ? String(k.years) : "", area: k.area || "", rate: k.rate || "" }); setRateOn(Boolean(k.rate)); }).catch(() => setErr("Couldn't load your card.")); }, []);
  const set = (patch) => setC((v) => Object.assign({}, v, patch));
  const save = async () => {
    setErr("");
    if (!c.title.trim()) { setErr("Say what you do."); return; }
    setSaving(true);
    try {
      await workApi.save(Object.assign({ status: c.status, title: c.title.trim(), skills: c.skills, years: Number(c.years) || 0, area: c.area.trim(), rate: rateOn ? c.rate.trim() : "", shown: c.shown === undefined || c.shown === false ? true : c.shown }, where ? { lat: where.lat, lng: where.lng } : {}));
      onToast("Saved · your Work card is shown"); onSaved();
    } catch (e) { setErr((e && e.message) || "Couldn't save. Try again."); setSaving(false); }
  };
  return <>{top("Edit Work", "", back)}
    <div data-testid="work-mine" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
      {!c ? <WorkNote title={err || "Loading…"} /> : <>
        <div>{workLabel("Right now")}<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{[["open", "Open to work"], ["hiring", "Hiring"], ["team", "Building a team"], ["", "None"]].map(([k, l]) => <WorkChip key={k || "none"} on={c.status === k} onClick={() => set({ status: k })} testid={`work-status-${k || "none"}`}>{l}</WorkChip>)}</div></div>
        <div>{workLabel("What I do")}<input value={c.title} onChange={(e) => set({ title: e.target.value.slice(0, 60) })} placeholder="Software engineer, Mason, Tailor…" data-testid="work-title" style={workField()} /></div>
        <div>{workLabel("Skills, with commas")}<input value={c.skills} onChange={(e) => set({ skills: e.target.value.slice(0, 200) })} placeholder="React, Node.js, Payments" data-testid="work-skills" style={workField()} /></div>
        <div style={{ display: "flex", gap: 10 }}><div style={{ width: 96, flexShrink: 0 }}>{workLabel("Years")}<input value={c.years} onChange={(e) => set({ years: e.target.value.replace(/\D/g, "").slice(0, 2) })} inputMode="numeric" placeholder="0" data-testid="work-years" style={workField()} /></div><div style={{ flex: 1, minWidth: 0 }}>{workLabel("Area")}<input value={c.area} onChange={(e) => set({ area: e.target.value.slice(0, 60) })} placeholder="Scheme 2, Alwar" data-testid="work-area" style={workField()} /></div></div>
        <WorkPlace where={where} locate={locate} busy={busy} />
        <div>{workLabel("Rate")}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><WorkChip on={rateOn} onClick={() => setRateOn(true)} testid="work-rate-show">Show</WorkChip><WorkChip on={!rateOn} onClick={() => setRateOn(false)} testid="work-rate-discuss">Discuss</WorkChip></div>{rateOn ? <input value={c.rate} onChange={(e) => set({ rate: e.target.value.slice(0, 40) })} placeholder="₹3,000 / day" data-testid="work-rate" style={Object.assign(workField(), { marginTop: 8 })} /> : null}</div>
        {err ? <div role="alert" style={{ color: T.negative, fontSize: 13, fontWeight: 700 }}>{err}</div> : null}
        <HellooPrimary onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</HellooPrimary>
        <div style={{ fontSize: 12, color: T.inkSoft, textAlign: "center", lineHeight: 1.45 }}>Only your area is shown, never your address. GLOOBAL only connects people · 0%</div>
      </>}
    </div>
  </>;
}
function WorkPost({ top, back, where, locate, busy, shopName, onToast, onPosted }) {
  const [kind, setKind] = useStateH47(shopName ? "hiring" : "team");
  const [title, setTitle] = useStateH47("");
  const [skills, setSkills] = useStateH47("");
  const [payOn, setPayOn] = useStateH47(false);
  const [pay, setPay] = useStateH47("");
  const [area, setArea] = useStateH47("");
  const [saving, setSaving] = useStateH47(false);
  const [err, setErr] = useStateH47("");
  const post = async () => {
    setErr("");
    if (title.trim().length < 4) { setErr("Say what you need."); return; }
    setSaving(true);
    try { await workApi.post(Object.assign({ kind, title: title.trim(), skills, pay: payOn ? pay.trim() : "", area: area.trim() }, where ? { lat: where.lat, lng: where.lng } : {})); onToast("Posted · open for 30 days"); onPosted(); }
    catch (e) { setErr((e && e.message) || "Couldn't post. Try again."); setSaving(false); }
  };
  return <>{top("Post an opening", shopName ? `As ${shopName}` : "", back)}
    <div data-testid="work-post" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
      {shopName ? null : <div>{workLabel("This is")}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><WorkChip on={kind === "team"} onClick={() => setKind("team")}>Building a team</WorkChip><WorkChip on={kind === "hiring"} onClick={() => setKind("hiring")}>Hiring</WorkChip></div></div>}
      <div>{workLabel("What do you need?")}<input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 100))} placeholder="2 React developers for a payments app" data-testid="work-post-title" style={workField()} /></div>
      <div>{workLabel("Skills, with commas")}<input value={skills} onChange={(e) => setSkills(e.target.value.slice(0, 200))} placeholder="React, Figma" data-testid="work-post-skills" style={workField()} /></div>
      <div>{workLabel("Pay")}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><WorkChip on={payOn} onClick={() => setPayOn(true)} testid="work-pay-show">Show</WorkChip><WorkChip on={!payOn} onClick={() => setPayOn(false)} testid="work-pay-discuss">Discuss</WorkChip></div>{payOn ? <input value={pay} onChange={(e) => setPay(e.target.value.slice(0, 40))} placeholder="₹9,000 / month" data-testid="work-pay" style={Object.assign(workField(), { marginTop: 8 })} /> : null}</div>
      <div>{workLabel("Area")}<input value={area} onChange={(e) => setArea(e.target.value.slice(0, 60))} placeholder="Scheme 2, Alwar" data-testid="work-post-area" style={workField()} /><WorkPlace where={where} locate={locate} busy={busy} /></div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 16, background: "#FEF3C7" }}><WxWarn size={18} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.45 }}>An opening may not ask people for any fee or deposit. It stays up for 30 days.</span></div>
      {err ? <div role="alert" data-testid="work-post-error" style={{ color: T.negative, fontSize: 13, fontWeight: 700 }}>{err}</div> : null}
      <HellooPrimary onClick={post} disabled={saving}>{saving ? "Posting…" : "Post"}</HellooPrimary>
    </div>
  </>;
}
