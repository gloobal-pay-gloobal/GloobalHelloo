// frontend/screens/Social.jsx
//
// GLOOBAL Social inside Helloo: For you, Explore, profiles, posting, and
// comments. Every face here is a GLOOBAL account, so every like and every
// comment is from a real person (or a shop speaking as itself). A post can
// carry things from the poster's own shop, each with its own CEL | currency
// button that opens that shop's menu in a chat — the same order flow as
// everywhere else in Helloo.
import { useState as useStateH40, useEffect as useEffectH40, useRef as useRefH40, useCallback as useCallbackH40 } from "react";
import { Heart as SxHeart, MessageCircle as SxComment, Coins as SxCoins, Grid3x3 as SxGrid, Clapperboard as SxReels, MoreHorizontal as SxMore, Volume2 as SxSound, VolumeX as SxMute, ImagePlus as SxAddPic, Tag as SxTag, TrendingUp as SxTrend, SlidersHorizontal as SxFilter, Hash as SxHash, Copy as SxCopy, Clock as SxClock, Eye as SxEye, EyeOff as SxEyeOff } from "lucide-react";

// Who you are on Social — yourself or a shop you run — is chosen here, apart
// from who you are in chats. It starts as yourself and is kept on the phone.
var SOCIAL_AS_KEY = "helloo.social.as";
var socialFaceNow = { account: "", as: "self" };
function socialFaceLoad(accountId) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SOCIAL_AS_KEY) || "null"); } catch (e) { /* private window */ }
  socialFaceNow = saved && accountId && saved.account === accountId && typeof saved.as === "string" && saved.as ? { account: accountId, as: saved.as } : { account: accountId || "", as: "self" };
  return socialFaceNow.as;
}
function socialFaceSave(accountId, as) {
  socialFaceNow = { account: accountId || "", as: as || "self" };
  try { localStorage.setItem(SOCIAL_AS_KEY, JSON.stringify(socialFaceNow)); } catch (e) { /* private window */ }
}
function socialAs(path) { return `${path}${path.indexOf("?") === -1 ? "?" : "&"}as=${encodeURIComponent(socialFaceNow.as || "self")}`; }
var socialHttp = {
  get: (path, options) => gloobalApiClient.get(socialAs(path), options),
  post: (path, body, options) => gloobalApiClient.post(socialAs(path), body, options)
};
var socialApi = {
  feed: (q) => socialHttp.get(`/api/social/feed${q || ""}`),
  explore: (topics, tag) => socialHttp.get(`/api/social/explore?plain=1&topics=${encodeURIComponent((topics || []).join(","))}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`),
  stories: () => socialHttp.get("/api/social/stories"),
  hashtags: (q) => socialHttp.get(`/api/social/hashtags?q=${encodeURIComponent(q || "")}`),
  search: (q) => socialHttp.get(`/api/social/search?q=${encodeURIComponent(q)}`),
  profile: (gloobalId, side) => socialHttp.get(`/api/social/profile/${encodeURIComponent(gloobalId)}${side ? `?side=${side}` : ""}`),
  follow: (to, on) => socialHttp.post("/api/social/follow", { to, on }),
  like: (id, on) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/like`, { on }),
  comments: (id) => socialHttp.get(`/api/social/posts/${encodeURIComponent(id)}/comments`),
  comment: (id, text) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/comments`, { text }),
  uncomment: (id) => gloobalApiClient.delete(socialAs(`/api/social/comments/${encodeURIComponent(id)}`)),
  report: (id, reason) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/report`, { reason }),
  remove: (id) => gloobalApiClient.delete(socialAs(`/api/social/posts/${encodeURIComponent(id)}`)),
  upload: (data) => socialHttp.post("/api/social/media", { data }, { timeoutMs: 120e3 }),
  post: (body) => socialHttp.post("/api/social/posts", body, { timeoutMs: GLOOBAL_API_COLD_START_TIMEOUT_MS }),
  myItems: () => socialHttp.get("/api/social/my-items"),
  // The heart: likes, comments and new followers for you.
  activity: () => socialHttp.get("/api/social/activity"),
  activityCount: () => socialHttp.get("/api/social/activity?count=1"),
  activitySeen: () => socialHttp.post("/api/social/activity/seen", {}),
  // Your social profiles, each off until you turn it on.
  accounts: () => gloobalApiClient.get("/api/social/accounts"),
  setOn: (as, on) => gloobalApiClient.post(`/api/social/on?as=${encodeURIComponent(as || "self")}`, { on })
};
// "now", "5m", "3h", "2d", or a date.
function socialAgo(at) {
  const s = Math.max(0, (Date.now() - new Date(at).getTime()) / 1000);
  if (s < 60) return "now"; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
// A horizontal swipe on the page, unless it started on something that
// scrolls sideways itself (photos, the status row, chips).
function socialSideScroller(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && n.scrollWidth > n.clientWidth + 2) return true;
  }
  return false;
}
var SOCIAL_TOPICS = [["food", "🍛", "Food", "#FFEDD5"], ["learn", "📚", "Learn", "#DCFCE7"], ["shops", "🛍️", "Shops", "#FCE7F3"], ["sports", "🏏", "Sports", "#DBEAFE"], ["music", "🎵", "Music", "#E0E7FF"], ["travel", "✈️", "Travel", "#CCFBF1"], ["fun", "😂", "Fun", "#FEF3C7"], ["work", "💼", "Work", "#F3E8FF"]];
// Hashtags to start from, by topic. Anybody can write their own.
var SOCIAL_TAG_IDEAS = { "": ["today", "mylife", "india", "local"], food: ["chai", "streetfood", "homemade", "thali", "foodie"], learn: ["learn", "howto", "tips", "study"], shops: ["newarrival", "offer", "handmade", "shoplocal"], sports: ["cricket", "fitness", "matchday", "gym"], music: ["music", "singing", "cover", "dance"], travel: ["travel", "mountains", "roadtrip", "himachal"], fun: ["funny", "comedy", "friends", "memes"], work: ["work", "business", "startup", "hiring"] };
var SOCIAL_TAG_RE = /#([\p{L}\p{M}\p{N}_]{2,30})/gu;
function socialTagsIn(text) { const out = []; for (const m of String(text || "").matchAll(SOCIAL_TAG_RE)) { const t = m[1].toLowerCase(); if (!out.includes(t)) out.push(t); } return out.slice(0, 10); }
// The categories a person chose to see in Explore, kept on this phone.
var SOCIAL_SEE_KEY = "helloo.social.see";
function socialSeeRead() { try { const v = JSON.parse(localStorage.getItem(SOCIAL_SEE_KEY) || "[]"); return Array.isArray(v) ? v.filter((k) => SOCIAL_TOPICS.some((t) => t[0] === k)) : []; } catch (e) { return []; } }
function socialSeeWrite(v) { try { localStorage.setItem(SOCIAL_SEE_KEY, JSON.stringify(v)); } catch (e) { /* private window: kept for this visit only */ } }
async function socialCopy(text, onToast) { try { await navigator.clipboard.writeText(text); onToast("Copied"); } catch (e) { onToast("Couldn't copy that."); } }
var SOCIAL_VIDEO_MAX = 8 * 1024 * 1024;
var SOCIAL_PHOTO_MAX = 700 * 1024;
// Sealed: post media opens only with the signed-in viewer's pass (GLOOBAL
// features/viewpass). No pass yet → no address, nothing asked anonymously.
function socialMediaSrc(m) { return m && m.url ? gloobalSealedSrc(m.url) : ""; }
function socialCount(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(v);
}
// A picture from the phone, made small enough to send: longest side 1440,
// JPEG, quality stepping down until it fits.
function socialShrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1440 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      for (const q of [0.85, 0.75, 0.65, 0.55, 0.45]) {
        const data = c.toDataURL("image/jpeg", q);
        if (data.length * 0.75 < SOCIAL_PHOTO_MAX) return resolve(data);
      }
      reject(new Error("That picture is too big."));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file is not a picture we can read.")); };
    img.src = url;
  });
}
function socialReadFile(file) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error("Couldn't read that file.")); r.readAsDataURL(file); });
}

// ── Small pieces ────────────────────────────────────────────────────────
function SocialFace({ card, photos, size = 38 }) {
  return <HellooAvatar person={hellooPersonFrom(card, photos)} size={size} flag={false} />;
}
function SocialName({ card, size = 14, color }) {
  const label = card.handle ? card.handle : card.name;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: "100%" }}><span style={{ fontSize: size, fontWeight: 800, color: color || T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span><HellooBadge tier={card.badge || 1} size={size} /></span>;
}
// A caption with its #hashtags as things to tap.
function SocialCaption({ text, onTag, color }) {
  return String(text || "").split(/(#[\p{L}\p{M}\p{N}_]{2,30})/gu).map((part, i) => (part[0] === "#" && part.length > 2 ? <button key={i} onClick={(e) => { e.stopPropagation(); onTag(part.slice(1).toLowerCase()); }} data-testid="social-hashtag" className="v2-tap" style={{ border: "none", background: "none", padding: 0, margin: 0, font: "inherit", fontWeight: 800, color: color || T.accent, cursor: "pointer" }}>{part}</button> : part));
}
function SocialChip({ on, onClick, children, testid, label }) {
  return <button onClick={onClick} aria-pressed={on} aria-label={label} data-testid={testid} className="v2-tap" style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 14, border: "none", background: on ? T.accentSoft : T.surfaceAlt, color: on ? T.accent : T.inkSoft, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>{children}</button>;
}
function SocialTile({ post, onOpen, tall }) {
  const m = (post.media || [])[0];
  const src = socialMediaSrc(m);
  return <button onClick={() => onOpen(post)} className="v2-tap" aria-label={post.caption || "Post"} style={{ position: "relative", display: "block", width: "100%", height: "100%", border: "none", padding: 0, margin: 0, borderRadius: 10, overflow: "hidden", background: T.surfaceAlt, cursor: "pointer", gridRow: tall ? "span 2" : undefined }}>
    {m && m.kind === "video" ? <video src={src + "#t=0.1"} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
    <span style={{ position: "absolute", left: 7, bottom: 6, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{m && m.kind === "video" ? <HlPlay size={11} color="#fff" /> : <SxHeart size={11} color="#fff" />}{socialCount(post.likes)}</span>
    {(post.media || []).length > 1 ? <span style={{ position: "absolute", right: 6, top: 6, fontSize: 10.5, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.4)", borderRadius: 999, padding: "2px 6px" }}>{post.media.length}</span> : null}
  </button>;
}
function SocialGrid({ posts, onOpen, masonry }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: masonry ? 124 : 150, gap: 3, padding: "0 3px" }}>{posts.map((p, i) => <div key={p.id} style={{ gridRow: masonry && i % 5 === 0 ? "span 2" : undefined }}><SocialTile post={p} onOpen={onOpen} /></div>)}</div>;
}
// A video that plays while it is on screen, muted until tapped.
function SocialVideo({ src, fill, muted, onMuted }) {
  const ref = useRefH40(null);
  useEffectH40(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && e.intersectionRatio > 0.6) v.play().catch(() => {}); else v.pause(); }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <div style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}><video ref={ref} src={src} muted={muted} loop playsInline preload="metadata" onClick={() => onMuted(!muted)} style={{ width: "100%", height: "100%", objectFit: fill ? "cover" : "contain", display: "block" }} /><button onClick={() => onMuted(!muted)} aria-label={muted ? "Sound on" : "Sound off"} className="v2-tap" style={{ position: "absolute", right: 12, bottom: 12, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{muted ? <SxMute size={16} color="#fff" /> : <SxSound size={16} color="#fff" />}</button></div>;
}
function SocialTagCard({ tag, onShopItem }) {
  return <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 12px", borderRadius: 18, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 10px 26px -14px rgba(0,0,0,0.5)", minWidth: 0 }}><HlStore size={18} color={T.accent} style={{ flexShrink: 0 }} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tag.title}</span><span style={{ display: "block", fontSize: 12, fontWeight: 800, color: T.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hellooMoneyText(tag.price, tag.currency)}</span></span><button onClick={(e) => { e.stopPropagation(); onShopItem(tag); }} data-testid="social-tag-pay" className="v2-tap" style={{ height: 36, padding: "0 14px", borderRadius: 999, border: "none", background: T.gradButton, color: HT.onAccent || "#fff", display: "flex", alignItems: "center", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0, fontFamily: T.fontBody, whiteSpace: "nowrap" }}>CEL | {hellooCelSign(tag.currency)}</button></span>;
}

// ── One post in the feed ────────────────────────────────────────────────
function SocialPostCard({ post, photos, act, muted, onMuted }) {
  const [at, setAt] = useStateH40(0);
  const [burst, setBurst] = useStateH40(false);
  const lastTap = useRefH40(0);
  const media = post.media || [];
  const video = media[0] && media[0].kind === "video";
  const tag = (post.tags || [])[0];
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) { if (!post.liked) act.like(post, true); setBurst(true); setTimeout(() => setBurst(false), 650); }
    lastTap.current = now;
  };
  const a = post.author;
  return <div data-testid="social-post" style={{ paddingBottom: 18 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 10px" }}>
      <button onClick={() => act.profile(a)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><SocialFace card={a} photos={photos} size={38} /><span style={{ flex: 1, minWidth: 0 }}><SocialName card={a} /><span style={{ display: "block", fontSize: 11.5, color: T.inkFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.suggested ? "Suggested · " : ""}{hellooWhen(post.at)}</span></span></button>
      {post.suggested && !post.mine && !act.isFollowing(a) ? <button onClick={() => act.follow(a, true)} className="v2-tap" style={{ border: "none", background: "none", color: T.accent, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Follow</button> : null}
      <button onClick={() => act.more(post)} aria-label="More" className="v2-tap" style={{ border: "none", background: "none", padding: 4, cursor: "pointer" }}><SxMore size={20} color={T.inkSoft} /></button>
    </div>
    <div onClick={onTap} style={{ position: "relative", width: "100%", aspectRatio: video ? "4 / 5" : "1 / 1", background: T.surfaceAlt, overflow: "hidden" }}>
      {video ? <SocialVideo src={socialMediaSrc(media[0])} fill muted={muted} onMuted={onMuted} /> : <div onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))} style={{ display: "flex", width: "100%", height: "100%", overflowX: media.length > 1 ? "auto" : "hidden", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>{media.map((m) => <img key={m.id} src={socialMediaSrc(m)} alt="" loading="lazy" style={{ flex: "0 0 100%", width: "100%", height: "100%", objectFit: "cover", scrollSnapAlign: "start", display: "block" }} />)}</div>}
      {media.length > 1 ? <span style={{ position: "absolute", right: 14, top: 14, fontSize: 11.5, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "4px 9px" }}>{at + 1} / {media.length}</span> : null}
      {tag ? <span style={{ position: "absolute", left: 14, right: video ? 56 : 14, bottom: 14 }}><SocialTagCard tag={tag} onShopItem={act.shopItem} /></span> : null}
      {burst ? <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><SxHeart size={96} color="#fff" fill="#fff" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))" }} /></span> : null}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 16px 6px" }}>
      <button onClick={() => act.like(post, !post.liked)} data-testid="social-like" aria-label={post.liked ? "Unlike" : "Like"} aria-pressed={post.liked} className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><SxHeart size={25} color={post.liked ? "#E11D48" : T.ink} fill={post.liked ? "#E11D48" : "none"} /></button>
      <button onClick={() => act.comments(post)} aria-label="Comments" className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><SxComment size={24} color={T.ink} /></button>
      <button onClick={() => act.share(post)} aria-label="Share" className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><HlSend size={23} color={T.ink} /></button>
      <span style={{ flex: 1 }} />
      {!post.mine ? <button onClick={() => act.tip(a)} aria-label="Tip" data-testid="social-tip" className="v2-tap" style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}><SxCoins size={16} color={T.accent} />Tip</button> : null}
    </div>
    <div style={{ padding: "0 16px", fontSize: 13.5, color: T.ink, lineHeight: 1.45 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><b>{post.likes === 1 ? "1 like" : `${socialCount(post.likes)} likes`}</b>{post.likes > 0 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 800, color: HT.free, background: HT.freeSoft, borderRadius: 999, padding: "2px 8px" }}><HlShield size={11} color={HT.free} />all real people</span> : null}</span>
      {post.caption ? <div style={{ marginTop: 4, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><b>{a.handle || a.name}</b> <SocialCaption text={post.caption} onTag={act.tag} /></div> : null}
      {post.comments > 0 ? <button onClick={() => act.comments(post)} className="v2-tap" style={{ display: "block", marginTop: 6, border: "none", background: "none", padding: 0, color: T.inkSoft, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>View {post.comments === 1 ? "1 comment" : `all ${post.comments} comments`}</button> : null}
    </div>
  </div>;
}

// ── The whole Social tab ────────────────────────────────────────────────
// The heart: what happened to you on Social — likes and comments on your
// posts, and people who started following you (with Follow back). Newest
// first; what came since you last looked is under "New".
function SocialActivity({ photos, onBack, onProfile, onFollow, onSeen }) {
  const [data, setData] = useStateH40(null);
  const [err, setErr] = useStateH40("");
  const [back, setBack] = useStateH40({});
  useEffectH40(() => {
    let live = true;
    socialApi.activity().then((r) => { if (!live) return; setData(r.items || []); socialApi.activitySeen().then(() => onSeen && onSeen()).catch(() => {}); }).catch((e) => live && setErr((e && e.message) || "Couldn't load your activity."));
    return () => { live = false; };
  }, []);
  const line = (it) => it.type === "like" ? "liked your post" : it.type === "comment" ? <>commented: <span style={{ color: T.ink }}>“{it.text.length > 70 ? `${it.text.slice(0, 70)}…` : it.text}”</span></> : "started following you";
  const row = (it, i) => {
    const followed = it.type === "follow" && (back[it.who.accountId] ?? it.followingBack);
    return <div key={i} data-testid="social-activity-row" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 16px", background: it.fresh ? (T.accentSoft ? `${T.accentSoft}` : "transparent") : "transparent" }}>
      <button onClick={() => onProfile(it.who)} aria-label="Profile" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0, display: "flex" }}><SocialFace card={it.who} photos={photos} size={44} /></button>
      <button onClick={() => onProfile(it.who)} style={{ flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.4 }}>
        <b style={{ color: T.ink, fontWeight: 800 }}>{it.who.handle || it.who.name}</b> {line(it)} <span style={{ color: T.inkFaint, whiteSpace: "nowrap" }}>· {socialAgo(it.at)}</span>
      </button>
      {it.type === "follow"
        ? <button data-testid="social-activity-follow" onClick={() => { const on = !followed; setBack((b) => Object.assign({}, b, { [it.who.accountId]: on })); onFollow(it.who, on); }} className="v2-tap" style={{ flexShrink: 0, height: 32, padding: "0 14px", borderRadius: 10, border: followed ? `1px solid ${T.line}` : "none", background: followed ? "none" : T.accent, color: followed ? T.ink : "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{followed ? "Following" : "Follow back"}</button>
        : it.post && it.post.media ? <span style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: T.surfaceSunk, flexShrink: 0 }}>{it.post.media.kind === "photo" ? <img src={socialMediaSrc(it.post.media)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: T.inkFaint }}><SxReels size={18} /></span>}</span> : null}
    </div>;
  };
  const fresh = (data || []).filter((x) => x.fresh); const earlier = (data || []).filter((x) => !x.fresh);
  const label = (t) => <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, padding: "14px 16px 4px" }}>{t}</div>;
  return <div data-testid="social-activity" style={{ position: "absolute", inset: 0, zIndex: 30, background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "calc(10px + env(safe-area-inset-top, 0px)) 14px 8px", flexShrink: 0 }}><NavBackButton onClick={onBack} /><div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Activity</div></div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 40 }}>
      {err ? <SocialNote title="Couldn't load" text={err} /> : data === null ? <SocialNote title="Loading…" /> : !data.length ? <SocialNote title="Nothing yet" text="When people like or comment on your posts, or follow you, it shows here." /> : <>
        {fresh.length ? <>{label("New")}{fresh.map(row)}</> : null}
        {earlier.length ? <>{label(fresh.length ? "Earlier" : "Recent")}{earlier.map(row)}</> : null}
      </>}
    </div>
  </div>;
}

// A small on/off switch.
function SocialSwitch({ on, busy, onChange, label, testid }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} data-testid={testid} disabled={busy} onClick={(e) => { e.stopPropagation(); onChange(!on); }} className="v2-tap" style={{ position: "relative", width: 50, height: 30, borderRadius: 15, border: "none", padding: 0, flexShrink: 0, cursor: busy ? "default" : "pointer", background: on ? (T.positive || "#16A34A") : (T.line || "#D6D3E0"), transition: "background 0.2s ease", opacity: busy ? 0.6 : 1 }}>
    <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left 0.2s ease" }} />
  </button>;
}

// Your social profiles: yourself, and each shop. Each one is off until you
// turn it on; only an "on" one can be used to post, follow, like and comment.
function SocialProfilesSheet({ me, list, face, photos, accounts, onUse, onSet, onOpenMine, onClose }) {
  const [ask, setAsk] = useStateH40(null); // { f, on }
  const [busy, setBusy] = useStateH40("");
  const nameOf = (f) => (f.kind === "shop" ? (f.handle || f.name) : (f.name || me.name));
  const go = async () => {
    const { f, on } = ask; setBusy(f.as);
    try { await onSet(f, on); setAsk(null); } catch (e) { /* toasted by onSet */ }
    setBusy("");
  };
  const onCount = list.filter((f) => accounts && accounts[f.as] && accounts[f.as].on).length;
  const [sel, setSel] = useStateH40(face.as);
  const faceOf = (f, size) => (f.kind === "shop" ? <SocialFace card={{ accountId: f.accountId, gloobalId: f.gloobalId, name: f.name, handle: f.handle, side: "shop" }} photos={photos} size={size} /> : <HellooMeAvatar me={me} size={size} />);
  const cur = list.find((f) => f.as === sel) || face;
  const curA = (accounts && accounts[cur.as]) || null;
  const curOn = Boolean(curA && curA.on);
  const curShop = cur.kind === "shop";
  const using = cur.as === face.as;
  const bgScreen = HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg;
  return <HellooSheet title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>Social profiles<span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, background: T.surfaceAlt, padding: "3px 9px", borderRadius: 999, fontFamily: T.fontBody }}>{accounts ? `${onCount} of ${list.length} on` : `${list.length}`}</span></span>} label="Your social profiles" onClose={onClose}>
    {/* Every profile as a face: pick one to see it below. */}
    <div role="tablist" aria-label="Profiles" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "4px 2px 12px", scrollbarWidth: "none" }}>
      {list.map((f) => {
        const a = (accounts && accounts[f.as]) || null; const on = Boolean(a && a.on); const picked = f.as === cur.as; const shop = f.kind === "shop";
        return <button key={f.as} role="tab" aria-selected={picked} data-testid={`social-as-${shop ? f.handle : "self"}`} onClick={() => setSel(f.as)} className="v2-tap" style={{ flexShrink: 0, width: 76, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: T.fontBody }}>
          <span style={{ position: "relative", width: 68, height: 68, borderRadius: "50%", padding: 3, boxSizing: "border-box", background: on ? T.gradButton : "transparent", border: on ? "none" : `2px dashed ${T.inkFaint}`, display: "flex", transform: picked ? "scale(1.06)" : "none", transition: "transform 0.2s ease" }}>
            <span style={{ flex: 1, borderRadius: "50%", padding: 2, background: bgScreen, display: "flex", alignItems: "center", justifyContent: "center", filter: on ? "none" : "grayscale(0.8)", opacity: on ? 1 : 0.7 }}>{faceOf(f, 56)}</span>
            {f.as === face.as ? <span aria-hidden="true" style={{ position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: "50%", background: T.positive || "#16A34A", border: `2.5px solid ${bgScreen}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlCheck size={12} color="#fff" strokeWidth={3} /></span>
              : shop ? <span aria-hidden="true" style={{ position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: 8, background: T.accent, border: `2.5px solid ${bgScreen}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlStore size={11} color="#fff" /></span> : null}
          </span>
          <span style={{ maxWidth: "100%", fontSize: 12, fontWeight: picked ? 800 : 700, color: picked ? T.ink : T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.kind === "shop" ? (f.handle || f.name) : "You"}</span>
          <span aria-hidden="true" style={{ width: picked ? 18 : 0, height: 3, borderRadius: 2, background: T.accent, transition: "width 0.2s ease" }} />
        </button>;
      })}
    </div>

    {/* The picked one. */}
    <div data-testid="social-profile-card" style={{ position: "relative", overflow: "hidden", borderRadius: 24, background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard }}>
      <div aria-hidden="true" style={{ height: 70, background: curOn ? (curShop ? `linear-gradient(120deg, ${T.accent}, ${T.accent}99)` : T.gradButton) : (T.line || "#D6D3E0"), position: "relative", overflow: "hidden" }}><span style={{ position: "absolute", right: -30, top: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} /><span style={{ position: "absolute", right: 70, bottom: -50, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} /></div>
      {using ? <span style={{ position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.22)", padding: "4px 10px", borderRadius: 999 }}><HlCheck size={12} strokeWidth={3} />Using now</span> : null}
      <div style={{ position: "relative", zIndex: 1, padding: "0 16px 14px", marginTop: -36 }}>
        <span style={{ display: "inline-flex", padding: 4, borderRadius: "50%", background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}><span style={{ display: "inline-flex", borderRadius: "50%", background: "#fff", filter: curOn ? "none" : "grayscale(0.7)" }}>{faceOf(cur, 64)}</span></span>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, minWidth: 0 }}>
          <span style={{ fontSize: 19, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" , minWidth: 0 }}>{nameOf(cur)}</span>{curOn ? <HellooBadge tier={(curA && curA.badge) || 1} size={19} /> : null}
          <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, color: curShop ? T.accent : T.inkSoft, background: curShop ? T.accentSoft : T.surfaceAlt, padding: "3px 8px", borderRadius: 999 }}>{curShop ? <HlStore size={11} /> : <HlUser size={11} />}{curShop ? "Shop" : "Personal"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{[[curA ? socialCount(curA.posts) : "…", "posts"], [curA ? socialCount(curA.followers) : "…", "followers"]].map(([n, l]) => <span key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 6px", borderRadius: 14, background: T.surfaceAlt }}><span style={{ fontSize: 17, fontWeight: 800, color: curOn ? T.ink : T.inkSoft, fontFamily: T.fontDisplay }}>{n}</span><span style={{ fontSize: 11.5, color: T.inkSoft, fontWeight: 700 }}>{l}</span></span>)}</div>
        {/* Visible on Social: the switch, said in words. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, padding: "10px 12px", borderRadius: 16, border: `1px solid ${T.line}` }}>
          <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: curOn ? `${T.positive || "#16A34A"}1F` : T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>{curOn ? <SxEye size={17} color={T.positive || "#16A34A"} /> : <SxEyeOff size={17} color={T.inkSoft} />}</span>
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink }}>{curOn ? "Visible on Social" : "Hidden"}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 1 }}>{curOn ? "People can find it, follow it and see its posts" : "Nobody can find it or see its posts"}</span></span>
          <SocialSwitch on={curOn} busy={busy === cur.as || curA === null} label={`${nameOf(cur)} on Social`} testid={`social-on-${curShop ? cur.handle : "self"}`} onChange={(v) => setAsk({ f: cur, on: v })} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>{!curOn
          ? <span style={{ display: "flex", flex: 1 }}><HellooPrimary color={T.positive || "#16A34A"} onClick={() => setAsk({ f: cur, on: true })}>Turn on</HellooPrimary></span>
          : using
            ? <span data-testid="social-my-profile" style={{ display: "flex", flex: 1 }}><HellooSecondary onClick={onOpenMine}>Open profile</HellooSecondary></span>
            : <span data-testid="social-use" style={{ display: "flex", flex: 1 }}><HellooPrimary onClick={() => onUse(cur)}>Post as {nameOf(cur)}</HellooPrimary></span>}</div>
      </div>
    </div>
    <div style={{ fontSize: 12, color: T.inkFaint, lineHeight: 1.5, margin: "10px 4px 0", textAlign: "center" }}>Each profile has its own posts, followers and status. Your chats stay the same.</div>
    {ask ? <HellooSheet title={ask.on ? `Turn on ${nameOf(ask.f)}?` : `Turn off ${nameOf(ask.f)}?`} onClose={() => setAsk(null)} zIndex={70}>
      <div data-testid="social-on-confirm" style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.55, marginBottom: 16 }}>{ask.on
        ? "People on Helloo can find this profile, see its posts and status, and follow it. You can post, like and comment as it. Turn it off any time."
        : "Its profile, posts and status are hidden from everyone, and you can't post or comment as it, until you turn it on again. Nothing is deleted."}</div>
      <div style={{ display: "flex", gap: 10 }}><HellooSecondary onClick={() => setAsk(null)}>Not now</HellooSecondary><span data-testid="social-on-go" style={{ display: "flex", flex: 1 }}><HellooPrimary disabled={Boolean(busy)} color={ask.on ? (T.positive || "#16A34A") : (T.negative || "#DC2626")} onClick={go}>{busy ? "…" : ask.on ? "Turn on" : "Turn off"}</HellooPrimary></span></div>
    </HellooSheet> : null}
  </HellooSheet>;
}

function HellooSocialHome({ me, faces, photos, onCards, onOpenChat, onTip, onShopItem, onShop, onToast, composeTick }) {
  useGloobalViewPass();
  const myId = me.accountId || me.id || "";
  const [as, setAs] = useStateH40(() => socialFaceLoad(myId));
  const [who, setWho] = useStateH40(false);
  // Which of your social profiles are on (null until known).
  const [accounts, setAccounts] = useStateH40(null);
  const loadAccounts = useCallbackH40(() => { socialApi.accounts().then((r) => setAccounts(r.accounts || {})).catch(() => {}); }, []);
  useEffectH40(() => { loadAccounts(); }, [loadAccounts]);
  const list = (faces || []).length ? faces : [{ as: "self", kind: "self", accountId: myId, gloobalId: me.gloobalId, name: me.name }];
  const face = list.find((f) => f.as === as) || list[0];
  // A shop that is no longer yours: back to yourself.
  useEffectH40(() => { if (faces && faces.length && !faces.some((f) => f.as === as)) { socialFaceSave(myId, "self"); setAs("self"); } }, [faces, as]);
  const [view, setView] = useStateH40("feed");
  // The heart: activity panel and how much is new.
  const [activity, setActivity] = useStateH40(false);
  const [unread, setUnread] = useStateH40(0);
  const countActivity = useCallbackH40(() => { socialApi.activityCount().then((r) => setUnread(Number(r.unread) || 0)).catch(() => {}); }, []);
  useEffectH40(() => { countActivity(); const t = setInterval(countActivity, 60000); return () => clearInterval(t); }, [countActivity]);
  // For you ⇄ Explore by swiping left and right.
  const swipe = useRefH40(null);
  const onSwipeStart = (e) => { const t = e.touches && e.touches[0]; swipe.current = t && !socialSideScroller(e.target) ? { x: t.clientX, y: t.clientY } : null; };
  const onSwipeEnd = (e) => {
    const st = swipe.current; swipe.current = null;
    const t = e.changedTouches && e.changedTouches[0];
    if (!st || !t) return;
    const dx = t.clientX - st.x, dy = t.clientY - st.y;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    if (dx < 0 && view === "feed") setView("explore");
    if (dx > 0 && view === "explore") setView("feed");
  };
  const [feed, setFeed] = useStateH40(null);
  const [feedErr, setFeedErr] = useStateH40("");
  const [ex, setEx] = useStateH40(null);
  const [see, setSee] = useStateH40(socialSeeRead);
  const [tag, setTag] = useStateH40("");
  const [filter, setFilter] = useStateH40(false);
  const [stories, setStories] = useStateH40([]);
  const [story, setStory] = useStateH40(null);
  const [q, setQ] = useStateH40("");
  const [found, setFound] = useStateH40(null);
  const [follows, setFollows] = useStateH40({});
  const [profile, setProfile] = useStateH40(null);
  const [open, setOpen] = useStateH40(null);
  const [talk, setTalk] = useStateH40(null);
  const [more, setMore] = useStateH40(null);
  const [compose, setCompose] = useStateH40("");
  const [muted, setMuted] = useStateH40(true);
  const seen = (cards) => { if (onCards) onCards(cards.filter(Boolean)); };

  const loadFeed = useCallbackH40(() => {
    setFeedErr("");
    socialApi.feed().then((r) => { setFeed(r.posts || []); seen((r.posts || []).map((p) => p.author)); }).catch((err) => setFeedErr((err && err.message) || "Couldn't load posts."));
  }, []);
  const loadExplore = useCallbackH40((topics, t) => {
    socialApi.explore(topics, t).then((r) => { setEx(r); seen((r.grid || []).map((p) => p.author)); }).catch(() => setEx({ error: true, grid: [], tags: [] }));
  }, []);
  const loadStories = useCallbackH40(() => {
    socialApi.stories().then((r) => { setStories(r.people || []); seen((r.people || []).map((g) => g.author)); }).catch(() => {});
  }, []);
  useEffectH40(() => { loadStories(); }, [loadStories, as]);
  useEffectH40(() => { loadFeed(); }, [loadFeed, as]);
  useEffectH40(() => { if (view === "explore") { setEx(null); loadExplore(see, tag); } }, [view, see, tag, loadExplore, as]);
  useEffectH40(() => { if (composeTick) setCompose("post"); }, [composeTick]);
  useEffectH40(() => {
    const term = q.trim();
    if (term.length < 2) { setFound(null); return undefined; }
    const t = setTimeout(() => socialApi.search(term).then((r) => { setFound(r); seen(r.people || []); }).catch(() => setFound({ people: [], posts: [] })), 300);
    return () => clearTimeout(t);
  }, [q]);

  // One post changed (a like, a new comment count) — everywhere it shows.
  const patch = (id, fn) => {
    const up = (list) => (list ? list.map((p) => (p.id === id ? fn(p) : p)) : list);
    setFeed(up);
    setEx((e) => (e && !e.error ? Object.assign({}, e, { grid: up(e.grid), trending: up(e.trending), learn: up(e.learn) }) : e));
    setProfile((pr) => (pr && pr.grid ? Object.assign({}, pr, { grid: up(pr.grid) }) : pr));
    setOpen((o) => (o && o.id === id ? fn(o) : o));
  };
  const drop = (id) => {
    const out = (list) => (list ? list.filter((p) => p.id !== id) : list);
    setFeed(out); setEx((e) => (e && !e.error ? Object.assign({}, e, { grid: out(e.grid), trending: out(e.trending), learn: out(e.learn) }) : e)); setProfile((pr) => (pr && pr.grid ? Object.assign({}, pr, { grid: out(pr.grid) }) : pr)); setOpen(null);
  };
  const openProfile = (card) => {
    setProfile({ card, loading: true });
    socialApi.profile(card.gloobalId, card.side === "self" ? "self" : "").then((r) => { setProfile({ card: r.profile, profile: r.profile, grid: r.grid || [] }); setFollows((f) => Object.assign({}, f, { [r.profile.accountId]: r.profile.isFollowing })); seen([r.profile]); }).catch((err) => setProfile({ card, error: (err && err.message) || "Couldn't open that profile." }));
  };
  const openMine = () => openProfile({ gloobalId: face.gloobalId || me.gloobalId, accountId: face.accountId || myId, name: face.name || me.name, side: face.kind === "shop" ? "shop" : "self" });
  const useAs = (f) => { setWho(false); if (f.as === as) return; socialFaceSave(myId, f.as); setFeed(null); setEx(null); setStories([]); setProfile(null); setOpen(null); setFollows({}); setAs(f.as); onToast(f.kind === "shop" ? `Social as ${f.name || "your shop"}` : "Social as yourself"); };
  const isOff = Boolean(accounts && accounts[face.as] && !accounts[face.as].on);
  const setOn = async (f, on) => {
    try {
      await socialApi.setOn(f.as, on);
      setAccounts((m) => Object.assign({}, m, { [f.as]: Object.assign({}, (m && m[f.as]) || { posts: 0, followers: 0 }, { on }) }));
      const name = f.kind === "shop" ? (f.handle || f.name) : "Your profile";
      onToast(on ? `${name} is on Social` : `${name} is off · hidden from everyone`);
      if (on && f.as !== face.as) useAs(f);
      loadAccounts();
    } catch (e) { onToast((e && e.message) || "Couldn't change that."); throw e; }
  };
  const act = {
    toast: (t) => onToast(t),
    like: (post, on) => { patch(post.id, (p) => Object.assign({}, p, { liked: on, likes: Math.max(0, p.likes + (on ? 1 : -1)) })); socialApi.like(post.id, on).then((r) => patch(post.id, (p) => Object.assign({}, p, { liked: r.liked, likes: r.likes }))).catch(() => patch(post.id, (p) => Object.assign({}, p, { liked: !on, likes: Math.max(0, p.likes + (on ? -1 : 1)) }))); },
    follow: (card, on) => { setFollows((f) => Object.assign({}, f, { [card.accountId]: on })); socialApi.follow(card.accountId, on).then((r) => setProfile((pr) => (pr && pr.profile && pr.profile.accountId === card.accountId ? Object.assign({}, pr, { profile: Object.assign({}, pr.profile, { isFollowing: r.following, followers: r.followers }) }) : pr))).catch(() => { setFollows((f) => Object.assign({}, f, { [card.accountId]: !on })); onToast("Couldn't follow right now."); }); },
    isFollowing: (card) => Boolean(follows[card.accountId]),
    profile: openProfile,
    comments: (post) => setTalk(post),
    more: (post) => setMore(post),
    tip: (card) => onTip(card),
    shopItem: (item) => onShopItem(item),
    tag: (t) => { setProfile(null); setOpen(null); setQ(""); setTag(t); setView("explore"); },
    share: async (post) => {
      // Sealed: nothing of the post leaves — no picture, no caption, no
      // link that opens it. Only a note to open it inside Helloo, where the
      // viewer is a signed-in, real person (no open links on GLOOBAL).
      const text = "Sealed on GLOOBAL · a post for you. Open Helloo to see it.";
      try { if (navigator.share) await navigator.share({ title: "GLOOBAL", text, url: HELLOO_SITE }); else { await navigator.clipboard.writeText(`${text} ${HELLOO_SITE}`); onToast("Copied to share"); } } catch (e) { /* closed */ }
    }
  };
  const posted = (post) => {
    setCompose(""); setView("feed");
    if (post.story) { loadStories(); onToast("Your status is up for 24 hours"); return; }
    setFeed((f) => [post, ...(f || [])]); onToast("Posted");
  };

  const head = <div style={{ position: "sticky", top: 0, zIndex: 5, background: `${HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg}F2`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 8px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><span style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>{[["feed", "For you"], ["explore", "Explore"]].map(([k, l]) => <button key={k} onClick={() => setView(k)} data-testid={`social-view-${k}`} aria-current={view === k ? "page" : undefined} className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: view === k ? 22 : 17, fontWeight: 800, fontFamily: T.fontDisplay, color: view === k ? T.ink : T.inkFaint, letterSpacing: -0.4, whiteSpace: "nowrap" }}>{l}</button>)}</span><span style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}><button onClick={() => setActivity(true)} aria-label={unread ? `Activity · ${unread} new` : "Activity"} data-testid="social-heart" className="v2-tap" style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, flexShrink: 0 }}><SxHeart size={22} color={unread ? "#E11D48" : "currentColor"} fill={unread ? "#E11D48" : "none"} style={{ transition: "color 0.2s ease, fill 0.2s ease" }} />{unread ? <span data-testid="social-heart-count" style={{ position: "absolute", top: -3, right: -4, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: T.negative || "#E23F45", color: "#fff", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg}` }}>{unread > 9 ? "9+" : unread}</span> : null}</button><button onClick={() => { loadAccounts(); setWho(true); }} aria-label={`Your social profiles · using ${face.kind === "shop" ? (face.handle || face.name) : "Personal"}${isOff ? " (off)" : ""}`} data-testid="social-me" className="v2-tap" style={{ position: "relative", width: 44, height: 44, padding: 0, border: "none", background: "none", cursor: "pointer", flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", padding: 2.5, boxSizing: "border-box", background: isOff ? (T.line || "#D6D3E0") : T.gradButton, display: "flex" }}><span style={{ flex: 1, borderRadius: "50%", padding: 2, background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", alignItems: "center", justifyContent: "center", opacity: isOff ? 0.6 : 1 }}>{face.kind === "shop" ? <SocialFace card={{ accountId: face.accountId, gloobalId: face.gloobalId, name: face.name, handle: face.handle, side: "shop" }} photos={photos} size={35} /> : <HellooMeAvatar me={me} size={35} />}</span></span>
      {list.length > 1 || face.kind === "shop" ? <span aria-hidden="true" style={{ position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: face.kind === "shop" ? 7 : "50%", background: face.kind === "shop" ? T.accent : (HT.cardBg || T.surface), border: `2px solid ${HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg}`, boxShadow: face.kind === "shop" ? "none" : "0 1px 3px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>{face.kind === "shop" ? <HlStore size={10} color="#fff" /> : <HlChevron size={11} color={T.ink} style={{ transform: "rotate(90deg)" }} />}</span> : null}
    </button></span></div></div>;

  // Before people's pictures open: the fingerprint / face check (GLOOBAL
  // features/viewpass), shown above everything while it is due.
  const statusRow = <><GloobalSealedGate onSetup={() => { try { window.open("https://gloobalv3.netlify.app/", "_blank", "noopener"); } catch (e) { /* fine */ } }} /><SocialStatusRow people={stories} photos={photos} onAdd={() => (isOff ? setWho(true) : setCompose("pick"))} onOpen={(i) => setStory(i)} /></>;
  let body;
  if (view === "feed") {
    body = feed === null
      ? (feedErr ? <SocialNote title="Couldn't load posts" text={feedErr} action="Try again" onAction={loadFeed} /> : <SocialNote title="Loading…" />)
      : feed.length === 0
        ? <SocialNote title="Nothing here yet" text="Follow people and shops in Explore, or share the first picture." action="Explore" onAction={() => setView("explore")} second="New post" onSecond={() => setCompose("post")} />
        : <>{feed.map((p) => <SocialPostCard key={p.id} post={p} photos={photos} act={act} muted={muted} onMuted={setMuted} />)}<div style={{ height: 120 }} /></>;
  } else {
    body = <SocialExplore ex={ex} see={see} tag={tag} onTag={setTag} onFilter={() => setFilter(true)} q={q} onQ={setQ} found={found} photos={photos} act={act} follows={follows} onOpen={setOpen} onToast={onToast} />;
  }

  return <HellooScreen><div data-testid="social-home" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd} style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "block" }}>{head}{view === "feed" ? statusRow : null}{isOff ? <div data-testid="social-off-banner" style={{ margin: "4px 14px 10px", padding: "12px 14px", borderRadius: 18, background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, display: "flex", alignItems: "center", gap: 12 }}><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink }}>{face.kind === "shop" ? `${face.handle || face.name} is off` : "Your social profile is off"}</span><span style={{ display: "block", fontSize: 12.5, color: T.inkSoft, marginTop: 2, lineHeight: 1.4 }}>You can look around. Turn it on to post, follow, like and comment.</span></span><button onClick={() => setWho(true)} data-testid="social-turn-on" className="v2-tap" style={{ flexShrink: 0, border: "none", borderRadius: 999, padding: "9px 14px", background: T.gradButton, color: HT.onAccent || "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Turn on</button></div> : null}<div key={view} className="social-swap" style={{ animation: "socialSwap 0.22s ease-out" }}>{body}</div></div>
    <style>{"@keyframes socialSwap{from{opacity:0.35;transform:translateX(" + (view === "explore" ? "18px" : "-18px") + ")}to{opacity:1;transform:none}}"}</style>
    {activity ? <SocialActivity photos={photos} onBack={() => { setActivity(false); countActivity(); }} onSeen={() => setUnread(0)} onProfile={(c) => { setActivity(false); openProfile(c); }} onFollow={(c, on) => act.follow(c, on)} /> : null}
    {profile ? <SocialProfile state={profile} me={me} photos={photos} act={act} onBack={() => setProfile(null)} onOpen={setOpen} onMessage={onOpenChat} onShop={onShop} onCompose={() => setCompose("post")} /> : null}
    {open ? <SocialViewer post={open} photos={photos} act={act} muted={muted} onMuted={setMuted} onBack={() => setOpen(null)} /> : null}
    {talk ? <SocialComments post={talk} photos={photos} onCards={seen} onCount={(n) => patch(talk.id, (p) => Object.assign({}, p, { comments: n }))} onClose={() => setTalk(null)} onToast={onToast} /> : null}
    {more ? <HellooSheet label="Post" onClose={() => setMore(null)}><HellooCard>{(more.mine
      ? [[HlTrash, "Delete post", () => { const id = more.id; setMore(null); socialApi.remove(id).then(() => { drop(id); onToast("Post deleted"); }).catch((err) => onToast((err && err.message) || "Couldn't delete it.")); }, true]]
      : [[HlUser, "View profile", () => { const a = more.author; setMore(null); openProfile(a); }], [HlChat, "Message", () => { const a = more.author; setMore(null); onOpenChat(a); }], [HlFlag, "Report", () => { const id = more.id; setMore(null); socialApi.report(id, "").then(() => onToast("Reported · thank you")).catch(() => onToast("Couldn't report right now.")); }, true]]
    ).map(([Icon, title, fn, danger], i) => <HellooRow key={title} Icon={Icon} title={title} first={i === 0} onPress={fn} danger={danger} color={danger ? T.negative : T.accent} />)}</HellooCard></HellooSheet> : null}
    {story !== null && stories[story] ? <SocialStatusViewer people={stories} start={story} photos={photos} muted={muted} onMuted={setMuted} onClose={() => setStory(null)} onProfile={(c) => { setStory(null); openProfile(c); }} onDelete={(id) => { setStory(null); socialApi.remove(id).then(() => { loadStories(); onToast("Status removed"); }).catch(() => onToast("Couldn't remove it.")); }} /> : null}
    {who ? <SocialProfilesSheet me={me} list={list} face={face} photos={photos} accounts={accounts} onUse={useAs} onSet={setOn} onOpenMine={() => { setWho(false); openMine(); }} onClose={() => setWho(false)} /> : null}
    {filter ? <SocialFilter see={see} tag={tag} tags={(ex && ex.tags) || []} onClose={() => setFilter(false)} onSave={(nextSee, nextTag) => { socialSeeWrite(nextSee); setSee(nextSee); setTag(nextTag); setFilter(false); onToast(nextSee.length ? "Saved · Explore shows what you picked" : "Explore shows everything"); }} /> : null}
    {compose === "pick" ? <HellooSheet label="Add" onClose={() => setCompose("")}><HellooCard><span data-testid="social-add-status"><HellooRow Icon={SxClock} title="Status" value="Gone after 24 hours" first onPress={() => setCompose("status")} color={T.accent} /></span><span data-testid="social-add-post"><HellooRow Icon={SxAddPic} title="Post" value="Stays on your profile" onPress={() => setCompose("post")} color={T.accent} /></span></HellooCard></HellooSheet> : null}
    {compose === "post" || compose === "status" ? <SocialComposer me={me} asName={face.kind === "shop" ? (face.handle || face.name) : (face.name || me.name)} status={compose === "status"} onClose={() => setCompose("")} onPosted={posted} onToast={onToast} /> : null}
  </HellooScreen>;
}

function SocialNote({ title, text, action, onAction, second, onSecond }) {
  return <div style={{ padding: "40px 24px", textAlign: "center" }}><div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.fontDisplay }}>{title}</div>{text ? <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{text}</div> : null}{action ? <div style={{ display: "flex", gap: 10, marginTop: 18 }}><HellooPrimary onClick={onAction}>{action}</HellooPrimary>{second ? <HellooSecondary onClick={onSecond}>{second}</HellooSecondary> : null}</div> : null}</div>;
}

// ── Explore ─────────────────────────────────────────────────────────────
function SocialExplore({ ex, see, tag, onTag, onFilter, q, onQ, found, photos, act, follows, onOpen, onToast }) {
  const n = see.length + (tag ? 1 : 0);
  const search = <div style={{ display: "flex", gap: 8, padding: "2px 16px 6px" }}><label style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, height: 48, borderRadius: 16, background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, padding: "0 16px" }}><HlSearch size={18} color={T.inkFaint} /><input value={q} onChange={(e) => onQ(e.target.value)} placeholder="People, shops, #hashtags" data-testid="social-search" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 15, color: T.ink, fontFamily: T.fontBody }} />{q ? <button onClick={() => onQ("")} aria-label="Clear" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><HlX size={17} color={T.inkFaint} /></button> : null}</label><button onClick={onFilter} aria-label="Filter" data-testid="social-filter" className="v2-tap" style={{ position: "relative", width: 48, height: 48, borderRadius: 16, border: "none", background: n ? T.accentSoft : (HT.cardBg || T.surface), boxShadow: n ? `inset 0 0 0 1.5px ${T.accent}` : (HT.cardShadow ?? T.shadowCard), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><SxFilter size={19} color={n ? T.accent : T.ink} />{n ? <span style={{ position: "absolute", right: -3, top: -3, minWidth: 18, height: 18, borderRadius: 9, background: T.accent, color: "#fff", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span> : null}</button></div>;
  if (q.trim().length >= 2) {
    return <>{search}{!found ? <SocialNote title="Looking…" /> : (found.people || []).length + (found.posts || []).length === 0 ? <SocialNote title="Nothing by that name yet" text="Try a shop's handle, part of a name, or a #hashtag." /> : <>
      {(found.people || []).length ? <div style={{ padding: "8px 16px" }}><HellooCard>{found.people.map((c, i) => <SocialPersonRow key={c.accountId + c.side} card={c} photos={photos} first={i === 0} act={act} following={follows[c.accountId]} />)}</HellooCard></div> : null}
      {(found.posts || []).length ? <div style={{ paddingTop: 8 }}><SocialGrid posts={found.posts} onOpen={onOpen} /></div> : null}
      <div style={{ height: 120 }} /></>}</>;
  }
  const tags = ((ex && ex.tags) || []).map((t) => t.tag);
  const chips = [...(tag && !tags.includes(tag) ? [tag] : []), ...tags];
  return <>{search}
    {see.length || chips.length ? <div data-testid="social-explore-chips" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "6px 16px 10px", scrollbarWidth: "none" }}>
      {see.map((k) => { const t = SOCIAL_TOPICS.find((x) => x[0] === k); return <SocialChip key={k} on onClick={onFilter}>{t[1]} {t[2]}</SocialChip>; })}
      {chips.map((t) => <SocialChip key={t} on={tag === t} onClick={() => onTag(tag === t ? "" : t)} testid={`social-tagchip-${t}`}>#{t}{tag === t ? <HlX size={13} color={T.accent} /> : null}</SocialChip>)}
    </div> : null}
    {tag ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 12px" }}><span style={{ width: 44, height: 44, borderRadius: 15, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SxHash size={21} color={T.accent} /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 18, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>#{tag}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft }}>{ex ? `${(ex.grid || []).length}${(ex.grid || []).length >= 30 ? "+" : ""} ${(ex.grid || []).length === 1 ? "post" : "posts"}` : "…"}</span></span><button onClick={() => socialCopy(`#${tag}`, onToast)} data-testid="social-tag-copy" className="v2-tap" style={{ height: 36, padding: "0 12px", borderRadius: 12, border: "none", background: T.surfaceAlt, color: T.ink, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}><SxCopy size={14} color={T.ink} />Copy</button></div> : null}
    {!ex ? <SocialNote title="Loading…" /> : (ex.grid || []).length ? <SocialGrid posts={ex.grid} onOpen={onOpen} masonry /> : <SocialNote title={ex.error ? "Couldn't load Explore" : "No posts here yet"} text={ex.error ? "Check your connection and try again." : n ? "Nothing matches what you picked yet. Change the filter to see more." : "Be the first to post."} action={n && !ex.error ? "Change filter" : undefined} onAction={onFilter} />}
    <div style={{ height: 120 }} />
  </>;
}
// What a person wants Explore to show: categories (kept on the phone) and,
// if they like, one hashtag.
function SocialFilter({ see, tag, tags, onClose, onSave }) {
  const [pick, setPick] = useStateH40(see);
  const [t, setT] = useStateH40(tag);
  const clean = (v) => (socialTagsIn(`#${String(v).replace(/^#+/, "")}`)[0] || "");
  const label = (text) => <div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, margin: "4px 0 8px" }}>{text}</div>;
  return <HellooSheet title="What you want to see" onClose={onClose} zIndex={70}><div data-testid="social-filter-sheet">
    {label("Categories")}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>{SOCIAL_TOPICS.map(([k, e, l]) => { const on = pick.includes(k); return <SocialChip key={k} on={on} testid={`social-see-${k}`} onClick={() => setPick((p) => (on ? p.filter((x) => x !== k) : [...p, k]))}>{e} {l}</SocialChip>; })}</div>
    {label("Hashtag")}
    <label style={{ display: "flex", alignItems: "center", gap: 8, height: 46, borderRadius: 14, border: `1px solid ${T.line}`, background: T.surface, padding: "0 14px", marginBottom: 10 }}><SxHash size={17} color={T.inkFaint} /><input value={t} onChange={(e) => setT(e.target.value.replace(/[#\s]/g, "").slice(0, 30))} placeholder="any hashtag" data-testid="social-filter-tag" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 15, color: T.ink, fontFamily: T.fontBody }} />{t ? <button onClick={() => setT("")} aria-label="Clear hashtag" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><HlX size={16} color={T.inkFaint} /></button> : null}</label>
    {tags.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>{tags.slice(0, 10).map((x) => <SocialChip key={x.tag} on={clean(t) === x.tag} onClick={() => setT(clean(t) === x.tag ? "" : x.tag)}>#{x.tag}</SocialChip>)}</div> : null}
    <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.4, marginBottom: 12 }}>Your categories are saved on this phone. Explore opens with them every time until you change them.</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}><span data-testid="social-filter-save" style={{ display: "flex" }}><HellooPrimary onClick={() => onSave(pick, clean(t))}>Save</HellooPrimary></span><HellooSecondary onClick={() => onSave([], "")}>Show everything</HellooSecondary></div>
  </div></HellooSheet>;
}

// ── Status: a day-long picture or video, in a row above the feed ────────
function SocialStatusRow({ people, photos, onAdd, onOpen }) {
  const cell = (key, inner, label, fn, testid) => <button key={key} onClick={fn} data-testid={testid} aria-label={label} className="v2-tap" style={{ flexShrink: 0, width: 68, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody }}>{inner}<span style={{ width: "100%", fontSize: 11.5, fontWeight: 700, color: T.ink, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span></button>;
  return <div data-testid="social-status-row" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 16px 14px", scrollbarWidth: "none" }}>
    {cell("add", <span style={{ width: 62, height: 62, borderRadius: "50%", background: T.accentSoft, boxShadow: `inset 0 0 0 1.5px ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlPlus size={26} color={T.accent} /></span>, "Add", onAdd, "social-add")}
    {people.map((g, i) => cell(g.author.accountId + g.author.side, <span style={{ width: 62, height: 62, borderRadius: "50%", background: T.gradButton, padding: 2.5, boxSizing: "border-box", display: "flex" }}><span style={{ flex: 1, borderRadius: "50%", background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><SocialFace card={g.author} photos={photos} size={52} /></span></span>, g.mine ? "Your status" : (g.author.handle || g.author.name), () => onOpen(i), "social-status"))}
  </div>;
}
function SocialStatusViewer({ people, start, photos, muted, onMuted, onClose, onProfile, onDelete }) {
  const [at, setAt] = useStateH40({ g: start, i: 0 });
  const g = people[at.g];
  const it = g && g.items[at.i];
  const m = it && (it.media || [])[0];
  const video = m && m.kind === "video";
  const next = () => setAt((a) => { const cur = people[a.g]; if (cur && a.i + 1 < cur.items.length) return { g: a.g, i: a.i + 1 }; if (a.g + 1 < people.length) return { g: a.g + 1, i: 0 }; setTimeout(onClose, 0); return a; });
  const prev = () => setAt((a) => (a.i > 0 ? { g: a.g, i: a.i - 1 } : a.g > 0 ? { g: a.g - 1, i: people[a.g - 1].items.length - 1 } : a));
  useEffectH40(() => { if (!it || video) return undefined; const t = setTimeout(next, 5000); return () => clearTimeout(t); }, [at.g, at.i, video]);
  if (!it) return null;
  return <div data-testid="social-status-viewer" style={{ position: "absolute", inset: 0, zIndex: 60, background: "#000", overflow: "hidden", fontFamily: T.fontBody }}>
    <style>{"@keyframes socialStatusFill{from{width:0}to{width:100%}}"}</style>
    {video ? <video key={it.id} src={socialMediaSrc(m)} autoPlay playsInline muted={muted} onEnded={next} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} /> : <img key={it.id} src={socialMediaSrc(m)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 18%, transparent 70%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none" }} />
    <button onClick={prev} aria-label="Previous" style={{ position: "absolute", left: 0, top: 90, bottom: 110, width: "32%", border: "none", background: "transparent", cursor: "pointer" }} />
    <button onClick={next} aria-label="Next" data-testid="social-status-next" style={{ position: "absolute", right: 0, top: 90, bottom: 110, width: "68%", border: "none", background: "transparent", cursor: "pointer" }} />
    <div style={{ position: "absolute", left: 10, right: 10, top: "calc(10px + env(safe-area-inset-top, 0px))" }}>
      <div style={{ display: "flex", gap: 4 }}>{g.items.map((x, i) => <span key={x.id} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.35)", overflow: "hidden" }}><span key={`${at.g}-${at.i}`} style={{ display: "block", height: "100%", background: "#fff", width: i < at.i ? "100%" : 0, animation: i === at.i && !video ? "socialStatusFill 5s linear forwards" : "none" }} /></span>)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <button onClick={() => onProfile(g.author)} className="v2-tap" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}><SocialFace card={g.author} photos={photos} size={36} /><span style={{ minWidth: 0 }}><SocialName card={g.author} color="#fff" /><span style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.8)" }}>{hellooWhen(it.at)} · gone after a day</span></span></button>
        {video ? <button onClick={() => onMuted(!muted)} aria-label={muted ? "Sound on" : "Sound off"} className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{muted ? <SxMute size={17} color="#fff" /> : <SxSound size={17} color="#fff" />}</button> : null}
        {g.mine ? <button onClick={() => onDelete(it.id)} aria-label="Remove status" data-testid="social-status-remove" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlTrash size={17} color="#fff" /></button> : null}
        <button onClick={onClose} aria-label="Close" data-testid="social-status-close" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={19} color="#fff" /></button>
      </div>
    </div>
    {it.caption ? <div style={{ position: "absolute", left: 18, right: 18, bottom: "calc(34px + env(safe-area-inset-bottom, 0px))", color: "#fff", fontSize: 15, lineHeight: 1.4, textAlign: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{it.caption}</div> : null}
  </div>;
}
function SocialPersonRow({ card, photos, first, act, following }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: first ? "none" : `1px solid ${T.line}` }}><button onClick={() => act.profile(card)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><SocialFace card={card} photos={photos} size={42} /><span style={{ flex: 1, minWidth: 0 }}><SocialName card={card} /><span style={{ display: "block", fontSize: 12, color: T.inkSoft }}>{card.side === "shop" ? "Shop" : "Person"}</span></span></button><button onClick={() => act.follow(card, !following)} className="v2-tap" style={{ border: "none", borderRadius: 999, background: following ? T.surfaceAlt : T.accentSoft, color: following ? T.inkSoft : T.accent, fontWeight: 800, fontSize: 12.5, padding: "7px 13px", cursor: "pointer", fontFamily: T.fontBody }}>{following ? "Following" : "Follow"}</button></div>;
}

// ── A profile ───────────────────────────────────────────────────────────
function SocialProfile({ state, me, photos, act, onBack, onOpen, onMessage, onShop, onCompose }) {
  // Work: a full screen over the profile (find, edit, post), and a count
  // that makes the Work tab load again after a change there.
  const [workOpen, setWorkOpen] = useStateH40("");
  const [workTick, setWorkTick] = useStateH40(0);
  const [tab, setTab] = useStateH40("posts");
  const p = state.profile;
  const card = p || state.card;
  const hue = hellooHue(card.accountId || card.name || "");
  const stat = (n, l) => <span style={{ flex: 1, textAlign: "center", minWidth: 0 }}><span style={{ display: "block", fontSize: 18, fontWeight: 800, color: T.ink }}>{socialCount(n)}</span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft }}>{l}</span></span>;
  const grid = (state.grid || []).filter((x) => tab !== "reels" || (x.media[0] && x.media[0].kind === "video"));
  const btn = (Icon, label, fn, primary) => <button onClick={fn} className="v2-tap" style={{ flex: primary ? 1.4 : 1, minWidth: 0, height: 44, borderRadius: 14, border: "none", background: primary ? T.gradButton : (HT.cardBg || T.surface), boxShadow: primary ? "none" : (HT.cardShadow ?? T.shadowCard), color: primary ? (HT.onAccent || "#fff") : T.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}>{Icon ? <Icon size={16} color={primary ? (HT.onAccent || "#fff") : T.accent} /> : null}{label}</button>;
  return <><div data-testid="social-profile" style={{ position: "absolute", inset: 0, zIndex: 40, background: HT.screenBg || T.bg, overflowY: "auto", fontFamily: T.fontBody }}>
    <div style={{ position: "relative", height: 150, margin: "calc(8px + env(safe-area-inset-top, 0px)) 8px 0", background: `linear-gradient(135deg, ${hue}99 0%, ${hue} 60%, ${hue}CC 100%)`, borderRadius: 28, overflow: "hidden", boxShadow: `0 14px 30px -18px ${hue}` }}><span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 120% at 100% 0%, rgba(255,255,255,0.35) 0%, transparent 55%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.18) 100%)" }} /><div style={{ position: "absolute", left: 12, top: 12 }}><button onClick={onBack} aria-label="Back" className="v2-tap" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlBack size={19} color="#fff" /></button></div></div>
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 12, padding: "0 18px", marginTop: -46 }}><span style={{ padding: 4, borderRadius: "50%", background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex" }}><SocialFace card={card} photos={photos} size={88} /></span><span style={{ display: "flex", flex: 1, paddingBottom: 6, minWidth: 0 }}>{p ? <>{stat(p.posts, "posts")}{stat(p.followers, "followers")}{stat(p.following, "following")}</> : null}</span></div>
    <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "flex-start", gap: 10 }}><span style={{ flex: 1, minWidth: 0 }}><SocialName card={card} size={19} />{(card.badge || 1) >= 2 ? <div data-testid="social-badge-level" style={{ display: "flex", width: "fit-content", maxWidth: "100%", whiteSpace: "nowrap", alignItems: "center", gap: 6, marginTop: 6, padding: "4px 10px", borderRadius: 999, background: HELLOO_BADGE_TIERS[card.badge - 1].ring, color: HELLOO_BADGE_TIERS[card.badge - 1].to, fontSize: 12, fontWeight: 800 }}><HellooBadge tier={card.badge} size={12} />{HELLOO_BADGE_TIERS[card.badge - 1].name}{p && typeof p.followers === "number" ? ` · ${socialCount(p.followers)} followers` : ""}</div> : null}{card.handle && card.name && card.name !== card.handle ? <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 3 }}>{card.name}</div> : null}</span></div>
    {state.error ? <SocialNote title="Couldn't open this profile" text={state.error} /> : !p ? <SocialNote title="Loading…" /> : <>
      <div style={{ display: "flex", gap: 8, padding: "14px 18px 4px" }}>{p.isMe ? btn(SxAddPic, "New post", onCompose, true) : <>{btn(null, p.isFollowing ? "Following" : "Follow", () => act.follow(p, !p.isFollowing), !p.isFollowing)}{btn(HlChat, "Message", () => onMessage(p))}{btn(SxCoins, "Tip", () => act.tip(p))}</>}</div>
      <div style={{ display: "flex", margin: "12px 18px 0", padding: 4, borderRadius: 14, background: T.surfaceAlt }}>{[["posts", SxGrid, "Posts"], ["reels", SxReels, "Videos"], ["work", WxBag, "Work"], p.side === "shop" ? ["shop", HlStore, "Shop"] : null].filter(Boolean).map(([k, I, l]) => { const on = tab === k; return <button key={k} onClick={() => (k === "shop" ? onShop(p) : setTab(k))} data-testid={`social-tab-${k}`} aria-pressed={on} className="v2-tap" style={{ flex: 1, minWidth: 0, height: 36, borderRadius: 10, border: "none", background: on ? (HT.cardBg || T.surface) : "transparent", boxShadow: on ? T.shadowCard : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12.5, fontWeight: 800, color: on ? T.ink : T.inkSoft, cursor: "pointer", fontFamily: T.fontBody }}><I size={15} color={on ? T.ink : T.inkSoft} />{l}</button>; })}</div>
      {tab === "work" ? <WorkTab p={p} card={card} photos={photos} tick={workTick} onOpen={setWorkOpen} onMessage={() => onMessage(p)} onChat={(who, draft) => onMessage(who, draft)} onToast={act.toast || (() => {})} /> : <div style={{ paddingTop: 10 }}>{grid.length ? <SocialGrid posts={grid} onOpen={onOpen} /> : <SocialNote title={p.isMe ? "Share your first post" : "No posts yet"} text={p.isMe ? "Pictures and short videos show here." : ""} />}</div>}
      <div style={{ height: 120 }} /></>}
  </div>{workOpen ? <HellooWorkScreen start={workOpen} photos={photos} shopName={p && p.isMe && p.side === "shop" ? (card.handle || card.name) : ""} onClose={() => setWorkOpen("")} onChanged={() => setWorkTick((t) => t + 1)} onChat={(who, draft) => { setWorkOpen(""); onMessage(who, draft); }} onToast={act.toast || (() => {})} /> : null}</>;
}

// ── One post, full screen ───────────────────────────────────────────────
function SocialViewer({ post, photos, act, muted, onMuted, onBack }) {
  const m = post.media || [];
  const video = m[0] && m[0].kind === "video";
  const tag = (post.tags || [])[0];
  const side = (I, n, fn, fill, label) => <button onClick={fn} aria-label={label} className="v2-tap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#fff", fontSize: 12, fontWeight: 800, textShadow: "0 1px 6px rgba(0,0,0,0.4)", border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody }}><I size={30} color={fill || "#fff"} fill={fill || "none"} />{n}</button>;
  return <div data-testid="social-viewer" style={{ position: "absolute", inset: 0, zIndex: 50, background: "#000", overflow: "hidden", fontFamily: T.fontBody }}>
    {video ? <SocialVideo src={socialMediaSrc(m[0])} muted={muted} onMuted={onMuted} /> : <div style={{ display: "flex", width: "100%", height: "100%", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>{m.map((x) => <img key={x.id} src={socialMediaSrc(x)} alt="" style={{ flex: "0 0 100%", width: "100%", height: "100%", objectFit: "contain", scrollSnapAlign: "start" }} />)}</div>}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 55%, rgba(0,0,0,0.75) 100%)", pointerEvents: "none" }} />
    <button onClick={onBack} aria-label="Back" className="v2-tap" style={{ position: "absolute", left: 12, top: "calc(12px + env(safe-area-inset-top, 0px))", width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlBack size={21} color="#fff" /></button>
    <div style={{ position: "absolute", right: 12, bottom: tag ? 190 : 120, display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>{side(SxHeart, socialCount(post.likes), () => act.like(post, !post.liked), post.liked ? "#E11D48" : null, post.liked ? "Unlike" : "Like")}{side(SxComment, socialCount(post.comments), () => act.comments(post), null, "Comments")}{side(HlSend, "Share", () => act.share(post), null, "Share")}{!post.mine ? side(SxCoins, "Tip", () => act.tip(post.author), null, "Tip") : null}</div>
    <div style={{ position: "absolute", left: 16, right: 76, bottom: tag ? 100 : 30, color: "#fff" }}><button onClick={() => { onBack(); act.profile(post.author); }} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: 0, cursor: "pointer", maxWidth: "100%" }}><SocialFace card={post.author} photos={photos} size={34} /><SocialName card={post.author} size={14.5} color="#fff" /></button>{post.caption ? <div style={{ fontSize: 14, marginTop: 9, lineHeight: 1.4, maxHeight: 80, overflowY: "auto", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><SocialCaption text={post.caption} onTag={(t) => { onBack(); act.tag(t); }} color="#fff" /></div> : null}</div>
    {tag ? <div style={{ position: "absolute", left: 12, right: 12, bottom: "calc(22px + env(safe-area-inset-bottom, 0px))" }}><SocialTagCard tag={tag} onShopItem={act.shopItem} /></div> : null}
  </div>;
}

// ── Comments ────────────────────────────────────────────────────────────
function SocialComments({ post, photos, onCards, onCount, onClose, onToast }) {
  const [list, setList] = useStateH40(null);
  const [text, setText] = useStateH40("");
  const [busy, setBusy] = useStateH40(false);
  useEffectH40(() => { socialApi.comments(post.id).then((r) => { setList(r.comments || []); onCards((r.comments || []).map((c) => c.author)); }).catch(() => setList([])); }, [post.id]);
  const send = () => {
    const t = text.trim(); if (!t || busy) return;
    setBusy(true);
    socialApi.comment(post.id, t).then((r) => { setText(""); setList((l) => { const next = [r.comment, ...(l || [])]; onCount(next.length); return next; }); }).catch((err) => onToast((err && err.message) || "Couldn't post that.")).then(() => setBusy(false));
  };
  const remove = (c) => socialApi.uncomment(c.id).then(() => setList((l) => { const next = (l || []).filter((x) => x.id !== c.id); onCount(next.length); return next; })).catch(() => onToast("Couldn't remove it."));
  return <HellooSheet title={list && list.length ? `${list.length} ${list.length === 1 ? "comment" : "comments"}` : "Comments"} onClose={onClose} zIndex={70}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: HT.free, fontWeight: 800, marginBottom: 10 }}><HlShield size={13} color={HT.free} />Every comment is from a GLOOBAL ID</div>
    {list === null ? <div style={{ padding: 18, textAlign: "center", color: T.inkFaint, fontSize: 13 }}>Loading…</div> : list.length === 0 ? <div style={{ padding: 18, textAlign: "center", color: T.inkSoft, fontSize: 13 }}>No comments yet. Say something kind.</div> : list.map((c) => <div key={c.id} data-testid="social-comment" style={{ display: "flex", gap: 10, padding: "8px 0" }}><SocialFace card={c.author} photos={photos} size={32} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><SocialName card={c.author} size={13} /><span style={{ fontSize: 11.5, color: T.inkFaint, flexShrink: 0 }}>{hellooWhen(c.at)}</span></span><span style={{ display: "block", fontSize: 13.5, color: T.ink, lineHeight: 1.4, marginTop: 2, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{c.text}</span></span>{c.canDelete ? <button onClick={() => remove(c)} aria-label="Remove comment" className="v2-tap" style={{ border: "none", background: "none", padding: 4, cursor: "pointer", alignSelf: "flex-start" }}><HlTrash size={15} color={T.inkFaint} /></button> : null}</div>)}
    <div style={{ position: "sticky", bottom: 0, display: "flex", gap: 8, alignItems: "center", paddingTop: 10, background: T.bg }}><input value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Add a comment" data-testid="social-comment-input" style={{ flex: 1, minWidth: 0, height: 46, borderRadius: 16, border: `1px solid ${T.line}`, background: T.surface, padding: "0 14px", fontSize: 14.5, color: T.ink, outline: "none", fontFamily: T.fontBody }} /><button onClick={send} disabled={!text.trim() || busy} aria-label="Post comment" className="v2-tap" style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: text.trim() ? T.gradButton : T.gradButtonDisabled, display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0 }}><HlSend size={19} color="#fff" /></button></div>
  </HellooSheet>;
}

// ── A new post ──────────────────────────────────────────────────────────
function SocialComposer({ me, asName, status, onClose, onPosted, onToast }) {
  const [files, setFiles] = useStateH40([]);
  const [caption, setCaption] = useStateH40("");
  const [topic, setTopic] = useStateH40("");
  const [items, setItems] = useStateH40(null);
  const [tags, setTags] = useStateH40([]);
  const [busy, setBusy] = useStateH40("");
  const [err, setErr] = useStateH40("");
  const [popular, setPopular] = useStateH40([]);
  const pick = useRefH40(null);
  const used = socialTagsIn(caption);
  const ideas = [...new Set([...(SOCIAL_TAG_IDEAS[topic] || []), ...popular, ...(topic ? SOCIAL_TAG_IDEAS[""] : [])])].filter((t) => !used.includes(t)).slice(0, 12);
  const addTag = (t) => setCaption((c) => (socialTagsIn(c).length >= 10 ? c : `${c}${c && !/\s$/.test(c) ? " " : ""}#${t} `.slice(0, 2200)));
  const dropTag = (t) => setCaption((c) => c.replace(new RegExp(`\\s?#${t}(?![\\p{L}\\p{M}\\p{N}_])`, "giu"), ""));
  useEffectH40(() => { if (!status) socialApi.hashtags("").then((r) => setPopular((r.tags || []).map((x) => x.tag))).catch(() => {}); }, []);
  useEffectH40(() => { socialApi.myItems().then((r) => setItems(r.items || [])).catch(() => setItems([])); }, []);
  useEffectH40(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), []);
  const onFiles = (list) => {
    setErr("");
    const chosen = Array.from(list || []);
    const video = chosen.find((f) => /^video\//.test(f.type));
    if (status) {
      const one = video || chosen.find((f) => /^image\//.test(f.type) && !/svg/.test(f.type));
      if (!one) { setErr("Pick one picture or one video."); return; }
      if (video && video.size > SOCIAL_VIDEO_MAX) { setErr("Videos can be up to 8 MB for now. Trim it and try again."); return; }
      setFiles([{ file: one, kind: video ? "video" : "photo", preview: URL.createObjectURL(one) }]);
      return;
    }
    if (video) {
      if (video.size > SOCIAL_VIDEO_MAX) { setErr("Videos can be up to 8 MB for now. Trim it and try again."); return; }
      setFiles([{ file: video, kind: "video", preview: URL.createObjectURL(video) }]);
      return;
    }
    const pics = chosen.filter((f) => /^image\//.test(f.type) && !/svg/.test(f.type));
    if (!pics.length) { setErr("Pick pictures or one video."); return; }
    setFiles((cur) => [...cur.filter((f) => f.kind === "photo"), ...pics.map((f) => ({ file: f, kind: "photo", preview: URL.createObjectURL(f) }))].slice(0, 10));
  };
  const share = async () => {
    if (!files.length || busy) return;
    setErr("");
    try {
      const ids = [];
      for (let i = 0; i < files.length; i += 1) {
        setBusy(files.length > 1 ? `Sending ${i + 1} of ${files.length}…` : "Sending…");
        const f = files[i];
        const data = f.kind === "video" ? await socialReadFile(f.file) : await socialShrinkPhoto(f.file);
        const r = await socialApi.upload(data);
        ids.push(r.id);
      }
      setBusy("Posting…");
      const r = await socialApi.post(status ? { media: ids, caption: caption.trim(), story: true } : { media: ids, caption: caption.trim(), topic, tags });
      onPosted(r.post);
    } catch (e) {
      setErr((e && e.message) || "Couldn't post that. Try again.");
      setBusy("");
    }
  };
  return <div data-testid="social-composer" style={{ position: "absolute", inset: 0, zIndex: 80, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <HellooTop left={<HellooRoundButton Icon={HlX} label="Close" onClick={onClose} size={38} />} title={status ? "New status" : "New post"} subtitle={status ? `${asName || me.name} · gone after 24 hours` : (asName || me.name)} />
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple={!status} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} data-testid="social-file" />
      {files.length === 0 ? <button onClick={() => pick.current && pick.current.click()} className="v2-tap" style={{ height: 240, borderRadius: 24, border: `2px dashed ${T.line}`, background: HT.cardBg || T.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}><span style={{ width: 64, height: 64, borderRadius: 22, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><SxAddPic size={30} color={T.accent} /></span><span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{status ? "A picture or a short video" : "Pictures or a short video"}</span><span style={{ fontSize: 12.5, color: T.inkSoft }}>{status ? "One picture · or one video up to 8 MB" : "Up to 10 pictures · or one video up to 8 MB"}</span></button>
        : <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>{files.map((f, i) => <span key={f.preview} style={{ position: "relative", flex: files.length === 1 ? "1 0 100%" : "0 0 150px", height: files.length === 1 ? 300 : 190, borderRadius: 18, overflow: "hidden", background: "#000" }}>{f.kind === "video" ? <video src={f.preview} muted playsInline autoPlay loop style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}<button onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} aria-label="Remove" className="v2-tap" style={{ position: "absolute", right: 8, top: 8, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={15} color="#fff" /></button></span>)}{!status && files[0].kind === "photo" && files.length < 10 ? <button onClick={() => pick.current && pick.current.click()} aria-label="Add pictures" className="v2-tap" style={{ flex: "0 0 90px", height: files.length === 1 ? 300 : 190, borderRadius: 18, border: `2px dashed ${T.line}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlPlus size={24} color={T.inkSoft} /></button> : null}</div>}
      <HellooCard style={{ padding: 14 }}><textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 2200))} placeholder={status ? "Add a line (if you like)" : "Say something about it… add #hashtags"} rows={status ? 2 : 3} data-testid="social-caption" style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 15, color: T.ink, fontFamily: T.fontBody, lineHeight: 1.45 }} /></HellooCard>
      {status ? <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}><HlShield size={15} color={HT.free} style={{ flexShrink: 0 }} />Only the people who follow you and the people you follow see your status.</div> : null}
      {status ? null : <><div><div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 8 }}>Topic</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{SOCIAL_TOPICS.map(([k, e, l]) => <button key={k} onClick={() => setTopic((t) => (t === k ? "" : k))} aria-pressed={topic === k} className="v2-tap" style={{ padding: "8px 12px", borderRadius: 14, border: "none", background: topic === k ? T.accentSoft : T.surfaceAlt, color: topic === k ? T.accent : T.inkSoft, boxShadow: topic === k ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{e} {l}</button>)}</div></div>
      <div data-testid="social-hashtags"><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 2 }}><SxHash size={14} color={T.inkSoft} />Hashtags<span style={{ flex: 1 }} /><span style={{ fontWeight: 700, color: T.inkFaint }}>{used.length} of 10</span></div><div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8, lineHeight: 1.4 }}>People find your post by these. Tap to add, or type your own with # in the text.</div>
        {used.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{used.map((t) => <SocialChip key={t} on onClick={() => dropTag(t)} label={`Remove #${t}`}>#{t}<HlX size={13} color={T.accent} /></SocialChip>)}</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ideas.map((t) => <SocialChip key={t} onClick={() => addTag(t)} testid={`social-idea-${t}`}>#{t}</SocialChip>)}</div></div>
      {items && items.length ? <div><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 8 }}><SxTag size={14} color={T.inkSoft} />Sell from this post</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{items.map((it) => { const on = tags.includes(it.id); return <button key={it.id} onClick={() => setTags((t) => (on ? t.filter((x) => x !== it.id) : [...t, it.id].slice(0, 5)))} aria-pressed={on} className="v2-tap" style={{ padding: "8px 12px", borderRadius: 14, border: "none", background: on ? T.accentSoft : T.surfaceAlt, color: on ? T.accent : T.ink, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title} · {hellooMoneyText(it.price, it.currency)}</button>; })}</div></div> : null}</>}
      {err ? <div role="alert" style={{ fontSize: 13, color: T.negative, fontWeight: 700 }}>{err}</div> : null}
    </div>
    <div style={{ padding: "10px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}><HellooPrimary onClick={share} disabled={!files.length || Boolean(busy)}>{busy || (status ? "Share for 24 hours" : "Share")}</HellooPrimary></div>
  </div>;
}
