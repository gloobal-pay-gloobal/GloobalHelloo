// frontend/HellooApp.jsx
//
// The app. For now a demo shell with the screens wired to sample people,
// so every screen can be seen and tapped through; the server comes next.
import { useState as useStateH9 } from "react";

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

// The root the preview mounts. A demo stage switcher for now.
function HellooRoot() {
  const P = hellooSamplePeople();
  const chats = hellooSampleChats(P);
  const [tab, setTab] = useStateH9("chats");
  const [open, setOpen] = useStateH9(null);
  const badges = { chats: chats.reduce((n, c) => n + (c.unread || 0), 0), calls: 1 };
  const chat = open && chats.find((c) => c.id === open);
  if (chat) return <HellooThreadScreen me={HELLOO_ME} chat={chat} onBack={() => setOpen(null)} />;
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}><div style={{ flex: 1, position: "relative" }}>{tab === "chats" && <HellooChatsScreen me={HELLOO_ME} chats={chats} onOpen={(c) => setOpen(c.id)} />}{tab === "calls" && <HellooCallsScreen calls={hellooSampleCalls(P)} favourites={[P.amara, P.lukas, P.rasoi]} />}{tab === "dial" && <HellooDialScreen value="" status="" />}{tab === "me" && <HellooMeScreen me={HELLOO_ME} stats={{ feesText: "₹0 in fees", minutes: 31 }} />}</div><HellooTabBar active={tab} onChange={setTab} badges={badges} /></div>;
}
