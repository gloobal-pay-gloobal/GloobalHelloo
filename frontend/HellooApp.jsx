// frontend/HellooApp.jsx
//
// The app. Sign in with a GLOOBAL ID and PIN, then Chats · Calls · Dial · Me
// on real data: contacts are the people you have paid or been paid by on
// GLOOBAL, chats live on the GLOOBAL server and arrive over a live socket,
// voice notes are recorded on the phone, and Pay in a chat is a real GLOOBAL
// transfer confirmed with your PIN.
//
// Calls, prices for strangers, Share nearby, letters and Activity are the
// later Release 1 steps (docs/SPEC-v1.md); their screens stay in the bundle
// but nothing here pretends they work.
import { useState as useStateH9, useEffect as useEffectH9, useMemo as useMemoH9, useRef as useRefH9, useCallback as useCallbackH9 } from "react";

var HELLOO_PIN_LENGTH = 6;

function hellooSignedInUser() {
  const session = typeof gloobalSessionLoad === "function" ? gloobalSessionLoad() : null;
  return session && session.user && session.token && gloobalAuthTokenLooksLive(session.token) ? session.user : null;
}

// Path or query that should open a chat once signed in:
//   ?chat=<chatId>                       a Helloo notification
//   /p/<digits>, /u/<digits>, /s/<digits> a GLOOBAL QR or pay link
function hellooDeepLink() {
  try {
    const url = new URL(window.location.href);
    const chat = url.searchParams.get("chat");
    if (chat) return { chatId: chat };
    if (url.searchParams.get("requests")) return { requests: true };
    if (url.searchParams.get("calls") || url.searchParams.get("call")) return { calls: true };
    const parsed = typeof parseGloobalPayPayload === "function" ? parseGloobalPayPayload(`${HELLOO_GLOOBAL_SITE}${url.pathname}`) : null;
    if (parsed && parsed.gloobalId) return { gloobalId: parsed.gloobalId };
  } catch (e) { /* no URL API */ }
  return null;
}

// The side this phone last used for the account, before the first request
// goes out. A notification's link names the side it is for (?as=).
function hellooBootFace(user) {
  hellooFaceLoad(user ? user.accountId : "");
  if (!user) return;
  try {
    const as = new URL(window.location.href).searchParams.get("as");
    if (as && as !== hellooFaceNow.as) hellooFaceSave(user.accountId, as);
  } catch (e) { /* no URL API */ }
}

function hellooClearDeepLink() {
  try { window.history.replaceState(null, "", "/"); } catch (e) { /* ignore */ }
}

function useHellooBack(depth, closeTop) {
  const state = useRefH9({ depth: 0, ignore: 0 });
  const closeRef = useRefH9(closeTop);
  closeRef.current = closeTop;
  useEffectH9(() => {
    const onPop = () => {
      const st = state.current;
      if (st.ignore > 0) { st.ignore -= 1; return; }
      // A real Back: the browser has already stepped one entry down.
      st.depth = Math.max(0, st.depth - 1);
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffectH9(() => {
    const st = state.current;
    if (depth > st.depth) {
      for (let i = st.depth; i < depth; i += 1) window.history.pushState({ helloo: i + 1 }, "");
      st.depth = depth;
    } else if (depth < st.depth) {
      // Closed by the app itself: take its entries away without firing a close.
      st.ignore += 1;
      window.history.go(-(st.depth - depth));
      st.depth = depth;
    }
  }, [depth]);
}

function HellooRoot() {
  // ── Theme ────────────────────────────────────────────────────────────
  const [, setThemeTick] = useStateH9(0);
  const [themeKey, setThemeKey] = useStateH9(() => { const k = hellooSavedTheme(); applyHellooTheme(k); return k; });
  // The colours actually on screen: the app's, or an open chat's own.
  const shownThemeRef = useRefH9("");
  // The phone's status bar takes the app's own background colour.
  useEffectH9(() => {
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
      meta.content = T.bg;
    } catch (e) { /* no DOM */ }
  }, [themeKey]);
  // "Install Helloo": Chrome and Android offer it through this event; on an
  // iPhone it is Share → Add to Home Screen, which the row explains.
  const [installEvent, setInstallEvent] = useStateH9(null);
  const standalone = typeof window !== "undefined" && (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
  useEffectH9(() => {
    const keep = (e) => { e.preventDefault(); setInstallEvent(e); };
    window.addEventListener("beforeinstallprompt", keep);
    return () => window.removeEventListener("beforeinstallprompt", keep);
  }, []);
  const pickTheme = (k) => { applyHellooTheme(k); try { localStorage.setItem(HELLOO_THEME_KEY, k); } catch (e) { /* private window */ } setThemeKey(k); setThemeTick((n) => n + 1); };

  // ── Sign-in ──────────────────────────────────────────────────────────
  const [user, setUser] = useStateH9(() => { const u = hellooSignedInUser(); hellooBootFace(u); applyHellooTheme(hellooSavedTheme()); return u; });
  const [stage, setStage] = useStateH9(() => (hellooSignedInUser() ? "splash-in" : "splash"));
  // True right after a PIN sign-in on this open, so it is not asked twice.
  const hellooJustSignedIn = useRefH9(false);
  const [idValue, setIdValue] = useStateH9("");
  // Sign in by GLOOBAL ID or by mobile number (country code first).
  // How this phone last signed in (GLOOBAL ID or mobile number) is how the
  // sign-in screen opens next time.
  const [idMode, setIdModeRaw] = useStateH9(() => { try { return localStorage.getItem("helloo.signin.mode") === "id" ? "id" : "mobile"; } catch (e) { return "mobile"; } });
  const setIdMode = useCallbackH9((m) => { setIdModeRaw(m); try { localStorage.setItem("helloo.signin.mode", m); } catch (e) { /* ignore */ } }, []);
  const [idMobile, setIdMobile] = useStateH9("");
  const signInAs = idMode === "mobile" ? `+${idMobile}` : idValue;
  const [pin, setPin] = useStateH9("");
  const [pinBusy, setPinBusy] = useStateH9(false);
  const [pinWaking, setPinWaking] = useStateH9(false);
  const [pinShown, setPinShown] = useStateH9(false);
  const pinInFlight = useRefH9(false);
  const [toast, setToast] = useStateH9("");
  // Something shared into Helloo from another app (screens/ShareIn.jsx).
  const [shareIn, setShareIn] = useStateH9(null);
  // A message being passed on (Forward): it goes as a pointer to the one
  // stored copy, never as new bytes (server: forwardOf).
  const [forwardOf, setForwardOf] = useStateH9(null);
  // WhatsApp history kept on this phone (screens/WaImport.jsx): what the
  // open chat has, and whether it is being read.
  const [waInfo, setWaInfo] = useStateH9(null);
  const [waOpen, setWaOpen] = useStateH9(false);
  // Who this account can be here: itself, and each shop it runs.
  const [faces, setFaces] = useStateH9(null);
  useEffectH9(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);
  useEffectH9(() => {
    if (stage !== "splash" && stage !== "splash-in") return undefined;
    if (stage === "splash" && typeof GloobalApi === "object") GloobalApi.warmUp();
    // A first-time splash carries words to read, so it stays longer.
    const t = setTimeout(() => setStage(stage === "splash" ? "id" : "app"), stage === "splash" ? HELLOO_SPLASH_MS : 1200);
    return () => clearTimeout(t);
  }, [stage]);

  // Why this phone was last signed out, shown on the welcome screen.
  const [outNote, setOutNote] = useStateH9("");
  const signOut = useCallbackH9((message) => {
    try { gloobalSessionClear(); } catch (e) { /* ignore */ }
    hellooFaceLoad("");
    setFaces(null);
    setUser(null);
    setPin("");
    setIdValue("");
    setIdMobile("");
    setStage("id");
    if (message) setToast(message);
  }, []);
  useEffectH9(() => {
    // Say why, in words, and keep the server's own reason and the call that
    // was refused on screen: a sign-out nobody can explain cannot be fixed.
    const expired = (event) => {
      const d = (event && event.detail) || {};
      const words = d.reason === "revoked" ? "Your PIN was changed, so this phone was signed out." : d.reason === "expired" ? "It has been a while, so this phone was signed out." : d.reason === "no_account" ? "This account was not found on the server." : "The server did not accept this sign-in.";
      setOutNote(`${words} Sign in again.${d.reason || d.path ? ` (${[d.reason, d.path].filter(Boolean).join(" · ")})` : ""}`);
      signOut("Signed out · sign in again");
    };
    window.addEventListener(GLOOBAL_SESSION_EXPIRED_EVENT, expired);
    return () => window.removeEventListener(GLOOBAL_SESSION_EXPIRED_EVENT, expired);
  }, [signOut]);

  const submitPin = async (value) => {
    if (pinInFlight.current || String(value || "").length !== HELLOO_PIN_LENGTH) return;
    pinInFlight.current = true;
    setPinBusy(true);
    // Render's free plan sleeps; after a few seconds say so instead of
    // looking frozen.
    const waking = setTimeout(() => setPinWaking(true), 5000);
    try {
      const { user: signedIn } = await GloobalApi.login(signInAs, value);
      // The token this sign-in just earned. Saving the session drops it when
      // the phone still holds an old session of a DIFFERENT account, which
      // left the person signed in with no token: every request refused.
      const earned = gloobalAuthToken();
      gloobalSessionSave(signedIn, signedIn.mobileNumber || "", false);
      if (earned && gloobalAuthToken() !== earned) gloobalAuthTokenSave(earned);
      hellooFaceLoad(signedIn.accountId);
      setUser(signedIn);
      setPin("");
      hellooJustSignedIn.current = true;
      setStage("back");
    } catch (err) {
      setPin("");
      setToast((err && err.message) || "Could not sign in. Try again.");
    } finally {
      clearTimeout(waking);
      pinInFlight.current = false;
      setPinBusy(false);
      setPinWaking(false);
    }
  };

  // ── Data ─────────────────────────────────────────────────────────────
  const signedIn = Boolean(user) && stage === "app";
  // ── Fingerprint, face, PIN: GLOOBAL's own checks ─────────────────────
  // The account already chose how it confirms a payment in GLOOBAL (PIN,
  // the phone's fingerprint / Face ID, or the face check); Helloo follows
  // the same choice. The PIN is always behind it.
  const security = (user && user.securitySettings) || null;
  useEffectH9(() => {
    if (!user) return;
    if (typeof gloobalSetBiometricSymbolId === "function") gloobalSetBiometricSymbolId(user.symbolId);
    if (typeof gloobalSetPaymentCheck === "function") gloobalSetPaymentCheck((security && security.paymentCheck) || "pin");
    if (typeof gloobalSetBiometricLoginEnabled === "function") gloobalSetBiometricLoginEnabled(security ? security.biometricLogin !== false : true);
  }, [user && user.symbolId, security && security.paymentCheck, security && security.biometricLogin]);
  // The PIN behind every such check, asked for from one place.
  const [pinFallback, setPinFallback] = useStateH9(null);
  useEffectH9(() => {
    if (typeof gloobalRegisterPinFallbackHost !== "function") return undefined;
    gloobalRegisterPinFallbackHost((opts) => new Promise((resolve) => setPinFallback({ reason: (opts && opts.pinReason) || "Confirm it's you with your PIN.", resolve })));
    return () => gloobalRegisterPinFallbackHost(null);
  }, []);
  const resolvePinFallback = (ok) => { if (pinFallback) pinFallback.resolve(ok); setPinFallback(null); };
  // Locked after more than five minutes away: fingerprint or Face ID where
  // this phone has it for Helloo, else the PIN. Never unlocked without one.
  const [locked, setLocked] = useStateH9(false);
  const [unlocking, setUnlocking] = useStateH9(false);
  const [lockNote, setLockNote] = useStateH9("");
  const unlock = useCallbackH9(async () => {
    if (typeof requireBiometric !== "function") { setLocked(false); return; }
    setUnlocking(true); setLockNote("");
    let ok = false;
    try { ok = await requireBiometric({ symbolId: user && user.symbolId, pinReason: "Confirm it's you to open Helloo.", onBiometricError: (why) => setLockNote(why || "") }); } catch (e) { ok = false; }
    setUnlocking(false);
    if (ok) { setLocked(false); setLockNote(""); if (typeof gloobalMarkAway === "function") gloobalMarkAway(); }
  }, [user && user.symbolId]);
  useEffectH9(() => {
    if (!signedIn || typeof document === "undefined" || typeof gloobalAwayRecently !== "function") return undefined;
    const awayKey = typeof GLOOBAL_LAST_AWAY_KEY === "string" ? GLOOBAL_LAST_AWAY_KEY : "";
    const wasAway = () => { try { return Boolean(awayKey && localStorage.getItem(awayKey)); } catch (e) { return false; } };
    const check = () => { if (wasAway() && !gloobalAwayRecently()) setLocked(true); };
    // A cold open counts: the page was closed, however long ago.
    if (!hellooJustSignedIn.current) check();
    hellooJustSignedIn.current = false;
    const onVis = () => { if (document.visibilityState === "hidden") gloobalMarkAway(); else check(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", gloobalMarkAway);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pagehide", gloobalMarkAway); };
  }, [signedIn]);
  useEffectH9(() => { if (locked && !unlocking && !pinFallback) unlock(); }, [locked]);
  const [photos, setPhotos] = useStateH9({});
  const [contactCards, setContactCards] = useStateH9(null);
  const [chatRows, setChatRows] = useStateH9(null);
  const [threads, setThreads] = useStateH9({});
  const [loadError, setLoadError] = useStateH9("");
  const photosAsked = useRefH9(new Set());

  const askPhotos = useCallbackH9((cards) => {
    const ids = cards.filter((c) => c && c.hasPhoto && !photosAsked.current.has(c.accountId)).map((c) => c.accountId);
    if (user && user.accountId && !photosAsked.current.has(user.accountId)) ids.push(user.accountId);
    if (!ids.length) return;
    ids.forEach((id) => photosAsked.current.add(id));
    for (let i = 0; i < ids.length; i += 40) {
      hellooApi.photos(ids.slice(i, i + 40)).then((r) => setPhotos((p) => { const next = Object.assign({}, p, r.photos || {}); for (const id of Object.keys(r.logos || {})) next["logo:" + id] = r.logos[id]; return next; })).catch(() => ids.forEach((id) => photosAsked.current.delete(id)));
    }
  }, [user]);

  const refreshChats = useCallbackH9(async () => {
    try {
      const r = await hellooApi.chats();
      setChatRows(r.chats || []);
      askPhotos((r.chats || []).map((c) => c.person));
      setLoadError("");
    } catch (err) {
      if (!gloobalApiIsUnreachable(err)) setLoadError(err.message);
      else setLoadError("Waking the GLOOBAL server…");
    }
  }, [askPhotos]);

  const refreshContacts = useCallbackH9(async () => {
    try {
      const r = await hellooApi.contacts();
      setContactCards(r.contacts || []);
      askPhotos(r.contacts || []);
    } catch (err) { /* chats show the error */ }
  }, [askPhotos]);

  useEffectH9(() => {
    if (!signedIn) return;
    refreshChats();
    refreshContacts();
  }, [signedIn, refreshChats, refreshContacts]);

  // ── Sides: personal, or a shop this GLOOBAL ID runs ───────────────────
  // The account this Helloo is being right now: the shop's own account for
  // a further shop, otherwise the signed-in one. `user` stays the person
  // who signed in — money and the PIN are always theirs.
  const meId = hellooFaceNow.as && hellooFaceNow.as !== "self" ? hellooFaceNow.as : (user ? user.accountId : "");
  const activeFace = (faces || []).find((f) => f.as === hellooFaceNow.as) || null;
  const switchFace = (as, url) => {
    if (!user) return;
    hellooFaceSave(user.accountId, as);
    // A clean start on the other side: nothing of this one is carried over.
    try { window.location.replace(url || "/"); } catch (e) { window.location.href = url || "/"; }
  };
  const refreshFaces = useCallbackH9(() => hellooApi.faces().then((r) => {
    const list = r.faces || [];
    setFaces(list);
    const as = hellooFaceNow.as;
    if (list.length <= 1) { if (as) hellooFaceSave(hellooFaceNow.account, ""); return; }
    // The side kept on this phone is gone (a shop was closed): personal.
    if (as && !list.some((f) => f.as === as)) { hellooFaceSave(hellooFaceNow.account, "self"); try { window.location.replace("/"); } catch (e) { /* ignore */ } return; }
    // First time here with a shop: ask which side to use.
    if (!as) setSheet((s) => s || "face");
  }).catch(() => {}), []);
  useEffectH9(() => { if (signedIn) refreshFaces(); }, [signedIn, refreshFaces]);

  const me = useMemoH9(() => {
    const base = hellooMeFrom(user, user && photos[user.accountId]);
    if (!base || !activeFace || activeFace.kind !== "shop") return base;
    return Object.assign({}, base, { accountId: activeFace.accountId, id: activeFace.gloobalId, gloobalId: activeFace.gloobalId, name: activeFace.name, handle: activeFace.handle, photo: activeFace.primary ? base.photo : null });
  }, [user, photos, faces]);
  // The people on the other end of your PRIVATE chats. They are left out of
  // every list Helloo draws — contacts, suggestions, call history — because
  // a name in any of them is the same glance a chat list would give.
  const privatePeople = useMemoH9(() => new Set((chatRows || []).filter((c) => c.private && c.person).map((c) => c.person.accountId)), [chatRows]);
  const privatePeopleRef = useRefH9(privatePeople);
  privatePeopleRef.current = privatePeople;
  const contacts = useMemoH9(() => (contactCards || []).filter((c) => !privatePeople.has(c.accountId)).map((c) => hellooPersonFrom(c, photos)), [contactCards, photos, privatePeople]);

  // ── Navigation ───────────────────────────────────────────────────────
  const [tab, setTab] = useStateH9("chats");
  const [socialCompose, setSocialCompose] = useStateH9(0);
  const [dialSaving, setDialSaving] = useStateH9(false);
  const [openId, setOpenId] = useStateH9(null);
  const [screen, setScreen] = useStateH9(null);
  const [sheet, setSheet] = useStateH9(null);
  // The dial pad looks through the people you already have.
  useEffectH9(() => { if (sheet === "dial") refreshContacts(); }, [sheet === "dial"]);
  const [filter, setFilter] = useStateH9("all");
  const [query, setQuery] = useStateH9("");
  // GLOOBAL बाज़ार, a screen of its own (the bazaar button over New chat).
  const [bazaarQ, setBazaarQ] = useStateH9("");
  // A shop picked in Bazaar opens on its Helloo profile.
  const openBazaarShop = async (shop) => {
    try {
      const id = shop && shop.symbolId ? shop.symbolId : ((await GloobalApi.resolveCreatorHandle((shop && shop.handle) || "")) || {}).symbolId;
      if (!id) { setToast("Could not open that shop just now."); return; }
      openChatWith(id, true);
    } catch (err) { setToast("Could not open that shop just now."); }
  };
  // ── The pause after wrong tries ────────────────────────────────────────
  //
  // A private chat answers only to its whole saved name, and a short one
  // ("()+") could in principle be found by trying. So tries are counted:
  // text of three characters or more that sits in the box and is no
  // private chat's name is one miss, and after five in a row private chats
  // stop answering for a minute — to the right name too, so the pause
  // tells a guesser nothing. Ordinary chats are never paused.
  const [privateMisses, setPrivateMisses] = useStateH9(0);
  const [privateLockUntil, setPrivateLockUntil] = useStateH9(() => { try { return Number(localStorage.getItem("helloo.privateLockUntil")) || 0; } catch (e) { return 0; } });
  const [, setLockTick] = useStateH9(0);
  const privateLocked = privateLockUntil > Date.now();
  useEffectH9(() => {
    if (!privateLocked) return undefined;
    const id = setTimeout(() => setLockTick((n) => n + 1), Math.max(500, privateLockUntil - Date.now() + 50));
    return () => clearTimeout(id);
  }, [privateLockUntil, privateLocked]);
  useEffectH9(() => {
    const typed = hellooNameKey(query);
    if (typed.length < HELLOO_PRIVATE_NAME_MIN || privateLocked) return undefined;
    if (!(chatRows || []).some((c) => c.private)) return undefined;
    const id = setTimeout(() => {
      if (hellooIsPrivateName(chatRows, query)) { setPrivateMisses(0); return; }
      setPrivateMisses((n) => {
        if (n + 1 < 5) return n + 1;
        const until = Date.now() + 60000;
        try { localStorage.setItem("helloo.privateLockUntil", String(until)); } catch (e) { /* private window */ }
        setPrivateLockUntil(until);
        return 0;
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [query, privateLocked, chatRows]);
  const openIdRef = useRefH9(null);
  openIdRef.current = openId;

  // ── Chat essentials state ───────────────────────────────────────────
  const [typing, setTyping] = useStateH9({}); // chatId -> until (ms)
  const [presence, setPresence] = useStateH9({}); // accountId -> { online, lastSeenAt }
  const [blocked, setBlocked] = useStateH9(null); // [card] once loaded
  const [replyTo, setReplyTo] = useStateH9(null); // { chatId, id, who, preview }
  const [held, setHeld] = useStateH9(null); // the message whose actions are open
  const [heldChat, setHeldChat] = useStateH9(null); // the chat row whose actions are open
  const [photoView, setPhotoView] = useStateH9(null); // url of a photo open full-screen
  const [photoMeta, setPhotoMeta] = useStateH9(null); // { id, kind, fx, canSave, mine, once } of what is open
  const [snapCam, setSnapCam] = useStateH9(false);
  const [snapBusy, setSnapBusy] = useStateH9(null);
  // The media of the chat whose profile is open: { chatId, loading, list, counts }.
  const [profileMedia, setProfileMedia] = useStateH9(null);
  const [mediaFilter, setMediaFilter] = useStateH9("all");
  const [watchAsk, setWatchAsk] = useStateH9(null); // { go } while the first-open warning is up
  // A GLOOBAL code found in the open photo: { status: "looking" | "found" |
  // "none", gloobalId, person }. Read the moment a photo opens, so a code
  // somebody shared in a chat is one tap from paying.
  const [photoQr, setPhotoQr] = useStateH9(null);
  const scanFileRef = useRefH9(null);
  const [mediaUrls, setMediaUrls] = useStateH9({}); // messageId -> object URL
  const mediaAsked = useRefH9(new Set());
  const liveSend = useRefH9(null);
  const typingSentAt = useRefH9(0);
  const galleryRef = useRefH9(null);
  const cameraRef = useRefH9(null);
  useEffectH9(() => {
    const ids = Object.keys(typing);
    if (!ids.length) return undefined;
    const t = setTimeout(() => setTyping((all) => { const now = Date.now(); const next = {}; for (const k of Object.keys(all)) if (all[k] > now) next[k] = all[k]; return next; }), 1000);
    return () => clearTimeout(t);
  }, [typing]);
  const isBlocked = (accountId) => Boolean((blocked || []).some((b) => b.accountId === accountId));
  const refreshBlocked = useCallbackH9(() => hellooApi.blocked().then((r) => setBlocked(r.people || [])).catch(() => {}), []);
  useEffectH9(() => { if (signedIn) refreshBlocked(); }, [signedIn, refreshBlocked]);

  // ── Pay to reach state ─────────────────────────────────────────────
  const [myReach, setMyReach] = useStateH9(null); // GET /api/helloo/reach
  const [reachCards, setReachCards] = useStateH9({}); // accountId -> { rule, askPending }
  const [asks, setAsks] = useStateH9([]);
  const [priceGate, setPriceGate] = useStateH9(null); // { chatId, body, person, rule, balance }
  const [reachPin, setReachPin] = useStateH9(null); // waiting for the PIN to pay a price
  const [askText, setAskText] = useStateH9("");
  const [giveBack, setGiveBack] = useStateH9({ percent: 50, busy: false });
  const [giveBackPin, setGiveBackPin] = useStateH9(null);
  const [earnings, setEarnings] = useStateH9(null);
  // Paid to reach me, by month: "" is this month, else "YYYY-MM".
  const [earningsMonth, setEarningsMonth] = useStateH9("");
  const earningsFromMe = useRefH9(false);
  const thisMonth = () => { const d = new Date(); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`; };
  const openEarnings = (month) => {
    const m = month && month !== thisMonth() ? month : "";
    setEarningsMonth(m);
    setEarnings(null);
    hellooApi.earnings(m).then(setEarnings).catch((err) => setToast(err.message));
    setScreen("earnings");
  };
  const stepMonth = (by) => { const [y, mo] = (earningsMonth || thisMonth()).split("-").map(Number); const d = new Date(Date.UTC(y, mo - 1 + by, 1)); openEarnings(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`); };
  const monthLabel = (m) => { const [y, mo] = (m || thisMonth()).split("-").map(Number); return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }); };
  // Privacy: my photo, nothing, or an emoji in its place.
  const setPicture = (picture) => {
    const before = myReach && myReach.picture;
    setMyReach((r) => (r ? Object.assign({}, r, { picture }) : r));
    hellooApi.saveReach({ picture }).then(() => setToast(picture.mode === "photo" ? "People see your photo" : picture.mode === "emoji" ? `People see ${picture.emoji} instead of your photo` : "Your photo is hidden · people see your initials")).catch((err) => { setMyReach((r) => (r ? Object.assign({}, r, { picture: before }) : r)); setToast(err.message); });
  };
  // Privacy: hide when I am online and when I was last seen.
  const setHideLastSeen = (hide) => {
    setMyReach((r) => (r ? Object.assign({}, r, { hideLastSeen: hide }) : r));
    hellooApi.saveReach({ hideLastSeen: hide }).then(() => setToast(hide ? "Nobody sees when you're online now" : "People you chat with see when you're online")).catch((err) => { setMyReach((r) => (r ? Object.assign({}, r, { hideLastSeen: !hide }) : r)); setToast(err.message); });
  };
  const agreedRef = useRefH9(new Set());
  const pinCacheRef = useRefH9({ pin: null, at: 0 });
  const reachSaveTimer = useRefH9(null);
  const refreshMyReach = useCallbackH9(() => hellooApi.reach().then((r) => { if (r && r.people && r.business) setMyReach(r); }).catch(() => {}), []);
  const refreshMyReachRef = useRefH9(refreshMyReach);
  refreshMyReachRef.current = refreshMyReach;
  const refreshAsks = useCallbackH9(() => hellooApi.asks().then((r) => setAsks(r.asks || [])).catch(() => {}), []);
  const refreshCard = useCallbackH9((accountId) => {
    if (!accountId) return Promise.resolve(null);
    return hellooApi.reachCard(accountId).then((r) => { setReachCards((all) => Object.assign({}, all, { [accountId]: { rule: r.rule, askPending: r.askPending } })); return r; }).catch(() => null);
  }, []);
  useEffectH9(() => { if (signedIn) { refreshMyReach(); refreshAsks(); } }, [signedIn, refreshMyReach, refreshAsks]);
  const allowedIds = new Set(((myReach && myReach.allowed) || []).map((p) => p.accountId));

  // ── Threads ──────────────────────────────────────────────────────────
  const mergeMessages = (list, incoming) => {
    const out = list.slice();
    for (const m of incoming) {
      const at = out.findIndex((x) => (m.id && x.id === m.id) || (m.clientId && x.clientId === m.clientId && x.from === m.from));
      if (at >= 0) out[at] = Object.assign({}, out[at], m, { failed: false });
      else out.push(m);
    }
    return out.sort((a, b) => new Date(a.at) - new Date(b.at));
  };

  const loadThread = useCallbackH9(async (chatId, older) => {
    const current = threads[chatId];
    const before = older && current && current.messages.length ? current.messages.find((m) => m.id) : null;
    try {
      const r = await hellooApi.messages(chatId, before ? before.at : null);
      setThreads((all) => {
        const prev = all[chatId] || { messages: [] };
        return Object.assign({}, all, { [chatId]: { chat: r.chat, messages: mergeMessages(prev.messages, r.messages || []), more: older ? r.more : (prev.loaded ? prev.more : r.more), loaded: true } });
      });
      askPhotos([r.chat && r.chat.person]);
      const who = r.chat && r.chat.person && r.chat.person.accountId;
      if (who && !older) refreshCard(who);
      if (who && !older) hellooApi.presence(who).then((pr) => setPresence((all) => Object.assign({}, all, { [who]: { online: pr.online, lastSeenAt: pr.lastSeenAt } }))).catch(() => {});
    } catch (err) {
      setToast(gloobalApiIsUnreachable(err) ? "Waking the GLOOBAL server…" : err.message);
    }
  }, [threads, askPhotos]);

  const markRead = useCallbackH9((chatId) => {
    setChatRows((rows) => (rows || []).map((c) => (c.id === chatId ? Object.assign({}, c, { unread: 0 }) : c)));
    hellooApi.read(chatId).catch(() => {});
  }, []);

  // Set when a chat or profile was opened from the Contacts list, so Back
  // lands on Contacts again instead of the home list.
  const backToContactsRef = useRefH9(false);
  const openChat = useCallbackH9((chatId) => {
    backToContactsRef.current = false;
    setFreshFrom((f) => (f[chatId] ? Object.assign({}, f, { [chatId]: 0 }) : f));
    setOpenId(chatId);
    setSheet(null);
    setReplyTo(null);
    loadThread(chatId, false);
    markRead(chatId);
  }, [loadThread, markRead]);

  // `face` is "self" when it was the person who was found (by their mobile
  // number), not the shop the same account runs.
  // A chat you keep private, reached by their GLOOBAL ID (not its name),
  // opens as a fresh chat: nothing before now, their own name at the top.
  // Only typing its whole name shows the private chat itself.
  const [freshFrom, setFreshFrom] = useStateH9({});
  // Releasing a private chat once: { chatId, pin, busy, error, mode: "give" | "take" }.
  const [release, setRelease] = useStateH9(null);
  const runRelease = async () => {
    if (!release || release.busy || !release.pin) return;
    setRelease(Object.assign({}, release, { busy: true, error: "" }));
    try {
      if (release.mode === "give") {
        await hellooApi.releaseChat(release.chatId, release.pin);
        setSheet(null); setRelease(null); refreshChats();
        setToast("Released · they have 10 minutes to open it");
      } else {
        await hellooApi.openReleased(release.chatId, release.pin);
        const row = (chatRows || []).find((c) => c.id === release.chatId);
        setSheet(null); setRelease(null);
        openChat(release.chatId);
        // They must give it a name again before reading it: private again.
        if (row) setTimeout(() => openNameEdit(row, true), 50);
      }
    } catch (err) {
      setRelease((now) => (now ? Object.assign({}, now, { busy: false, pin: "", error: (err && err.message) || "That didn't work. Try again." }) : now));
    }
  };
  // draft: a line put in the message box, for the person to send (Work: applying).
  const openChatWith = useCallbackH9(async (who, profile, fromContacts, face, draft) => {
    try {
      const r = await hellooApi.open(who, face);
      const chat = r && r.chat;
      if (!chat || !chat.id) throw new Error("Could not open that chat.");
      const keptPrivate = Boolean(chat.private || (chatRows || []).some((c) => c.id === chat.id && c.private));
      setThreads((all) => (all[chat.id] ? all : Object.assign({}, all, { [chat.id]: { chat, messages: [], more: false, loaded: false } })));
      setScreen(profile ? "contact" : null);
      setSheet(null);
      openChat(chat.id);
      if (draft) setDrafts((d) => Object.assign({}, d, { [chat.id]: String(draft).slice(0, 2000) }));
      if (keptPrivate) setFreshFrom((f) => Object.assign({}, f, { [chat.id]: Date.now() }));
      backToContactsRef.current = Boolean(fromContacts);
      refreshContacts();
    } catch (err) {
      setToast(err.message || "Could not open that chat.");
    }
  }, [openChat]);

  // Deep links (a notification, a scanned QR) once signed in.
  useEffectH9(() => {
    if (!signedIn) return;
    const link = hellooDeepLink();
    if (!link) return;
    hellooClearDeepLink();
    if (link.requests) { setScreen("requests"); return; }
    if (link.calls) { setTab("calls"); return; }
    if (link.chatId) openChat(link.chatId);
    else if (link.gloobalId && link.gloobalId !== user.symbolId) openChatWith(link.gloobalId);
  }, [signedIn]);

  // No open links: fetch the view pass for people's pictures as soon as
  // Helloo is signed in (GLOOBAL features/viewpass), with Helloo's client.
  useEffectH9(() => {
    if (!signedIn) return;
    gloobalViewPassUse(hellooHttp);
    gloobalViewPassRefresh();
  }, [signedIn]);

  // Shared in from another app: read it once, then "Send to…".
  useEffectH9(() => {
    if (!signedIn) return undefined;
    let live = true;
    hellooReadShareIn().then((got) => { if (!live || !got) return; hellooClearDeepLink(); setShareIn(got); });
    return () => { live = false; };
  }, [signedIn]);
  useEffectH9(() => {
    setWaOpen(false);
    if (!openId) { setWaInfo(null); return undefined; }
    try { const raw = localStorage.getItem("helloo.wa." + openId); setWaInfo(raw ? JSON.parse(raw) : null); } catch (e) { setWaInfo(null); }
    return undefined;
  }, [openId]);
  const importWa = async (row, meName) => {
    const got = shareIn && shareIn.wa;
    if (!got) return;
    try {
      const record = hellooWaRecord(got, meName);
      await hellooWaPut(row.id, record);
      const info = { counts: record.counts, from: record.messages[0] && record.messages[0].at, to: record.messages.length ? record.messages[record.messages.length - 1].at : null };
      try { localStorage.setItem("helloo.wa." + row.id, JSON.stringify(info)); } catch (e) { /* the row just won't show */ }
      setShareIn(null);
      setScreen(null);
      openChat(row.id);
      setWaInfo(info);
      setToast(`WhatsApp history imported · ${record.counts.messages.toLocaleString("en-IN")} messages`);
    } catch (err) {
      setToast((err && err.message) || "Couldn't import that chat");
    }
  };
  // Forward: the server makes the new message point at the original.
  const sendForward = async (row) => {
    const m = forwardOf;
    if (!m) return;
    try {
      await hellooApi.send(row.id, { clientId: hellooClientId(), forwardOf: m.id });
      setForwardOf(null);
      setToast(`Forwarded to ${(row.person && (row.person.handle || row.person.name)) || "the chat"}`);
      refreshChats && refreshChats();
    } catch (err) {
      setToast((err && err.message) || "Couldn't forward that");
    }
  };
  const sendShareIn = async (row) => {
    const got = shareIn;
    if (!got) return;
    try {
      setScreen(null);
      openChat(row.id);
      if (got.file) {
        const shot = await hellooCompressPhoto(got.file);
        deliver(row.id, { kind: "photo", image: shot.image, mime: shot.mime, width: shot.width, height: shot.height, text: got.text || "", localSrc: shot.preview });
      } else {
        deliver(row.id, { kind: "text", text: got.text });
      }
      setShareIn(null);
    } catch (err) {
      setToast((err && err.message) || "Couldn't send that");
    }
  };

  // ── Live ─────────────────────────────────────────────────────────────
  const live = useHellooLive(signedIn, (frame) => {
    // Something for another of this account's sides (a shop it runs while
    // this Helloo is personal, or the other way round). A call cannot
    // wait, so Helloo goes to that side to ring; anything else only
    // updates that side's count.
    if (frame.as && user && frame.type !== "ready" && frame.as !== meId) {
      if (frame.type === "call-incoming" && frame.call && !callRef.current) {
        switchFace(frame.as === user.accountId ? (frame.call.side === "shop" ? user.accountId : "self") : frame.as, `/?call=${encodeURIComponent(frame.call.id)}`);
      } else if (frame.type === "message") refreshFaces();
      return;
    }
    if (frame.type === "message" && (faces || []).length > 1) refreshFaces();
    if (frame.type === "ready") {
      // Back after a drop: pick up whatever arrived meanwhile.
      refreshChats();
      if (openIdRef.current) loadThread(openIdRef.current, false);
      return;
    }
    if (frame.type === "message" && frame.message) {
      const m = frame.message;
      setThreads((all) => (all[m.chatId] ? Object.assign({}, all, { [m.chatId]: Object.assign({}, all[m.chatId], { messages: mergeMessages(all[m.chatId].messages, [m]) }) }) : all));
      const theirs = user && m.from !== meId;
      if (theirs) setTyping((all) => { if (!all[m.chatId]) return all; const next = Object.assign({}, all); delete next[m.chatId]; return next; });
      if (theirs && openIdRef.current === m.chatId && document.visibilityState === "visible") hellooApi.read(m.chatId).catch(() => {});
      refreshChats();
      return;
    }
    if (frame.type === "read") {
      const patch = (c) => (c && c.id === frame.chatId ? Object.assign({}, c, { theyReadAt: frame.at }) : c);
      setChatRows((rows) => (rows || []).map(patch));
      setThreads((all) => (all[frame.chatId] ? Object.assign({}, all, { [frame.chatId]: Object.assign({}, all[frame.chatId], { chat: patch(all[frame.chatId].chat) }) }) : all));
      return;
    }
    if (frame.type === "typing") {
      setTyping((all) => Object.assign({}, all, { [frame.chatId]: Date.now() + 5000 }));
      return;
    }
    if (frame.type === "presence") {
      setPresence((all) => Object.assign({}, all, { [frame.accountId]: { online: frame.online, lastSeenAt: frame.lastSeenAt } }));
      return;
    }
    if (frame.type === "update" && frame.message) {
      const m = frame.message;
      setThreads((all) => (all[m.chatId] ? Object.assign({}, all, { [m.chatId]: Object.assign({}, all[m.chatId], { messages: all[m.chatId].messages.map((x) => (x.id === m.id ? m : x)) }) }) : all));
      refreshChats();
      return;
    }
    if (frame.type === "release") { refreshChats(); return; }
    if (frame.type === "ask") {
      refreshAsks();
      return;
    }
    if (frame.type === "call-incoming" && frame.call) { onIncomingCall(frame.call); return; }
    if (frame.type === "call-update" && frame.call) {
      const c = callRef.current;
      if (c && c.id === frame.call.id) {
        if (frame.call.status === "answered" && c.direction === "out") {
          stopTone();
          setCall((x) => Object.assign({}, x, { state: "connecting" }));
          makePeer(c).then((peer) => peer.offer()).catch(() => { setToast("Could not start the call"); hangUp(); });
        } else if (["ended", "missed", "declined", "cancelled"].includes(frame.call.status)) {
          endCallLocally(frame.call.status);
          if (frame.call.status === "declined" && c.direction === "out") setToast(`${c.person.name.split(" ")[0]} declined`);
          if (frame.call.status === "missed" && c.direction === "out") setToast("No answer");
        }
      }
      refreshCalls();
      return;
    }
    if (frame.type === "signal" && frame.callId) {
      const c = callRef.current;
      if (c && c.id === frame.callId) {
        (peerRef.current ? Promise.resolve(peerRef.current) : makePeer(c)).then((peer) => peer.handle(frame.data)).catch(() => {});
      }
      return;
    }
    if (frame.type === "media-gone") {
      if (frame.chatId && threadsRef.current[frame.chatId]) loadThread(frame.chatId);
      setPhotoView((cur) => cur); return;
    }
    if (frame.type === "media-opened" || frame.type === "media-saved") {
      if (frame.type === "media-saved") setToast(frame.kind === "video" ? "They saved your video" : "They saved your photo");
      if (frame.chatId && threadsRef.current[frame.chatId]) loadThread(frame.chatId);
      return;
    }
    if (frame.type === "ask-answer") {
      refreshCard(frame.to);
      if (frame.allowed) { setToast("Your request was accepted · message them free"); refreshChats(); }
      else if (frame.paid) setToast(`You can write to them by paying ${hellooMoneyText(frame.price, frame.currency)} a message`);
      return;
    }
    if (frame.type === "hidden") {
      setThreads((all) => (all[frame.chatId] ? Object.assign({}, all, { [frame.chatId]: Object.assign({}, all[frame.chatId], { messages: all[frame.chatId].messages.filter((x) => x.id !== frame.id) }) }) : all));
    }
  }, liveSend);

  // ── Sending ──────────────────────────────────────────────────────────
  const [drafts, setDrafts] = useStateH9({});

  const threadsRef = useRefH9(threads);
  threadsRef.current = threads;
  const sendMessage = useCallbackH9(async (chatId, body) => {
    const clientId = body.clientId || hellooClientId();
    const optimistic = Object.assign({ clientId, from: meId, at: new Date().toISOString(), chatId },
      body.kind === "voice" ? { kind: "voice", voice: { seconds: body.seconds } }
        : body.kind === "text" ? { kind: "text", text: body.text }
          : body.kind === "sticker" ? { kind: "sticker", sticker: { id: body.stickerId } }
          : body.kind === "video" ? { kind: "video", text: body.text || "", video: { seconds: body.seconds, width: body.width, height: body.height }, view: { mode: body.view || "keep", save: Boolean(body.allowSave) }, fx: body.fx || "", localSrc: body.localSrc }
          : body.kind === "photo" ? { kind: "photo", text: body.text || "", photo: { width: body.width, height: body.height }, view: { mode: body.view || "keep", save: Boolean(body.allowSave) }, fx: body.fx || "", localSrc: body.localSrc }
            : { kind: body.kind },
      body.replyPreview ? { replyTo: body.replyPreview } : {});
    const wire = Object.assign({}, body);
    delete wire.localSrc;
    delete wire.replyPreview;
    if (body.kind !== "payment" && body.kind !== "order") {
      setThreads((all) => Object.assign({}, all, { [chatId]: Object.assign({ messages: [] }, all[chatId], { messages: mergeMessages((all[chatId] || { messages: [] }).messages, [optimistic]) }) }));
    }
    try {
      const r = await hellooApi.send(chatId, Object.assign({}, wire, { clientId }));
      // Writing to someone allows them (server side); keep the list in step.
      if (refreshMyReachRef.current) refreshMyReachRef.current();
      setThreads((all) => Object.assign({}, all, { [chatId]: Object.assign({ messages: [] }, all[chatId], { messages: mergeMessages((all[chatId] || { messages: [] }).messages, [r.message]) }) }));
      refreshChats();
      return r.message;
    } catch (err) {
      setThreads((all) => {
        const t = all[chatId];
        if (!t) return all;
        return Object.assign({}, all, { [chatId]: Object.assign({}, t, { messages: t.messages.map((m) => (m.clientId === clientId && !m.id ? Object.assign({}, m, { failed: true, retryBody: Object.assign({}, body, { clientId }) }) : m)) }) });
      });
      if (body.kind === "payment" || body.kind === "order") throw err;
      if (err && err.body && (err.body.code === "reach_payment_required" || err.body.code === "reach_closed")) {
        const t = threadsRef.current[chatId];
        const who = t && t.chat && t.chat.person && t.chat.person.accountId;
        if (who) refreshCard(who);
      }
      // Not verified to host photos, clips or voice notes (GLOOBAL
      // lib/verifiedId.js): not a retry — the bubble goes and says why.
      if (err && err.body && (err.body.code === "blocked_by_them" || err.body.code === "you_blocked" || err.body.code === "reach_payment_required" || err.body.code === "reach_closed" || err.body.code === "verify_id")) {
        // Not a network problem: take the bubble away and say why.
        setThreads((all) => (all[chatId] ? Object.assign({}, all, { [chatId]: Object.assign({}, all[chatId], { messages: all[chatId].messages.filter((m) => m.clientId !== clientId || m.id) }) }) : all));
      }
      setToast(gloobalApiIsUnreachable(err) ? "Not sent yet · the server is waking up" : err.message);
      return null;
    }
  }, [user, refreshChats]);

  // ── Deliver: free, or pay their price first ─────────────────────────
  const personOf = (chatId) => {
    const t = threadsRef.current[chatId];
    const chat = (t && t.chat) || (chatRows || []).find((c) => c.id === chatId);
    return chat ? hellooPersonFrom(chat.person, photos) : null;
  };
  const payAndSend = async (gate, pinGiven) => {
    const fresh = pinCacheRef.current.pin && Date.now() - pinCacheRef.current.at < 5 * 60e3;
    const pinValue = pinGiven || (fresh ? pinCacheRef.current.pin : null);
    if (!pinValue) { setReachPin(gate); return; }
    setReachPin(null);
    setPriceGate((g) => (g ? Object.assign({}, g, { busy: true }) : g));
    try {
      const result = await GloobalApi.sendTransaction({
        senderSymbolId: user.symbolId,
        receiverSymbolId: gate.person.gloobalId,
        amountBasis: "destination",
        destinationAmount: gate.rule.price,
        amount: gate.rule.price,
        note: "Helloo message",
        pin: pinValue,
        payMethod: "helloo-reach",
        idempotencyKey: `helloo-reach-${hellooClientId()}`
      });
      pinCacheRef.current = { pin: pinValue, at: Date.now() };
      agreedRef.current.add(gate.person.accountId);
      setPriceGate(null);
      const reachRef = result && result.transaction && result.transaction.referenceId;
      await sendMessage(gate.chatId, Object.assign({}, gate.body, { reachRef }));
    } catch (err) {
      pinCacheRef.current = { pin: null, at: 0 };
      setPriceGate((g) => (g ? Object.assign({}, g, { busy: false }) : g));
      setToast(gloobalApiIsUnreachable(err) ? "The GLOOBAL server is waking up. Try again." : err.message);
    }
  };
  const deliver = (chatId, body) => {
    const person = personOf(chatId);
    const card = person && reachCards[person.accountId];
    const rule = card && card.rule;
    if (!person || !rule || rule.free) return sendMessage(chatId, body);
    if (rule.closed) { setAskText(""); setSheet("ask"); return null; }
    const gate = { chatId, body, person, rule };
    if (!agreedRef.current.has(person.accountId)) {
      setPriceGate(gate);
      GloobalApi.getProfile(user.symbolId).then((u) => setPriceGate((g) => (g && g.chatId === chatId ? Object.assign({}, g, { balance: Number(u.balance) }) : g))).catch(() => {});
      return null;
    }
    return payAndSend(gate);
  };
  const giveBackNow = async (person, chatId, earned, percent, pinValue) => {
    setGiveBackPin(null);
    const amount = Math.round(earned * percent) / 100;
    if (!(amount > 0)) return;
    setGiveBack((g) => Object.assign({}, g, { busy: true }));
    try {
      const result = await GloobalApi.sendTransaction({
        senderSymbolId: user.symbolId,
        receiverSymbolId: person.gloobalId,
        amountBasis: "source",
        sourceAmount: amount,
        amount,
        note: "Helloo give back",
        pin: pinValue,
        payMethod: "helloo-giveback",
        idempotencyKey: `helloo-gb-${hellooClientId()}`
      });
      const referenceId = result && result.transaction && result.transaction.referenceId;
      if (referenceId) { try { await sendMessage(chatId, { kind: "payment", referenceId, percent }); } catch (e) { /* the money moved */ } }
      setGiveBack({ percent: 50, busy: false });
      setSheet(null);
      setToast(`Gave back ${hellooMoneyText(amount, me.currency)}`);
    } catch (err) {
      setGiveBack((g) => Object.assign({}, g, { busy: false }));
      setToast(gloobalApiIsUnreachable(err) ? "The GLOOBAL server is waking up. Try again." : err.message);
    }
  };
  const answerAsk = async (ask, action, price) => {
    try {
      const r = await hellooApi.answerAsk(ask.id, action, price);
      setAsks((list) => list.filter((a) => a.id !== ask.id));
      refreshMyReach();
      if (action === "allow" && r.chatId) { setScreen(null); refreshChats(); openChat(r.chatId); }
      else if (action === "paid") setToast(`${(ask.person && ask.person.name ? ask.person.name.split(" ")[0] : "They")} can write by paying ${hellooMoneyText(r.price, r.currency)} a message`);
      else setToast("Declined");
    } catch (err) { setToast(err.message); }
  };
  const saveReach = (prices) => {
    setMyReach((r) => Object.assign({}, r, prices));
    clearTimeout(reachSaveTimer.current);
    reachSaveTimer.current = setTimeout(() => {
      hellooApi.saveReach({ people: prices.people, business: prices.business }).then(() => refreshMyReach()).catch((err) => setToast(err.message));
    }, 500);
  };

  const retryFailed = (chatId) => {
    const t = threads[chatId];
    if (!t) return;
    t.messages.filter((m) => m.failed && m.retryBody).forEach((m) => sendMessage(chatId, m.retryBody));
  };

  // ── Voice ────────────────────────────────────────────────────────────
  const [recording, setRecording] = useStateH9(null);
  const recorderRef = useRefH9(null);
  const stopAndSend = async () => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    setRecording(null);
    if (!rec) return;
    const result = await rec.stop();
    if (result && openIdRef.current) deliver(openIdRef.current, { kind: "voice", audio: result.audio, mime: result.mime, seconds: Math.round(result.seconds * 10) / 10 });
  };
  const startRecording = async () => {
    const rec = hellooVoiceRecorder((s) => setRecording({ seconds: s }), () => stopAndSend());
    try {
      await rec.start();
      recorderRef.current = rec;
      setRecording({ seconds: 0 });
    } catch (err) {
      setToast(err && err.name === "NotAllowedError" ? "Allow the microphone to send voice notes" : (err && err.message) || "Could not start recording");
    }
  };
  const cancelRecording = () => {
    if (recorderRef.current) recorderRef.current.cancel();
    recorderRef.current = null;
    setRecording(null);
  };

  const [voicePlay, setVoicePlay] = useStateH9({ id: null, progress: 0 });
  const audioRef = useRefH9(null);
  const voiceUrls = useRefH9({});
  const playVoice = async (messageId) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.ontimeupdate = () => { const a = audioRef.current; if (a && a.duration) setVoicePlay((v) => Object.assign({}, v, { progress: a.currentTime / a.duration })); };
      audioRef.current.onended = () => setVoicePlay({ id: null, progress: 0 });
    }
    const a = audioRef.current;
    if (voicePlay.id === messageId && !a.paused) { a.pause(); setVoicePlay({ id: null, progress: 0 }); return; }
    try {
      if (!voiceUrls.current[messageId]) {
        const r = await hellooApi.voice(messageId);
        const bytes = hellooB64ToBytes(r.audio);
        voiceUrls.current[messageId] = URL.createObjectURL(new Blob([bytes], { type: r.mime }));
      }
      a.src = voiceUrls.current[messageId];
      setVoicePlay({ id: messageId, progress: 0 });
      await a.play();
    } catch (err) {
      setVoicePlay({ id: null, progress: 0 });
      setToast("Could not play that voice note");
    }
  };

  // ── Photos ───────────────────────────────────────────────────────────
  const loadMedia = useCallbackH9((messageId) => {
    if (!messageId || mediaAsked.current.has(messageId)) return;
    mediaAsked.current.add(messageId);
    hellooApi.media(messageId)
      .then((r) => { const url = URL.createObjectURL(new Blob([hellooB64ToBytes(r.audio)], { type: r.mime })); setMediaUrls((all) => Object.assign({}, all, { [messageId]: url })); })
      .catch(() => mediaAsked.current.delete(messageId));
  }, []);
  // Open a clip or a see-once photo: asked for now, shown, and (see once)
  // forgotten when closed.
  const openSnap = (m, meta, src) => {
    if (src && !meta.once) { setPhotoMeta(meta); setPhotoView(src); return; }
    if (!m.id || snapBusy) return;
    setSnapBusy(m.id);
    hellooApi.media(m.id).then((r) => {
      const url = URL.createObjectURL(new Blob([hellooB64ToBytes(r.audio)], { type: r.mime }));
      if (!meta.once) setMediaUrls((all) => Object.assign({}, all, { [m.id]: url }));
      setPhotoMeta(meta); setPhotoView(url);
    }).catch((err) => setToast(err && err.body && err.body.code === "gone" ? "That is gone now" : "Couldn't open that")).then(() => setSnapBusy(null));
  };
  const closePhoto = () => {
    const meta = photoMeta;
    if (meta && meta.once && photoView) { try { URL.revokeObjectURL(photoView); } catch (e) { /* fine */ } if (openIdRef.current) loadThread(openIdRef.current); }
    setPhotoView(null); setPhotoMeta(null);
  };
  const savePhoto = () => {
    const meta = photoMeta || { kind: "photo", fx: "" };
    hellooSaveMedia(photoView, meta.kind, meta.fx);
    if (meta.id && !meta.mine) hellooApi.saved(meta.id).catch(() => {});
    setToast(meta.mine ? "Saved" : "Saved · they are told you saved it");
  };
  const sendSnap = async (shot) => {
    const chatId = openIdRef.current;
    if (!chatId) return;
    if (shot.kind === "video") {
      if (shot.blob.size > 8 * 1024 * 1024) throw new Error("That clip is over 8 MB. Try a shorter one.");
      const b64 = await hellooBlobToB64(shot.blob);
      setSnapCam(false);
      deliver(chatId, { allowSave: Boolean(shot.allowSave), kind: "video", video: b64, mime: String(shot.blob.type || "video/mp4").split(";")[0], seconds: Math.max(1, Math.min(30, shot.seconds)), width: shot.width, height: shot.height, text: shot.caption, view: shot.view, fx: shot.fx, localSrc: shot.url });
      return;
    }
    const small = await hellooCompressPhoto(shot.blob);
    setSnapCam(false);
    deliver(chatId, { allowSave: Boolean(shot.allowSave), kind: "photo", image: small.image, mime: small.mime, width: small.width, height: small.height, text: shot.caption, view: shot.view, fx: shot.fx, localSrc: small.preview });
  };
  const pickPhoto = async (file) => {
    if (!file || !openIdRef.current) return;
    setSheet(null);
    try {
      const shot = await hellooCompressPhoto(file);
      const caption = (drafts[openIdRef.current] || "").trim();
      if (caption) setDrafts((d) => Object.assign({}, d, { [openIdRef.current]: "" }));
      const reply = replyTo && replyTo.chatId === openIdRef.current ? replyTo : null;
      setReplyTo(null);
      deliver(openIdRef.current, { kind: "photo", image: shot.image, mime: shot.mime, width: shot.width, height: shot.height, text: caption, localSrc: shot.preview, replyToId: reply ? reply.id : undefined, replyPreview: reply ? { id: reply.id, from: reply.fromAccount, preview: reply.preview } : undefined });
    } catch (err) {
      setToast(err.message || "Could not send that photo");
    }
  };

  // ── Chat settings ────────────────────────────────────────────────────
  const setPrefs = async (chatId, prefs) => {
    setChatRows((rowsNow) => (rowsNow || []).map((c) => (c.id === chatId ? Object.assign({}, c, prefs) : c)));
    setThreads((all) => (all[chatId] && all[chatId].chat ? Object.assign({}, all, { [chatId]: Object.assign({}, all[chatId], { chat: Object.assign({}, all[chatId].chat, prefs) }) }) : all));
    try { await hellooApi.prefs(chatId, prefs); refreshChats(); } catch (err) { setToast(err.message); refreshChats(); }
  };
  const primaryFace = (faces || []).find((f) => f.kind === "shop" && f.primary) || null;
  const moveSide = async (chatId, side) => {
    try {
      await hellooApi.prefs(chatId, { side });
      setOpenId(null); setScreen(null);
      setToast(side === "self" ? "Moved to Personal · they now see your own name" : `Moved to ${primaryFace ? primaryFace.name : "your shop"} · they now see the shop's name`);
      refreshChats(); refreshFaces();
    } catch (err) { setToast(err.message); }
  };
  const clearChat = async (chatId, leave) => {
    try {
      await hellooApi.clear(chatId);
      setThreads((all) => (all[chatId] ? Object.assign({}, all, { [chatId]: Object.assign({}, all[chatId], { messages: [], more: false }) }) : all));
      if (leave) setOpenId(null);
      refreshChats();
      setToast(leave ? "Chat deleted" : "Chat cleared");
    } catch (err) { setToast(err.message); }
  };
  const setBlock = async (person, on) => {
    try {
      await hellooApi.block(person.accountId, on);
      await refreshBlocked();
      setToast(on ? `${person.name.split(" ")[0]} is blocked` : `${person.name.split(" ")[0]} is unblocked`);
    } catch (err) { setToast(err.message); }
  };
  const deleteMessage = async (chatId, m, everyone) => {
    setHeld(null);
    try {
      const r = await hellooApi.remove(m.id, everyone);
      setThreads((all) => {
        const t = all[chatId];
        if (!t) return all;
        const messages = everyone ? t.messages.map((x) => (x.id === m.id ? r.message : x)) : t.messages.filter((x) => x.id !== m.id);
        return Object.assign({}, all, { [chatId]: Object.assign({}, t, { messages }) });
      });
      refreshChats();
    } catch (err) { setToast(err.message); }
  };
  const onDraftChange = (chatId, v) => {
    setDrafts((d) => Object.assign({}, d, { [chatId]: v }));
    const now = Date.now();
    if (v && liveSend.current && now - typingSentAt.current > 2500) {
      typingSentAt.current = now;
      liveSend.current({ type: "typing", chatId });
    }
  };

  // ── Pay ──────────────────────────────────────────────────────────────
  const [pay, setPay] = useStateH9({ amount: "", note: "", busy: false, error: "" });
  // ── Order from the shop's GLOOBAL Bazaar price list ────────────────────
  // The menu is the shop's own list, read when the sheet opens. One PIN
  // pays for the basket (the shop gets exactly the total, in its money);
  // the order then goes into the chat. If the money moved and the order
  // did not arrive, the sheet keeps the payment and offers to place it
  // again, never to pay twice.
  const MENU_EMPTY = { items: null, basket: {}, note: "", busy: false, error: "", loadError: "", paidRef: "", clientId: "" };
  const [menu, setMenu] = useStateH9(MENU_EMPTY);
  const [orderPinOpen, setOrderPinOpen] = useStateH9(false);
  const [orderBusy, setOrderBusy] = useStateH9("");
  // The basic facts of a business's shop, for its profile: { kind, where,
  // open, count, rating }, keyed by GLOOBAL ID. Read once per profile
  // visit; a part that cannot be read is simply left out.
  // ── A payment's receipt is GLOOBAL's own ─────────────────────────────
  // Helloo draws no receipt of its own: the card in a chat opens the same
  // ReceiptModal GLOOBAL opens from its history, built the same way
  // (mapServerTransaction → receiptForRow), from this account's own
  // history. A payment not in it opens in GLOOBAL instead.
  const [gReceipt, setGReceipt] = useStateH9(null);
  // This account's GLOOBAL history, read and shaped exactly as GLOOBAL
  // reads it (mapServerTransaction). Used by the receipt and by a chat's
  // Payment history.
  const loadGloobalHistory = () => {
    const sid = user && user.symbolId;
    if (!sid || typeof mapServerTransaction !== "function") return Promise.reject(new Error("no history"));
    return GloobalApi.getTransactionSummary(sid, "all").then((r) => {
      const rows = (r && Array.isArray(r.transactions) ? r.transactions : []).map((row) => mapServerTransaction(row, sid));
      return { rows, sent: rows.filter((t) => t.direction !== "received"), got: rows.filter((t) => t.direction === "received") };
    });
  };
  const buildGloobalReceipt = (found, h) => {
    if (!found || typeof receiptForRow !== "function") return null;
    const country = typeof ALL_COUNTRIES !== "undefined" ? ALL_COUNTRIES.find((c) => c.iso === user.countryIso) : null;
    const cur = user.currency || "INR";
    return receiptForRow(found, found.direction === "received" ? "received" : "sent", {
      dialCountry: country || null,
      ccy: (typeof CURRENCY_SYMBOL === "object" && CURRENCY_SYMBOL[cur]) || cur,
      sendHistory: h.sent,
      receiveHistory: h.got,
      viewer: typeof receiptViewer === "function" ? receiptViewer({ name: user.fullName, symbolId: user.symbolId, countryName: country && country.name, countryFlag: country && country.flag }) : null
    });
  };
  const openGloobalReceipt = (referenceId) => {
    if (!referenceId || !user || !user.symbolId) return;
    const outside = () => { try { window.open(`${GLOOBAL_API_BASE}/t/${encodeURIComponent(referenceId)}`, "_blank", "noopener"); } catch (e) { /* blocked */ } };
    if (typeof ReceiptModal !== "function" || typeof receiptForRow !== "function" || typeof mapServerTransaction !== "function") { outside(); return; }
    setToast("Opening receipt…");
    loadGloobalHistory().then((h) => {
      const built = buildGloobalReceipt(h.rows.find((t) => t.txnId === referenceId), h);
      setToast("");
      if (built) setGReceipt(built); else outside();
    }).catch(() => { setToast(""); outside(); });
  };
  // Payment history with one person: every GLOOBAL payment between you two,
  // in GLOOBAL's own history rows; a row opens GLOOBAL's receipt.
  const [payHist, setPayHist] = useStateH9(null);
  const openPayHistory = (person) => {
    if (!person || !person.gloobalId) return;
    setPayHist({ person, rows: null, h: null, error: "" });
    setSheet("pay-history");
    loadGloobalHistory().then((h) => {
      const rows = h.rows.filter((t) => t.id === person.gloobalId);
      setPayHist((v) => (v && v.person === person ? Object.assign({}, v, { rows, h }) : v));
    }).catch(() => setPayHist((v) => (v ? Object.assign({}, v, { rows: [], error: "Couldn't load your GLOOBAL history. Try again." }) : v)));
  };
  // GLOOBAL's receipt says "Pay again" with a window event (its own app
  // listens for it). Here it opens the chat with that person and its Pay.
  const payAgainRef = useRefH9(null);
  payAgainRef.current = (d) => {
    if (!d || !d.gloobalId) return;
    Promise.resolve(openChatWith(d.gloobalId)).then(() => { setPay({ amount: "", note: "", busy: false, error: "" }); setSheet("pay"); }).catch(() => {});
  };
  useEffectH9(() => {
    const on = (e) => payAgainRef.current && payAgainRef.current(e.detail);
    window.addEventListener("gloobal:payAgain", on);
    return () => window.removeEventListener("gloobal:payAgain", on);
  }, []);
  const [shopCards, setShopCards] = useStateH9({});
  const loadShopCard = (person) => {
    if (!person || !person.handle || !person.gloobalId) return;
    Promise.all([
      GloobalApi.getCreatorProfile(person.gloobalId).catch(() => null),
      GloobalApi.getCreatorItems(person.gloobalId).catch(() => null),
      GloobalApi.getCreatorReviews(person.gloobalId).catch(() => null)
    ]).then(([c, items, rv]) => {
      const creator = c || {};
      const cat = typeof bazaarCategoryInfo === "function" && creator.category ? ((bazaarCategoryInfo(creator.category) || {}).label || "") : "";
      const sub = typeof bazaarSubcategoryLabel === "function" && creator.subcategory ? bazaarSubcategoryLabel(creator.category, creator.subcategory) : "";
      const parts = creator.addressPublic && creator.addressParts ? creator.addressParts : null;
      const hours = typeof openHoursLabel === "function" && creator.hours ? openHoursLabel(creator.hours, new Date()) : null;
      const n = Array.isArray(items) ? items.length : 0;
      const reviews = creator.reviews || null;
      setShopCards((all) => Object.assign({}, all, { [person.gloobalId]: {
        kind: [cat, sub].filter(Boolean).join(" · "),
        where: parts ? [parts.area, parts.city].filter(Boolean).join(", ") : "",
        open: hours && hours.text ? hours.text : "",
        count: n ? `${n} ${n === 1 ? "thing" : "things"}` : "",
        // What it sells, for the profile's list: name, price, photo.
        items: Array.isArray(items) ? items.slice(0, 12).map((it) => ({ id: it.id || it._id, title: it.title || "", photo: it.photo || (Array.isArray(it.photos) && it.photos[0]) || "", currency: it.currency || "", priceText: it.price != null ? hellooMoneyText(it.price, it.currency) : "" })) : [],
        rating: reviews && reviews.count ? `${Number(reviews.average).toFixed(1)} · ${reviews.count} ${reviews.count === 1 ? "review" : "reviews"}` : "",
        // Its feedback: the summary with the star split, the newest ones
        // (never with a name), your own, and whether you may write one.
        reviews: rv && rv.summary ? { summary: rv.summary, reviews: Array.isArray(rv.reviews) ? rv.reviews : [], mine: rv.mine || null, canReview: Boolean(rv.canReview), isOwner: Boolean(rv.isOwner), reason: rv.reason || "" } : { summary: { count: 0, average: 0, byStars: {} }, reviews: [], mine: null, canReview: false, isOwner: false, reason: "" }
      } }));
    });
  };
  // Opening a person's profile reads the media the two of you share.
  useEffectH9(() => {
    if (screen !== "contact" || !openId) { setProfileMedia(null); return undefined; }
    let gone = false;
    setMediaFilter("all");
    setProfileMedia({ chatId: openId, loading: true, list: [], counts: {} });
    hellooApi.chatMedia(openId).then((r) => { if (!gone) setProfileMedia({ chatId: openId, loading: false, list: (r.media || []).filter((m) => m.kind !== "deleted"), counts: r.counts || {} }); }).catch(() => { if (!gone) setProfileMedia({ chatId: openId, loading: false, list: [], counts: {} }); });
    return () => { gone = true; };
  }, [screen, openId]);
  // Opening a business's profile reads its shop.
  useEffectH9(() => {
    if (screen !== "contact" || !openId) return;
    const row = (chatRows || []).find((c) => c.id === openId);
    if (row && row.person && row.person.handle) loadShopCard({ handle: row.person.handle, gloobalId: row.person.gloobalId });
  }, [screen, openId]);
  const openMenu = (person, pickId) => {
    setMenu(pickId ? Object.assign({}, MENU_EMPTY, { basket: { [pickId]: 1 } }) : MENU_EMPTY);
    setSheet("shopmenu");
    GloobalApi.getCreatorItems(person.gloobalId)
      .then((list) => setMenu((m) => Object.assign({}, m, { items: (Array.isArray(list) ? list : []).map((it) => ({ id: it.id, name: it.title, price: Number(it.price) || 0, currency: it.currency, priceText: hellooMoneyText(it.price, it.currency), note: it.note || "", soldOut: Boolean(it.soldOut), special: Boolean(it.special), photo: it.photo || "" })) })))
      .catch(() => setMenu((m) => Object.assign({}, m, { loadError: "Couldn't load the menu. Close this and try again." })));
  };
  const menuLines = (menu.items || []).filter((it) => menu.basket[it.id] > 0).map((it) => ({ it, qty: menu.basket[it.id] }));
  const menuTotal = Math.round(menuLines.reduce((t, l) => t + l.it.price * l.qty, 0) * 100) / 100;
  const menuCurrency = menuLines.length ? menuLines[0].it.currency : (me && me.currency);
  const menuBump = (it, by) => setMenu((m) => { const n = Math.max(0, Math.min(50, (m.basket[it.id] || 0) + by)); const basket = Object.assign({}, m.basket, { [it.id]: n }); if (!n) delete basket[it.id]; return Object.assign({}, m, { basket, error: "" }); });
  const placeOrder = async (chatId, referenceId, clientId) => {
    await sendMessage(chatId, { kind: "order", clientId, referenceId, order: { items: menuLines.map((l) => ({ id: l.it.id, qty: l.qty })), note: menu.note.trim() } });
    setMenu(MENU_EMPTY);
    setSheet(null);
    setToast("Order placed · the shop will answer here");
  };
  const orderNow = async (person, chatId, pinValue) => {
    setOrderPinOpen(false);
    setMenu((m) => Object.assign({}, m, { busy: true, error: "" }));
    const clientId = menu.clientId || hellooClientId();
    let referenceId = menu.paidRef;
    try {
      if (!referenceId) {
        const count = menuLines.reduce((t, l) => t + l.qty, 0);
        const result = await GloobalApi.sendTransaction({
          senderSymbolId: user.symbolId,
          receiverSymbolId: person.gloobalId,
          // What the SHOP is to receive, in its own money: the order's total.
          amountBasis: "destination",
          destinationAmount: menuTotal,
          amount: menuTotal,
          note: `Order · ${count} ${count === 1 ? "thing" : "things"}`,
          pin: pinValue,
          payMethod: "helloo",
          idempotencyKey: `helloo-order-${clientId}`
        });
        referenceId = result && result.transaction && result.transaction.referenceId;
        if (!referenceId) throw new Error("The payment did not go through. Nothing was taken.");
        setMenu((m) => Object.assign({}, m, { paidRef: referenceId, clientId }));
      }
    } catch (err) {
      setMenu((m) => Object.assign({}, m, { busy: false, error: gloobalApiIsUnreachable(err) ? "The GLOOBAL server is waking up. Nothing was taken; try again in a moment." : err.message }));
      return;
    }
    try {
      await placeOrder(chatId, referenceId, clientId);
    } catch (err) {
      setMenu((m) => Object.assign({}, m, { busy: false, paidRef: referenceId, clientId, error: `You paid, but the order did not reach the chat${err && err.message ? ` (${err.message})` : ""}. Tap the button to place it; you will not be charged again.` }));
    }
  };
  const answerOrder = async (messageId, status) => {
    setOrderBusy(messageId);
    try {
      const r = await hellooApi.orderStatus(messageId, status);
      if (r && r.message) setThreads((all) => (all[r.message.chatId] ? Object.assign({}, all, { [r.message.chatId]: Object.assign({}, all[r.message.chatId], { messages: all[r.message.chatId].messages.map((x) => (x.id === r.message.id ? r.message : x)) }) }) : all));
    } catch (err) {
      setToast(err.message || "Couldn't update the order");
    }
    setOrderBusy("");
  };

  const [payPinOpen, setPayPinOpen] = useStateH9(false);
  // One key for one payment, kept across the checks it may be asked for.
  const payKey = useRefH9("");
  // How this account confirms a payment: "pin", "device" or "face".
  const payCheck = () => (typeof GLOOBAL_PAYMENT_CHECK === "object" && GLOOBAL_PAYMENT_CHECK && GLOOBAL_PAYMENT_CHECK.method) || "pin";
  const startPay = (person, chatId) => {
    payKey.current = `helloo-${hellooClientId()}`;
    if (payCheck() === "pin" || typeof withPaymentFaceCheck !== "function") { setPayPinOpen(true); return; }
    payNow(person, chatId, "");
  };
  const payNow = async (person, chatId, pinValue) => {
    setPayPinOpen(false);
    setPay((p) => Object.assign({}, p, { busy: true, error: "" }));
    try {
      const amount = Number(pay.amount);
      if (!payKey.current) payKey.current = `helloo-${hellooClientId()}`;
      const base = {
        senderSymbolId: user.symbolId,
        receiverSymbolId: person.gloobalId,
        amountBasis: "source",
        sourceAmount: amount,
        amount,
        note: pay.note,
        pin: pinValue || undefined,
        payMethod: "helloo",
        idempotencyKey: payKey.current
      };
      // GLOOBAL's own loop: it answers whatever check the server asks for
      // (fingerprint / Face ID, or the face check) and sends the same
      // payment again with the approval.
      const result = typeof withPaymentFaceCheck === "function"
        ? await withPaymentFaceCheck(user.symbolId, (extra) => GloobalApi.sendTransaction(Object.assign({}, base, extra)))
        : await GloobalApi.sendTransaction(base);
      payKey.current = "";
      const referenceId = result && result.transaction && result.transaction.referenceId;
      if (referenceId) {
        // Filed under the choice picked, the way GLOOBAL's Send files it:
        // quietly, after the money moved, never failing the payment.
        if (pay.choiceId && typeof choicesTagQuietly === "function") choicesTagQuietly(referenceId, pay.choiceId);
        // A pay sticker goes out with its payment, sticker first.
        if (pay.sticker) { hellooStickerAmountSave(pay.sticker, amount); try { await sendMessage(chatId, { kind: "sticker", stickerId: pay.sticker }); } catch (e) { /* the money moved */ } }
        try { await sendMessage(chatId, { kind: "payment", referenceId }); } catch (e) { /* the money moved; the bubble can follow on refresh */ }
      }
      setPay({ amount: "", note: "", busy: false, error: "" });
      setSheet(null);
      setToast(`Paid ${hellooMoneyText(amount, me.currency)} on GLOOBAL`);
    } catch (err) {
      // The check could not be done, or this one needs the PIN after all.
      if (err && err.needPin && !pinValue) { setPay((p) => Object.assign({}, p, { busy: false, error: "" })); setToast(err.message || "Enter your PIN for this payment."); setPayPinOpen(true); return; }
      setPay((p) => Object.assign({}, p, { busy: false, error: gloobalApiIsUnreachable(err) ? "The GLOOBAL server is waking up. Try again in a moment." : err.message }));
    }
  };

  // ── Push ─────────────────────────────────────────────────────────────
  const [push, setPush] = useStateH9(() => (hellooPushSupported() ? (Notification.permission === "granted" ? "on" : Notification.permission === "denied" ? "blocked" : "off") : "unsupported"));
  useEffectH9(() => { if (signedIn && push === "on") hellooPushSync(false).then(setPush).catch(() => {}); }, [signedIn]);
  const turnOnPush = async () => {
    try {
      const state = await hellooPushSync(true);
      setPush(state);
      setToast(state === "on" ? "Notifications on" : state === "blocked" ? "Notifications are blocked in your browser settings" : state === "unsupported" ? "Install Helloo to your home screen for notifications" : "Notifications are off");
    } catch (err) {
      setToast("Could not turn notifications on");
    }
  };

  // ── Dial ─────────────────────────────────────────────────────────────
  const [dial, setDial] = useStateH9({ value: "", status: "", match: null });

  // ── Calls ────────────────────────────────────────────────────────────
  const [callLog, setCallLog] = useStateH9(null);
  const [together, setTogether] = useStateH9({}); // accountId -> stats
  useEffectH9(() => {
    if (screen !== "contact" || !openId) return;
    const t = threads[openId];
    const chat = (t && t.chat) || (chatRows || []).find((c) => c.id === openId);
    const who = chat && chat.person && chat.person.accountId;
    if (!who) return;
    hellooApi.together(who).then((r) => setTogether((all) => Object.assign({}, all, { [who]: r }))).catch(() => {});
    // A person's profile shows the shops they chose to show.
    if (!hellooIsBusiness(chat.person)) {
      hellooApi.personShops(who).then((r) => {
        const list = r.shops || [];
        askPhotos(list);
        setPersonShops((all) => Object.assign({}, all, { [who]: list }));
        list.forEach((c) => loadShopCard({ handle: c.handle, gloobalId: c.gloobalId }));
      }).catch(() => {});
    }
  }, [screen, openId]);
  const [personShops, setPersonShops] = useStateH9({}); // accountId -> shop cards
  const [reachBusy, setReachBusy] = useStateH9(false);
  // Who can reach me, just for one person — from their profile or the chat.
  const setPersonReach = (who, mode, price) => {
    setReachBusy(true);
    hellooApi.reachPerson(who, mode, price)
      .then((r) => { setTogether((all) => Object.assign({}, all, { [who]: Object.assign({}, all[who] || {}, r, { allowed: r.reachMode === "free" }) })); refreshMyReach(); })
      .catch((err) => setToast(err.message || "Couldn't change that. Try again."))
      .finally(() => setReachBusy(false));
  };
  const loadPersonReach = (who) => { if (who && !together[who]) hellooApi.together(who).then((r) => setTogether((all) => Object.assign({}, all, { [who]: r }))).catch(() => {}); };
  const [callFilter, setCallFilter] = useStateH9("all");
  const [callWhen, setCallWhen] = useStateH9("all");
  // Inside a chat: show only messages from a time (null: no filter bar).
  const [chatPeriod, setChatPeriod] = useStateH9(null);
  useEffectH9(() => { setChatPeriod(null); }, [openId]);
  // A period older than what is loaded loads older messages (a few pages).
  const periodPages = useRefH9(0);
  useEffectH9(() => {
    periodPages.current = 0;
  }, [chatPeriod, openId]);
  useEffectH9(() => {
    if (!openId || !chatPeriod || chatPeriod === "all") return;
    const t = threads[openId];
    if (!t || !t.more || !t.messages.length || periodPages.current >= 8) return;
    const oldest = t.messages.find((m) => m.id);
    if (oldest && new Date(oldest.at).getTime() > hellooPeriodRange(chatPeriod)[0]) { periodPages.current += 1; loadThread(openId, true); }
  }, [chatPeriod, openId, threads]);
  const [contactQuery, setContactQuery] = useStateH9("");
  // Naming a chat and making it private: { chatId, name, isPrivate, busy, error }.
  const [nameEdit, setNameEdit] = useStateH9(null);
  const openNameEdit = (chat, forced = false) => { setNameEdit({ chatId: chat.id, name: forced ? "" : chat.savedName || "", again: "", wasPrivate: forced ? false : Boolean(chat.private), oldName: forced ? "" : chat.savedName || "", isPrivate: forced ? true : Boolean(chat.private), forced, busy: false, error: "" }); setSheet("savename"); };
  const saveNameEdit = async () => {
    if (!nameEdit || nameEdit.busy) return;
    const name = String(nameEdit.name || "").replace(/\s+/g, " ").trim();
    if (nameEdit.isPrivate && name.length < HELLOO_PRIVATE_NAME_MIN) { setNameEdit(Object.assign({}, nameEdit, { error: `A private chat needs a name of ${HELLOO_PRIVATE_NAME_MIN} characters or more.` })); return; }
    if (name && (chatRows || []).some((c) => c.id !== nameEdit.chatId && hellooNameKey(c.savedName) === hellooNameKey(name))) { setNameEdit(Object.assign({}, nameEdit, { error: "You already use that name for another chat." })); return; }
    // Private has no way back, so its name is typed twice — whenever the
    // chat becomes private or its private name changes.
    const needsAgain = nameEdit.isPrivate && (!nameEdit.wasPrivate || hellooNameKey(name) !== hellooNameKey(nameEdit.oldName));
    if (needsAgain && hellooNameKey(nameEdit.again || "") !== hellooNameKey(name)) { setNameEdit(Object.assign({}, nameEdit, { error: "The two names are not the same. Type it again, exactly." })); return; }
    setNameEdit(Object.assign({}, nameEdit, { busy: true, error: "" }));
    try {
      await hellooApi.prefs(nameEdit.chatId, { savedName: name, private: nameEdit.isPrivate });
      const patch = { savedName: name, private: nameEdit.isPrivate };
      setChatRows((rowsNow) => (rowsNow || []).map((c) => (c.id === nameEdit.chatId ? Object.assign({}, c, patch) : c)));
      setThreads((all) => (all[nameEdit.chatId] && all[nameEdit.chatId].chat ? Object.assign({}, all, { [nameEdit.chatId]: Object.assign({}, all[nameEdit.chatId], { chat: Object.assign({}, all[nameEdit.chatId].chat, patch) }) }) : all));
      setSheet(null); setNameEdit(null); setQuery("");
      setToast(nameEdit.isPrivate ? "Private · opens only when you type its whole name" : name ? "Name saved" : "Name removed");
      refreshChats();
    } catch (err) {
      setNameEdit((now) => (now ? Object.assign({}, now, { busy: false, error: (err && err.message) || "Could not save that right now." }) : now));
    }
  };
  const releaseSheet = release && <HellooSheet label={release.mode === "give" ? "Release once for them" : "Open the released chat"} onClose={() => { setSheet(null); setRelease(null); }}><div data-testid="helloo-release-sheet"><div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{release.mode === "give" ? "Release once for them" : "A private chat, released for you"}</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 6, lineHeight: 1.5 }}>{release.mode === "give" ? "For when they forgot what they saved this chat as. They see it once, within 10 minutes, after their own PIN — then they name it again and it is private again. Your name for it stays yours. Once a day at most." : "Enter your GLOOBAL PIN to open it, then give it a name. It becomes private again the moment you save."}</div><input data-testid="helloo-release-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={release.pin} onChange={(e) => setRelease(Object.assign({}, release, { pin: e.target.value.replace(/\D/g, ""), error: "" }))} placeholder="Your GLOOBAL PIN" style={{ width: "100%", boxSizing: "border-box", marginTop: 14, height: 48, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 18, letterSpacing: 6, fontWeight: 800, fontFamily: T.fontBody, padding: "0 14px", outline: "none", textAlign: "center" }} />{release.error ? <div data-testid="helloo-release-error" style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "#DC2626" }}>{release.error}</div> : null}<div style={{ marginTop: 14 }}><HellooPrimary onClick={runRelease} disabled={release.busy || release.pin.length < 4}>{release.busy ? "Checking…" : release.mode === "give" ? "Release once" : "Open"}</HellooPrimary></div></div></HellooSheet>;
  const nameNeedsAgain = Boolean(nameEdit && nameEdit.isPrivate && (!nameEdit.wasPrivate || hellooNameKey(String(nameEdit.name || "").trim()) !== hellooNameKey(nameEdit.oldName)));
  const nameSheet = nameEdit && <HellooSheet label="Name this chat" onClose={() => { const forced = nameEdit && nameEdit.forced; setSheet(null); setNameEdit(null); if (forced) { setOpenId(null); setToast("Not saved · the chat is hidden again"); } }}><div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>Name this chat</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4, lineHeight: 1.45 }}>Your own name for it. Only you see it — letters, numbers or symbols.</div><input data-testid="helloo-saved-name" value={nameEdit.name} maxLength={40} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Papa, ()+, anything" onChange={(e) => setNameEdit(Object.assign({}, nameEdit, { name: e.target.value, error: "" }))} style={{ width: "100%", boxSizing: "border-box", marginTop: 12, height: 46, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, padding: "0 14px", outline: "none" }} /><button type="button" role="switch" aria-checked={nameEdit.isPrivate} data-testid="helloo-private-switch" onClick={() => setNameEdit(Object.assign({}, nameEdit, { isPrivate: !nameEdit.isPrivate, error: "" }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, marginTop: 14, padding: 0, border: "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink }}>Private chat</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.45 }}>Appears only when you type its whole name. No notification, no count, no sound — you see new messages when you open it.</span></span><span aria-hidden="true" style={{ width: 44, height: 26, borderRadius: 999, background: nameEdit.isPrivate ? T.accent : T.line, position: "relative", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: nameEdit.isPrivate ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .18s" }} /></span></button>{nameNeedsAgain ? <><input data-testid="helloo-saved-name-again" value={nameEdit.again || ""} maxLength={40} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type the name again" onChange={(e) => setNameEdit(Object.assign({}, nameEdit, { again: e.target.value, error: "" }))} style={{ width: "100%", boxSizing: "border-box", marginTop: 12, height: 46, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, color: T.ink, fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, padding: "0 14px", outline: "none" }} /><div data-testid="helloo-private-warning" style={{ display: "flex", gap: 10, marginTop: 12, padding: "11px 12px", borderRadius: 14, background: "#FEF3C7", color: "#7C4A03", fontSize: 12.5, lineHeight: 1.45, fontWeight: 600 }}><HlLock size={16} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} /><span><b>There is no recovery.</b> If you forget this name, nobody can find this chat — not even you. If you both keep it private, they can release it once for you.</span></div></> : null}{nameEdit.error ? <div data-testid="helloo-name-error" style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "#DC2626" }}>{nameEdit.error}</div> : null}<div style={{ marginTop: 16 }}><HellooPrimary onClick={saveNameEdit} disabled={nameEdit.busy}>{nameEdit.busy ? "Saving…" : "Save"}</HellooPrimary></div></HellooSheet>;
  const [call, setCall] = useStateH9(null); // { id, person, video, direction, state, seconds, muted, cameraOff, speaker, iceServers, chatId, note }
  // A call made small: it carries on (its screen stays mounted, hidden, so
  // the sound and video keep flowing) while a bar at the top leads back.
  const [callMin, setCallMin] = useStateH9(false);
  useEffectH9(() => { if (!call) setCallMin(false); }, [call]);
  const callRef = useRefH9(null);
  callRef.current = call;
  const peerRef = useRefH9(null);
  const localRef = useRefH9(null);
  const toneRef = useRefH9(null);
  const localVideoRef = useRefH9(null);
  const remoteVideoRef = useRefH9(null);
  const remoteAudioRef = useRefH9(null);
  const openedOnLatest = useRefH9(false);
  const refreshCalls = useCallbackH9(() => hellooApi.calls().then((r) => setCallLog(r.calls || [])).catch(() => {}), []);
  useEffectH9(() => { if (signedIn) refreshCalls(); }, [signedIn, refreshCalls]);
  // Open on whatever happened last: a message → Messages, a call → Calls.
  useEffectH9(() => {
    if (!signedIn || openedOnLatest.current || chatRows === null || callLog === null) return;
    openedOnLatest.current = true;
    if (hellooDeepLink()) return;
    setTab(hellooLatestSide(chatRows, callLog));
  }, [signedIn, chatRows, callLog]);
  useEffectH9(() => {
    if (!call || call.state !== "live") return undefined;
    const t = setInterval(() => setCall((c) => (c && c.state === "live" ? Object.assign({}, c, { seconds: c.seconds + 1 }) : c)), 1000);
    return () => clearInterval(t);
  }, [call && call.state]);
  const stopTone = () => { if (toneRef.current) { toneRef.current.stop(); toneRef.current = null; } };
  const tearDown = () => {
    stopTone();
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (localRef.current) { localRef.current.getTracks().forEach((t) => t.stop()); localRef.current = null; }
  };
  const endCallLocally = (status) => {
    tearDown();
    setCall((c) => (c ? Object.assign({}, c, { state: "ended", status }) : c));
    setTimeout(() => setCall((c) => (c && c.state === "ended" ? null : c)), 1400);
    refreshCalls();
  };
  const attachMedia = () => {
    const c = callRef.current;
    if (!c) return;
    if (localRef.current && localVideoRef.current && c.video) localVideoRef.current.srcObject = localRef.current;
  };
  useEffectH9(() => { attachMedia(); }, [call && call.id, call && call.state]);
  const sendSignal = (callId, data) => { if (liveSend.current) liveSend.current({ type: "signal", callId, data }); };
  const makePeer = async (c) => {
    if (peerRef.current) return peerRef.current;
    const stream = localRef.current || (await hellooLocalMedia(c.video, "user"));
    localRef.current = stream;
    const peer = hellooPeer(c.iceServers, (data) => sendSignal(c.id, data), (remote) => {
      const el = c.video ? remoteVideoRef.current : remoteAudioRef.current;
      if (el && el.srcObject !== remote) { el.srcObject = remote; el.play && el.play().catch(() => {}); }
    }, (state) => {
      if (state === "connected") { stopTone(); setCall((x) => (x && x.id === c.id && x.state !== "live" ? Object.assign({}, x, { state: "live", seconds: 0 }) : x)); }
      if (state === "failed" && peerRef.current === peer && callRef.current && callRef.current.id === c.id && callRef.current.state !== "ended") { setToast("The call could not connect on this network"); hangUp(); }
    });
    peer.addLocal(stream);
    peerRef.current = peer;
    attachMedia();
    return peer;
  };
  const startCall = async (person, video) => {
    if (callRef.current) return;
    if (typeof RTCPeerConnection === "undefined" || !navigator.mediaDevices) { setToast("Calls need a newer browser"); return; }
    try {
      const stream = await hellooLocalMedia(video, "user");
      localRef.current = stream;
    } catch (err) {
      setToast(err && err.name === "NotAllowedError" ? (video ? "Allow the camera and microphone to make video calls" : "Allow the microphone to make calls") : "Could not use the microphone");
      return;
    }
    try {
      const r = await hellooApi.startCall(person.accountId || person.gloobalId, video, person.handle ? "" : "self");
      const c = r.call;
      setCall({ id: c.id, person, video: Boolean(video), direction: "out", state: "ringing", seconds: 0, muted: false, cameraOff: false, speaker: false, iceServers: r.iceServers, chatId: c.chatId });
      toneRef.current = hellooTone("ringback"); toneRef.current.start();
      refreshCalls();
    } catch (err) {
      tearDown();
      const code = err && err.body && err.body.code;
      setToast(code === "call_needs_allow" ? `${person.name.split(" ")[0]} takes calls only from people they've allowed. Message them first.` : code === "busy" ? err.message : gloobalApiIsUnreachable(err) ? "The GLOOBAL server is waking up. Try again." : err.message);
    }
  };
  const answerCall = async () => {
    const c = callRef.current;
    if (!c || c.direction !== "in") return;
    stopTone();
    try {
      const r = await hellooApi.callAction(c.id, "answer");
      setCall((x) => (x ? Object.assign({}, x, { state: "connecting", iceServers: r.iceServers }) : x));
      await makePeer(Object.assign({}, c, { iceServers: r.iceServers }));
    } catch (err) {
      setToast(err && err.body && err.body.code === "call_over" ? "That call has ended" : (err && err.name === "NotAllowedError" ? "Allow the microphone to answer" : err.message));
      endCallLocally("ended");
    }
  };
  const hangUp = async () => {
    const c = callRef.current;
    if (!c) return;
    const action = c.direction === "in" && c.state === "ringing" ? "decline" : "end";
    endCallLocally(c.state === "live" ? "ended" : action === "decline" ? "declined" : "cancelled");
    hellooApi.callAction(c.id, action).catch(() => {});
  };
  const toggleMute = () => { const s = localRef.current; if (!s) return; setCall((c) => { const muted = !c.muted; s.getAudioTracks().forEach((t) => { t.enabled = !muted; }); return Object.assign({}, c, { muted }); }); };
  const toggleCamera = () => { const s = localRef.current; if (!s) return; setCall((c) => { const off = !c.cameraOff; s.getVideoTracks().forEach((t) => { t.enabled = !off; }); return Object.assign({}, c, { cameraOff: off }); }); };
  const toggleSpeaker = () => setCall((c) => (c ? Object.assign({}, c, { speaker: !c.speaker }) : c));
  const flipCamera = async () => {
    const c = callRef.current; const peer = peerRef.current; const s = localRef.current;
    if (!c || !peer || !s) return;
    const facing = c.facing === "environment" ? "user" : "environment";
    try {
      const fresh = await hellooLocalMedia(true, facing);
      const track = fresh.getVideoTracks()[0];
      const sender = peer.pc.getSenders().find((x) => x.track && x.track.kind === "video");
      if (sender) await sender.replaceTrack(track);
      s.getVideoTracks().forEach((t) => { t.stop(); s.removeTrack(t); });
      s.addTrack(track);
      fresh.getAudioTracks().forEach((t) => t.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = s;
      setCall((x) => (x ? Object.assign({}, x, { facing }) : x));
    } catch (e) { setToast("Could not switch camera"); }
  };
  const onIncomingCall = (c) => {
    if (callRef.current) return; // already on a call: the server marks it missed/busy
    // A call from someone whose chat you keep private rings without a
    // name or a face: the ring is on the screen for anyone to see.
    const hush = privatePeopleRef.current.has(c.person && c.person.accountId);
    const person = hush ? Object.assign(hellooPersonFrom(c.person, null), { name: "Helloo call", photo: null, hasPhoto: false, gloobalId: "", handle: null }) : hellooPersonFrom(c.person, photos);
    if (!hush) askPhotos([c.person]);
    setCall({ id: c.id, person, video: Boolean(c.video), direction: "in", state: "ringing", seconds: 0, muted: false, cameraOff: false, speaker: false, iceServers: null, chatId: c.chatId });
    toneRef.current = hellooTone("ring"); toneRef.current.start();
  };
  // A call that was ringing before the app opened (a tapped notification).
  useEffectH9(() => {
    if (!signedIn) return;
    hellooApi.activeCall().then((r) => { if (r.call) onIncomingCall(r.call); }).catch(() => {});
  }, [signedIn]);
  // The country code a typed mobile number is read with: your own country's.
  const dialCode = (typeof ALL_COUNTRIES === "object" && user && ((ALL_COUNTRIES.find((c) => c[1] === user.countryIso) || [])[2])) || "+91";
  // By mobile number: looked up a moment after the typing stops.
  useEffectH9(() => {
    if (dial.mode === "id") return undefined;
    const digits = String(dial.phone || "").replace(/\D/g, "");
    if (digits.length < 7) { if (dial.status) setDial((d) => Object.assign({}, d, { status: "", match: null })); return undefined; }
    let gone = false;
    const t = setTimeout(() => {
      setDial((d) => Object.assign({}, d, { status: "looking" }));
      hellooApi.lookup(`${dialCode}${digits}`, "self")
        .then((r) => { if (!gone) setDial((d) => Object.assign({}, d, { status: "found", match: hellooPersonFrom(r.person, photos) })); askPhotos([r.person]); })
        .catch((err) => { if (!gone) { setDial((d) => Object.assign({}, d, { status: "none", match: null })); if (err && err.body && err.body.code === "person_is_you") setToast("That is your own number"); } });
    }, 550);
    return () => { gone = true; clearTimeout(t); };
  }, [dial.phone, dial.mode]);
  useEffectH9(() => {
    if (dial.mode !== "id") return undefined;
    if (dial.value.length !== 12) { if (dial.status) setDial((d) => Object.assign({}, d, { status: "", match: null })); return undefined; }
    let gone = false;
    setDial((d) => Object.assign({}, d, { status: "looking" }));
    hellooApi.lookup(dial.value, "self")
      .then((r) => { if (!gone) setDial((d) => Object.assign({}, d, { status: "found", match: hellooPersonFrom(r.person, photos) })); askPhotos([r.person]); })
      .catch((err) => { if (!gone) { setDial((d) => Object.assign({}, d, { status: "none", match: null })); if (err && err.body && err.body.code === "person_is_you") setToast("That is your own GLOOBAL ID"); } });
    return () => { gone = true; };
  }, [dial.value, dial.mode]);

  // ── Scan ─────────────────────────────────────────────────────────────
  // Pay somebody by their GLOOBAL ID: their chat, with Pay open in it.
  const payGloobalId = (gloobalId) => {
    if (!gloobalId) return;
    if (gloobalId === user.symbolId) { setToast("That is your own code"); return; }
    Promise.resolve(openChatWith(gloobalId)).then(() => { setPay({ amount: "", note: "", busy: false, error: "" }); setSheet("pay"); }).catch(() => {});
  };
  useEffectH9(() => {
    if (!photoView) { setPhotoQr(null); return undefined; }
    if (typeof decodeGloobalQrFromImageFile !== "function" || typeof parseGloobalPayPayload !== "function") return undefined;
    let gone = false;
    setPhotoQr({ status: "looking" });
    fetch(photoView).then((r) => r.blob()).then((b) => decodeGloobalQrFromImageFile(b)).then((text) => {
      if (gone) return;
      const parsed = text ? parseGloobalPayPayload(String(text)) : null;
      if (!parsed || !parsed.gloobalId) { setPhotoQr({ status: "none" }); return; }
      if (user && parsed.gloobalId === user.symbolId) { setPhotoQr({ status: "found", gloobalId: parsed.gloobalId, person: null, mine: true }); return; }
      setPhotoQr({ status: "found", gloobalId: parsed.gloobalId, person: null });
      hellooApi.lookup(parsed.gloobalId).then((r) => { if (!gone) { setPhotoQr((q) => (q && q.gloobalId === parsed.gloobalId ? Object.assign({}, q, { person: hellooPersonFrom(r.person, photos) }) : q)); askPhotos([r.person]); } }).catch((err) => { if (!gone && err && err.body && err.body.code === "person_is_you") setPhotoQr((q) => (q ? Object.assign({}, q, { mine: true }) : q)); });
    }).catch(() => { if (!gone) setPhotoQr({ status: "none" }); });
    return () => { gone = true; };
  }, [photoView]);
  // A picture of a code chosen from the gallery on the scan screen.
  const onScanFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || typeof decodeGloobalQrFromImageFile !== "function") return;
    decodeGloobalQrFromImageFile(file).then((text) => { if (text) onScanned(text); else setToast("No GLOOBAL code in that picture"); });
  };
  const onScanned = (text) => {
    const parsed = typeof parseGloobalPayPayload === "function" ? parseGloobalPayPayload(String(text || "")) : null;
    if (!parsed || !parsed.gloobalId) { setToast("That is not a GLOOBAL code"); return; }
    setScreen(null);
    if (parsed.gloobalId === user.symbolId) { setToast("That is your own code"); return; }
    openChatWith(parsed.gloobalId);
  };

  // ── Back button ──────────────────────────────────────────────────────
  //
  // Every layer the app opens — a tab other than Chats, a screen, a chat,
  // their profile, a sheet, a PIN — is one step of the phone's Back. Back
  // closes the top one; only Back on Chats with nothing open leaves the
  // app. The count of open layers is kept equal to the history entries
  // this page has pushed, so closing something with an on-screen arrow
  // takes its entry away too and the next Back is never swallowed.
  const backDepth =
    (call ? 1 : 0) +
    (payPinOpen || orderPinOpen || reachPin || giveBackPin ? 1 : 0) +
    (held || heldChat ? 1 : 0) +
    (sheet ? 1 : 0) +
    (photoView ? 1 : 0) +
    (priceGate ? 1 : 0) +
    (screen === "contact" ? 1 : 0) +
    (openId ? 1 : 0) +
    (screen === "earnings" ? 2 : screen && screen !== "contact" ? 1 : 0) +
    (signedIn && tab !== "chats" ? 1 : 0) +
    (stage === "id" ? 1 : stage === "pin" ? 2 : 0);
  const closeThread = () => {
    cancelRecording(); setOpenId(null); setSheet(null); setReplyTo(null); refreshChats();
    if (backToContactsRef.current) { backToContactsRef.current = false; setScreen("contacts"); }
  };
  const closeProfile = () => {
    if (backToContactsRef.current) { backToContactsRef.current = false; setOpenId(null); setScreen("contacts"); return; }
    setScreen(null);
  };
  useHellooBack(backDepth, () => {
    if (call) { if (call.state === "ringing" && call.direction === "in") return undefined; return hangUp(); }
    if (orderPinOpen) return setOrderPinOpen(false);
    if (payPinOpen) return setPayPinOpen(false);
    if (reachPin) return setReachPin(null);
    if (giveBackPin) return setGiveBackPin(null);
    if (held) return setHeld(null);
    if (heldChat) return setHeldChat(null);
    if (sheet) return setSheet(null);
    if (photoView) return closePhoto();
    if (priceGate) return setPriceGate(null);
    if (screen === "contact") return closeProfile();
    if (openId) { closeThread(); return undefined; }
    if (screen === "earnings") return setScreen(earningsFromMe.current ? "me" : "reach");
    if (screen) return setScreen(null);
    if (signedIn && tab !== "chats") return setTab("chats");
    if (stage === "pin") return setStage("id");
    return undefined;
  });

  // ── Shell ────────────────────────────────────────────────────────────
  // An open chat wears its own colours when it has them (yours alone, saved
  // with the chat); everywhere else the app's. Applied before anything draws.
  const chatThemeNow = openId && !screen ? ((((chatRows || []).find((c) => c.id === openId)) || {}).theme || (threads[openId] && threads[openId].chat && threads[openId].chat.theme) || "") : "";
  const themeNow = chatThemeNow && hellooFindTheme(chatThemeNow) ? chatThemeNow : themeKey;
  if (shownThemeRef.current !== themeNow + "|" + hellooSideNow()) { applyHellooTheme(themeNow); shownThemeRef.current = themeNow + "|" + hellooSideNow(); }
  const shell = (children) => <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg }}>{callLayer}<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: callBar ? "calc(48px + env(safe-area-inset-top, 0px))" : 0 }}>{children}</div>{gReceipt && user && typeof LedgerProvider === "function" ? <LedgerProvider userId={user.accountId || "me"} currency={user.currency || "INR"}><ReceiptModal receipt={gReceipt} onClose={() => setGReceipt(null)} /></LedgerProvider> : null}{callBar}{typeof PaymentFaceHost === "function" ? <PaymentFaceHost /> : null}{forwardOf && signedIn ? <HellooShareInSheet share={{ text: forwardOf.kind === "text" ? forwardOf.text : `${forwardOf.kind === "voice" ? "Voice note" : forwardOf.kind === "video" ? "Clip" : "Photo"}${forwardOf.text ? ` · ${forwardOf.text}` : ""}`, file: null }} chats={(chatRows || []).map((c) => hellooChatRowFrom(c, photos))} onSend={sendForward} onClose={() => setForwardOf(null)} /> : null}{shareIn && shareIn.wa && signedIn ? <HellooWaImportSheet parsed={shareIn.wa} chats={(chatRows || []).map((c) => hellooChatRowFrom(c, photos))} onImport={importWa} onClose={() => setShareIn(null)} /> : null}{shareIn && !shareIn.wa && signedIn ? <HellooShareInSheet share={shareIn} chats={(chatRows || []).map((c) => hellooChatRowFrom(c, photos))} onSend={sendShareIn} onClose={() => setShareIn(null)} /> : null}{typeof BiometricPinFallbackModal === "function" ? <BiometricPinFallbackModal open={Boolean(pinFallback)} symbolId={user && user.symbolId} reason={pinFallback && pinFallback.reason} onResolve={resolvePinFallback} /> : null}{toast && <div role="status" style={{ position: "absolute", left: 16, right: 16, bottom: "calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", justifyContent: "center", zIndex: 300, pointerEvents: "none" }}><span style={{ background: T.ink, color: T.bg, borderRadius: 18, padding: "9px 16px", fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", textAlign: "center", maxWidth: "100%" }}>{toast}</span></div>}</div>;

  // ── A call fills the screen — or, made small, a bar at the top ───────
  // The call's screen is always the first thing in the shell while there
  // is a call, so it is never re-made (and never cut off) by moving between
  // full and small.
  const callBar = call && me && callMin ? <button data-testid="helloo-call-bar" onClick={() => setCallMin(false)} className="v2-tap" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)", boxSizing: "border-box", zIndex: 280, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: "#0B9E6B", color: "#fff", fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden" }}><HlPhone size={15} color="#fff" /><span>{call.state === "live" ? hellooDuration(call.seconds) : call.state === "ringing" ? (call.direction === "in" ? "Incoming call" : "Calling…") : "Connecting…"}</span><span style={{ opacity: 0.85, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>· {call.person.handle || hellooName(call.person)}</span><span style={{ opacity: 0.85 }}>· Back to call</span></button> : null;
  const callLayer = call && me ? <div key="helloo-call" style={callMin ? { display: "none" } : { position: "absolute", inset: 0, zIndex: 200 }}><HellooCallScreen person={call.person} paid={Boolean(call.paid)} video={call.video} state={call.state} seconds={call.seconds} muted={call.muted} cameraOff={call.cameraOff} speaker={call.speaker} incoming={call.direction === "in"} onAccept={answerCall} onEnd={hangUp} onMute={toggleMute} onCamera={toggleCamera} onSpeaker={toggleSpeaker} onFlip={flipCamera} onMinimise={() => setCallMin(true)} onChat={() => { if (call.chatId) { setCallMin(true); setScreen(null); openChat(call.chatId); } }} onShop={hellooIsBusiness(call.person) && call.person.gloobalId ? () => { const shopPerson = call.person; setCallMin(true); setScreen(null); Promise.resolve(openChatWith(shopPerson.accountId)).then(() => openMenu(shopPerson)); } : undefined} localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} remoteAudioRef={remoteAudioRef} /></div> : null;
  if (locked && signedIn && me && !call) return shell(<HellooScreen><div data-testid="helloo-locked" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", textAlign: "center" }}><span style={{ fontSize: 30 }}><HellooWordmark /></span><span style={{ width: 72, height: 72, borderRadius: "50%", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}><HlFinger size={34} color={T.accent} /></span><div style={{ fontSize: 18, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Locked</div><div style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.45 }}>{lockNote || "Your chats are locked after five minutes away. Open with your fingerprint, Face ID or GLOOBAL PIN."}</div><div style={{ width: "100%", maxWidth: 300, marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}><HellooPrimary Icon={HlFinger} onClick={unlock} disabled={unlocking}>{unlocking ? "Checking…" : "Unlock"}</HellooPrimary><HellooSecondary Icon={HlLogOut} onClick={() => { setLocked(false); signOut("Signed out"); }}>Sign out</HellooSecondary></div></div></HellooScreen>);
  if (call && me && !callMin) return shell(null);


  if (stage === "splash" || stage === "splash-in") return shell(<HellooSplash intro={stage === "splash"} onSkip={stage === "splash" ? () => setStage("id") : undefined} />);
  if (stage === "welcome") return shell(<HellooWelcome hasGloobal={false} note={outNote} onEnterId={() => { setOutNote(""); setStage("id"); }} />);
  if (stage === "id") return shell(<HellooIdScreen value={idValue} onChange={setIdValue} mode={idMode} onMode={setIdMode} mobile={idMobile} onMobile={setIdMobile} status={idValue.length === 12 ? "ready" : ""} note={outNote} onNext={() => { setOutNote(""); setPin(""); setStage("pin"); }} />);
  if (stage === "pin") return shell(<><LoginAuthScreen value={pin} length={HELLOO_PIN_LENGTH} onChange={setPin} onSubmit={() => submitPin(pin)} onBack={() => setStage("id")} revealed={pinShown} onToggleReveal={() => setPinShown((v) => !v)} waking={pinWaking} busy={pinBusy} /><HellooPinNote who={idMode === "mobile" ? `+${idMobile}` : <ColoredGloobalId id={idValue} />} /></>);
  if (stage === "back" && me) return shell(<HellooWelcomeBack me={me} onDone={() => setStage("app")} />);
  if (!me) return shell(<HellooSplash />);

  // ── Photo, full screen ───────────────────────────────────────────────
  if (photoView) {
    return shell(<div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>{photoMeta && photoMeta.kind === "video" ? <video src={photoView} controls controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} autoPlay playsInline loop={!photoMeta.once} data-testid="helloo-snap-video" style={{ maxWidth: "100%", maxHeight: "100%", filter: hellooFx(photoMeta.fx) }} /> : <img src={photoView} alt="Photo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", touchAction: "pinch-zoom", filter: hellooFx(photoMeta && photoMeta.fx) }} />}<div style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", left: 14, right: 14, display: "flex", justifyContent: "space-between", zIndex: 4 }}><NavBackButton onClick={closePhoto} />{!photoMeta || photoMeta.canSave ? <button onClick={savePhoto} aria-label="Save to phone" data-testid="helloo-snap-save" className="v2-tap" style={{ height: 40, padding: "0 14px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}><HlDownload size={16} color="#fff" />Save</button> : <span style={{ height: 40, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,0.14)", color: "#fff", display: "flex", alignItems: "center", fontSize: 12, fontWeight: 800 }}>{photoMeta.once ? "See once · closes for good" : "Stays in Helloo · no saving"}</span>}</div>{photoQr && photoQr.status === "found" ? <div data-testid="helloo-photo-qr" style={{ position: "absolute", left: 14, right: 14, bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", background: T.surface, borderRadius: 22, padding: 14, boxShadow: "0 20px 40px -18px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 12 }}>{photoQr.person ? <HellooAvatar person={photoQr.person} size={46} /> : <span style={{ width: 46, height: 46, borderRadius: "50%", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HlScan size={20} color={T.accent} /></span>}<span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: T.inkFaint, textTransform: "uppercase" }}><GloobalWordmark /> QR</span><span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: T.ink, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{photoQr.mine ? "Your own code" : photoQr.person ? (photoQr.person.handle ? <CreatorHandleText handle={photoQr.person.handle} icon={false} /> : photoQr.person.name) : "Finding who this is…"}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 1, letterSpacing: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{photoQr.gloobalId}</span></span>{photoQr.mine ? null : <><button onClick={() => { const id = photoQr.gloobalId; setPhotoView(null); Promise.resolve(openChatWith(id)).catch(() => {}); }} aria-label="Message" className="v2-tap" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><HlChat size={19} color={T.accent} /></button><button onClick={() => { const id = photoQr.gloobalId; setPhotoView(null); payGloobalId(id); }} data-testid="helloo-photo-qr-pay" className="v2-tap" style={{ height: 44, padding: "0 18px", borderRadius: 999, border: "none", background: T.gradButton, color: "#fff", fontFamily: T.fontBody, fontSize: 14.5, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Pay</button></>}</div> : null}</div>);
  }

  // ── A chat ───────────────────────────────────────────────────────────
  const thread = openId ? threads[openId] : null;
  if (openId && screen !== "contact") {
    const serverChat = (thread && thread.chat) || (chatRows || []).find((c) => c.id === openId) || null;
    const rowNow = (chatRows || []).find((c) => c.id === openId);
    const muted = Boolean((rowNow && rowNow.muted) || (serverChat && serverChat.muted));
    const person = serverChat ? hellooPersonFrom(serverChat.person, photos) : { id: "", name: "…", country: "" };
    // The name at the top is the one you saved this chat under — except a
    // private chat reached by their ID, which shows only from now.
    const fresh = freshFrom[openId] || 0;
    if (rowNow && rowNow.savedName && !fresh) { person.accountName = person.name; person.name = rowNow.savedName; }
    const pres = presence[person.accountId];
    const iBlocked = isBlocked(person.accountId);
    if (pres && !iBlocked) {
      person.online = Boolean(pres.online);
      const seen = hellooLastSeenText(pres.lastSeenAt);
      if (!pres.online && seen) person.lastSeen = seen.replace(/^last seen /, "");
    }
    const allMsgs = thread ? (fresh ? thread.messages.filter((m) => !m.at || new Date(m.at).getTime() >= fresh - 2000) : thread.messages) : [];
    const msgs = chatPeriod && chatPeriod !== "all" ? allMsgs.filter((m) => !m.at || hellooInPeriod(m.at, chatPeriod)) : allMsgs;
    msgs.forEach((m) => { if (m.kind === "photo" && m.id && !m.localSrc && !mediaUrls[m.id] && (!m.view || !m.view.mode || m.view.mode === "keep" || (m.view.mode === "day" && new Date(m.view.expiresAt).getTime() > Date.now()))) loadMedia(m.id); });
    const firstName = (person.name || "").split(" ")[0];
    const bubbles = hellooThreadBubbles(msgs, meId, serverChat && serverChat.theyReadAt, (m) => {
      if (m.kind === "call") return { onCallBack: () => startCall(person, Boolean(m.call && m.call.video)) };
      if (m.kind === "payment" && m.payment && m.payment.referenceId) return { onOpenReceipt: () => openGloobalReceipt(m.payment.referenceId) };
      if (m.kind === "order" && m.id) return { onOpenReceipt: m.payment && m.payment.referenceId ? () => openGloobalReceipt(m.payment.referenceId) : undefined, statusBusy: orderBusy === m.id, onStatus: (status) => answerOrder(m.id, status), onRefund: () => { setPay({ amount: String((m.order && m.order.total) || ""), note: "Order sold out · money back", busy: false, error: "" }); setSheet("pay"); } };
      if (m.kind === "voice" && m.id) return { playing: voicePlay.id === m.id, progress: voicePlay.id === m.id ? voicePlay.progress : 0, onPlay: () => playVoice(m.id) };
      if (m.kind === "photo" || m.kind === "video") {
        const mode = (m.view && m.view.mode) || "keep";
        const mineMsg = m.from === meId;
        const legacy = !(m.view && m.view.mode);
        const meta = { id: m.id, kind: m.kind, fx: m.fx || "", canSave: mode === "keep" && (legacy || mineMsg || Boolean(m.view && m.view.save)), mine: mineMsg, once: mode === "once" && !mineMsg };
        // The first private one asks first: it is marked, and they are told.
        const guard = (fn) => () => { if (mineMsg || legacy || hellooWatchWarned(meId)) { fn(); return; } setWatchAsk({ go: fn }); };
        const src = (m.id && mediaUrls[m.id]) || m.localSrc || null;
        if (m.kind === "photo" && mode !== "once") return { src, onOpen: src ? guard(() => { setPhotoMeta(meta); setPhotoView(src); }) : undefined };
        // A clip, or a see-once photo: fetched when tapped, never before.
        return { busy: snapBusy === m.id, onOpen: m.id || src ? guard(() => openSnap(m, meta, src)) : undefined };
      }
      return null;
    }, { them: firstName });
    const failed = allMsgs.filter((m) => m.failed).length;
    const strip = failed ? <button onClick={() => retryFailed(openId)} className="v2-tap" style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 999, background: T.negative, color: "#fff", fontSize: 12, fontWeight: 800, padding: "6px 13px", margin: "4px 0 8px", cursor: "pointer", fontFamily: T.fontBody }}><HlRetry size={13} />{failed} not sent · Retry</button> : (thread && !thread.loaded ? <div style={{ alignSelf: "center", fontSize: 12, fontWeight: 700, color: T.inkFaint, margin: "10px 0" }}>Loading…</div> : null);
    const draft = drafts[openId] || "";
    const reply = replyTo && replyTo.chatId === openId ? replyTo : null;
    const sendText = () => {
      const text = draft.trim();
      if (!text) return;
      setDrafts((d) => Object.assign({}, d, { [openId]: "" }));
      setReplyTo(null);
      deliver(openId, Object.assign({ kind: "text", text }, reply ? { replyToId: reply.id, replyPreview: { id: reply.id, from: reply.fromAccount, preview: reply.preview } } : {}));
    };
    const heldMine = held && held.from === "me";
    const heldFresh = held && Date.now() - new Date(held.at).getTime() < 48 * 3600e3;
    const heldItems = held ? [
      held.kind !== "deleted" && [HlReply, "Reply", false, () => { setReplyTo({ chatId: openId, id: held.id, who: heldMine ? "yourself" : firstName, preview: held.preview, fromAccount: heldMine ? meId : person.accountId }); setHeld(null); }],
      (held.kind === "text" || (held.kind === "photo" && held.text)) && [HlCopy, "Copy text", false, async () => { try { await navigator.clipboard.writeText(held.text); setToast("Copied"); } catch (e) { setToast("Could not copy"); } setHeld(null); }],
      !heldMine && held.paidText && [HlRupee, "Give back…", false, () => { setHeld(null); setGiveBack({ percent: 50, busy: false }); setSheet("giveback"); }],
      heldMine && (held.kind === "photo" || held.kind === "video") && !held.gone && held.id && [HlShield, "Take it back · gone for both", true, () => { const id = held.id; setHeld(null); hellooApi.takeBack(id).then(() => { setMediaUrls((all) => { const next = Object.assign({}, all); delete next[id]; return next; }); loadThread(openId); setToast("Taken back · it opens for nobody now"); }).catch((err) => setToast((err && err.message) || "Couldn't take it back")); }],
      held.id && ["photo", "video", "voice", "text"].includes(held.kind) && !held.gone && (held.viewMode || "keep") === "keep" && (heldMine || !held.noForward) && [HlForward, "Forward", false, () => { setForwardOf(held); setHeld(null); }],
      [HlTrash, "Delete for me", true, () => deleteMessage(openId, held, false)],
      heldMine && heldFresh && held.kind !== "receipt" && held.kind !== "deleted" && [HlTrash, "Delete for everyone", true, () => deleteMessage(openId, held, true)]
    ].filter(Boolean) : [];
    const menuItems = [
      [HlUser, "View profile", false, null, () => { setSheet(null); setScreen("contact"); }],
      // A person's chat is named by you, and can be private. A business comes
      // under its own name; what you choose for it is whether its paid
      // messages may show on Home.
      hellooIsBusiness(person)
        ? [HlBellOff, rowNow && rowNow.offHome ? "Show on home" : "Hide from home", false, null, () => { setSheet(null); if (rowNow) { setPrefs(openId, { offHome: !rowNow.offHome }); setToast(rowNow.offHome ? "Its paid messages show on home again" : "Kept off home · find it by typing its name"); } }]
        : fresh ? null : [HlPencil, rowNow && rowNow.private ? "Private chat · change name" : rowNow && rowNow.savedName ? "Change name · make private" : "Name this chat · make private", false, null, () => { if (rowNow) openNameEdit(rowNow); }],
      // Both keep it private and they forgot their name: let them see it once.
      ...(!fresh && rowNow && rowNow.private && !hellooIsBusiness(person) ? [[HlLock, rowNow.releaseState ? `Release once for them · ${rowNow.releaseState.state === "opened" ? "opened" : rowNow.releaseState.state === "waiting" ? "waiting" : "ended"}` : "Release once for them", false, null, () => { setRelease({ chatId: openId, pin: "", busy: false, error: "", mode: "give" }); setSheet("release"); }]] : []),
      // Find by date lives here, not in the header: the header keeps just
      // video, call and ⋮. On while a period is set, so it reads as a filter.
      [HlCalendar, chatPeriod && chatPeriod !== "all" ? "Find by date · on" : "Find by date", false, null, () => setSheet("find-date")],
      // Every payment between you two, from your GLOOBAL history.
      person.gloobalId ? [HlWallet, "Payment history", false, null, () => openPayHistory(person)] : null,
      // This chat's own colours: it recolours behind the picker as you tap.
      [HlPalette, "Chat colours", false, null, () => setSheet("chat-theme")],
      [HlBellOff, muted ? "Unmute notifications" : "Mute notifications", false, null, () => { setSheet(null); setPrefs(openId, { muted: !muted }); setToast(muted ? "Notifications on for this chat" : "Muted · no notifications from this chat"); }],
      // Who can reach me, just for this person: Free, Pays per message, Never.
      ...(!hellooIsBusiness(person) && !iBlocked ? [[HlRupee, "Who can reach me", false, null, () => { loadPersonReach(person.accountId); setSheet("reach-person"); }]] : []),
      // An account that is both a person and a shop can move a chat to
      // its other side; the other person then sees that side's name.
      ...(primaryFace && hellooFaceNow.as && meId === user.accountId && rowNow ? [[primaryFace && rowNow.side === "self" ? HlStore : HlUser, rowNow.side === "self" ? `Move to ${primaryFace.name}` : "Move to Personal", false, null, () => { setSheet(null); moveSide(openId, rowNow.side === "self" ? "shop" : "self"); }]] : []),
      [HlTrash, "Clear chat", false, null, () => { setSheet("confirm-clear"); }],
      [HlBan, iBlocked ? `Unblock ${firstName}` : `Block ${firstName}`, !iBlocked, null, () => { setSheet(null); setBlock(person, !iBlocked); }]
    ];
    const card = reachCards[person.accountId];
    const rule = card && card.rule;
    const theyPaid = allMsgs.filter((m) => m.from === person.accountId && m.paid && m.paid.amount);
    const earnedHere = theyPaid.reduce((n, m) => n + Number(m.paid.amount || 0), 0);
    const showPaidStrip = !iBlocked && theyPaid.length > 0 && !allowedIds.has(person.accountId);
    const closedNote = rule && !rule.free && rule.closed ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><HlLock size={18} color={T.inkSoft} /><span style={{ flex: 1, fontSize: 13, color: T.inkSoft, lineHeight: 1.4 }}>{card.askPending ? `Your request is waiting for ${firstName}.` : (rule.kind === "business" ? `${firstName} doesn't take messages from businesses. Ask first, free.` : `${firstName} only takes requests from people they haven't allowed. Ask first, free.`)}</span>{!card.askPending && <button onClick={() => { setAskText(""); setSheet("ask"); }} className="v2-tap" style={{ flexShrink: 0, whiteSpace: "nowrap", border: "none", borderRadius: 999, background: T.accentSoft, color: T.accent, fontWeight: 800, fontSize: 13, padding: "8px 14px", cursor: "pointer", fontFamily: T.fontBody }}>Ask · free</button>}</div> : null;
    const note = iBlocked ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><HlBan size={18} color={T.inkSoft} /><span style={{ flex: 1, fontSize: 13, color: T.inkSoft, lineHeight: 1.4 }}>You blocked {firstName}. They can't message you.</span><button onClick={() => setBlock(person, false)} className="v2-tap" style={{ flexShrink: 0, whiteSpace: "nowrap", border: "none", borderRadius: 999, background: T.accentSoft, color: T.accent, fontWeight: 800, fontSize: 13, padding: "8px 14px", cursor: "pointer", fontFamily: T.fontBody }}>Unblock</button></div> : closedNote;
    const paidStrip = showPaidStrip ? <HellooPaidMessageStrip person={person} earnedText={hellooMoneyText(earnedHere, theyPaid[0].paid.currency)} isBusiness={Boolean(person.handle)} onAllow={() => hellooApi.allow(person.accountId, true).then(() => { refreshMyReach(); setToast(`${firstName} reaches you free now`); }).catch((err) => setToast(err.message))} onBlock={() => setBlock(person, true)} onGiveBack={() => { setGiveBack({ percent: 50, busy: false }); setSheet("giveback"); }} /> : null;
    if (priceGate && priceGate.chatId === openId) {
      return shell(<><HellooPriceCard person={priceGate.person} price={priceGate.rule.price} currency={priceGate.rule.currency} viewerIsBusiness={priceGate.rule.kind === "business"} balance={priceGate.balance != null && !Number.isNaN(priceGate.balance) ? priceGate.balance : null} balanceCurrency={me.currency} busy={Boolean(priceGate.busy)} onAgree={() => payAndSend(priceGate)} onAsk={card && card.askPending ? undefined : () => { setPriceGate(null); setAskText(""); setSheet("ask"); }} onBack={() => setPriceGate(null)} /><PayPinModal open={Boolean(reachPin)} onClose={() => setReachPin(null)} amountLabel={hellooMoneyText(priceGate.rule.price, priceGate.rule.currency)} onVerified={(pinValue) => payAndSend(priceGate, pinValue)} /></>);
    }
    if (watchAsk) return shell(<><HellooScreen style={{ background: HT.chatBg || HT.wash }} /><HellooWatchWarning me={me} onClose={() => setWatchAsk(null)} onAgree={() => { const go = watchAsk.go; hellooWatchAgree(meId); setWatchAsk(null); go(); }} /></>);
    if (waOpen && waInfo) return shell(<HellooWaHistoryScreen chatId={openId} person={person} onBack={() => setWaOpen(false)} onRemoved={() => { try { localStorage.removeItem("helloo.wa." + openId); } catch (e) { /* fine */ } setWaInfo(null); setWaOpen(false); setToast("WhatsApp history removed from this phone"); }} />);
    if (snapCam) return shell(<HellooSnapCamera person={person} onClose={() => setSnapCam(false)} onSend={sendSnap} onToast={setToast} />);
    return shell(<HellooThreadScreen history={waInfo ? <HellooWaHistoryRow info={waInfo} onOpen={() => setWaOpen(true)} /> : null} onSnap={() => setSnapCam(true)} onSticker={(id) => deliver(openId, { kind: "sticker", stickerId: id })} onPaySticker={(id) => { const st = HELLOO_STICKERS[id] || {}; const amt = hellooStickerAmount(id); setPay({ amount: amt ? String(amt) : "", note: st.words || "", busy: false, error: "", sticker: id }); setSheet("pay"); }} me={me} chat={{ id: openId, person, messages: bubbles }} onFindDate={() => setSheet("find-date")} dateOn={Boolean(chatPeriod && chatPeriod !== "all")} strip={<>{chatPeriod && chatPeriod !== "all" ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: HT.barBg || T.surface, borderBottom: `1px solid ${T.line}` }}><HellooPeriodPill value={chatPeriod} onOpen={() => setSheet("find-date")} onClear={() => setChatPeriod(null)} />{msgs.length === 0 ? <span data-testid="helloo-period-empty" style={{ fontSize: 12.5, color: T.inkSoft }}>Nothing {hellooPeriodWords(chatPeriod)} in this chat.</span> : <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 700 }}>{msgs.length} {msgs.length === 1 ? "message" : "messages"}</span>}</div> : null}{paidStrip}{strip}</>} paidPrice={rule && !rule.free && !rule.closed ? rule.price : 0} paidCurrency={rule && rule.currency} typing={Boolean(typing[openId]) && !iBlocked} draft={draft} onDraft={(v) => onDraftChange(openId, v)} onSend={sendText} recording={recording} onMic={recording ? stopAndSend : startRecording} onCancelRecording={cancelRecording} hasOlder={Boolean(thread && thread.more)} onLoadOlder={() => loadThread(openId, true)} onPay={person.gloobalId ? () => { setPay({ amount: "", note: "", busy: false, error: "" }); setSheet("pay"); } : undefined} onAttach={() => setSheet("attach")} onMenu={person.handle && person.gloobalId && !iBlocked ? () => openMenu(person) : undefined} onMore={() => setSheet("menu")} onOpenPerson={() => setScreen("contact")} onCall={!iBlocked && person.gloobalId ? () => startCall(person, false) : undefined} onVideo={!iBlocked && person.gloobalId ? () => startCall(person, true) : undefined} onMessageHold={(m) => setHeld(m)} replyTo={reply} onCancelReply={() => setReplyTo(null)} composerNote={note} onBack={closeThread}>
      {sheet === "pay" && <HellooPaySheet sticker={pay.sticker || ""} person={person} me={me} amount={pay.amount} onAmount={(a) => setPay((p) => Object.assign({}, p, { amount: a.replace(/^0+/, ""), error: "" }))} note={pay.note} onNote={(n) => setPay((p) => Object.assign({}, p, { note: n }))} choiceId={pay.choiceId || null} onChoice={(id) => setPay((p) => Object.assign({}, p, { choiceId: id }))} busy={pay.busy} error={pay.error} onClose={() => { if (!pay.busy) setSheet(null); }} onSend={() => startPay(person, openId)} />}
      {sheet === "shopmenu" && <HellooShopMenuSheet shop={person} items={menu.items} basket={menu.basket} onAdd={(it) => menuBump(it, 1)} onRemove={(it) => menuBump(it, -1)} totalText={hellooMoneyText(menuTotal, menuCurrency)} note={menu.note} onNote={(v) => setMenu((m) => Object.assign({}, m, { note: v }))} busy={menu.busy} error={menu.error} loadError={menu.loadError} paidAlready={Boolean(menu.paidRef)} onPay={() => (menu.paidRef ? orderNow(person, openId, "") : setOrderPinOpen(true))} onClose={() => { if (!menu.busy) setSheet(null); }} />}
      <PayPinModal open={orderPinOpen} onClose={() => setOrderPinOpen(false)} amountLabel={hellooMoneyText(menuTotal, menuCurrency)} onVerified={(pinValue) => orderNow(person, openId, pinValue)} />
      {sheet === "attach" && <HellooAttachSheet onClose={() => setSheet(null)} items={[[HlImage, "Gallery", "#7C3AED", () => galleryRef.current && galleryRef.current.click()], [HlCamera, "Camera", "#DB2777", () => cameraRef.current && cameraRef.current.click()], [HlRupee, "Pay", "#0B7A57", () => { setPay({ amount: "", note: "", busy: false, error: "" }); setSheet("pay"); }]]} />}
      {sheet === "menu" && <HellooThreadMenu chat={{ person: Object.assign({}, person, { id: person.gloobalId }) }} items={menuItems.filter(Boolean)} onClose={() => setSheet(null)} />}
      {sheet === "savename" && nameSheet}
      {sheet === "release" && release && releaseSheet}
      {sheet === "pay-history" && payHist && <HellooSheet label="Payment history" onClose={() => setSheet(null)}><div data-testid="helloo-pay-history"><div style={{ fontSize: 17, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Payments with {firstName || hellooName(person)}</div>{payHist.rows === null ? <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: T.inkSoft }}>Loading your GLOOBAL history…</div> : payHist.error ? <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: T.negative, fontWeight: 700 }}>{payHist.error}</div> : !payHist.rows.length ? <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: T.inkSoft }}>No payments between you two yet.</div> : <>{(() => {
        const cur = (me && me.currency) || user.currency || "INR";
        const sum = (dir) => payHist.rows.filter((t) => (dir === "in" ? t.direction === "received" : t.direction !== "received") && (!t.currency || t.currency === cur)).reduce((a, t) => a + (Number(t.amount) || 0), 0);
        const box = (label, v, color) => <span style={{ flex: 1, minWidth: 0, background: T.surface, borderRadius: 14, padding: "10px 12px", boxShadow: T.shadowCard }}><span style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.inkSoft }}>{label}</span><span style={{ display: "block", fontSize: 15, fontWeight: 800, color, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hellooMoneyText(v, cur)}</span></span>;
        return <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>{box("You paid", sum("out"), T.ink)}{box("You got", sum("in"), HT.free)}</div>;
      })()}<div style={{ borderRadius: 18, background: T.surface, boxShadow: T.shadowCard, overflow: "hidden", maxHeight: "52vh", overflowY: "auto" }}>{payHist.rows.map((t, k) => { const got = t.direction === "received"; return typeof TransactionRow === "function" ? <TransactionRow key={t.txnId || k} t={t} color={got ? (T.txnIn || HT.free) : (T.txnOut || T.ink)} sign={got ? "+" : "−"} ccyCode={(me && me.currency) || "INR"} isFirst={k === 0} onSelect={() => { const b = buildGloobalReceipt(t, payHist.h); if (b) { setSheet(null); setGReceipt(b); } }} /> : null; })}</div><div style={{ fontSize: 11.5, color: T.inkFaint, textAlign: "center", marginTop: 10 }}>From your GLOOBAL history · tap one for its receipt</div></>}</div></HellooSheet>}
      {sheet === "chat-theme" && <HellooChatThemeSheet current={chatThemeNow} onPick={(k) => setPrefs(openId, { theme: k })} onClose={() => setSheet(null)} />}
      {sheet === "find-date" && <HellooDateSheet title="Find messages by date" value={chatPeriod || "all"} marks={new Set(allMsgs.filter((m) => m.at).map((m) => hellooDayKey(new Date(m.at))))} onClose={() => setSheet(null)} onPick={(k) => { setSheet(null); setChatPeriod(k === "all" ? null : k); }} />}
      {sheet === "reach-person" && <HellooSheet label="Who can reach me" onClose={() => setSheet(null)}><div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Who can reach me</div><div style={{ fontSize: 12.5, color: T.inkSoft, margin: "3px 0 12px" }}>Just for {firstName}. Everyone else follows your usual settings.</div><HellooReachChoice who={firstName} reach={together[person.accountId] && together[person.accountId].reachMode ? together[person.accountId] : null} busy={reachBusy} onChange={(mode, price) => setPersonReach(person.accountId, mode, price)} /></HellooSheet>}
      {sheet === "confirm-clear" && <HellooSheet label="Clear chat" onClose={() => setSheet(null)}><div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Clear this chat?</div><div style={{ fontSize: 13, color: T.inkSoft, marginTop: 6, lineHeight: 1.45 }}>Every message disappears for you. {firstName} still has them. Payments stay in your GLOOBAL history.</div><div style={{ display: "flex", gap: 10, marginTop: 16 }}><HellooSecondary onClick={() => setSheet(null)}>Cancel</HellooSecondary><HellooPrimary color={T.negative} onClick={() => { setSheet(null); clearChat(openId, false); }}>Clear chat</HellooPrimary></div></HellooSheet>}
      {held && <HellooMessageActions m={held} reactions={false} items={heldItems} onClose={() => setHeld(null)} />}
      {sheet === "ask" && <HellooAskSheet person={person} text={askText} onText={setAskText} priceText={rule && !rule.free && !rule.closed ? `${hellooMoneyText(rule.price, rule.currency)}/message` : ""} onClose={() => setSheet(null)} onSend={() => hellooApi.ask(person.accountId, askText.trim()).then(() => { setSheet(null); setToast(`Request sent to ${firstName}`); refreshCard(person.accountId); }).catch((err) => setToast(err.message))} />}
      {sheet === "giveback" && <HellooRefundSheet person={person} earnedValue={earnedHere} earnedText={hellooMoneyText(earnedHere, me.currency)} currency={me.currency} percent={giveBack.percent} onPercent={(v) => setGiveBack((g) => Object.assign({}, g, { percent: v }))} onRefund={() => setGiveBackPin({ person, chatId: openId, earned: earnedHere, percent: giveBack.percent })} onClose={() => { if (!giveBack.busy) setSheet(null); }} />}
      <PayPinModal open={Boolean(giveBackPin)} onClose={() => setGiveBackPin(null)} amountLabel={giveBackPin ? hellooMoneyText(Math.round(giveBackPin.earned * giveBackPin.percent) / 100, me.currency) : ""} onVerified={(pinValue) => giveBackPin && giveBackNow(giveBackPin.person, giveBackPin.chatId, giveBackPin.earned, giveBackPin.percent, pinValue)} />
      {!priceGate && <PayPinModal open={Boolean(reachPin)} onClose={() => setReachPin(null)} amountLabel={reachPin ? hellooMoneyText(reachPin.rule.price, reachPin.rule.currency) : ""} onVerified={(pinValue) => reachPin && payAndSend(reachPin, pinValue)} />}
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; pickPhoto(f); }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; pickPhoto(f); }} />
      <PayPinModal open={payPinOpen} onClose={() => setPayPinOpen(false)} amountLabel={hellooMoneyText(Number(pay.amount) || 0, me.currency)} onVerified={(pinValue) => payNow(person, openId, pinValue)} />
    </HellooThreadScreen>);
  }

  // ── Their profile ────────────────────────────────────────────────────
  if (openId && screen === "contact") {
    const serverChat = (thread && thread.chat) || (chatRows || []).find((c) => c.id === openId) || null;
    const rowNow = (chatRows || []).find((c) => c.id === openId);
    const muted = Boolean((rowNow && rowNow.muted) || (serverChat && serverChat.muted));
    const person = serverChat ? hellooPersonFrom(serverChat.person, photos) : { id: "", name: "", country: "" };
    const pres = presence[person.accountId];
    const iBlocked = isBlocked(person.accountId);
    const firstName = (person.name || "").split(" ")[0];
    // The profile's Media: pictures load as they are listed; a clip or a
    // voice note is asked for when it is tapped.
    const mediaList = profileMedia && profileMedia.chatId === openId ? profileMedia.list : [];
    mediaList.forEach((m) => { if (m.kind === "photo" && m.id && !mediaUrls[m.id]) loadMedia(m.id); });
    const mediaState = profileMedia && profileMedia.chatId === openId ? { loading: profileMedia.loading, counts: profileMedia.counts, items: mediaList.map((m) => {
      const mineMsg = m.from === meId;
      const legacy = !(m.view && m.view.mode);
      const meta = { id: m.id, kind: m.kind, fx: m.fx || "", canSave: legacy || mineMsg || Boolean(m.view && m.view.save), mine: mineMsg, once: false };
      const src = mediaUrls[m.id] || null;
      const guard = (fn) => () => { if (mineMsg || legacy || hellooWatchWarned(meId)) { fn(); return; } setWatchAsk({ go: fn }); };
      const base = { id: m.id, kind: m.kind, at: m.at, mine: mineMsg, fx: m.fx || "" };
      if (m.kind === "voice") return Object.assign(base, { seconds: (m.voice && m.voice.seconds) || 0, playing: voicePlay.id === m.id, onOpen: () => playVoice(m.id) });
      if (m.kind === "video") return Object.assign(base, { seconds: (m.video && m.video.seconds) || 0, busy: snapBusy === m.id, onOpen: guard(() => openSnap(m, meta, src)) });
      return Object.assign(base, { src, onOpen: src ? guard(() => { setPhotoMeta(meta); setPhotoView(src); }) : undefined });
    }) } : null;
    const status = !iBlocked && pres ? (pres.online ? "" : hellooLastSeenText(pres.lastSeenAt)) : "";
    const tog = together[person.accountId] || null;
    const allowed = allowedIds.has(person.accountId);
    if (watchAsk) return shell(<><HellooScreen style={{ background: HT.chatBg || HT.wash }} /><HellooWatchWarning me={me} onClose={() => setWatchAsk(null)} onAgree={() => { const go = watchAsk.go; hellooWatchAgree(meId); setWatchAsk(null); go(); }} /></>);
    return shell(<HellooContactScreen media={person.handle ? null : mediaState} mediaFilter={mediaFilter} onMediaFilter={setMediaFilter} shop={person.handle ? (shopCards[person.gloobalId] || null) : null} onMenu={person.handle && !iBlocked ? () => { setScreen(null); openMenu(person); } : undefined} person={Object.assign({}, person, { id: person.gloobalId, online: Boolean(!iBlocked && pres && pres.online) })} status={status} together={tog} currency={me.currency} shops={hellooIsBusiness(person) ? null : (personShops[person.accountId] || []).map((c) => { const sp = hellooPersonFrom(c, photos); return { person: Object.assign({}, sp, { handle: c.handle }), shop: shopCards[c.gloobalId] || null }; })} onShop={(sp) => openChatWith(sp.accountId, true)} reach={tog && tog.reachMode ? tog : null} reachBusy={reachBusy} onReach={hellooIsBusiness(person) || iBlocked ? undefined : (mode, price) => setPersonReach(person.accountId, mode, price)} onSaveReview={person.handle ? (stars, text) => GloobalApi.saveCreatorReview(person.gloobalId, { stars, text }).then(() => { loadShopCard(person); setToast("Thanks — your feedback is in"); }) : undefined} onBack={closeProfile} onMessage={() => setScreen(null)} onCall={!iBlocked ? () => startCall(person, false) : undefined} onVideo={!iBlocked ? () => startCall(person, true) : undefined} onPay={person.gloobalId ? () => { setScreen(null); setPay({ amount: "", note: "", busy: false, error: "" }); setSheet("pay"); } : undefined} groups={[
      [[HlRupee, allowed ? "Reaches you free" : "Pays your price to reach you", allowed ? "Allowed" : (myReach && myReach.people.price ? hellooMoneyText(myReach.people.price, myReach.currency) : "Free"), () => hellooApi.allow(person.accountId, !allowed).then(() => { refreshMyReach(); setToast(allowed ? `${firstName} pays your price again` : `${firstName} reaches you free`); }).catch((err) => setToast(err.message)), false, HT.free], [HlBellOff, muted ? "Unmute notifications" : "Mute notifications", muted ? "Muted" : "Off", () => setPrefs(openId, { muted: !muted }), false, T.inkSoft], [HlWallet, "Payments between you", tog ? String(tog.money.toThem.n + tog.money.toMe.n) : "", () => window.open(HELLOO_GLOOBAL_SITE, "_blank", "noopener"), false, "#0B7A57"]],
      [[HlTrash, "Clear chat", "", () => { setScreen(null); setSheet("confirm-clear"); }, false, T.inkSoft], [HlBan, iBlocked ? `Unblock ${firstName}` : `Block ${firstName}`, "", () => setBlock(person, !iBlocked), !iBlocked]]
    ].map((rows, g) => (g === 0 && !hellooIsBusiness(person) ? rows.slice(1) : rows))} />);
  }

  // ── Data the screens and tabs share ─────────────────────────────
  const addSheet = <HellooSheet label="Add someone" onClose={() => setSheet(null)}><div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, marginBottom: 4 }}>Add someone</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 12, lineHeight: 1.45 }}>Helloo never reads your phone book. People are here by GLOOBAL ID only.</div><HellooCard><HellooRow Icon={HlHash} title="Dial their GLOOBAL ID" value="12 symbols" first onPress={() => { setDial({ value: "", status: "", match: null }); setSheet("dial"); }} /><HellooRow Icon={HlScan} color="#0E7490" title="Scan their GLOOBAL QR" onPress={() => { setSheet(null); setScreen("scan"); }} /><HellooRow Icon={HlCopy} color="#EA580C" title="Paste an ID or link" onPress={async () => { try { const text = String(await navigator.clipboard.readText() || "").trim(); const parsed = typeof parseGloobalPayPayload === "function" ? parseGloobalPayPayload(text) : null; if (parsed && parsed.gloobalId) { setSheet(null); openChatWith(parsed.gloobalId, true); } else setToast("Nothing GLOOBAL on the clipboard"); } catch (e) { setToast("Long-press the dial box to paste instead"); } }} /></HellooCard>{contacts.length > 0 && <HellooSection title="People you've paid on GLOOBAL" hint="already here"><HellooCard>{contacts.slice(0, 8).map((p, i) => <button key={p.id} onClick={() => { setSheet(null); openChatWith(p.accountId, true); }} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><HellooAvatar person={p} size={40} /><span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span><HlChevron size={16} color={T.inkFaint} /></button>)}</HellooCard></HellooSection>}</HellooSheet>;
  const rows = (chatRows || []).map((c) => {
    const row = hellooChatRowFrom(c, photos);
    const pres = presence[c.person && c.person.accountId];
    if (pres && row.person) row.person.online = Boolean(pres.online);
    if (isBlocked(c.person && c.person.accountId) && row.person) row.person.online = false;
    else row.typing = Boolean(typing[c.id]);
    return row;
  });
  const q = query.trim().toLowerCase();
  // No chats until a name is typed; a private one only for its whole saved
  // name (hellooClient, hellooChatsFor).
  const shownRows = hellooChatsFor(rows, query, privateLocked);
  // What is new, as a NUMBER — and never counting a private chat, which
  // makes no sign of any kind until it is opened.
  // A business's paid message is shown on Home as a card (hellooHomeCards);
  // the count below it is for everything else.
  const paidCards = hellooHomeCards(rows);
  const onCard = new Set(paidCards.map((c) => c.id));
  const unread = rows.reduce((n, c) => n + (c.private ? 0 : (c.unread || 0)), 0);
  const unreadOwn = rows.reduce((n, c) => n + (c.private || onCard.has(c.id) ? 0 : (c.unread || 0)), 0);
  const unreadChats = rows.filter((c) => !c.private && !onCard.has(c.id) && c.unread).length;
  const callsAll = (callLog || []).filter((c) => !(c.person && privatePeople.has(c.person.accountId))).map((c) => hellooCallFrom(c, photos));
  const missedCount = callsAll.filter((c) => c.missed && c.at > new Date(Date.now() - 24 * 3600e3)).length;
  const banner = loadError
    ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "10px 14px", borderRadius: 16, background: T.surfaceSunk, color: T.inkSoft, fontSize: 12.5, fontWeight: 700 }}><HlRetry size={14} /><span style={{ flex: 1 }}>{loadError}</span><button onClick={refreshChats} style={{ border: "none", background: "none", color: T.accent, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Retry</button></div>
    : live === "offline" && chatRows !== null ? <div style={{ marginBottom: 10, padding: "8px 14px", borderRadius: 16, background: T.surfaceSunk, color: T.inkSoft, fontSize: 12, fontWeight: 700 }}>Reconnecting… new messages will arrive in a moment</div> : null;
  // Something new on another side: say so, with the way over.
  const otherFresh = hellooFaceNow.as ? (faces || []).filter((f) => f.as !== hellooFaceNow.as && f.fresh > 0) : [];
  const faceBanner = otherFresh.map((f) => <button key={f.as} data-testid="helloo-face-banner" onClick={() => switchFace(f.as)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "10px 14px", borderRadius: 16, border: "none", background: T.accentSoft, color: T.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>{f.kind === "shop" ? <HlStore size={15} color={T.accent} /> : <HlUser size={15} color={T.accent} />}<span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.kind === "shop" ? f.name : "Personal"} · {f.fresh} new</span><span style={{ color: T.accent, fontWeight: 800 }}>Switch</span></button>);
  const faceSheets = <>{sheet === "face" && faces && faces.length > 1 && <HellooFaceSheet faces={faces} current={hellooFaceNow.as} onClose={() => setSheet(null)} onPick={(f) => { if (f.as === hellooFaceNow.as) setSheet(null); else switchFace(f.as); }} />}{sheet === "shop-calls" && activeFace && activeFace.kind === "shop" && <HellooShopCallsSheet calls={activeFace.calls} shopName={activeFace.name} onClose={() => setSheet(null)} onSave={async (calls) => { try { await hellooApi.saveCalls(Object.assign({}, calls, { tz: -new Date().getTimezoneOffset() })); await refreshFaces(); setSheet(null); setToast(calls.mode === "off" ? "Calls off · people message the shop" : calls.mode === "hours" ? `Calls ${calls.from}–${calls.to}` : "Calls on at any time"); } catch (err) { setToast(err.message); } }} />}</>;
  const contactPick = (p) => openChatWith(p.accountId);
  const empty = chatRows === null
    ? <HellooCard style={{ padding: "22px 16px", textAlign: "center", fontSize: 13, color: T.inkFaint, fontWeight: 700 }}>Loading your chats…</HellooCard>
    // Typed, and nothing found: say nothing. "No chat matches" for a near
    // miss and silence for the rest would tell a guesser which is which.
    : q ? null
    : rows.length ? <>{rows.filter((c) => c.released && new Date(c.released.expiresAt).getTime() > Date.now()).map((c) => <button key={"rel" + c.id} data-testid="helloo-released-card" onClick={() => { setRelease({ chatId: c.id, pin: "", busy: false, error: "", mode: "take" }); setSheet("release"); }} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "14px 16px", borderRadius: 18, border: `1px dashed ${T.accent}`, background: T.accentSoft, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 40, height: 40, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HlLock size={18} color="#fff" /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink }}>A private chat was released for you</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 2 }}>Open it with your PIN within {Math.max(1, Math.ceil((new Date(c.released.expiresAt).getTime() - Date.now()) / 60000))} min</span></span><HlChevron size={18} color={T.accent} /></button>)}<HellooCard style={{ padding: "20px 16px", textAlign: "center" }}><div data-testid="helloo-home-count" style={{ fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{unreadOwn > 0 ? `${unreadOwn} new ${unreadOwn === 1 ? "message" : "messages"}${unreadChats > 1 ? ` in ${unreadChats} chats` : ""}` : paidCards.length ? "Nothing else new" : "Nothing new"}</div><div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 5, lineHeight: 1.5 }}>{unreadOwn ? "Tap the search bar to see who they are from." : "Your chats stay off this screen. Type a name above to open one."}</div></HellooCard></>
    : <><HellooCard style={{ padding: "18px 16px" }}><div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>No chats yet</div><div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4, lineHeight: 1.45 }}>{contacts.length ? "Start with someone you have paid on GLOOBAL, or dial any GLOOBAL ID." : "Dial a GLOOBAL ID or scan someone's GLOOBAL QR to start."}</div><div style={{ display: "flex", gap: 8, marginTop: 12 }}><HellooSecondary Icon={HlHash} onClick={() => { setDial({ value: "", status: "", match: null }); setSheet("dial"); }}>Dial an ID</HellooSecondary><HellooSecondary Icon={HlScan} onClick={() => setScreen("scan")}>Scan</HellooSecondary></div></HellooCard>{contacts.length > 0 && <HellooSection title="People you've paid" hint="free to message"><HellooCard>{contacts.slice(0, 12).map((p, i) => <button key={p.id} onClick={() => contactPick(p)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><HellooAvatar person={p} size={42} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink }}>{p.name}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.lastPaid}</span></span><HlChat size={18} color={T.accent} /></button>)}</HellooCard></HellooSection>}</>;

  const reachValue = !myReach ? "" : (myReach.people.closed && myReach.business.closed) ? "Requests only" : [myReach.people, myReach.business].map((g) => (g.closed ? "Requests only" : g.price ? hellooMoneyText(g.price, myReach.currency) : "Free")).join(" · ");
  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const meRows = ((faces || []).length > 1 ? [[HlUsers, "Using Helloo as", activeFace ? (activeFace.kind === "shop" ? activeFace.name : "Personal") : "Choose", "#7C3AED"]] : []).concat(activeFace && activeFace.kind === "shop" ? [[HlPhone, "Shop calls", hellooCallsText(activeFace.calls), HT.free], [HlUser, "On my personal profile", activeFace.show ? "Shown" : "Not shown", "#7C3AED"]] : []).concat([
    [HlRupee, "Who can reach me", reachValue, HT.free],
    [HlShield, "Privacy", !myReach ? "" : myReach.hideLastSeen ? "Online status hidden" : "Online status shown", "#2563EB"],
    [HlBell, "Notifications", push === "on" ? "On" : push === "blocked" ? "Blocked" : push === "unsupported" ? "Not on this browser" : "Off", "#EA580C"],
    [HlPalette, "Colours", "", "#9333EA"],
    [HlBan, "Blocked people", blocked ? String(blocked.length) : "", "#DC2626"]
  ]).concat(!standalone && (installEvent || isIos) ? [[HlDownload, "Install Helloo", "Home screen app", "#2563EB"]] : []);
  const onMeRow = (title) => {
    if (title === "Using Helloo as") { refreshFaces(); setSheet("face"); return; }
    if (title === "Shop calls") { setSheet("shop-calls"); return; }
    if (title === "On my personal profile") {
      const show = !activeFace.show;
      hellooApi.saveShow(show).then(() => { refreshFaces(); setToast(show ? `${activeFace.name} now shows on your personal profile` : `${activeFace.name} no longer shows on your personal profile`); }).catch((err) => setToast(err.message || "Couldn't change that."));
      return;
    }
    if (title === "Install Helloo") {
      if (installEvent) { installEvent.prompt(); installEvent.userChoice.then(() => setInstallEvent(null)).catch(() => {}); }
      else setToast("Tap Share, then Add to Home Screen");
      return;
    }
    if (title === "Who can reach me") { earningsFromMe.current = false; refreshMyReach(); setScreen("reach"); return; }
    if (title === "Privacy") { refreshMyReach(); setSheet("privacy"); return; }
    if (title === "Colours") setScreen("theme");
    else if (title === "Blocked people") { refreshBlocked(); setScreen("blocked"); }
    else if (title === "Notifications") turnOnPush();
  };
  const shareHelloo = async () => {
    const url = typeof buildGloobalPayUrl === "function" ? buildGloobalPayUrl(me.gloobalId, "person") : HELLOO_SITE;
    try {
      if (navigator.share) await navigator.share({ title: "Helloo", text: `Message me on Helloo with my GLOOBAL ID`, url: HELLOO_SITE });
      else { await navigator.clipboard.writeText(HELLOO_SITE); setToast("Link copied"); }
    } catch (e) { /* closed */ }
    return url;
  };


  // ── Full screens ─────────────────────────────────────────────────────
  if (screen === "theme") return shell(<HellooThemeScreen current={themeKey} onPick={pickTheme} onBack={() => setScreen(null)} />);
  if (screen === "qr") {
    const shareQr = async (value) => {
      try {
        if (navigator.share) await navigator.share({ title: "Message me on Helloo", text: `Message ${me.name} on Helloo`, url: value });
        else { await navigator.clipboard.writeText(value); setToast("Link copied"); }
      } catch (e) { /* closed the share sheet */ }
    };
    const saveQr = async (value) => {
      try {
        const blob = await gloobalQrToPngBlob(value, {});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "helloo-qr.png";
        a.click();
      } catch (e) { setToast("Could not save the code"); }
    };
    return shell(<HellooMyQrScreen me={me} onBack={() => setScreen(null)} onSave={saveQr} onShare={shareQr} />);
  }
  if (screen === "scan") {
    // GLOOBAL's own scanner with all its controls: torch, zoom, and a
    // picture from the gallery.
    return shell(<div style={{ position: "absolute", inset: 0, background: "#000" }}><QrCameraScanner onDetected={onScanned} active fullScreen onUploadRequested={() => scanFileRef.current && scanFileRef.current.click()} /><input ref={scanFileRef} type="file" accept="image/*" onChange={onScanFile} data-testid="helloo-scan-file" style={{ display: "none" }} /><div style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", left: 14, zIndex: 400 }}><NavBackButton onClick={() => setScreen(null)} /></div></div>);
  }

  if (screen === "reach" && myReach) {
    const prices = { people: { price: myReach.people.price, blocked: myReach.people.closed }, business: { price: myReach.business.price, blocked: myReach.business.closed } };
    const m = myReach.month || {};
    return shell(<HellooReachScreen me={me} currency={myReach.currency} prices={prices} onChange={(next) => saveReach({ people: { price: next.people.price, closed: next.people.blocked }, business: { price: next.business.price, closed: next.business.blocked } })} earnings={{ monthText: hellooMoneyText((m.earned || 0) - (m.gaveBack || 0), myReach.currency), turnedAway: String(m.turnedAway || 0) }} allowed={(myReach.allowed || []).map((c) => hellooPersonFrom(c, photos))} onRemoveAllowed={(p) => hellooApi.allow(p.accountId, false).then(() => { refreshMyReach(); setToast(`${p.name.split(" ")[0]} pays your price again`); }).catch((err) => setToast(err.message))} onEarnings={() => openEarnings("")} onBack={() => setScreen(null)} />);
  }
  if (screen === "earnings") {
    const rowsE = earnings ? earnings.rows.map((r) => ({ person: hellooPersonFrom(r.person, photos), what: `${r.messages} paid ${r.messages === 1 ? "message" : "messages"}${r.gaveBack ? ` · you gave back ${hellooMoneyText(r.gaveBack, earnings.currency)}` : ""}`, amountText: hellooMoneyText(r.amount, earnings.currency) })) : [];
    return shell(<HellooEarningsScreen me={me} rows={rowsE} totalText={earnings ? hellooMoneyText(earnings.total - earnings.gaveBack, earnings.currency) : "…"} month={monthLabel(earningsMonth)} onPrevMonth={() => stepMonth(-1)} onNextMonth={() => stepMonth(1)} hasNext={Boolean(earningsMonth)} loading={!earnings} onOpen={(r) => r.person && r.person.accountId && openChatWith(r.person.accountId)} onBack={() => setScreen(earningsFromMe.current ? "me" : "reach")} />);
  }
  if (screen === "requests") {
    const reqs = asks.map((a) => ({ id: a.id, person: Object.assign(hellooPersonFrom(a.person, photos), { business: Boolean(a.person.handle) }), kind: a.kind, text: a.text, when: hellooWhen(a.at) }));
    return shell(<HellooRequestsScreen me={me} requests={reqs} onAllow={(r) => answerAsk(r, "allow")} onDecline={(r) => answerAsk(r, "decline")} onPaid={(r, price) => answerAsk(r, "paid", price)} currency={(myReach && myReach.currency) || (me && me.currency)} onBack={() => setScreen(null)} />);
  }
  if (screen === "me") {
    return shell(<><HellooMeScreen me={me} earned={myReach && myReach.month ? { text: hellooMoneyText((myReach.month.earned || 0) - (myReach.month.gaveBack || 0), myReach.currency), sub: myReach.month.payers ? `from ${myReach.month.payers} ${myReach.month.payers === 1 ? "person" : "people"} who paid to reach you` : "Nobody has paid to reach you yet this month" } : null} onEarned={() => { earningsFromMe.current = true; openEarnings(""); }} onHelp={() => window.open(HELLOO_GLOOBAL_SITE, "_blank", "noopener")} stats={{ text: `${contacts.length} ${contacts.length === 1 ? "person" : "people"} from GLOOBAL · ${rows.length} ${rows.length === 1 ? "chat" : "chats"} · no fees` }} rows={meRows} onRow={onMeRow} onQr={() => setScreen("qr")} onCopy={async () => { try { await navigator.clipboard.writeText(me.gloobalId); setToast("GLOOBAL ID copied"); } catch (e) { setToast("Could not copy"); } }} onShare={shareHelloo} onOpenGloobal={() => window.open(HELLOO_GLOOBAL_SITE, "_blank", "noopener")} onSignOut={() => signOut("Signed out")} onBack={() => setScreen(null)} />{faceSheets}{sheet === "privacy" && <HellooSheet title="Privacy" onClose={() => setSheet(null)}><HellooPrivacyPanel picture={myReach && myReach.picture} me={me} disabled={!myReach} onPicture={setPicture} online={myReach ? !myReach.hideLastSeen : null} onOnline={(show) => setHideLastSeen(!show)} /></HellooSheet>}</>);
  }
  if (screen === "bazaar") {
    return shell(<HellooBazaarScreen query={bazaarQ} onQuery={setBazaarQ} countryIso={user && user.countryIso} ownerKey={user && user.symbolId} onOpen={openBazaarShop} onToast={setToast} onBack={() => setScreen(null)} onEarn={() => { setScreen(null); setTab("earn"); }} onUsedChat={(person) => openChatWith(person.gloobalId, false, false, "self")} onUsedPay={(seller, amount, item) => { Promise.resolve(openChatWith(seller.gloobalId, false, false, "self")).then(() => { setPay({ amount: String(amount), note: String((item && item.title) || "").slice(0, 60), busy: false, error: "" }); setSheet("pay"); }).catch(() => {}); }} />);
  }
  if (screen === "contacts") {
    const withPresence = contacts.map((p) => { const pr = presence[p.accountId]; return pr ? Object.assign({}, p, { online: Boolean(pr.online) }) : p; });
    return shell(<><HellooContactsScreen me={me} contacts={withPresence} query={contactQuery} onQuery={setContactQuery} onOpen={(p) => openChatWith(p.accountId, true, true)} onMessage={(p) => openChatWith(p.accountId, false, true)} onCall={(p) => startCall(p, false)} onVideo={(p) => startCall(p, true)} onRemove={(p) => { const name = p.handle || (p.name || "").split(" ")[0]; hellooApi.hideContact(p.accountId, true).then(() => { refreshContacts(); setToast(`${name} is out of your contacts · back if you pay or chat again`); }).catch((err) => setToast(err.message || "Couldn't remove them.")); }} onAdd={() => setSheet("add")} onBack={() => setScreen(null)} autoFocus />{sheet === "add" && addSheet}</>);
  }
  if (screen === "blocked") {
    return shell(<HellooScreen><HellooTop left={<NavBackButton onClick={() => setScreen(null)} />} title="Blocked people" subtitle="They can't message you or see when you're online" /><div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px" }}>{blocked === null ? <HellooCard style={{ padding: 18, textAlign: "center", color: T.inkFaint, fontWeight: 700, fontSize: 13 }}>Loading…</HellooCard> : blocked.length === 0 ? <HellooCard style={{ padding: 18, textAlign: "center", color: T.inkSoft, fontSize: 13 }}>You haven't blocked anyone.</HellooCard> : <HellooCard>{blocked.map((card, i) => { const p = hellooPersonFrom(card, photos); return <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i ? `1px solid ${T.line}` : "none" }}><HellooAvatar person={p} size={42} /><span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: T.ink }}>{p.name}</span><button onClick={() => setBlock(p, false)} className="v2-tap" style={{ border: "none", borderRadius: 999, background: T.accentSoft, color: T.accent, fontWeight: 800, fontSize: 12.5, padding: "7px 13px", cursor: "pointer", fontFamily: T.fontBody }}>Unblock</button></div>; })}</HellooCard>}</div></HellooScreen>);
  }

  // ── Tabs ─────────────────────────────────────────────────────────────
  return shell(<div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}><div style={{ flex: 1, minHeight: 0, position: "relative" }}>
    {tab === "chats" && <HellooChatsScreen unreadChats={rows.filter((c) => c.unread > 0 && !c.private)} onBazaar={() => setScreen("bazaar")} paidCards={paidCards} me={me} chats={shownRows} query={query} onSearch={setQuery} filter={filter} onFilter={setFilter} onOpen={(c) => openChat(c.id)} onHold={(c) => setHeldChat(c)} onStart={() => setSheet("start")} onScan={() => setScreen("scan")} onMore={() => setSheet("more")} onMe={() => setScreen("me")} onContacts={() => { setContactQuery(""); refreshContacts(); setScreen("contacts"); }} onAdd={() => setSheet("add")} banner={<>{faceBanner}{banner}</>} empty={empty} requests={asks.map((a) => ({ id: a.id, person: hellooPersonFrom(a.person, photos), text: a.text }))} onRequests={() => { refreshAsks(); setScreen("requests"); }} />}
    {heldChat && <HellooChatActions chat={heldChat} onClose={() => setHeldChat(null)} items={[
      hellooIsBusiness(heldChat.person)
        ? [HlBellOff, heldChat.offHome ? "Show on home" : "Hide from home", false, () => { setPrefs(heldChat.id, { offHome: !heldChat.offHome }); setHeldChat(null); }]
        : [HlPencil, heldChat.private ? "Private chat · change name" : "Name this chat · make private", false, () => { const c = heldChat; setHeldChat(null); openNameEdit(c); }],
      [HlPinIcon, heldChat.pinned ? "Unpin" : "Pin to top", false, () => { setPrefs(heldChat.id, { pinned: !heldChat.pinned }); setHeldChat(null); }],
      // Opens the chat with its colours picker over it, so a tap shows itself.
      [HlPalette, "Chat colours", false, () => { const c = heldChat; setHeldChat(null); openChat(c.id); setTimeout(() => setSheet("chat-theme"), 0); }],
      [HlBellOff, heldChat.muted ? "Unmute" : "Mute", false, () => { setPrefs(heldChat.id, { muted: !heldChat.muted }); setHeldChat(null); }],
      heldChat.unread > 0 && [HlCheckCheck, "Mark as read", false, () => { markRead(heldChat.id); setHeldChat(null); }],
      [HlTrash, "Delete chat", true, () => { const id = heldChat.id; setHeldChat(null); setSheet({ confirmDelete: id }); }]
    ].filter(Boolean)} />}
    {sheet && sheet.confirmDelete && <HellooSheet label="Delete chat" onClose={() => setSheet(null)}><div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Delete this chat?</div><div style={{ fontSize: 13, color: T.inkSoft, marginTop: 6, lineHeight: 1.45 }}>It leaves your list and its messages disappear for you. The other person keeps theirs. It comes back if they write again.</div><div style={{ display: "flex", gap: 10, marginTop: 16 }}><HellooSecondary onClick={() => setSheet(null)}>Cancel</HellooSecondary><HellooPrimary color={T.negative} onClick={() => { const id = sheet.confirmDelete; setSheet(null); clearChat(id, true); }}>Delete chat</HellooPrimary></div></HellooSheet>}
    {faceSheets}
    {sheet === "more" && <HellooSheet label="More" onClose={() => setSheet(null)}><HellooCard>{[
      unread > 0 && [HlCheckCheck, "Mark all as read", () => { rows.filter((c) => c.unread).forEach((c) => markRead(c.id)); setSheet(null); }],
      [HlUser, "Me · profile & settings", () => { setSheet(null); setScreen("me"); }],
      [HlBan, "Blocked people", () => { setSheet(null); refreshBlocked(); setScreen("blocked"); }],
      [HlPalette, "Colours", () => { setSheet(null); setScreen("theme"); }]
    ].filter(Boolean).map(([Icon, title, onPress], i) => <HellooRow key={title} Icon={Icon} title={title} first={i === 0} onPress={onPress} />)}</HellooCard></HellooSheet>}
    {tab === "social" && <HellooSocialHome me={me} faces={faces} photos={photos} composeTick={socialCompose} onCards={askPhotos} onToast={setToast}
      onOpenChat={(card, draft) => openChatWith(card.gloobalId, false, false, card.side === "self" ? "self" : undefined, draft)}
      onTip={(card) => payGloobalId(card.gloobalId)}
      onShop={(card) => Promise.resolve(openChatWith(card.gloobalId)).then(() => openMenu({ gloobalId: card.gloobalId })).catch(() => {})}
      onShopItem={(tag) => { if (user && tag.shop === user.symbolId) { setToast("That is your own shop"); return; } Promise.resolve(openChatWith(tag.shop)).then(() => openMenu({ gloobalId: tag.shop }, tag.itemId)).catch(() => {}); }} />}
    {tab === "earn" && <HellooAdsHome me={me} photos={photos} onCards={askPhotos} onToast={setToast} onReceipt={openGloobalReceipt} />}
    {tab === "calls" && <HellooCallsHome me={me} calls={callsAll} filter={callFilter} onFilter={setCallFilter} when={callWhen} onWhen={setCallWhen} onCallBack={(c) => startCall(c.person, c.video)} onInfo={(c) => openChatWith(c.person.accountId, true)} onOpenDial={() => { setDial({ value: "", status: "", match: null }); setSheet("dial"); }} onAdd={() => setSheet("add")} onSearch={() => { setContactQuery(""); refreshContacts(); setScreen("contacts"); }} onScan={() => setScreen("scan")} onMe={() => setScreen("me")} />}
    {sheet === "dial" && <HellooDialSheet contacts={contacts} saved={Boolean(dial.match && contacts.some((c) => c.accountId === dial.match.accountId))} saving={dialSaving} onSave={() => { const m = dial.match; if (!m || dialSaving) return; setDialSaving(true); hellooApi.open(m.gloobalId).then(() => { refreshContacts(); setToast(`${m.handle || (m.name || "").split(" ")[0]} saved`); }).catch((err) => setToast((err && err.message) || "Couldn't save them right now.")).then(() => setDialSaving(false)); }} dial={dial.value} onDial={(v) => setDial((d) => Object.assign({}, d, { value: v }))} match={dial.match} status={dial.status} mode={dial.mode === "id" ? "id" : "mobile"} onMode={(m) => setDial({ value: "", phone: "", status: "", match: null, mode: m })} phone={dial.phone || ""} onPhone={(v) => setDial((d) => Object.assign({}, d, { phone: v }))} dialCode={dialCode} onMessage={() => dial.match && openChatWith(dial.match.gloobalId, false, false, "self")} onCall={() => { if (dial.match) { setSheet(null); startCall(dial.match, false); } }} onVideo={() => { if (dial.match) { setSheet(null); startCall(dial.match, true); } }} onClose={() => setSheet(null)} />}
    {sheet === "add" && addSheet}
    {sheet === "release" && release && releaseSheet}
    {sheet === "savename" && nameSheet}
    {sheet === "start" && <HellooStartSheet suggested={contacts.slice(0, 8)} onPick={contactPick} onPad={() => { setDial({ value: "", status: "", match: null }); setSheet("dial"); }} onScan={() => { setSheet(null); setScreen("scan"); }} onContacts={() => { setSheet(null); setContactQuery(""); refreshContacts(); setScreen("contacts"); }} onClose={() => setSheet(null)} />}
  <HellooSideRail social fold={tab === "social" || tab === "earn"} active={tab} onChange={(t) => { setTab(t); setSheet(null); }} badges={{ chats: unread, callsDot: missedCount > 0 }} onBazaar={() => setScreen("bazaar")} onScan={() => setScreen("scan")} plusLabel={tab === "social" ? "New post" : tab === "calls" ? "Dial a GLOOBAL ID" : "New chat or call"} onPlus={tab === "social" ? () => setSocialCompose((n) => n + 1) : tab === "calls" ? () => { setDial({ value: "", status: "", match: null }); setSheet("dial"); } : () => setSheet("start")} /></div></div>);
}
