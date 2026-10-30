// frontend/screens/Entry.jsx
//
// The way in. Three screens, and most people see only the first and last:
//
//   Welcome  → "Continue with GLOOBAL" hands off to the Gloobal app, which
//              asks "Let Helloo in?" and comes back signed in. One tap.
//   ID + PIN → for a phone without Gloobal installed: the same symbol pad
//              and the same PIN screen Gloobal uses (LoginAuthScreen).
//   Welcome back → the account's name and flag, then Chats.
//
// Helloo never creates an account. An ID nobody has leads to Gloobal's
// own registration, because the account is a Gloobal account.
import { useState as useStateH2, useEffect as useEffectH2 } from "react";

// Follows the phone: light in light mode, the call-screen navy in dark
// mode. Same icon on both (founder's choice, 30 Oct: the mark with
// GL●●BAL's two dots).
function hellooPrefersDark() {
  try { return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
}
function HellooSplash({ dark = hellooPrefersDark() }) {
  return <HellooScreen style={{ alignItems: "center", justifyContent: "center", background: dark ? "#0F0D1F" : HT.wash, color: dark ? "#F1EEFF" : T.ink }}><HellooMark size={104} /><div style={{ marginTop: 22, fontSize: 34, letterSpacing: -0.5 }}><HellooWordmark /></div><div style={{ marginTop: 6, fontSize: 12, color: dark ? "#B3ADCC" : T.inkSoft, display: "flex", alignItems: "center", gap: 6 }}>by <GloobalWordmark /></div><div style={{ position: "absolute", bottom: "calc(40px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: HT.free }}><HlLock size={14} />Free calls and messages, every country</div></HellooScreen>;
}

// GLOOBAL's name on a coloured button: the two Os as white discs, so the
// wordmark reads on purple (the random brand colours can match the button).
function HellooGloobalOnColour() {
  const o = (op) => <span aria-hidden="true" style={{ display: "inline-block", width: "0.8em", height: "0.8em", borderRadius: "50%", background: "#fff", opacity: op, margin: "0 0.03em", verticalAlign: "-0.04em" }} />;
  return <span aria-label="GLOOBAL" style={{ fontWeight: 800, fontFamily: T.fontWordmark, letterSpacing: 0.2, whiteSpace: "nowrap" }}>GL{o(1)}{o(0.6)}BAL</span>;
}

// Welcome. Says what Helloo is in three lines a person can check against
// their own day — free with people you know, strangers pay or ask, pay in
// the chat — then one way in.
function HellooWelcome({ onContinueWithGloobal, onEnterId, hasGloobal = true }) {
  const row = (Icon, color, title, text) => <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}><span style={{ width: 44, height: 44, borderRadius: 14, background: color + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={21} color={color} /></span><span style={{ minWidth: 0, paddingTop: 2 }}><span style={{ display: "block", fontSize: 15, fontWeight: 800, color: T.ink }}>{title}</span><span style={{ display: "block", fontSize: 13, color: T.inkSoft, lineHeight: 1.45, marginTop: 2 }}>{text}</span></span></div>;
  return <HellooScreen style={{ background: HT.wash }}><div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", padding: "calc(28px + env(safe-area-inset-top, 0px)) 24px 0" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><HellooMark size={52} /><span style={{ fontSize: 26, letterSpacing: -0.4, color: T.ink }}><HellooWordmark /></span></div><div style={{ marginTop: 26, fontSize: 30, fontWeight: 800, fontFamily: T.fontDisplay, letterSpacing: -0.8, lineHeight: 1.12, color: T.ink, textWrap: "balance" }}>Your <GloobalWordmark suffix=" ID" /> is your number.</div><div style={{ marginTop: 10, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>Calls and messages, in any country, with no new account.</div><HellooCard style={{ marginTop: 24, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 18 }}>{row(HlChat, HT.free, "Free with people you know", "Anyone you've both saved, or paid on GLOOBAL, reaches you free.")}{row(HlShield, T.accent, "Strangers pay your price, or ask", "Spam calls and offers pay you to be heard. You set the price.")}{row(HlRupee, "#DB2777", "Pay and order in the chat", "Send money, split a bill, order from a shop, without leaving the chat.")}</HellooCard><div style={{ flex: 1, minHeight: 16 }} /></div><div style={{ padding: "16px 20px calc(20px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}>{hasGloobal && <HellooPrimary onClick={onContinueWithGloobal}><span>Continue with <HellooGloobalOnColour /></span></HellooPrimary>}<HellooSecondary onClick={onEnterId} Icon={HlKeyboard}>Sign in with my ID</HellooSecondary><div style={{ textAlign: "center", fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>No ID yet? <a href="https://gloobalv3.netlify.app" target="_blank" rel="noopener" style={{ color: T.accent, fontWeight: 800, textDecoration: "none" }}>Create one on <GloobalWordmark /></a></div></div></HellooScreen>;
}

// What Gloobal shows when Helloo asks to come in. Lives in the Gloobal
// app; drawn here so the flow can be seen whole.
function GloobalLetHellooIn({ me, onAllow, onDeny }) {
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onDeny} />} title={<GloobalWordmark />} right={<NavFlagBadge flag={me.flag} />} /><div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><GloobalLogo size={56} /><span style={{ width: 34, height: 2, background: T.line, position: "relative" }}><span style={{ position: "absolute", left: 11, top: -5, width: 12, height: 12, borderRadius: "50%", background: HT.free }} /></span><HellooMark size={56} /></div><div style={{ marginTop: 20, fontSize: 22, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Let <HellooWordmark /> in?</div><div style={{ marginTop: 10, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>Helloo will sign in as you and can see your name, photo, country and the people you have paid. It can't move money.</div><HellooCard style={{ marginTop: 22, width: "100%", padding: 14, display: "flex", alignItems: "center", gap: 12 }}><ProfileAvatar photo={me.photo} name={me.name} size={44} /><div style={{ textAlign: "left", minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink }}>{me.name}</div><div style={{ fontSize: 13, marginTop: 2 }}><ColoredGloobalId id={me.id} /></div></div></HellooCard></div><div style={{ padding: "0 20px calc(22px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}><HellooPrimary onClick={onAllow} Icon={HlFinger}>Allow with fingerprint</HellooPrimary><HellooSecondary onClick={onDeny}>Not now</HellooSecondary></div></HellooScreen>;
}

// Gloobal ID entry, on Gloobal's own dial. The chips above the dial fill
// as symbols go in; at twelve, the ID is looked up and the status line
// says what it found. A found account goes on to the PIN by itself.
function HellooIdScreen({ value, onChange, status, onBack, onNext }) {
  // "ready": all 12 symbols are in. Whether the account exists is answered
  // by the PIN step itself (POST /api/login), so nothing here claims it.
  const found = status === "found" || status === "ready";
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title={<span style={{ fontSize: 16.5 }}><GloobalWordmark suffix=" ID" /></span>} right={<HellooRoundButton Icon={HlMobile} label="Use mobile number instead" />} /><div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 18px 0", overflow: "hidden" }}><HellooCard style={{ width: "100%", padding: "14px 14px 12px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.inkFaint }}>Sign in</span><span style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint }}>{value.length}/12</span></div><div style={{ marginTop: 10 }}><SymbolChipRow length={12} value={value} masked={false} boxSize={22} fitWidth /></div></HellooCard><div style={{ height: 30, marginTop: 10, fontSize: 12.5, fontWeight: 800, color: found ? HT.free : status === "none" ? T.negative : T.inkFaint, display: "flex", alignItems: "center", gap: 6 }}>{status === "looking" && "Checking…"}{status === "found" && <><HlCheck size={15} />Account found · next, your PIN</>}{status === "ready" && <><HlCheck size={15} />12 symbols · next, your PIN</>}{status === "none" && "No account with this ID yet"}</div><div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}><SymbolDialPad value={value} onChange={onChange} length={12} /></div></div><div style={{ padding: "6px 20px calc(18px + env(safe-area-inset-bottom, 0px))" }}>{status === "none" ? <HellooSecondary Icon={HlSpark} onClick={() => window.open("https://gloobalv3.netlify.app", "_blank", "noopener")}>Create this ID on GLOOBAL</HellooSecondary> : <HellooPrimary disabled={!found} onClick={onNext}>Continue</HellooPrimary>}</div></HellooScreen>;
}

function HellooWelcomeBack({ me, onDone }) {
  useEffectH2(() => { const t = setTimeout(() => onDone && onDone(), 1400); return () => clearTimeout(t); }, []);
  return <HellooScreen style={{ alignItems: "center", justifyContent: "center", background: HT.wash }}><span style={{ width: 96, height: 96, borderRadius: "50%", padding: 3, background: `conic-gradient(${HT.free} 0 100%)`, display: "inline-block" }}><span style={{ display: "block", borderRadius: "50%", background: T.surface, padding: 3 }}><ProfileAvatar photo={me.photo} name={me.name} size={84} /></span></span><div style={{ marginTop: 16, fontSize: 24, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, letterSpacing: -0.4 }}>Welcome back, {me.name.split(" ")[0]}</div><div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.inkSoft }}><FlagEmoji flag={me.flag} size={16} shape="circle" border="none" />{me.country} · <ColoredGloobalId id={me.id} /></div><div style={{ marginTop: 26, fontSize: 12, color: T.inkFaint }}>Opening Helloo…</div></HellooScreen>;
}

// ── INSIDE GLOOBAL ──────────────────────────────────────────────────────
//
// The other half of the handoff. Lives in the Gloobal app: on a receipt,
// a shop page and the Pay & Services search, a "Message on Helloo" door.
// Drawn here so the whole flow can be seen; the real one is a Gloobal patch.
function GloobalMessageOnHelloo({ person }) {
  const row = (label, value) => <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${T.line}`, fontSize: 13 }}><span style={{ color: T.inkSoft }}>{label}</span><span style={{ fontWeight: 800, color: T.ink }}>{value}</span></div>;
  return <HellooScreen><HellooTop left={<NavBackButton />} title="Payment" right={<NavFlagBadge flag="🇮🇳" />} /><div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}><div style={{ flexShrink: 0, borderRadius: 24, background: T.gradWallet, color: "#fff", padding: "16px 18px", textAlign: "center" }}><div style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 800, opacity: 0.8 }}><GloobalWordmark /></div><div style={{ fontSize: 10.5, letterSpacing: 1.2, fontWeight: 800, opacity: 0.7, marginTop: 8 }}>MONEY SENT</div><div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDisplay, marginTop: 2 }}>−180.00₹ │ GEU</div></div><HellooCard style={{ padding: "4px 16px 8px" }}><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}><HellooAvatar person={person} size={40} /><span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}><CreatorHandleText handle={person.handle} /></span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft }}>Order #412 · Completed</span></span></div>{row("Date · Time", "29 Oct · 08:45:12")}{row("Fee", "₹0")}</HellooCard><div style={{ display: "flex", gap: 8 }}>{[["Audit", HlDoc], ["Share", HlShare], ["Complain", HlFlag]].map(([l, Icon]) => <button key={l} className="v2-tap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 18, border: `1px solid ${T.line}`, background: T.surface, color: T.inkSoft, fontSize: 10.5, fontWeight: 800, boxShadow: T.shadowCard, fontFamily: T.fontBody }}><Icon size={20} color={l === "Complain" ? T.negative : T.accent} />{l}</button>)}<button className="v2-tap" style={{ flex: 1.3, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 18, border: "none", background: T.gradButton, color: "#fff", fontSize: 10.5, fontWeight: 800, boxShadow: "0 8px 20px -14px rgba(76,29,149,0.9)", fontFamily: T.fontBody }}><HellooMark size={22} />Message on Helloo</button></div><div style={{ fontSize: 11.5, color: T.inkFaint, textAlign: "center", lineHeight: 1.45, marginTop: 6 }}>Opens the chat with {person.handle} in Helloo. Not installed yet? GLOOBAL offers it here, signed in already.</div></div></HellooScreen>;
}
