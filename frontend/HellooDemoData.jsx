// frontend/HellooDemoData.jsx
//
// Sample people, chats and figures, kept for screenshots and design work
// only. NOT in build_app.mjs's module list: the app the site serves draws
// nothing but real data from the GLOOBAL API.
function hellooDemoData(P, ME) {
  const BANK={id:"□●■−+×=−+×=○",name:"Axis Bank",flag:"🇮🇳",country:"India",city:"Mumbai",business:true,about:"Loans · cards"};
  const SPAM={id:"●■−+×=−+×=○□",name:"Rohit Mehra",flag:"🇮🇳",country:"India",city:"Noida"};
  const H=3600e3, now=Date.now(), at=(h)=>new Date(now-h*H);
  const BANK_CHAT={id:"c-bank",person:BANK,unread:1,messages:[
    {kind:"system",text:"Axis Bank pays ₹2 to reach you · 100% yours"},
    {kind:"day",text:"Today"},
    {id:1,kind:"text",from:"them",paidText:"2.00₹",text:"Namaste Sanjeev! Pre-approved personal loan of ₹3,00,000 at 10.5%. Reply YES to know more.",at:at(2)},
    {id:2,kind:"text",from:"them",paidText:"2.00₹",text:"Offer valid till 5 Nov. T&C apply.",at:at(1.9)}]};
  const ME_AS_STRANGER_CHAT={id:"c-s",person:P.priya,messages:[{kind:"system",text:"You agreed to Priya's price · 2.00₹ per message"},{kind:"day",text:"Today"},{id:1,kind:"text",from:"me",paidText:"2.00₹",text:"Hi Priya, I'm Rahul from the Jaipur meetup — can I ask about the design course?",at:at(0.2),delivered:true}]};
  const PRICES={people:{price:2,blocked:false},business:{price:2,blocked:false}};
  const SPAMCHAT_ME={id:"c-rm",person:SPAM,messages:[{kind:"system",text:"Rohit pays ₹3/min to call you"},{kind:"day",text:"Today"},{id:1,kind:"call",from:"them",seconds:3000,paidText:"150.00₹",at:at(0.5)},{id:2,kind:"refund",from:"me",amountText:"75.00₹ │ CEL",percent:50,ofText:"150.00₹",what:"50 min call",at:at(0.4)}]};
  const SPAMCHAT_THEM={id:"c-rm2",person:{...ME},messages:[{kind:"system",text:"You agreed to Sanjeev's price · 3.00₹ per minute"},{kind:"day",text:"Today"},{id:1,kind:"call",from:"me",seconds:3000,paidText:"150.00₹",at:at(0.5)},{id:2,kind:"refund",from:"them",amountText:"75.00₹ │ CEL",percent:50,ofText:"150.00₹",what:"50 min call",at:at(0.4)}]};
  const SHOP={...P.rasoi, handle:"rasoi.ghar", city:"Alwar"};
  const EST=[{price:0,people:1180},{price:1,people:640},{price:2,people:412},{price:3,people:150},{price:5,people:60},{price:7,people:22}];
  const TXT="New: Rasoi Ghar is open on Kala Kuan Road. Chole bhature ₹60, first 100 orders get a free lassi 🥛";
  const SHARE={when:"Today 11:40",radius:5,text:TXT,delivered:1988,opened:233,replies:41,spentText:"486.00₹ │ CEL",heldText:"500.00₹ │ CEL",leftText:"14.00₹",spentPct:97,hoursLeft:36,nextText:"150 people at ₹3",replyRows:[{person:P.priya,text:"Do you deliver to Scheme 2?",km:"1.4"},{person:{id:"q1",name:"Mohit Jain",flag:"🇮🇳"},text:"Coming at 1 with office friends",km:"0.8"},{person:{id:"q2",name:"Sunita Devi",flag:"🇮🇳"},text:"Parcel 4 plates",km:"2.6"}]};
  const OFFER_CHAT={id:"c-off",person:SHOP,unread:1,messages:[{kind:"system",text:"rasoi.ghar paid ₹2 to reach you · 100% yours"},{kind:"day",text:"Today"},{id:1,kind:"offer",from:"them",text:TXT,km:"1.4",paidText:"2.00₹",at:at(1)}]};
  const REQS=[{id:1,person:{id:"rq1",name:"Rahul Verma",flag:"🇮🇳",city:"Jaipur"},kind:"message",text:"Rahul from the Jaipur meetup — about the design course",when:"10 min ago"},{id:2,person:{...SPAM,name:"Rohit Mehra"},kind:"call",text:"Calling about the flat on Scheme 2, I'm the owner's son",when:"1 h ago"},{id:3,person:{id:"rq3",name:"HDFC Bank",flag:"🇮🇳",business:true},kind:"message",text:"Your KYC renewal is due — one message to confirm",when:"Yesterday"}];
  const DAYS=Array.from({length:30},(_,i)=>i+1);
  const seed=(i,k)=>Math.abs(Math.sin(i*12.9898+k*78.233))*43758.5453%1;
  const EARNED={total:214,vsLast:38,payers:19,days:DAYS,byDayMessages:DAYS.map((d,i)=>Math.round(seed(i,1)*10)),byDayCalls:DAYS.map((d,i)=>i%4===1?Math.round(seed(i,2)*12):0),messages:118,messageCount:59,calls:96,callMinutes:48,fromPeople:64,fromBusiness:150,
   top:[{person:BANK,what:"11 messages",amount:22},{person:{id:"j",name:"Jio Fiber",flag:"🇮🇳",business:true},what:"7 messages · 1 call",amount:19},{person:SPAM,what:"2 calls · 50 min",amount:150}],
   gaveBack:75,hoursKept:6.5,turnedAway:37,allTime:1412,
   whatIf:[{price:1,earn:131,away:9},{price:2,earn:214,away:37,current:true},{price:3,earn:258,away:52},{price:5,earn:190,away:91}],
   advice:"At ₹3 you'd have earned about 44.00₹ more and turned away 15 more people. At ₹5 most businesses stop trying."};
  const SPENT={handle:"rasoi.ghar",spent:986,revenue:6240,roi:6.3,costPerOrder:12,
   shares:[{title:"Opening · free lassi",when:"12 Oct",delivered:1988,opened:233,replied:41,ordered:52,cost:486,maxPer:2,km:5},{title:"Fresh samosa @4pm",when:"19 Oct",delivered:610,opened:88,replied:17,ordered:23,cost:200,maxPer:1,km:2},{title:"Diwali thali ₹149",when:"27 Oct",delivered:1210,opened:201,replied:36,ordered:28,cost:300,maxPer:2,km:5}],
   areas:[{name:"Scheme 2",x:36,y:36,replies:31,orders:38},{name:"Kala Kuan",x:58,y:62,replies:22,orders:27},{name:"Surya Nagar",x:72,y:30,replies:18,orders:19},{name:"Aravali Vihar",x:24,y:70,replies:12,orders:11},{name:"Shivaji Park",x:84,y:76,replies:11,orders:8}],
   bestHour:"11:00–13:00",bestHourNote:"2.4× the replies of evening shares",hours:[1,1,2,3,5,9,12,10,6,3,4,7,6,3,2,1],bestMax:2,bestMaxNote:"most replies per rupee",byMax:[{max:1,repliesPerRupee:0.085},{max:2,repliesPerRupee:0.11},{max:3,repliesPerRupee:0.07}],
   orders:[{person:P.priya,what:"2 × thali · parcel",after:"40 min",amount:298},{person:{id:"o2",name:"Mohit Jain",flag:"🇮🇳"},what:"6 plates · office",after:"1 h",amount:360},{person:{id:"o3",name:"Sunita Devi",flag:"🇮🇳"},what:"4 plates",after:"3 h",amount:240}],orderCount:103};
  const TIME={total:1480,calls:612,chat:868,perDay:49,days:DAYS,byDayCalls:DAYS.map((d,i)=>Math.round(seed(i,3)*40)),byDayChat:DAYS.map((d,i)=>10+Math.round(seed(i,4)*40)),personal:910,pro:570,free:1180,paid:300,busiestHour:"21:00–22:00",busiestDay:"Sunday",
   people:[{person:P.amara,minutes:412,calls:9,msgs:140,pro:true},{person:P.lukas,minutes:288,calls:6,msgs:96,pro:true},{person:P.priya,minutes:201,calls:2,msgs:230},{person:SPAM,minutes:50,calls:1,msgs:0,paid:true},{person:P.rasoi,minutes:38,calls:1,msgs:44}],
   limit:60,today:72,quiet:"22:00 – 07:00",personLimits:2};
  const PRO_ME={...ME, signTitle:"Founder, GLOOBAL"};
  const LETTER_CHAT={id:"c-pro",person:{...P.lukas, name:"Lukas Brandt", city:"Berlin"},messages:[{kind:"system",text:"Professional mode · letters, read receipts by time"},{kind:"day",text:"Today"},
   {id:1,kind:"letter",from:"me",template:"Meeting request",subject:"Meeting request · Berlin pilot dates",date:"30 Oct 2026",greeting:"Dear Lukas,",body:"I would like to meet to discuss the Berlin pilot dates.\n\nProposed: 12 Nov, 10:00 CET\nPlace: your office, or a call\n\nPlease let me know if this suits you, or suggest another time.",signoff:"Regards,",signName:"Sanjeev Santosh",signTitle:"Founder, GLOOBAL",readOn:"30 Oct, 11:42",at:at(3)},
   {id:2,kind:"letter",from:"them",template:"Follow-up",subject:"Re: Berlin pilot dates",date:"30 Oct 2026",greeting:"Dear Sanjeev,",body:"12 Nov at 10:00 works. I have booked the meeting room and will send the agenda by Friday.\n\nLooking forward to it.",signoff:"Best regards,",signName:"Lukas Brandt",signTitle:"Head of Partnerships, Brandt GmbH",attachments:["Agenda-draft.pdf"],at:at(1)}]};
  const PRICES2={people:{price:2,blocked:false},business:{price:3,blocked:false}};
  return { BANK, SPAM, BANK_CHAT, ME_AS_STRANGER_CHAT, SPAMCHAT_ME, SHOP, EST, TXT, SHARE, OFFER_CHAT, REQS, EARNED, SPENT, TIME, PRO_ME, LETTER_CHAT, PRICES2 };
}

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
      { id: 3, kind: "order", from: "me", items: [{ qty: 2, name: "Chole bhature", lineText: "120.00₹" }, { qty: 1, name: "Lassi", lineText: "60.00₹" }], totalText: "180.00₹ │ CEL", note: "Parcel · 10 min", paid: true, status: "Ready", at: at(19.6) },
      { id: 33, kind: "receipt", from: "me", amountText: "180.00₹ │ CEL", note: "Order #412", at: at(19.5) },
      { id: 4, kind: "photo", from: "them", at: at(19.4), text: "bhature" },
      { id: 5, kind: "text", from: "them", text: "Fresh samosa @4pm today", at: at(1.2) }
    ] },
    { id: "c-pilot", person: P.pilot, unread: 1, messages: [
      { kind: "system", text: "Berlin pilot · 4 people · you're admin" },
      { id: 1, kind: "text", from: "them", text: "Lukas: Pilot dates locked — 12 Nov", at: at(5) },
      { id: 2, kind: "text", from: "them", text: "Priya: Dinner was 1,200 total, who paid what?", at: at(4) },
      { id: 3, kind: "split", from: "me", totalText: "1,200.00₹ │ CEL", note: "Dinner", shares: [{ name: "You", amountText: "300.00₹", paid: true }, { name: "Amara", amountText: "300.00₹", paid: true }, { name: "Lukas", amountText: "300.00₹" }, { name: "Priya", amountText: "300.00₹" }], at: at(3.5) },
      { id: 4, kind: "text", from: "them", text: "Amara: Paid ✅", at: at(3.4) }
    ] },
    { id: "c-lukas", person: P.lukas, unread: 0, muted: true, messages: [
      { id: 1, kind: "call", from: "them", video: true, missed: true, at: at(26) },
      { id: 2, kind: "text", from: "them", text: "Tried you on video, ping me when free", at: at(25.9) }
    ] },
    { id: "c-priya", person: P.priya, unread: 0, messages: [
      { id: 1, kind: "receipt", from: "them", amountText: "2,000.00₹ │ CEL", note: "Rent share", at: at(30) },
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
