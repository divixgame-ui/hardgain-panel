import { useState, useRef, useEffect, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ TENANT CONFIG (white-label ready) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const TENANT = {
  name: "Hardgain",
  tagline: "Agency Panel",
  primary: "#FF6B35",
  accent: "#4ECDC4",
  logo: "H",
  font: "'Syne', sans-serif",
};

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ GLOBAL CSS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:#060608;color:#d0d0d8;font-family:${TENANT.font};}
    ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:#0a0a0f;}::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px;}
    input,textarea,select{font-family:inherit;}input::placeholder,textarea::placeholder{color:#2a2a3a;}
    @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px ${TENANT.primary}40}50%{box-shadow:0 0 20px ${TENANT.primary}80}}
    @keyframes hot{0%,100%{background:#FF6B3520}50%{background:#FF6B3535}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .fu{animation:fu .25s ease forwards}
    .hc:hover{background:#0f0f18!important;transition:background .12s}
    .hr:hover{background:#0d0d16!important;transition:background .12s}
    .nb:hover{background:#111120!important;color:#bbb!important;transition:all .12s}
    .blur5{filter:blur(5px);user-select:none;pointer-events:none}
    .hot-row{animation:hot 2s infinite}
  `}</style>
);

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ DATA Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const CLIENTS = [
  {id:"c1",name:"FitZone Studio",email:"fitzone@gmail.com",phone:"500 123 456",avatar:"F",color:"#FF6B35",region:"maÃÂopolskie",city:"KrakÃÂ³w",lat:50.06,lng:19.94,plan_key:"pro",plan:"Pro",planPrice:2500,since:"2026-01-10",nip:"123-456-78-90",address:"ul. Sportowa 12, 30-001 KrakÃÂ³w",status:"active",
    stats:{leads:87,cpl:18.4,spend:1601,conversion:12,revenue:8700,calls:34},
    weekLeads:[8,12,7,15,11,9,14],weekCpl:[21,18,24,16,19,22,17],
    monthLeads:[54,67,87],monthSpend:[980,1200,1601],
    funnel:{clicks:1240,leads:87,calls:34,clients:12},
    campaigns:[
      {id:"cp1",name:"Broad Ã¢ÂÂ Pakiet Roczny",status:"active",budget:50,spend:1240,leads:52,cpl:23.8,start:"2026-03-01",creative:"Video 25s Hook"},
      {id:"cp2",name:"Retargeting Ã¢ÂÂ Video",status:"active",budget:30,spend:361,leads:35,cpl:10.3,start:"2026-03-05",creative:"Karuzelka"},
    ],
    leads:[
      {id:1,name:"Marek Nowak",phone:"500 111 222",date:"2026-03-08 09:14",status:"new",campaign:"Broad",hot:14},
      {id:2,name:"Tomasz Kowal",phone:"601 222 333",date:"2026-03-08 07:33",status:"new",campaign:"Retargeting",hot:106},
      {id:3,name:"Piotr WiÃÂniewski",phone:"512 333 444",date:"2026-03-07 11:02",status:"contacted",campaign:"Broad",hot:1382},
      {id:4,name:"Adam Lewandowski",phone:"609 444 555",date:"2026-03-06 14:55",status:"qualified",campaign:"Retargeting",hot:2885},
      {id:5,name:"Krzysztof ZajÃÂc",phone:"513 555 666",date:"2026-03-05 20:11",status:"closed_won",campaign:"Interests",hot:4749},
    ],
    messages:[
      {from:"admin",text:"CzeÃÂÃÂ! Kampania Broad ruszyÃÂa, pierwsze leady juÃÂ¼ wpadajÃÂ Ã°ÂÂÂ¥",time:"09:00"},
      {from:"client",text:"Super! Ile leadÃÂ³w dzisiaj?",time:"09:15"},
      {from:"admin",text:"8 od rana, CPL ~21 zÃÂ. OptymalizujÃÂ grupÃÂ docelowÃÂ.",time:"09:18"},
    ],
    tickets:[{id:"t1",title:"Nie widzÃÂ leadÃÂ³w z marca",status:"resolved",date:"2026-03-05",priority:"high"}],
    creatives:[
      {id:"cr1",name:"Hook Video Ã¢ÂÂ Pakiet Roczny",type:"video",status:"pending_approval",campaign:"Broad",thumb:"Ã°ÂÂÂ¬"},
      {id:"cr2",name:"Karuzelka Ã¢ÂÂ Transformacje",type:"image",status:"approved",campaign:"Retargeting",thumb:"Ã°ÂÂÂ¼"},
    ],
    campaignOrders:[],
  },
  {id:"c2",name:"Marcin Trener",email:"marcin@pt.pl",phone:"601 234 567",avatar:"M",color:"#4ECDC4",region:"maÃÂopolskie",city:"Nowy SÃÂcz",lat:49.62,lng:20.69,plan_key:"free",plan:"Starter",planPrice:1500,since:"2026-02-01",nip:"987-654-32-10",address:"ul. Fitness 5, 31-002 Nowy SÃÂcz",status:"active",
    stats:{leads:34,cpl:22.1,spend:750,conversion:9,revenue:3400,calls:12},
    weekLeads:[3,5,4,6,4,5,7],weekCpl:[22,20,25,19,23,21,18],
    monthLeads:[24,34],monthSpend:[600,750],
    funnel:{clicks:620,leads:34,calls:12,clients:3},
    campaigns:[{id:"cp4",name:"Broad Ã¢ÂÂ Personal Training",status:"active",budget:30,spend:750,leads:34,cpl:22.1,start:"2026-02-01",creative:"Video 25s"}],
    leads:[
      {id:6,name:"Bartek Kowalczyk",phone:"555 111 222",date:"2026-03-08 10:00",status:"new",campaign:"Broad PT",hot:5},
      {id:7,name:"RafaÃÂ Mazur",phone:"666 222 333",date:"2026-03-07 15:30",status:"contacted",campaign:"Broad PT",hot:1110},
    ],
    messages:[{from:"admin",text:"Raport tygodniowy Ã¢ÂÂ 34 leady, CPL 22 zÃÂ.",time:"Wtorek"},{from:"client",text:"MoÃÂ¼emy zwiÃÂkszyÃÂ budÃÂ¼et?",time:"Wtorek"}],
    tickets:[],creatives:[{id:"cr4",name:"Video Ã¢ÂÂ PT",type:"video",status:"approved",campaign:"Broad PT",thumb:"Ã°ÂÂÂ¬"}],
    campaignOrders:[],
  },
  {id:"c3",name:"PowerGym KrakÃÂ³w",email:"power@gym.pl",phone:"512 345 678",avatar:"P",color:"#A78BFA",region:"maÃÂopolskie",city:"KrakÃÂ³w",lat:50.08,lng:19.97,plan_key:"free",plan:"Pro",planPrice:2500,since:"2026-03-01",nip:"111-222-33-44",address:"ul. SiÃÂownia 99, 30-500 KrakÃÂ³w",status:"trial",
    stats:{leads:12,cpl:31.5,spend:378,conversion:0,revenue:0,calls:3},
    weekLeads:[1,2,1,3,2,1,2],weekCpl:[31,28,35,30,32,29,33],
    monthLeads:[12],monthSpend:[378],
    funnel:{clicks:340,leads:12,calls:3,clients:0},
    campaigns:[{id:"cp5",name:"Launch Ã¢ÂÂ Karnet",status:"active",budget:40,spend:378,leads:12,cpl:31.5,start:"2026-03-01",creative:"Video 25s"}],
    leads:[{id:8,name:"Grzegorz Nowak",phone:"777 333 444",date:"2026-03-08 08:00",status:"new",campaign:"Launch",hot:65}],
    messages:[],tickets:[{id:"t2",title:"Kiedy startuje kampania?",status:"open",date:"2026-03-07",priority:"medium"}],
    creatives:[],campaignOrders:[],
  },
  {id:"c4",name:"Elite Gym Warszawa",email:"elite@gym.pl",phone:"600 987 654",avatar:"E",color:"#F7C59F",region:"mazowieckie",city:"Warszawa",lat:52.23,lng:21.01,plan_key:"pro",plan:"Pro",planPrice:3000,since:"2025-11-01",nip:"555-666-77-88",address:"ul. Mokotowska 44, 00-001 Warszawa",status:"active",
    stats:{leads:124,cpl:15.2,spend:1885,conversion:18,revenue:14400,calls:58},
    weekLeads:[14,18,12,20,16,13,18],weekCpl:[16,14,17,15,16,14,15],
    monthLeads:[89,98,124],monthSpend:[1350,1580,1885],
    funnel:{clicks:1800,leads:124,calls:58,clients:18},
    campaigns:[
      {id:"cp6",name:"Broad Ã¢ÂÂ Karnet Roczny",status:"active",budget:60,spend:1200,leads:80,cpl:15.0,start:"2025-11-01",creative:"Video 30s"},
      {id:"cp7",name:"Retargeting Warszawa",status:"active",budget:25,spend:685,leads:44,cpl:15.6,start:"2026-01-15",creative:"Karuzelka"},
    ],
    leads:[{id:9,name:"Karol WiÃÂniewski",phone:"600 100 200",date:"2026-03-08 08:30",status:"new",campaign:"Broad",hot:32}],
    messages:[],tickets:[],creatives:[],campaignOrders:[],
  },
  {id:"c5",name:"IronBody WrocÃÂaw",email:"iron@body.pl",phone:"700 111 222",avatar:"I",color:"#34D399",region:"dolnoÃÂlÃÂskie",city:"WrocÃÂaw",lat:51.11,lng:17.02,plan_key:"pro",plan:"Agency",planPrice:2200,since:"2026-01-20",nip:"333-444-55-66",address:"ul. ÃÂwidnicka 20, 50-001 WrocÃÂaw",status:"active",
    stats:{leads:56,cpl:19.8,spend:1109,conversion:10,revenue:6200,calls:22},
    weekLeads:[6,8,7,9,7,8,11],weekCpl:[20,18,22,19,21,18,20],
    monthLeads:[38,56],monthSpend:[750,1109],
    funnel:{clicks:890,leads:56,calls:22,clients:10},
    campaigns:[{id:"cp8",name:"Broad Ã¢ÂÂ Transformacja",status:"active",budget:45,spend:1109,leads:56,cpl:19.8,start:"2026-01-20",creative:"Video 25s"}],
    leads:[{id:10,name:"ÃÂukasz Nowak",phone:"700 222 333",date:"2026-03-08 07:15",status:"new",campaign:"Broad",hot:88}],
    messages:[],tickets:[],creatives:[],campaignOrders:[],
  },
];

const CALENDAR_EVENTS = [
  {id:"e1",clientId:"c1",title:"Call Ã¢ÂÂ wyniki marca",date:"2026-03-10",time:"10:00",type:"call",duration:30},
  {id:"e2",clientId:"c4",title:"Strategia Q2",date:"2026-03-12",time:"14:00",type:"meeting",duration:60},
  {id:"e3",clientId:"c2",title:"Onboarding nowa kampania",date:"2026-03-15",time:"11:00",type:"onboarding",duration:45},
  {id:"e4",clientId:"c1",title:"Prezentacja raportu",date:"2026-03-18",time:"16:00",type:"report",duration:30},
  {id:"e5",clientId:"c5",title:"Call Ã¢ÂÂ nowe kreacje",date:"2026-03-20",time:"09:00",type:"call",duration:30},
  {id:"e6",clientId:"c3",title:"Kickoff kampania Q2",date:"2026-03-22",time:"13:00",type:"meeting",duration:60},
  {id:"e7",clientId:"c4",title:"Raport miesiÃÂczny",date:"2026-03-25",time:"15:00",type:"report",duration:30},
  {id:"e8",clientId:"c2",title:"Strategia Ã¢ÂÂ zwiÃÂkszenie budÃÂ¼etu",date:"2026-03-08",time:"12:00",type:"call",duration:30},
];

const USERS = [
  {id:"admin",role:"admin",name:"Jan",email:"jan@hardgain.pl",password:"admin123",avatar:"J",color:"#FF6B35"},
  {id:"c1",role:"client",email:"fitzone@gmail.com",password:"klient1"},
  {id:"c2",role:"client",email:"marcin@pt.pl",password:"klient2"},
];

const REGIONS_DATA = [
  {name:"maÃÂopolskie",count:3,leads:133,revenue:12100},
  {name:"mazowieckie",count:1,leads:124,revenue:14400},
  {name:"dolnoÃÂlÃÂskie",count:1,leads:56,revenue:6200},
];

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ HELPERS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const fmt = n => (n||0).toLocaleString("pl-PL");
const mono = (v, col="#fff") => <span style={{fontFamily:"'JetBrains Mono',monospace",color:col,fontWeight:700}}>{v}</span>;
const M = ({c,s}) => <span style={{fontFamily:"'JetBrains Mono',monospace",color:c,fontWeight:700,fontSize:s||"inherit"}}></span>;

const LEAD_S = {new:["Nowy","#FF6B35"],contacted:["Kontakt","#F7C59F"],qualified:["Kwalif.","#4ECDC4"],closed_won:["ZamkniÃÂty","#45B7AA"],closed_lost:["Odpada","#444"]};
const LBadge = ({s}) => { const [l,c]=LEAD_S[s]||["?","#888"]; return <span style={{background:c+"18",color:c,border:`1px solid ${c}30`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{l}</span>;};

function HotTimer({m}) {
  if(m>1440) return <span style={{color:"#333",fontSize:11,fontFamily:"mono"}}>{Math.floor(m/60)}h temu</span>;
  if(m>60) return <span style={{color:"#F7C59F",fontSize:11}}>{Math.floor(m/60)}h temu</span>;
  return <span style={{color:"#FF6B35",fontSize:11,fontWeight:800,animation:"glow 2s infinite",textShadow:"0 0 8px #FF6B3560"}}>Ã°ÂÂÂ¥ {m} min</span>;
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ STAT CARD Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function KPI({label,value,sub,accent="#fff",icon,trend,locked,onUpgrade}) {
  return (
    <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #1a1a2e",borderRadius:16,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
      {locked&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"#06060870",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16,cursor:"pointer"}} onClick={onUpgrade}><span style={{background:"#0f0f1e",border:"1px solid #2a2a3e",borderRadius:10,padding:"8px 14px",fontSize:11,color:"#888",fontWeight:700}}>Ã°ÂÂÂ Pro</span></div>}
      <div style={{position:"absolute",top:12,right:14,fontSize:22,opacity:.15}}>{icon}</div>
      <div style={{fontSize:26,fontWeight:900,color:accent,fontFamily:"'JetBrains Mono',monospace",lineHeight:1,marginBottom:6}}>{value}</div>
      <div style={{fontSize:11,color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
      {(sub||trend)&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
        {trend&&<span style={{fontSize:10,fontWeight:700,color:trend>0?"#4ECDC4":"#FF6B35"}}>{trend>0?"Ã¢ÂÂ²":"Ã¢ÂÂ¼"} {Math.abs(trend)}%</span>}
        {sub&&<span style={{fontSize:10,color:"#333"}}>{sub}</span>}
      </div>}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ TABS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function Tabs({tabs,active,onSelect}) {
  return (
    <div style={{display:"flex",gap:2,background:"#0a0a12",border:"1px solid #151520",borderRadius:14,padding:3,flexWrap:"wrap",marginBottom:22}}>
      {tabs.map(([k,l,ic])=>(
        <button key={k} onClick={()=>onSelect(k)} style={{background:active===k?"#161625":"none",border:"none",color:active===k?"#fff":"#383848",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:active===k?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .12s",display:"flex",alignItems:"center",gap:5}}>
          {ic&&<span style={{opacity:.7}}>{ic}</span>}{l}
        </button>
      ))}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ SECTION HEADER Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const SH = ({title,sub,btn,onBtn,badge}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
    <div>
      <h2 style={{fontSize:21,fontWeight:900,color:"#fff",letterSpacing:"-0.03em",display:"flex",alignItems:"center",gap:10}}>
        {title}
        {badge&&<span style={{background:"#FF6B3520",color:"#FF6B35",border:"1px solid #FF6B3530",borderRadius:8,padding:"2px 10px",fontSize:11,fontWeight:800}}>{badge}</span>}
      </h2>
      {sub&&<p style={{color:"#333",fontSize:12,marginTop:3}}>{sub}</p>}
    </div>
    {btn&&<button onClick={onBtn} style={{background:"linear-gradient(135deg,#FF6B35,#e05020)",border:"none",color:"#fff",borderRadius:10,padding:"9px 18px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px #FF6B3330"}}>{btn}</button>}
  </div>
);

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ SIDEBAR Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const ADMIN_NAV = [
  ["dashboard","Ã¢ÂÂ","Dashboard",""],
  ["clients","Ã¢ÂÂ","Klienci",""],
  ["map","Ã¢Â¬Â¡","Mapa Polski",""],
  ["calendar","Ã¢ÂÂ·","Kalendarz",""],
  ["campaigns","Ã¢ÂÂ¶","Kampanie",""],
  ["leads_all","Ã¢ÂÂ","Wszystkie leady",""],
  ["reports","Ã¢ÂÂ¤","Raporty",""],
  ["chat","Ã¢ÂÂ","Chat",""],
  ["tickets","Ã¢ÂÂ³","ZgÃÂoszenia",""],
  ["wiki","Ã¢ÂÂ§","Wiki",""],
  ["invoices","Ã¢ÂÂ£","Faktury",""],
  ["settings","Ã¢ÂÂ","Ustawienia",""],
];

function Sidebar({nav,view,setView,onLogout,badge,u}) {
  return (
    <div style={{width:220,background:"#080810",borderRight:"1px solid #0f0f1e",display:"flex",flexDirection:"column",position:"fixed",top:0,bottom:0,left:0,zIndex:60}}>
      <div style={{padding:"16px 14px",borderBottom:"1px solid #0f0f1e"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#fff",boxShadow:`0 4px 14px ${TENANT.primary}40`,flexShrink:0}}>{TENANT.logo}</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>{TENANT.name}</div>
            <div style={{fontSize:9,color:"#252535",letterSpacing:"0.1em",textTransform:"uppercase"}}>{TENANT.tagline}</div>
          </div>
        </div>
      </div>
      <nav style={{padding:"8px 6px",flex:1,overflowY:"auto"}}>
        {nav.map(([v,icon,label])=>(
          <button key={v} className="nb" onClick={()=>setView(v)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:view===v?"#13132a":view.startsWith(v+"_")?"#10102000":"none",border:"none",color:view===v?"#e8e8ff":"#2e2e45",borderRadius:9,padding:"8px 10px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:view===v?700:400,marginBottom:1,transition:"all .1s",position:"relative"}}>
            <span style={{fontSize:14,color:view===v?TENANT.primary:"inherit"}}>{icon}</span>
            {label}
            {v==="tickets"&&badge>0&&<span style={{marginLeft:"auto",background:"#FF6B35",color:"#fff",borderRadius:8,padding:"1px 6px",fontSize:9,fontWeight:900}}>{badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{padding:"8px 6px",borderTop:"1px solid #0f0f1e"}}>
        <div style={{padding:"9px 10px",background:"#0f0f1e",borderRadius:10,marginBottom:6,display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,background:"#FF6B3520",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#FF6B35",flexShrink:0}}>{u?.avatar||"J"}</div>
          <div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#bbb",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u?.name||"Jan"}</div><div style={{fontSize:9,color:"#252535"}}>Admin</div></div>
        </div>
        <button onClick={onLogout} style={{width:"100%",background:"none",border:"none",color:"#1e1e30",fontSize:10,cursor:"pointer",fontFamily:"inherit",padding:"3px 0"}}>Wyloguj Ã¢ÂÂ</button>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ LOGIN Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function Login({onLogin}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const handle=()=>{setLoading(true);setErr("");setTimeout(()=>{const u=USERS.find(u=>u.email===email&&u.password===pass);if(u)onLogin(u);else{setErr("NieprawidÃÂowy email lub hasÃÂo");setLoading(false);}},500);};
  return (
    <div style={{minHeight:"100vh",background:"#060608",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <G/>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",width:60,height:60,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,borderRadius:18,alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",marginBottom:18,boxShadow:`0 8px 32px ${TENANT.primary}55`}}>{TENANT.logo}</div>
          <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>{TENANT.name} Panel</div>
          <div style={{color:"#2e2e45",fontSize:13,marginTop:5}}>Marketing dla trenerÃÂ³w i siÃÂowni</div>
        </div>
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #1a1a2e",borderRadius:20,padding:28}}>
          {[["Email",email,setEmail,"email"],["HasÃÂo",pass,setPass,"password"]].map(([l,v,s,t])=>(
            <div key={l} style={{marginBottom:16}}>
              <div style={{color:"#2e2e45",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{l}</div>
              <input type={t} value={v} onChange={e=>s(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:14,outline:"none",transition:"border-color .1s"}} onFocus={e=>e.target.style.borderColor="#FF6B3555"} onBlur={e=>e.target.style.borderColor="#151525"}/>
            </div>
          ))}
          {err&&<div style={{color:"#FF6B35",fontSize:12,background:"#FF6B3510",padding:"8px 12px",borderRadius:8,marginBottom:14}}>{err}</div>}
          <button onClick={handle} disabled={loading} style={{width:"100%",background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"13px 0",fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 18px ${TENANT.primary}40`,letterSpacing:"-0.01em"}}>
            {loading?"Logowanie...":"Zaloguj siÃÂ Ã¢ÂÂ"}
          </button>
        </div>
        <div style={{marginTop:14,background:"#08080f",border:"1px solid #101018",borderRadius:12,padding:14}}>
          <div style={{color:"#1e1e2e",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Demo</div>
          {[{l:"Ã°ÂÂÂ Admin",e:"jan@hardgain.pl",p:"admin123"},{l:"Ã¢ÂÂ FitZone",e:"fitzone@gmail.com",p:"klient1"},{l:"Ã°ÂÂÂ Marcin (FREE)",e:"marcin@pt.pl",p:"klient2"}].map(d=>(
            <button key={d.e} onClick={()=>{setEmail(d.e);setPass(d.p);}} style={{display:"block",width:"100%",background:"none",border:"none",color:"#383848",cursor:"pointer",textAlign:"left",padding:"3px 0",fontSize:12,fontFamily:"inherit"}}>{d.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
   ADMIN APP
Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminApp({user,onLogout}) {
  const [view,setView]=useState("dashboard");
  const [clients,setClients]=useState(CLIENTS);
  const [events,setEvents]=useState(CALENDAR_EVENTS);
  const [focusId,setFocusId]=useState(null);
  const openTickets=clients.flatMap(c=>c.tickets).filter(t=>t.status==="open").length;
  const focus=clients.find(c=>c.id===focusId);
  const openClient=(id)=>{setFocusId(id);setView("client_focus");};

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#060608"}}>
      <G/>
      <Sidebar nav={ADMIN_NAV} view={view} setView={v=>{setView(v);setFocusId(null);}} onLogout={onLogout} badge={openTickets} u={user}/>
      <main style={{marginLeft:220,flex:1,overflowX:"hidden"}}>
        {!focusId&&view==="dashboard"&&<AdminDash clients={clients} events={events} onOpen={openClient}/>}
        {!focusId&&view==="clients"&&<AdminClients clients={clients} onOpen={openClient}/>}
        {!focusId&&view==="map"&&<AdminMap clients={clients}/>}
        {!focusId&&view==="calendar"&&<AdminCalendar clients={clients} events={events} setEvents={setEvents}/>}
        {!focusId&&view==="campaigns"&&<AdminCampaigns clients={clients}/>}
        {!focusId&&view==="leads_all"&&<AdminLeadsAll clients={clients}/>}
        {!focusId&&view==="reports"&&<AdminReports clients={clients}/>}
        {!focusId&&view==="chat"&&<AdminChat clients={clients} setClients={setClients}/>}
        {!focusId&&view==="tickets"&&<AdminTickets clients={clients} setClients={setClients}/>}
        {!focusId&&view==="wiki"&&<AdminWiki/>}
        {!focusId&&view==="invoices"&&<AdminInvoices clients={clients}/>}
        {!focusId&&view==="settings"&&<AdminSettings/>}
        {focusId&&focus&&<AdminClientFocus client={focus} clients={clients} setClients={setClients} events={events} setEvents={setEvents} onBack={()=>{setFocusId(null);setView("clients");}}/>}
      </main>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ PRO DASHBOARD Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminDash({clients,events,onOpen}) {
  const tL=clients.reduce((s,c)=>s+c.stats.leads,0);
  const tS=clients.reduce((s,c)=>s+c.stats.spend,0);
  const tR=clients.reduce((s,c)=>s+c.stats.revenue,0);
  const tC=clients.reduce((s,c)=>s+c.stats.calls,0);
  const avgCPL=(clients.reduce((s,c)=>s+c.stats.cpl,0)/clients.length).toFixed(1);
  const today=new Date().toISOString().split("T")[0];
  const todayEvents=events.filter(e=>e.date===today);
  const upcomingEvents=events.filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);

  // Combined weekly data for area chart
  const weekData=["Pon","Wt","ÃÂr","Czw","Pt","Sob","Nd"].map((d,i)=>({
    day:d,
    leads:clients.reduce((s,c)=>s+(c.weekLeads[i]||0),0),
    cpl:+(clients.reduce((s,c)=>s+(c.weekCpl[i]||0),0)/clients.length).toFixed(1),
  }));

  // Monthly trend
  const monthData=[
    {m:"Sty",leads:clients.reduce((s,c)=>s+(c.monthLeads[0]||0),0),spend:clients.reduce((s,c)=>s+(c.monthSpend[0]||0),0)},
    {m:"Lut",leads:clients.reduce((s,c)=>s+(c.monthLeads[1]||0),0),spend:clients.reduce((s,c)=>s+(c.monthSpend[1]||0),0)},
    {m:"Mar",leads:clients.reduce((s,c)=>s+(c.monthLeads[2]||0),0),spend:clients.reduce((s,c)=>s+(c.monthSpend[2]||0),0)},
  ];

  // Client ranking
  const ranked=[...clients].sort((a,b)=>b.stats.leads-a.stats.leads);

  // Top leads this hour
  const hotLeads=clients.flatMap(c=>c.leads.map(l=>({...l,cname:c.name,ccolor:c.color}))).filter(l=>l.hot<=120).sort((a,b)=>a.hot-b.hot);

  const evColor={call:"#FF6B35",meeting:"#4ECDC4",onboarding:"#A78BFA",report:"#F7C59F"};

  return (
    <div style={{padding:28}} className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>Dashboard</h1>
          <p style={{color:"#252535",fontSize:12,marginTop:3}}>Marzec 2026 ÃÂ· {clients.length} klientÃÂ³w ÃÂ· {clients.filter(c=>c.status==="active").length} aktywnych</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {todayEvents.length>0&&<div style={{background:"#FF6B3510",border:"1px solid #FF6B3525",borderRadius:10,padding:"6px 12px",fontSize:11,color:"#FF6B35",fontWeight:700}}>Ã°ÂÂÂ {todayEvents.length} spotkaÃÂ dziÃÂ</div>}
          <div style={{background:"#0d0d18",border:"1px solid #151525",borderRadius:10,padding:"7px 14px",fontSize:12,color:"#555"}}>Sun, 08 Mar 2026</div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
        <KPI label="ÃÂÃÂczne leady" value={tL} accent="#FF6B35" icon="Ã°ÂÂÂ¯" trend={+22} sub="vs. luty"/>
        <KPI label="BudÃÂ¼et wydany" value={fmt(tS)+" zÃÂ"} accent="#F7C59F" icon="Ã°ÂÂÂ°" trend={+18}/>
        <KPI label="PrzychÃÂ³d agencji" value={fmt(tR)+" zÃÂ"} accent="#4ECDC4" icon="Ã°ÂÂÂ" trend={+31}/>
        <KPI label="ÃÂr. CPL" value={avgCPL+" zÃÂ"} accent="#A78BFA" icon="Ã¢ÂÂ¡" trend={-8} sub="malejÃÂcy Ã¢ÂÂ"/>
        <KPI label="Rozmowy" value={tC} accent="#34D399" icon="Ã°ÂÂÂ" trend={+14}/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        {/* Area chart leady */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontWeight:700,color:"#fff",fontSize:13}}>Leady ÃÂ· ostatnie 7 dni</div>
            <div style={{display:"flex",gap:10}}>
              {[["leady","#FF6B35"],["CPL","#4ECDC4"]].map(([l,c])=><span key={l} style={{fontSize:10,color:c,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}></span>{l}</span>)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2}/><stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/></linearGradient>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.2}/><stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f0f18"/>
              <XAxis dataKey="day" tick={{fill:"#252535",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:10,color:"#fff",fontSize:12}}/>
              <Area type="monotone" dataKey="leads" stroke="#FF6B35" strokeWidth={2} fill="url(#lG)" dot={{fill:"#FF6B35",r:3}}/>
              <Area type="monotone" dataKey="cpl" stroke="#4ECDC4" strokeWidth={2} fill="url(#cG)" dot={{fill:"#4ECDC4",r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly bar */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20}}>
          <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:16}}>Trend miesiÃÂczny</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f0f18"/>
              <XAxis dataKey="m" tick={{fill:"#252535",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:10,color:"#fff",fontSize:12}}/>
              <Bar dataKey="leads" fill="#FF6B35" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: ranking + hot leads + upcoming */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        {/* Client ranking */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #0f0f1a"}}><span style={{fontWeight:700,color:"#fff",fontSize:12}}>Ranking klientÃÂ³w</span></div>
          {ranked.map((c,i)=>(
            <div key={c.id} className="hr" onClick={()=>onOpen(c.id)} style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #0a0a12",cursor:"pointer",gap:10}}>
              <span style={{color:"#1e1e2e",fontWeight:900,fontSize:11,fontFamily:"mono",width:16}}>#{i+1}</span>
              <div style={{width:26,height:26,background:c.color+"15",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:10,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"#bbb",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div></div>
              <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#FF6B35",fontSize:12,fontWeight:700}}>{c.stats.leads}</span>
            </div>
          ))}
        </div>

        {/* Hot leads */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #0f0f1a",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,color:"#fff",fontSize:12}}>Ã°ÂÂÂ¥ GorÃÂce leady</span>
            <span style={{color:"#333",fontSize:10}}>ostatnie 2h</span>
          </div>
          {hotLeads.length===0?<div style={{padding:"30px 16px",textAlign:"center",color:"#252535",fontSize:12}}>Brak gorÃÂcych leadÃÂ³w</div>:
          hotLeads.map(l=>(
            <div key={l.id} className="hot-row" style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:"1px solid #0a0a12",gap:9}}>
              <div style={{width:24,height:24,background:"#FF6B3518",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#FF6B35",fontWeight:900,fontSize:9,flexShrink:0}}>{l.name.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"#e0e0e8",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div><div style={{color:"#252535",fontSize:10}}>{l.cname}</div></div>
              <HotTimer m={l.hot}/>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #0f0f1a"}}><span style={{fontWeight:700,color:"#fff",fontSize:12}}>Ã°ÂÂÂ NajbliÃÂ¼sze spotkania</span></div>
          {upcomingEvents.map(ev=>{
            const cl=clients.find(c=>c.id===ev.clientId);
            return (
              <div key={ev.id} style={{display:"flex",padding:"10px 14px",borderBottom:"1px solid #0a0a12",gap:10,alignItems:"center"}}>
                <div style={{width:3,height:32,borderRadius:2,background:evColor[ev.type]||"#555",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#c0c0d0",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                  <div style={{color:"#252535",fontSize:10,marginTop:1}}>{cl?.name} ÃÂ· {ev.date.slice(5)} {ev.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ MAPA POLSKI Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminMap({clients}) {
  const [hovered,setHovered]=useState(null);
  const [selected,setSelected]=useState(null);

  const regionLeads={};
  const regionClients={};
  clients.forEach(c=>{
    if(!regionLeads[c.region])regionLeads[c.region]=0;
    if(!regionClients[c.region])regionClients[c.region]=[];
    regionLeads[c.region]+=c.stats.leads;
    regionClients[c.region].push(c);
  });

  const maxLeads=Math.max(...Object.values(regionLeads),1);
  const intensity=(r)=>Math.min(regionLeads[r]||0,maxLeads)/maxLeads;

  // Simplified Polish voivodeships paths (SVG coordinates)
  const REGIONS=[
    {id:"dolnoÃÂlÃÂskie",label:"dolnoÃÂlÃÂskie",path:"M 95 245 L 130 235 L 155 250 L 160 280 L 145 300 L 110 305 L 90 285 Z",cx:125,cy:272},
    {id:"kujawsko-pomorskie",label:"kuj.-pom.",path:"M 175 130 L 220 120 L 245 140 L 240 170 L 200 180 L 170 165 Z",cx:207,cy:152},
    {id:"lubelskie",label:"lubelskie",path:"M 295 205 L 345 200 L 365 230 L 355 280 L 315 285 L 290 260 Z",cx:328,cy:245},
    {id:"lubuskie",label:"lubuskie",path:"M 60 165 L 100 155 L 115 185 L 100 215 L 68 210 Z",cx:90,cy:188},
    {id:"ÃÂÃÂ³dzkie",label:"ÃÂÃÂ³dzkie",path:"M 200 190 L 250 180 L 270 210 L 255 245 L 210 250 L 190 225 Z",cx:230,cy:220},
    {id:"maÃÂopolskie",label:"maÃÂopolskie",path:"M 215 295 L 270 285 L 300 305 L 285 340 L 245 345 L 215 325 Z",cx:257,cy:318},
    {id:"mazowieckie",label:"mazowieckie",path:"M 235 155 L 300 148 L 320 185 L 300 215 L 250 220 L 225 195 Z",cx:275,cy:185},
    {id:"opolskie",label:"opolskie",path:"M 155 258 L 195 252 L 205 278 L 185 300 L 155 295 Z",cx:182,cy:278},
    {id:"podkarpackie",label:"podkarpackie",path:"M 285 300 L 335 295 L 355 320 L 340 355 L 295 355 L 275 330 Z",cx:315,cy:328},
    {id:"podlaskie",label:"podlaskie",path:"M 310 110 L 365 105 L 380 145 L 360 170 L 315 168 Z",cx:347,cy:140},
    {id:"pomorskie",label:"pomorskie",path:"M 145 75 L 210 65 L 235 95 L 215 125 L 160 130 L 135 105 Z",cx:183,cy:98},
    {id:"ÃÂlÃÂskie",label:"ÃÂlÃÂskie",path:"M 175 270 L 220 262 L 235 290 L 220 315 L 180 318 L 165 295 Z",cx:200,cy:293},
    {id:"ÃÂwiÃÂtokrzyskie",label:"ÃÂwiÃÂtokrzyskie",path:"M 248 245 L 288 238 L 295 262 L 278 280 L 248 278 Z",cx:272,cy:261},
    {id:"warmiÃÂsko-mazurskie",label:"warm.-maz.",path:"M 250 95 L 310 88 L 330 120 L 305 150 L 248 148 Z",cx:290,cy:122},
    {id:"wielkopolskie",label:"wielkopolskie",path:"M 115 165 L 180 155 L 200 190 L 180 225 L 125 230 L 100 200 Z",cx:155,cy:193},
    {id:"zachodniopomorskie",label:"zach.-pom.",path:"M 55 105 L 130 90 L 148 125 L 135 158 L 75 160 L 48 135 Z",cx:100,cy:130},
  ];

  const sel=selected?regionClients[selected]||[]:null;

  return (
    <div style={{padding:28}} className="fu">
      <SH title="Mapa klientÃÂ³w" sub="RozkÃÂad geograficzny Ã¢ÂÂ kliknij region po szczegÃÂ³ÃÂy"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        {/* Map */}
        <div style={{background:"linear-gradient(135deg,#0d0d18,#08080f)",border:"1px solid #151520",borderRadius:18,padding:24,position:"relative"}}>
          <svg viewBox="40 60 340 310" style={{width:"100%",maxHeight:520}}>
            {REGIONS.map(r=>{
              const hasClients=regionClients[r.id];
              const leads=regionLeads[r.id]||0;
              const inten=intensity(r.id);
              const isHov=hovered===r.id;
              const isSel=selected===r.id;
              const fill=hasClients
                ? isSel?"#FF6B35":isHov?"#FF6B3560":`rgba(255,107,53,${0.08+inten*0.45})`
                : isHov?"#1a1a2a":"#0e0e18";
              return (
                <g key={r.id} style={{cursor:"pointer"}} onMouseEnter={()=>setHovered(r.id)} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelected(selected===r.id?null:r.id)}>
                  <path d={r.path} fill={fill} stroke={isSel?"#FF6B35":isHov?"#FF6B3560":"#1a1a28"} strokeWidth={isSel?2:1} style={{transition:"fill .15s,stroke .15s"}}/>
                  <text x={r.cx} y={r.cy} textAnchor="middle" fontSize={7} fill={hasClients?(inten>0.5?"#fff":"#aaa"):"#2a2a3a"} fontWeight="600">{r.label}</text>
                  {leads>0&&<text x={r.cx} y={r.cy+9} textAnchor="middle" fontSize={7} fill="#FF6B35" fontWeight="900" fontFamily="JetBrains Mono">{leads}</text>}
                  {hasClients&&regionClients[r.id].map((c,i)=>(
                    <circle key={c.id} cx={r.cx+(i-regionClients[r.id].length/2+0.5)*10} cy={r.cy+18} r={4} fill={c.color} stroke="#060608" strokeWidth={1.5} opacity={.9}/>
                  ))}
                </g>
              );
            })}
            {/* Legend label */}
            <text x={55} y={360} fontSize={8} fill="#252535">Kliknij region Ã¢ÂÂ szczegÃÂ³ÃÂy</text>
          </svg>

          {/* Hover tooltip */}
          {hovered&&(
            <div style={{position:"absolute",top:20,right:20,background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:12,padding:"12px 16px",minWidth:160,pointerEvents:"none"}}>
              <div style={{fontWeight:800,color:"#fff",fontSize:13,textTransform:"capitalize",marginBottom:6}}>{hovered}</div>
              <div style={{color:"#FF6B35",fontSize:20,fontWeight:900,fontFamily:"mono"}}>{regionLeads[hovered]||0}</div>
              <div style={{color:"#333",fontSize:11}}>leadÃÂ³w</div>
              <div style={{color:"#4ECDC4",fontSize:12,fontWeight:700,marginTop:4}}>{(regionClients[hovered]||[]).length} klientÃÂ³w</div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Region stats */}
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:18}}>
            <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:14}}>Regiony</div>
            {Object.entries(regionLeads).sort((a,b)=>b[1]-a[1]).map(([r,l])=>(
              <div key={r} className="hr" onClick={()=>setSelected(selected===r?null:r)} style={{padding:"8px 0",borderBottom:"1px solid #0e0e18",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:selected===r?"#FF6B35":"#888",fontSize:12,textTransform:"capitalize"}}>{r}</div>
                  <div style={{color:"#252535",fontSize:10}}>{(regionClients[r]||[]).length} klientÃÂ³w</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"mono",color:"#FF6B35",fontSize:13,fontWeight:700}}>{l}</div>
                  <div style={{color:"#252535",fontSize:9}}>leadÃÂ³w</div>
                </div>
                <div style={{width:40,height:4,background:"#0a0a12",borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${(l/maxLeads)*100}%`,height:"100%",background:"#FF6B35",borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Selected region clients */}
          {sel&&sel.length>0&&(
            <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #FF6B3530",borderRadius:16,padding:16}}>
              <div style={{fontWeight:700,color:"#FF6B35",fontSize:12,marginBottom:12,textTransform:"capitalize"}}>{selected}</div>
              {sel.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid #0e0e18"}}>
                  <div style={{width:28,height:28,background:c.color+"18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:10,flexShrink:0}}>{c.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:"#ccc",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{color:"#252535",fontSize:10}}>{c.city}</div>
                  </div>
                  <div style={{fontFamily:"mono",color:"#FF6B35",fontSize:12,fontWeight:700}}>{c.stats.leads}</div>
                </div>
              ))}
            </div>
          )}

          {/* Summary stats */}
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:18}}>
            <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:12}}>Podsumowanie</div>
            {[["Aktywne regiony",Object.keys(regionLeads).length,"#4ECDC4"],["ÃÂÃÂczne leady",Object.values(regionLeads).reduce((a,b)=>a+b,0),"#FF6B35"],["Najlepszy region",Object.entries(regionLeads).sort((a,b)=>b[1]-a[1])[0]?.[0]||"-","#F7C59F"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0e0e18"}}>
                <span style={{color:"#333",fontSize:12}}>{l}</span>
                <span style={{fontFamily:"mono",color:c,fontSize:12,fontWeight:700,textTransform:"capitalize"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ KALENDARZ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminCalendar({clients,events,setEvents}) {
  const [view,setView]=useState("month");
  const [currentDate,setCurrentDate]=useState(new Date(2026,2,1));
  const [showAdd,setShowAdd]=useState(false);
  const [newEv,setNewEv]=useState({clientId:"",title:"",date:"",time:"09:00",type:"call",duration:30});

  const year=currentDate.getFullYear();
  const month=currentDate.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const days=Array.from({length:42},(_,i)=>{const d=i-((firstDay+6)%7)+1;return d>0&&d<=daysInMonth?d:null;});
  const monthStr=`${year}-${String(month+1).padStart(2,"0")}`;
  const evColor={call:"#FF6B35",meeting:"#4ECDC4",onboarding:"#A78BFA",report:"#F7C59F"};
  const evIcon={call:"Ã°ÂÂÂ",meeting:"Ã°ÂÂ¤Â",onboarding:"Ã°ÂÂÂ",report:"Ã°ÂÂÂ"};

  const addEvent=()=>{
    if(!newEv.clientId||!newEv.title||!newEv.date)return;
    setEvents(prev=>[...prev,{...newEv,id:"e"+Date.now()}]);
    setShowAdd(false);
    setNewEv({clientId:"",title:"",date:"",time:"09:00",type:"call",duration:30});
  };

  return (
    <div style={{padding:28}} className="fu">
      <SH title="Kalendarz" sub="UmÃÂ³wione konsultacje i spotkania z klientami" btn="+ Dodaj spotkanie" onBtn={()=>setShowAdd(true)}/>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} style={{background:"#0d0d18",border:"1px solid #151520",color:"#666",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Ã¢ÂÂ</button>
        <span style={{fontWeight:800,color:"#fff",fontSize:16,minWidth:140,textAlign:"center"}}>{currentDate.toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} style={{background:"#0d0d18",border:"1px solid #151520",color:"#666",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Ã¢ÂÂ</button>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {["month","list"].map(v=><button key={v} onClick={()=>setView(v)} style={{background:view===v?"#161625":"#0d0d18",border:`1px solid ${view===v?"#252535":"#151520"}`,color:view===v?"#fff":"#444",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:view===v?700:400}}>{v==="month"?"MiesiÃÂc":"Lista"}</button>)}
        </div>
      </div>

      {view==="month"&&(
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:18,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid #0f0f18"}}>
            {["Pon","Wt","ÃÂr","Czw","Pt","Sob","Nd"].map(d=><div key={d} style={{padding:"10px 8px",textAlign:"center",fontSize:10,fontWeight:700,color:"#252535",letterSpacing:"0.08em",textTransform:"uppercase"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
            {days.map((d,i)=>{
              const dateStr=d?`${monthStr}-${String(d).padStart(2,"0")}`:null;
              const dayEvents=dateStr?events.filter(e=>e.date===dateStr):[];
              const isToday=dateStr==="2026-03-08";
              return (
                <div key={i} style={{borderBottom:"1px solid #0a0a12",borderRight:i%7<6?"1px solid #0a0a12":"none",minHeight:90,padding:6,background:isToday?"#FF6B3508":"transparent"}}>
                  {d&&<div style={{fontWeight:isToday?900:400,color:isToday?"#FF6B35":d?"#888":"#222",fontSize:12,marginBottom:4,width:22,height:22,background:isToday?"#FF6B35":"none",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{d}</div>}
                  {dayEvents.map(ev=>{
                    const cl=clients.find(c=>c.id===ev.clientId);
                    return (
                      <div key={ev.id} style={{background:evColor[ev.type]+"18",border:`1px solid ${evColor[ev.type]}30`,borderRadius:5,padding:"2px 5px",marginBottom:2,fontSize:9,color:evColor[ev.type],fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {evIcon[ev.type]} {ev.time} {ev.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="list"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {events.sort((a,b)=>a.date.localeCompare(b.date)||(a.time.localeCompare(b.time))).map(ev=>{
            const cl=clients.find(c=>c.id===ev.clientId);
            return (
              <div key={ev.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${evColor[ev.type]}25`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:40,height:40,background:evColor[ev.type]+"18",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{evIcon[ev.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:"#fff",fontSize:14}}>{ev.title}</div>
                  <div style={{color:"#333",fontSize:12,marginTop:2}}><span style={{color:cl?.color||"#666",fontWeight:700}}>{cl?.name||"Ã¢ÂÂ"}</span> ÃÂ· {ev.date} o {ev.time} ÃÂ· {ev.duration} min</div>
                </div>
                <span style={{background:evColor[ev.type]+"18",color:evColor[ev.type],border:`1px solid ${evColor[ev.type]}30`,borderRadius:8,padding:"4px 12px",fontSize:10,fontWeight:800,textTransform:"uppercase"}}>{ev.type}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add event modal */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:"#0d0d18",border:"1px solid #1e1e2e",borderRadius:20,width:"100%",maxWidth:420,padding:28}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,color:"#fff",fontSize:18,marginBottom:20}}>Nowe spotkanie</div>
            {[
              ["Klient","select",["clientId",[["","Ã¢ÂÂ wybierz Ã¢ÂÂ"],...clients.map(c=>[c.id,c.name])]]],
              ["TytuÃÂ","text",["title"]],
              ["Data","date",["date"]],
              ["Godzina","time",["time"]],
              ["Czas (min)","number",["duration"]],
            ].map(([l,t,[k,opts]])=>(
              <div key={k} style={{marginBottom:14}}>
                <div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{l}</div>
                {t==="select"?
                  <select value={newEv[k]} onChange={e=>setNewEv(p=>({...p,[k]:e.target.value}))} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"10px 12px",color:"#ddd",fontSize:13,outline:"none"}}>
                    {opts.map(([v,label])=><option key={v} value={v}>{label}</option>)}
                  </select>:
                  <input type={t} value={newEv[k]} onChange={e=>setNewEv(p=>({...p,[k]:e.target.value}))} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"10px 12px",color:"#ddd",fontSize:13,outline:"none"}}/>
                }
              </div>
            ))}
            <div style={{marginBottom:18}}>
              <div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Typ</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {Object.entries(evColor).map(([t,c])=>(
                  <button key={t} onClick={()=>setNewEv(p=>({...p,type:t}))} style={{background:newEv.type===t?c+"20":"#08080f",border:`1px solid ${newEv.type===t?c+"50":"#151525"}`,color:newEv.type===t?c:"#444",borderRadius:9,padding:"8px 0",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                    {evIcon[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"#141420",border:"1px solid #1e1e2e",color:"#555",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Anuluj</button>
              <button onClick={addEvent} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"11px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Dodaj spotkanie Ã¢ÂÂ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ CLIENTS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminClients({clients,onOpen}) {
  const [search,setSearch]=useState("");
  const filtered=clients.filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.city.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Baza klientÃÂ³w" sub={`${clients.length} klientÃÂ³w ÃÂ· ${clients.filter(c=>c.plan_key==="pro").length} Pro`} btn="+ Dodaj klienta"/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj po nazwie, mieÃÂcie..." style={{width:"100%",maxWidth:340,background:"#0d0d18",border:"1px solid #151520",borderRadius:10,padding:"9px 14px",color:"#ddd",fontSize:13,outline:"none",marginBottom:18}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
        {filtered.map(c=>(
          <div key={c.id} className="hc" onClick={()=>onOpen(c.id)} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:18,padding:20,cursor:"pointer",transition:"all .12s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:46,height:46,background:c.color+"15",border:`1px solid ${c.color}25`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:18,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color:"#fff",fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{color:"#252535",fontSize:11,marginTop:1}}>{c.city} ÃÂ· {c.email}</div>
              </div>
              <span style={{background:c.plan_key==="pro"?"#FF6B3518":"#141420",color:c.plan_key==="pro"?"#FF6B35":"#333",border:`1px solid ${c.plan_key==="pro"?"#FF6B3530":"#1e1e2e"}`,borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{c.plan_key==="pro"?"PRO":"FREE"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[["Leady",c.stats.leads,"#FF6B35"],["CPL",c.stats.cpl+" zÃÂ","#4ECDC4"],["PrzychÃÂ³d",fmt(c.stats.revenue)+" zÃÂ","#F7C59F"]].map(([l,v,col])=>(
                <div key={l} style={{background:"#08080f",borderRadius:9,padding:"8px 10px"}}>
                  <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                  <div style={{fontSize:9,color:"#252535",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid #0f0f18",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#1e1e2e",fontSize:10}}>Od {c.since} ÃÂ· {c.planPrice} zÃÂ/mies</span>
              <span style={{color:{active:"#4ECDC4",trial:"#F7C59F",inactive:"#444"}[c.status]||"#444",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ CAMPAIGNS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminCampaigns({clients}) {
  const all=clients.flatMap(c=>c.campaigns.map(cp=>({...cp,cName:c.name,cColor:c.color})));
  const active=all.filter(c=>c.status==="active");
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Kampanie" sub={`${active.length} aktywnych ÃÂ· ${all.length} ÃÂÃÂcznie`} btn="+ Nowa kampania"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <KPI label="Aktywne" value={active.length} accent="#4ECDC4" icon="Ã¢ÂÂ¶"/>
        <KPI label="ÃÂÃÂczne leady" value={all.reduce((s,c)=>s+c.leads,0)} accent="#FF6B35" icon="Ã°ÂÂÂ¯"/>
        <KPI label="ÃÂÃÂczny spend" value={fmt(all.reduce((s,c)=>s+c.spend,0))+" zÃÂ"} accent="#F7C59F" icon="Ã°ÂÂÂ°"/>
        <KPI label="ÃÂr. CPL" value={(all.reduce((s,c)=>s+c.cpl,0)/all.length).toFixed(1)+" zÃÂ"} accent="#A78BFA" icon="Ã¢ÂÂ¡"/>
      </div>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 70px 80px 90px",gap:0,padding:"10px 18px",borderBottom:"1px solid #0f0f18"}}>
          {["Kampania","Status","Leady","CPL","Spend","Klient"].map(h=><span key={h} style={{color:"#1e1e2e",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</span>)}
        </div>
        {all.map((c,i)=>(
          <div key={c.id} className="hr" style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 70px 80px 90px",gap:0,padding:"13px 18px",borderBottom:i<all.length-1?"1px solid #0a0a12":"none",alignItems:"center",cursor:"pointer"}}>
            <div><div style={{fontWeight:700,color:"#ddd",fontSize:13}}>{c.name}</div><div style={{color:"#252535",fontSize:10,marginTop:1}}>{c.creative} ÃÂ· od {c.start}</div></div>
            <span style={{background:c.status==="active"?"#4ECDC418":"#1a1a2a",color:c.status==="active"?"#4ECDC4":"#333",border:`1px solid ${c.status==="active"?"#4ECDC430":"#1e1e2e"}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,width:"fit-content"}}>{c.status==="active"?"Ã¢ÂÂ Aktywna":"Ã¢ÂÂ¸ Wstrzymana"}</span>
            <span style={{fontFamily:"mono",color:"#FF6B35",fontWeight:700}}>{c.leads}</span>
            <span style={{fontFamily:"mono",color:"#4ECDC4",fontWeight:700}}>{c.cpl} zÃÂ</span>
            <span style={{fontFamily:"mono",color:"#F7C59F",fontWeight:700}}>{fmt(c.spend)} zÃÂ</span>
            <span style={{color:c.cColor,fontSize:11,fontWeight:700}}>{c.cName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ LEADS ALL Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminLeadsAll({clients}) {
  const all=clients.flatMap(c=>c.leads.map(l=>({...l,cName:c.name,cColor:c.color})));
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all");
  const filtered=all.filter(l=>(filter==="all"||l.status===filter)&&(!search||l.name.toLowerCase().includes(search.toLowerCase())||l.phone.includes(search)));
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Wszystkie leady" sub={`${all.length} ÃÂÃÂcznie ÃÂ· ${all.filter(l=>l.hot<=120).length} gorÃÂcych`}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj..." style={{background:"#0d0d18",border:"1px solid #151520",borderRadius:10,padding:"8px 13px",color:"#ddd",fontSize:13,outline:"none",flex:"0 0 240px"}}/>
        <div style={{display:"flex",gap:4,background:"#08080f",border:"1px solid #101018",borderRadius:10,padding:3}}>
          {["all","new","contacted","qualified","closed_won"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{background:filter===s?"#131320":"none",border:"none",color:filter===s?"#fff":"#333",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:filter===s?700:400}}>{s==="all"?"Wszystkie":LEAD_S[s]?.[0]||s}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.map(l=>(
          <div key={l.id} className="hr" style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${l.hot<=60?"#FF6B3520":"#151520"}`,borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"background .1s"}}>
            <div style={{width:32,height:32,background:"#FF6B3515",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#FF6B35",fontWeight:900,fontSize:12,flexShrink:0}}>{l.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:"#e0e0e8",fontSize:13}}>{l.name}</div>
              <div style={{color:"#252535",fontSize:11,marginTop:1}}>{l.phone} ÃÂ· {l.campaign}</div>
            </div>
            <HotTimer m={l.hot}/>
            <span style={{color:l.cColor,background:l.cColor+"12",border:`1px solid ${l.cColor}22`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{l.cName}</span>
            <LBadge s={l.status}/>
            <a href={`tel:${l.phone}`} style={{background:"#FF6B3515",border:"1px solid #FF6B3530",color:"#FF6B35",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>Ã°ÂÂÂ ZadzwoÃÂ</a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ REPORTS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminReports({clients}) {
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Raporty" sub="Import CSV ÃÂ· auto-generowanie per klient" btn="+ Import Meta CSV"/>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"2px dashed #1a1a2a",borderRadius:16,padding:24,textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:34,marginBottom:10}}>Ã°ÂÂÂ</div>
        <div style={{fontWeight:700,color:"#888",marginBottom:6,fontSize:14}}>PrzeciÃÂgnij i upuÃÂÃÂ plik CSV z Meta Ads</div>
        <div style={{color:"#252535",fontSize:12,marginBottom:14}}>Lub kliknij aby wybraÃÂ Ã¢ÂÂ automatycznie przypisujemy dane do klientÃÂ³w</div>
        <button style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"9px 20px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+ Importuj CSV</button>
      </div>
      {clients.filter(c=>c.monthLeads.length>0).map(c=>{
        const mData=c.monthLeads.map((l,i)=>({m:["Sty","Lut","Mar"][i],leads:l,spend:c.monthSpend[i]||0}));
        return (
          <div key={c.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{width:34,height:34,background:c.color+"15",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:13,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,color:"#fff",fontSize:14}}>{c.name}</div><div style={{color:"#252535",fontSize:11}}>Plan {c.plan} ÃÂ· {fmt(c.stats.spend)} zÃÂ wydano ÃÂÃÂcznie</div></div>
              <button style={{background:"#FF6B3515",border:"1px solid #FF6B3525",color:"#FF6B35",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>PDF Ã¢ÂÂ</button>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={mData} barSize={16}>
                <XAxis dataKey="m" tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:8,color:"#fff",fontSize:11}}/>
                <Bar dataKey="leads" fill={c.color} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ CHAT Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminChat({clients,setClients}) {
  const [active,setActive]=useState(clients[0]?.id); const [msg,setMsg]=useState(""); const br=useRef(null);
  const cl=clients.find(c=>c.id===active);
  useEffect(()=>{br.current?.scrollIntoView({behavior:"smooth"});});
  const send=()=>{
    if(!msg.trim())return;
    const m={from:"admin",text:msg,time:new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})};
    setClients(prev=>prev.map(c=>c.id===active?{...c,messages:[...c.messages,m]}:c));
    setMsg("");
  };
  return (
    <div style={{display:"flex",height:"100vh"}} className="fu">
      <div style={{width:220,borderRight:"1px solid #0f0f18",display:"flex",flexDirection:"column",background:"#08080f"}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid #0f0f18"}}><div style={{fontWeight:800,color:"#fff",fontSize:13}}>WiadomoÃÂci</div></div>
        {clients.map(c=>(
          <div key={c.id} onClick={()=>setActive(c.id)} style={{padding:"10px 13px",borderBottom:"1px solid #0a0a10",cursor:"pointer",background:active===c.id?"#0f0f1a":"transparent",display:"flex",alignItems:"center",gap:9,transition:"background .1s"}}>
            <div style={{width:30,height:30,background:c.color+"15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:11,flexShrink:0}}>{c.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:active===c.id?"#fff":"#555",fontSize:12}}>{c.name}</div>
              <div style={{color:"#1e1e2e",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.messages[c.messages.length-1]?.text||"Ã¢ÂÂ"}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#060608"}}>
        {cl&&<>
          <div style={{padding:"13px 18px",borderBottom:"1px solid #0f0f18",display:"flex",alignItems:"center",gap:9,background:"#08080f"}}>
            <div style={{width:28,height:28,background:cl.color+"15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:cl.color,fontSize:11,flexShrink:0}}>{cl.avatar}</div>
            <span style={{fontWeight:800,color:"#fff",fontSize:13}}>{cl.name}</span>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"16px 18px 8px"}}>
            {clients.find(c=>c.id===active)?.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="admin"?"flex-end":"flex-start",marginBottom:9}}>
                <div style={{maxWidth:"68%",background:m.from==="admin"?`linear-gradient(135deg,${TENANT.primary},#e05020)`:"#111120",borderRadius:m.from==="admin"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px",boxShadow:m.from==="admin"?`0 4px 14px ${TENANT.primary}25`:"none"}}>
                  <div style={{color:"#fff",fontSize:13}}>{m.text}</div>
                  <div style={{color:m.from==="admin"?"rgba(255,255,255,.4)":"#1e1e2e",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={br}/>
          </div>
          <div style={{padding:"10px 14px",borderTop:"1px solid #0f0f18",display:"flex",gap:8,background:"#08080f"}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Napisz wiadomoÃÂÃÂ..." style={{flex:1,background:"#0d0d18",border:"1px solid #151520",borderRadius:10,padding:"9px 13px",color:"#ddd",fontSize:13,outline:"none"}}/>
            <button onClick={send} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"9px 16px",fontWeight:900,cursor:"pointer",fontSize:14}}>Ã¢ÂÂ</button>
          </div>
        </>}
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ TICKETS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminTickets({clients,setClients}) {
  const all=clients.flatMap(c=>c.tickets.map(t=>({...t,cName:c.name,cColor:c.color,cId:c.id})));
  const pc={high:"#FF6B35",medium:"#F7C59F",low:"#444"};
  const resolve=(cid,tid)=>setClients(prev=>prev.map(c=>c.id===cid?{...c,tickets:c.tickets.map(t=>t.id===tid?{...t,status:"resolved"}:t)}:c));
  return (
    <div style={{padding:28}} className="fu">
      <SH title="ZgÃÂoszenia" sub={`${all.filter(t=>t.status==="open").length} otwartych`} badge={all.filter(t=>t.status==="open").length}/>
      {all.length===0?<div style={{textAlign:"center",color:"#1e1e2e",padding:"50px 0"}}>Brak zgÃÂoszeÃÂ Ã°ÂÂÂ</div>:
      all.map(t=>(
        <div key={t.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${t.status==="open"?"#151520":"#0c0c18"}`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:8,opacity:t.status==="resolved"?.4:1}}>
          <div style={{flex:1}}><div style={{fontWeight:700,color:"#e0e0e8",fontSize:13}}>{t.title}</div><div style={{color:"#252535",fontSize:11,marginTop:2}}><span style={{color:t.cColor}}>{t.cName}</span> ÃÂ· {t.date}</div></div>
          <span style={{background:pc[t.priority]+"18",color:pc[t.priority],border:`1px solid ${pc[t.priority]}30`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{t.priority}</span>
          <span style={{background:t.status==="open"?"#FF6B3518":"#4ECDC418",color:t.status==="open"?"#FF6B35":"#4ECDC4",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{t.status==="open"?"Otwarte":"RozwiÃÂzane"}</span>
          {t.status==="open"&&<button onClick={()=>resolve(t.cId,t.id)} style={{background:"#111120",border:"1px solid #1e1e2e",color:"#555",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Zamknij</button>}
        </div>
      ))}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ WIKI Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const WIKI=[{id:"w1",title:"Kwalifikacja leada w 60 sekund",cat:"SprzedaÃÂ¼",body:"3 pytania: 1) Jaki masz cel? 2) Kiedy chcesz zaczÃÂÃÂ? 3) Jaki budÃÂ¼et? OceÃÂ gorÃÂcy/zimny. GorÃÂcy = callback < 60 min."},{id:"w2",title:"Onboarding nowego klienta",cat:"Procesy",body:"Krok 1: Wywiad Zoom 30 min. Krok 2: Kreacje 7 dni. Krok 3: Setup kampanii. Krok 4: Monitoring 48h. Krok 5: Raport po 2 tygodniach."},{id:"w3",title:"Optymalizacja kampanii Ã¢ÂÂ kiedy i jak",cat:"Kampanie",body:"Nigdy nie ruszaj przed 48h. Optymalizuj gdy: CPL > 2x target, CTR < 1%, Frequency > 3."},{id:"w4",title:"SOP Ã¢ÂÂ miesiÃÂczny raport",cat:"Procesy",body:"Do 3. dnia miesiÃÂca: dane z Meta + template + wyÃÂlij. Zawsze 3 rekomendacje."},{id:"w5",title:"Komunikacja z trudnym klientem",cat:"Komunikacja",body:"Zasada LEAP: Listen, Empathize, Acknowledge, Problem-solve. Nigdy nie obiecuj wynikÃÂ³w. Zawsze dane."}];
function AdminWiki() {
  const [sel,setSel]=useState(null); const [s,setS]=useState("");
  const filtered=WIKI.filter(a=>!s||a.title.toLowerCase().includes(s.toLowerCase()));
  const cats=[...new Set(WIKI.map(a=>a.cat))];
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Hardgain Wiki" sub="WewnÃÂtrzna baza wiedzy" btn="+ Nowy artykuÃÂ"/>
      <div style={{display:"flex",gap:20}}>
        <div style={{flex:1}}>
          <input value={s} onChange={e=>setS(e.target.value)} placeholder="Szukaj w wiki..." style={{width:"100%",background:"#0d0d18",border:"1px solid #151520",borderRadius:10,padding:"9px 14px",color:"#ddd",fontSize:13,outline:"none",marginBottom:16}}/>
          {cats.map(cat=>{const arts=filtered.filter(a=>a.cat===cat);if(!arts.length)return null;return (
            <div key={cat} style={{marginBottom:18}}>
              <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{cat}</div>
              {arts.map(a=><div key={a.id} className="hr" onClick={()=>setSel(a)} style={{background:sel?.id===a.id?"#111120":"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:"pointer",transition:"background .1s"}}><div style={{fontWeight:700,color:"#bbb",fontSize:13}}>{a.title}</div></div>)}
            </div>
          );})}
        </div>
        {sel&&<div style={{width:360,background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:22,height:"fit-content"}}>
          <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{sel.cat}</div>
          <div style={{fontWeight:900,color:"#fff",fontSize:16,marginBottom:14}}>{sel.title}</div>
          <div style={{color:"#555",fontSize:13,lineHeight:1.8}}>{sel.body}</div>
        </div>}
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ INVOICES Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminInvoices({clients}) {
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Faktury" sub="Dane do fakturowania per klient ÃÂ· auto-generowanie" btn="+ Generuj fakturÃÂ"/>
      {clients.map(c=>(
        <div key={c.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:38,height:38,background:c.color+"15",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:15,flexShrink:0}}>{c.avatar}</div>
            <div style={{flex:1}}><div style={{fontWeight:800,color:"#fff",fontSize:15}}>{c.name}</div><div style={{color:"#252535",fontSize:11}}>Plan {c.plan} ÃÂ· {fmt(c.planPrice)} zÃÂ/mies</div></div>
            <button style={{background:"#FF6B3515",border:"1px solid #FF6B3525",color:"#FF6B35",borderRadius:9,padding:"7px 14px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Generuj FV Ã¢ÂÂ</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,borderTop:"1px solid #0f0f18",paddingTop:14}}>
            {[["NIP",c.nip],["Email",c.email],["Adres",c.address]].map(([l,v])=>(
              <div key={l}><div style={{color:"#1e1e2e",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{color:"#444",fontSize:11,wordBreak:"break-all"}}>{v}</div></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ SETTINGS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminSettings() {
  const [tab,setTab]=useState("brand");
  const [brand,setBrand]=useState({name:TENANT.name,primary:"#FF6B35",accent:"#4ECDC4",logo:"H"});
  const [team]=useState([{id:1,name:"Jan",email:"jan@hardgain.pl",role:"Admin",avatar:"J"},{id:2,name:"Anna",email:"anna@hardgain.pl",role:"Manager",avatar:"A"}]);
  const [intg]=useState([{name:"Make.com",desc:"Webhook Ã¢ÂÂ leady z Meta Ads",status:"active",icon:"Ã¢ÂÂ¡"},{name:"Stripe",desc:"PÃÂatnoÃÂci i subskrypcje",status:"inactive",icon:"Ã°ÂÂÂ³"},{name:"Google Calendar",desc:"Sync kalendarza spotkaÃÂ",status:"inactive",icon:"Ã°ÂÂÂ"},{name:"Resend",desc:"Powiadomienia email",status:"inactive",icon:"Ã°ÂÂÂ§"},{name:"PostHog",desc:"Analityka zachowaÃÂ",status:"inactive",icon:"Ã°ÂÂÂ"},{name:"SMS API",desc:"Powiadomienia o leadach",status:"inactive",icon:"Ã°ÂÂÂ¬"}]);
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Ustawienia" sub="Konfiguracja platformy ÃÂ· integracje ÃÂ· team"/>
      <Tabs tabs={[["brand","Branding","Ã°ÂÂÂ¨"],["team","ZespÃÂ³ÃÂ","Ã°ÂÂÂ¥"],["integrations","Integracje","Ã¢ÂÂ¡"],["plans","Plany","Ã°ÂÂÂ"],["api","API","Ã¢ÂÂ¨"]]} active={tab} onSelect={setTab}/>
      {tab==="brand"&&(
        <div style={{maxWidth:520}}>
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontWeight:800,color:"#fff",fontSize:14,marginBottom:18}}>Branding aplikacji</div>
            {[["Nazwa firmy","text","name"],["Kolor gÃÂÃÂ³wny","color","primary"],["Kolor akcentu","color","accent"]].map(([l,t,k])=>(
              <div key={k} style={{marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <label style={{color:"#444",fontSize:12,fontWeight:600,minWidth:130}}>{l}</label>
                <input type={t} value={brand[k]} onChange={e=>setBrand(p=>({...p,[k]:e.target.value}))} style={{flex:1,background:"#08080f",border:"1px solid #151525",borderRadius:9,padding:"9px 12px",color:"#ddd",fontSize:13,outline:"none"}}/>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20}}>
            <div style={{fontWeight:700,color:"#666",fontSize:12,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>PodglÃÂd logo</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,background:`linear-gradient(135deg,${brand.primary},${brand.accent})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff"}}>{brand.logo}</div>
              <div><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{brand.name} Panel</div><div style={{fontSize:10,color:"#252535",letterSpacing:"0.1em",textTransform:"uppercase"}}>Agency Portal</div></div>
            </div>
          </div>
          <button style={{marginTop:16,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"11px 22px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Zapisz zmiany Ã¢ÂÂ</button>
        </div>
      )}
      {tab==="team"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:540}}>
            {team.map(m=>(
              <div key={m.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,background:"#FF6B3515",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#FF6B35",fontSize:13,flexShrink:0}}>{m.avatar}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,color:"#e0e0e8",fontSize:13}}>{m.name}</div><div style={{color:"#252535",fontSize:11}}>{m.email}</div></div>
                <span style={{background:"#FF6B3515",color:"#FF6B35",border:"1px solid #FF6B3525",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{m.role}</span>
                <button style={{background:"#0f0f1e",border:"1px solid #1e1e2e",color:"#444",borderRadius:7,padding:"4px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Edytuj</button>
              </div>
            ))}
            <button style={{background:"#0d0d18",border:"2px dashed #1a1a2a",color:"#333",borderRadius:14,padding:"13px 0",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Dodaj czÃÂonka zespoÃÂu</button>
          </div>
        </div>
      )}
      {tab==="integrations"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {intg.map(i=>(
            <div key={i.name} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${i.status==="active"?"#4ECDC425":"#151520"}`,borderRadius:16,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:28}}>{i.icon}</span>
                <span style={{background:i.status==="active"?"#4ECDC418":"#1a1a2a",color:i.status==="active"?"#4ECDC4":"#333",border:`1px solid ${i.status==="active"?"#4ECDC430":"#1e1e2e"}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{i.status==="active"?"Ã¢ÂÂ Aktywna":"Nieaktywna"}</span>
              </div>
              <div style={{fontWeight:800,color:"#e0e0e8",fontSize:14,marginBottom:4}}>{i.name}</div>
              <div style={{color:"#333",fontSize:12,marginBottom:14}}>{i.desc}</div>
              <button style={{width:"100%",background:i.status==="active"?"#1a1a2a":"#FF6B3515",border:`1px solid ${i.status==="active"?"#1e1e2e":"#FF6B3530"}`,color:i.status==="active"?"#444":"#FF6B35",borderRadius:9,padding:"7px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{i.status==="active"?"Konfiguruj Ã¢ÂÂ":"Aktywuj Ã¢ÂÂ"}</button>
            </div>
          ))}
        </div>
      )}
      {tab==="plans"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:740}}>
          {[{name:"Starter",price:199,clients:10,features:["Panel klienta","Leady CRM","Raporty podstawowe","Chat"]},{name:"Agency",price:499,clients:50,features:["Wszystko z Starter","White-label","WÃÂasna domena","Mapa Polski","Kalendarz","Export CSV"],highlight:true},{name:"Scale",price:999,clients:"Ã¢ÂÂ",features:["Wszystko z Agency","API access","Multi-user team","AI Asystent","SMS powiadomienia","Priorytetowy support"]}].map(p=>(
            <div key={p.name} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`2px solid ${p.highlight?"#FF6B3540":"#151520"}`,borderRadius:18,padding:22,position:"relative"}}>
              {p.highlight&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(90deg,${TENANT.primary},#e05020)`,color:"#fff",borderRadius:"0 0 8px 8px",padding:"2px 12px",fontSize:10,fontWeight:900,whiteSpace:"nowrap"}}>NAJPOPULARNIEJSZY</div>}
              <div style={{fontWeight:900,color:"#fff",fontSize:17,marginBottom:4}}>{p.name}</div>
              <div style={{fontFamily:"mono",color:p.highlight?"#FF6B35":"#ddd",fontSize:28,fontWeight:900,marginBottom:4}}>{p.price} zÃÂ<span style={{fontSize:12,color:"#333",fontWeight:400}}>/mies</span></div>
              <div style={{color:"#333",fontSize:12,marginBottom:16}}>Do {p.clients} klientÃÂ³w</div>
              <div style={{borderTop:"1px solid #0f0f18",paddingTop:14}}>
                {p.features.map(f=><div key={f} style={{color:"#555",fontSize:12,padding:"4px 0",display:"flex",gap:8}}><span style={{color:"#4ECDC4"}}>Ã¢ÂÂ</span>{f}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="api"&&(
        <div style={{maxWidth:560}}>
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:22}}>
            <div style={{fontWeight:800,color:"#fff",fontSize:14,marginBottom:16}}>API Keys</div>
            <div style={{marginBottom:14}}>
              <div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Live API Key</div>
              <div style={{background:"#08080f",border:"1px solid #151525",borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"mono",color:"#333",fontSize:11}}>hg_live_Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢Ã¢ÂÂ¢</span>
                <button style={{background:"#FF6B3515",border:"1px solid #FF6B3525",color:"#FF6B35",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Kopiuj</button>
              </div>
            </div>
            <div style={{background:"#FF6B3508",border:"1px solid #FF6B3520",borderRadius:10,padding:"12px 14px",marginTop:16}}>
              <div style={{color:"#FF6B35",fontSize:12,fontWeight:700,marginBottom:6}}>Ã°ÂÂÂ Dokumentacja API</div>
              <div style={{color:"#444",fontSize:11,lineHeight:1.6}}>REST API dostÃÂpne w planach Scale i Enterprise. Endpointy: /clients, /leads, /campaigns, /reports. Rate limit: 1000 req/h.</div>
              <div style={{marginTop:10,color:"#333",fontSize:11,fontFamily:"mono",background:"#0a0a0f",borderRadius:8,padding:"8px 12px"}}>GET https://api.hardgain.pl/v1/clients<br/>Authorization: Bearer {"{"}"api_key{"}"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ CLIENT FOCUS (detail view) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function AdminClientFocus({client,clients,setClients,events,setEvents,onBack}) {
  const [tab,setTab]=useState("overview");
  const live=clients.find(c=>c.id===client.id)||client;
  const clientEvents=events.filter(e=>e.clientId===client.id);
  const evColor={call:"#FF6B35",meeting:"#4ECDC4",onboarding:"#A78BFA",report:"#F7C59F"};
  const evIcon={call:"Ã°ÂÂÂ",meeting:"Ã°ÂÂ¤Â",onboarding:"Ã°ÂÂÂ",report:"Ã°ÂÂÂ"};

  return (
    <div style={{padding:28}} className="fu">
      <button onClick={onBack} style={{background:"none",border:"none",color:"#252535",cursor:"pointer",fontFamily:"inherit",fontSize:12,marginBottom:18,padding:0}}>Ã¢ÂÂ WrÃÂ³ÃÂ do klientÃÂ³w</button>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
        <div style={{width:52,height:52,background:live.color+"15",border:`1px solid ${live.color}25`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:live.color,fontSize:22,flexShrink:0}}>{live.avatar}</div>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>{live.name}</h1>
          <div style={{color:"#252535",fontSize:12,marginTop:2}}>{live.city} ÃÂ· {live.plan} ÃÂ· {fmt(live.planPrice)} zÃÂ/mies</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{background:live.plan_key==="pro"?"#FF6B3518":"#141420",color:live.plan_key==="pro"?"#FF6B35":"#333",border:`1px solid ${live.plan_key==="pro"?"#FF6B3530":"#1e1e2e"}`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:800}}>{live.plan_key==="pro"?"Ã¢ÂÂ PRO":"FREE"}</span>
          <button style={{background:"#0d0d18",border:"1px solid #151520",color:"#666",borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Edytuj klienta</button>
        </div>
      </div>

      <Tabs tabs={[["overview","Wyniki","Ã¢ÂÂ"],["campaigns","Kampanie","Ã¢ÂÂ¶"],["leads","Leady","Ã¢ÂÂ"],["funnel","Lejek","Ã¢ÂÂ"],["creatives","Kreacje","Ã¢ÂÂ"],["messages","Chat","Ã¢ÂÂ·"],["schedule","Spotkania","Ã°ÂÂÂ"],["tickets","ZgÃÂoszenia","Ã¢ÂÂ³"]]} active={tab} onSelect={setTab}/>

      {tab==="overview"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
            <KPI label="Leady" value={live.stats.leads} accent="#FF6B35" icon="Ã°ÂÂÂ¯"/>
            <KPI label="CPL" value={live.stats.cpl+" zÃÂ"} accent="#4ECDC4" icon="Ã¢ÂÂ¡"/>
            <KPI label="Spend" value={fmt(live.stats.spend)+" zÃÂ"} accent="#F7C59F" icon="Ã°ÂÂÂ°"/>
            <KPI label="Konwersja" value={live.stats.conversion+"%"} accent="#A78BFA" icon="Ã°ÂÂÂ"/>
            <KPI label="PrzychÃÂ³d" value={fmt(live.stats.revenue)+" zÃÂ"} accent="#34D399" icon="Ã°ÂÂÂ"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:14}}>Leady ÃÂ· 7 dni</div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={["Pon","Wt","ÃÂr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,leads:live.weekLeads[i]||0,cpl:live.weekCpl[i]||0}))}>
                  <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={live.color} stopOpacity={0.25}/><stop offset="95%" stopColor={live.color} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f0f18"/>
                  <XAxis dataKey="day" tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:8,color:"#fff",fontSize:11}}/>
                  <Area type="monotone" dataKey="leads" stroke={live.color} strokeWidth={2} fill="url(#lg2)" dot={{fill:live.color,r:3}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:14}}>CPL trend</div>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={["Pon","Wt","ÃÂr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,cpl:live.weekCpl[i]||0}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f0f18"/>
                  <XAxis dataKey="day" tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:8,color:"#fff",fontSize:11}}/>
                  <Line type="monotone" dataKey="cpl" stroke="#4ECDC4" strokeWidth={2} dot={{fill:"#4ECDC4",r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab==="campaigns"&&(
        <div>{live.campaigns.map(cp=>(
          <div key={cp.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <div><div style={{fontWeight:800,color:"#fff",fontSize:15}}>{cp.name}</div><div style={{color:"#252535",fontSize:12,marginTop:2}}>Od {cp.start} ÃÂ· {cp.creative}</div></div>
              <span style={{background:cp.status==="active"?"#4ECDC418":"#1a1a2a",color:cp.status==="active"?"#4ECDC4":"#333",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700}}>{cp.status==="active"?"Ã¢ÂÂ Aktywna":"Ã¢ÂÂ¸ Wstrzymana"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["Leady",cp.leads,"#FF6B35"],["CPL",cp.cpl+" zÃÂ","#4ECDC4"],["Spend",fmt(cp.spend)+" zÃÂ","#F7C59F"],["BudÃÂ¼et/dz",cp.budget+" zÃÂ","#888"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#08080f",borderRadius:10,padding:"10px 12px"}}><div style={{fontWeight:800,color:c,fontFamily:"mono",fontSize:16}}>{v}</div><div style={{color:"#1e1e2e",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:3}}>{l}</div></div>
              ))}
            </div>
          </div>
        ))}</div>
      )}

      {tab==="leads"&&(
        <div>{live.leads.map(l=>(
          <div key={l.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${l.hot<=60?"#FF6B3520":"#151520"}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{width:32,height:32,background:"#FF6B3515",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#FF6B35",fontWeight:900,fontSize:12,flexShrink:0}}>{l.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"#e0e0e8",fontSize:13}}>{l.name}</div><div style={{color:"#252535",fontSize:11,marginTop:1}}>{l.phone} ÃÂ· {l.campaign}</div></div>
            <HotTimer m={l.hot}/>
            <LBadge s={l.status}/>
            <a href={`tel:${l.phone}`} style={{background:"#FF6B3515",border:"1px solid #FF6B3530",color:"#FF6B35",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>Ã°ÂÂÂ</a>
          </div>
        ))}</div>
      )}

      {tab==="funnel"&&(
        <div style={{maxWidth:500}}>
          <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:24}}>
            <div style={{fontWeight:800,color:"#fff",fontSize:15,marginBottom:20}}>Lejek konwersji</div>
            {[["KlikniÃÂcia","clicks","#A78BFA"],["Leady","leads","#FF6B35"],["Rozmowy","calls","#F7C59F"],["Klienci","clients","#4ECDC4"]].map(([l,k,c],i,arr)=>{
              const v=live.funnel[k];
              const prev=i>0?live.funnel[arr[i-1][1]]:v;
              const pct=prev>0?(v/prev*100).toFixed(0):100;
              const barW=(v/live.funnel.clicks)*100;
              return (
                <div key={k} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{color:"#888",fontSize:12,fontWeight:600}}>{l}</span>
                    <div style={{display:"flex",gap:10}}>
                      {i>0&&<span style={{color:c,fontSize:11,fontWeight:700}}>{pct}% konwersji</span>}
                      <span style={{fontFamily:"mono",color:"#fff",fontSize:13,fontWeight:700}}>{v}</span>
                    </div>
                  </div>
                  <div style={{height:10,background:"#0a0a12",borderRadius:5,overflow:"hidden"}}>
                    <div style={{width:`${barW}%`,height:"100%",background:`linear-gradient(90deg,${c}60,${c})`,borderRadius:5,transition:"width .5s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="creatives"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {live.creatives.length===0?<div style={{color:"#252535",fontSize:13}}>Brak kreacji.</div>:
          live.creatives.map(cr=>(
            <div key={cr.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${cr.status==="pending_approval"?"#F7C59F30":"#151520"}`,borderRadius:14,padding:16}}>
              <div style={{width:"100%",height:80,background:"#08080f",borderRadius:10,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{cr.thumb}</div>
              <div style={{fontWeight:700,color:"#bbb",fontSize:12,marginBottom:3}}>{cr.name}</div>
              <div style={{color:"#252535",fontSize:10,marginBottom:10}}>{cr.campaign}</div>
              {cr.status==="pending_approval"&&<span style={{background:"#F7C59F18",color:"#F7C59F",border:"1px solid #F7C59F30",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>Ã¢ÂÂ³ Oczekuje</span>}
              {cr.status==="approved"&&<span style={{background:"#4ECDC418",color:"#4ECDC4",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>Ã¢ÂÂ Zatwierdzona</span>}
            </div>
          ))}
        </div>
      )}

      {tab==="messages"&&(
        <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,overflow:"hidden",height:400,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflow:"auto",padding:"14px 16px 8px"}}>
            {live.messages.length===0?<div style={{color:"#1e1e2e",textAlign:"center",marginTop:40}}>Brak wiadomoÃÂci</div>:
            live.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="admin"?"flex-end":"flex-start",marginBottom:9}}>
                <div style={{maxWidth:"68%",background:m.from==="admin"?`linear-gradient(135deg,${TENANT.primary},#e05020)`:"#111120",borderRadius:m.from==="admin"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px"}}>
                  <div style={{color:"#fff",fontSize:13}}>{m.text}</div>
                  <div style={{color:m.from==="admin"?"rgba(255,255,255,.35)":"#1e1e2e",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"9px 12px",borderTop:"1px solid #0f0f18",display:"flex",gap:8}}>
            <span style={{color:"#252535",fontSize:12,padding:"8px 0"}}>OtwÃÂ³rz czat Ã¢ÂÂ</span>
          </div>
        </div>
      )}

      {tab==="schedule"&&(
        <div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
            {Object.entries(evColor).map(([t,c])=>(
              <div key={t} style={{background:c+"12",border:`1px solid ${c}25`,borderRadius:8,padding:"5px 12px",display:"flex",gap:6,alignItems:"center",fontSize:11,color:c,fontWeight:700}}>
                {evIcon[t]} {t}
              </div>
            ))}
          </div>
          {clientEvents.length===0?<div style={{textAlign:"center",color:"#1e1e2e",padding:"40px 0"}}>Brak spotkaÃÂ. <button onClick={()=>{}} style={{background:"none",border:"none",color:"#FF6B35",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Zaplanuj Ã¢ÂÂ</button></div>:
          clientEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>(
            <div key={ev.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${evColor[ev.type]}25`,borderRadius:14,padding:"14px 18px",display:"flex",gap:14,alignItems:"center",marginBottom:8}}>
              <div style={{width:38,height:38,background:evColor[ev.type]+"15",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{evIcon[ev.type]}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,color:"#fff",fontSize:14}}>{ev.title}</div><div style={{color:"#252535",fontSize:12,marginTop:2}}>{ev.date} o {ev.time} ÃÂ· {ev.duration} min</div></div>
              <span style={{background:evColor[ev.type]+"15",color:evColor[ev.type],border:`1px solid ${evColor[ev.type]}30`,borderRadius:7,padding:"3px 10px",fontSize:10,fontWeight:800,textTransform:"uppercase"}}>{ev.type}</span>
            </div>
          ))}
        </div>
      )}

      {tab==="tickets"&&(
        <div>{live.tickets.length===0?<div style={{textAlign:"center",color:"#1e1e2e",padding:"40px 0"}}>Brak zgÃÂoszeÃÂ Ã°ÂÂÂ</div>:
        live.tickets.map(t=>(
          <div key={t.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:12,padding:"13px 18px",display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
            <div style={{flex:1}}><div style={{fontWeight:700,color:"#e0e0e8"}}>{t.title}</div><div style={{color:"#252535",fontSize:11,marginTop:2}}>{t.date}</div></div>
            <span style={{background:{high:"#FF6B35",medium:"#F7C59F",low:"#444"}[t.priority]+"18",color:{high:"#FF6B35",medium:"#F7C59F",low:"#666"}[t.priority],borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{t.priority}</span>
            <span style={{background:t.status==="open"?"#FF6B3518":"#4ECDC418",color:t.status==="open"?"#FF6B35":"#4ECDC4",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{t.status==="open"?"Otwarte":"RozwiÃÂzane"}</span>
          </div>
        ))}</div>
      )}
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ CLIENT APP Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const CLIENT_NAV = [
  ["overview","Ã¢ÂÂ","Moje wyniki"],["campaigns","Ã¢ÂÂ¶","Kampanie"],["leads","Ã¢ÂÂ","Leady"],
  ["reports","Ã¢ÂÂ¤","Raporty"],["creatives","Ã¢ÂÂ","Kreacje"],["order","Ã¢ÂÂ","ZamÃÂ³w kampaniÃÂ"],
  ["onboarding","Ã¢ÂÂ","Onboarding"],["training","Ã¢ÂÂ§","Szkolenia"],["kb","Ã¢ÂÂ","Baza wiedzy"],
  ["chat","Ã¢ÂÂ³","Chat z agencjÃÂ"],["ticket","Ã¢ÂÂ¡","ZgÃÂoÃÂ problem"],
];
function ClientApp({user,onLogout}) {
  const [view,setView]=useState("overview");
  const [clients,setClients]=useState(CLIENTS);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const client=clients.find(c=>c.id===user.id)||clients[1];
  const isPro=client.plan_key==="pro";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#060608"}}>
      <G/>
      <Sidebar nav={CLIENT_NAV} view={view} setView={setView} onLogout={onLogout} u={{name:client.name,avatar:client.avatar}} />
      <main style={{marginLeft:220,flex:1,overflow:"auto",padding:28}}>
        {!isPro&&view!=="onboarding"&&view!=="training"&&view!=="kb"&&view!=="ticket"&&view!=="order"&&(
          <div style={{background:"linear-gradient(135deg,#FF6B3510,#A78BFA10)",border:"1px solid #FF6B3525",borderRadius:14,padding:"16px 20px",marginBottom:22,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:24}}>Ã¢ÂÂ¡</span>
            <div style={{flex:1}}><div style={{fontWeight:800,color:"#fff",fontSize:13}}>JesteÃÂ na planie Free</div><div style={{color:"#333",fontSize:12,marginTop:2}}>Odblokuj peÃÂne dane, wykresy, chat i raporty za 99 zÃÂ/mies</div></div>
            <button onClick={()=>setShowUpgrade(true)} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"9px 18px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap",boxShadow:`0 4px 16px ${TENANT.primary}30`}}>Odblokuj Pro Ã¢ÂÂ</button>
          </div>
        )}
        {view==="overview"&&<div className="fu"><SH title="Moje wyniki"/><ClientOverview c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="campaigns"&&<div className="fu"><SH title="Kampanie"/><ClientCampaigns c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="leads"&&<div className="fu"><SH title="Leady" sub={`${client.leads.length} leadÃÂ³w`}/><ClientLeads c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="reports"&&<div className="fu"><SH title="Raporty"/><ClientReports c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="creatives"&&<div className="fu"><SH title="Kreacje reklamowe" sub="ZatwierdÃÂº lub zgÃÂoÃÂ uwagi"/><ClientCreatives c={client} clients={clients} setClients={setClients} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="order"&&<div className="fu"><CampaignOrder/></div>}
        {view==="onboarding"&&<div className="fu"><ClientOnboarding/></div>}
        {view==="training"&&<div className="fu"><ClientTraining isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="kb"&&<div className="fu"><SH title="Baza Wiedzy"/><ClientKB/></div>}
        {view==="chat"&&<div className="fu"><SH title="Chat z agencjÃÂ"/>{isPro?<ChatPane messages={client.messages} clientId={client.id} clients={clients} setClients={setClients}/>:<ProLock label="Chat dostÃÂpny w Pro" onUpgrade={()=>setShowUpgrade(true)}/>}</div>}
        {view==="ticket"&&<div className="fu"><TicketForm/></div>}
      </main>
      {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}

function ProLock({label,onUpgrade}) {
  return (
    <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:60,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>Ã°ÂÂÂ</div>
      <div style={{fontWeight:800,color:"#fff",fontSize:16,marginBottom:6}}>{label||"Funkcja Pro"}</div>
      <div style={{color:"#333",fontSize:13,marginBottom:20}}>Odblokuj w planie Pro za 99 zÃÂ/mies</div>
      <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"10px 24px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Odblokuj Pro Ã¢ÂÂ</button>
    </div>
  );
}

function ClientOverview({c,isPro,onUpgrade}) {
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <KPI label="Leady" value={c.stats.leads} accent="#FF6B35" icon="Ã°ÂÂÂ¯"/>
        <KPI label="CPL" value={c.stats.cpl+" zÃÂ"} accent="#4ECDC4" icon="Ã¢ÂÂ¡" locked={!isPro} onUpgrade={onUpgrade}/>
        <KPI label="Wydano" value={`${c.stats.spend} zÃÂ`} accent="#F7C59F" icon="Ã°ÂÂÂ°" locked={!isPro} onUpgrade={onUpgrade}/>
        <KPI label="Konwersja" value={c.stats.conversion+"%"} accent="#A78BFA" icon="Ã°ÂÂÂ" locked={!isPro} onUpgrade={onUpgrade}/>
      </div>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20,position:"relative",overflow:"hidden"}}>
        {!isPro&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"#06060870",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16}}><button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:12,padding:"12px 24px",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Ã°ÂÂÂ Odblokuj wykresy Ã¢ÂÂ</button></div>}
        <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:14}}>Leady ÃÂ· 7 dni</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={["Pon","Wt","ÃÂr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,leads:c.weekLeads[i]||0}))}>
            <defs><linearGradient id="clg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c.color} stopOpacity={0.3}/><stop offset="95%" stopColor={c.color} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f0f18"/>
            <XAxis dataKey="day" tick={{fill:"#252535",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#0f0f1e",border:"1px solid #1e1e2e",borderRadius:8,color:"#fff",fontSize:11}}/>
            <Area type="monotone" dataKey="leads" stroke={c.color} strokeWidth={2} fill="url(#clg)" dot={{fill:c.color,r:3}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ClientCampaigns({c,isPro,onUpgrade}) {
  return (
    <div style={{position:"relative"}}>
      {!isPro&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"#06060870",zIndex:5,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center"}}><button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:12,padding:"12px 24px",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Ã°ÂÂÂ Odblokuj kampanie Ã¢ÂÂ</button></div>}
      {c.campaigns.map(cp=>(
        <div key={cp.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,padding:20,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontWeight:800,color:"#fff",fontSize:15}}>{cp.name}</div><div style={{color:"#252535",fontSize:12,marginTop:2}}>Od {cp.start}</div></div><span style={{background:cp.status==="active"?"#4ECDC418":"#1a1a2a",color:cp.status==="active"?"#4ECDC4":"#333",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700}}>{cp.status==="active"?"Ã¢ÂÂ Aktywna":"Ã¢ÂÂ¸"}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["Leady",cp.leads,"#FF6B35"],["CPL",cp.cpl+" zÃÂ","#4ECDC4"],["Spend",`${cp.spend} zÃÂ`,"#F7C59F"],["BudÃÂ¼et",cp.budget+" zÃÂ/dz","#888"]].map(([l,v,col])=>(
              <div key={l} style={{background:"#08080f",borderRadius:9,padding:"9px 11px"}}><div style={{fontWeight:800,color:col,fontFamily:"mono",fontSize:15}}>{v}</div><div style={{color:"#1e1e2e",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{l}</div></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientLeads({c,isPro,onUpgrade}) {
  return (
    <div>
      {!isPro&&<div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:12,padding:"14px 18px",marginBottom:12,display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:28}}>Ã°ÂÂÂ¥</span><div style={{flex:1}}><div style={{fontWeight:700,color:"#fff"}}>{c.leads.length} leadÃÂ³w</div><div style={{color:"#333",fontSize:12,marginTop:1}}>Odblokuj Pro aby zobaczyÃÂ dane kontaktowe</div></div>
        <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:9,padding:"8px 15px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Odblokuj Ã¢ÂÂ</button>
      </div>}
      {c.leads.map((l,i)=>(
        <div key={l.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:6,position:"relative",overflow:"hidden"}}>
          {!isPro&&i>0&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"#06060880",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#252535",fontSize:12}}>Ã°ÂÂÂ Pro</span></div>}
          <div style={{width:32,height:32,background:"#FF6B3512",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#FF6B35",fontWeight:900,fontSize:12,flexShrink:0}}>{l.name.charAt(0)}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"#e0e0e8",fontSize:13}}>{!isPro&&i>0?"Ã¢ÂÂ Ã¢ÂÂ Ã¢ÂÂ Ã¢ÂÂ Ã¢ÂÂ":l.name}</div><div style={{color:"#252535",fontSize:11}}>{!isPro&&i>0?"Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ-Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ-Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ":l.phone}</div></div>
          <HotTimer m={l.hot}/>
          <LBadge s={l.status}/>
          {isPro&&<a href={`tel:${l.phone}`} style={{background:"#FF6B3512",border:"1px solid #FF6B3525",color:"#FF6B35",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>Ã°ÂÂÂ</a>}
        </div>
      ))}
    </div>
  );
}

function ClientReports({c,isPro,onUpgrade}) {
  if(!isPro) return <ProLock label="Raporty miesiÃÂczne dostÃÂpne w Pro" onUpgrade={onUpgrade}/>;
  return <div style={{textAlign:"center",color:"#252535",padding:"40px 0",fontSize:14}}>Raporty zostanÃÂ wygenerowane automatycznie do 3. dnia miesiÃÂca.</div>;
}

function ClientCreatives({c,clients,setClients,isPro,onUpgrade}) {
  if(!isPro) return <ProLock label="Kreacje dostÃÂpne w Pro" onUpgrade={onUpgrade}/>;
  const live=clients.find(cl=>cl.id===c.id)||c;
  const approve=(crId,action)=>setClients(prev=>prev.map(cl=>cl.id===c.id?{...cl,creatives:cl.creatives.map(cr=>cr.id===crId?{...cr,status:action==="approve"?"approved":"rejected"}:cr)}:cl));
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
      {live.creatives.map(cr=>(
        <div key={cr.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${cr.status==="pending_approval"?"#F7C59F30":"#151520"}`,borderRadius:14,padding:16}}>
          <div style={{width:"100%",height:80,background:"#08080f",borderRadius:10,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{cr.thumb}</div>
          <div style={{fontWeight:700,color:"#bbb",fontSize:12,marginBottom:2}}>{cr.name}</div>
          <div style={{color:"#252535",fontSize:10,marginBottom:10}}>{cr.campaign}</div>
          {cr.status==="pending_approval"&&<div style={{display:"flex",gap:5}}>
            <button onClick={()=>approve(cr.id,"approve")} style={{flex:1,background:"#4ECDC418",border:"1px solid #4ECDC430",color:"#4ECDC4",borderRadius:7,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Ã¢ÂÂ OK</button>
            <button onClick={()=>approve(cr.id,"reject")} style={{flex:1,background:"#FF6B3518",border:"1px solid #FF6B3530",color:"#FF6B35",borderRadius:7,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Ã¢ÂÂ</button>
          </div>}
          {cr.status==="approved"&&<span style={{background:"#4ECDC418",color:"#4ECDC4",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>Ã¢ÂÂ Zatwierdzona</span>}
          {cr.status==="rejected"&&<span style={{background:"#FF6B3518",color:"#FF6B35",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>Ã¢ÂÂ Do poprawy</span>}
        </div>
      ))}
    </div>
  );
}

function ChatPane({messages,clientId,clients,setClients}) {
  const [msg,setMsg]=useState(""); const br=useRef(null);
  const live=clients.find(c=>c.id===clientId)?.messages||messages;
  useEffect(()=>{br.current?.scrollIntoView({behavior:"smooth"});});
  const send=()=>{
    if(!msg.trim()||!setClients)return;
    const m={from:"client",text:msg,time:new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})};
    setClients(prev=>prev.map(c=>c.id===clientId?{...c,messages:[...c.messages,m]}:c));
    setMsg("");
  };
  return (
    <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:16,display:"flex",flexDirection:"column",height:400}}>
      <div style={{flex:1,overflow:"auto",padding:"14px 16px 8px"}}>
        {live.map((m,i)=>{const mine=m.from==="client";return(
          <div key={i} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",marginBottom:9}}>
            <div style={{maxWidth:"70%",background:mine?`linear-gradient(135deg,${TENANT.primary},#e05020)`:"#111120",borderRadius:mine?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px"}}>
              <div style={{color:"#fff",fontSize:13}}>{m.text}</div>
              <div style={{color:mine?"rgba(255,255,255,.35)":"#1e1e2e",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
            </div>
          </div>
        );})}
        <div ref={br}/>
      </div>
      <div style={{padding:"9px 12px",borderTop:"1px solid #0f0f18",display:"flex",gap:8}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Napisz..." style={{flex:1,background:"#08080f",border:"1px solid #151520",borderRadius:10,padding:"8px 12px",color:"#ddd",fontSize:13,outline:"none"}}/>
        <button onClick={send} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:9,padding:"8px 15px",fontWeight:900,cursor:"pointer",fontSize:14}}>Ã¢ÂÂ</button>
      </div>
    </div>
  );
}

const ONBOARDING_STEPS=[{id:1,title:"Podpisz umowÃÂ wspÃÂ³ÃÂpracy",desc:"SprawdÃÂº email i podpisz elektronicznie.",done:true},{id:2,title:"Dodaj kartÃÂ do Meta Ads",desc:"Potrzebujemy dostÃÂpu do rozliczeÃÂ.",done:true},{id:3,title:"Wgraj dostÃÂp do Business Managera",desc:"Dodaj nas jako partnera.",done:false},{id:4,title:"Zaakceptuj kreacje reklamowe",desc:"SprawdÃÂº bibliotekÃÂ kreacji.",done:false},{id:5,title:"Obejrzyj szkolenie: jak obsÃÂugiwaÃÂ leady",desc:"10 min Ã¢ÂÂ kluczowe dla konwersji.",done:false}];
function ClientOnboarding() {
  const [steps,setSteps]=useState(ONBOARDING_STEPS);
  const done=steps.filter(s=>s.done).length;
  return (
    <div>
      <SH title="Onboarding" sub="Wykonaj poniÃÂ¼sze kroki aby zaczÃÂÃÂ generowaÃÂ leady"/>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:14,padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1,background:"#0a0a10",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${done/steps.length*100}%`,height:"100%",background:`linear-gradient(90deg,${TENANT.primary},${TENANT.accent})`,borderRadius:8,transition:"width .4s ease"}}/>
        </div>
        <span style={{color:TENANT.primary,fontWeight:900,fontSize:14,fontFamily:"mono"}}>{done}/{steps.length}</span>
        {done===steps.length&&<span style={{color:"#4ECDC4",fontSize:13,fontWeight:700}}>Ã°ÂÂÂ Gotowe!</span>}
      </div>
      {steps.map((s,i)=>(
        <div key={s.id} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${s.done?"#4ECDC420":"#151520"}`,borderRadius:14,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start",marginBottom:8,opacity:s.done?.6:1,transition:"opacity .2s"}}>
          <div onClick={()=>setSteps(p=>p.map(st=>st.id===s.id?{...st,done:!st.done}:st))} style={{width:22,height:22,borderRadius:6,border:`2px solid ${s.done?"#4ECDC4":"#1e1e2e"}`,background:s.done?"#4ECDC420":"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            {s.done&&<span style={{color:"#4ECDC4",fontSize:11}}>Ã¢ÂÂ</span>}
          </div>
          <div><div style={{fontWeight:700,color:s.done?"#333":"#e0e0e8",fontSize:14,textDecoration:s.done?"line-through":"none"}}>Krok {i+1}: {s.title}</div><div style={{color:"#252535",fontSize:12,marginTop:3}}>{s.desc}</div></div>
        </div>
      ))}
    </div>
  );
}

const TRAINING=[{id:"t1",title:"Jak obsÃÂugiwaÃÂ leady Ã¢ÂÂ pierwsze 24h",cat:"SprzedaÃÂ¼",dur:"12 min",type:"video",free:true},{id:"t2",title:"Jak czytaÃÂ raport miesiÃÂczny",cat:"Raporty",dur:"8 min",type:"article",free:true},{id:"t3",title:"Facebook Ads Manager Ã¢ÂÂ podstawy",cat:"Techniczne",dur:"15 min",type:"video",free:false},{id:"t4",title:"Zaawansowana optymalizacja kampanii",cat:"Kampanie",dur:"22 min",type:"video",free:false},{id:"t5",title:"Psychologia sprzedaÃÂ¼y Ã¢ÂÂ konwersja",cat:"SprzedaÃÂ¼",dur:"18 min",type:"video",free:false}];
function ClientTraining({isPro,onUpgrade}) {
  const cats=[...new Set(TRAINING.map(m=>m.cat))];
  return (
    <div>
      <SH title="Platforma Szkoleniowa" sub="MateriaÃÂy ktÃÂ³re pomogÃÂ Ci maksymalizowaÃÂ wyniki"/>
      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:20}}>
          <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>{cat}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
            {TRAINING.filter(m=>m.cat===cat).map(m=>(
              <div key={m.id} onClick={!m.free&&!isPro?onUpgrade:undefined} style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:`1px solid ${!m.free&&!isPro?"#0f0f18":"#151520"}`,borderRadius:12,padding:14,cursor:!m.free&&!isPro?"pointer":"default",opacity:!m.free&&!isPro?.5:1}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:20}}>{m.type==="video"?"Ã°ÂÂÂ¬":"Ã°ÂÂÂ"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#bbb",fontSize:13,marginBottom:3}}>{m.title}</div>
                    <div style={{color:"#252535",fontSize:11,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      {m.dur}
                      {!m.free&&!isPro?<span style={{background:"#FF6B3515",color:"#FF6B35",border:"1px solid #FF6B3525",borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:700}}>PRO</span>:<span style={{background:"#4ECDC415",color:"#4ECDC4",border:"1px solid #4ECDC425",borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:700}}>FREE</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const KB_ITEMS=[{t:"Jak dodaÃÂ kartÃÂ do Meta Ads",cat:"PÃÂatnoÃÂci"},{t:"Jak pobraÃÂ fakturÃÂ z Facebook Ads",cat:"PÃÂatnoÃÂci"},{t:"Jak podÃÂÃÂczyÃÂ SMS do odbioru leadÃÂ³w",cat:"Techniczne"},{t:"Jak czytaÃÂ wyniki kampanii",cat:"Kampanie"},{t:"Jak zakwalifikowaÃÂ lead w 60 sekund",cat:"SprzedaÃÂ¼"}];
function ClientKB() {
  const cats=[...new Set(KB_ITEMS.map(i=>i.cat))];
  return (
    <div>{cats.map(cat=>(
      <div key={cat} style={{marginBottom:16}}>
        <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{cat}</div>
        {KB_ITEMS.filter(a=>a.cat===cat).map((a,i)=>(
          <div key={i} className="hr" style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:10,padding:"12px 16px",marginBottom:5,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background .1s"}}>
            <span style={{fontWeight:700,color:"#bbb",fontSize:13}}>{a.t}</span>
            <span style={{color:"#1e1e2e"}}>Ã¢ÂÂº</span>
          </div>
        ))}
      </div>
    ))}</div>
  );
}

function CampaignOrder() {
  const [step,setStep]=useState(1); const [form,setForm]=useState({goal:"",budget:"",audience:"",offer:"",notes:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  if(step===3) return (
    <div style={{textAlign:"center",paddingTop:40}}>
      <div style={{fontSize:48,marginBottom:14}}>Ã°ÂÂÂ</div>
      <div style={{fontWeight:900,color:"#fff",fontSize:22,marginBottom:8}}>ZamÃÂ³wienie wysÃÂane!</div>
      <div style={{color:"#333",fontSize:13,marginBottom:20}}>Odezwiemy siÃÂ w ciÃÂgu 24h z planem kampanii.</div>
      <button onClick={()=>setStep(1)} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"10px 22px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Nowe zamÃÂ³wienie</button>
    </div>
  );
  return (
    <div>
      <SH title="ZamÃÂ³w nowÃÂ kampaniÃÂ" sub="WypeÃÂnij brief Ã¢ÂÂ dostaniesz wycenÃÂ w 24h"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:3,background:step>=s?TENANT.primary:"#141420",transition:"background .3s"}}/>)}
      </div>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:18,padding:26,maxWidth:520}}>
        {step===1&&<>
          <div style={{fontWeight:900,color:"#fff",fontSize:16,marginBottom:18}}>Krok 1 Ã¢ÂÂ Cel i budÃÂ¼et</div>
          {[["Cel kampanii","goal","text","np. Zbieranie leadÃÂ³w na pakiet treningowy"],["MiesiÃÂczny budÃÂ¼et (zÃÂ)","budget","number","np. 1500"]].map(([l,k,t,ph])=>(
            <div key={k} style={{marginBottom:16}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{l}</div><input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:13,outline:"none"}}/></div>
          ))}
          <button onClick={()=>setStep(2)} style={{width:"100%",background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Dalej Ã¢ÂÂ</button>
        </>}
        {step===2&&<>
          <div style={{fontWeight:900,color:"#fff",fontSize:16,marginBottom:18}}>Krok 2 Ã¢ÂÂ SzczegÃÂ³ÃÂy</div>
          {[["Docelowa grupa","audience","MÃÂÃÂ¼czyÃÂºni 30-50 lat, KrakÃÂ³w"],["Oferta","offer","np. Pakiet 3 miesiÃÂce 699 zÃÂ"]].map(([l,k,ph])=>(
            <div key={k} style={{marginBottom:16}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{l}</div><input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:13,outline:"none"}}/></div>
          ))}
          <div style={{marginBottom:20}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Uwagi</div><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:13,outline:"none",resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8}}><button onClick={()=>setStep(1)} style={{flex:1,background:"#0f0f1e",border:"1px solid #1e1e2e",color:"#444",borderRadius:10,padding:"12px 0",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Ã¢ÂÂ WrÃÂ³ÃÂ</button><button onClick={()=>setStep(3)} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>WyÃÂlij Ã°ÂÂÂ</button></div>
        </>}
      </div>
    </div>
  );
}

function TicketForm() {
  const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [prio,setPrio]=useState("medium"); const [sent,setSent]=useState(false);
  if(sent) return <div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:48,marginBottom:14}}>Ã¢ÂÂ</div><div style={{fontWeight:900,color:"#fff",fontSize:20,marginBottom:8}}>ZgÃÂoszenie wysÃÂane!</div><div style={{color:"#333",fontSize:13}}>Odpiszemy w 24h roboczych.</div><button onClick={()=>{setSent(false);setTitle("");setDesc("");}} style={{marginTop:20,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"10px 20px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Nowe zgÃÂoszenie</button></div>;
  return (
    <div>
      <SH title="ZgÃÂoÃÂ problem"/>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #151520",borderRadius:18,padding:24,maxWidth:520}}>
        <div style={{marginBottom:16}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Temat</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="np. Nie widzÃÂ nowych leadÃÂ³w" style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:13,outline:"none"}}/></div>
        <div style={{marginBottom:16}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Priorytet</div><div style={{display:"flex",gap:6}}>{[["high","Pilne","#FF6B35"],["medium","Normalne","#F7C59F"],["low","Niskie","#444"]].map(([v,l,c])=><button key={v} onClick={()=>setPrio(v)} style={{flex:1,background:prio===v?c+"15":"#08080f",border:`1px solid ${prio===v?c+"40":"#151525"}`,color:prio===v?c:"#333",borderRadius:8,padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div></div>
        <div style={{marginBottom:20}}><div style={{color:"#252535",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Opis</div><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} style={{width:"100%",background:"#08080f",border:"1px solid #151525",borderRadius:10,padding:"11px 14px",color:"#ddd",fontSize:13,outline:"none",resize:"vertical"}}/></div>
        <button onClick={()=>{if(title.trim())setSent(true);}} style={{width:"100%",background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>WyÃÂlij zgÃÂoszenie Ã¢ÂÂ</button>
      </div>
    </div>
  );
}

function UpgradeModal({onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid #1e1e2e",borderRadius:22,width:"100%",maxWidth:480,padding:32,boxShadow:`0 24px 80px #000`}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:42,marginBottom:12}}>Ã¢ÂÂ¡</div><div style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>Odblokuj Hardgain Pro</div><div style={{color:"#333",fontSize:13,marginTop:5}}>PeÃÂny dostÃÂp do wszystkich funkcji</div></div>
        <div style={{marginBottom:24}}>
          {["Ã¢ÂÂ PeÃÂne dane leadÃÂ³w Ã¢ÂÂ imiÃÂ, telefon, status","Ã¢ÂÂ Wykresy CPL i trendÃÂ³w w czasie","Ã¢ÂÂ Raporty miesiÃÂczne z historiÃÂ","Ã¢ÂÂ Zatwierdzanie kreacji reklamowych","Ã¢ÂÂ Chat z agencjÃÂ bez limitu","Ã¢ÂÂ Eksport leadÃÂ³w do CSV","Ã¢ÂÂ ZamÃÂ³wienia nowych kampanii","Ã¢ÂÂ Powiadomienia push przy nowym leadzie"].map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #0f0f18",color:"#666",fontSize:13}}>{f}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"#0f0f1e",border:"1px solid #1e1e2e",color:"#333",borderRadius:12,padding:"12px 0",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>ZostaÃÂ Free</button>
          <button onClick={onClose} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"#fff",borderRadius:12,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14,boxShadow:`0 4px 20px ${TENANT.primary}50`}}>Odblokuj za 99 zÃÂ/mies Ã¢ÂÂ</button>
        </div>
        <div style={{textAlign:"center",color:"#1e1e2e",fontSize:11,marginTop:12}}>MoÃÂ¼esz zrezygnowaÃÂ w kaÃÂ¼dej chwili</div>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ ROOT Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
export default function App() {
  const [user,setUser]=useState(null);
  if(!user) return <Login onLogin={setUser}/>;
  if(user.role==="admin") return <AdminApp user={user} onLogout={()=>setUser(null)}/>;
  return <ClientApp user={user} onLogout={()=>setUser(null)}/>;
}
