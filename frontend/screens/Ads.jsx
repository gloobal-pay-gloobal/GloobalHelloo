// frontend/screens/Ads.jsx
//
// GLOOBAL Ads & Earn inside Helloo. A person sets the price they want for
// watching one ad in full and picks what they want ads about; watching one
// to the end pays them that price, straight from the advertiser's GLOOBAL
// balance. An advertiser sets the most they pay for a full view and a
// budget, and approves it once with their GLOOBAL PIN. GLOOBAL keeps none
// of it and holds none of it (server: lib/ads.js).
import { useState as useStateH43, useEffect as useEffectH43, useRef as useRefH43, useCallback as useCallbackH43 } from "react";
import { Coins as AxCoins, ThumbsUp as AxYes, ThumbsDown as AxNo, Megaphone as AxHorn, Pause as AxPause, CircleStop as AxStop } from "lucide-react";

var adsTz = () => -new Date().getTimezoneOffset();
// Where you are, to about a hundred metres — sent with a request so it can
// be answered, never stored.
var adsWhere = (w) => (w ? `&lat=${w.lat.toFixed(3)}&lng=${w.lng.toFixed(3)}` : "");
var ADS_NEAR_KEY = "helloo.ads.near";
function adsLocate() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { reject(new Error("This phone can't share where it is.")); return; }
    navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), () => reject(new Error("Allow location for Helloo to use this.")), { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  });
}
var adsApi = {
  me: () => gloobalApiClient.get(`/api/ads/me?tz=${adsTz()}`),
  prefs: (body) => gloobalApiClient.put("/api/ads/prefs", body),
  next: (topic, where) => gloobalApiClient.get(`/api/ads/next?tz=${adsTz()}${topic ? `&topic=${topic}` : ""}${adsWhere(where)}`),
  start: (id, where) => gloobalApiClient.post(`/api/ads/${encodeURIComponent(id)}/start?tz=${adsTz()}${adsWhere(where)}`, {}),
  claim: (id, skip) => gloobalApiClient.post(`/api/ads/${encodeURIComponent(id)}/claim`, skip ? { skip: true } : {}, { timeoutMs: GLOOBAL_API_COLD_START_TIMEOUT_MS }),
  feel: (id, liked) => gloobalApiClient.post(`/api/ads/${encodeURIComponent(id)}/feel`, { liked }),
  campaigns: () => gloobalApiClient.get("/api/ads/campaigns"),
  audience: (km, place, topics) => gloobalApiClient.get(`/api/ads/audience?km=${km && place ? km : 0}${km && place ? `&lat=${place.lat}&lng=${place.lng}` : ""}&topics=${encodeURIComponent((topics || []).join(","))}`),
  create: (body) => gloobalApiClient.post("/api/ads/campaigns", body, { timeoutMs: GLOOBAL_API_COLD_START_TIMEOUT_MS }),
  change: (id, action) => gloobalApiClient.post(`/api/ads/campaigns/${encodeURIComponent(id)}`, { action }),
  // The ad's picture or video rides the same upload as a post's.
  upload: (data) => gloobalApiClient.post("/api/social/media", { data }, { timeoutMs: 120e3 })
};
var ADS_TOPICS = { food: ["🍛", "Food"], travel: ["✈️", "Travel"], transport: ["🚌", "Transport"], phones: ["📱", "Phones"], classes: ["📚", "Classes"], fashion: ["👗", "Fashion"], sports: ["🏏", "Sports"], money: ["🏦", "Money"], games: ["🎮", "Games"], home: ["🏠", "Home"], health: ["💊", "Health"] };
function adsTopic(k) { return ADS_TOPICS[k] || ["🏷️", k]; }
function adsSrc(m) { return m && m.url ? `${GLOOBAL_API_BASE}${m.url}` : ""; }
function adsCard(card, photos) { return card && card.accountId ? hellooPersonFrom(card, photos) : { name: "Advertiser" }; }

function AdsChip({ on, children, onClick, testId }) {
  return <button onClick={onClick} aria-pressed={on} data-testid={testId} className="v2-tap" style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 14, border: "none", background: on ? T.accentSoft : T.surfaceAlt, color: on ? T.accent : T.inkSoft, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}>{children}</button>;
}
// A price from 0.10 to 7.00 in steps of 0.10.
function AdsPrice({ value, min = 0.1, max = 7, onChange, onDone, testId }) {
  return <input type="range" min={min} max={max} step={0.1} value={value} data-testid={testId} onChange={(e) => onChange(Math.round(Number(e.target.value) * 10) / 10)} onPointerUp={onDone} onKeyUp={onDone} onTouchEnd={onDone} style={{ width: "100%", accentColor: T.accent, height: 32, margin: "6px 0 0" }} />;
}

// ── The Ads & Earn tab ──────────────────────────────────────────────────
function HellooAdsHome({ me, photos, onCards, onToast, onReceipt }) {
  const [my, setMy] = useStateH43(null);
  const [err, setErr] = useStateH43("");
  const [price, setPrice] = useStateH43(0.5);
  const [browse, setBrowse] = useStateH43("");
  const [next, setNext] = useStateH43(undefined); // undefined: asking · { ad, why }
  const [watch, setWatch] = useStateH43(null);
  const [mine, setMine] = useStateH43(false);
  // Where you are, while "Ads near me" is on: kept on this screen only.
  const [where, setWhere] = useStateH43(null);
  const [nearBusy, setNearBusy] = useStateH43(false);
  const whereRef = useRefH43(null);
  const nearOn = (quiet) => { setNearBusy(true); adsLocate().then((w) => { whereRef.current = w; setWhere(w); try { localStorage.setItem(ADS_NEAR_KEY, "1"); } catch (e) { /* private window */ } }).catch((e) => { if (!quiet) onToast(e.message); }).then(() => setNearBusy(false)); };
  const nearOff = () => { whereRef.current = null; setWhere(null); try { localStorage.removeItem(ADS_NEAR_KEY); } catch (e) { /* private window */ } };
  useEffectH43(() => { let on = false; try { on = localStorage.getItem(ADS_NEAR_KEY) === "1"; } catch (e) { /* private window */ } if (on) nearOn(true); }, []);
  const load = useCallbackH43(() => {
    setErr("");
    adsApi.me().then((r) => { setMy(r); setPrice(r.price); if (onCards) onCards((r.rows || []).map((x) => x.advertiser).filter(Boolean)); }).catch((e) => setErr((e && e.message) || "Couldn't load Ads & Earn."));
  }, []);
  const ask = useCallbackH43((topic) => {
    setNext(undefined);
    adsApi.next(topic, whereRef.current).then((r) => { setNext({ ad: r.ad, why: r.why }); if (r.ad && onCards) onCards([r.ad.advertiser]); }).catch(() => setNext({ ad: null, why: "error" }));
  }, []);
  useEffectH43(() => { load(); }, [load]);
  useEffectH43(() => { ask(browse); }, [browse, ask, where]);
  const savePrice = () => { if (!my || price === my.price) return; adsApi.prefs({ price }).then((r) => { setMy((m) => Object.assign({}, m, { price: r.price })); ask(browse); }).catch((e) => onToast((e && e.message) || "Couldn't save your price.")); };
  const toggleTopic = (k) => { const topics = my.topics.includes(k) ? my.topics.filter((t) => t !== k) : [...my.topics, k]; setMy((m) => Object.assign({}, m, { topics })); adsApi.prefs({ topics }).then(() => ask(browse)).catch(() => onToast("Couldn't save that.")); };
  const sign = my ? hellooCelSign(my.currency) : "";
  const money = (n) => hellooMoneyText(n, my && my.currency);

  if (!my) return <HellooScreen><HellooTop big title="Ads & Earn" /><div style={{ padding: "30px 24px", textAlign: "center", color: err ? T.negative : T.inkFaint, fontSize: 13.5, fontWeight: 700 }}>{err || "Loading…"}{err ? <div style={{ marginTop: 14 }}><HellooSecondary onClick={load}>Try again</HellooSecondary></div> : null}</div></HellooScreen>;

  const pct = Math.min(1, my.today.count / Math.max(1, my.today.cap));
  const R = 54, C = 2 * Math.PI * R;
  const ad = next && next.ad;
  const capped = next && next.why === "cap";
  return <HellooScreen><div data-testid="ads-home" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "block" }}>
    <HellooTop big title="Ads & Earn" right={<button onClick={() => setMine(true)} data-testid="ads-advertise" className="v2-tap" style={{ height: 38, padding: "0 14px", borderRadius: 999, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, color: T.ink, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}><AxHorn size={16} color={T.accent} />Advertise</button>} />
    <div style={{ padding: "0 16px 140px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 28, padding: "18px", background: "radial-gradient(120% 120% at 0% 0%, #34D399 0%, #059669 45%, #064E3B 100%)", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}><svg width="128" height="128" viewBox="0 0 128 128" style={{ flexShrink: 0 }}><circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="11" /><circle cx="64" cy="64" r={R} fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 64 64)" /><text x="64" y="62" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{my.today.count}</text><text x="64" y="82" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="700">of {my.today.cap} today</text></svg><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 12.5, opacity: 0.85 }}>Earned today</span><span data-testid="ads-earned" style={{ display: "block", fontSize: 28, fontWeight: 800, fontFamily: T.fontDisplay, lineHeight: 1.1, marginTop: 2, whiteSpace: "nowrap" }}>+{hellooCelAmount(my.today.earned)}</span><span style={{ display: "block", fontSize: 13, fontWeight: 800, opacity: 0.9 }}>CEL | {sign}</span><span style={{ display: "block", fontSize: 12, opacity: 0.85, marginTop: 8, whiteSpace: "nowrap" }}>Last 30 days +{hellooCelAmount(my.month)}</span></span></div>

      <button onClick={() => (where ? nearOff() : nearOn(false))} role="switch" aria-checked={Boolean(where)} data-testid="ads-near" className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 18, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 38, height: 38, borderRadius: 13, background: where ? T.accentSoft : T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HlPin size={18} color={where ? T.accent : T.inkSoft} /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink }}>Ads near me</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>{nearBusy ? "Finding where you are…" : where ? "On · shops around you can reach you" : "Off · turn on for the chai stall down the road"}</span></span><span style={{ width: 44, height: 26, borderRadius: 13, background: where ? T.accent : T.line, position: "relative", flexShrink: 0, transition: "background 0.15s ease" }}><span style={{ position: "absolute", top: 3, left: where ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.15s ease" }} /></span></button>

      <div><div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, margin: "0 2px 8px" }}>What do you want to watch?</div><div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", margin: "0 -16px", padding: "0 16px" }}><AdsChip on={!browse} onClick={() => setBrowse("")} testId="ads-browse-all">All</AdsChip>{(my.allTopics || []).map((k) => <AdsChip key={k} on={browse === k} onClick={() => setBrowse(browse === k ? "" : k)} testId={`ads-browse-${k}`}>{adsTopic(k)[0]} {adsTopic(k)[1]}</AdsChip>)}</div></div>

      {next === undefined ? <HellooCard style={{ padding: 18, textAlign: "center", color: T.inkFaint, fontSize: 13, fontWeight: 700 }}>Finding an ad…</HellooCard>
        : ad ? <button onClick={() => setWatch(ad)} data-testid="ads-watch" className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 22, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ position: "relative", width: 76, height: 96, borderRadius: 16, overflow: "hidden", background: T.surfaceAlt, flexShrink: 0 }}>{ad.media.kind === "video" ? <video src={adsSrc(ad.media) + "#t=0.1"} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={adsSrc(ad.media)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}<span style={{ position: "absolute", left: 6, top: 6, fontSize: 9.5, fontWeight: 800, background: "#FACC15", color: "#111", borderRadius: 5, padding: "2px 5px" }}>AD</span></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ad.title}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adsCard(ad.advertiser, photos).handle || adsCard(ad.advertiser, photos).name} · {ad.seconds} sec{ad.nearKm ? " · near you" : ""}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, height: 36, padding: "0 14px", borderRadius: 999, background: T.gradButton, color: HT.onAccent || "#fff", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap" }}><HlPlay size={15} color={HT.onAccent || "#fff"} />Watch · +{money(ad.price)}</span></span></button>
        : <HellooCard style={{ padding: "18px 16px", textAlign: "center" }}><div data-testid="ads-none" style={{ fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{capped ? `That's today's ${my.today.cap} ads` : browse ? `No ${adsTopic(browse)[1].toLowerCase()} ads right now` : "No ads for you right now"}</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 5, lineHeight: 1.45 }}>{capped ? "More tomorrow." : next && next.why === "error" ? "Check your connection and try again." : browse ? "Try All, or another category." : "A lower price shows you more ads. New ones arrive through the day."}</div></HellooCard>}

      <HellooCard style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}><span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>My price per ad</span><span data-testid="ads-price" style={{ fontSize: 19, fontWeight: 800, color: T.accent, whiteSpace: "nowrap" }}>{money(price)}</span></div><AdsPrice value={price} min={my.priceMin} max={my.priceMax} onChange={setPrice} onDone={savePrice} testId="ads-price-slider" /><div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6, lineHeight: 1.45 }}>Lower price, more ads. Higher price, fewer ads that pay more. You are paid this for every ad you watch to the end, and part of it if you skip.</div></HellooCard>

      <HellooCard style={{ padding: 16 }}><div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Show me ads about</div><div style={{ fontSize: 12, color: T.inkSoft, margin: "3px 0 10px" }}>{my.topics.length ? "Only these, and ads for everyone." : "Nothing picked: you see every kind."}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(my.allTopics || []).map((k) => <AdsChip key={k} on={my.topics.includes(k)} onClick={() => toggleTopic(k)} testId={`ads-topic-${k}`}>{adsTopic(k)[0]} {adsTopic(k)[1]}</AdsChip>)}</div></HellooCard>

      {my.rows.length ? <HellooCard style={{ padding: 0 }}><div style={{ padding: "12px 16px 4px", fontSize: 15, fontWeight: 800, color: T.ink }}>Today</div>{my.rows.map((r, i) => <button key={i} onClick={() => r.referenceId && onReceipt && onReceipt(r.referenceId)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", border: "none", borderTop: `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><HellooAvatar person={adsCard(r.advertiser, photos)} size={38} flag={false} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft }}>{r.full === false ? "Watched part" : "Watched in full"} · {hellooWhen(r.at)}</span></span><span style={{ fontSize: 14, fontWeight: 800, color: HT.free, whiteSpace: "nowrap" }}>+{hellooCelAmount(r.price)}</span></button>)}</HellooCard> : null}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: T.inkSoft, textAlign: "center", lineHeight: 1.4 }}><HlShield size={13} color={T.inkSoft} style={{ flexShrink: 0 }} />Paid straight from the advertiser · they never see who you are</div>
    </div></div>
    {watch ? <AdsWatch ad={watch} where={where} photos={photos} money={money} onClose={(paid) => { setWatch(null); if (paid) load(); ask(browse); }} onNext={() => { setWatch(null); load(); ask(browse); }} onToast={onToast} /> : null}
    {mine ? <AdsAdvertiser me={me} onBack={() => setMine(false)} onToast={onToast} /> : null}
  </HellooScreen>;
}

// ── Watching one ad ─────────────────────────────────────────────────────
function AdsWatch({ ad, where, photos, money, onClose, onNext, onToast }) {
  const [state, setState] = useStateH43("starting"); // starting · playing · paying · paid · failed
  const [left, setLeft] = useStateH43(ad.seconds);
  const [note, setNote] = useStateH43("");
  const [felt, setFelt] = useStateH43(null);
  const video = useRefH43(null);
  // What the server paid: { amount, full } — a skip pays for the seconds watched.
  const [got, setGot] = useStateH43(null);
  const total = useRefH43(ad.seconds);
  const claim = useCallbackH43((skip) => {
    setState("paying");
    adsApi.claim(ad.id, skip === true).then((r) => { setGot({ amount: Number(r.amount) || 0, full: Boolean(r.full) }); setState(r.paid ? "paid" : "skipped"); }).catch((e) => {
      const b = (e && e.body) || {};
      if (b.code === "too_soon") { setLeft(Math.max(1, Number(b.left) || 2)); setState("playing"); return; }
      setNote(b.message || (e && e.message) || "The payment did not go through.");
      setState(b.code === "try_again" ? "retry" : "failed");
    });
  }, [ad.id]);
  useEffectH43(() => {
    let gone = false;
    adsApi.start(ad.id, where).then((r) => { if (gone) return; total.current = r.seconds; setLeft(r.seconds); setState("playing"); const v = video.current; if (v) v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); })
      .catch((e) => { if (!gone) { setNote((e && e.message) || "That ad is not running any more."); setState("failed"); } });
    return () => { gone = true; };
  }, [ad.id]);
  // The count runs only while the ad is on screen.
  useEffectH43(() => {
    if (state !== "playing") return undefined;
    const t = setInterval(() => { if (typeof document !== "undefined" && document.hidden) return; setLeft((n) => Math.max(0, n - 1)); }, 1000);
    return () => clearInterval(t);
  }, [state]);
  useEffectH43(() => { if (state === "playing" && left <= 0) claim(false); }, [left, state, claim]);
  const who = adsCard(ad.advertiser, photos);
  const frac = 1 - Math.max(0, left) / Math.max(1, ad.seconds);
  const done = state === "paid" || state === "failed" || state === "skipped";
  const soFar = Math.floor(ad.price * (Math.max(0, total.current - left) / Math.max(1, total.current)) * 100 + 1e-6) / 100;
  const feel = (liked) => { setFelt(liked); adsApi.feel(ad.id, liked).catch(() => {}); };
  return <div data-testid="ads-watching" style={{ position: "absolute", inset: 0, zIndex: 90, background: "#000", color: "#fff", overflow: "hidden", fontFamily: T.fontBody }}>
    {ad.media.kind === "video" ? <video ref={video} src={adsSrc(ad.media)} playsInline loop style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <img src={adsSrc(ad.media)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 22%, transparent 50%, rgba(0,0,0,0.78))", pointerEvents: "none" }} />
    <div style={{ position: "absolute", left: 16, right: 16, top: "calc(14px + env(safe-area-inset-top, 0px))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}><span style={{ fontSize: 11, fontWeight: 800, background: "#FACC15", color: "#111", borderRadius: 6, padding: "3px 7px", flexShrink: 0 }}>AD</span><span style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{who.handle || who.name}</span></span>{done ? <button onClick={() => onClose(state !== "failed")} aria-label="Close" className="v2-tap" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><HlX size={19} color="#fff" /></button> : <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}><circle cx="22" cy="22" r="18" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.3)" strokeWidth="4" /><circle cx="22" cy="22" r="18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${113 * frac} 113`} transform="rotate(-90 22 22)" /><text x="22" y="26.5" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">{Math.max(0, left)}</text></svg>}</div>
    <div style={{ position: "absolute", left: 16, right: 16, top: "calc(72px + env(safe-area-inset-top, 0px))", fontSize: 22, fontWeight: 800, lineHeight: 1.25, textShadow: "0 2px 12px rgba(0,0,0,0.5)", overflowWrap: "anywhere" }}>{ad.title}</div>
    <div style={{ position: "absolute", left: 14, right: 14, bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", borderRadius: 24, background: "rgba(255,255,255,0.97)", color: "#111", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 42, height: 42, borderRadius: 14, background: state === "failed" ? "#FEE2E2" : "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AxCoins size={21} color={state === "failed" ? "#DC2626" : "#059669"} /></span><span style={{ flex: 1, minWidth: 0 }}><span data-testid="ads-watch-line" style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{state === "paid" ? `+${money(got ? got.amount : ad.price)} received` : state === "skipped" ? "Skipped" : state === "failed" ? "This one did not pay" : state === "retry" ? "Almost there" : state === "paying" ? "Paying you…" : `+${money(ad.price)} in ${Math.max(0, left)} sec`}</span><span style={{ display: "block", fontSize: 12, color: "#4B5563", lineHeight: 1.4 }}>{state === "paid" ? (got && !got.full ? "For the part you watched. In your GLOOBAL balance now." : "In your GLOOBAL balance now.") : state === "skipped" ? "Too early to earn anything. No harm done." : state === "failed" || state === "retry" ? note : state === "paying" ? "From the advertiser to you." : `Skip any time · +${hellooCelAmount(soFar)} so far`}</span></span></div>
      {state === "paid" ? <><div style={{ display: "flex", gap: 8, marginTop: 12 }}>{[[true, AxYes, "Interested", "#059669"], [false, AxNo, "Not for me", "#6B7280"]].map(([v, I, l, c]) => <button key={l} onClick={() => feel(v)} aria-pressed={felt === v} className="v2-tap" style={{ flex: 1, height: 42, borderRadius: 14, border: "none", background: felt === v ? "#111" : "#F3F4F6", color: felt === v ? "#fff" : "#111", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}><I size={16} color={felt === v ? "#fff" : c} />{l}</button>)}</div><button onClick={onNext} data-testid="ads-next" className="v2-tap" style={{ width: "100%", height: 46, marginTop: 8, borderRadius: 14, border: "none", background: "#059669", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Next ad</button></> : null}
      {state === "playing" ? <button onClick={() => claim(true)} data-testid="ads-skip" className="v2-tap" style={{ width: "100%", height: 42, marginTop: 12, borderRadius: 14, border: "none", background: "#F3F4F6", color: "#111", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Skip{soFar >= 0.01 ? ` · keep +${hellooCelAmount(soFar)}` : ""}</button> : null}
      {state === "skipped" ? <button onClick={onNext} className="v2-tap" style={{ width: "100%", height: 46, marginTop: 12, borderRadius: 14, border: "none", background: "#111", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Next ad</button> : null}
      {state === "retry" ? <button onClick={() => claim(false)} className="v2-tap" style={{ width: "100%", height: 46, marginTop: 12, borderRadius: 14, border: "none", background: "#111", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Try again</button> : null}
      {state === "failed" ? <button onClick={() => onClose(false)} className="v2-tap" style={{ width: "100%", height: 46, marginTop: 12, borderRadius: 14, border: "none", background: "#111", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Back</button> : null}
    </div>
  </div>;
}

// ── The advertiser's side ───────────────────────────────────────────────
function AdsAdvertiser({ me, onBack, onToast }) {
  const [data, setData] = useStateH43(null);
  const [making, setMaking] = useStateH43(false);
  const load = useCallbackH43(() => adsApi.campaigns().then(setData).catch((e) => onToast((e && e.message) || "Couldn't load your ads.")), []);
  useEffectH43(() => { load(); }, [load]);
  const change = (c, action) => adsApi.change(c.id, action).then(load).catch((e) => onToast((e && e.message) || "Couldn't change that."));
  const money = (n) => hellooMoneyText(n, data && data.currency);
  const tone = (c) => (c.status === "active" ? [HT.free, HT.freeSoft, "Running"] : c.status === "paused" ? ["#B45309", "#FEF3C7", c.stopReason === "short" ? "Stopped · balance short" : "Paused"] : [T.inkSoft, T.surfaceAlt, c.stopReason === "done" ? "Finished · budget used" : "Ended"]);
  return <div data-testid="ads-advertiser" style={{ position: "absolute", inset: 0, zIndex: 85, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <HellooTop left={<HellooRoundButton Icon={HlBack} label="Back" onClick={onBack} size={38} />} title="My ads" subtitle="You pay only for the time people watch" />
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "flex", flexDirection: "column", gap: 12 }}>
      <HellooPrimary Icon={AxHorn} onClick={() => setMaking(true)}>New ad</HellooPrimary>
      {!data ? <HellooCard style={{ padding: 18, textAlign: "center", color: T.inkFaint, fontSize: 13, fontWeight: 700 }}>Loading…</HellooCard> : data.campaigns.length === 0 ? <HellooCard style={{ padding: "18px 16px", textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>No ads yet</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 5, lineHeight: 1.45 }}>Show a picture or a short video to real GLOOBAL people. Each one who watches is paid by you, directly: the full price to the end, less if they skip.</div></HellooCard>
        : data.campaigns.map((c) => { const [fg, bg, label] = tone(c); const used = Math.min(1, c.spent / Math.max(0.01, c.budget)); return <HellooCard key={c.id} style={{ padding: 14 }}><div data-testid="ads-campaign" style={{ display: "flex", gap: 12 }}><span style={{ width: 62, height: 80, borderRadius: 14, overflow: "hidden", background: T.surfaceAlt, flexShrink: 0 }}>{c.media.kind === "video" ? <video src={adsSrc(c.media) + "#t=0.1"} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={adsSrc(c.media)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span><span style={{ display: "inline-block", marginTop: 4, fontSize: 11.5, fontWeight: 800, color: fg, background: bg, borderRadius: 999, padding: "3px 9px" }}>{label}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 6 }}>{c.views} {c.views === 1 ? "view" : "views"} · {c.fullViews || 0} to the end · up to {money(c.maxPerView)} each{c.nearKm ? ` · within ${c.nearKm} km` : ""}</span></span></div>
          <div style={{ height: 6, borderRadius: 3, background: T.surfaceAlt, marginTop: 12, overflow: "hidden" }}><div style={{ width: `${used * 100}%`, height: "100%", background: T.accent }} /></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.inkSoft, marginTop: 5, gap: 8 }}><span style={{ whiteSpace: "nowrap" }}>Spent {money(c.spent)}</span><span style={{ whiteSpace: "nowrap" }}>of {money(c.budget)}</span></div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: T.inkSoft, marginTop: 8 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AxYes size={13} color={HT.free} />{c.interested} interested</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AxNo size={13} color={T.inkSoft} />{c.notForMe} not for me</span></div>
          {c.status !== "ended" ? <div style={{ display: "flex", gap: 8, marginTop: 12 }}>{c.status === "active" ? <HellooSecondary Icon={AxPause} onClick={() => change(c, "pause")}>Pause</HellooSecondary> : <HellooSecondary Icon={HlPlay} onClick={() => change(c, "resume")}>Start again</HellooSecondary>}<HellooSecondary Icon={AxStop} onClick={() => change(c, "end")}>End</HellooSecondary></div> : null}</HellooCard>; })}
      <div style={{ fontSize: 11.5, color: T.inkFaint, lineHeight: 1.5, padding: "0 4px" }}>The money stays in your GLOOBAL balance until someone watches. To the end pays their own price, never more than yours; a skip pays only for the seconds watched. You see views and interest, never who watched.</div>
    </div>
    {making && data ? <AdsNew limits={data} money={money} onClose={() => setMaking(false)} onMade={() => { setMaking(false); load(); onToast("Your ad is running"); }} /> : null}
  </div>;
}

// Before the price: how many people this ad would reach and what they ask.
// A crowd only — the server gives no prices below five people.
function AdsCrowd({ crowd, km, money, max, limits, onPick }) {
  const box = { borderRadius: 16, background: T.surfaceAlt, padding: 12, marginBottom: 12 };
  if (!crowd) return <div data-testid="ads-crowd" style={Object.assign({}, box, { fontSize: 12.5, color: T.inkSoft })}>Counting who is there…</div>;
  if (crowd.error) return <div data-testid="ads-crowd" style={Object.assign({}, box, { fontSize: 12.5, color: T.inkSoft })}>Couldn't count who is there right now. You can still set a price.</div>;
  const where = km ? `within ${km} km` : "everywhere";
  if (!crowd.enough) return <div data-testid="ads-crowd" style={box}><div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Fewer than {crowd.min} people {where} so far</div><div style={{ fontSize: 12, color: T.inkSoft, marginTop: 4, lineHeight: 1.45 }}>Too few to show what they ask. {km ? "Try a wider distance, or start anyway — new people join every day." : "You can start anyway — new people join every day."}</div></div>;
  const reach = (price) => { let n = 0; for (const x of crowd.steps) if (x.price <= price + 1e-9) n = x.people; return n; };
  const mine = reach(max);
  const stat = (k, v) => <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 11, color: T.inkSoft }}>{k}</span><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span></span>;
  return <div data-testid="ads-crowd" style={box}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span data-testid="ads-crowd-people" style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>{crowd.people.toLocaleString("en-US")}</span><span style={{ fontSize: 12.5, color: T.inkSoft }}>people {where} · last {crowd.days} days</span></div>
    <div style={{ display: "flex", gap: 10, margin: "10px 0 12px" }}>{stat("Most ask", crowd.most.price.toFixed(2))}{stat("Average", crowd.average.toFixed(2))}{stat("Range", `${crowd.lowest.toFixed(2)} – ${crowd.highest.toFixed(2)}`)}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{crowd.steps.map((x) => { const on = x.price <= max + 1e-9; const can = x.price >= limits.priceMin && x.price <= limits.priceMax; return <button key={x.price} type="button" onClick={() => can && onPick(x.price)} data-testid={`ads-crowd-step-${x.price}`} aria-label={`Up to ${x.price.toFixed(2)} reaches ${x.people} people. Use this price.`} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, textAlign: "left" }}><span style={{ width: 44, fontSize: 12.5, fontWeight: 800, color: on ? T.accent : T.inkSoft, flexShrink: 0 }}>{x.price.toFixed(2)}</span><span style={{ flex: 1, height: 12, borderRadius: 6, background: HT.cardBg || T.surface, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${Math.max(4, Math.round((x.people / crowd.people) * 100))}%`, borderRadius: 6, background: on ? T.accent : T.inkFaint }} /></span><span style={{ minWidth: 74, fontSize: 12, fontWeight: 700, color: T.ink, textAlign: "right", flexShrink: 0, whiteSpace: "nowrap" }}>{x.people.toLocaleString("en-US")} {x.people === 1 ? "person" : "people"}</span></button>; })}</div>
    <div data-testid="ads-crowd-line" style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.45, marginTop: 10 }}>{mine ? <>At <b>{money(max)}</b> you reach <b>{mine.toLocaleString("en-US")} of {crowd.people.toLocaleString("en-US")}</b>.</> : <>At <b>{money(max)}</b> you reach nobody here: everyone asks more.</>}{max > crowd.suggest + 1e-9 ? <> <b>{money(crowd.suggest)}</b> already reaches {reach(crowd.suggest).toLocaleString("en-US")}.</> : null}</div>
    {Math.abs(max - crowd.suggest) > 1e-9 ? <button type="button" onClick={() => onPick(crowd.suggest)} data-testid="ads-crowd-use" className="v2-tap" style={{ marginTop: 8, height: 34, padding: "0 12px", borderRadius: 12, border: "none", background: T.accentSoft, color: T.accent, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Use {money(crowd.suggest)} · reaches 4 in 5</button> : null}
    <div style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.4, marginTop: 8 }}>Each person is paid the price they ask, never your limit. A higher limit only adds the people who ask more.</div>
  </div>;
}
function AdsNew({ limits, money, onClose, onMade }) {
  const [file, setFile] = useStateH43(null);
  const [title, setTitle] = useStateH43("");
  const [maxPerView, setMaxPerView] = useStateH43(0.5);
  const [budget, setBudget] = useStateH43("500");
  const [topics, setTopics] = useStateH43([]);
  // Who by distance: 0 is everyone; a km needs where you are now.
  const [km, setKm] = useStateH43(0);
  const [place, setPlace] = useStateH43(null);
  const [placing, setPlacing] = useStateH43(false);
  const pickKm = (v) => { setErr(""); if (!v) { setKm(0); return; } if (place) { setKm(v); return; } setPlacing(true); adsLocate().then((w) => { setPlace(w); setKm(v); }).catch((e) => setErr(e.message)).then(() => setPlacing(false)); };
  // Who is there, and what they ask: asked again whenever the distance or
  // the categories change, so the price is set from what is there.
  const [crowd, setCrowd] = useStateH43(null);
  useEffectH43(() => {
    let live = true; setCrowd(null);
    const t = setTimeout(() => { adsApi.audience(km, place, topics).then((r) => { if (live) setCrowd(r); }).catch(() => { if (live) setCrowd({ error: true }); }); }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [km, place, topics]);
  const [pin, setPin] = useStateH43("");
  const [busy, setBusy] = useStateH43("");
  const [err, setErr] = useStateH43("");
  const pick = useRefH43(null);
  const onFile = (f) => {
    setErr("");
    if (!f) return;
    const isVideo = /^video\//.test(f.type);
    if (isVideo && f.size > SOCIAL_VIDEO_MAX) { setErr("Videos can be up to 8 MB for now."); return; }
    if (!isVideo && (!/^image\//.test(f.type) || /svg/.test(f.type))) { setErr("Pick a picture or a short video."); return; }
    const preview = URL.createObjectURL(f);
    const next = { file: f, kind: isVideo ? "video" : "photo", preview, seconds: 8 };
    if (isVideo) { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => setFile((cur) => (cur && cur.preview === preview ? Object.assign({}, cur, { seconds: Math.max(5, Math.min(60, Math.round(v.duration) || 15)) }) : cur)); v.src = preview; }
    setFile(next);
  };
  const amount = Number(budget);
  const okBudget = amount >= limits.budgetMin && amount <= limits.budgetMax && amount >= maxPerView;
  const ready = file && title.trim() && okBudget && pin.length >= 4 && !busy;
  const start = async () => {
    if (!ready) return;
    setErr("");
    try {
      setBusy("Sending the ad…");
      const data = file.kind === "video" ? await socialReadFile(file.file) : await socialShrinkPhoto(file.file);
      const up = await adsApi.upload(data);
      setBusy("Starting…");
      await adsApi.create(Object.assign({ title: title.trim(), media: up.id, seconds: file.seconds, maxPerView, budget: amount, topics, pin }, km && place ? { near: { lat: place.lat, lng: place.lng, km } } : {}));
      setPin("");
      onMade();
    } catch (e) {
      setPin("");
      setErr((e && e.message) || "Couldn't start the ad. Try again.");
      setBusy("");
    }
  };
  const step = (n, t, body) => <div style={{ display: "flex", gap: 12 }}><span style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentSoft, color: T.accent, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 8 }}>{t}</span>{body}</span></div>;
  const field = { width: "100%", boxSizing: "border-box", height: 46, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, padding: "0 14px", outline: "none" };
  return <div data-testid="ads-new" style={{ position: "absolute", inset: 0, zIndex: 95, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <HellooTop left={<HellooRoundButton Icon={HlX} label="Close" onClick={onClose} size={38} />} title="New ad" subtitle="Paid by the second watched · full price only to the end" />
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={(e) => { onFile(e.target.files && e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} data-testid="ads-file" />
      <button onClick={() => pick.current && pick.current.click()} className="v2-tap" style={{ position: "relative", height: 190, borderRadius: 24, border: file ? "none" : `2px dashed ${T.line}`, background: file ? "#000" : (HT.cardBg || T.surface), overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0, padding: 0 }}>{file ? <>{file.kind === "video" ? <video src={file.preview} muted playsInline autoPlay loop style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <img src={file.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}<span style={{ position: "absolute", right: 10, bottom: 10, fontSize: 11.5, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: 999, padding: "4px 10px" }}>{file.seconds} sec · tap to change</span></> : <><AxHorn size={30} color={T.accent} /><span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>A picture or a short video</span><span style={{ fontSize: 12.5, color: T.inkSoft }}>Video up to 60 sec and 8 MB</span></>}</button>
      <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} placeholder="One line: what are you offering?" data-testid="ads-title" style={field} />
      <HellooCard style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
        {step(1, "How far", <><div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8, lineHeight: 1.45 }}>{placing ? "Finding where you are…" : km ? `Only people within ${km} km of where you are now, who turned on Ads near me.` : "Everyone who uses your country's money. Pick a distance for a shop people come to."}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}><AdsChip on={!km} onClick={() => pickKm(0)} testId="ads-km-0">Everywhere</AdsChip>{(limits.nearKm || []).map((v) => <AdsChip key={v} on={km === v} onClick={() => pickKm(v)} testId={`ads-km-${v}`}>{v} km</AdsChip>)}</div></>)}
        {step(2, "Who sees it", <><div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8 }}>{topics.length ? "People who picked these, and people who picked nothing." : "Nothing picked: everyone in your country's money."}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(limits.allTopics || []).map((k) => <AdsChip key={k} on={topics.includes(k)} onClick={() => setTopics((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]))}>{adsTopic(k)[0]} {adsTopic(k)[1]}</AdsChip>)}</div></>)}
        {step(3, "The most you pay for one full view", <><AdsCrowd crowd={crowd} km={km} money={money} max={maxPerView} limits={limits} onPick={setMaxPerView} /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>Each person gets their own price, never more</span><span data-testid="ads-max" style={{ fontSize: 18, fontWeight: 800, color: T.accent, whiteSpace: "nowrap" }}>{money(maxPerView)}</span></div><AdsPrice value={maxPerView} min={limits.priceMin} max={limits.priceMax} onChange={setMaxPerView} testId="ads-max-slider" /></>)}
        {step(4, "Budget", <><input value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d.]/g, "").slice(0, 9))} inputMode="decimal" data-testid="ads-budget" style={field} /><div style={{ fontSize: 12, color: okBudget ? T.inkSoft : T.negative, marginTop: 6, lineHeight: 1.45 }}>{okBudget ? `At least ${Math.floor(amount / maxPerView).toLocaleString("en-US")} full views, more if people skip. It stays in your balance until each one is watched; what isn't used is never taken.` : `From ${limits.budgetMin} to ${limits.budgetMax.toLocaleString("en-US")}.`}</div></>)}
        {step(5, "Approve with your GLOOBAL PIN", <><input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="Your GLOOBAL PIN" data-testid="ads-pin" style={Object.assign({}, field, { fontSize: 18, letterSpacing: 6, fontWeight: 800, textAlign: "center" })} /><div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6, lineHeight: 1.45 }}>Once, for this ad: it may pay each viewer up to {money(maxPerView)}, and {okBudget ? money(amount) : "the budget"} in all. Pause or end it any time.</div></>)}
      </HellooCard>
      {err ? <div role="alert" style={{ fontSize: 13, color: T.negative, fontWeight: 700 }}>{err}</div> : null}
    </div>
    <div style={{ padding: "10px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}><HellooPrimary onClick={start} disabled={!ready}>{busy || "Start the ad"}</HellooPrimary></div>
  </div>;
}
