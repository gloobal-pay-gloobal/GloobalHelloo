// frontend/screens/Social.jsx
//
// GLOOBAL Social inside Helloo: For you, Explore, profiles, posting, and
// comments. Every face here is a GLOOBAL account, so every like and every
// comment is from a real person (or a shop speaking as itself). A post can
// carry things from the poster's own shop, each with its own CEL | currency
// button that opens that shop's menu in a chat — the same order flow as
// everywhere else in Helloo.
import { useState as useStateH40, useEffect as useEffectH40, useRef as useRefH40, useCallback as useCallbackH40 } from "react";
import { BarChart2 as SxViews, Users as SxVisitors, Heart as SxHeart, MessageCircle as SxComment, Coins as SxCoins, Grid3x3 as SxGrid, Clapperboard as SxReels, PlaySquare as SxVideo, CircleDashed as SxStory, Images as SxPost, MoreHorizontal as SxMore, Volume2 as SxSound, VolumeX as SxMute, ImagePlus as SxAddPic, Tag as SxTag, TrendingUp as SxTrend, SlidersHorizontal as SxFilter, Hash as SxHash, Copy as SxCopy, Clock as SxClock, Eye as SxEye, EyeOff as SxEyeOff, Repeat2 as SxRepost, Bookmark as SxSave, AtSign as SxAt, History as SxMine, Menu as SxLines } from "lucide-react";

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
  post: (path, body, options) => gloobalApiClient.post(socialAs(path), body, options),
  put: (path, body, options) => gloobalApiClient.put(socialAs(path), body, options)
};
var socialApi = {
  feed: (q) => socialHttp.get(`/api/social/feed${q || ""}`),
  explore: (topics, tag) => socialHttp.get(`/api/social/explore?plain=1&topics=${encodeURIComponent((topics || []).join(","))}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`),
  stories: () => socialHttp.get("/api/social/stories"),
  hashtags: (q) => socialHttp.get(`/api/social/hashtags?q=${encodeURIComponent(q || "")}`),
  search: (q) => socialHttp.get(`/api/social/search?q=${encodeURIComponent(q)}`),
  profile: (gloobalId, side) => socialHttp.get(`/api/social/profile/${encodeURIComponent(gloobalId)}${side ? `?side=${side}` : ""}`),
  // A face, not an account: the person, or the shop on the same account.
  follow: (to, on, side) => socialHttp.post("/api/social/follow", { to, on, side: side === "shop" ? "shop" : "self" }),
  people: (gloobalId, which, side) => socialHttp.get(`/api/social/people/${encodeURIComponent(gloobalId)}/${which}?side=${side === "shop" ? "shop" : "self"}`),
  like: (id, on) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/like`, { on }),
  repost: (id, on) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/repost`, { on }),
  save: (id, on) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/save`, { on }),
  reels: (format, before) => socialHttp.get(`/api/social/reels?format=${format === "video" ? "video" : "reel"}${before ? `&before=${encodeURIComponent(before)}` : ""}`),
  myActivity: (type) => socialHttp.get(`/api/social/my-activity?type=${encodeURIComponent(type)}`),
  myVideos: () => socialHttp.get("/api/social/my-videos"),
  fullVideo: (reelId, videoId) => gloobalApiClient.put(socialAs(`/api/social/posts/${encodeURIComponent(reelId)}/full-video`), { video: videoId || null }),
  comments: (id) => socialHttp.get(`/api/social/posts/${encodeURIComponent(id)}/comments`),
  comment: (id, text, mentions) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/comments`, { text, mentions: mentions || [] }),
  one: (id) => socialHttp.get(`/api/social/posts/${encodeURIComponent(id)}`),
  uncomment: (id) => gloobalApiClient.delete(socialAs(`/api/social/comments/${encodeURIComponent(id)}`)),
  report: (id, reason) => socialHttp.post(`/api/social/posts/${encodeURIComponent(id)}/report`, { reason }),
  remove: (id) => gloobalApiClient.delete(socialAs(`/api/social/posts/${encodeURIComponent(id)}`)),
  upload: (data) => socialHttp.post("/api/social/media", { data }, { timeoutMs: 120e3 }),
  editProfile: (body) => socialHttp.put("/api/social/profile", body, { timeoutMs: 60e3 }),
  archive: () => socialHttp.get("/api/social/stories/archive"),
  highlights: (id, side) => socialHttp.get(`/api/social/highlights/${encodeURIComponent(id)}?side=${side === "shop" ? "shop" : "self"}`),
  highlight: (id) => socialHttp.get(`/api/social/highlights/item/${encodeURIComponent(id)}`),
  addHighlight: (title, stories) => socialHttp.post("/api/social/highlights", { title, stories }),
  dropHighlight: (id) => gloobalApiClient.delete(socialAs(`/api/social/highlights/${encodeURIComponent(id)}`)),
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
// Follows are per face: the person and the shop on one account apart.
function socialFollowKey(card) { return `${card.accountId}:${card.side === "shop" ? "shop" : "self"}`; }
function socialMediaSrc(m) { return m && m.url ? gloobalSealedSrc(m.url) : ""; }
// A profile's own picture or cover: shown to anyone signed in, with no
// "Confirm it's you" first (it is a face beside a name, not a post). Asked
// for once per picture as data inside the signed-in request, then kept.
var socialFaceCache = new Map(); // id -> data URL | Promise
// The cover a person or shop set on Social, for Helloo's own profile pages.
var socialCoverCache = new Map(); // "id:side" -> cover | Promise
function useSocialCoverOf(gloobalId, side) {
  const key = gloobalId ? `${gloobalId}:${side === "shop" ? "shop" : "self"}` : "";
  const known = key ? socialCoverCache.get(key) : null;
  const [cover, setCover] = useStateH40(known && !known.then ? known : null);
  useEffectH40(() => {
    if (!key) { setCover(null); return undefined; }
    let live = true;
    const have = socialCoverCache.get(key);
    if (have && !have.then) { setCover(have); return undefined; }
    const wait = have || socialHttp.get(`/api/social/cover/${encodeURIComponent(gloobalId)}?side=${side === "shop" ? "shop" : "self"}`).then((r) => { const c = (r && r.cover) || false; socialCoverCache.set(key, c); return c; }).catch(() => { socialCoverCache.delete(key); return false; });
    if (!have) socialCoverCache.set(key, wait);
    wait.then((c) => { if (live) setCover(c || null); });
    return () => { live = false; };
  }, [key]);
  return useSocialFaceSrc(cover || null);
}
function useSocialFaceSrc(m) {
  const id = m && m.id ? String(m.id) : "";
  const sealed = socialMediaSrc(m);
  const known = id ? socialFaceCache.get(id) : "";
  const [data, setData] = useStateH40(typeof known === "string" ? known : "");
  useEffectH40(() => {
    if (!id) { setData(""); return undefined; }
    let live = true;
    const have = socialFaceCache.get(id);
    if (typeof have === "string") { setData(have); return undefined; }
    const wait = have || socialHttp.get(`/api/social/media/${encodeURIComponent(id)}/face`).then((r) => { const d = (r && r.data) || ""; socialFaceCache.set(id, d); return d; }).catch(() => { socialFaceCache.delete(id); return ""; });
    if (!have) socialFaceCache.set(id, wait);
    wait.then((d) => { if (live) setData(d); });
    return () => { live = false; };
  }, [id]);
  return data || sealed;
}
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
  // A person's own Social picture, when they chose one; else their GLOOBAL
  // face (or a shop's logo), as everywhere else.
  const own = useSocialFaceSrc(card && card.picture);
  if (own) return <span data-testid="social-own-picture" style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "inline-flex", flexShrink: 0, background: T.surfaceSunk }}><img src={own} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></span>;
  return <HellooAvatar person={hellooPersonFrom(card, photos)} size={size} flag={false} />;
}
function SocialName({ card, size = 14, color }) {
  const label = card.handle ? card.handle : card.name;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: "100%" }}><span style={{ fontSize: size, fontWeight: 800, color: color || T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span><HellooBadge tier={card.badge || 1} size={size} /></span>;
}
// A caption with its #hashtags as things to tap.
// A caption or comment: #hashtags open Explore for that tag, and "@Name"
// (the people the writer picked) opens that profile.
function SocialCaption({ text, onTag, color, mentions, onMention }) {
  const who = (mentions || []).filter((m) => m && m.label).sort((a, b) => b.label.length - a.label.length);
  const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${who.map((m) => esc("@" + m.label)).concat(["#[\\p{L}\\p{M}\\p{N}_]{2,30}"]).join("|")})`, "gu");
  const link = { border: "none", background: "none", padding: 0, margin: 0, font: "inherit", fontWeight: 800, color: color || T.accent, cursor: "pointer" };
  return String(text || "").split(re).map((part, i) => {
    if (!part) return null;
    if (part[0] === "#" && part.length > 2 && onTag) return <button key={i} onClick={(e) => { e.stopPropagation(); onTag(part.slice(1).toLowerCase()); }} data-testid="social-hashtag" className="v2-tap" style={link}>{part}</button>;
    const m = part[0] === "@" ? who.find((x) => "@" + x.label === part) : null;
    if (m) return <button key={i} onClick={(e) => { e.stopPropagation(); if (onMention) onMention(m); }} data-testid="social-mention" className="v2-tap" style={link}>{part}</button>;
    return part;
  });
}
// While you type "@na…": the people it could be. Tap one and the name goes
// in, and they will be told you mentioned them.
function SocialMentionPick({ text, onText, picked, onPicked, photos, dark = false }) {
  const m = /(^|\s)@([^\s@]{2,24})$/u.exec(text || "");
  const q = m ? m[2] : "";
  const [found, setFound] = useStateH40([]);
  useEffectH40(() => { if (!q) { setFound([]); return undefined; } let live = true; const t = setTimeout(() => { socialApi.search(q).then((r) => { if (live) setFound((r.people || []).slice(0, 6)); }).catch(() => { if (live) setFound([]); }); }, 220); return () => { live = false; clearTimeout(t); }; }, [q]);
  if (!q || !found.length) return null;
  const pick = (c) => { const label = c.handle || c.name; onText(text.slice(0, text.length - q.length - 1) + "@" + label + " "); onPicked([...(picked || []).filter((x) => !(x.accountId === c.accountId && x.side === c.side)), { accountId: c.accountId, side: c.side, label }]); setFound([]); };
  return <div data-testid="social-mention-pick" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0 2px" }}>{found.map((c) => <button key={c.accountId + c.side} onClick={() => pick(c)} data-testid="social-mention-option" className="v2-tap" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px 5px 5px", borderRadius: 999, border: "none", background: dark ? "rgba(255,255,255,0.14)" : T.surfaceAlt, cursor: "pointer", fontFamily: T.fontBody, maxWidth: 220 }}><SocialFace card={c} photos={photos} size={26} /><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, fontWeight: 800, color: T.ink }}>{c.handle || c.name}</span><HellooBadge tier={c.badge || 1} size={12} /></button>)}</div>;
}
const socialMentionsFor = (picked, text) => (picked || []).filter((m) => String(text || "").includes("@" + m.label));
function SocialChip({ on, onClick, children, testid, label }) {
  return <button onClick={onClick} aria-pressed={on} aria-label={label} data-testid={testid} className="v2-tap" style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 14, border: "none", background: on ? T.accentSoft : T.surfaceAlt, color: on ? T.accent : T.inkSoft, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>{children}</button>;
}
function SocialTile({ post, onOpen, tall }) {
  const m = (post.media || [])[0];
  const src = socialMediaSrc(m);
  return <button onClick={() => onOpen(post)} className="v2-tap" data-testid="social-tile" aria-label={post.caption || "Post"} style={{ position: "relative", display: "block", width: "100%", height: "100%", border: "none", padding: 0, margin: 0, borderRadius: 10, overflow: "hidden", background: T.surfaceAlt, cursor: "pointer", gridRow: tall ? "span 2" : undefined }}>
    {m && m.kind === "video" ? <video src={src + "#t=0.1"} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
    <span style={{ position: "absolute", left: 7, bottom: 6, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}><SxViews size={12} color="#fff" strokeWidth={2.6} />{socialCount(post.views || 0)}</span>{m && m.kind === "video" ? <span style={{ position: "absolute", left: 7, top: 6, display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}><HlPlay size={13} color="#fff" fill="#fff" /></span> : null}
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
    {post.repostedBy ? <button data-testid="social-reposted-by" onClick={() => act.profile(post.repostedBy)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", padding: "2px 16px 6px", cursor: "pointer", color: T.inkSoft, fontSize: 12.5, fontWeight: 800, fontFamily: T.fontBody, maxWidth: "100%" }}><SxRepost size={15} color={T.inkSoft} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.repostedBy.handle || post.repostedBy.name} reposted</span></button> : null}
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 10px" }}>
      <button onClick={() => act.profile(a)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><SocialFace card={a} photos={photos} size={38} /><span style={{ flex: 1, minWidth: 0 }}><SocialName card={a} /><span style={{ display: "block", fontSize: 11.5, color: T.inkFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.suggested ? "Suggested · " : ""}{hellooWhen(post.at)}</span></span></button>
      {!post.mine && !act.isFollowing(a) ? <SocialFollowButton card={a} act={act} kind="link" /> : null}
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
      {!post.mine ? <button onClick={() => act.repost(post, !post.reposted)} data-testid="social-repost" aria-label={post.reposted ? "Take back your repost" : "Repost to your followers"} aria-pressed={Boolean(post.reposted)} className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: post.reposted ? "#16A34A" : T.ink, fontSize: 13, fontWeight: 800, fontFamily: T.fontBody }}><SxRepost size={24} color={post.reposted ? "#16A34A" : T.ink} />{post.reposts ? socialCount(post.reposts) : null}</button> : null}
      <button onClick={() => act.share(post)} aria-label="Share" className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><HlSend size={23} color={T.ink} /></button>
      <button onClick={() => act.save(post, !post.saved)} data-testid="social-save" aria-label={post.saved ? "Remove from saved" : "Save"} aria-pressed={Boolean(post.saved)} className="v2-tap" style={{ marginLeft: "auto", border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex" }}><SxSave size={24} color={T.ink} fill={post.saved ? T.ink : "none"} /></button>
      <span data-testid="social-views" title="Different people who saw this" aria-label={`${post.views || 0} ${(post.views || 0) === 1 ? "person" : "people"} saw this`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 700, color: T.inkSoft }}><SxViews size={21} color={T.inkSoft} />{socialCount(post.views || 0)}</span>
      {!post.mine ? <button onClick={() => act.tip(a)} aria-label="Tip" data-testid="social-tip" className="v2-tap" style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}><SxCoins size={16} color={T.accent} />Tip</button> : null}
    </div>
    <div style={{ padding: "0 16px", fontSize: 13.5, color: T.ink, lineHeight: 1.45 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><b>{post.likes === 1 ? "1 like" : `${socialCount(post.likes)} likes`}</b>{post.likes > 0 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 800, color: HT.free, background: HT.freeSoft, borderRadius: 999, padding: "2px 8px" }}><HlShield size={11} color={HT.free} />all real people</span> : null}</span>
      {post.caption ? <div style={{ marginTop: 4, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><b>{a.handle || a.name}</b> <HellooBadge tier={a.badge || 1} size={12.5} /> <SocialCaption text={post.caption} onTag={act.tag} mentions={post.mentions} onMention={act.profile} /></div> : null}
      {post.comments > 0 ? <button onClick={() => act.comments(post)} className="v2-tap" style={{ display: "block", marginTop: 6, border: "none", background: "none", padding: 0, color: T.inkSoft, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.fontBody }}>View {post.comments === 1 ? "1 comment" : `all ${post.comments} comments`}</button> : null}
    </div>
  </div>;
}

// ── The whole Social tab ────────────────────────────────────────────────
// The heart: what happened to you on Social — likes and comments on your
// posts, and people who started following you (with Follow back). Newest
// first; what came since you last looked is under "New".
function SocialActivity({ photos, onBack, onProfile, act, onSeen, onMine }) {
  const [data, setData] = useStateH40(null);
  const [err, setErr] = useStateH40("");
  const [back, setBack] = useStateH40({});
  useEffectH40(() => {
    let live = true;
    socialApi.activity().then((r) => { if (!live) return; setData(r.items || []); socialApi.activitySeen().then(() => onSeen && onSeen()).catch(() => {}); }).catch((e) => live && setErr((e && e.message) || "Couldn't load your activity."));
    return () => { live = false; };
  }, []);
  const line = (it) => it.type === "mention" ? <>mentioned you{it.text ? <>: <span style={{ color: T.ink }}>“{it.text.length > 70 ? `${it.text.slice(0, 70)}…` : it.text}”</span></> : ""}</> : it.type === "like" ? "liked your post" : it.type === "comment" ? <>commented: <span style={{ color: T.ink }}>“{it.text.length > 70 ? `${it.text.slice(0, 70)}…` : it.text}”</span></> : "started following you";
  const row = (it, i) => {
    const followed = it.type === "follow" && (back[it.who.accountId] ?? it.followingBack);
    return <div key={i} data-testid="social-activity-row" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 16px", background: it.fresh ? (T.accentSoft ? `${T.accentSoft}` : "transparent") : "transparent" }}>
      <button onClick={() => onProfile(it.who)} aria-label="Profile" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0, display: "flex" }}><SocialFace card={it.who} photos={photos} size={44} /></button>
      <button onClick={() => onProfile(it.who)} style={{ flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.4 }}>
        <b style={{ color: T.ink, fontWeight: 800 }}>{it.who.handle || it.who.name}</b> <HellooBadge tier={it.who.badge || 1} size={12.5} /> {line(it)} <span style={{ color: T.inkFaint, whiteSpace: "nowrap" }}>· {socialAgo(it.at)}</span>
      </button>
      {it.type === "follow"
        ? <SocialFollowButton card={Object.assign({ followsMe: true }, it.who, it.who.following === undefined ? { following: Boolean(it.followingBack) } : {})} act={act} testid="social-activity-follow" />
        : it.post && it.post.media ? <span style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: T.surfaceSunk, flexShrink: 0 }}>{it.post.media.kind === "photo" ? <img src={socialMediaSrc(it.post.media)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: T.inkFaint }}><SxReels size={18} /></span>}</span> : null}
    </div>;
  };
  const fresh = (data || []).filter((x) => x.fresh); const earlier = (data || []).filter((x) => !x.fresh);
  const label = (t) => <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, padding: "14px 16px 4px" }}>{t}</div>;
  return <div data-testid="social-activity" style={{ position: "absolute", inset: 0, zIndex: 30, background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "calc(10px + env(safe-area-inset-top, 0px)) 14px 8px", flexShrink: 0 }}><NavBackButton onClick={onBack} /><div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDisplay, color: T.ink }}>Activity</div></div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 40 }}>
      {onMine ? <button type="button" data-testid="social-activity-mine" onClick={onMine} className="v2-tap" style={{ width: "calc(100% - 28px)", margin: "4px 14px 6px", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 18, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SxMine size={20} color={T.accent} /></span><span style={{ flex: 1, minWidth: 0 }}><b style={{ display: "block", fontSize: 14.5, color: T.ink }}>My activity</b><span style={{ display: "block", fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>Your likes, comments, reposts, saved and mentions</span></span><HlChevron size={18} color={T.inkFaint} /></button> : null}
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

// Your social profiles: yourself, and each shop — a card in the middle,
// like "Connect as" in chats. Tap a face to open that profile and post
// as it; the switch turns it on or off. Each
// one is off until you turn it on; only an "on" one can post, follow, like
// and comment.
function SocialProfilesSheet({ me, list, face, photos, accounts, onUse, onSet, onOpen, onClose }) {
  useHellooBackLayer(true, onClose);
  const [ask, setAsk] = useStateH40(null); // { f, on }
  const [busy, setBusy] = useStateH40("");
  const nameOf = (f) => (f.kind === "shop" ? (f.handle || f.name) : (f.name || me.name));
  const go = async () => {
    const { f, on } = ask; setBusy(f.as);
    try { await onSet(f, on); setAsk(null); } catch (e) { /* toasted by onSet */ }
    setBusy("");
  };
  const onCount = list.filter((f) => accounts && accounts[f.as] && accounts[f.as].on).length;
  const faceOf = (f, size) => (f.kind === "shop" ? <SocialFace card={{ accountId: f.accountId, gloobalId: f.gloobalId, name: f.name, handle: f.handle, side: "shop" }} photos={photos} size={size} /> : <HellooMeAvatar me={me} size={size} />);
  const card = HT.cardBg || T.surface;
  const many = list.length > 3;
  return <div data-testid="social-profiles-layer" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,23,42,0.42)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box", fontFamily: T.fontBody }}>
    <div role="dialog" aria-modal="true" aria-label="Your social profiles" data-testid="social-profile-card" onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 380, maxHeight: "100%", overflowY: "auto", boxSizing: "border-box", borderRadius: 28, background: card, boxShadow: "0 24px 60px rgba(15,23,42,0.28)", padding: "22px 12px 16px" }}>
      <button type="button" onClick={onClose} aria-label="Close" className="v2-tap" style={{ position: "absolute", right: 10, top: 10, width: 36, height: 36, border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={20} color={T.inkFaint} /></button>
      <div style={{ textAlign: "center", fontSize: 11.5, fontWeight: 900, letterSpacing: 1.2, color: T.accent, textTransform: "uppercase" }}>GLOOBAL Social</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}><span style={{ fontSize: 17, fontWeight: 900, color: T.ink, fontFamily: T.fontDisplay }}>Connect as</span><span style={{ fontSize: 11.5, fontWeight: 800, color: T.inkSoft, background: T.surfaceAlt, padding: "3px 9px", borderRadius: 999 }}>{accounts ? `${onCount} of ${list.length} on` : `${list.length}`}</span></div>
      <div style={{ textAlign: "center", fontSize: 12.5, color: T.inkSoft, marginTop: 3, lineHeight: 1.45, padding: "0 12px" }}>Each one has its own posts, followers and status.</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${many ? 3 : Math.max(1, list.length)}, minmax(0, 1fr))`, gap: "18px 4px", marginTop: 18 }}>
        {list.map((f) => {
          const a = (accounts && accounts[f.as]) || null; const isOn = Boolean(a && a.on); const using = f.as === face.as; const shop = f.kind === "shop";
          const key = shop ? f.handle : "self";
          return <div key={f.as} style={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <button type="button" data-testid={`social-as-${key}`} aria-label={isOn ? `${nameOf(f)}: open profile` : `${nameOf(f)}: turn on`} onClick={() => (isOn ? onOpen(f) : setAsk({ f, on: true }))} className="v2-tap" style={{ minWidth: 0, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "none", background: "none", padding: "2px 2px 0", cursor: "pointer", fontFamily: T.fontBody }}>
              <span style={{ position: "relative", padding: 3, borderRadius: "50%", background: using && isOn ? T.gradButton : "transparent", border: isOn ? "none" : `2px dashed ${T.inkFaint}`, display: "flex" }}>
                <span style={{ borderRadius: "50%", padding: 2, background: card, display: "flex", filter: isOn ? "none" : "grayscale(0.8)", opacity: isOn ? 1 : 0.7 }}>{faceOf(f, 60)}</span>
                {using ? <span aria-hidden="true" style={{ position: "absolute", right: 0, bottom: 0, width: 22, height: 22, borderRadius: "50%", background: T.positive || "#16A34A", border: `2px solid ${card}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlCheck size={12} color="#fff" strokeWidth={3} /></span>
                  : shop ? <span aria-hidden="true" style={{ position: "absolute", right: 0, bottom: 0, width: 22, height: 22, borderRadius: "50%", background: T.accentSoft, border: `2px solid ${card}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlStore size={11} color={T.accent} /></span> : null}
              </span>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, maxWidth: "100%", minWidth: 0 }}><span style={{ minWidth: 0, fontSize: 13, fontWeight: 800, color: isOn ? T.ink : T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop ? <CreatorHandleText handle={f.handle} icon={false} /> : String(nameOf(f)).split(" ")[0]}</span>{isOn ? <HellooBadge tier={(a && a.badge) || 1} size={11.5} /> : null}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, marginTop: -4, whiteSpace: "nowrap" }}>{a ? (isOn ? `${socialCount(a.followers)} followers` : "Hidden") : "…"}</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
              <span style={{ width: 40, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ transform: "scale(0.8)", display: "flex" }}><SocialSwitch on={isOn} busy={busy === f.as || a === null} label={`${nameOf(f)} on Social`} testid={`social-on-${key}`} onChange={(v) => setAsk({ f, on: v })} /></span></span>
            </div>
          </div>;
        })}
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: T.inkFaint, marginTop: 14, lineHeight: 1.5 }}>Tap a picture for its profile · your chats stay the same</div>
    </div>
    {ask ? <div onClick={(e) => e.stopPropagation()}><HellooSheet title={ask.on ? `Turn on ${nameOf(ask.f)}?` : `Turn off ${nameOf(ask.f)}?`} onClose={() => setAsk(null)} zIndex={90}>
      <div data-testid="social-on-confirm" onClick={(e) => e.stopPropagation()} style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.55, marginBottom: 16 }}>{ask.on
        ? "People on Helloo can find this profile, see its posts and status, and follow it. You can post, like and comment as it. Turn it off any time."
        : "Its profile, posts and status are hidden from everyone, and you can't post or comment as it, until you turn it on again. Nothing is deleted."}</div>
      <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}><HellooSecondary onClick={() => setAsk(null)}>Not now</HellooSecondary><span data-testid="social-on-go" style={{ display: "flex", flex: 1 }}><HellooPrimary disabled={Boolean(busy)} color={ask.on ? (T.positive || "#16A34A") : (T.negative || "#DC2626")} onClick={go}>{busy ? "…" : ask.on ? "Turn on" : "Turn off"}</HellooPrimary></span></div>
    </HellooSheet></div> : null}
  </div>;
}

function HellooSocialHome({ me, faces, photos, chats = [], onSendPost, openPost = "", onPostOpened, onCards, onOpenChat, onCall, onTip, onShopItem, onShop, onToast, composeTick, onPhoto }) {
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
  // Reels or videos, full screen ("reel" | "video" | ""), and My activity.
  const [reels, setReels] = useStateH40("");
  const [mine, setMine] = useStateH40(false);
  const [connectFor, setConnectFor] = useStateH40(null);
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
  const [unfollow, setUnfollow] = useStateH40(null);
  const [sharing, setSharing] = useStateH40(null);
  // Opened from a chat: fetch that one post and show it.
  useEffectH40(() => { if (!openPost) return; let live = true; socialApi.one(openPost).then((r) => { if (live && r.post) setOpen(r.post); }).catch((e) => onToast((e && e.message) || "That post is gone.")).then(() => { if (onPostOpened) onPostOpened(); }); return () => { live = false; }; }, [openPost]);
  const [profile, setProfile] = useStateH40(null);
  const [open, setOpen] = useStateH40(null);
  const [talk, setTalk] = useStateH40(null);
  const [more, setMore] = useStateH40(null);
  const [compose, setCompose] = useStateH40("");
  // The phone's Back closes what is open on top, newest first, before it
  // leaves Social (the Create sheet and other sheets say so themselves).
  useHellooBackLayer(view === "explore", () => setView("feed"));
  useHellooBackLayer(Boolean(reels), () => setReels(""));
  useHellooBackLayer(mine, () => setMine(false));
  useHellooBackLayer(Boolean(activity), () => setActivity(false));
  useHellooBackLayer(Boolean(profile), () => setProfile(null));
  useHellooBackLayer(Boolean(open), () => setOpen(null));
  useHellooBackLayer(Boolean(compose) && compose !== "pick", () => setCompose(""));
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
    setReelList((r) => (r ? Object.assign({}, r, { posts: up(r.posts) }) : r));
    setMineList((m) => (m ? Object.assign({}, m, { items: m.items.map((it) => (it.post && it.post.id === id ? Object.assign({}, it, { post: fn(it.post) }) : it)) }) : m));
  };
  const [reelList, setReelList] = useStateH40(null); // { format, posts, before, end }
  const [mineList, setMineList] = useStateH40(null); // { type, items }
  const drop = (id) => {
    const out = (list) => (list ? list.filter((p) => p.id !== id) : list);
    setFeed(out); setEx((e) => (e && !e.error ? Object.assign({}, e, { grid: out(e.grid), trending: out(e.trending), learn: out(e.learn) }) : e)); setProfile((pr) => (pr && pr.grid ? Object.assign({}, pr, { grid: out(pr.grid) }) : pr)); setOpen(null);
  };
  const openProfile = (card) => {
    setProfile({ card, loading: true });
    socialApi.profile(card.gloobalId, card.side === "self" ? "self" : "").then((r) => { setProfile({ card: r.profile, profile: r.profile, grid: r.grid || [] }); setFollows((f) => Object.assign({}, f, { [socialFollowKey(r.profile)]: r.profile.isFollowing })); seen([r.profile]); }).catch((err) => setProfile({ card, error: (err && err.message) || "Couldn't open that profile." }));
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
    // Follow / unfollow. The button flips at once and goes back if the server
    // says no — with the server's own reason (e.g. your profile is off).
    follow: (card, on) => { const was = act.isFollowing(card); const fk = socialFollowKey(card); setFollows((f) => Object.assign({}, f, { [fk]: on })); socialApi.follow(card.accountId, on, card.side).then((r) => { setFollows((f) => Object.assign({}, f, { [fk]: Boolean(r.following) })); setProfile((pr) => (pr && pr.profile && pr.profile.accountId === card.accountId && (pr.profile.side || "self") === (card.side || "self") ? Object.assign({}, pr, { profile: Object.assign({}, pr.profile, { isFollowing: r.following, followsMe: r.followsMe, followers: r.followers }) }) : pr && pr.profile && pr.profile.isMe && was !== Boolean(r.following) ? Object.assign({}, pr, { profile: Object.assign({}, pr.profile, { following: Math.max(0, (pr.profile.following || 0) + (r.following ? 1 : -1)) }) }) : pr)); onToast(r.following ? `Following ${card.handle || card.name || ""}`.trim() : "Unfollowed"); }).catch((e) => { setFollows((f) => Object.assign({}, f, { [fk]: was })); onToast((e && e.message) || (on ? "Couldn't follow right now." : "Couldn't unfollow right now.")); }); },
    askUnfollow: (card) => setUnfollow(card),
    followsMe: (card) => Boolean(card && card.followsMe),
    // (On a profile, `following` is how many it follows — a number, not a yes.)
    isFollowing: (card) => Boolean(card && (follows[socialFollowKey(card)] ?? (typeof card.following === "boolean" ? card.following : undefined) ?? card.isFollowing ?? false)),
    profile: openProfile,
    comments: (post) => setTalk(post),
    more: (post) => setMore(post),
    tip: (card) => onTip(card),
    shopItem: (item) => onShopItem(item),
    tag: (t) => { setProfile(null); setOpen(null); setQ(""); setTag(t); setView("explore"); },
    // Share: to people in Helloo (a card that opens the post for a signed-in
    // person), or a sealed note outside it.
    share: (post) => setSharing(post),
    // Share again to your followers, and keep for later (only you see it).
    repost: (post, on) => { patch(post.id, (p) => Object.assign({}, p, { reposted: on, reposts: Math.max(0, (p.reposts || 0) + (on ? 1 : -1)) })); socialApi.repost(post.id, on).then((r) => { patch(post.id, (p) => Object.assign({}, p, { reposted: r.reposted, reposts: r.reposts })); onToast(on ? "Shared to your followers" : "Taken back"); }).catch((e) => { patch(post.id, (p) => Object.assign({}, p, { reposted: !on, reposts: Math.max(0, (p.reposts || 0) + (on ? -1 : 1)) })); onToast((e && e.message) || "Couldn't do that."); }); },
    save: (post, on) => { patch(post.id, (p) => Object.assign({}, p, { saved: on, saves: Math.max(0, (p.saves || 0) + (on ? 1 : -1)) })); socialApi.save(post.id, on).then((r) => { patch(post.id, (p) => Object.assign({}, p, { saved: r.saved, saves: r.saves })); onToast(on ? "Saved · in My activity" : "Removed from saved"); }).catch(() => patch(post.id, (p) => Object.assign({}, p, { saved: !on, saves: Math.max(0, (p.saves || 0) + (on ? -1 : 1)) }))); },
    // Reels ⇄ Videos, one after another, full screen.
    reels: (format) => setReels(format === "video" ? "video" : "reel"),
    open: (post) => setOpen(post),
    mine: () => setMine(true),
    // From a reel to its full video.
    fullVideo: (reel) => { if (!reel.fullVideo) return; socialApi.one(reel.fullVideo).then((r) => { if (r && r.post) setOpen(r.post); }).catch(() => onToast("That video isn't up any more.")); }
  };
  const posted = (post) => {
    setCompose(""); setView("feed");
    if (post.story) { loadStories(); onToast("Your status is up for 24 hours"); return; }
    setFeed((f) => [post, ...(f || [])]); onToast("Posted");
  };

  const head = <div style={{ position: "sticky", top: 0, zIndex: 5, background: `${HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg}F2`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 8px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><span style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>{[["feed", "For you"], ["explore", "Explore"]].map(([k, l]) => <button key={k} onClick={() => setView(k)} data-testid={`social-view-${k}`} aria-current={view === k ? "page" : undefined} className="v2-tap" style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: view === k ? 22 : 17, fontWeight: 800, fontFamily: T.fontDisplay, color: view === k ? T.ink : T.inkFaint, letterSpacing: -0.4, whiteSpace: "nowrap" }}>{l}</button>)}</span><span style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}><button onClick={() => setReels("reel")} aria-label="Reels and videos" title="Reels and videos" data-testid="social-reels-open" className="v2-tap" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, flexShrink: 0 }}><SxReels size={21} color="currentColor" /></button><button onClick={() => setActivity(true)} aria-label={unread ? `Activity · ${unread} new` : "Activity"} data-testid="social-heart" className="v2-tap" style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, flexShrink: 0 }}><SxHeart size={22} color={unread ? "#E11D48" : "currentColor"} fill={unread ? "#E11D48" : "none"} style={{ transition: "color 0.2s ease, fill 0.2s ease" }} />{unread ? <span data-testid="social-heart-count" style={{ position: "absolute", top: -3, right: -4, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: T.negative || "#E23F45", color: "#fff", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg}` }}>{unread > 9 ? "9+" : unread}</span> : null}</button><button onClick={() => { loadAccounts(); setWho(true); }} aria-label={`Your social profiles · using ${face.kind === "shop" ? (face.handle || face.name) : "Personal"}${isOff ? " (off)" : ""}`} data-testid="social-me" className="v2-tap" style={{ position: "relative", width: 44, height: 44, padding: 0, border: "none", background: "none", cursor: "pointer", flexShrink: 0 }}>
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
    {activity ? <SocialActivity onMine={() => { setActivity(false); setMine(true); }} photos={photos} onBack={() => { setActivity(false); countActivity(); }} onSeen={() => setUnread(0)} onProfile={(c) => { setActivity(false); openProfile(c); }} act={act} /> : null}
    {profile ? <SocialProfile state={profile} me={me} photos={photos} act={act} onEdited={(patch) => setProfile((st) => st && st.profile ? Object.assign({}, st, { profile: Object.assign({}, st.profile, patch) }) : st)} onPhoto={onPhoto} onBack={() => setProfile(null)} onOpen={setOpen} onMessage={onOpenChat} onCall={onCall} onShop={onShop} onCompose={() => setCompose("pick")} /> : null}
    {reels ? <SocialReels format={reels} onFormat={setReels} list={reelList} setList={setReelList} photos={photos} act={act} muted={muted} onMuted={setMuted} onBack={() => setReels("")} /> : null}
    {mine ? <SocialMyActivity list={mineList} setList={setMineList} photos={photos} act={act} onBack={() => setMine(false)} /> : null}
    {open ? <SocialViewer post={open} photos={photos} act={act} muted={muted} onMuted={setMuted} onBack={() => setOpen(null)} /> : null}
    {talk ? <SocialComments post={talk} photos={photos} onCards={seen} onCount={(n) => patch(talk.id, (p) => Object.assign({}, p, { comments: n }))} onClose={() => setTalk(null)} onToast={onToast} onMention={(c) => { setTalk(null); setOpen(null); act.profile(c); }} /> : null}
    {connectFor ? <SocialFullVideoPick current={connectFor.fullVideo || ""} onClose={() => setConnectFor(null)} onPick={(v) => { const reel = connectFor; setConnectFor(null); socialApi.fullVideo(reel.id, v ? v.id : null).then((r) => { patch(reel.id, (p) => Object.assign({}, p, { fullVideo: r.fullVideo })); onToast(r.fullVideo ? "Full video connected · swipe across to it" : "Full video taken off"); }).catch((e) => onToast((e && e.message) || "Couldn't do that.")); }} /> : null}
    {more ? <HellooSheet label="Post" onClose={() => setMore(null)}><HellooCard>{(more.mine
      ? [...(more.format === "reel" ? [[SxVideo, more.fullVideo ? "Change the full video" : "Connect the full video", () => { const r = more; setMore(null); setConnectFor(r); }]] : []), [HlTrash, "Delete post", () => { const id = more.id; setMore(null); socialApi.remove(id).then(() => { drop(id); onToast("Post deleted"); }).catch((err) => onToast((err && err.message) || "Couldn't delete it.")); }, true]]
      : [[HlUser, "View profile", () => { const a = more.author; setMore(null); openProfile(a); }], [HlChat, "Message", () => { const a = more.author; setMore(null); onOpenChat(a); }], [HlFlag, "Report", () => { const id = more.id; setMore(null); socialApi.report(id, "").then(() => onToast("Reported · thank you")).catch(() => onToast("Couldn't report right now.")); }, true]]
    ).map(([Icon, title, fn, danger], i) => <HellooRow key={title} Icon={Icon} title={title} first={i === 0} onPress={fn} danger={danger} color={danger ? T.negative : T.accent} />)}</HellooCard></HellooSheet> : null}
    {story !== null && stories[story] ? <SocialStatusViewer people={stories} start={story} photos={photos} muted={muted} onMuted={setMuted} onClose={() => setStory(null)} onProfile={(c) => { setStory(null); openProfile(c); }} onDelete={(id) => { setStory(null); socialApi.remove(id).then(() => { loadStories(); onToast("Status removed"); }).catch(() => onToast("Couldn't remove it.")); }} /> : null}
    {who ? <SocialProfilesSheet me={me} list={list} face={face} photos={photos} accounts={accounts} onUse={useAs} onSet={setOn} onOpen={(f) => { setWho(false); if (f.as !== face.as) useAs(f); openProfile({ gloobalId: f.gloobalId || me.gloobalId, accountId: f.accountId || myId, name: f.name || me.name, side: f.kind === "shop" ? "shop" : "self" }); }} onClose={() => setWho(false)} /> : null}
    {filter ? <SocialFilter see={see} tag={tag} tags={(ex && ex.tags) || []} onClose={() => setFilter(false)} onSave={(nextSee, nextTag) => { socialSeeWrite(nextSee); setSee(nextSee); setTag(nextTag); setFilter(false); onToast(nextSee.length ? "Saved · Explore shows what you picked" : "Explore shows everything"); }} /> : null}
    {sharing ? <SocialShareSheet post={sharing} chats={chats} photos={photos} onClose={() => setSharing(null)} onToast={onToast} onSend={onSendPost} /> : null}
    {unfollow ? <HellooSheet title="Unfollow?" label="Unfollow" zIndex={70} onClose={() => setUnfollow(null)}><div data-testid="social-unfollow-sheet" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "4px 4px 6px", fontFamily: T.fontBody }}>
      <SocialFace card={unfollow} photos={photos} size={64} />
      <SocialName card={unfollow} size={16} />
      <div style={{ fontSize: 13.5, color: T.inkSoft, textAlign: "center", lineHeight: 1.45, maxWidth: 300 }}>Their posts and status stop showing first for you. They are not told, and you can follow again any time.</div>
      <button data-testid="social-unfollow-yes" onClick={() => { const c = unfollow; setUnfollow(null); act.follow(c, false); }} className="v2-tap" style={{ width: "100%", height: 48, marginTop: 6, borderRadius: 14, border: "none", background: `${T.negative}14`, color: T.negative, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Unfollow</button>
      <button onClick={() => setUnfollow(null)} className="v2-tap" style={{ width: "100%", height: 46, borderRadius: 14, border: "none", background: T.surfaceAlt, color: T.ink, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>Keep following</button>
    </div></HellooSheet> : null}
    {compose === "pick" ? <HellooSheet title="Create" onClose={() => setCompose("")}><div data-testid="social-create" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{SOCIAL_KINDS.map(([k, Icon, label, note]) => <span key={k} data-testid={k === "story" ? "social-add-status" : `social-add-${k}`} style={{ display: "flex", minWidth: 0 }}><button onClick={() => setCompose(k === "story" ? "status" : k)} className="v2-tap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px 14px 12px", borderRadius: 20, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody, minWidth: 0 }}><span style={{ width: 44, height: 44, borderRadius: 14, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={22} color={T.accent} /></span><span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{label}</span><span style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.35 }}>{note}</span></button></span>)}</div></HellooSheet> : null}
    {compose === "post" || compose === "reel" || compose === "video" || compose === "status" ? <SocialComposer photos={photos} kind={compose === "status" ? "story" : compose} onKind={(k) => setCompose(k === "story" ? "status" : k)} me={me} asName={face.kind === "shop" ? (face.handle || face.name) : (face.name || me.name)} status={compose === "status"} onClose={() => setCompose("")} onPosted={posted} onToast={onToast} /> : null}
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
      {(found.people || []).length ? <div style={{ padding: "8px 16px" }}><HellooCard>{found.people.map((c, i) => <SocialPersonRow key={c.accountId + c.side} card={c} photos={photos} first={i === 0} act={act} following={follows[socialFollowKey(c)]} />)}</HellooCard></div> : null}
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
  const cell = (key, inner, label, fn, testid, who) => <button key={key} onClick={fn} data-testid={testid} aria-label={label} className="v2-tap" style={{ flexShrink: 0, width: 68, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody }}>{inner}<span style={{ width: "100%", fontSize: 11.5, fontWeight: 700, color: T.ink, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{who ? <HellooNameB p={who} label={label} size={10.5} /> : label}</span></button>;
  return <div data-testid="social-status-row" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 16px 14px", scrollbarWidth: "none" }}>
    {cell("add", <span style={{ width: 62, height: 62, borderRadius: "50%", background: T.accentSoft, boxShadow: `inset 0 0 0 1.5px ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlPlus size={26} color={T.accent} /></span>, "Add", onAdd, "social-add")}
    {people.map((g, i) => cell(g.author.accountId + g.author.side, <span style={{ width: 62, height: 62, borderRadius: "50%", background: T.gradButton, padding: 2.5, boxSizing: "border-box", display: "flex" }}><span style={{ flex: 1, borderRadius: "50%", background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><SocialFace card={g.author} photos={photos} size={52} /></span></span>, g.mine ? "Your status" : (g.author.handle || g.author.name), () => onOpen(i), "social-status", g.mine ? null : g.author))}
  </div>;
}
function SocialStatusViewer({ people, start, photos, muted, onMuted, onClose, onProfile, onDelete, extra = null }) {
  useHellooBackLayer(true, onClose);
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
        {extra}{g.mine ? <button onClick={() => onDelete(it.id)} aria-label="Remove status" data-testid="social-status-remove" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlTrash size={17} color="#fff" /></button> : null}
        <button onClick={onClose} aria-label="Close" data-testid="social-status-close" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={19} color="#fff" /></button>
      </div>
    </div>
    {it.caption ? <div style={{ position: "absolute", left: 18, right: 18, bottom: "calc(34px + env(safe-area-inset-bottom, 0px))", color: "#fff", fontSize: 15, lineHeight: 1.4, textAlign: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{it.caption}</div> : null}
  </div>;
}
// Share a post. In Helloo: pick the chats, and each gets a card that opens
// the post (only for them, signed in). Outside: a sealed note with no
// picture and no link into the post.
function SocialShareSheet({ post, chats, photos, onClose, onToast, onSend }) {
  const [picked, setPicked] = useStateH40([]);
  const [q, setQ] = useStateH40("");
  const [busy, setBusy] = useStateH40(false);
  const text = "Sealed on GLOOBAL · a post for you. Open Helloo to see it.";
  const nameOf = (c) => c.savedName || c.person.handle || c.person.name || "";
  const list = (chats || []).filter((c) => !q.trim() || nameOf(c).toLowerCase().includes(q.trim().toLowerCase()));
  const flip = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 10 ? p : [...p, id]));
  const send = async () => {
    if (!picked.length || busy || !onSend) return;
    setBusy(true);
    let sent = 0; let why = "";
    for (const id of picked) { try { const r = await onSend(id, post); if (r) sent += 1; } catch (e) { why = (e && e.message) || why; } }
    setBusy(false);
    onToast(sent ? `Sent to ${sent} ${sent === 1 ? "chat" : "chats"}` : (why || "Couldn't send it right now."));
    if (sent) onClose();
  };
  const outside = async () => { try { if (navigator.share) await navigator.share({ title: "GLOOBAL", text, url: HELLOO_SITE }); else { await navigator.clipboard.writeText(`${text} ${HELLOO_SITE}`); onToast("Copied to share"); } } catch (e) { /* closed */ } };
  const copy = async () => { try { await navigator.clipboard.writeText(`${text} ${HELLOO_SITE}`); onToast("Copied"); } catch (e) { onToast("Couldn't copy"); } };
  const opt = (Icon, label, fn, testid) => <button onClick={fn} data-testid={testid} className="v2-tap" style={{ flex: 1, minWidth: 0, height: 46, borderRadius: 14, border: "none", background: T.surfaceAlt, color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}><Icon size={17} color={T.accent} />{label}</button>;
  return <HellooSheet title="Share" onClose={onClose} zIndex={70}><div data-testid="social-share" style={{ fontFamily: T.fontBody }}>
    {(chats || []).length ? <>
      <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999, padding: "9px 14px" }}><HlSearch size={16} color={T.inkFaint} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Send to…" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody }} /></label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6, marginTop: 12, maxHeight: 230, overflowY: "auto" }}>{list.map((c) => { const on = picked.includes(c.id); return <button key={c.id} onClick={() => flip(c.id)} aria-pressed={on} data-testid="social-share-chat" className="v2-tap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 2px", border: "none", background: "none", cursor: "pointer", fontFamily: T.fontBody, minWidth: 0 }}><span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", boxShadow: on ? `0 0 0 3px ${T.accent}` : "none" }}><HellooAvatar person={c.person} size={50} flag={false} />{on ? <span style={{ position: "absolute", right: -3, bottom: -3, width: 20, height: 20, borderRadius: "50%", background: T.accent, border: `2px solid ${T.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}><HlCheck size={11} color="#fff" strokeWidth={3} /></span> : null}</span><span style={{ maxWidth: "100%", fontSize: 11.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(c).split(" ")[0]}</span></button>; })}</div>
      {!list.length ? <div style={{ padding: "14px 0", textAlign: "center", fontSize: 13, color: T.inkSoft }}>No chat by that name.</div> : null}
      <span data-testid="social-share-send" style={{ display: "flex", marginTop: 12 }}><HellooPrimary onClick={send} disabled={!picked.length || busy}>{busy ? "Sending…" : picked.length ? `Send to ${picked.length}` : "Pick who to send it to"}</HellooPrimary></span>
    </> : <div style={{ padding: "6px 2px 4px", fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>Start a chat with someone and you can send posts to them here.</div>}
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>{opt(HlSend, "Outside Helloo", outside, "social-share-outside")}{opt(HlCopy, "Copy note", copy, "social-share-copy")}</div>
    <div style={{ fontSize: 11.5, color: T.inkFaint, lineHeight: 1.45, marginTop: 8, textAlign: "center" }}>Outside Helloo only a note goes — never the picture or a link into the post.</div>
  </div></HellooSheet>;
}

// One button for every name: Follow, Follow back (they follow you) or
// Following (tap to unfollow, after a yes).
function SocialFollowButton({ card, act, kind = "pill", testid = "social-follow" }) {
  if (!card || !card.accountId) return null;
  const following = act.isFollowing(card); const back = !following && act.followsMe(card);
  const label = following ? "Following" : back ? "Follow back" : "Follow";
  const go = (e) => { if (e) e.stopPropagation(); if (following) act.askUnfollow(card); else act.follow(card, true); };
  const common = { onClick: go, "data-testid": testid, "data-state": following ? "following" : back ? "back" : "follow", "aria-pressed": following, className: "v2-tap" };
  if (kind === "link") return <button {...common} style={{ flexShrink: 0, border: "none", background: "none", color: T.accent, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, padding: "6px 2px", whiteSpace: "nowrap" }}>{label}</button>;
  if (kind === "glass") return <button {...common} style={{ flexShrink: 0, height: 28, padding: "0 12px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.85)", background: following ? "rgba(255,255,255,0.18)" : "transparent", color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{label}</button>;
  if (kind === "wide") return <button {...common} style={{ flex: 1, minWidth: 0, height: 44, padding: "0 12px", borderRadius: 14, border: following ? `1px solid ${T.line}` : "none", background: following ? T.surface : T.gradButton, color: following ? T.ink : (HT.onAccent || "#fff"), fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: following ? "none" : HT.shadowBtn || "none" }}>{following ? <HlCheck size={16} color={T.ink} style={{ flexShrink: 0 }} /> : null}{label}</button>;
  return <button {...common} style={{ flexShrink: 0, height: 32, padding: "0 14px", borderRadius: 10, border: following ? `1px solid ${T.line}` : "none", background: following ? "none" : T.accent, color: following ? T.ink : (HT.onAccent || "#fff"), fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}>{label}</button>;
}

// Followers and Following: two lists behind the counts on a profile.
function SocialPeopleList({ of, which, onWhich, photos, act, onBack }) {
  const [data, setData] = useStateH40({});
  const [err, setErr] = useStateH40("");
  useEffectH40(() => { let live = true; if (data[which]) return undefined; setErr(""); socialApi.people(of.gloobalId, which, of.side).then((r) => { if (live) setData((d) => Object.assign({}, d, { [which]: r.people || [] })); }).catch((e) => { if (live) setErr((e && e.message) || "Couldn't load."); }); return () => { live = false; }; }, [which, of.gloobalId]);
  const list = data[which];
  const tab = (k, label, n) => <button key={k} onClick={() => onWhich(k)} data-testid={`social-people-tab-${k}`} aria-pressed={which === k} className="v2-tap" style={{ flex: 1, height: 40, border: "none", borderBottom: `2.5px solid ${which === k ? T.ink : "transparent"}`, background: "none", color: which === k ? T.ink : T.inkSoft, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{typeof n === "number" ? `${socialCount(n)} ` : ""}{label}</button>;
  return <div data-testid="social-people" style={{ position: "absolute", inset: 0, zIndex: 45, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <HellooTop left={<HellooRoundButton Icon={HlBack} label="Back" onClick={onBack} size={38} />} title={<SocialName card={of} size={17} />} />
    <div style={{ display: "flex", padding: "0 16px", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>{tab("followers", "followers", of.followers)}{tab("following", "following", of.following)}</div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "10px 16px 30px" }}>
      {err ? <SocialNote title="Couldn't load" text={err} /> : !list ? <SocialNote title="Loading…" /> : !list.length ? <SocialNote title={which === "followers" ? "No followers yet" : "Not following anyone yet"} text={which === "followers" ? "People who follow this profile show here." : "People this profile follows show here."} /> : <HellooCard>{list.map((c, i) => <SocialPersonRow key={c.accountId + c.side} card={c} photos={photos} first={i === 0} act={{ ...act, profile: (card) => { onBack(); act.profile(card); } }} />)}</HellooCard>}
    </div>
  </div>;
}

function SocialPersonRow({ card, photos, first, act }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: first ? "none" : `1px solid ${T.line}` }}><button onClick={() => act.profile(card)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><SocialFace card={card} photos={photos} size={42} /><span style={{ flex: 1, minWidth: 0 }}><SocialName card={card} /><span style={{ display: "block", fontSize: 12, color: T.inkSoft }}>{card.side === "shop" ? "Shop" : "Person"}</span></span></button>{card.isMe ? null : <SocialFollowButton card={card} act={act} />}</div>;
}

// ── A profile ───────────────────────────────────────────────────────────
// Highlights: a row of your kept statuses under the profile, like albums.
// Yours: + New, pick from all your statuses (even old ones), give it a name.
function SocialHighlights({ p, card, photos, act }) {
  const [list, setList] = useStateH40(null);
  const [view, setView] = useStateH40(null); // { title, items, mine, id }
  const [making, setMaking] = useStateH40(false);
  const [muted, setMuted] = useStateH40(true);
  const load = useCallbackH40(() => { socialApi.highlights(p.gloobalId, p.side).then((r) => setList(r.highlights || [])).catch(() => setList([])); }, [p.gloobalId, p.side]);
  useEffectH40(() => { load(); }, [load]);
  const open = (h) => socialApi.highlight(h.id).then((r) => { if ((r.stories || []).length) setView({ id: h.id, title: h.title, items: r.stories, mine: r.highlight && r.highlight.mine }); }).catch((e) => act.toast && act.toast((e && e.message) || "Couldn't open it."));
  if (!list || (!list.length && !p.isMe)) return null;
  const ring = (child, on) => <span style={{ width: 68, height: 68, borderRadius: "50%", padding: 3, boxSizing: "border-box", background: on ? `conic-gradient(${T.accent}, #DB2777, #F59E0B, ${T.accent})` : T.line, display: "flex", flexShrink: 0 }}><span style={{ flex: 1, borderRadius: "50%", padding: 2, background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex" }}><span style={{ flex: 1, borderRadius: "50%", overflow: "hidden", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>{child}</span></span></span>;
  return <>
    <div data-testid="social-highlights" style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "14px 18px 2px" }}>
      {p.isMe ? <button type="button" onClick={() => setMaking(true)} data-testid="social-highlight-new" className="v2-tap" style={{ flexShrink: 0, width: 70, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.fontBody }}><span style={{ width: 68, height: 68, borderRadius: "50%", border: `2px dashed ${T.inkFaint}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}><HlPlus size={24} color={T.ink} /></span><span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>New</span></button> : null}
      {list.map((h) => <button key={h.id} type="button" onClick={() => open(h)} data-testid="social-highlight" className="v2-tap" style={{ flexShrink: 0, width: 70, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.fontBody }}>{ring(h.cover ? (h.cover.kind === "video" ? <video src={socialMediaSrc(h.cover)} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={socialMediaSrc(h.cover)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : <SxStory size={22} color={T.inkSoft} />, true)}<span style={{ maxWidth: "100%", fontSize: 12, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</span></button>)}
    </div>
    {view ? <SocialStatusViewer people={[{ author: Object.assign({}, card, { highlightTitle: view.title }), items: view.items, mine: false }]} start={0} photos={photos} muted={muted} onMuted={setMuted} onClose={() => setView(null)} onProfile={() => setView(null)} onDelete={() => {}} extra={view.mine ? <button onClick={() => { const id = view.id; setView(null); socialApi.dropHighlight(id).then(() => { load(); act.toast && act.toast("Highlight removed"); }).catch(() => {}); }} aria-label="Remove highlight" data-testid="social-highlight-remove" className="v2-tap" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlTrash size={17} color="#fff" /></button> : null} /> : null}
    {making ? <SocialHighlightMaker onClose={() => setMaking(false)} onMade={() => { setMaking(false); load(); act.toast && act.toast("Highlight added"); }} /> : null}
  </>;
}
function SocialHighlightMaker({ onClose, onMade }) {
  const [all, setAll] = useStateH40(null);
  const [picked, setPicked] = useStateH40([]);
  const [title, setTitle] = useStateH40("");
  const [busy, setBusy] = useStateH40(false);
  const [err, setErr] = useStateH40("");
  useEffectH40(() => { socialApi.archive().then((r) => setAll(r.stories || [])).catch((e) => { setAll([]); setErr((e && e.message) || "Couldn't load your statuses."); }); }, []);
  const save = async () => { if (!picked.length || busy) return; setBusy(true); setErr(""); try { await socialApi.addHighlight(title.trim() || "Highlights", picked); onMade(); } catch (e) { setErr((e && e.message) || "Couldn't save."); setBusy(false); } };
  const day = (d) => { try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" }); } catch (e) { return ""; } };
  return <HellooSheet title="New highlight" onClose={onClose}>
    <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 24))} placeholder="Name it (e.g. Travel)" aria-label="Highlight name" data-testid="social-highlight-title" style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 14, border: `1.5px solid ${T.line}`, padding: "0 14px", fontSize: 15, fontWeight: 700, color: T.ink, background: HT.cardBg || T.surface, outline: "none", fontFamily: T.fontBody }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 2px 8px" }}><span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.4, textTransform: "uppercase" }}>Your statuses</span><span style={{ fontSize: 12, fontWeight: 800, color: picked.length ? T.accent : T.inkFaint }}>{picked.length} picked</span></div>
    {all === null ? <div style={{ padding: 20, textAlign: "center", color: T.inkSoft, fontSize: 13 }}>Loading…</div> : !all.length ? <div style={{ padding: "18px 10px", textAlign: "center", color: T.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>Share a status first. Every status you share stays here for you, even after 24 hours, so you can keep the best ones.</div>
      : <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, maxHeight: 320, overflowY: "auto" }}>{all.map((x) => { const m = (x.media || [])[0]; const n = picked.indexOf(x.id); const on = n >= 0; return <button key={x.id} type="button" onClick={() => setPicked((ps) => (on ? ps.filter((y) => y !== x.id) : [...ps, x.id].slice(0, 100)))} aria-pressed={on} data-testid="social-highlight-pick" className="v2-tap" style={{ position: "relative", aspectRatio: "9 / 14", borderRadius: 12, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", background: "#000", outline: on ? `3px solid ${T.accent}` : "none", outlineOffset: -3 }}>{m ? (m.kind === "video" ? <video src={socialMediaSrc(m)} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={socialMediaSrc(m)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : null}<span style={{ position: "absolute", left: 6, bottom: 5, fontSize: 11, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{day(x.at || x.createdAt)}</span><span style={{ position: "absolute", right: 6, top: 6, width: 22, height: 22, borderRadius: "50%", background: on ? T.accent : "rgba(0,0,0,0.3)", border: "2px solid #fff", boxSizing: "border-box", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{on ? n + 1 : ""}</span></button>; })}</div>}
    {err ? <div role="alert" style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: T.negative }}>{err}</div> : null}
    <div style={{ display: "flex", marginTop: 14 }}><span data-testid="social-highlight-save" style={{ display: "flex", flex: 1 }}><HellooPrimary disabled={!picked.length || busy} onClick={save}>{busy ? "Saving…" : "Add to profile"}</HellooPrimary></span></div>
  </HellooSheet>;
}

// Edit your social profile: cover, picture, and a few words about you.
// Yourself: the picture is your live GLOOBAL face (changed in GLOOBAL, with
// the camera check). A shop: its logo, from the gallery.
function SocialProfileEditor({ p, card, photos, onClose, onSaved, onPhoto, onToast }) {
  const shop = p.side === "shop";
  const [bio, setBio] = useStateH40(p.bio || "");
  const [cover, setCover] = useStateH40(p.cover ? { preview: "", id: p.cover.id } : null);
  const savedCover = useSocialFaceSrc(p.cover);
  const [logo, setLogo] = useStateH40(null); // new data URL
  // A person's own Social picture: undefined = unchanged, null = back to the
  // GLOOBAL face, { preview, file } = a new one from the gallery.
  const [pic, setPic] = useStateH40(undefined);
  const picIn = useRefH40(null);
  const pickPic = (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return; if (!/^image\//.test(f.type)) { setErr("Pick a photo for your picture."); return; } setErr(""); setPic({ preview: URL.createObjectURL(f), file: f }); };
  const [busy, setBusy] = useStateH40("");
  const [err, setErr] = useStateH40("");
  const coverIn = useRefH40(null); const logoIn = useRefH40(null);
  const hue = hellooHue(card.accountId || card.name || "");
  const pickCover = async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return; if (!/^image\//.test(f.type)) { setErr("Pick a photo for the cover."); return; } setErr(""); setCover({ preview: URL.createObjectURL(f), file: f }); };
  const pickLogo = async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return; try { const raw = await socialShrinkPhoto(f); const fit = typeof fitProfilePhotoForUpload === "function" ? await fitProfilePhotoForUpload(raw) : raw; setLogo(fit); setErr(""); } catch (x) { setErr("Couldn't read that picture."); } };
  const left = 150 - [...bio].length;
  const changed = pic !== undefined || bio !== (p.bio || "") || Boolean(logo) || (cover ? cover.file || (!p.cover) : Boolean(p.cover));
  const save = async () => {
    if (busy || left < 0) return;
    setErr("");
    try {
      const body = {};
      if (bio !== (p.bio || "")) body.bio = bio;
      if (cover && cover.file) { setBusy("Sending the cover…"); const data = await socialShrinkPhoto(cover.file); const r = await socialApi.upload(data); body.cover = r.id; socialFaceCache.set(String(r.id), data); }
      else if (!cover && p.cover) body.cover = null;
      if (logo) body.photo = logo;
      if (pic && pic.file) { setBusy("Sending your picture…"); const data = await socialShrinkPhoto(pic.file); const r = await socialApi.upload(data); body.picture = r.id; socialFaceCache.set(String(r.id), data); }
      else if (pic === null) body.picture = null;
      setBusy("Saving…");
      const r = Object.keys(body).length ? await socialApi.editProfile(body) : {};
      if (logo && onPhoto) onPhoto(logo);
      onSaved(Object.assign({}, r.bio !== undefined ? { bio: r.bio } : {}, r.cover !== undefined ? { cover: r.cover } : {}, pic !== undefined ? { picture: r.picture || undefined } : {}));
      onToast && onToast("Profile saved");
      onClose();
    } catch (x) { setErr((x && x.message) || "Couldn't save. Try again."); }
    setBusy("");
  };
  const lbl = (t, right) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 2px 7px" }}><span style={{ fontSize: 12, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.4, textTransform: "uppercase" }}>{t}</span>{right}</div>;
  return <HellooSheet title="Edit profile" onClose={onClose}>
    <input ref={coverIn} type="file" accept="image/*" onChange={pickCover} style={{ display: "none" }} data-testid="social-edit-cover-file" />
    <input ref={picIn} type="file" accept="image/*" onChange={pickPic} style={{ display: "none" }} data-testid="social-edit-picture-file" />
    {/* Pictures show only after "Confirm it's you" (good for 5 minutes). */}
    <GloobalSealedGate onSetup={() => { try { window.open("https://gloobalv3.netlify.app/", "_blank", "noopener"); } catch (e) { /* fine */ } }} />
    <input ref={logoIn} type="file" accept="image/*" onChange={pickLogo} style={{ display: "none" }} data-testid="social-edit-logo-file" />
    <div data-testid="social-edit" style={{ position: "relative" }}>
      <button type="button" onClick={() => coverIn.current && coverIn.current.click()} data-testid="social-edit-cover" aria-label="Change cover photo" className="v2-tap" style={{ position: "relative", width: "100%", height: 120, borderRadius: 20, border: "none", padding: 0, ...HELLOO_SMOOTH_CLIP, cursor: "pointer", background: cover ? `center / cover no-repeat url(${cover.preview || savedCover})` : `linear-gradient(135deg, ${hue}99 0%, ${hue} 60%, ${hue}CC 100%)`, display: "block" }}>
        <span style={{ position: "absolute", right: 10, bottom: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 12.5, fontWeight: 800 }}><HlCamera size={15} color="#fff" />{cover ? "Change cover" : "Add cover"}</span>
      </button>
      {cover ? <button type="button" onClick={() => setCover(null)} aria-label="Remove cover" className="v2-tap" style={{ position: "absolute", right: 10, top: 10, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={16} color="#fff" /></button> : null}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "0 12px", marginTop: -34 }}>
        <span style={{ position: "relative", padding: 4, borderRadius: "50%", background: HT.cardBg || T.surface, display: "flex" }}>
          {logo || (pic && pic.preview) ? <img src={logo || pic.preview} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} /> : <SocialFace card={pic === null ? Object.assign({}, card, { picture: null }) : card} photos={photos} size={72} />}
          {!shop ? <button type="button" onClick={() => picIn.current && picIn.current.click()} data-testid="social-edit-picture" aria-label="Change your picture" className="v2-tap" style={{ position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${HT.cardBg || T.surface}`, background: T.gradButton, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><HlCamera size={14} color={HT.onAccent || "#fff"} /></button> : null}
          {shop ? <button type="button" onClick={() => logoIn.current && logoIn.current.click()} data-testid="social-edit-logo" aria-label="Change shop logo" className="v2-tap" style={{ position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${HT.cardBg || T.surface}`, background: T.gradButton, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><HlCamera size={14} color={HT.onAccent || "#fff"} /></button> : null}
        </span>
        <span style={{ flex: 1, minWidth: 0, alignSelf: "flex-start", paddingTop: 42, paddingBottom: 2, fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>{shop ? "Tap the camera to change the shop's logo." : <>For Social only, from your gallery.{(pic === undefined ? card.picture : pic) ? <><br /><button type="button" onClick={() => setPic(null)} data-testid="social-edit-picture-remove" style={{ border: "none", background: "none", padding: 0, color: T.accent, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: T.fontBody }}>Use my GLOOBAL face</button></> : null}</>}</span>
      </div>
    </div>
    {lbl("About you", <span style={{ fontSize: 12, fontWeight: 800, color: left < 0 ? T.negative : left < 20 ? "#D97706" : T.inkFaint }}>{left}</span>)}
    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200} placeholder={shop ? "What you sell, where, and when you're open" : "A few words about you"} aria-label="About you" data-testid="social-edit-bio" style={{ width: "100%", boxSizing: "border-box", resize: "none", borderRadius: 16, border: `1.5px solid ${T.line}`, padding: "12px 14px", fontSize: 15, lineHeight: 1.45, color: T.ink, background: HT.cardBg || T.surface, outline: "none", fontFamily: T.fontBody }} />
    <div style={{ fontSize: 11.5, color: T.inkFaint, margin: "6px 2px 0" }}>No links: people message you on Helloo.</div>
    {err ? <div role="alert" style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: T.negative }}>{err}</div> : null}
    <div style={{ display: "flex", marginTop: 16 }}><span data-testid="social-edit-save" style={{ display: "flex", flex: 1 }}><HellooPrimary disabled={!changed || Boolean(busy) || left < 0} onClick={save}>{busy || "Save"}</HellooPrimary></span></div>
  </HellooSheet>;
}

function SocialProfile({ state, me, photos, act, onBack, onOpen, onMessage, onCall, onShop, onCompose, onEdited, onPhoto }) {
  // Work: a full screen over the profile (find, edit, post), and a count
  // that makes the Work tab load again after a change there.
  const [workOpen, setWorkOpen] = useStateH40("");
  const [workTick, setWorkTick] = useStateH40(0);
  const [editing, setEditing] = useStateH40(false);
  useHellooBackLayer(Boolean(workOpen), () => setWorkOpen(""));
  const [tab, setTab] = useStateH40("posts");
  const p = state.profile;
  const card = p || state.card;
  const coverSrc = useSocialFaceSrc(p && p.cover);
  const hue = hellooHue(card.accountId || card.name || "");
  const [people, setPeople] = useStateH40("");
  useHellooBackLayer(Boolean(people), () => setPeople(""));
  const stat = (n, l, fn) => { const Tag = fn ? "button" : "span"; return <Tag onClick={fn} data-testid={fn ? `social-stat-${l}` : undefined} className={fn ? "v2-tap" : undefined} style={{ flex: 1, textAlign: "center", minWidth: 0, border: "none", background: "none", padding: 0, cursor: fn ? "pointer" : "default", fontFamily: T.fontBody }}><span style={{ display: "block", fontSize: 18, fontWeight: 800, color: T.ink }}>{socialCount(n)}</span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft }}>{l}</span></Tag>; };
  const fmt = (x) => x.format || (x.media[0] && x.media[0].kind === "video" ? "video" : "post");
  const grid = (state.grid || []).filter((x) => tab === "posts" || (tab === "reels" ? fmt(x) === "reel" : tab === "videos" ? fmt(x) === "video" : true));
  // Message, Call and Tip: icons only, each in its own colour.
  const icon = (Icon, label, fn, color) => <button key={label} onClick={fn} aria-label={label} title={label} data-testid={`social-profile-${label.toLowerCase()}`} className="v2-tap" style={{ width: 48, height: 44, flexShrink: 0, borderRadius: 14, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><Icon size={21} color={T.ink} strokeWidth={1.9} /></button>;
  const btn = (Icon, label, fn, primary) => <button onClick={fn} className="v2-tap" style={{ flex: primary ? 1.4 : 1, minWidth: 0, height: 44, borderRadius: 14, border: "none", background: primary ? T.gradButton : (HT.cardBg || T.surface), boxShadow: primary ? "none" : (HT.cardShadow ?? T.shadowCard), color: primary ? (HT.onAccent || "#fff") : T.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, whiteSpace: "nowrap" }}>{Icon ? <Icon size={16} color={primary ? (HT.onAccent || "#fff") : T.accent} /> : null}{label}</button>;
  return <><div data-testid="social-profile" style={{ position: "absolute", inset: 0, zIndex: 40, background: HT.screenBg || T.bg, overflowY: "auto", fontFamily: T.fontBody }}>
    <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}><GloobalSealedGate onSetup={() => { try { window.open("https://gloobalv3.netlify.app/", "_blank", "noopener"); } catch (e) { /* fine */ } }} /></div>
    <div data-testid="social-cover" style={{ position: "relative", height: 150, margin: "calc(8px + env(safe-area-inset-top, 0px)) 8px 0", background: p && p.cover ? `${hue} center / cover no-repeat url(${coverSrc})` : `linear-gradient(135deg, ${hue}99 0%, ${hue} 60%, ${hue}CC 100%)`, borderRadius: 28, overflow: "hidden", isolation: "isolate", transform: "translateZ(0)", boxShadow: `0 14px 30px -18px ${hue}` }}>{p && p.isMe ? <button type="button" onClick={() => setEditing(true)} aria-label="Change cover" className="v2-tap" style={{ position: "absolute", right: 12, bottom: 12, zIndex: 2, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlCamera size={17} color="#fff" /></button> : null}<span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 120% at 100% 0%, rgba(255,255,255,0.35) 0%, transparent 55%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.18) 100%)" }} /><div style={{ position: "absolute", left: 12, top: 12 }}><button onClick={onBack} aria-label="Back" className="v2-tap" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlBack size={19} color="#fff" /></button></div></div>
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 12, padding: "0 18px", marginTop: -46 }}><span style={{ padding: 4, borderRadius: "50%", background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex" }}><SocialFace card={card} photos={photos} size={88} /></span><span style={{ display: "flex", flex: 1, paddingBottom: 6, minWidth: 0 }}>{p ? <>{stat(p.posts, "posts")}{stat(p.followers, "followers", () => setPeople("followers"))}{stat(p.following, "following", () => setPeople("following"))}</> : null}</span></div>
    <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "flex-start", gap: 10 }}><span style={{ flex: 1, minWidth: 0 }}><SocialName card={card} size={19} />{p && typeof p.visitors === "number" && (p.isMe || p.visitors >= 10) ? <div data-testid="social-visitors" title="Different people who have visited this shop" style={{ display: "flex", width: "fit-content", maxWidth: "100%", whiteSpace: "nowrap", alignItems: "center", gap: 6, marginTop: 6, padding: "4px 10px", borderRadius: 999, background: T.surfaceAlt, color: T.ink, fontSize: 12, fontWeight: 800 }}><SxViews size={13} color={T.accent} strokeWidth={2.6} />{socialCount(p.visitors)} {p.visitors === 1 ? "visitor" : "visitors"}<span style={{ color: T.inkFaint, fontWeight: 700 }}>· different people</span></div> : null}{card.handle && card.name && card.name !== card.handle ? <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 3 }}>{card.name}</div> : null}{p && p.bio ? <div data-testid="social-bio" style={{ fontSize: 14, color: T.ink, marginTop: 7, lineHeight: 1.45, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{p.bio}</div> : p && p.isMe ? <button type="button" onClick={() => setEditing(true)} className="v2-tap" style={{ marginTop: 7, border: "none", background: "none", padding: 0, color: T.accent, fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>+ Add a few words about you</button> : null}</span></div>
    {state.error ? <SocialNote title="Couldn't open this profile" text={state.error} /> : !p ? <SocialNote title="Loading…" /> : <>
      {p.isMe ? <div style={{ height: 10 }} /> : <div style={{ display: "flex", gap: 8, padding: "14px 18px 4px" }}><><SocialFollowButton card={p} act={act} kind="wide" testid="social-profile-follow" />{icon(HlChat, "Message", () => onMessage(p), T.accent)}{onCall ? icon(HlPhone, "Call", () => onCall(p), HT.free) : null}{icon(SxCoins, "Tip", () => act.tip(p), "#D97706")}</></div>}
      <SocialHighlights p={p} card={card} photos={photos} act={act} />
      <div style={{ display: "flex", margin: "12px 18px 0", padding: 4, borderRadius: 14, background: T.surfaceAlt }}>{[["posts", SxGrid, "Posts"], ["reels", SxReels, "Reels"], ["videos", SxVideo, "Videos"], ["work", WxBag, "Work"], p.side === "shop" ? ["shop", HlStore, "Shop"] : null].filter(Boolean).map(([k, I, l]) => { const on = tab === k; return <button key={k} onClick={() => (k === "shop" ? onShop(p) : setTab(k))} data-testid={`social-tab-${k}`} aria-pressed={on} aria-label={l} title={l} className="v2-tap" style={{ flex: 1, minWidth: 0, height: 40, borderRadius: 10, border: "none", background: on ? (HT.cardBg || T.surface) : "transparent", boxShadow: on ? T.shadowCard : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12.5, fontWeight: 800, color: on ? T.ink : T.inkSoft, cursor: "pointer", fontFamily: T.fontBody }}><I size={21} color={on ? T.ink : T.inkSoft} strokeWidth={on ? 2.3 : 1.9} /></button>; })}</div>
      {tab === "work" ? <WorkTab p={p} card={card} photos={photos} tick={workTick} onOpen={setWorkOpen} onMessage={() => onMessage(p)} onChat={(who, draft) => onMessage(who, draft)} onToast={act.toast || (() => {})} /> : <div style={{ paddingTop: 10 }}>{grid.length ? <SocialGrid posts={grid} onOpen={onOpen} /> : <SocialNote title={tab === "reels" ? (p.isMe ? "Share your first reel" : "No reels yet") : tab === "videos" ? (p.isMe ? "Share your first video" : "No videos yet") : p.isMe ? "Share your first post" : "No posts yet"} text={p.isMe ? (tab === "reels" ? "Short videos, up to 90 seconds." : tab === "videos" ? "Longer videos show here." : "Pictures, reels and videos show here.") : ""} />}</div>}
      <div style={{ height: 120 }} /></>}
  </div>{p && p.isMe && !workOpen ? <div data-testid="social-profile-fabs" style={{ position: "absolute", right: 18, bottom: "calc(22px + env(safe-area-inset-bottom, 0px))", zIndex: 41, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    {act.mine ? <button type="button" onClick={act.mine} aria-label="My activity" title="My activity" data-testid="social-profile-mine" className="v2-tap" style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: HT.cardBg || T.surface, boxShadow: "0 8px 22px -8px rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><SxMine size={20} color={T.ink} /></button> : null}
    <button type="button" onClick={() => setEditing(true)} aria-label="Edit profile" title="Edit profile" data-testid="social-profile-edit" className="v2-tap" style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: HT.cardBg || T.surface, boxShadow: "0 8px 22px -8px rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><HlPencil size={19} color={T.ink} /></button>
    <button type="button" onClick={onCompose} aria-label="New post" title="New post" data-testid="social-profile-new" className="v2-tap" style={{ width: 60, height: 60, borderRadius: "50%", border: "none", background: T.gradButton, boxShadow: `0 12px 26px -10px ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><HlPlus size={28} color={HT.onAccent || "#fff"} strokeWidth={2.4} /></button>
  </div> : null}{people && p ? <SocialPeopleList of={p} which={people} onWhich={setPeople} photos={photos} act={act} onBack={() => setPeople("")} /> : null}{workOpen ? <HellooWorkScreen start={workOpen} photos={photos} shopName={p && p.isMe && p.side === "shop" ? (card.handle || card.name) : ""} onClose={() => setWorkOpen("")} onChanged={() => setWorkTick((t) => t + 1)} onChat={(who, draft) => { setWorkOpen(""); onMessage(who, draft); }} onToast={act.toast || (() => {})} /> : null}{editing && p ? <SocialProfileEditor p={p} card={card} photos={photos} onClose={() => setEditing(false)} onSaved={(patch) => onEdited && onEdited(patch)} onPhoto={(data) => onPhoto && onPhoto(p.side === "shop" ? "logo:" + card.accountId : card.accountId, data)} onToast={act.toast} /> : null}</>;
}

// ── One post, full screen ───────────────────────────────────────────────
function SocialViewer({ post, photos, act, muted, onMuted, onBack, embedded = false, top = null }) {
  // A reel with its full video: swipe across (either way) to watch all of it.
  const across = useRefH40(null);
  const onAcrossStart = (e) => { const t = e.touches && e.touches[0]; across.current = t ? { x: t.clientX, y: t.clientY } : null; };
  const onAcrossEnd = (e) => {
    const st = across.current; across.current = null;
    const t = e.changedTouches && e.changedTouches[0];
    if (!st || !t || !post.fullVideo) return;
    const dx = t.clientX - st.x, dy = t.clientY - st.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) * 0.6) act.fullVideo(post);
  };
  const m = post.media || [];
  const video = m[0] && m[0].kind === "video";
  const tag = (post.tags || [])[0];
  // One column on the right: every icon in the same round, every count
  // under it on the same line, so they sit straight whatever the numbers.
  // One column on the right, like the reels apps: plain white icons (no
  // round behind them) with the count right under each, all in one line.
  const side = (I, n, fn, fill, label, testid, pressed) => { const Tag = fn ? "button" : "span"; return <Tag onClick={fn || undefined} aria-label={label} aria-pressed={pressed} data-testid={testid} className={fn ? "v2-tap" : undefined} style={{ width: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#fff", fontSize: 12.5, fontWeight: 800, lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.6)", border: "none", background: "none", padding: 0, cursor: fn ? "pointer" : "default", fontFamily: T.fontBody, fontVariantNumeric: "tabular-nums" }}><I size={30} color={fill || "#fff"} fill={fill && I !== SxRepost ? fill : "none"} strokeWidth={fill && I === SxRepost ? 2.6 : 1.9} style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.55))" }} /><span style={{ minHeight: 13 }}>{n}</span></Tag>; };
  return <div data-testid="social-viewer" onTouchStart={onAcrossStart} onTouchEnd={onAcrossEnd} style={{ position: "absolute", inset: 0, zIndex: embedded ? 1 : 50, background: "#000", overflow: "hidden", fontFamily: T.fontBody }}>
    {/* No picture without "Confirm it's you": say so here, not a black screen. */}
    <div style={{ position: "absolute", left: 10, right: 10, top: "34%", zIndex: 6 }}><GloobalSealedGate onSetup={() => { try { window.open("https://gloobalv3.netlify.app/", "_blank", "noopener"); } catch (e) { /* fine */ } }} /></div>
    {video ? <SocialVideo src={socialMediaSrc(m[0])} muted={muted} onMuted={onMuted} /> : <div style={{ display: "flex", width: "100%", height: "100%", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>{m.map((x) => <img key={x.id} src={socialMediaSrc(x)} alt="" style={{ flex: "0 0 100%", width: "100%", height: "100%", objectFit: "contain", scrollSnapAlign: "start" }} />)}</div>}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 55%, rgba(0,0,0,0.75) 100%)", pointerEvents: "none" }} />
    {top}
    <button onClick={onBack} aria-label="Back" className="v2-tap" style={{ position: "absolute", zIndex: 3, left: 12, top: "calc(12px + env(safe-area-inset-top, 0px))", width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlBack size={21} color="#fff" /></button>
    <div data-testid="social-viewer-side" style={{ position: "absolute", right: 6, bottom: `calc(${tag ? 100 : 26}px + env(safe-area-inset-bottom, 0px))`, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      {side(SxHeart, socialCount(post.likes), () => act.like(post, !post.liked), post.liked ? "#E11D48" : null, post.liked ? "Unlike" : "Like", "social-viewer-like", Boolean(post.liked))}
      {side(SxComment, socialCount(post.comments), () => act.comments(post), null, "Comments", "social-viewer-comments")}
      {side(SxRepost, socialCount(post.reposts || 0), post.mine ? null : () => act.repost(post, !post.reposted), post.reposted ? "#22C55E" : null, post.reposted ? "Take back your repost" : "Repost to your followers", "social-viewer-repost", Boolean(post.reposted))}
      {side(HlSend, "", () => act.share(post), null, "Share", "social-viewer-share")}
      {side(SxSave, socialCount(post.saves || 0), () => act.save(post, !post.saved), post.saved ? "#FACC15" : null, post.saved ? "Remove from saved" : "Save", "social-viewer-save", Boolean(post.saved))}
      {side(SxViews, socialCount(post.views || 0), null, null, `${post.views || 0} ${(post.views || 0) === 1 ? "person" : "people"} saw this`, "social-viewer-views")}
      {!post.mine ? side(SxCoins, "", () => act.tip(post.author), null, "Tip", "social-viewer-tip") : null}
      {side(SxLines, "", () => act.more(post), null, "More", "social-viewer-more")}
    </div>
    <div style={{ position: "absolute", left: 16, right: 76, bottom: `calc(${tag ? 100 : 30}px + env(safe-area-inset-bottom, 0px))`, color: "#fff" }}>{post.fullVideo ? <button type="button" data-testid="social-viewer-fullvideo" onClick={() => act.fullVideo(post)} aria-label="Watch the full video" className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 32, padding: "0 12px 0 10px", marginBottom: 10, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}><SxVideo size={16} color="#fff" />Full video<HlChevron size={15} color="#fff" /></button> : null}<div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}><button onClick={() => { onBack(); act.profile(post.author); }} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: 0, cursor: "pointer", minWidth: 0, flexShrink: 1 }}><SocialFace card={post.author} photos={photos} size={34} /><SocialName card={post.author} size={14.5} color="#fff" /></button>{!post.mine && !act.isFollowing(post.author) ? <span style={{ display: "inline-flex", flexShrink: 0 }}><SocialFollowButton card={post.author} act={act} kind="glass" testid="social-viewer-follow" /></span> : null}</div>{post.caption ? <div style={{ fontSize: 14, marginTop: 9, lineHeight: 1.4, maxHeight: 80, overflowY: "auto", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><SocialCaption text={post.caption} onTag={(t) => { onBack(); act.tag(t); }} mentions={post.mentions} onMention={(c) => { onBack(); act.profile(c); }} color="#fff" /></div> : null}</div>
    {tag ? <div style={{ position: "absolute", left: 12, right: 12, bottom: "calc(22px + env(safe-area-inset-bottom, 0px))" }}><SocialTagCard tag={tag} onShopItem={act.shopItem} /></div> : null}
  </div>;
}


// ── Reels and Videos, one after another ─────────────────────────────────
// Full screen, swipe up for the next. Reels ⇄ Videos at the top.
function SocialReels({ format, onFormat, list, setList, photos, act, muted, onMuted, onBack }) {
  const box = useRefH40(null);
  const [at, setAt] = useStateH40(0);
  const [err, setErr] = useStateH40("");
  const busy = useRefH40(false);
  const load = useCallbackH40((more) => {
    if (busy.current) return; busy.current = true; setErr("");
    socialApi.reels(format, more && list ? list.before : "").then((r) => {
      setList((old) => (more && old && old.format === format ? { format, posts: [...old.posts, ...(r.posts || []).filter((p) => !old.posts.some((x) => x.id === p.id))], before: r.before, end: r.end } : { format, posts: r.posts || [], before: r.before, end: r.end }));
    }).catch((e) => setErr((e && e.message) || "Couldn't load them.")).finally(() => { busy.current = false; });
  }, [format, list, setList]);
  useEffectH40(() => { if (!list || list.format !== format) { setAt(0); if (box.current) box.current.scrollTop = 0; load(false); } }, [format]);
  const posts = list && list.format === format ? list.posts : null;
  const onScroll = () => {
    const el = box.current; if (!el) return;
    const i = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
    if (i !== at) setAt(i);
    if (posts && list && !list.end && i >= posts.length - 3) load(true);
  };
  const tabs = <div data-testid="social-reels-tabs" style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "center", gap: 22, pointerEvents: "none" }}>{[["reel", "Reels"], ["video", "Videos"]].map(([k, l]) => <button key={k} type="button" data-testid={`social-reels-${k}`} aria-pressed={format === k} onClick={() => onFormat(k)} className="v2-tap" style={{ pointerEvents: "auto", border: "none", background: "none", padding: "4px 2px", cursor: "pointer", color: "#fff", opacity: format === k ? 1 : 0.6, fontSize: 17, fontWeight: 900, fontFamily: T.fontDisplay, textShadow: "0 1px 4px rgba(0,0,0,0.6)", borderBottom: format === k ? "2.5px solid #fff" : "2.5px solid transparent" }}>{l}</button>)}</div>;
  return <div data-testid="social-reels" style={{ position: "absolute", inset: 0, zIndex: 45, background: "#000", fontFamily: T.fontBody }}>
    {tabs}
    <div ref={box} onScroll={onScroll} style={{ position: "absolute", inset: 0, overflowY: "auto", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
      {posts === null ? <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0.7, fontSize: 14 }}>{err || "Loading…"}</div>
        : posts.length === 0 ? <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#fff", padding: 30, textAlign: "center" }}>{format === "reel" ? <SxReels size={40} color="#fff" /> : <SxVideo size={40} color="#fff" />}<b style={{ fontSize: 17 }}>{format === "reel" ? "No reels yet" : "No videos yet"}</b><span style={{ fontSize: 13.5, opacity: 0.75 }}>{format === "reel" ? "Short videos people share show up here, one after another." : "Longer videos people share show up here."}</span></div>
          : posts.map((p, i) => <div key={p.id} data-testid="social-reels-page" style={{ position: "relative", height: "100%", scrollSnapAlign: "start", scrollSnapStop: "always" }}>{Math.abs(i - at) <= 1 ? <SocialViewer post={p} photos={photos} act={act} muted={muted} onMuted={onMuted} onBack={onBack} embedded /> : null}</div>)}
    </div>
  </div>;
}

// ── A reel's full video ─────────────────────────────────────────────────
// Pick which of your videos a reel was cut from; people swipe across from
// the reel to watch all of it.
function SocialFullVideoPick({ current = "", onPick, onClose }) {
  const [list, setList] = useStateH40(null);
  useEffectH40(() => { socialApi.myVideos().then((r) => setList(r.videos || [])).catch(() => setList([])); }, []);
  return <HellooSheet title="Connect the full video" label="Full video" zIndex={75} onClose={onClose}><div data-testid="social-fullvideo-pick" style={{ fontFamily: T.fontBody }}>
    <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.45, marginBottom: 12 }}>People watching this reel swipe across to see the whole video.</div>
    {list === null ? <div style={{ padding: 16, textAlign: "center", color: T.inkFaint }}>Loading…</div>
      : !list.length ? <div style={{ padding: "10px 4px 14px", fontSize: 13.5, color: T.inkSoft }}>You haven't shared a video on this profile yet. Share it as a Video first, then connect it here.</div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "52vh", overflowY: "auto" }}>{list.map((v) => { const m = (v.media || [])[0]; const on = v.id === current; return <button key={v.id} type="button" data-testid="social-fullvideo-option" aria-pressed={on} onClick={() => onPick(on ? null : v)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 14, border: on ? `2px solid ${T.accent}` : `1px solid ${T.line || "rgba(0,0,0,0.08)"}`, background: HT.cardBg || T.surface, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 72, height: 48, borderRadius: 10, overflow: "hidden", background: "#000", flexShrink: 0 }}>{m ? <video src={socialMediaSrc(m)} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}</span><span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.caption || "A video"}<span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: T.inkFaint, marginTop: 2 }}>{socialAgo(v.at)}</span></span>{on ? <HlCheck size={18} color={T.accent} /> : null}</button>; })}</div>}
  </div></HellooSheet>;
}

// ── My activity ─────────────────────────────────────────────────────────
// What you liked, commented on, reposted and saved, and where you were
// mentioned: one row of choices across the top, the list below.
var SOCIAL_MINE_KINDS = [["likes", SxHeart, "Likes"], ["comments", SxComment, "Comments"], ["reposts", SxRepost, "Reposts"], ["saved", SxSave, "Saved"], ["mentions", SxAt, "Mentions"]];
function SocialMyActivity({ list, setList, photos, act, onBack }) {
  const [type, setType] = useStateH40((list && list.type) || "likes");
  const [err, setErr] = useStateH40("");
  useEffectH40(() => {
    let live = true; setErr("");
    if (!list || list.type !== type) setList(null);
    socialApi.myActivity(type).then((r) => { if (live) setList({ type, items: r.items || [] }); }).catch((e) => live && setErr((e && e.message) || "Couldn't load it."));
    return () => { live = false; };
  }, [type]);
  const items = list && list.type === type ? list.items : null;
  const empty = { likes: "Posts you like show up here.", comments: "Posts you comment on show up here, with what you said.", reposts: "What you share again to your followers shows up here.", saved: "Tap the bookmark on a post or reel to keep it here. Only you see this.", mentions: "When someone mentions you in a post or a comment, it shows up here." }[type];
  const thumb = (post) => { const m = (post.media || [])[0]; const src = m ? socialMediaSrc(m) : ""; return <span style={{ position: "relative", width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: T.surfaceSunk || T.surfaceAlt, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{src ? (m.kind === "video" ? <video src={src} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : <SxPost size={20} color={T.inkFaint} />}{m && m.kind === "video" ? <span style={{ position: "absolute", right: 3, bottom: 3, display: "flex" }}>{post.format === "reel" ? <SxReels size={13} color="#fff" /> : <SxVideo size={13} color="#fff" />}</span> : null}</span>; };
  const line = (it) => {
    const q = (t) => `“${t.length > 80 ? `${t.slice(0, 80)}…` : t}”`;
    if (type === "comments") return <>You: <span style={{ color: T.ink }}>{q(it.text || "")}</span></>;
    if (type === "mentions") return <><b style={{ color: T.ink }}>{(it.by && (it.by.handle || it.by.name)) || "Someone"}</b> mentioned you {it.where === "comment" ? <>in a comment: <span style={{ color: T.ink }}>{q(it.text || "")}</span></> : "in a post"}</>;
    return it.post.caption ? (it.post.caption.length > 80 ? `${it.post.caption.slice(0, 80)}…` : it.post.caption) : ({ reel: "A reel", video: "A video" }[it.post.format] || "A post");
  };
  return <div data-testid="social-mine" style={{ position: "absolute", inset: 0, zIndex: 44, background: HT.screenBg && HT.screenBg.startsWith("#") ? HT.screenBg : T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "calc(10px + env(safe-area-inset-top, 0px)) 14px 6px" }}><NavBackButton onClick={onBack} /><b style={{ fontSize: 20, fontWeight: 900, color: T.ink, fontFamily: T.fontDisplay, letterSpacing: -0.3 }}>My activity</b></div>
    <div data-testid="social-mine-kinds" role="tablist" style={{ display: "flex", justifyContent: "space-between", gap: 8, overflowX: "auto", padding: "6px 14px 12px", scrollbarWidth: "none", flexShrink: 0 }}>{SOCIAL_MINE_KINDS.map(([k, Icon, label]) => <button key={k} type="button" role="tab" aria-selected={type === k} data-testid={`social-mine-${k}`} aria-label={label} title={label} onClick={() => setType(k)} className="v2-tap" style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 44, padding: 0, borderRadius: 999, border: "none", cursor: "pointer", background: type === k ? T.ink : (HT.cardBg || T.surface), color: type === k ? (T.bg || "#fff") : T.ink, boxShadow: type === k ? "none" : (HT.cardShadow ?? T.shadowCard), fontSize: 13.5, fontWeight: 800, fontFamily: T.fontBody }}><Icon size={21} color="currentColor" fill={type === k && (k === "likes" || k === "saved") ? "currentColor" : "none"} /></button>)}</div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 0 40px" }}>
      {items === null ? <SocialNote title={err ? "Couldn't load it" : "Loading…"} text={err} />
        : items.length === 0 ? <SocialNote title="Nothing yet" text={empty} />
          : <div style={{ margin: "0 14px", borderRadius: 20, background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, overflow: "hidden" }}>{items.map((it, i) => <button key={`${it.post.id}-${i}`} type="button" data-testid="social-mine-row" onClick={() => act.open(it.post)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: "none", borderTop: i ? `1px solid ${T.line || "rgba(0,0,0,0.06)"}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>
            {thumb(it.post)}
            <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}><span style={{ minWidth: 0, overflow: "hidden" }}><SocialName card={it.post.author} size={13.5} /></span><span style={{ flexShrink: 0, fontSize: 11.5, color: T.inkFaint }}>· {socialAgo(it.at)}</span></span><span style={{ display: "block", fontSize: 13, color: T.inkSoft, lineHeight: 1.4, marginTop: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{line(it)}</span></span>
            {type === "likes" ? <SxHeart size={18} color="#E11D48" fill="#E11D48" style={{ flexShrink: 0 }} /> : type === "saved" ? <SxSave size={18} color={T.ink} fill={T.ink} style={{ flexShrink: 0 }} /> : type === "reposts" ? <SxRepost size={18} color="#16A34A" style={{ flexShrink: 0 }} /> : null}
          </button>)}</div>}
    </div>
  </div>;
}

// ── Comments ────────────────────────────────────────────────────────────
function SocialComments({ post, photos, onCards, onCount, onClose, onToast, onMention }) {
  const [picked, setPicked] = useStateH40([]);
  const [list, setList] = useStateH40(null);
  const [text, setText] = useStateH40("");
  const [busy, setBusy] = useStateH40(false);
  useEffectH40(() => { socialApi.comments(post.id).then((r) => { setList(r.comments || []); onCards((r.comments || []).map((c) => c.author)); }).catch(() => setList([])); }, [post.id]);
  const send = () => {
    const t = text.trim(); if (!t || busy) return;
    setBusy(true);
    socialApi.comment(post.id, t, socialMentionsFor(picked, t)).then((r) => { setText(""); setPicked([]); setList((l) => { const next = [r.comment, ...(l || [])]; onCount(next.length); return next; }); }).catch((err) => onToast((err && err.message) || "Couldn't post that.")).then(() => setBusy(false));
  };
  const remove = (c) => socialApi.uncomment(c.id).then(() => setList((l) => { const next = (l || []).filter((x) => x.id !== c.id); onCount(next.length); return next; })).catch(() => onToast("Couldn't remove it."));
  return <HellooSheet title={list && list.length ? `${list.length} ${list.length === 1 ? "comment" : "comments"}` : "Comments"} onClose={onClose} zIndex={70}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: HT.free, fontWeight: 800, marginBottom: 10 }}><HlShield size={13} color={HT.free} />Every comment is from a GLOOBAL ID</div>
    {list === null ? <div style={{ padding: 18, textAlign: "center", color: T.inkFaint, fontSize: 13 }}>Loading…</div> : list.length === 0 ? <div style={{ padding: 18, textAlign: "center", color: T.inkSoft, fontSize: 13 }}>No comments yet. Say something kind.</div> : list.map((c) => <div key={c.id} data-testid="social-comment" style={{ display: "flex", gap: 10, padding: "8px 0" }}><SocialFace card={c.author} photos={photos} size={32} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><SocialName card={c.author} size={13} /><span style={{ fontSize: 11.5, color: T.inkFaint, flexShrink: 0 }}>{hellooWhen(c.at)}</span></span><span style={{ display: "block", fontSize: 13.5, color: T.ink, lineHeight: 1.4, marginTop: 2, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><SocialCaption text={c.text} mentions={c.mentions} onMention={onMention} /></span></span>{c.canDelete ? <button onClick={() => remove(c)} aria-label="Remove comment" className="v2-tap" style={{ border: "none", background: "none", padding: 4, cursor: "pointer", alignSelf: "flex-start" }}><HlTrash size={15} color={T.inkFaint} /></button> : null}</div>)}
    <div style={{ position: "sticky", bottom: 0, paddingTop: 4, background: T.bg }}><SocialMentionPick text={text} onText={setText} picked={picked} onPicked={setPicked} photos={photos} /><div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 6 }}><input value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Add a comment" data-testid="social-comment-input" style={{ flex: 1, minWidth: 0, height: 46, borderRadius: 16, border: `1px solid ${T.line}`, background: T.surface, padding: "0 14px", fontSize: 14.5, color: T.ink, outline: "none", fontFamily: T.fontBody }} /><button onClick={send} disabled={!text.trim() || busy} aria-label="Post comment" className="v2-tap" style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: text.trim() ? T.gradButton : T.gradButtonDisabled, display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0 }}><HlSend size={19} color="#fff" /></button></div></div>
  </HellooSheet>;
}

// ── A new post ──────────────────────────────────────────────────────────
// What you can make: each opens the composer set up for it.
var SOCIAL_KINDS = [
  ["post", SxPost, "Post", "Up to 10 pictures"],
  ["reel", SxReels, "Reel", "A short video, up to 90 s"],
  ["video", SxVideo, "Video", "One video, up to 8 MB"],
  ["story", SxStory, "Status", "Gone after 24 hours"],
];
var SOCIAL_REEL_SECONDS = 90;
function socialVideoSeconds(file) {
  return new Promise((resolve) => { try { const v = document.createElement("video"); v.preload = "metadata"; const u = URL.createObjectURL(file); v.onloadedmetadata = () => { URL.revokeObjectURL(u); resolve(Number(v.duration) || 0); }; v.onerror = () => { URL.revokeObjectURL(u); resolve(0); }; v.src = u; } catch (e) { resolve(0); } });
}
function SocialComposer({ me, asName, status, kind: kindIn, onKind, onClose, onPosted, onToast, photos }) {
  const [mentionsPicked, setMentionsPicked] = useStateH40([]);
  // A reel: the full video it was cut from (optional).
  const [fullVid, setFullVid] = useStateH40(null);
  const [pickFull, setPickFull] = useStateH40(false);
  const kind = kindIn || (status ? "story" : "post");
  status = kind === "story";
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
  const onFiles = async (list) => {
    setErr("");
    const chosen = Array.from(list || []);
    const video = chosen.find((f) => /^video\//.test(f.type));
    const pics = chosen.filter((f) => /^image\//.test(f.type) && !/svg/.test(f.type));
    if (video && video.size > SOCIAL_VIDEO_MAX) { setErr("Videos can be up to 8 MB for now. Trim it and try again."); return; }
    if (status) {
      const one = video || pics[0];
      if (!one) { setErr("Pick one picture or one video."); return; }
      setFiles([{ file: one, kind: video ? "video" : "photo", preview: URL.createObjectURL(one) }]);
      return;
    }
    if (kind === "reel" || kind === "video") {
      if (!video) { setErr(kind === "reel" ? "A reel is a video. Pick one video." : "Pick one video."); return; }
      if (kind === "reel") { const sec = await socialVideoSeconds(video); if (sec > SOCIAL_REEL_SECONDS + 0.5) { setErr(`Reels are up to ${SOCIAL_REEL_SECONDS} seconds. Share it as a Video, or trim it.`); return; } }
      setFiles([{ file: video, kind: "video", preview: URL.createObjectURL(video) }]);
      return;
    }
    // A post: pictures. A video picked here goes to Video.
    if (video && !pics.length) { if (onKind) onKind("video"); setFiles([{ file: video, kind: "video", preview: URL.createObjectURL(video) }]); return; }
    if (!pics.length) { setErr("Pick pictures."); return; }
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
      const r = await socialApi.post(status ? { media: ids, caption: caption.trim(), story: true } : Object.assign({ media: ids, caption: caption.trim(), topic, tags, mentions: socialMentionsFor(mentionsPicked, caption) }, kind === "reel" || kind === "video" ? Object.assign({ format: kind }, kind === "reel" && fullVid ? { fullVideo: fullVid.id } : {}) : {}));
      onPosted(r.post);
    } catch (e) {
      setErr((e && e.message) || "Couldn't post that. Try again.");
      setBusy("");
    }
  };
  return <div data-testid="social-composer" style={{ position: "absolute", inset: 0, zIndex: 80, background: HT.screenBg || T.bg, display: "flex", flexDirection: "column", fontFamily: T.fontBody }}>
    <HellooTop left={<HellooRoundButton Icon={HlX} label="Close" onClick={onClose} size={38} />} title={{ post: "New post", reel: "New reel", video: "New video", story: "New status" }[kind]} subtitle={status ? `${asName || me.name} · gone after 24 hours` : (asName || me.name)} />
    {onKind ? <div role="tablist" aria-label="What to make" data-testid="social-kinds" style={{ display: "flex", gap: 6, margin: "0 16px 12px", padding: 4, borderRadius: 18, background: T.surfaceAlt, flexShrink: 0 }}>{SOCIAL_KINDS.map(([k, Icon, label]) => { const on = k === kind; return <button key={k} role="tab" aria-selected={on} onClick={() => { if (k === kind) return; setFiles([]); setErr(""); onKind(k); }} data-testid={`social-kind-${k}`} className="v2-tap" style={{ flex: 1, minWidth: 0, height: 52, borderRadius: 14, border: "none", background: on ? (HT.cardBg || T.surface) : "transparent", boxShadow: on ? T.shadowCard : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", fontFamily: T.fontBody, padding: 0 }}><Icon size={19} color={on ? T.accent : T.inkSoft} /><span style={{ fontSize: 11.5, fontWeight: 800, color: on ? T.ink : T.inkSoft }}>{label}</span></button>; })}</div> : null}
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <input ref={pick} type="file" accept={kind === "post" ? "image/jpeg,image/png,image/webp" : kind === "story" ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" : "video/mp4,video/webm,video/quicktime"} multiple={kind === "post"} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} data-testid="social-file" />
      {files.length === 0 ? <button onClick={() => pick.current && pick.current.click()} className="v2-tap" style={{ height: 240, borderRadius: 24, border: `2px dashed ${T.line}`, background: HT.cardBg || T.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}><span style={{ width: 64, height: 64, borderRadius: 22, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>{(() => { const K = SOCIAL_KINDS.find((x) => x[0] === kind) || SOCIAL_KINDS[0]; const I = K[1]; return <I size={30} color={T.accent} />; })()}</span><span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{{ post: "Pick pictures", reel: "Pick a short video", video: "Pick a video", story: "A picture or a short video" }[kind]}</span><span style={{ fontSize: 12.5, color: T.inkSoft }}>{{ post: "Up to 10 pictures", reel: `Up to ${SOCIAL_REEL_SECONDS} seconds · 8 MB`, video: "One video up to 8 MB", story: "One picture · or one video up to 8 MB · gone after 24 hours" }[kind]}</span></button>
        : <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>{files.map((f, i) => <span key={f.preview} style={{ position: "relative", flex: files.length === 1 ? "1 0 100%" : "0 0 150px", height: files.length === 1 ? 300 : 190, borderRadius: 18, overflow: "hidden", background: "#000" }}>{f.kind === "video" ? <video src={f.preview} muted playsInline autoPlay loop style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}<button onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} aria-label="Remove" className="v2-tap" style={{ position: "absolute", right: 8, top: 8, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlX size={15} color="#fff" /></button></span>)}{!status && files[0].kind === "photo" && files.length < 10 ? <button onClick={() => pick.current && pick.current.click()} aria-label="Add pictures" className="v2-tap" style={{ flex: "0 0 90px", height: files.length === 1 ? 300 : 190, borderRadius: 18, border: `2px dashed ${T.line}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HlPlus size={24} color={T.inkSoft} /></button> : null}</div>}
      <HellooCard style={{ padding: 14 }}><textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 2200))} placeholder={status ? "Add a line (if you like)" : "Say something… #hashtags, @ to mention"} rows={status ? 2 : 3} data-testid="social-caption" style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 15, color: T.ink, fontFamily: T.fontBody, lineHeight: 1.45 }} />{status ? null : <SocialMentionPick text={caption} onText={(v) => setCaption(v.slice(0, 2200))} picked={mentionsPicked} onPicked={setMentionsPicked} photos={photos} />}</HellooCard>
      {status ? <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}><HlShield size={15} color={HT.free} style={{ flexShrink: 0 }} />Only the people who follow you and the people you follow see your status.</div> : null}
      {kind === "reel" ? <button type="button" data-testid="social-compose-fullvideo" onClick={() => setPickFull(true)} className="v2-tap" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, border: "none", background: HT.cardBg || T.surface, boxShadow: HT.cardShadow ?? T.shadowCard, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><SxVideo size={20} color={T.accent} /><span style={{ flex: 1, minWidth: 0 }}><b style={{ display: "block", fontSize: 14, color: T.ink }}>{fullVid ? "Full video connected" : "Connect the full video"}</b><span style={{ display: "block", fontSize: 12.5, color: T.inkSoft, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullVid ? (fullVid.caption || "Your video") : "If this reel is from a longer video of yours"}</span></span><HlChevron size={17} color={T.inkFaint} /></button> : null}
      {pickFull ? <SocialFullVideoPick current={fullVid ? fullVid.id : ""} onPick={(v) => { setFullVid(v); setPickFull(false); }} onClose={() => setPickFull(false)} /> : null}
      {status ? null : <><div><div style={{ fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 8 }}>Topic</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{SOCIAL_TOPICS.map(([k, e, l]) => <button key={k} onClick={() => setTopic((t) => (t === k ? "" : k))} aria-pressed={topic === k} className="v2-tap" style={{ padding: "8px 12px", borderRadius: 14, border: "none", background: topic === k ? T.accentSoft : T.surfaceAlt, color: topic === k ? T.accent : T.inkSoft, boxShadow: topic === k ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody }}>{e} {l}</button>)}</div></div>
      <div data-testid="social-hashtags"><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 2 }}><SxHash size={14} color={T.inkSoft} />Hashtags<span style={{ flex: 1 }} /><span style={{ fontWeight: 700, color: T.inkFaint }}>{used.length} of 10</span></div><div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8, lineHeight: 1.4 }}>People find your post by these. Tap to add, or type your own with # in the text.</div>
        {used.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{used.map((t) => <SocialChip key={t} on onClick={() => dropTag(t)} label={`Remove #${t}`}>#{t}<HlX size={13} color={T.accent} /></SocialChip>)}</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ideas.map((t) => <SocialChip key={t} onClick={() => addTag(t)} testid={`social-idea-${t}`}>#{t}</SocialChip>)}</div></div>
      {items && items.length ? <div><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: T.inkSoft, marginBottom: 8 }}><SxTag size={14} color={T.inkSoft} />Sell from this post</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{items.map((it) => { const on = tags.includes(it.id); return <button key={it.id} onClick={() => setTags((t) => (on ? t.filter((x) => x !== it.id) : [...t, it.id].slice(0, 5)))} aria-pressed={on} className="v2-tap" style={{ padding: "8px 12px", borderRadius: 14, border: "none", background: on ? T.accentSoft : T.surfaceAlt, color: on ? T.accent : T.ink, boxShadow: on ? `inset 0 0 0 1.5px ${T.accent}` : "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title} · {hellooMoneyText(it.price, it.currency)}</button>; })}</div></div> : null}</>}
      {err ? <div role="alert" style={{ fontSize: 13, color: T.negative, fontWeight: 700 }}>{err}</div> : null}
    </div>
    <div style={{ padding: "10px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}><HellooPrimary onClick={share} disabled={!files.length || Boolean(busy)}>{busy || (status ? "Share for 24 hours" : { post: "Share post", reel: "Share reel", video: "Share video" }[kind])}</HellooPrimary></div>
  </div>;
}
