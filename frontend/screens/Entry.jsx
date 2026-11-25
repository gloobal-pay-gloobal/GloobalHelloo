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
import { useState as useStateH2, useEffect as useEffectH2, useRef as useRefH14 } from "react";

// Follows the phone: light in light mode, the call-screen navy in dark
// mode. Same icon on both (founder's choice, 30 Oct: the mark with
// GL●●BAL's two dots).
function hellooPrefersDark() {
  try { return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
}
// The splash (25 Nov, founder's pick "A3" from the design canvas): Bubble G
// hangs at the top, a short line drops from it to a dot, and the dot swings
// across and WRITES what Helloo costs, one side at a time, the other side
// hidden:
//   right → left  People you know · Free.      Maa, Papa, Arav · 0 CEL
//   left → right  Strangers & creators · They pay.   unknown, creator,
//                 brand, each +3 · "+3 CEL | ₹, to reach you, paid to you"
// It plays once and goes on; a tap goes on at once. Someone already signed
// in sees only the name and mark on the way to their chats.
var HELLOO_SPLASH_MS = 3800;
// The money sign beside CEL on the splash: 1 CEL is 1 unit of your own
// money, so the stub reads "CEL | ₹" the way GLOOBAL's home card does.
// Whose money: the account on this phone if there is one, else the region
// the phone's own language setting names ("en-IN" → India). With neither,
// CEL stands alone rather than naming somebody else's money.
function hellooSplashMoneySign() {
  try {
    let code = typeof geuLensOwnCurrency === "function" ? geuLensOwnCurrency() : null;
    if (!code && typeof navigator === "object") {
      const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).filter(Boolean);
      for (const l of langs) { const m = /-([A-Z]{2})\b/.exec(String(l)); if (m && COUNTRY_CURRENCY[m[1]]) { code = COUNTRY_CURRENCY[m[1]]; break; } }
    }
    return code && typeof CURRENCY_SYMBOL === "object" ? CURRENCY_SYMBOL[code] || code : "";
  } catch (e) { return ""; }
}
// One moment of the swing, `t` seconds in. Drawn in a 390 × 844 box that is
// scaled to the phone, so every figure below is in that box's pixels.
//   0 – 1.25 s   swing right → left, writing "Free."
//   1.25 – 1.85  rest on the free side
//   1.85 – 3.1   swing left → right, writing "They pay."; "Free." fades
//   3.1 –        rest on the paid side until the app goes on
// With reduced motion the dot jumps from side to side instead of swinging.
var HELLOO_SWING = { write: 1.25, rest: 0.6, amp: 46, line: 238, mid: 195 };
function hellooSwingPose(t, still) {
  const S = HELLOO_SWING;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => (still ? (v > 0 ? 1 : 0) : 0.5 - 0.5 * Math.cos(Math.PI * clamp(v)));
  const writingFree = t < S.write + S.rest;
  const since = writingFree ? t : t - S.write - S.rest;
  const q = ease(since / S.write);
  const th = (writingFree ? 1 : -1) * (S.amp * Math.PI / 180) * Math.cos(Math.PI * q);
  const bx = S.mid + S.line * Math.sin(th);
  const arrive = clamp((q - 0.55) / 0.3);
  const fade = clamp(1 - since / 0.15);
  const toPink = writingFree ? 0 : clamp(since / 0.12);
  const g = [52, 211, 153], p = [240, 68, 124];
  const c = g.map((v, i) => Math.round(v + (p[i] - v) * toPink));
  return {
    rot: -th * 180 / Math.PI,
    freeCut: writingFree ? bx : 0,
    freeOp: writingFree ? 1 : fade,
    paidCut: writingFree ? 390 : 390 - bx,
    paidOp: writingFree ? 0 : 1,
    freeTag: writingFree ? arrive : fade,
    paidTag: writingFree ? 0 : arrive,
    dot: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
  };
}

// A face for the splash: a person on a tinted disc.
function hellooSplashFace(fill, tint) {
  return <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill={tint} /><circle cx="32" cy="25" r="10" fill={fill} /><path d="M13 52 C15 42 23 37 32 37 C41 37 49 42 51 52 Z" fill={fill} /></svg>;
}
// Who pays: someone unknown, a creator's shop, a brand's megaphone, each +3.
function hellooSplashPayer(kind, pink, page) {
  const stroke = { fill: "none", stroke: pink, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" };
  const art = kind === "unknown"
    ? <><circle cx="32" cy="25" r="10" fill={pink} /><path d="M13 52 C15 42 23 37 32 37 C41 37 49 42 51 52 Z" fill={pink} /><text x="32" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill={page} fontFamily="Inter, sans-serif">?</text></>
    : kind === "creator"
      ? <><path d="M17 24 L47 24 L44 31 L20 31 Z" {...stroke} /><path d="M20 31 L20 47 L44 47 L44 31" {...stroke} /><path d="M29 47 L29 39 L35 39 L35 47" {...stroke} /></>
      : <><path d="M17 29 L17 37 L23 37 L37 44 L37 22 L23 29 Z" {...stroke} /><path d="M42 28 C45 30 45 36 42 38" {...stroke} /><path d="M23 37 L25 45 L29 45 L28 39" {...stroke} /></>;
  return <span style={{ position: "relative", width: 64, height: 64, display: "block" }}><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="rgba(240,68,124,0.18)" />{art}</svg><span style={{ position: "absolute", right: -6, top: -6, width: 26, height: 26, borderRadius: "50%", background: pink, color: page, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 11, lineHeight: "26px", textAlign: "center" }}>+3</span></span>;
}

function HellooSplashSwing({ dark, onSkip }) {
  const ink = dark ? "#F1EEFF" : T.ink; const soft = dark ? "#B3ADCC" : T.inkSoft;
  const page = dark ? "#0F0D1F" : HT.wash;
  const green = dark ? "#34D399" : "#0FA372"; const pink = dark ? "#F0447C" : "#D6336C";
  const money = hellooSplashMoneySign();
  const cel = money ? `+3 CEL | ${money}` : "+3 CEL";
  const [scale, setScale] = useStateH2(1);
  const line = useRefH14(null), dot = useRefH14(null), free = useRefH14(null), paid = useRefH14(null), freeTag = useRefH14(null), paidTag = useRefH14(null);
  const first = hellooSwingPose(0, false);
  useEffectH2(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 390, window.innerHeight / 844));
    fit();
    window.addEventListener("resize", fit);
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { still = false; }
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const t = (now - t0) / 1000;
      const p = hellooSwingPose(t, still);
      if (line.current) line.current.style.transform = `rotate(${p.rot.toFixed(2)}deg)`;
      if (dot.current) { dot.current.style.background = p.dot; dot.current.style.boxShadow = `0 0 28px ${p.dot}`; }
      if (free.current) { free.current.style.clipPath = `inset(0px 0px 0px ${p.freeCut.toFixed(1)}px)`; free.current.style.opacity = p.freeOp.toFixed(2); }
      if (paid.current) { paid.current.style.clipPath = `inset(0px ${p.paidCut.toFixed(1)}px 0px 0px)`; paid.current.style.opacity = p.paidOp.toFixed(2); }
      if (freeTag.current) freeTag.current.style.opacity = p.freeTag.toFixed(2);
      if (paidTag.current) paidTag.current.style.opacity = p.paidTag.toFixed(2);
      if (t * 1000 < HELLOO_SPLASH_MS) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", fit); };
  }, []);
  const phrase = { margin: 0, fontWeight: 600, fontSize: 20, lineHeight: "28px", color: soft };
  const big = { margin: "4px 0 0", fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 66, lineHeight: "76px", letterSpacing: -2 };
  const layer = { position: "absolute", left: 0, top: 330, width: 390, height: 240, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
  const row = { display: "flex", justifyContent: "center", gap: 18, marginTop: 26 };
  const who = (art, name) => <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>{art}<span style={{ fontWeight: 600, fontSize: 12, lineHeight: "16px", color: soft }}>{name}</span></div>;
  const tag = { position: "absolute", left: 0, top: 600, width: 390, textAlign: "center" };
  return <HellooScreen onClick={onSkip} style={{ alignItems: "center", justifyContent: "center", background: page, color: ink, cursor: "pointer" }}>
    <div data-testid="helloo-splash-swing" style={{ position: "relative", width: 390, height: 844, flexShrink: 0, transform: `scale(${scale})`, transformOrigin: "center center" }}>
      <div ref={free} data-testid="helloo-splash-free" style={{ ...layer, clipPath: `inset(0px 0px 0px ${first.freeCut}px)`, opacity: first.freeOp }}>
        <p style={phrase}>People you know</p>
        <p style={{ ...big, color: green }}>Free.</p>
        <div style={row}>{who(hellooSplashFace("#3B82F6", "rgba(37,99,235,0.22)"), "Maa")}{who(hellooSplashFace("#F97316", "rgba(234,88,12,0.22)"), "Papa")}{who(hellooSplashFace("#10B981", "rgba(5,150,105,0.24)"), "Arav")}</div>
      </div>
      <div ref={paid} data-testid="helloo-splash-paid" style={{ ...layer, clipPath: `inset(0px ${first.paidCut}px 0px 0px)`, opacity: first.paidOp }}>
        <p style={phrase}>Strangers &amp; creators</p>
        <p style={{ ...big, color: pink }}>They pay.</p>
        <div style={row}>{who(hellooSplashPayer("unknown", pink, page), "Unknown")}{who(hellooSplashPayer("creator", pink, page), "Creator")}{who(hellooSplashPayer("brand", pink, page), "Brand")}</div>
      </div>
      <div style={{ position: "absolute", left: 159, top: 96, width: 72, height: 72 }}><HellooBubbleG size={72} tone={dark ? "white" : "color"} /></div>
      <div ref={line} aria-hidden="true" style={{ position: "absolute", left: 194, top: 160, width: 2, height: HELLOO_SWING.line, background: dark ? "rgba(241,238,255,0.55)" : "rgba(26,21,48,0.45)", transformOrigin: "1px 0px", transform: `rotate(${first.rot}deg)` }}>
        <div ref={dot} style={{ position: "absolute", left: -13, bottom: -14, width: 28, height: 28, borderRadius: "50%", background: first.dot, boxShadow: `0 0 28px ${first.dot}` }} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: 189, top: 154, width: 12, height: 12, boxSizing: "border-box", borderRadius: "50%", border: `2px solid ${ink}`, background: page }} />
      <div ref={freeTag} style={{ ...tag, opacity: first.freeTag }}>
        <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 20, lineHeight: "26px", color: green }}>0 CEL</p>
        <p style={{ margin: "2px 0 0", fontWeight: 500, fontSize: 13, lineHeight: "18px", color: soft }}>Calls and messages, every country</p>
      </div>
      <div ref={paidTag} data-testid="helloo-splash-price" style={{ ...tag, opacity: first.paidTag }}>
        <p style={{ margin: 0, fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 20, lineHeight: "26px", color: pink }}>{cel}</p>
        <p style={{ margin: "2px 0 0", fontWeight: 500, fontSize: 13, lineHeight: "18px", color: soft }}>To reach you. Paid to you.</p>
      </div>
      <div style={{ position: "absolute", left: 0, top: 690, width: 390, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 34, letterSpacing: 1, color: ink }}><HellooWordmark /></span>
        <div data-testid="helloo-splash-foot" style={{ fontSize: 12, color: soft, display: "flex", alignItems: "center", gap: 6 }}>by <GloobalWordmark /></div>
      </div>
    </div>
  </HellooScreen>;
}

function HellooSplash({ dark = hellooPrefersDark(), intro = false, onSkip }) {
  const ink = dark ? "#F1EEFF" : T.ink; const soft = dark ? "#B3ADCC" : T.inkSoft;
  const page = dark ? "#0F0D1F" : HT.wash;
  if (intro) return <HellooSplashSwing dark={dark} onSkip={onSkip} />;
  return <HellooScreen style={{ alignItems: "center", justifyContent: "center", background: page, color: ink }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><div style={{ fontSize: 34, letterSpacing: -0.5, color: ink }}><HellooWordmark /></div><div style={{ marginTop: 14 }}><HellooMark size={104} /></div></div><div style={{ marginTop: 14, fontSize: 12, color: soft, display: "flex", alignItems: "center", gap: 6 }}>by <GloobalWordmark /></div></HellooScreen>;
}

// GLOOBAL's name on a coloured button: the two Os as white discs, so the
// wordmark reads on purple (the random brand colours can match the button).
function HellooGloobalOnColour() {
  const o = (op) => <span aria-hidden="true" style={{ display: "inline-block", width: "0.8em", height: "0.8em", borderRadius: "50%", background: "#fff", opacity: op, margin: "0 0.03em", verticalAlign: "-0.04em" }} />;
  return <span aria-label="GLOOBAL" style={{ fontWeight: 800, fontFamily: T.fontWordmark, letterSpacing: 0.2, whiteSpace: "nowrap" }}>GL{o(1)}{o(0.6)}BAL</span>;
}

// Welcome. A first-time person asks four things, in this order, and the
// screen answers each before asking for anything (12 Nov rework):
//   "Why another app?"        the headline: strangers pay to reach you
//   "Does it cost me?"        free with people you know, every country
//   "Who sees my number?"     nobody: people find you by GLOOBAL ID
//   "I have no GLOOBAL ID."   a full button for it, not a footnote
// Then the way in, one button per kind of person: has an ID, or is new.
var HELLOO_GLOOBAL_SIGNUP = "https://gloobalv3.netlify.app";
function HellooWelcome({ onContinueWithGloobal, onEnterId, onCreateId, hasGloobal = true, note = "" }) {
  const row = (Icon, color, title, text) => <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}><span style={{ width: "clamp(36px, 5.8vh, 48px)", height: "clamp(36px, 5.8vh, 48px)", borderRadius: 14, background: color + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={color} /></span><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: "clamp(14px, 2.25vh, 17px)", fontWeight: 800, color: T.ink, lineHeight: 1.25 }}>{title}</span><span style={{ display: "block", fontSize: "clamp(12.5px, 1.95vh, 14.5px)", color: T.inkSoft, lineHeight: 1.35, marginTop: 2 }}>{text}</span></span></div>;
  const createId = onCreateId || (() => window.open(HELLOO_GLOOBAL_SIGNUP, "_blank", "noopener"));
  return <HellooScreen style={{ background: HT.wash }}><div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", padding: "calc(18px + env(safe-area-inset-top, 0px)) 22px 0" }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}><span style={{ fontSize: 26, letterSpacing: -0.4, color: T.ink }}><HellooWordmark /></span><span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 800, color: HT.free, background: HT.freeSoft, borderRadius: 999, padding: "5px 10px" }}><HlGlobe size={13} />Every country</span></div><h1 data-testid="helloo-welcome-title" style={{ margin: "clamp(14px, 3vh, 30px) 0 0", fontSize: "clamp(26px, 4.5vh, 34px)", fontWeight: 800, fontFamily: T.fontDisplay, letterSpacing: -0.8, lineHeight: 1.13, color: T.ink, textWrap: "balance" }}>Free with people you know. <span style={{ color: T.accent }}>Strangers pay</span> to reach you.</h1><div style={{ marginTop: 8, fontSize: "clamp(13.5px, 2vh, 15.5px)", color: T.inkSoft, lineHeight: 1.4 }}>Calls and chats on your <GloobalWordmark suffix=" ID" />.</div><HellooCard data-testid="helloo-welcome-points" style={{ marginTop: "clamp(14px, 2.6vh, 24px)", marginBottom: 6, padding: "13px 16px", display: "flex", flexDirection: "column", gap: 11, flex: "1 1 auto", maxHeight: 520, justifyContent: "space-evenly" }}>{row(HlChat, HT.free, "Free calls and chats", "With people you know, in every country.")}{row(HlShield, T.accent, "Strangers pay or ask", "You set the price. Spam pays or stays out.")}{row(HlLock, "#2563EB", "Your number stays private", "People find you by GLOOBAL ID.")}{row(HlRupee, "#DB2777", "Pay in the chat", "Send money or order from a shop.")}</HellooCard><div style={{ flex: "0 1 0px", minHeight: 2 }} /></div><div style={{ padding: "10px 20px calc(14px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 9 }}>{note ? <div role="status" data-testid="helloo-signed-out-note" style={{ fontSize: 12.5, lineHeight: 1.45, color: T.ink, background: "#FEF3C7", borderRadius: 14, padding: "10px 12px" }}>{note}</div> : null}{hasGloobal ? <><HellooPrimary onClick={onContinueWithGloobal}><span>Continue with <HellooGloobalOnColour /></span></HellooPrimary><HellooSecondary onClick={onEnterId} Icon={HlKeyboard}>Sign in with my ID</HellooSecondary></> : <><HellooPrimary onClick={onEnterId} Icon={HlKeyboard}><span>I have a <HellooGloobalOnColour /> ID</span></HellooPrimary><HellooSecondary onClick={createId} Icon={HlSpark}>I'm new · create my ID</HellooSecondary></>}<div style={{ textAlign: "center", fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.45 }}>{hasGloobal ? <>No ID yet? <a href={HELLOO_GLOOBAL_SIGNUP} target="_blank" rel="noopener" style={{ color: T.accent, fontWeight: 800, textDecoration: "none" }}>Create one on <GloobalWordmark /></a></> : <>One free <GloobalWordmark suffix=" ID" /> for calls, chats and money.</>}</div></div></HellooScreen>;
}

// What Gloobal shows when Helloo asks to come in. Lives in the Gloobal
// app; drawn here so the flow can be seen whole.
function GloobalLetHellooIn({ me, onAllow, onDeny }) {
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onDeny} />} title={<GloobalWordmark />} right={<NavFlagBadge flag={me.flag} />} /><div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><GloobalLogo size={56} /><span style={{ width: 34, height: 2, background: T.line, position: "relative" }}><span style={{ position: "absolute", left: 11, top: -5, width: 12, height: 12, borderRadius: "50%", background: HT.free }} /></span><HellooMark size={56} /></div><div style={{ marginTop: 20, fontSize: 22, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Let <HellooWordmark /> in?</div><div style={{ marginTop: 10, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>Helloo will sign in as you and can see your name, photo, country and the people you have paid. It can't move money.</div><HellooCard style={{ marginTop: 22, width: "100%", padding: 14, display: "flex", alignItems: "center", gap: 12 }}><ProfileAvatar photo={me.photo} name={me.name} size={44} /><div style={{ textAlign: "left", minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink }}><HellooNameB p={me} label={me.name} /></div><div style={{ fontSize: 13, marginTop: 2 }}><ColoredGloobalId id={me.id} /></div></div></HellooCard></div><div style={{ padding: "0 20px calc(22px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}><HellooPrimary onClick={onAllow} Icon={HlFinger}>Allow with fingerprint</HellooPrimary><HellooSecondary onClick={onDeny}>Not now</HellooSecondary></div></HellooScreen>;
}

// Signing in. Two ways to say who you are, both in plain sight (12 Nov
// rework; the mobile choice used to be an unlabelled icon that did
// nothing): the 12 symbols of the GLOOBAL ID on Gloobal's own dial, or the
// mobile number the account was made with, country code first. Whether the
// account exists is answered by the PIN step itself (POST /api/login takes
// either), so nothing here claims to have found it.
var HELLOO_MOBILE_MIN = 8;
var HELLOO_MOBILE_MAX = 15;
function HellooIdScreen({ value, onChange, status, onBack, onNext, mode = "id", onMode, mobile = "", onMobile, note = "" }) {
  const byMobile = mode === "mobile";
  const found = byMobile ? mobile.length >= HELLOO_MOBILE_MIN : (status === "found" || status === "ready");
  const grouped = mobile.replace(/(\d{2})(\d{0,5})(\d{0,8})/, (m, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  return <HellooScreen><HellooTop left={onBack ? <NavBackButton onClick={onBack} /> : <span style={{ display: "inline-flex", paddingLeft: 4 }}><HellooMark size={36} /></span>} title="Sign in" subtitle={<>with your <GloobalWordmark suffix=" ID" /> or mobile number</>} /><div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 18px 0", overflow: "hidden" }}><div style={{ width: "100%" }}><HellooSegment value={mode} onChange={onMode} options={[["id", "GLOOBAL ID"], ["mobile", "Mobile number"]]} /></div><HellooCard style={{ width: "100%", padding: "14px 14px 12px", marginTop: 12 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 12.5, fontWeight: 800, color: T.ink }}>{byMobile ? "Your mobile number, country code first" : "The 12 symbols you pay with"}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint }}>{byMobile ? "" : `${value.length}/12`}</span></div><div style={{ marginTop: 10 }}>{byMobile ? <div data-testid="helloo-signin-mobile" style={{ minHeight: 34, display: "flex", alignItems: "center", gap: 6, fontSize: 24, fontWeight: 800, fontFamily: T.fontDisplay, letterSpacing: 0.5, color: mobile ? T.ink : T.inkFaint }}><span style={{ color: T.inkFaint }}>+</span>{mobile ? grouped : "91 98765 43210"}</div> : <SymbolChipRow length={12} value={value} masked={false} boxSize={22} fitWidth />}</div></HellooCard>{note ? <div role="status" data-testid="helloo-signed-out-note" style={{ width: "100%", marginTop: 8, fontSize: 12, lineHeight: 1.4, color: T.ink, background: "#FEF3C7", borderRadius: 12, padding: "8px 11px" }}>{note}</div> : null}<div style={{ height: 28, marginTop: 8, fontSize: 12.5, fontWeight: 800, color: found ? HT.free : status === "none" ? T.negative : T.inkFaint, display: "flex", alignItems: "center", gap: 6 }}>{byMobile ? (found ? <><HlCheck size={15} />Next, your GLOOBAL PIN</> : "For India, start with 91") : <>{status === "looking" && "Checking…"}{status === "found" && <><HlCheck size={15} />Account found · next, your PIN</>}{status === "ready" && <><HlCheck size={15} />12 symbols · next, your GLOOBAL PIN</>}{status === "none" && "No account with this ID yet"}{!status && "Tap the symbols of your ID on the dial"}</>}</div><div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>{byMobile ? <PhoneDialPad value={mobile} onChange={onMobile || (() => {})} minLength={HELLOO_MOBILE_MIN} maxLength={HELLOO_MOBILE_MAX} onSubmit={found ? onNext : undefined} showValue={false} /> : <SymbolDialPad value={value} onChange={onChange} length={12} soundWhileTyping />}</div></div><div style={{ padding: "6px 20px calc(18px + env(safe-area-inset-bottom, 0px))" }}>{!byMobile && status === "none" ? <HellooSecondary Icon={HlSpark} onClick={() => window.open(HELLOO_GLOOBAL_SIGNUP, "_blank", "noopener")}>Create this ID on GLOOBAL</HellooSecondary> : <HellooPrimary disabled={!found} onClick={onNext}>Continue</HellooPrimary>}<div style={{ textAlign: "center", fontSize: 12.5, color: T.inkSoft, marginTop: 10 }}>New here? <a data-testid="helloo-create-id" href={HELLOO_GLOOBAL_SIGNUP} target="_blank" rel="noopener" style={{ color: T.accent, fontWeight: 800, textDecoration: "none" }}>Create your free <GloobalWordmark suffix=" ID" /></a></div></div></HellooScreen>;
}

// The PIN step is GLOOBAL's own sign-in screen (LoginAuthScreen) with its
// PinSignInNote: who is signing in and where to reset a forgotten PIN.

function HellooWelcomeBack({ me, onDone }) {
  useEffectH2(() => { const t = setTimeout(() => onDone && onDone(), 1400); return () => clearTimeout(t); }, []);
  return <HellooScreen style={{ alignItems: "center", justifyContent: "center", background: HT.wash }}><span style={{ width: 96, height: 96, borderRadius: "50%", padding: 3, background: `conic-gradient(${HT.free} 0 100%)`, display: "inline-block" }}><span style={{ display: "block", borderRadius: "50%", background: T.surface, padding: 3 }}><ProfileAvatar photo={me.photo} name={me.name} size={84} /></span></span><div style={{ maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 16, fontSize: 24, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, letterSpacing: -0.4 }}>Welcome back, {me.name.split(" ")[0]}</div><div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.inkSoft }}><FlagEmoji flag={me.flag} size={16} shape="circle" border="none" />{me.country} · <ColoredGloobalId id={me.id} /></div><div style={{ marginTop: 26, fontSize: 12, color: T.inkFaint }}>Opening Helloo…</div></HellooScreen>;
}

// ── INSIDE GLOOBAL ──────────────────────────────────────────────────────
//
// The other half of the handoff. Lives in the Gloobal app: on a receipt,
// a shop page and the Pay & Services search, a "Message on Helloo" door.
// Drawn here so the whole flow can be seen; the real one is a Gloobal patch.
function GloobalMessageOnHelloo({ person }) {
  const row = (label, value) => <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${T.line}`, fontSize: 13 }}><span style={{ color: T.inkSoft }}>{label}</span><span style={{ fontWeight: 800, color: T.ink }}>{value}</span></div>;
  return <HellooScreen><HellooTop left={<NavBackButton />} title="Payment" right={<NavFlagBadge flag="🇮🇳" />} /><div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}><div style={{ flexShrink: 0, borderRadius: 24, background: T.gradWallet, color: "#fff", padding: "16px 18px", textAlign: "center" }}><div style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 800, opacity: 0.8 }}><GloobalWordmark /></div><div style={{ fontSize: 10.5, letterSpacing: 1.2, fontWeight: 800, opacity: 0.7, marginTop: 8 }}>MONEY SENT</div><div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDisplay, marginTop: 2 }}>−180.00 CEL | ₹</div></div><HellooCard style={{ padding: "4px 16px 8px" }}><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}><HellooAvatar person={person} size={40} /><span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}><HellooNameB p={person} label={<CreatorHandleText handle={person.handle} />} /></span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft }}>Order #412 · Completed</span></span></div>{row("Date · Time", "29 Oct · 08:45:12")}{row("Fee", "₹0")}</HellooCard><div style={{ display: "flex", gap: 8 }}>{[["Audit", HlDoc], ["Share", HlShare], ["Complain", HlFlag]].map(([l, Icon]) => <button key={l} className="v2-tap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 18, border: `1px solid ${T.line}`, background: T.surface, color: T.inkSoft, fontSize: 10.5, fontWeight: 800, boxShadow: T.shadowCard, fontFamily: T.fontBody }}><Icon size={20} color={l === "Complain" ? T.negative : T.accent} />{l}</button>)}<button className="v2-tap" style={{ flex: 1.3, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 18, border: "none", background: T.gradButton, color: "#fff", fontSize: 10.5, fontWeight: 800, boxShadow: "0 8px 20px -14px rgba(76,29,149,0.9)", fontFamily: T.fontBody }}><HellooMark size={22} />Message on Helloo</button></div><div style={{ fontSize: 11.5, color: T.inkFaint, textAlign: "center", lineHeight: 1.45, marginTop: 6 }}>Opens the chat with {person.handle} in Helloo. Not installed yet? GLOOBAL offers it here, signed in already.</div></div></HellooScreen>;
}
