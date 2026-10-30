// frontend/HellooDemoData.jsx
//
// Sample people, chats and figures for the demo build. Everything the
// demo shows comes from here, so swapping in the server later means
// replacing this one call. Wrapped in a function so none of these short
// names reach the shared global scope Gloobal's bundle lives in.
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
  const SPAMCHAT_ME={id:"c-rm",person:SPAM,messages:[{kind:"system",text:"Rohit pays ₹3/min to call you"},{kind:"day",text:"Today"},{id:1,kind:"call",from:"them",seconds:3000,paidText:"150.00₹",at:at(0.5)},{id:2,kind:"refund",from:"me",amountText:"75.00₹ │ GEU",percent:50,ofText:"150.00₹",what:"50 min call",at:at(0.4)}]};
  const SPAMCHAT_THEM={id:"c-rm2",person:{...ME},messages:[{kind:"system",text:"You agreed to Sanjeev's price · 3.00₹ per minute"},{kind:"day",text:"Today"},{id:1,kind:"call",from:"me",seconds:3000,paidText:"150.00₹",at:at(0.5)},{id:2,kind:"refund",from:"them",amountText:"75.00₹ │ GEU",percent:50,ofText:"150.00₹",what:"50 min call",at:at(0.4)}]};
  const SHOP={...P.rasoi, handle:"rasoi.ghar", city:"Alwar"};
  const EST=[{price:0,people:1180},{price:1,people:640},{price:2,people:412},{price:3,people:150},{price:5,people:60},{price:7,people:22}];
  const TXT="New: Rasoi Ghar is open on Kala Kuan Road. Chole bhature ₹60, first 100 orders get a free lassi 🥛";
  const SHARE={when:"Today 11:40",radius:5,text:TXT,delivered:1988,opened:233,replies:41,spentText:"486.00₹ │ GEU",heldText:"500.00₹ │ GEU",leftText:"14.00₹",spentPct:97,hoursLeft:36,nextText:"150 people at ₹3",replyRows:[{person:P.priya,text:"Do you deliver to Scheme 2?",km:"1.4"},{person:{id:"q1",name:"Mohit Jain",flag:"🇮🇳"},text:"Coming at 1 with office friends",km:"0.8"},{person:{id:"q2",name:"Sunita Devi",flag:"🇮🇳"},text:"Parcel 4 plates",km:"2.6"}]};
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
