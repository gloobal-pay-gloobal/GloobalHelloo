// frontend/HellooApp.jsx
//
// The app. For now a demo shell with the screens wired to sample people,
// so every screen can be seen and tapped through; the server comes next.
import { useState as useStateH9, useEffect as useEffectH9, useMemo as useMemoH9 } from "react";

var HELLOO_ME = { id: "−+×=○□●■−+×=", name: "Sanjeev Santosh", about: "Building GLOOBAL", flag: "🇮🇳", iso: "IN", country: "India", city: "Alwar", currency: "INR", photo: null };

function hellooSamplePeople() {
  return {
    amara: { id: "+×=○□●■−+×=−", name: "Amara Okafor", flag: "🇳🇬", country: "Nigeria", city: "Lagos", currency: "NGN", online: true, about: "Fintech · Lagos", lastPaid: "You paid ₦12,000 · 5 Oct" },
    lukas: { id: "×=○□●■−+×=−+", name: "Lukas Brandt", flag: "🇩🇪", country: "Germany", city: "Berlin", currency: "EUR", online: false, lastSeen: "today at 02:58", lastPaid: "Paid you €40 · 24 Oct" },
    rasoi: { id: "=○□●■−+×=−+×", name: "Ramesh Gupta", handle: "rasoi.ghar", flag: "🇮🇳", country: "India", city: "Alwar", currency: "INR", online: true, about: "Chole bhature · open 8–22", lastPaid: "You paid ₹500 · yesterday" },
    priya: { id: "○□●■−+×=−+×=", name: "Priya Singh", flag: "🇮🇳", country: "India", city: "Jaipur", currency: "INR", online: false, lastSeen: "yesterday", lastPaid: "Paid you ₹2,000 · 29 Oct" },
    pilot: { id: "", name: "Berlin pilot", group: true, members: 4, flag: "", country: "4 people" }
  };
}

function hellooSampleChats(P) {
  const H = 3600e3, now = Date.now();
  const at = (h) => new Date(now - h * H);
  return [
    { id: "c-amara", person: P.amara, unread: 2, pinned: true, messages: [
      { kind: "system", text: "Verified on GLOOBAL · private to you two" },
      { kind: "day", text: "Yesterday" },
      { id: 1, kind: "text", from: "them", text: "Morning! Did the transfer land?", at: at(27) },
      { id: 2, kind: "text", from: "me", text: "Yes, cleared in seconds. Calling you in a bit", at: at(26.9), read: true },
      { id: 3, kind: "call", from: "me", seconds: 372, at: at(26) },
      { kind: "day", text: "Today" },
      { id: 4, kind: "request", from: "them", amountText: "₦12,000", note: "Deck design, half now", at: at(3), paid: true, paidWhen: "11:20" },
      { id: 5, kind: "receipt", from: "me", amountText: "12,000 NGN", note: "Deck design", at: at(2.9) },
      { id: 6, kind: "voice", from: "them", seconds: 14, at: at(0.5) },
      { id: 7, kind: "text", from: "them", text: "Thanks! Sending the deck tonight 🙏", at: at(0.4) }
    ] },
    { id: "c-rasoi", person: P.rasoi, unread: 0, messages: [
      { kind: "system", text: "A shop on GLOOBAL बाज़ार" },
      { kind: "day", text: "Yesterday" },
      { id: 1, kind: "text", from: "me", text: "2 chole bhature, parcel. Coming in 10 min", at: at(20), read: true },
      { id: 2, kind: "text", from: "them", text: "Ready ji 👍", at: at(19.8) },
      { id: 3, kind: "order", from: "me", items: [{ qty: 2, name: "Chole bhature", lineText: "120.00₹" }, { qty: 1, name: "Lassi", lineText: "60.00₹" }], totalText: "180.00₹ │ GEU", note: "Parcel · 10 min", paid: true, status: "Ready", at: at(19.6) },
      { id: 33, kind: "receipt", from: "me", amountText: "180.00₹ │ GEU", note: "Order #412", at: at(19.5) },
      { id: 4, kind: "photo", from: "them", at: at(19.4), text: "bhature" },
      { id: 5, kind: "text", from: "them", text: "Fresh samosa @4pm today", at: at(1.2) }
    ] },
    { id: "c-pilot", person: P.pilot, unread: 1, messages: [
      { kind: "system", text: "Berlin pilot · 4 people · you're admin" },
      { id: 1, kind: "text", from: "them", text: "Lukas: Pilot dates locked — 12 Nov", at: at(5) },
      { id: 2, kind: "text", from: "them", text: "Priya: Dinner was 1,200 total, who paid what?", at: at(4) },
      { id: 3, kind: "split", from: "me", totalText: "1,200.00₹ │ GEU", note: "Dinner", shares: [{ name: "You", amountText: "300.00₹", paid: true }, { name: "Amara", amountText: "300.00₹", paid: true }, { name: "Lukas", amountText: "300.00₹" }, { name: "Priya", amountText: "300.00₹" }], at: at(3.5) },
      { id: 4, kind: "text", from: "them", text: "Amara: Paid ✅", at: at(3.4) }
    ] },
    { id: "c-lukas", person: P.lukas, unread: 0, muted: true, messages: [
      { id: 1, kind: "call", from: "them", video: true, missed: true, at: at(26) },
      { id: 2, kind: "text", from: "them", text: "Tried you on video, ping me when free", at: at(25.9) }
    ] },
    { id: "c-priya", person: P.priya, unread: 0, messages: [
      { id: 1, kind: "receipt", from: "them", amountText: "2,000.00₹ │ GEU", note: "Rent share", at: at(30) },
      { id: 2, kind: "text", from: "me", text: "Got it, thanks Priya", at: at(29), read: true }
    ] }
  ];
}

function hellooSampleCalls(P) {
  const H = 3600e3, now = Date.now();
  return [
    { id: 1, person: P.lukas, video: true, missed: true, at: new Date(now - 1 * H) },
    { id: 2, person: P.amara, out: true, seconds: 372, at: new Date(now - 26 * H) },
    { id: 3, person: P.rasoi, out: true, seconds: 41, at: new Date(now - 30 * H) },
    { id: 4, person: P.lukas, video: true, seconds: 1284, at: new Date(now - 50 * H) }
  ];
}

// The root the preview mounts: a tappable demo on sample people. Sign in
// → Chats · Calls · Dial · Me, with threads you can type into, pay sheets,
// letters, priced strangers, a call with its meter, the six themes, Who
// can reach me, Activity and Share nearby. Nothing leaves the phone: there
// is no server yet, and every figure is an example.
var HELLOO_DEMO_IN_KEY = "helloo.demo.signedin.v1";
function hellooDemoGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
function hellooDemoSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } }
function hellooFindLetter(key) { for (const g of HELLOO_LETTER_SETS) { const it = g.items.find((x) => x.key === key); if (it) return it; } return null; }

function HellooRoot() {
  const [, setThemeTick] = useStateH9(0);
  const [themeKey, setThemeKey] = useStateH9(() => { const k = hellooSavedTheme(); applyHellooTheme(k); return k; });
  const pickTheme = (k) => { applyHellooTheme(k); hellooDemoSet(HELLOO_THEME_KEY, k); setThemeKey(k); setThemeTick((n) => n + 1); };
  const [stage, setStage] = useStateH9(() => hellooDemoGet(HELLOO_DEMO_IN_KEY, "") ? "splash-in" : "splash");
  useEffectH9(() => { if (stage === "splash" || stage === "splash-in") { const t = setTimeout(() => setStage(stage === "splash" ? "welcome" : "app"), 1300); return () => clearTimeout(t); } }, [stage]);
  const [idValue, setIdValue] = useStateH9("");
  const signIn = () => { hellooDemoSet(HELLOO_DEMO_IN_KEY, "1"); setStage("back"); };

  const P = useMemoH9(() => hellooSamplePeople(), []);
  const D = useMemoH9(() => hellooDemoData(P, HELLOO_ME), [P]);
  const [chats, setChats] = useStateH9(() => { const base = hellooSampleChats(P); const sweets = { id: "■−+×=−+×=○□●", name: "Mehta Sweets", handle: "mehta.sweets", flag: "🇮🇳", country: "India", city: "Alwar", business: true }; const offer = { ...D.OFFER_CHAT, id: "c-offer", person: sweets, messages: [{ kind: "system", text: "mehta.sweets paid ₹2 to reach you · 100% yours" }, { kind: "day", text: "Today" }, { id: 1, kind: "offer", from: "them", text: "Diwali boxes are in: kaju katli 500 g ₹399, free delivery within 3 km 🪔", km: "1.1", paidText: "2.00₹", at: new Date(Date.now() - 3600e3) }] }; return [base[0], offer, base[1], D.LETTER_CHAT, base[2], D.BANK_CHAT, base[3], base[4]]; });
  const [tab, setTab] = useStateH9("chats");
  const [openId, setOpenId] = useStateH9(null);
  const [screen, setScreen] = useStateH9(null);
  const [sheet, setSheet] = useStateH9(null);
  const [drafts, setDrafts] = useStateH9({});
  const [modes, setModes] = useStateH9({ "c-pro": "professional" });
  const [prices, setPrices] = useStateH9(D.PRICES2);
  const [face, setFace] = useStateH9("time");
  const [filter, setFilter] = useStateH9("all");
  const [callFilter, setCallFilter] = useStateH9("all");
  const [dial, setDial] = useStateH9("");
  const [pay, setPay] = useStateH9({ mode: "send", amount: "500", note: "" });
  const [letter, setLetter] = useStateH9({ set: "business", template: null, values: {} });
  const [share, setShare] = useStateH9({ text: D.TXT, radius: 5, maxPer: 2, budget: 500 });
  const [call, setCall] = useStateH9(null);
  const [refund, setRefund] = useStateH9(30);
  const [toast, setToast] = useStateH9("");
  useEffectH9(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);
  useEffectH9(() => {
    if (!call || call.ended) return;
    const t = setInterval(() => setCall((c) => c && !c.ended ? (c.state === "ringing" && c.ticks >= 2 ? { ...c, state: "live", ticks: c.ticks + 1 } : { ...c, ticks: c.ticks + 1, seconds: c.state === "live" ? c.seconds + 1 : 0 }) : c), 1000);
    return () => clearInterval(t);
  }, [call && call.ended, call && call.person && call.person.id]);

  const chat = openId && chats.find((c) => c.id === openId);
  const addMessage = (id, m) => setChats((all) => all.map((c) => c.id === id ? { ...c, unread: 0, messages: [...c.messages, { id: Date.now(), at: new Date(), from: "me", ...m }] } : c));
  const openChat = (c) => { setChats((all) => all.map((x) => x.id === c.id ? { ...x, unread: 0 } : x)); setOpenId(c.id); };
  const chatFor = (person) => chats.find((c) => c.person && person && c.person.id === person.id);
  const startCall = (person, video = false) => { if (person) setCall({ person, video, state: "ringing", seconds: 0, ticks: 0, paid: person.id === D.SPAM.id }); };
  const badges = { chats: chats.reduce((n, c) => n + (c.unread || 0), 0), calls: 1 };
  const shell = (children) => <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg }}>{children}{toast && <div role="status" style={{ position: "absolute", left: "50%", bottom: "calc(96px + env(safe-area-inset-bottom, 0px))", transform: "translateX(-50%)", background: T.ink, color: T.bg, borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>{toast}</div>}</div>;

  if (stage === "splash" || stage === "splash-in") return shell(<HellooSplash />);
  if (stage === "welcome") return shell(<HellooWelcome onContinueWithGloobal={() => setStage("allow")} onEnterId={() => setStage("id")} />);
  if (stage === "allow") return shell(<GloobalLetHellooIn me={HELLOO_ME} onAllow={signIn} onDeny={() => setStage("welcome")} />);
  if (stage === "id") return shell(<HellooIdScreen value={idValue} onChange={setIdValue} status={idValue.length === 12 ? "found" : ""} onBack={() => setStage("welcome")} onNext={signIn} />);
  if (stage === "back") return shell(<HellooWelcomeBack me={HELLOO_ME} onDone={() => setStage("app")} />);

  // A call fills the screen; a paid one ends on what it earned.
  if (call) {
    if (call.ended && call.paid) {
      const minutes = Math.max(1, Math.ceil(call.seconds / 60)), earned = minutes * 3;
      return shell(<>{<HellooPaidCallEnded person={call.person} minutes={minutes} earnedText={`${earned}.00₹ │ GEU`} perMinuteText="3.00₹" onGiveBack={() => setSheet("refund")} onDone={() => { setCall(null); setSheet(null); }} />}{sheet === "refund" && <HellooRefundSheet person={call.person} earnedValue={earned} earnedText={`${earned}.00₹`} currency="₹" minutes={minutes} percent={refund} onPercent={setRefund} onRefund={() => { setSheet(null); setCall(null); setToast(`Gave back ${refund}% to ${hellooName(call.person).split(" ")[0]}`); }} onClose={() => setSheet(null)} />}</>);
    }
    const meter = call.paid && call.state === "live" ? <HellooCallMeter perMinuteText="3.00₹" soFarText={`${Math.max(0, Math.ceil((call.seconds - 10) / 60)) * 3}.00₹`} minutes={Math.ceil(call.seconds / 60)} payer={false} /> : null;
    return shell(<HellooCallScreen person={call.person} video={call.video} state={call.state} seconds={call.seconds} meter={meter} muted={!!call.muted} speaker={!!call.speaker} onMute={() => setCall({ ...call, muted: !call.muted })} onSpeaker={() => setCall({ ...call, speaker: !call.speaker })} onEnd={() => call.paid ? setCall({ ...call, ended: true, seconds: Math.max(call.seconds, 600) }) : (setCall(null), call.seconds && setToast(`Call ended · ${hellooDuration(call.seconds)} · free`))} onMinimise={() => setCall(null)} onChat={() => { const c = chatFor(call.person); setCall(null); if (c) openChat(c); }} />);
  }

  if (chat) {
    const isPro = (modes[chat.id] || "personal") === "professional";
    const strip = chat.id === "c-bank" ? <HellooPaidMessageStrip person={chat.person} earnedText="4.00₹" isBusiness onAllow={() => setToast("Axis Bank can now reach you free")} onBlock={() => setToast("Axis Bank blocked")} /> : null;
    const draft = drafts[chat.id] || "";
    const send = () => { if (!draft.trim()) return; addMessage(chat.id, { kind: "text", text: draft.trim(), delivered: true }); setDrafts({ ...drafts, [chat.id]: "" }); };
    return shell(<HellooThreadScreen me={isPro ? D.PRO_ME : HELLOO_ME} chat={chat} strip={strip} draft={draft} onDraft={(v) => setDrafts({ ...drafts, [chat.id]: v })} onSend={send} mode={modes[chat.id] || "personal"} onMode={(k) => setModes({ ...modes, [chat.id]: k })} onWriteLetter={() => setSheet("letter")} onBack={() => { setOpenId(null); setSheet(null); }} onCall={() => startCall(chat.person)} onVideo={() => startCall(chat.person, true)} onPay={() => setSheet("pay")} onAttach={() => setSheet("attach")} onMenu={() => setSheet("menu")}>
      {sheet === "pay" && <HellooPaySheet person={chat.person} me={HELLOO_ME} mode={pay.mode} onMode={(m) => setPay({ ...pay, mode: m })} amount={pay.amount} onAmount={(a) => setPay({ ...pay, amount: a })} note={pay.note} onNote={(n) => setPay({ ...pay, note: n })} onClose={() => setSheet(null)} onSend={() => { addMessage(chat.id, { kind: "receipt", amountText: `${pay.amount}.00₹ │ GEU`, note: pay.note || "Sent on GLOOBAL" }); setSheet(null); setToast("Paid on GLOOBAL · sample"); }} onRequest={() => { addMessage(chat.id, { kind: "request", amountText: `${pay.amount}.00₹`, note: pay.note || "Request" }); setSheet(null); }} />}
      {sheet === "letter" && <HellooLetterComposer me={D.PRO_ME} person={chat.person} set={letter.set} onSet={(k) => setLetter({ ...letter, set: k })} template={letter.template} onTemplate={(t) => setLetter({ ...letter, template: t })} values={letter.values} onValue={(f, v) => setLetter({ ...letter, values: { ...letter.values, [f]: v } })} onClose={() => setSheet(null)} onSend={() => { const it = hellooFindLetter(letter.template) || { title: "Letter", subject: letter.values.subject || "Letter", body: letter.values.body || "" }; addMessage(chat.id, { kind: "letter", template: it.title, subject: hellooFill(it.subject, letter.values), date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), greeting: `Dear ${hellooName(chat.person).split(" ")[0]},`, body: hellooFill(it.body, letter.values), signoff: "Regards,", signName: HELLOO_ME.name, signTitle: D.PRO_ME.signTitle }); setLetter({ ...letter, template: null, values: {} }); setSheet(null); }} />}
      {sheet === "attach" && <HellooAttachSheet onClose={() => setSheet(null)} />}
      {sheet === "menu" && <HellooThreadMenu chat={chat} onClose={() => setSheet(null)} />}
    </HellooThreadScreen>);
  }

  if (screen === "reach") return shell(<HellooReachScreen me={HELLOO_ME} prices={prices} onChange={setPrices} earnings={{ monthText: "214.00₹ │ GEU", turnedAway: "37" }} allowed={[P.amara, P.priya]} onBack={() => setScreen(null)} />);
  if (screen === "activity") return shell(<HellooActivityScreen me={HELLOO_ME} face={face} onFace={setFace} month="October 2026" time={D.TIME} earned={D.EARNED} spent={D.SPENT} onBack={() => setScreen(null)} />);
  if (screen === "theme") return shell(<HellooThemeScreen current={themeKey} onPick={pickTheme} onBack={() => setScreen(null)} />);
  if (screen === "qr") return shell(<HellooMyQrScreen me={HELLOO_ME} onBack={() => setScreen(null)} />);
  if (screen === "requests") return shell(<HellooRequestsScreen me={HELLOO_ME} requests={D.REQS} onBack={() => setScreen(null)} />);
  if (screen === "share") return shell(<HellooShareNearbyScreen me={HELLOO_ME} shop={D.SHOP} text={share.text} onText={(t) => setShare({ ...share, text: t })} radius={share.radius} onRadius={(r) => setShare({ ...share, radius: r })} maxPer={share.maxPer} onMaxPer={(m) => setShare({ ...share, maxPer: m })} budget={share.budget} onBudget={(b) => setShare({ ...share, budget: b })} estimate={D.EST} onShare={() => setScreen("shareResults")} onBack={() => setScreen(null)} />);
  if (screen === "shareResults") return shell(<HellooShareResultsScreen me={HELLOO_ME} shop={D.SHOP} share={{ ...D.SHARE, text: share.text, radius: share.radius }} onBack={() => setScreen(null)} onGiveMore={() => setScreen("share")} />);
  if (screen && screen.contact) return shell(<HellooContactScreen person={screen.contact} onBack={() => setScreen(null)} onMessage={() => { const c = chatFor(screen.contact); setScreen(null); if (c) openChat(c); }} onCall={() => startCall(screen.contact)} onVideo={() => startCall(screen.contact, true)} onPay={() => { const c = chatFor(screen.contact); setScreen(null); if (c) { openChat(c); setSheet("pay"); } }} />);

  const dialMatch = dial.length === 12 ? P.amara : null;
  const onMeRow = (title) => { if (title === "Who can reach me") setScreen("reach"); else if (title === "Activity") setScreen("activity"); else if (title === "App theme") setScreen("theme"); else setToast(`${title} · coming with the server`); };
  return shell(<div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}><div style={{ flex: 1, minHeight: 0, position: "relative" }}>
    {tab === "chats" && <HellooChatsScreen me={HELLOO_ME} chats={filter === "unread" ? chats.filter((c) => c.unread) : chats} filter={filter} onFilter={setFilter} onOpen={openChat} requests={D.REQS} onRequests={() => setScreen("requests")} onStart={() => setTab("dial")} onScan={() => setToast("Scan opens the camera in the real app")} />}
    {tab === "calls" && <HellooCallsScreen calls={[{ id: 9, person: D.SPAM, seconds: 3000, at: new Date(Date.now() - 1800e3) }, ...hellooSampleCalls(P)]} favourites={[P.amara, P.lukas, P.rasoi]} filter={callFilter} onFilter={setCallFilter} onCall={(p) => startCall(p)} onVideo={(p) => startCall(p, true)} onOpen={(c) => setScreen({ contact: c.person })} onPad={() => setTab("dial")} />}
    {tab === "dial" && <HellooDialScreen value={dial} onChange={setDial} match={dialMatch} status={dial.length === 12 ? "found" : ""} onMessage={() => { const c = chatFor(P.amara); if (c) openChat(c); }} onCall={() => dialMatch && startCall(dialMatch)} onVideo={() => dialMatch && startCall(dialMatch, true)} />}
    {tab === "me" && <HellooMeScreen me={HELLOO_ME} stats={{ feesText: "₹0 in fees", minutes: 31 }} onQr={() => setScreen("qr")} onCopy={() => setToast("ID copied")} onRow={onMeRow}><HellooCreatorShareRow shop={D.SHOP} last={D.SHARE} onOpen={() => setScreen("share")} /></HellooMeScreen>}
  </div><HellooTabBar active={tab} onChange={setTab} badges={badges} /></div>);
}
