// frontend/screens/Groups.jsx
//
// ── GROUPS AND ANNOUNCEMENT GROUPS (25 Nov) ─────────────────────────────
//
// A group: everyone in it writes. An announcement group: its admins post,
// members read (a shop, a creator, a school, a society).
//
// Strangers pay to reach you on Helloo, so a group is never a free way in:
// people who already know you (they saved you, you've paid each other, or
// they let you message free) are ADDED; anyone else gets an INVITE and is
// in only when they say yes. Inside a group nobody pays anybody, and
// money is sent in a chat with one person, never in a group.
//
// The rules live on the server (lib/hellooGroups.js); these screens only
// draw them: making one (pick people, then a name), the group's info
// (members, admins, invites, leave), and an invite on Home.
import { useState as useStateH50 } from "react";
import { Megaphone as HlMegaphone, Crown as HlCrown, UserMinus as HlUserMinus } from "lucide-react";

// What happened when people were brought in, in one line:
// "Added 2 · invited 1 — they join if they say yes".
function hellooGroupResultText(r) {
  const added = (r && r.added) || [];
  const invited = (r && r.invited) || [];
  const left = ((r && r.refused) || []).filter((x) => x.reason !== "already_in" && x.reason !== "already_invited");
  const parts = [];
  if (added.length) parts.push(`Added ${added.length === 1 ? added[0].name || "1" : added.length}`);
  if (invited.length) parts.push(`invited ${invited.length === 1 ? invited[0].name || "1" : invited.length} — they join if they say yes`);
  if (left.length) parts.push(`${left.length} couldn't be added`);
  if (!parts.length) return "Group ready";
  const line = parts.join(" · ");
  return line.charAt(0).toUpperCase() + line.slice(1);
}

// A group's round picture: people for a group, a megaphone for announcements.
function HellooGroupBadge({ kind, size = 46 }) {
  const announce = kind === "announce";
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: announce ? "#FCE7F3" : T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>{announce ? <HlMegaphone size={size * 0.46} color="#DB2777" /> : <HlUsers size={size * 0.46} color={T.accent} />}</span>;
}

// One person in a picker: tap to pick or unpick.
function HellooPickRow({ p, on, onToggle, first }) {
  return <button onClick={onToggle} data-testid="helloo-group-pick" aria-pressed={on} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", borderTop: first ? "none" : `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}>
    <HellooAvatar person={p} size={42} />
    <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.handle ? <CreatorHandleText handle={p.handle} icon={false} /> : p.name}</span><span style={{ display: "block", fontSize: 12, color: T.inkSoft, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.lastPaid || p.gloobalId || ""}</span></span>
    <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, border: on ? "none" : `2px solid ${T.line}`, background: on ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{on ? <HlCheck size={15} color="#fff" strokeWidth={3} /> : null}</span>
  </button>;
}

// Making a group (or adding people to one): pick people, then a name.
// `mode` "add" stops after picking. `onFind(id)` looks somebody up by their
// GLOOBAL ID or mobile number and resolves to a person, or throws.
function HellooGroupNewScreen({ kind = "group", mode = "new", people = [], already = [], onBack, onDone, onFind, busy = false, error = "" }) {
  const [step, setStep] = useStateH50("people");
  const [q, setQ] = useStateH50("");
  const [picked, setPicked] = useStateH50([]);
  const [found, setFound] = useStateH50([]);
  const [finding, setFinding] = useStateH50({ busy: false, error: "" });
  const [name, setName] = useStateH50("");
  const [about, setAbout] = useStateH50("");
  useHellooBackLayer(step === "name", () => setStep("people"));
  const announce = kind === "announce";
  const adding = mode === "add";
  const taken = new Set(already);
  const everyone = found.concat(people.filter((p) => !found.some((f) => f.accountId === p.accountId))).filter((p) => p.accountId && !taken.has(p.accountId));
  const term = q.trim().toLowerCase();
  const shown = everyone.filter((p) => !term || String(p.name || "").toLowerCase().split(/\s+/).some((w) => w.startsWith(term)) || String(p.handle || "").toLowerCase().includes(term));
  const toggle = (id) => setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.concat(id)));
  const pickedPeople = everyone.filter((p) => picked.includes(p.accountId));
  const looksLikeId = q.trim().length >= 8;
  const find = async () => {
    if (!onFind || finding.busy) return;
    setFinding({ busy: true, error: "" });
    try {
      const p = await onFind(q.trim());
      if (p && p.accountId && !taken.has(p.accountId)) {
        setFound((list) => [p].concat(list.filter((x) => x.accountId !== p.accountId)));
        setPicked((list) => (list.includes(p.accountId) ? list : list.concat(p.accountId)));
        setQ("");
      }
      setFinding({ busy: false, error: p ? "" : "Nobody on GLOOBAL has that ID or number." });
    } catch (err) {
      setFinding({ busy: false, error: (err && err.message) || "Nobody on GLOOBAL has that ID or number." });
    }
  };
  const title = adding ? "Add people" : announce ? "New announcement group" : "New group";
  if (step === "name" && !adding) {
    return <HellooScreen><HellooTop left={<NavBackButton onClick={() => setStep("people")} />} title={title} subtitle={pickedPeople.length ? `${pickedPeople.length} ${pickedPeople.length === 1 ? "person" : "people"} picked` : "Just you, for now"} />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0 2px" }}><HellooGroupBadge kind={kind} size={84} /></div>
        <HellooCard style={{ padding: "12px 14px" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.inkFaint }}>{announce ? "Name of the announcement group" : "Group name"}</label>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} data-testid="helloo-group-name" placeholder={announce ? "e.g. Sharma Sweets offers" : "e.g. Family"} autoFocus style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", background: "none", fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: T.fontBody, padding: "8px 0 2px" }} />
          <div style={{ textAlign: "right", fontSize: 11, color: T.inkFaint }}>{name.length}/60</div>
          {announce ? <><label style={{ display: "block", marginTop: 8, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.inkFaint }}>What it's for (optional)</label><textarea value={about} onChange={(e) => setAbout(e.target.value.slice(0, 300))} data-testid="helloo-group-about" rows={2} placeholder="Offers, timings and news" style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none", background: "none", resize: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody, padding: "6px 0 0", lineHeight: 1.4 }} /></> : null}
        </HellooCard>
        {pickedPeople.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{pickedPeople.map((p) => <span key={p.accountId} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 4px", borderRadius: 999, background: HT.cardBg || T.surface, boxShadow: T.shadowCard, fontSize: 12.5, fontWeight: 700, color: T.ink, maxWidth: "100%" }}><HellooAvatar person={p} size={24} flag={false} /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span></span>)}</div> : null}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.45 }}><HlShield size={16} color={HT.free} style={{ flexShrink: 0, marginTop: 1 }} /><span>{announce ? "Only admins post. Members read, and can message an admin on their own. " : ""}People who already know you are added. Everyone else gets an invite and joins only if they say yes. Nobody pays to message in a group.</span></div>
        {error ? <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: T.negative }}>{error}</div> : null}
      </div>
      <div style={{ padding: "8px 16px calc(14px + env(safe-area-inset-bottom, 0px))", flexShrink: 0 }}><HellooPrimary disabled={!name.trim() || busy} onClick={() => onDone && onDone({ people: picked, name: name.trim(), about: about.trim() })}>{busy ? "Making it…" : announce ? "Make announcement group" : "Make group"}</HellooPrimary></div>
    </HellooScreen>;
  }
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title={title} subtitle={picked.length ? `${picked.length} picked` : adding ? "Pick who to bring in" : "Pick people, or go on with just you"} />
    <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999, padding: "10px 14px" }}><HlSearch size={17} color={T.inkFaint} /><input value={q} onChange={(e) => { setQ(e.target.value); if (finding.error) setFinding({ busy: false, error: "" }); }} onKeyDown={(e) => { if (e.key === "Enter" && looksLikeId) find(); }} data-testid="helloo-group-search" autoComplete="off" placeholder="Name, GLOOBAL ID or mobile number" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody }} />{looksLikeId && onFind ? <button onClick={find} data-testid="helloo-group-find" className="v2-tap" style={{ border: "none", borderRadius: 999, background: T.accentSoft, color: T.accent, fontWeight: 800, fontSize: 12.5, padding: "5px 11px", cursor: "pointer", fontFamily: T.fontBody }}>{finding.busy ? "Finding…" : "Find"}</button> : null}</label>
      {finding.error ? <div style={{ fontSize: 12, fontWeight: 700, color: T.negative, margin: "6px 6px 0" }}>{finding.error}</div> : null}
    </div>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 20px" }}>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "0 4px 10px", fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}><HlShield size={15} color={HT.free} style={{ flexShrink: 0, marginTop: 1 }} /><span>People who know you are added. Everyone else gets an invite first.</span></div>
      {shown.length ? <HellooCard>{shown.map((p, i) => <HellooPickRow key={p.accountId} p={p} on={picked.includes(p.accountId)} onToggle={() => toggle(p.accountId)} first={i === 0} />)}</HellooCard> : <HellooCard style={{ padding: "18px 16px", textAlign: "center", fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>{term ? (looksLikeId ? "Not in your contacts. Tap Find to look up that GLOOBAL ID or number." : "Nobody by that name in your contacts.") : "Your contacts show here. You can also type a GLOOBAL ID or mobile number."}</HellooCard>}
      {error ? <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: T.negative, margin: "12px 4px 0" }}>{error}</div> : null}
    </div>
    <div style={{ padding: "8px 16px calc(14px + env(safe-area-inset-bottom, 0px))", flexShrink: 0 }}>{adding
      ? <HellooPrimary disabled={!picked.length || busy} onClick={() => onDone && onDone({ people: picked })}>{busy ? "Adding…" : picked.length ? `Add ${picked.length}` : "Pick someone"}</HellooPrimary>
      : <HellooPrimary onClick={() => setStep("name")}>{picked.length ? `Next · ${picked.length} picked` : "Next · just me"}</HellooPrimary>}</div>
  </HellooScreen>;
}

// A group's info: its name, who is in it, who runs it, who is invited,
// and the way out.
function HellooGroupInfoScreen({ info, error = "", onBack, onAdd, onRename, onMember, onUninvite, onLeave, onMute, muted = false }) {
  if (!info) return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title="Group info" /><div style={{ padding: 24, textAlign: "center", fontSize: 13, color: error ? T.negative : T.inkSoft, fontWeight: 700 }}>{error || "Loading…"}</div></HellooScreen>;
  const announce = info.kind === "announce";
  const members = info.members || [];
  return <HellooScreen><HellooTop left={<NavBackButton onClick={onBack} />} title={announce ? "Announcement group" : "Group info"} />
    <div data-testid="helloo-group-info" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 30px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "6px 0 0", textAlign: "center" }}>
        <HellooGroupBadge kind={info.kind} size={84} />
        <div data-testid="helloo-group-title" style={{ fontSize: 22, fontWeight: 900, fontFamily: T.fontDisplay, color: T.ink, lineHeight: 1.2, maxWidth: "100%", overflowWrap: "anywhere" }}>{info.name}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>{hellooGroupLine(info.kind, members.length)}</div>
        {info.about ? <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.45, maxWidth: 320 }}>{info.about}</div> : null}
        {info.admin && onRename ? <button onClick={onRename} data-testid="helloo-group-rename" className="v2-tap" style={{ border: "none", background: "none", color: T.accent, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody, display: "inline-flex", alignItems: "center", gap: 5 }}><HlPencil size={14} />Edit name</button> : null}
      </div>
      {announce ? <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px", borderRadius: 14, background: "#FCE7F3", color: "#9D174D", fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}><HlMegaphone size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Only admins post here. Members read, and can message an admin on their own.</span></div> : null}
      <HellooCard>
        {info.admin && onAdd ? <HellooRow Icon={HlUserPlus} title="Add people" onPress={onAdd} first /> : null}
        {onMute ? <HellooToggleRow Icon={muted ? HlBellOff : HlBell} title="Notifications" note={muted ? "Muted" : "On for this group"} on={!muted} onChange={(on) => onMute(!on)} first={!(info.admin && onAdd)} /> : null}
      </HellooCard>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0 4px 7px", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: T.inkSoft }}><span>Members</span><span>{members.length}{info.max ? ` of ${info.max}` : ""}</span></div>
        <HellooCard>{members.map((m, i) => <button key={m.accountId} onClick={() => onMember && !m.you && onMember(m)} data-testid="helloo-group-member" className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: m.you ? "default" : "pointer", textAlign: "left", fontFamily: T.fontBody }}>
          <HellooAvatar person={m} size={40} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.you ? "You" : m.name || m.gloobalId}</span>
          {m.admin ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, fontSize: 11, fontWeight: 800, color: T.accent, background: T.accentSoft, borderRadius: 999, padding: "3px 9px" }}><HlCrown size={12} />Admin</span> : null}
        </button>)}</HellooCard>
      </div>
      {info.admin && (info.invites || []).length ? <div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0 4px 7px", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: T.inkSoft }}><span>Invited · waiting for a yes</span><span>{info.invites.length}</span></div>
        <HellooCard>{info.invites.map((p, i) => <div key={p.accountId} data-testid="helloo-group-invited" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i ? `1px solid ${T.line}` : "none" }}><HellooAvatar person={p} size={36} flag={false} /><span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name || "Someone"}</span>{onUninvite ? <button onClick={() => onUninvite(p)} className="v2-tap" style={{ border: "none", borderRadius: 999, background: T.surfaceSunk, color: T.inkSoft, fontWeight: 800, fontSize: 12, padding: "6px 11px", cursor: "pointer", fontFamily: T.fontBody }}>Take back</button> : null}</div>)}</HellooCard>
      </div> : null}
      <HellooCard>{onLeave ? <HellooRow Icon={HlLogOut} title={announce ? "Leave announcement group" : "Leave group"} danger onPress={onLeave} first /> : null}</HellooCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: HT.free }}><HlLock size={13} />Nobody pays to message in a group</div>
    </div>
  </HellooScreen>;
}

// What you can do about one member (an admin sees all of it).
function HellooGroupMemberSheet({ member, admin = false, onMessage, onAdmin, onRemove, onClose }) {
  if (!member) return null;
  return <HellooSheet label={member.name || "Member"} onClose={onClose}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 2px 12px" }}><HellooAvatar person={member} size={44} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 16, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name || member.gloobalId}</span>{member.admin ? <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.accent, marginTop: 2 }}>Admin</span> : null}</span></div>
    <HellooCard>
      {onMessage ? <HellooRow Icon={HlChat} title={`Message ${String(member.name || "them").split(" ")[0]}`} onPress={onMessage} first /> : null}
      {admin && onAdmin ? <HellooRow Icon={HlCrown} title={member.admin ? "No longer an admin" : "Make admin"} onPress={onAdmin} /> : null}
      {admin && onRemove ? <HellooRow Icon={HlUserMinus} title="Remove from group" danger onPress={onRemove} /> : null}
    </HellooCard>
  </HellooSheet>;
}

// An invite, on Home: who asked, to what, and yes or no.
function HellooGroupInviteCard({ invite, onJoin, onDecline, busy = false }) {
  const announce = invite.kind === "announce";
  return <HellooCard style={{ padding: "12px 14px", marginBottom: 10 }}>
    <div data-testid="helloo-group-invite" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <HellooGroupBadge kind={invite.kind} size={44} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{invite.by && invite.by.name ? `${invite.by.name} invited you` : "You're invited"}</span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{invite.name}</span>
        <span style={{ display: "block", fontSize: 11.5, color: T.inkFaint, marginTop: 1 }}>{hellooGroupLine(invite.kind, invite.members)}{announce ? " · admins post" : ""}</span>
      </span>
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <button onClick={onDecline} disabled={busy} data-testid="helloo-group-decline" className="v2-tap" style={{ flex: 1, minHeight: 38, borderRadius: 999, border: `1px solid ${T.line}`, background: HT.cardBg || T.surface, color: T.inkSoft, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody }}>Not now</button>
      <button onClick={onJoin} disabled={busy} data-testid="helloo-group-join" className="v2-tap" style={{ flex: 1, minHeight: 38, borderRadius: 999, border: "none", background: T.gradButton, color: HT.onAccent || "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: T.fontBody }}>{busy ? "Joining…" : "Join"}</button>
    </div>
  </HellooCard>;
}
