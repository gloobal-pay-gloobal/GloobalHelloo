// frontend/screens/Letters.jsx
//
// ── PROFESSIONAL MODE ───────────────────────────────────────────────────
//
// Every chat has a switch: Personal ↔ Professional. In Professional the
// composer becomes a letter — subject, greeting, body, sign-off with your
// name and shop or title — and the message lands as a letter card, with
// "Read on 30 Oct, 11:42" instead of two ticks. Same chat, same person.
//
// Twenty prebuilt letters in four sets fill the body with blanks to tap
// through, so a quotation or a leave request is two minutes on a phone.
import { useState as useStateH8 } from "react";

var HELLOO_LETTER_SETS = [
  { key: "business", label: "Business", color: "#DB2777", items: [
    { key: "quote", title: "Quotation", subject: "Quotation for {item}", body: "Thank you for your enquiry. Please find our quotation below.\n\n{item}: {amount}\nValid till: {date}\nDelivery: {days} days from confirmation\n\nPayment can be made on GLOOBAL to {handle}. Do let me know if you have any questions." },
    { key: "invoice", title: "Invoice reminder", subject: "Payment due · Invoice {number}", body: "A gentle reminder that invoice {number} for {amount} was due on {date}.\n\nYou can pay on GLOOBAL to {handle} in one tap. Please ignore this if you have already paid." },
    { key: "confirm", title: "Order confirmation", subject: "Your order {number} is confirmed", body: "Thank you for your order.\n\n{items}\nTotal: {amount}\nReady by: {date}\n\nWe will message you here when it is ready." },
    { key: "delivery", title: "Delivery update", subject: "Delivery update · Order {number}", body: "Your order is on its way and should reach you by {date}.\n\nIf nobody is available, please reply here with a convenient time." },
    { key: "meeting", title: "Meeting request", subject: "Meeting request · {topic}", body: "I would like to meet to discuss {topic}.\n\nProposed: {date}, {time}\nPlace: {place}\n\nPlease let me know if this suits you, or suggest another time." },
    { key: "thanks", title: "Thank you", subject: "Thank you", body: "Thank you for {reason}. It was a pleasure, and I look forward to working with you again." }
  ] },
  { key: "work", label: "Work & jobs", color: "#2563EB", items: [
    { key: "apply", title: "Job application", subject: "Application for {role}", body: "I am writing to apply for the position of {role}.\n\nI have {years} years of experience in {field}. I am confident I can contribute to your team.\n\nI would be grateful for the opportunity to discuss this further." },
    { key: "leave", title: "Leave request", subject: "Leave request · {dates}", body: "I would like to request leave from {from} to {to} for {reason}.\n\nI will make sure my work is covered. Thank you for considering this." },
    { key: "appointment", title: "Appointment request", subject: "Appointment request", body: "I would like to book an appointment for {reason} on {date} at {time}.\n\nPlease confirm if this slot is available." },
    { key: "followup", title: "Follow-up after meeting", subject: "Following up · {topic}", body: "Thank you for your time today. As discussed:\n\n{points}\n\nNext step: {next}. I will be in touch on {date}." },
    { key: "resign", title: "Resignation", subject: "Resignation · {role}", body: "Please accept this as notice of my resignation from the position of {role}, effective {date}.\n\nThank you for the opportunity and the support during my time here." }
  ] },
  { key: "gov", label: "Government & bank", color: "#059669", items: [
    { key: "complaint", title: "Complaint", subject: "Complaint · {matter}", body: "I wish to register a complaint about {matter}.\n\nDetails: {details}\nReference: {reference}\n\nI request that this be looked into and resolved at the earliest. Please acknowledge this message." },
    { key: "kyc", title: "KYC / documents", subject: "Document submission · {account}", body: "As requested, I am submitting the following documents for {account}:\n\n{documents}\n\nPlease confirm receipt and let me know if anything further is needed." },
    { key: "loan", title: "Loan query", subject: "Query · {loan}", body: "I would like to know the terms of {loan}: interest rate, tenure and processing fee.\n\nMy requirement is {amount}. Please share the details here." },
    { key: "address", title: "Address change", subject: "Change of address · {account}", body: "Please update the address on {account} to:\n\n{address}\n\nEffective {date}. Supporting document attached." }
  ] },
  { key: "personal", label: "Personal formal", color: "#EA580C", items: [
    { key: "rent", title: "Notice to landlord", subject: "Notice · {flat}", body: "This is to inform you that I will be vacating {flat} on {date}, as per our agreement.\n\nKindly arrange the final inspection and the return of the deposit." },
    { key: "school", title: "School leave note", subject: "Leave · {child}, Class {class}", body: "My child {child} of Class {class} will be absent from {from} to {to} due to {reason}.\n\nKindly grant leave for these days." },
    { key: "invite", title: "Invitation", subject: "You are invited · {event}", body: "We would be delighted to have you at {event}.\n\nDate: {date}\nTime: {time}\nPlace: {place}\n\nPlease reply here to confirm." },
    { key: "condolence", title: "Condolence", subject: "With deepest sympathy", body: "I was deeply saddened to hear about {loss}. Please accept my heartfelt condolences.\n\nIf there is anything I can do, I am here." }
  ] }
];

function hellooLetterFields(template) {
  const seen = [];
  for (const m of `${template.subject} ${template.body}`.matchAll(/\{(\w+)\}/g)) if (!seen.includes(m[1])) seen.push(m[1]);
  return seen;
}
function hellooFill(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => values[k] || `[${k}]`);
}

// The switch in the thread header.
function HellooModeSwitch({ mode, onChange }) {
  const pro = mode === "pro";
  return <button role="switch" aria-checked={pro} aria-label="Professional mode" onClick={() => onChange && onChange(pro ? "personal" : "pro")} className="v2-tap" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 999, padding: "6px 10px 6px 8px", background: pro ? T.ink : T.surfaceSunk, color: pro ? "#fff" : T.inkSoft, fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: T.fontBody, flexShrink: 0 }}>{pro ? <HlBriefcase size={14} /> : <HlSmile size={14} />}{pro ? "Pro" : "Personal"}</button>;
}

// A letter in the thread.
function HellooLetterCard({ m, person, me }) {
  const mine = m.from === "me";
  return <div data-helloo-card="letter" style={{ width: 286, borderRadius: 16, overflow: "hidden", background: T.surface, boxShadow: T.shadowCard, border: `1px solid ${T.line}`, fontFamily: T.fontBody }}><div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${T.line}`, background: mine ? T.surfaceAlt : T.surface }}><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.inkFaint }}><HlBriefcase size={12} />Letter{m.template && <span style={{ marginLeft: "auto", textTransform: "none", letterSpacing: 0, color: T.accent }}>{m.template}</span>}</div><div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginTop: 6, lineHeight: 1.3 }}>{m.subject}</div><div style={{ fontSize: 11, color: T.inkSoft, marginTop: 3 }}>{mine ? "To" : "From"} {hellooName(person)} · {m.date}</div></div><div style={{ padding: "12px 14px", fontSize: 13.5, color: T.ink, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.greeting && <div style={{ marginBottom: 8 }}>{m.greeting}</div>}{m.body}{m.signoff && <div style={{ marginTop: 10 }}>{m.signoff}<br /><b>{m.signName}</b>{m.signTitle && <><br /><span style={{ color: T.inkSoft, fontSize: 12.5 }}>{m.signTitle}</span></>}</div>}</div>{m.attachments && m.attachments.length > 0 && <div style={{ display: "flex", gap: 8, padding: "0 14px 12px", flexWrap: "wrap" }}>{m.attachments.map((a) => <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: T.ink, background: T.surfaceAlt, borderRadius: 999, padding: "5px 10px" }}><HlDoc size={12} />{a}</span>)}</div>}<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 10px", borderTop: `1px solid ${T.line}`, fontSize: 11, color: T.inkSoft }}>{mine ? (m.readOn ? <><HlCheckCheck size={13} color={T.accent2} />Read on {m.readOn}</> : <><HlCheck size={13} />Delivered</>) : <span />}<span style={{ marginLeft: "auto", display: "inline-flex", gap: 10 }}><span style={{ fontWeight: 800, color: T.accent }}>Reply</span><span style={{ fontWeight: 800, color: T.accent }}>PDF</span></span></div></div>;
}

// The composer in Professional mode: pick a letter, fill the blanks, send.
function HellooLetterComposer({ me, person, set = "business", onSet, template, onTemplate, values = {}, onValue, onSend, onClose }) {
  const group = HELLOO_LETTER_SETS.find((g) => g.key === set) || HELLOO_LETTER_SETS[0];
  const t = template ? HELLOO_LETTER_SETS.flatMap((g) => g.items).find((x) => x.key === template) : null;
  const fields = t ? hellooLetterFields(t) : [];
  const done = fields.filter((f) => values[f]).length;
  return <HellooSheet onClose={onClose} label="Write a letter" title={<span style={{ display: "flex", alignItems: "center", gap: 8 }}><HlBriefcase size={18} />{t ? t.title : "Write a letter"}</span>}>{!t ? <><div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>{HELLOO_LETTER_SETS.map((g) => <HellooChip key={g.key} on={set === g.key} onClick={() => onSet && onSet(g.key)}>{g.label}</HellooChip>)}</div><HellooCard style={{ marginTop: 12 }}>{group.items.map((it, i) => <button key={it.key} onClick={() => onTemplate && onTemplate(it.key)} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "none", borderTop: i ? `1px solid ${T.line}` : "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 36, height: 36, borderRadius: 11, background: group.color + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HlFileText size={17} color={group.color} /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.ink }}>{it.title}</span><span style={{ display: "block", fontSize: 11.5, color: T.inkSoft, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hellooFill(it.subject, {}).replace(/\[(\w+)\]/g, "…")}</span></span><HlChevron size={16} color={T.inkFaint} /></button>)}<button onClick={() => onTemplate && onTemplate("blank")} className="v2-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "none", borderTop: `1px solid ${T.line}`, background: "none", cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><span style={{ width: 36, height: 36, borderRadius: 11, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><HlPencil size={17} color={T.accent} /></span><span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: T.ink }}>Blank letter</span><HlChevron size={16} color={T.inkFaint} /></button></HellooCard></> : <><div style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.45 }}>Fill the blanks; the letter writes itself. {done}/{fields.length} done.</div><HellooCard style={{ marginTop: 10, padding: "4px 14px" }}>{fields.map((f, i) => <label key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}><span style={{ width: 86, fontSize: 11.5, fontWeight: 800, color: values[f] ? T.inkSoft : T.accent, textTransform: "capitalize" }}>{f}</span><input value={values[f] || ""} onChange={(e) => onValue && onValue(f, e.target.value)} placeholder={`${f}…`} style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", fontSize: 14, color: T.ink, fontFamily: T.fontBody }} /></label>)}</HellooCard><div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.inkFaint, margin: "14px 2px 6px" }}>Preview</div><HellooCard style={{ padding: "12px 14px", fontSize: 13, color: T.ink, lineHeight: 1.55, whiteSpace: "pre-wrap" }}><div style={{ fontWeight: 800, marginBottom: 6 }}>{hellooFill(t.subject, values)}</div>Dear {hellooName(person).split(" ")[0]},{"\n\n"}{hellooFill(t.body, values)}{"\n\n"}Regards,{"\n"}<b>{me.name}</b>{me.signTitle && <><br /><span style={{ color: T.inkSoft, fontSize: 12 }}>{me.signTitle}</span></>}</HellooCard><div style={{ display: "flex", gap: 8, marginTop: 12 }}><HellooChip><HlClip size={13} />Attach</HellooChip><HellooChip><HlPencil size={13} />Edit text</HellooChip><HellooChip onClick={() => onTemplate && onTemplate(null)}>Change letter</HellooChip></div><div style={{ marginTop: 12 }}><HellooPrimary disabled={done < fields.length} onClick={onSend} Icon={HlSend}>Send letter</HellooPrimary></div></>}</HellooSheet>;
}

// Professional-mode composer bar (replaces the personal one).
function HellooProComposer({ person, onWrite, onQuick }) {
  const quick = ["Noted, thank you.", "Will revert by tomorrow.", "Please share the invoice.", "Confirming our meeting."];
  return <div style={{ borderTop: `1px solid ${T.line}`, background: T.surface, flexShrink: 0 }}><div style={{ display: "flex", gap: 8, padding: "8px 12px 0", overflowX: "auto", scrollbarWidth: "none" }}>{quick.map((q) => <HellooChip key={q} onClick={() => onQuick && onQuick(q)}>{q}</HellooChip>)}</div><div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px calc(10px + env(safe-area-inset-bottom, 0px))" }}><button onClick={onWrite} className="v2-tap" style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${T.line}`, borderRadius: 22, padding: "11px 14px", background: T.surfaceAlt, color: T.inkSoft, fontSize: 14, cursor: "pointer", textAlign: "left", fontFamily: T.fontBody }}><HlBriefcase size={16} color={T.ink} />Write a letter to {hellooName(person).split(" ")[0]}…</button><HellooRoundButton Icon={HlClip} label="Attach" size={44} color={T.inkSoft} /></div></div>;
}
