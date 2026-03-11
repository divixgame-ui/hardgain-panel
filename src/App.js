import { useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { jsPDF } from "jspdf";
import { supabase, signIn, signOut, getUserProfile, getSession, subscribeToLeads } from "./lib/supabase";

/* ─── TENANT CONFIG (white-label ready) ─────────────────────────────── */
const TENANT = {
  name: "Hardgain",
  tagline: "Agency Panel",
  primary: "#ff5c1a",
  accent: "#22d3a0",
  logo: "H",
  font: "'DM Sans', sans-serif",
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

    /* ── CSS VARIABLES ─────────────────────────────────────────── */
    :root {
      --bg-base:      #05050a;
      --bg-surface:   #0a0a12;
      --bg-raised:    #0f0f1a;
      --bg-overlay:   #141422;
      --bg-subtle:    #1a1a2a;
      --text-primary: #f0f0f8;
      --text-sec:     #8888a8;
      --text-muted:   #444460;
      --accent:       #ff5c1a;
      --accent-hover: #ff7040;
      --accent-glow:  rgba(255,92,26,0.15);
      --accent-b:     rgba(255,92,26,0.3);
      --success:      #22d3a0;
      --success-dim:  rgba(34,211,160,0.1);
      --success-b:    rgba(34,211,160,0.22);
      --warning:      #f59e0b;
      --warning-dim:  rgba(245,158,11,0.1);
      --danger:       #ef4444;
      --danger-dim:   rgba(239,68,68,0.1);
      --info:         #60a5fa;
      --info-dim:     rgba(96,165,250,0.1);
      --border:       rgba(255,255,255,0.06);
      --border-hi:    rgba(255,255,255,0.10);
      --shadow-card:  0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--border);
      --shadow-up:    0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border);
      --sidebar-bg:   #070710;
      --sidebar-w:    220px;
    }

    /* ── RESET ── */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

    /* ── BASE ── */
    body{background:var(--bg-base);color:var(--text-sec);font-family:${TENANT.font};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-size:14px;line-height:1.5;}

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:var(--bg-subtle);border-radius:2px;}

    /* ── FORMS ── */
    input,textarea,select,button{font-family:inherit;}
    input,textarea,select{background:var(--bg-base);border:1px solid var(--border);color:var(--text-primary);border-radius:9px;padding:10px 14px;font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;}
    input::placeholder,textarea::placeholder{color:var(--text-muted);}
    input:focus,textarea:focus,select:focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px var(--accent-glow);outline:none;}
    button{transition:all .15s ease;border:none;cursor:pointer;font-family:inherit;}
    button:active{transform:scale(0.97);}
    a{transition:all .15s ease;}

    /* ── ANIMATIONS ── */
    @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px var(--accent-glow)}50%{box-shadow:0 0 20px rgba(255,92,26,.28)}}
    @keyframes hot{0%,100%{background:var(--accent-glow)}50%{background:rgba(255,92,26,.2)}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
    @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}

    /* ── UTILITY ── */
    .fu{animation:fu .2s ease forwards}
    .num,.kpi-val,.mono{font-family:'DM Mono',monospace;font-variant-numeric:tabular-nums;}
    .blur5{filter:blur(5px);user-select:none;pointer-events:none}
    .hot-row{animation:hot 2s infinite}
    .skeleton{background:linear-gradient(90deg,var(--bg-raised) 25%,var(--bg-overlay) 50%,var(--bg-raised) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}

    /* ── HOVER STATES ── */
    .hc:hover{background:var(--bg-overlay)!important;transition:background .12s}
    .hr:hover{background:var(--bg-raised)!important;transition:background .12s}
    .nb:hover{background:var(--bg-overlay)!important;color:var(--text-primary)!important;transition:all .12s}

    /* ── CARDS ── */
    .card{background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-card);transition:border-color .15s,box-shadow .15s;}
    .card:hover{border-color:var(--border-hi);box-shadow:var(--shadow-up);}
    .card-body{padding:20px;}
    .card-header{padding:13px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}

    /* ── KPI CARDS ── */
    .kpi-card{background:linear-gradient(135deg,var(--bg-surface) 0%,var(--bg-raised) 100%);border:1px solid var(--border);border-radius:14px;padding:20px;position:relative;overflow:hidden;}
    .kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--border-hi),transparent);}
    .kpi-number{font-family:'DM Mono',monospace;font-variant-numeric:tabular-nums;font-size:26px;font-weight:500;line-height:1;color:var(--text-primary);margin-bottom:6px;}
    .kpi-label{font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;}
    .kpi-trend-up{font-size:10px;font-weight:700;color:var(--success);}
    .kpi-trend-down{font-size:10px;font-weight:700;color:var(--danger);}

    /* ── BUTTONS ── */
    .btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;transition:all .12s;border:none;white-space:nowrap;font-family:inherit;}
    .btn-primary{background:var(--accent);color:#fff;}
    .btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px);}
    .btn-primary:active{transform:scale(0.98);}
    .btn-secondary{background:transparent;color:var(--text-primary);border:1px solid var(--border-hi);}
    .btn-secondary:hover{background:var(--bg-overlay);}
    .btn-ghost{background:transparent;color:var(--text-sec);border:none;padding:7px 12px;}
    .btn-ghost:hover{color:var(--text-primary);background:var(--bg-overlay);}
    .btn-sm{padding:5px 11px;font-size:11px;border-radius:6px;}
    .btn-lg{padding:11px 22px;font-size:14px;border-radius:10px;}

    /* ── BADGES ── */
    .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
    .badge-success{background:var(--success-dim);color:var(--success);border:1px solid var(--success-b);}
    .badge-warning{background:var(--warning-dim);color:var(--warning);border:1px solid rgba(245,158,11,.2);}
    .badge-danger{background:var(--danger-dim);color:var(--danger);border:1px solid rgba(239,68,68,.2);}
    .badge-info{background:var(--info-dim);color:var(--info);border:1px solid rgba(96,165,250,.2);}
    .badge-neutral{background:rgba(255,255,255,.05);color:var(--text-sec);border:1px solid var(--border);}
    .badge-accent{background:var(--accent-glow);color:var(--accent);border:1px solid var(--accent-b);}

    /* ── SIDEBAR NAV ── */
    .nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;margin:2px 8px;border-radius:8px;color:var(--text-sec);font-size:13px;font-weight:500;cursor:pointer;transition:all .12s;border:1px solid transparent;background:transparent;font-family:inherit;text-align:left;width:calc(100% - 16px);}
    .nav-item:hover{background:var(--bg-overlay);color:var(--text-primary);}
    .nav-item.active{background:var(--accent-glow);color:var(--accent);border-color:var(--accent-b);}
    .nav-icon{font-size:14px;flex-shrink:0;width:16px;text-align:center;}

    /* ── TABS ── */
    .tabs-bar{display:flex;gap:0;background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;padding:3px;flex-wrap:wrap;margin-bottom:20px;}
    .tab-btn{background:transparent;border:none;color:var(--text-muted);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .12s;display:flex;align-items:center;gap:5px;}
    .tab-btn.active{background:var(--bg-overlay);color:var(--text-primary);font-weight:600;box-shadow:var(--shadow-card);}
    .tab-btn:hover:not(.active){color:var(--text-sec);}

    /* ── LOGIN ── */
    .login-wrap{min-height:100vh;background:var(--bg-base);background-image:radial-gradient(circle at 50% 0%,rgba(255,92,26,.07) 0%,transparent 60%);display:grid;place-items:center;padding:20px;}
    .login-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:400px;box-shadow:0 24px 80px rgba(0,0,0,.6);}

    /* ── FORM LABEL ── */
    .form-label{color:var(--text-muted);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;display:block;}

    /* ── TABLE ROWS ── */
    .table-row{display:grid;padding:12px 16px;border-bottom:1px solid var(--border);align-items:center;transition:background .1s;}
    .table-row:hover{background:var(--bg-raised);}
    .table-header{padding:8px 16px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);border-bottom:1px solid var(--border);}

    /* ── RESPONSIVE (wszystkie klasy zachowane) ── */
    @media(max-width:768px){
      :root{--sidebar-ml:0px}
      .mobile-menu-btn{display:flex!important}
      .sidebar-panel{transform:translateX(-100%);transition:transform .25s ease}
      .sidebar-panel.open{transform:translateX(0)}
      main{padding:12px!important;padding-top:60px!important}
      .kpi-grid-5{grid-template-columns:repeat(2,1fr)!important}
      .kpi-grid-5>:last-child:nth-child(odd){grid-column:span 2!important}
      .kpi-grid-4{grid-template-columns:repeat(2,1fr)!important}
      .kpi-val{font-size:clamp(16px,4.5vw,28px)!important;word-break:break-all!important}
      .chart-grid-2{grid-template-columns:1fr!important}
      .bottom-grid-3{grid-template-columns:1fr!important}
      .camp-grid{grid-template-columns:1fr!important}
      .client-header{flex-wrap:wrap!important;gap:10px!important}
      .client-header-actions{margin-left:0!important;width:100%!important;justify-content:flex-start!important}
      .tabs-scroll{overflow-x:auto!important;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .tabs-scroll::-webkit-scrollbar{display:none}
      .dash-top-row{flex-direction:column!important;gap:8px!important}
      .settings-grid-3{grid-template-columns:1fr!important}
      .map-grid{grid-template-columns:1fr!important}
      .leads-row{flex-wrap:wrap!important;gap:8px!important}
      .leads-meta{flex-wrap:wrap!important;gap:6px!important}
      .cal-grid{grid-template-columns:1fr!important}
      .cal-cell{min-height:60px!important;padding:3px!important}
      .cal-day-header{font-size:9px!important;padding:6px 4px!important}
      .chat-layout{flex-direction:column!important;height:auto!important;max-height:none!important}
      .chat-sidebar{width:100%!important;height:auto!important;max-height:160px!important;overflow-y:auto!important;border-right:none!important;border-bottom:1px solid var(--border)!important}
      .chat-client-header{display:none!important}
      .chat-main{min-height:400px!important}
      .ticket-row{flex-wrap:wrap!important;gap:8px!important}
      .quick-contact{grid-template-columns:1fr 1fr!important}
      .invoice-billing{grid-template-columns:1fr!important}
      .lead-detail-grid{grid-template-columns:1fr!important}
      .funnel-row{grid-template-columns:repeat(2,1fr)!important}
      .campaign-table-row{grid-template-columns:1fr 80px!important}
    }
    @media(max-width:1024px){
      .kpi-grid-5{grid-template-columns:repeat(3,1fr)!important}
      .kpi-grid-4{grid-template-columns:repeat(2,1fr)!important}
      .kpi-val{font-size:clamp(16px,4.5vw,28px)!important;word-break:break-all!important}
      .chart-grid-2{grid-template-columns:1fr!important}
      .bottom-grid-3{grid-template-columns:1fr!important}
      .camp-grid{grid-template-columns:1fr!important}
    }
  `}</style>
);

/* ─── DATA ───────────────────────────────────────────────────────────── */
const CLIENTS = [
  {id:"c1",name:"FitZone Studio",email:"fitzone@gmail.com",phone:"500 123 456",avatar:"F",color:"var(--accent)",region:"małopolskie",city:"Kraków",lat:50.06,lng:19.94,plan_key:"pro",plan:"Pro",planPrice:2500,since:"2026-01-10",nip:"123-456-78-90",address:"ul. Sportowa 12, 30-001 Kraków",status:"active",
    stats:{leads:87,cpl:18.4,spend:1601,conversion:12,revenue:8700,calls:34},
    weekLeads:[8,12,7,15,11,9,14],weekCpl:[21,18,24,16,19,22,17],
    monthLeads:[54,67,87],monthSpend:[980,1200,1601],
    funnel:{clicks:1240,leads:87,calls:34,clients:12},
    campaigns:[
      {id:"cp1",name:"Broad — Pakiet Roczny",status:"active",budget:50,spend:1240,leads:52,cpl:23.8,start:"2026-03-01",creative:"Video 25s Hook"},
      {id:"cp2",name:"Retargeting — Video",status:"active",budget:30,spend:361,leads:35,cpl:10.3,start:"2026-03-05",creative:"Karuzelka"},
    ],
    leads:[
      {id:1,name:"Marek Nowak",phone:"500 111 222",date:"2026-03-08 09:14",status:"new",campaign:"Broad — Pakiet Roczny",adSet:"Mężczyźni 30-45 Kraków",hot:14,answers:{cel:"Chcę schudnąć 10kg",start:"ASAP",budzet:"499 zł/mies"}},
      {id:2,name:"Tomasz Kowal",phone:"601 222 333",date:"2026-03-08 07:33",status:"new",campaign:"Retargeting — Video",adSet:"Odwiedzający stronę 30d",hot:106,answers:{cel:"Budowanie masy",start:"Za miesiąc",budzet:"699 zł"}},
      {id:3,name:"Piotr Wiśniewski",phone:"512 333 444",date:"2026-03-07 11:02",status:"contacted",campaign:"Broad — Pakiet Roczny",adSet:"Mężczyźni 30-45 Kraków",hot:1382,answers:{cel:"Ogólna sprawność",start:"W tym tygodniu",budzet:"Zależy od oferty"}},
      {id:4,name:"Adam Lewandowski",phone:"609 444 555",date:"2026-03-06 14:55",status:"qualified",campaign:"Retargeting — Video",adSet:"Engagerzy 60d",hot:2885,answers:{cel:"Redukcja tłuszczu",start:"Jutro",budzet:"800 zł/mies"}},
      {id:5,name:"Krzysztof Zając",phone:"513 555 666",date:"2026-03-05 20:11",status:"closed_won",campaign:"Interests",adSet:"Fitness 25-55",hot:4749,answers:{cel:"Metamorfoza 90 dni",start:"Teraz",budzet:"Bez znaczenia"}},
    ],
    messages:[
      {from:"admin",text:"Cześć! Kampania Broad ruszyła, pierwsze leady już wpadają 🔥",time:"09:00"},
      {from:"client",text:"Super! Ile leadów dzisiaj?",time:"09:15"},
      {from:"admin",text:"8 od rana, CPL ~21 zł. Optymalizuję grupę docelową.",time:"09:18"},
    ],
    tickets:[{id:"t1",title:"Nie widzę leadów z marca",status:"resolved",date:"2026-03-05",priority:"high"}],
    creatives:[
      {id:"cr1",name:"Hook Video — Pakiet Roczny",type:"video",status:"pending_approval",campaign:"Broad",thumb:"🎬"},
      {id:"cr2",name:"Karuzelka — Transformacje",type:"image",status:"approved",campaign:"Retargeting",thumb:"🖼️"},
    ],
    campaignOrders:[],
  },
  {id:"c2",name:"Marcin Trener",email:"marcin@pt.pl",phone:"601 234 567",avatar:"M",color:"var(--success)",region:"małopolskie",city:"Nowy Sącz",lat:49.62,lng:20.69,plan_key:"free",plan:"Starter",planPrice:1500,since:"2026-02-01",nip:"987-654-32-10",address:"ul. Fitness 5, 31-002 Nowy Sącz",status:"active",
    stats:{leads:34,cpl:22.1,spend:750,conversion:9,revenue:3400,calls:12},
    weekLeads:[3,5,4,6,4,5,7],weekCpl:[22,20,25,19,23,21,18],
    monthLeads:[24,34],monthSpend:[600,750],
    funnel:{clicks:620,leads:34,calls:12,clients:3},
    campaigns:[{id:"cp4",name:"Broad — Personal Training",status:"active",budget:30,spend:750,leads:34,cpl:22.1,start:"2026-02-01",creative:"Video 25s"}],
    leads:[
      {id:6,name:"Bartek Kowalczyk",phone:"555 111 222",date:"2026-03-08 10:00",status:"new",campaign:"Broad — Personal Training",adSet:"Mężczyźni 25-50 Nowy Sącz",hot:5,answers:{cel:"Trening personalny 3x/tyg",start:"ASAP",budzet:"400 zł/mies"}},
      {id:7,name:"Rafał Mazur",phone:"666 222 333",date:"2026-03-07 15:30",status:"contacted",campaign:"Broad — Personal Training",adSet:"Mężczyźni 25-50 Nowy Sącz",hot:1110,answers:{cel:"Powrót do formy",start:"Za 2 tygodnie",budzet:"Do 500 zł"}},
    ],
    messages:[{from:"admin",text:"Raport tygodniowy — 34 leady, CPL 22 zł.",time:"Wtorek"},{from:"client",text:"Możemy zwiększyć budżet?",time:"Wtorek"}],
    tickets:[],creatives:[{id:"cr4",name:"Video — PT",type:"video",status:"approved",campaign:"Broad PT",thumb:"🎬"}],
    campaignOrders:[],
  },
  {id:"c3",name:"PowerGym Kraków",email:"power@gym.pl",phone:"512 345 678",avatar:"P",color:"#A78BFA",region:"małopolskie",city:"Kraków",lat:50.08,lng:19.97,plan_key:"pro",plan:"Pro",planPrice:2500,since:"2026-03-01",nip:"111-222-33-44",address:"ul. Siłownia 99, 30-500 Kraków",status:"trial",
    stats:{leads:12,cpl:31.5,spend:378,conversion:0,revenue:0,calls:3},
    weekLeads:[1,2,1,3,2,1,2],weekCpl:[31,28,35,30,32,29,33],
    monthLeads:[12],monthSpend:[378],
    funnel:{clicks:340,leads:12,calls:3,clients:0},
    campaigns:[{id:"cp5",name:"Launch — Karnet",status:"active",budget:40,spend:378,leads:12,cpl:31.5,start:"2026-03-01",creative:"Video 25s"}],
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
      {id:"cp6",name:"Broad — Karnet Roczny",status:"active",budget:60,spend:1200,leads:80,cpl:15.0,start:"2025-11-01",creative:"Video 30s"},
      {id:"cp7",name:"Retargeting Warszawa",status:"active",budget:25,spend:685,leads:44,cpl:15.6,start:"2026-01-15",creative:"Karuzelka"},
    ],
    leads:[{id:9,name:"Karol Wiśniewski",phone:"600 100 200",date:"2026-03-08 08:30",status:"new",campaign:"Broad",hot:32}],
    messages:[],tickets:[],creatives:[],campaignOrders:[],
  },
  {id:"c5",name:"IronBody Wrocław",email:"iron@body.pl",phone:"700 111 222",avatar:"I",color:"#34D399",region:"dolnośląskie",city:"Wrocław",lat:51.11,lng:17.02,plan_key:"pro",plan:"Agency",planPrice:2200,since:"2026-01-20",nip:"333-444-55-66",address:"ul. Świdnicka 20, 50-001 Wrocław",status:"active",
    stats:{leads:56,cpl:19.8,spend:1109,conversion:10,revenue:6200,calls:22},
    weekLeads:[6,8,7,9,7,8,11],weekCpl:[20,18,22,19,21,18,20],
    monthLeads:[38,56],monthSpend:[750,1109],
    funnel:{clicks:890,leads:56,calls:22,clients:10},
    campaigns:[{id:"cp8",name:"Broad — Transformacja",status:"active",budget:45,spend:1109,leads:56,cpl:19.8,start:"2026-01-20",creative:"Video 25s"}],
    leads:[{id:10,name:"Łukasz Nowak",phone:"700 222 333",date:"2026-03-08 07:15",status:"new",campaign:"Broad",hot:88}],
    messages:[],tickets:[],creatives:[],campaignOrders:[],
  },
];

const CALENDAR_EVENTS = [
  {id:"e1",clientId:"c1",title:"Call — wyniki marca",date:"2026-03-10",time:"10:00",type:"call",duration:30},
  {id:"e2",clientId:"c4",title:"Strategia Q2",date:"2026-03-12",time:"14:00",type:"meeting",duration:60},
  {id:"e3",clientId:"c2",title:"Onboarding nowa kampania",date:"2026-03-15",time:"11:00",type:"onboarding",duration:45},
  {id:"e4",clientId:"c1",title:"Prezentacja raportu",date:"2026-03-18",time:"16:00",type:"report",duration:30},
  {id:"e5",clientId:"c5",title:"Call — nowe kreacje",date:"2026-03-20",time:"09:00",type:"call",duration:30},
  {id:"e6",clientId:"c3",title:"Kickoff kampania Q2",date:"2026-03-22",time:"13:00",type:"meeting",duration:60},
  {id:"e7",clientId:"c4",title:"Raport miesięczny",date:"2026-03-25",time:"15:00",type:"report",duration:30},
  {id:"e8",clientId:"c2",title:"Strategia — zwiększenie budżetu",date:"2026-03-08",time:"12:00",type:"call",duration:30},
];

const USERS = [
  {id:"admin",role:"admin",name:"Jan",email:"jan@hardgain.pl",password:"admin123",avatar:"J",color:"var(--accent)"},
  {id:"c1",role:"client",name:"FitZone Studio",email:"fitzone@gmail.com",password:"klient1",avatar:"F",color:"var(--accent)"},
  {id:"c2",role:"client",name:"Marcin Trener",email:"marcin@pt.pl",password:"klient2",avatar:"M",color:"var(--success)"},
];

const REGIONS_DATA = [
  {name:"małopolskie",count:3,leads:133,revenue:12100},
  {name:"mazowieckie",count:1,leads:124,revenue:14400},
  {name:"dolnośląskie",count:1,leads:56,revenue:6200},
];

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const fmt = n => (n||0).toLocaleString("pl-PL");
const mono = (v, col="#fff") => <span style={{fontFamily:"'DM Mono',monospace",color:col,fontWeight:700}}>{v}</span>;

const LEAD_S = {new:["Nowy","badge-accent"],contacted:["Kontakt","badge-warning"],qualified:["Kwalif.","badge-info"],closed_won:["Zamknięty","badge-success"],closed_lost:["Odpada","badge-neutral"]};
const LBadge = ({s}) => { const [l,c]=LEAD_S[s]||["?","badge-neutral"]; return <span className={`badge ${c}`}>{l}</span>;};

/* ─── TOAST ──────────────────────────────────────────────────────────── */
let _toastTimeout=null;
let _setToastGlobal=null;
function showToast(msg){if(_setToastGlobal){_setToastGlobal({type:"info",msg});clearTimeout(_toastTimeout);_toastTimeout=setTimeout(()=>_setToastGlobal(null),3000);}}
function showLeadToast(lead){if(_setToastGlobal){_setToastGlobal({type:"lead",lead});clearTimeout(_toastTimeout);_toastTimeout=setTimeout(()=>_setToastGlobal(null),6000);}}

/* FAKE LIVE NAMES for demo notifications */
const FAKE_LEADS=[
  {name:"Piotr Malinowski",city:"Kraków",campaign:"Broad — Pakiet Roczny",phone:"512 ***  ***"},
  {name:"Dawid Nowicki",city:"Warszawa",campaign:"Retargeting — Video",phone:"601 *** ***"},
  {name:"Michał Kowalczyk",city:"Gdańsk",campaign:"Interests — Fitness",phone:"500 *** ***"},
  {name:"Kamil Wróbel",city:"Wrocław",campaign:"Broad — Personal Training",phone:"666 *** ***"},
  {name:"Artur Szymański",city:"Poznań",campaign:"Launch — Karnet",phone:"777 *** ***"},
  {name:"Łukasz Jabłoński",city:"Kraków",campaign:"Broad — Pakiet Roczny",phone:"513 *** ***"},
  {name:"Tomasz Dąbrowski",city:"Warszawa",campaign:"Retargeting — Video",phone:"609 *** ***"},
];

function Toast(){
  const [data,setData]=useState(null);
  useEffect(()=>{_setToastGlobal=setData;return()=>{_setToastGlobal=null;};},[]);
  if(!data) return null;
  if(data.type==="lead"){
    const l=data.lead;
    return(
      <div style={{position:"fixed",bottom:24,right:24,left:"auto",transform:"none",background:"var(--bg-raised)",border:"1px solid var(--success-b)",borderRadius:16,padding:"16px 20px",color:"var(--text-primary)",zIndex:9999,boxShadow:"0 12px 48px rgba(0,0,0,.7),0 0 0 1px var(--success-b)",animation:"fu .25s ease forwards",minWidth:280,maxWidth:320}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"var(--success)",boxShadow:"0 0 8px var(--success)",flexShrink:0,animation:"glow 1s infinite"}}/>
          <span style={{fontSize:10,color:"var(--success)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Nowy lead właśnie wpadł</span>
        </div>
        <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:15,marginBottom:2}}>{l.name}</div>
        <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:10}}>{l.city} · {l.campaign}</div>
        <div style={{display:"flex",gap:8}}>
          <a href={`tel:${l.phone}`} className="btn btn-primary" style={{flex:1,textDecoration:"none",textAlign:"center",justifyContent:"center",fontSize:12}}>📞 Zadzwoń</a>
          <button onClick={()=>setData(null)} className="btn btn-ghost" style={{padding:"8px 12px",fontSize:12}}>✕</button>
        </div>
      </div>
    );
  }
  return <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"var(--bg-overlay)",border:"1px solid var(--border-hi)",borderRadius:12,padding:"11px 22px",color:"var(--text-primary)",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"var(--shadow-up)",animation:"fu .2s ease forwards",whiteSpace:"nowrap"}}>{data.msg}</div>;
}

/* Live leads — Supabase Realtime (produkcja) lub symulator demo */
function useLiveLeads(agencyId){
  useEffect(()=>{
    if(!agencyId) return;
    if(SUPABASE_READY && typeof agencyId === 'string' && agencyId.includes('-')) {
      // Supabase Realtime — real leads
      const channel = subscribeToLeads(agencyId, (lead) => showLeadToast(lead));
      return () => supabase.removeChannel(channel);
    } else {
      // Demo simulator
      let idx=0;
      const fire=()=>{ showLeadToast(FAKE_LEADS[idx++%FAKE_LEADS.length]); };
      const t1=setTimeout(fire,20000);
      const interval=setInterval(fire,Math.random()*45000+45000);
      return()=>{clearTimeout(t1);clearInterval(interval);};
    }
  },[agencyId]);
}

function HotTimer({m}) {
  const [tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),60000);return()=>clearInterval(id);},[]);
  const mins=m+tick;
  if(mins>1440) return <span className="mono" style={{color:"var(--text-muted)",fontSize:11}}>{Math.floor(mins/60)}h temu</span>;
  if(mins>60) return <span className="mono" style={{color:"var(--warning)",fontSize:11}}>{Math.floor(mins/60)}h temu</span>;
  return <span className="mono" style={{color:"var(--accent)",fontSize:11,fontWeight:700,animation:"glow 2s infinite"}}>🔥 {mins} min</span>;
}

/* ─── STAT CARD ──────────────────────────────────────────────────────── */
function KPI({label,value,sub,accent,icon,trend,locked,onUpgrade}) {
  return (
    <div className="kpi-card" style={{position:"relative"}}>
      {locked&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(5px)",background:"rgba(5,5,10,.75)",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:14,cursor:"pointer"}} onClick={onUpgrade}><span style={{background:"var(--bg-overlay)",border:"1px solid var(--border-hi)",borderRadius:8,padding:"7px 14px",fontSize:11,color:"var(--text-muted)",fontWeight:600}}>🔒 Pro</span></div>}
      <div style={{position:"absolute",top:14,right:16,fontSize:20,opacity:.1}}>{icon}</div>
      <div className="kpi-number kpi-val" style={accent?{color:accent}:{}}>{value}</div>
      <div className="kpi-label">{label}</div>
      {(sub||trend)&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
        {trend&&<span className={trend>0?"kpi-trend-up":"kpi-trend-down"}>{trend>0?"▲":"▼"} {Math.abs(trend)}%</span>}
        {sub&&<span style={{fontSize:10,color:"var(--text-muted)"}}>{sub}</span>}
      </div>}
    </div>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────── */
function Tabs({tabs,active,onSelect}) {
  return (
    <div className="tabs-bar tabs-scroll">
      {tabs.map(([k,l,ic])=>(
        <button key={k} onClick={()=>onSelect(k)} className={`tab-btn${active===k?" active":""}`}>
          {ic&&<span style={{opacity:.65,fontSize:13}}>{ic}</span>}{l}
        </button>
      ))}
    </div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────── */
const SH = ({title,sub,btn,onBtn,badge}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22,flexWrap:"wrap",gap:10}}>
    <div>
      <h2 style={{fontSize:20,fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        {title}
        {badge&&<span className="badge badge-accent">{badge}</span>}
      </h2>
      {sub&&<p style={{color:"var(--text-muted)",fontSize:12,marginTop:4}}>{sub}</p>}
    </div>
    {btn&&<button onClick={onBtn} className="btn btn-primary btn-sm">{btn}</button>}
  </div>
);

/* ─── SIDEBAR ────────────────────────────────────────────────────────── */
const ADMIN_NAV = [
  ["dashboard","◈","Dashboard",""],
  ["clients","◉","Klienci",""],
  ["map","⬡","Mapa Polski",""],
  ["calendar","◷","Kalendarz",""],
  ["campaigns","▶","Kampanie",""],
  ["leads_all","◎","Wszystkie leady",""],
  ["reports","▤","Raporty",""],
  ["chat","◌","Chat",""],
  ["tickets","△","Zgłoszenia",""],
  ["wiki","◧","Wiki",""],
  ["invoices","▣","Faktury",""],
  ["settings","⚙","Ustawienia",""],
];

function Sidebar({nav,view,setView,onLogout,badge,u}) {
  const [open,setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(o=>!o)} className="mobile-menu-btn" style={{display:"none",position:"fixed",top:12,left:12,zIndex:200,background:"var(--accent)",border:"none",borderRadius:10,width:38,height:38,cursor:"pointer",alignItems:"center",justifyContent:"center",fontSize:18,color:"var(--text-primary)",fontFamily:"inherit"}}>{open?"✕":"☰"}</button>
      {open&&<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:90}}/>}
      <div className={"sidebar-panel"+(open?" open":"")} style={{width:220,background:"var(--sidebar-bg)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",position:"fixed",top:0,bottom:0,left:0,zIndex:100}}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:`linear-gradient(135deg,${TENANT.primary},#c43a00)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"var(--text-primary)",boxShadow:`0 4px 12px ${TENANT.primary}50`,flexShrink:0}}>{TENANT.logo}</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>{TENANT.name}</div>
              <div style={{fontSize:9,color:"var(--text-muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{TENANT.tagline}</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"8px 0",flex:1,overflowY:"auto"}}>
          {nav.map(([v,icon,label])=>{
            const isActive = view===v || view.startsWith(v+"_");
            return (
              <button key={v} onClick={()=>{setView(v);setOpen(false);}} className={`nav-item${isActive?" active":""}`}>
                <span className="nav-icon">{icon}</span>
                {label}
                {v==="tickets"&&badge>0&&<span style={{marginLeft:"auto",background:"var(--accent)",color:"var(--text-primary)",borderRadius:6,padding:"1px 6px",fontSize:9,fontWeight:700}}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"8px 0",borderTop:"1px solid var(--border)"}}>
          <div style={{padding:"9px 12px",margin:"0 8px 4px",background:"var(--bg-raised)",borderRadius:8,display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:26,height:26,background:"var(--accent-glow)",border:"1px solid var(--accent-b)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--accent)",flexShrink:0}}>{u?.avatar||"J"}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u?.name||"Jan"}</div>
              <div style={{fontSize:10,color:"var(--text-muted)"}}>{u?.role==="admin"?"Admin":"Klient"}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"calc(100% - 16px)",margin:"0 8px",background:"transparent",border:"none",color:"var(--text-muted)",fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:"6px 12px",borderRadius:7,textAlign:"left",transition:"color .1s"}} onMouseEnter={e=>e.currentTarget.style.color="var(--text-sec)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>Wyloguj →</button>
        </div>
      </div>
    </>
  );
}

/* ─── LOGIN ──────────────────────────────────────────────────────────── */
const SUPABASE_READY = !!(process.env.REACT_APP_SUPABASE_URL && !process.env.REACT_APP_SUPABASE_URL.includes('placeholder'));

function Login({onLogin}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const handleLogin=async(e,p,demo=false)=>{
    const em=e||email; const pw=p||pass;
    setLoading(true);setErr("");
    try {
      if (SUPABASE_READY && !demo) {
        const { session } = await signIn(em, pw);
        const profile = await getUserProfile(session.user.id);
        onLogin({ ...profile, id: session.user.id });
      } else {
        await new Promise(r => setTimeout(r, 400));
        const u = USERS.find(u => u.email === em && u.password === pw);
        if (u) onLogin(u); else throw new Error("Nieprawidłowy email lub hasło");
      }
    } catch(ex) {
      setErr(ex.message || "Nieprawidłowy email lub hasło");
      setLoading(false);
    }
  };
  return (
    <div className="login-wrap">
      <G/>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",width:56,height:56,background:`linear-gradient(135deg,${TENANT.primary},#c43a00)`,borderRadius:16,alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"var(--text-primary)",marginBottom:20,boxShadow:`0 8px 28px ${TENANT.primary}55,0 0 0 1px rgba(255,92,26,.2)`}}>{TENANT.logo}</div>
          <div style={{fontSize:26,fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.025em"}}>{TENANT.name} Panel</div>
          <div style={{color:"var(--text-muted)",fontSize:13,marginTop:5}}>Marketing dla trenerów i siłowni</div>
        </div>
        <div className="login-card">
          {[["Email",email,setEmail,"email"],["Hasło",pass,setPass,"password"]].map(([l,v,s,t])=>(
            <div key={l} style={{marginBottom:16}}>
              <label className="form-label">{l}</label>
              <input type={t} value={v} onChange={e=>s(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
          ))}
          {err&&<div style={{color:"var(--danger)",fontSize:12,background:"var(--danger-dim)",padding:"9px 12px",borderRadius:8,marginBottom:14,border:"1px solid rgba(239,68,68,.2)"}}>{err}</div>}
          <button onClick={()=>handleLogin()} disabled={loading} className="btn btn-primary btn-lg" style={{width:"100%",justifyContent:"center",marginTop:4}}>
            {loading?"Logowanie...":"Zaloguj się →"}
          </button>
        </div>
        <div style={{marginTop:12,background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px"}}>
          <div className="form-label" style={{marginBottom:10}}>Demo — kliknij aby zalogować</div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {[{l:"👑 Admin",e:"jan@hardgain.pl",p:"admin123",role:"Superadmin"},{l:"✅ FitZone",e:"fitzone@gmail.com",p:"klient1",role:"Pro"},{l:"🔒 Marcin",e:"marcin@pt.pl",p:"klient2",role:"Free"}].map(d=>(
              <button key={d.e} onClick={()=>{setEmail(d.e);setPass(d.p);handleLogin(d.e,d.p,true);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",transition:"all .12s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-hi)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <span style={{color:"var(--text-sec)",fontSize:13}}>{d.l}</span>
                <span className="badge badge-neutral" style={{fontSize:9}}>{d.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN APP
════════════════════════════════════════════════════════════════════ */

/* ─── ONBOARDING MODAL ───────────────────────────────────────────── */
function OnboardingModal({onClose,clientCount,totalLeads}) {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"🚀",title:"Witaj w Hardgain Panel",sub:"Zarządzaj kampaniami, leadami i klientami w jednym miejscu",cta:"Pokaż mi"},
    {icon:"🔥",title:`${totalLeads} leadów · ${clientCount} aktywnych klientów`,sub:"Wszystkie dane kampanii Meta Ads w czasie rzeczywistym. CPL, wydatki, konwersje — bez Excela.",cta:"Dalej"},
    {icon:"📞",title:"Gorący lead = zadzwoń w 60 sekund",sub:"System alarmuje gdy lead jest gorący. Odpowiedź w <60 min zwiększa konwersję 3×.",cta:"Dalej"},
    {icon:"⚡",title:"White-label dla Twoich klientów",sub:"Każdy klient dostaje panel z Twoim logo. 299 zł/mies pasywnego dochodu od każdej siłowni.",cta:"Wchodzę →"},
  ];
  const s=steps[step];
  if(!s) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={step===steps.length-1?onClose:undefined}>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border-hi)",borderRadius:20,width:"100%",maxWidth:440,padding:40,textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,.8),0 0 0 1px var(--border)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:56,marginBottom:20,lineHeight:1}}>{s.icon}</div>
        <h2 style={{fontSize:21,fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.025em",marginBottom:10,lineHeight:1.3}}>{s.title}</h2>
        <p style={{color:"var(--text-sec)",fontSize:14,lineHeight:1.6,marginBottom:28}}>{s.sub}</p>
        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:24}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?20:6,height:5,borderRadius:3,background:i===step?"var(--accent)":"var(--bg-subtle)",transition:"all .3s"}}/>)}
        </div>
        <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onClose()} className="btn btn-primary btn-lg" style={{width:"100%",justifyContent:"center"}}>{s.cta}</button>
        {step>0&&<button onClick={onClose} className="btn btn-ghost" style={{marginTop:10,width:"100%",justifyContent:"center",fontSize:12}}>Pomiń</button>}
      </div>
    </div>
  );
}

function AdminApp({user,onLogout}) {
  const [view,setView]=useState("dashboard");
  const [clients,setClients]=useState(CLIENTS);
  const [events,setEvents]=useState(CALENDAR_EVENTS);
  const [focusId,setFocusId]=useState(null);
  useLiveLeads(user?.agency_id || "demo"); /* 🔥 live lead notifications */
  const openTickets=clients.flatMap(c=>c.tickets).filter(t=>t.status==="open").length;
  const focus=clients.find(c=>c.id===focusId);
  const openClient=(id)=>{setFocusId(id);setView("client_focus");};

  const [showOnboarding,setShowOnboarding]=useState(true);
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg-base)"}}>
      <G/>
      {showOnboarding&&<OnboardingModal onClose={()=>setShowOnboarding(false)} clientCount={clients.length} totalLeads={clients.reduce((s,c)=>s+c.stats.leads,0)}/>}
      <Sidebar nav={ADMIN_NAV} view={view} setView={v=>{setView(v);setFocusId(null);}} onLogout={onLogout} badge={openTickets} u={user}/>
      <main style={{marginLeft:"var(--sidebar-ml,220px)",flex:1,overflowX:"hidden"}}>
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

/* ─── PRO DASHBOARD ──────────────────────────────────────────────── */
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
  const weekData=["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].map((d,i)=>({
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

  const evColor={call:"var(--accent)",meeting:"var(--success)",onboarding:"#A78BFA",report:"#F7C59F"};

  const activeClients=clients.filter(c=>c.status==="active").length;
  const todayLeads=clients.flatMap(c=>c.leads).filter(l=>l.hot<=1440).length;
  const bestCPL=Math.min(...clients.map(c=>c.stats.cpl)).toFixed(1);

  return (
    <div style={{padding:28}} className="fu">
      {/* ── HERO HEADER ── */}
      <div className="dash-top-row" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:900,color:"var(--text-primary)",letterSpacing:"-0.04em",lineHeight:1}}>Dashboard</h1>
          <p style={{color:"var(--text-muted)",fontSize:12,marginTop:5,display:"flex",alignItems:"center",gap:8}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"var(--success-dim)",border:"1px solid var(--success-b)",borderRadius:6,padding:"2px 8px",color:"var(--success)",fontWeight:700,fontSize:11}}>● {activeClients} aktywnych</span>
            <span>{new Date().toLocaleDateString("pl-PL",{weekday:"short",day:"numeric",month:"short"})}</span>
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {todayEvents.length>0&&<div style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",borderRadius:10,padding:"7px 12px",fontSize:11,color:"var(--accent)",fontWeight:700}}>📅 {todayEvents.length} spotkań dziś</div>}
          {hotLeads.length>0&&<div style={{background:"var(--accent-glow)",border:"1px solid #FF6B3535",borderRadius:10,padding:"7px 12px",fontSize:11,color:"var(--accent)",fontWeight:800,animation:"glow 2s infinite"}}>🔥 {hotLeads.length} gorących leadów</div>}
        </div>
      </div>

      {/* ── ALERT BAR ── */}
      {hotLeads.length>0&&(
        <div style={{background:"var(--accent-glow)",border:"1px solid #FF6B3528",borderRadius:10,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8,overflow:"hidden"}}>
          <span style={{fontSize:14,flexShrink:0}}>🔥</span>
          <span style={{fontWeight:800,color:"var(--accent)",fontSize:12,flexShrink:0}}>Pilny kontakt:</span>
          <span style={{color:"var(--text-sec)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{hotLeads.slice(0,3).map(l=>l.name.split(" ")[0]).join(", ")}{hotLeads.length>3?` +${hotLeads.length-3}`:""}</span>
          <span style={{color:"var(--accent)",fontSize:10,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{"<"}60 min!</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="kpi-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
        <KPI label="Łączne leady" value={tL} accent="var(--accent)" icon="👤" trend={+22} sub="vs. luty"/>
        <KPI label="Budżet wydany" value={fmt(tS)+" zł"} accent="#F7C59F" icon="💰" trend={+18}/>
        <KPI label="Przychód agencji" value={fmt(tR)+" zł"} accent="var(--success)" icon="📈" trend={+31}/>
        <KPI label="Śr. CPL" value={avgCPL+" zł"} accent="#A78BFA" icon="⚡" trend={-8} sub="malejący ✓"/>
        <KPI label="Rozmowy" value={tC} accent="#34D399" icon="📞" trend={+14}/>
      </div>

      {/* Charts row */}
      <div className="chart-grid-2" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        {/* Area chart leady */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13}}>Leady · ostatnie 7 dni</div>
            <div style={{display:"flex",gap:10}}>
              {[["leady","var(--accent)"],["CPL","var(--success)"]].map(([l,c])=><span key={l} style={{fontSize:10,color:c,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}></span>{l}</span>)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)"/>
              <XAxis dataKey="day" tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:10,color:"var(--text-primary)",fontSize:12}}/>
              <Area type="monotone" dataKey="leads" stroke="var(--accent)" strokeWidth={2} fill="url(#lG)" dot={{fill:"var(--accent)",r:3}}/>
              <Area type="monotone" dataKey="cpl" stroke="var(--success)" strokeWidth={2} fill="url(#cG)" dot={{fill:"var(--success)",r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly bar */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:16}}>Trend miesięczny</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)"/>
              <XAxis dataKey="m" tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:10,color:"var(--text-primary)",fontSize:12}}/>
              <Bar dataKey="leads" fill="var(--accent)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: ranking + hot leads + upcoming */}
      <div className="bottom-grid-3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:14}}>
        {/* Client ranking */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}><span style={{fontWeight:700,color:"var(--text-primary)",fontSize:12}}>Ranking klientów</span></div>
          {ranked.map((c,i)=>(
            <div key={c.id} className="hr" onClick={()=>onOpen(c.id)} style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",gap:10}}>
              <span style={{color:"var(--text-muted)",fontWeight:900,fontSize:11,fontFamily:"'DM Mono',monospace",width:16}}>#{i+1}</span>
              <div style={{width:26,height:26,background:c.color+"15",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:10,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div></div>
              <span style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontSize:12,fontWeight:700}}>{c.stats.leads}</span>
            </div>
          ))}
        </div>

        {/* Hot leads */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,color:"var(--text-primary)",fontSize:12}}>🔥 Gorące leady</span>
            <span style={{color:"var(--text-muted)",fontSize:10}}>ostatnie 2h</span>
          </div>
          {hotLeads.length===0?<div style={{padding:"30px 16px",textAlign:"center",color:"var(--text-muted)",fontSize:12}}>Brak gorących leadów</div>:
          hotLeads.map(l=>(
            <div key={l.id} className="hot-row" style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:"1px solid var(--border)",gap:9}}>
              <div style={{width:24,height:24,background:"var(--accent-glow)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",fontWeight:900,fontSize:9,flexShrink:0}}>{l.name.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div><div style={{color:"var(--text-muted)",fontSize:10}}>{l.cname}</div></div>
              <HotTimer m={l.hot}/>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}><span style={{fontWeight:700,color:"var(--text-primary)",fontSize:12}}>📅 Najbliższe spotkania</span></div>
          {upcomingEvents.map(ev=>{
            const cl=clients.find(c=>c.id===ev.clientId);
            return (
              <div key={ev.id} style={{display:"flex",padding:"10px 14px",borderBottom:"1px solid var(--border)",gap:10,alignItems:"center"}}>
                <div style={{width:3,height:32,borderRadius:2,background:evColor[ev.type]||"#555",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                  <div style={{color:"var(--text-muted)",fontSize:10,marginTop:1}}>{cl?.name} · {ev.date.slice(5)} {ev.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── MAPA POLSKI ────────────────────────────────────────────────── */
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
    {id:"dolnośląskie",label:"dolnośląskie",path:"M 95 245 L 130 235 L 155 250 L 160 280 L 145 300 L 110 305 L 90 285 Z",cx:125,cy:272},
    {id:"kujawsko-pomorskie",label:"kuj.-pom.",path:"M 175 130 L 220 120 L 245 140 L 240 170 L 200 180 L 170 165 Z",cx:207,cy:152},
    {id:"lubelskie",label:"lubelskie",path:"M 295 205 L 345 200 L 365 230 L 355 280 L 315 285 L 290 260 Z",cx:328,cy:245},
    {id:"lubuskie",label:"lubuskie",path:"M 60 165 L 100 155 L 115 185 L 100 215 L 68 210 Z",cx:90,cy:188},
    {id:"łódzkie",label:"łódzkie",path:"M 200 190 L 250 180 L 270 210 L 255 245 L 210 250 L 190 225 Z",cx:230,cy:220},
    {id:"małopolskie",label:"małopolskie",path:"M 215 295 L 270 285 L 300 305 L 285 340 L 245 345 L 215 325 Z",cx:257,cy:318},
    {id:"mazowieckie",label:"mazowieckie",path:"M 235 155 L 300 148 L 320 185 L 300 215 L 250 220 L 225 195 Z",cx:275,cy:185},
    {id:"opolskie",label:"opolskie",path:"M 155 258 L 195 252 L 205 278 L 185 300 L 155 295 Z",cx:182,cy:278},
    {id:"podkarpackie",label:"podkarpackie",path:"M 285 300 L 335 295 L 355 320 L 340 355 L 295 355 L 275 330 Z",cx:315,cy:328},
    {id:"podlaskie",label:"podlaskie",path:"M 310 110 L 365 105 L 380 145 L 360 170 L 315 168 Z",cx:347,cy:140},
    {id:"pomorskie",label:"pomorskie",path:"M 145 75 L 210 65 L 235 95 L 215 125 L 160 130 L 135 105 Z",cx:183,cy:98},
    {id:"śląskie",label:"śląskie",path:"M 175 270 L 220 262 L 235 290 L 220 315 L 180 318 L 165 295 Z",cx:200,cy:293},
    {id:"świętokrzyskie",label:"świętokrzyskie",path:"M 248 245 L 288 238 L 295 262 L 278 280 L 248 278 Z",cx:272,cy:261},
    {id:"warmińsko-mazurskie",label:"warm.-maz.",path:"M 250 95 L 310 88 L 330 120 L 305 150 L 248 148 Z",cx:290,cy:122},
    {id:"wielkopolskie",label:"wielkopolskie",path:"M 115 165 L 180 155 L 200 190 L 180 225 L 125 230 L 100 200 Z",cx:155,cy:193},
    {id:"zachodniopomorskie",label:"zach.-pom.",path:"M 55 105 L 130 90 L 148 125 L 135 158 L 75 160 L 48 135 Z",cx:100,cy:130},
  ];

  const sel=selected?regionClients[selected]||[]:null;

  return (
    <div style={{padding:28}} className="fu">
      <SH title="Mapa klientów" sub="Rozkład geograficzny — kliknij region po szczegóły"/>
      <div className="chart-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        {/* Map */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,padding:24,position:"relative"}}>
          <svg viewBox="40 60 340 310" style={{width:"100%",maxHeight:520}}>
            {REGIONS.map(r=>{
              const hasClients=regionClients[r.id];
              const leads=regionLeads[r.id]||0;
              const inten=intensity(r.id);
              const isHov=hovered===r.id;
              const isSel=selected===r.id;
              const fill=hasClients
                ? isSel?"var(--accent)":isHov?"rgba(255,92,26,.4)":`rgba(255,107,53,${0.08+inten*0.45})`
                : isHov?"var(--bg-subtle)":"var(--bg-raised)";
              return (
                <g key={r.id} style={{cursor:"pointer"}} onMouseEnter={()=>setHovered(r.id)} onMouseLeave={()=>setHovered(null)} onClick={()=>setSelected(selected===r.id?null:r.id)}>
                  <path d={r.path} fill={fill} stroke={isSel?"var(--accent)":isHov?"rgba(255,92,26,.4)":"#1a1a28"} strokeWidth={isSel?2:1} style={{transition:"fill .15s,stroke .15s"}}/>
                  <text x={r.cx} y={r.cy} textAnchor="middle" fontSize={7} fill={hasClients?(inten>0.5?"var(--text-primary)":"var(--text-sec)"):"var(--bg-subtle)"} fontWeight="600">{r.label}</text>
                  {leads>0&&<text x={r.cx} y={r.cy+9} textAnchor="middle" fontSize={7} fill="var(--accent)" fontWeight="900" fontFamily="JetBrains Mono">{leads}</text>}
                  {hasClients&&regionClients[r.id].map((c,i)=>(
                    <circle key={c.id} cx={r.cx+(i-regionClients[r.id].length/2+0.5)*10} cy={r.cy+18} r={4} fill={c.color} stroke="#060608" strokeWidth={1.5} opacity={.9}/>
                  ))}
                </g>
              );
            })}
            {/* Legend label */}
            <text x={55} y={360} fontSize={8} fill="var(--text-muted)">Kliknij region → szczegóły</text>
          </svg>

          {/* Hover tooltip */}
          {hovered&&(
            <div style={{position:"absolute",top:20,right:20,background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 16px",minWidth:160,pointerEvents:"none"}}>
              <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13,textTransform:"capitalize",marginBottom:6}}>{hovered}</div>
              <div style={{color:"var(--accent)",fontSize:20,fontWeight:900,fontFamily:"'DM Mono',monospace"}}>{regionLeads[hovered]||0}</div>
              <div style={{color:"var(--text-muted)",fontSize:11}}>leadów</div>
              <div style={{color:"var(--success)",fontSize:12,fontWeight:700,marginTop:4}}>{(regionClients[hovered]||[]).length} klientów</div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Region stats */}
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:18}}>
            <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:14}}>Regiony</div>
            {Object.entries(regionLeads).sort((a,b)=>b[1]-a[1]).map(([r,l])=>(
              <div key={r} className="hr" onClick={()=>setSelected(selected===r?null:r)} style={{padding:"8px 0",borderBottom:"1px solid var(--border)",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:selected===r?"var(--accent)":"#888",fontSize:12,textTransform:"capitalize"}}>{r}</div>
                  <div style={{color:"var(--text-muted)",fontSize:10}}>{(regionClients[r]||[]).length} klientów</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontSize:13,fontWeight:700}}>{l}</div>
                  <div style={{color:"var(--text-muted)",fontSize:9}}>leadów</div>
                </div>
                <div style={{width:40,height:4,background:"var(--bg-surface)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${(l/maxLeads)*100}%`,height:"100%",background:"var(--accent)",borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Selected region clients */}
          {sel&&sel.length>0&&(
            <div style={{background:"var(--bg-surface)",border:"1px solid var(--accent-b)",borderRadius:16,padding:16}}>
              <div style={{fontWeight:700,color:"var(--accent)",fontSize:12,marginBottom:12,textTransform:"capitalize"}}>{selected}</div>
              {sel.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{width:28,height:28,background:c.color+"18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:10,flexShrink:0}}>{c.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{color:"var(--text-muted)",fontSize:10}}>{c.city}</div>
                  </div>
                  <div style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontSize:12,fontWeight:700}}>{c.stats.leads}</div>
                </div>
              ))}
            </div>
          )}

          {/* Summary stats */}
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:18}}>
            <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:12}}>Podsumowanie</div>
            {[["Aktywne regiony",Object.keys(regionLeads).length,"var(--success)"],["Łączne leady",Object.values(regionLeads).reduce((a,b)=>a+b,0),"var(--accent)"],["Najlepszy region",Object.entries(regionLeads).sort((a,b)=>b[1]-a[1])[0]?.[0]||"-","#F7C59F"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{color:"var(--text-muted)",fontSize:12}}>{l}</span>
                <span style={{fontFamily:"'DM Mono',monospace",color:c,fontSize:12,fontWeight:700,textTransform:"capitalize"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── KALENDARZ ──────────────────────────────────────────────────── */
function AdminCalendar({clients,events,setEvents}) {
  const [view,setView]=useState("month");
  const [currentDate,setCurrentDate]=useState(new Date());
  const [showAdd,setShowAdd]=useState(false);
  const [newEv,setNewEv]=useState({clientId:"",title:"",date:"",time:"09:00",type:"call",duration:30});

  const year=currentDate.getFullYear();
  const month=currentDate.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const days=Array.from({length:42},(_,i)=>{const d=i-((firstDay+6)%7)+1;return d>0&&d<=daysInMonth?d:null;});
  const monthStr=`${year}-${String(month+1).padStart(2,"0")}`;
  const evColor={call:"var(--accent)",meeting:"var(--success)",onboarding:"#A78BFA",report:"#F7C59F"};
  const evIcon={call:"📞",meeting:"🤝",onboarding:"🚀",report:"📊"};

  const addEvent=()=>{
    if(!newEv.clientId||!newEv.title||!newEv.date)return;
    setEvents(prev=>[...prev,{...newEv,id:"e"+Date.now()}]);
    setShowAdd(false);
    setNewEv({clientId:"",title:"",date:"",time:"09:00",type:"call",duration:30});
  };

  return (
    <div style={{padding:28}} className="fu">
      <SH title="Kalendarz" sub="Umówione konsultacje i spotkania z klientami" btn="+ Dodaj spotkanie" onBtn={()=>setShowAdd(true)}/>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>←</button>
        <span style={{fontWeight:800,color:"var(--text-primary)",fontSize:16,minWidth:140,textAlign:"center"}}>{currentDate.toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>→</button>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {["month","list"].map(v=><button key={v} onClick={()=>setView(v)} style={{background:view===v?"var(--bg-overlay)":"transparent",border:`1px solid ${view===v?"var(--border-hi)":"var(--border)"}`,color:view===v?"var(--text-primary)":"var(--text-muted)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:view===v?700:400}}>{v==="month"?"Miesiąc":"Lista"}</button>)}
        </div>
      </div>

      {view==="month"&&(
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid var(--border)"}} className="cal-header">
            {["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].map(d=><div key={d} className="cal-day-header" style={{padding:"8px 4px",textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text-muted)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}} className="cal-cells">
            {days.map((d,i)=>{
              const dateStr=d?`${monthStr}-${String(d).padStart(2,"0")}`:null;
              const dayEvents=dateStr?events.filter(e=>e.date===dateStr):[];
              const todayStr=new Date().toLocaleDateString("sv-SE");const isToday=dateStr===todayStr;
              return (
                <div key={i} className="cal-cell" style={{borderBottom:"1px solid var(--border)",borderRight:i%7<6?"1px solid var(--border)":"none",minHeight:90,padding:6,background:isToday?"var(--accent-glow)":"transparent"}}>
                  {d&&<div style={{fontWeight:isToday?900:400,color:isToday?"var(--accent)":d?"#888":"var(--bg-subtle)",fontSize:12,marginBottom:4,width:22,height:22,background:isToday?"var(--accent)":"none",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{d}</div>}
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
              <div key={ev.id} style={{background:"var(--bg-surface)",border:`1px solid ${evColor[ev.type]}25`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:40,height:40,background:evColor[ev.type]+"18",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{evIcon[ev.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14}}>{ev.title}</div>
                  <div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}><span style={{color:cl?.color||"#666",fontWeight:700}}>{cl?.name||"—"}</span> · {ev.date} o {ev.time} · {ev.duration} min</div>
                </div>
                <span style={{background:evColor[ev.type]+"18",color:evColor[ev.type],border:`1px solid ${evColor[ev.type]}30`,borderRadius:8,padding:"4px 12px",fontSize:10,fontWeight:800,textTransform:"uppercase"}}>{ev.type}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add event modal */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)",overflowY:"auto"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:20,width:"100%",maxWidth:420,padding:28,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:18,marginBottom:20}}>Nowe spotkanie</div>
            {[
              ["Klient","select",["clientId",[["","— wybierz —"],...clients.map(c=>[c.id,c.name])]]],
              ["Tytuł","text",["title"]],
              ["Data","date",["date"]],
              ["Godzina","time",["time"]],
              ["Czas (min)","number",["duration"]],
            ].map(([l,t,[k,opts]])=>(
              <div key={k} style={{marginBottom:14}}>
                <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{l}</div>
                {t==="select"?
                  <select value={newEv[k]} onChange={e=>setNewEv(p=>({...p,[k]:e.target.value}))} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",color:"var(--text-sec)",fontSize:13,outline:"none"}}>
                    {opts.map(([v,label])=><option key={v} value={v}>{label}</option>)}
                  </select>:
                  <input type={t} value={newEv[k]} onChange={e=>setNewEv(p=>({...p,[k]:e.target.value}))} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/>
                }
              </div>
            ))}
            <div style={{marginBottom:18}}>
              <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Typ</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {Object.entries(evColor).map(([t,c])=>(
                  <button key={t} onClick={()=>setNewEv(p=>({...p,type:t}))} style={{background:newEv.type===t?c+"20":"var(--bg-base)",border:`1px solid ${newEv.type===t?c+"50":"var(--border)"}`,color:newEv.type===t?c:"var(--text-muted)",borderRadius:9,padding:"8px 0",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                    {evIcon[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"var(--bg-overlay)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:10,padding:"11px 0",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Anuluj</button>
              <button onClick={addEvent} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"11px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Dodaj spotkanie →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CLIENTS ────────────────────────────────────────────────────── */
function AdminClients({clients,onOpen}) {
  const [search,setSearch]=useState("");
  const filtered=clients.filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.city.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Baza klientów" sub={`${clients.length} klientów · ${clients.filter(c=>c.plan_key==="pro").length} Pro`} btn="+ Dodaj klienta" onBtn={()=>showToast("👤 Dodawanie klienta — wkrótce")}/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj po nazwie, mieście..." style={{width:"100%",maxWidth:340,background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"9px 14px",color:"var(--text-sec)",fontSize:13,outline:"none",marginBottom:18}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
        {filtered.map(c=>(
          <div key={c.id} className="hc" onClick={()=>onOpen(c.id)} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,padding:20,cursor:"pointer",transition:"all .12s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:46,height:46,background:c.color+"15",border:`1px solid ${c.color}25`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:18,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{color:"var(--text-muted)",fontSize:11,marginTop:1}}>{c.city} · {c.email}</div>
              </div>
              <span style={{background:c.plan_key==="pro"?"var(--accent-glow)":"var(--bg-overlay)",color:c.plan_key==="pro"?"var(--accent)":"var(--text-muted)",border:`1px solid ${c.plan_key==="pro"?"var(--accent-b)":"var(--border)"}`,borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:800,flexShrink:0}}>{c.plan_key==="pro"?"PRO":"FREE"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[["Leady",c.stats.leads,"var(--accent)"],["CPL",c.stats.cpl+" zł","var(--success)"],["Przychód",fmt(c.stats.revenue)+" zł","#F7C59F"]].map(([l,v,col])=>(
                <div key={l} style={{background:"var(--bg-base)",borderRadius:9,padding:"8px 10px"}}>
                  <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:"'DM Mono',monospace"}}>{v}</div>
                  <div style={{fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid var(--border)",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"var(--text-muted)",fontSize:10}}>Od {c.since} · {c.planPrice} zł/mies</span>
              <span style={{color:{active:"var(--success)",trial:"#F7C59F",inactive:"#444"}[c.status]||"#444",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CAMPAIGNS ──────────────────────────────────────────────────── */
function AdminCampaigns({clients}) {
  const all=clients.flatMap(c=>c.campaigns.map(cp=>({...cp,cName:c.name,cColor:c.color})));
  const active=all.filter(c=>c.status==="active");
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Kampanie" sub={`${active.length} aktywnych · ${all.length} łącznie`} btn="+ Nowa kampania" onBtn={()=>showToast("▶ Nowa kampania — wkrótce")}/>
      <div className="kpi-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <KPI label="Aktywne" value={active.length} accent="var(--success)" icon="▶"/>
        <KPI label="Łączne leady" value={all.reduce((s,c)=>s+c.leads,0)} accent="var(--accent)" icon="👤"/>
        <KPI label="Łączny spend" value={fmt(all.reduce((s,c)=>s+c.spend,0))+" zł"} accent="#F7C59F" icon="💰"/>
        <KPI label="Śr. CPL" value={(all.reduce((s,c)=>s+c.cpl,0)/all.length).toFixed(1)+" zł"} accent="#A78BFA" icon="⚡"/>
      </div>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 70px 80px 90px",gap:0,padding:"10px 18px",borderBottom:"1px solid var(--border)",minWidth:600}}>
          {["Kampania","Status","Leady","CPL","Spend","Klient"].map(h=><span key={h} style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</span>)}
        </div>
        {all.map((c,i)=>(
          <div key={c.id} className="hr" style={{display:"grid",gridTemplateColumns:"2fr 1fr 80px 70px 80px 90px",gap:0,padding:"13px 18px",borderBottom:i<all.length-1?"1px solid var(--border)":"none",alignItems:"center",cursor:"pointer",minWidth:600}}>
            <div><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{c.name}</div><div style={{color:"var(--text-muted)",fontSize:10,marginTop:1}}>{c.creative} · od {c.start}</div></div>
            <span style={{background:c.status==="active"?"#4ECDC418":"#1a1a2a",color:c.status==="active"?"var(--success)":"var(--text-muted)",border:`1px solid ${c.status==="active"?"var(--success-b)":"var(--border)"}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,width:"fit-content"}}>{c.status==="active"?"● Aktywna":"⏸ Wstrzymana"}</span>
            <span style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontWeight:700}}>{c.leads}</span>
            <span style={{fontFamily:"'DM Mono',monospace",color:"var(--success)",fontWeight:700}}>{c.cpl} zł</span>
            <span style={{fontFamily:"'DM Mono',monospace",color:"#F7C59F",fontWeight:700}}>{fmt(c.spend)} zł</span>
            <span style={{color:c.cColor,fontSize:11,fontWeight:700}}>{c.cName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LEADS ALL ──────────────────────────────────────────────────── */
function AdminLeadsAll({clients}) {
  const all=clients.flatMap(c=>c.leads.map(l=>({...l,cName:c.name,cColor:c.color})));
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all"); const [expanded,setExpanded]=useState(null);
  const filtered=all.filter(l=>(filter==="all"||l.status===filter)&&(!search||l.name.toLowerCase().includes(search.toLowerCase())||l.phone.includes(search)||(l.campaign||"").toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Wszystkie leady" sub={`${all.length} łącznie · ${all.filter(l=>l.hot<=120).length} gorących`}/>

      {/* Statystyki */}
      <div className="kpi-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[["Wszystkie",all.length,"var(--accent)","👥"],["Nowe",all.filter(l=>l.status==="new").length,"var(--success)","🆕"],["Gorące",all.filter(l=>l.hot<=60).length,"var(--accent)","🔥"],["Wygranie",all.filter(l=>l.status==="closed_won").length,"var(--success)","✅"]].map(([l,v,c,ic])=>(
          <div key={l} style={{background:"var(--bg-surface)",border:`1px solid ${c}22`,borderRadius:12,padding:"12px 16px",cursor:"pointer"}} onClick={()=>setFilter(l==="Wszystkie"?"all":l==="Nowe"?"new":l==="Gorące"?"new":l==="Wygranie"?"closed_won":"all")}>
            <div style={{fontSize:18,marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtry */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Szukaj po nazwie, telefonie, kampanii..." style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 13px",color:"var(--text-sec)",fontSize:13,outline:"none",flex:"1 1 240px",minWidth:180}}/>
        <div className="tabs-scroll" style={{display:"flex",gap:4,background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:3}}>
          {["all","new","contacted","qualified","closed_won","closed_lost"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{background:filter===s?"var(--bg-overlay)":"none",border:"none",color:filter===s?"var(--text-primary)":"var(--text-muted)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:filter===s?700:400,whiteSpace:"nowrap"}}>{s==="all"?"Wszystkie":LEAD_S[s]?.[0]||s}</button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.length===0&&<div style={{textAlign:"center",color:"var(--text-muted)",padding:"40px 0",fontSize:13}}>Brak leadów spełniających kryteria</div>}
        {filtered.map(l=>(
          <div key={l.id} style={{background:"var(--bg-surface)",border:`1px solid ${l.hot<=60?"var(--accent-b)":"#151520"}`,borderRadius:14,overflow:"hidden",transition:"border-color .15s"}}>
            {/* Główny wiersz */}
            <div className="hr leads-row" onClick={()=>setExpanded(expanded===l.id?null:l.id)} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <div style={{width:36,height:36,background:l.hot<=60?"var(--accent-glow)":"var(--bg-subtle)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:l.hot<=60?"var(--accent)":"var(--text-muted)",fontWeight:900,fontSize:14,flexShrink:0}}>{l.name.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13}}>{l.name}</div>
                <div style={{color:"var(--text-muted)",fontSize:11,marginTop:2,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'DM Mono',monospace"}}>{l.phone}</span>
                  {l.campaign&&<><span style={{color:"var(--border-hi)"}}>·</span><span style={{color:"var(--text-sec)"}}>{l.campaign}</span></>}
                  {l.adSet&&<><span style={{color:"var(--border-hi)"}}>·</span><span style={{color:"var(--text-muted)",fontSize:10}}>{l.adSet}</span></>}
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
                <HotTimer m={l.hot}/>
                <span style={{color:l.cColor,background:l.cColor+"15",border:`1px solid ${l.cColor}25`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{l.cName}</span>
                <LBadge s={l.status}/>
                <a href={`tel:${l.phone.replace(/\s/g,"")}`} onClick={e=>e.stopPropagation()} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>📞</a>
                <a href={`https://wa.me/48${l.phone.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",color:"#25D366",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>💬</a>
                <span style={{color:"var(--text-muted)",fontSize:10,marginLeft:2}}>{expanded===l.id?"▲":"▼"}</span>
              </div>
            </div>
            {/* Rozwinięte: odpowiedzi z formularza */}
            {expanded===l.id&&l.answers&&(
              <div style={{padding:"12px 16px 16px",borderTop:"1px solid var(--border)",background:"var(--bg-base)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Odpowiedzi z formularza</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}} className="lead-detail-grid">
                  {[["🎯 Cel",l.answers.cel],["⏰ Start",l.answers.start],["💰 Budżet",l.answers.budzet]].map(([label,val])=>val&&(
                    <div key={label} style={{background:"var(--bg-surface)",borderRadius:10,padding:"10px 12px",border:"1px solid var(--border)"}}>
                      <div style={{fontSize:10,color:"var(--text-muted)",marginBottom:4}}>{label}</div>
                      <div style={{fontSize:13,color:"var(--text-sec)",fontWeight:600}}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href={`tel:${l.phone.replace(/\s/g,"")}`} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>📞 Zadzwoń teraz</a>
                  <a href={`https://wa.me/48${l.phone.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",color:"#25D366",borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>💬 WhatsApp</a>
                  <div style={{fontSize:11,color:"var(--text-muted)",padding:"8px 0",display:"flex",alignItems:"center",gap:4}}>📅 {l.date}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── REPORTS ────────────────────────────────────────────────────── */
function AdminReports({clients}) {
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Raporty" sub="Import CSV · auto-generowanie per klient" btn="+ Import Meta CSV" onBtn={()=>showToast("📊 Import CSV — wkrótce")}/>
      <div style={{background:"var(--bg-surface)",border:"2px dashed var(--border-hi)",borderRadius:16,padding:24,textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:34,marginBottom:10}}>📊</div>
        <div style={{fontWeight:700,color:"var(--text-sec)",marginBottom:6,fontSize:14}}>Przeciągnij i upuść plik CSV z Meta Ads</div>
        <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:14}}>Lub kliknij aby wybrać — automatycznie przypisujemy dane do klientów</div>
        <button onClick={()=>showToast("📊 Import CSV z Meta Ads — wkrótce dostępny")} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"9px 20px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+ Importuj CSV</button>
      </div>
      {clients.filter(c=>c.monthLeads.length>0).map(c=>{
        const mData=c.monthLeads.map((l,i)=>({m:["Sty","Lut","Mar"][i],leads:l,spend:c.monthSpend[i]||0}));
        return (
          <div key={c.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{width:34,height:34,background:c.color+"15",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:13,flexShrink:0}}>{c.avatar}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14}}>{c.name}</div><div style={{color:"var(--text-muted)",fontSize:11}}>Plan {c.plan} · {fmt(c.stats.spend)} zł wydano łącznie</div></div>
              <button onClick={()=>{
                try{
                  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
                  // Background
                  doc.setFillColor(6,6,8); doc.rect(0,0,210,297,"F");
                  // Header bar
                  doc.setFillColor(255,107,53); doc.rect(0,0,210,18,"F");
                  doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont("helvetica","bold");
                  doc.text("HARDGAIN PANEL — Raport Miesięczny",14,12);
                  doc.text(new Date().toLocaleDateString("pl-PL",{month:"long",year:"numeric"}),196,12,"right");
                  // Client section
                  doc.setFontSize(18); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
                  doc.text(c.name,14,34);
                  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(100,100,128);
                  doc.text(`Plan ${c.plan} · ${c.city} · ${c.email}`,14,41);
                  // Divider
                  doc.setDrawColor(42,42,62); doc.setLineWidth(0.3); doc.line(14,46,196,46);
                  // KPI boxes
                  const kpis=[["Leady",c.stats.leads,"var(--accent)"],["CPL",c.stats.cpl+" zł","var(--success)"],["Wydano",c.stats.spend+" zł","#F7C59F"],["Konwersja",c.stats.conversion+"%","#A78BFA"]];
                  kpis.forEach(([label,value,color],i)=>{
                    const x=14+i*47; const y=52;
                    const rgb=color==="white"?[255,255,255]:color==="gray"?[100,100,128]:[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)];
                    doc.setFillColor(13,13,26); doc.roundedRect(x,y,43,22,2,2,"F");
                    doc.setTextColor(...rgb); doc.setFontSize(14); doc.setFont("helvetica","bold");
                    doc.text(String(value),x+4,y+12);
                    doc.setTextColor(80,80,100); doc.setFontSize(7); doc.setFont("helvetica","normal");
                    doc.text(label.toUpperCase(),x+4,y+19);
                  });
                  // Campaigns
                  doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont("helvetica","bold");
                  doc.text("Kampanie",14,86);
                  let y=93;
                  c.campaigns.forEach(cp=>{
                    doc.setFillColor(13,13,26); doc.roundedRect(14,y,182,14,2,2,"F");
                    doc.setTextColor(200,200,210); doc.setFontSize(9); doc.setFont("helvetica","bold");
                    doc.text(cp.name,18,y+6);
                    doc.setTextColor(80,80,100); doc.setFontSize(8); doc.setFont("helvetica","normal");
                    doc.text(`Leady: ${cp.leads} · CPL: ${cp.cpl} zł · Wydano: ${cp.spend} zł`,18,y+11);
                    y+=17;
                  });
                  // Leads table
                  y+=6; doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont("helvetica","bold");
                  doc.text("Ostatnie leady",14,y); y+=7;
                  c.leads.slice(0,5).forEach((l,i)=>{
                    doc.setFillColor(i%2===0?13:10,i%2===0?13:10,i%2===0?26:20);
                    doc.rect(14,y,182,9,"F");
                    doc.setTextColor(200,200,210); doc.setFontSize(8); doc.setFont("helvetica","normal");
                    doc.text(l.name,18,y+6);
                    doc.text(l.phone,80,y+6);
                    doc.text(l.campaign||"",120,y+6);
                    doc.text(l.date,172,y+6);
                    y+=9;
                  });
                  // Footer
                  doc.setFillColor(13,13,20); doc.rect(0,282,210,15,"F");
                  doc.setTextColor(60,60,80); doc.setFontSize(7); doc.setFont("helvetica","normal");
                  doc.text("Hardgain Panel · hardgain.pl · Wygenerowano automatycznie",105,290,"center");
                  doc.save(`raport_${c.name.replace(/\s/g,"_")}_${new Date().toISOString().slice(0,7)}.pdf`);
                  showToast("✅ PDF wygenerowany i pobrany!");
                }catch(e){showToast("❌ Błąd generowania PDF: "+e.message);}
              }} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>PDF ↓</button>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={mData} barSize={16}>
                <XAxis dataKey="m" tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text-primary)",fontSize:11}}/>
                <Bar dataKey="leads" fill={c.color} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

/* ─── CHAT ───────────────────────────────────────────────────────── */
function AdminChat({clients,setClients}) {
  const [active,setActive]=useState(clients[0]?.id); const [msg,setMsg]=useState(""); const br=useRef(null);
  const cl=clients.find(c=>c.id===active);
  useEffect(()=>{br.current?.scrollIntoView({behavior:"smooth"});},[cl?.messages]);
  const send=()=>{
    if(!msg.trim())return;
    const m={from:"admin",text:msg,time:new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})};
    setClients(prev=>prev.map(c=>c.id===active?{...c,messages:[...c.messages,m]}:c));
    setMsg("");
  };
  return (
    <div className="chat-layout fu" style={{display:"flex",height:"calc(100vh - 60px)",maxHeight:"calc(100vh - 60px)"}}>
      <div className="chat-sidebar" style={{width:220,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",background:"var(--bg-base)",overflowY:"auto",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid var(--border)"}}><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13}}>Wiadomości</div></div>
        {clients.map(c=>(
          <div key={c.id} onClick={()=>setActive(c.id)} style={{padding:"10px 13px",borderBottom:"1px solid var(--border)",cursor:"pointer",background:active===c.id?"var(--bg-raised)":"transparent",display:"flex",alignItems:"center",gap:9,transition:"background .1s"}}>
            <div style={{width:30,height:30,background:c.color+"15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:11,flexShrink:0}}>{c.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:active===c.id?"var(--text-primary)":"var(--text-sec)",fontSize:12}}>{c.name}</div>
              <div style={{color:"var(--text-muted)",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.messages[c.messages.length-1]?.text||"—"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-main" style={{flex:1,display:"flex",flexDirection:"column",background:"var(--bg-base)",minWidth:0}}>
        {cl&&<>
          <div className="chat-client-header" style={{padding:"13px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:9,background:"var(--bg-base)"}}>
            <div style={{width:28,height:28,background:cl.color+"15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:cl.color,fontSize:11,flexShrink:0}}>{cl.avatar}</div>
            <span style={{fontWeight:800,color:"var(--text-primary)",fontSize:13}}>{cl.name}</span>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"16px 18px 8px"}}>
            {clients.find(c=>c.id===active)?.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="admin"?"flex-end":"flex-start",marginBottom:9}}>
                <div style={{maxWidth:"68%",background:m.from==="admin"?`linear-gradient(135deg,${TENANT.primary},#c43a00)`:"var(--bg-raised)",borderRadius:m.from==="admin"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px",boxShadow:m.from==="admin"?`0 4px 14px ${TENANT.primary}25`:"none"}}>
                  <div style={{color:"var(--text-primary)",fontSize:13}}>{m.text}</div>
                  <div style={{color:m.from==="admin"?"rgba(255,255,255,.4)":"var(--text-muted)",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={br}/>
          </div>
          <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)",display:"flex",gap:8,background:"var(--bg-base)"}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Napisz wiadomość..." style={{flex:1,background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/>
            <button onClick={send} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"9px 16px",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>↑</button>
          </div>
        </>}
      </div>
    </div>
  );
}

/* ─── TICKETS ────────────────────────────────────────────────────── */
function AdminTickets({clients,setClients}) {
  const all=clients.flatMap(c=>{const cl=clients.find(x=>x.id===c.id);return c.tickets.map(t=>({...t,cName:c.name,cColor:c.color,cId:c.id,cPhone:c.phone}));});
  const pc={high:"var(--accent)",medium:"#F7C59F",low:"var(--text-muted)"};
  const resolve=(cid,tid)=>setClients(prev=>prev.map(c=>c.id===cid?{...c,tickets:c.tickets.map(t=>t.id===tid?{...t,status:"resolved"}:t)}:c));
  const openCount=all.filter(t=>t.status==="open").length;
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Zgłoszenia" sub={`${openCount} otwartych · ${all.length} łącznie`}/>

      {/* Szybki kontakt - zawsze widoczny */}
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:"16px 20px",marginBottom:20}}>
        <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13,marginBottom:4}}>⚡ Szybki kontakt z klientem</div>
        <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:14}}>Nie czekaj na odpowiedź — zadzwoń lub napisz od razu</div>
        <div className="quick-contact" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {clients.slice(0,4).map(c=>(
            <div key={c.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:12,padding:"10px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <div style={{width:22,height:22,background:c.color+"20",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:9,flexShrink:0}}>{c.avatar}</div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--text-sec)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
              </div>
              <div style={{display:"flex",gap:4}}>
                <a href={`tel:${c.phone.replace(/\s/g,"")}`} style={{flex:1,background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:7,padding:"5px 0",fontSize:10,fontWeight:700,textDecoration:"none",textAlign:"center"}}>📞</a>
                <a href={`https://wa.me/48${c.phone.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,background:"rgba(37,211,102,.08)",border:"1px solid #25D36625",color:"#25D366",borderRadius:7,padding:"5px 0",fontSize:10,fontWeight:700,textDecoration:"none",textAlign:"center"}}>💬</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {all.length===0?(
        <div style={{textAlign:"center",padding:"50px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>🎉</div>
          <div style={{color:"var(--success)",fontWeight:800,fontSize:16}}>Brak otwartych zgłoszeń</div>
          <div style={{color:"var(--text-muted)",fontSize:12,marginTop:6}}>Świetna robota — wszystko pod kontrolą</div>
        </div>
      ):
      all.map(t=>(
        <div key={t.id} className="ticket-row" style={{background:"var(--bg-surface)",border:`1px solid ${t.status==="open"?"var(--accent-glow)":"#111120"}`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:t.status==="resolved"?.45:1,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{t.title}</div>
            <div style={{color:"var(--text-muted)",fontSize:11,marginTop:2,display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{color:t.cColor}}>{t.cName}</span>
              <span>·</span><span>{t.date}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{background:pc[t.priority]+"18",color:pc[t.priority],border:`1px solid ${pc[t.priority]}30`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{t.priority}</span>
            <span style={{background:t.status==="open"?"var(--accent-glow)":"#4ECDC418",color:t.status==="open"?"var(--accent)":"var(--success)",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{t.status==="open"?"● Otwarte":"✓ Rozwiązane"}</span>
            {t.status==="open"&&<>
              <a href={`tel:${t.cPhone?.replace(/\s/g,"")}`} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:7,padding:"5px 9px",fontSize:11,fontWeight:700,textDecoration:"none"}}>📞</a>
              <a href={`https://wa.me/48${t.cPhone?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer" style={{background:"rgba(37,211,102,.08)",border:"1px solid #25D36625",color:"#25D366",borderRadius:7,padding:"5px 9px",fontSize:11,fontWeight:700,textDecoration:"none"}}>💬 WA</a>
              <button onClick={()=>resolve(t.cId,t.id)} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>✓ Rozwiąż</button>
            </>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── WIKI ───────────────────────────────────────────────────────── */
const WIKI=[{id:"w1",title:"Kwalifikacja leada w 60 sekund",cat:"Sprzedaż",body:"3 pytania: 1) Jaki masz cel? 2) Kiedy chcesz zacząć? 3) Jaki budżet? Oceń gorący/zimny. Gorący = callback < 60 min."},{id:"w2",title:"Onboarding nowego klienta",cat:"Procesy",body:"Krok 1: Wywiad Zoom 30 min. Krok 2: Kreacje 7 dni. Krok 3: Setup kampanii. Krok 4: Monitoring 48h. Krok 5: Raport po 2 tygodniach."},{id:"w3",title:"Optymalizacja kampanii — kiedy i jak",cat:"Kampanie",body:"Nigdy nie ruszaj przed 48h. Optymalizuj gdy: CPL > 2x target, CTR < 1%, Frequency > 3."},{id:"w4",title:"SOP — miesięczny raport",cat:"Procesy",body:"Do 3. dnia miesiąca: dane z Meta + template + wyślij. Zawsze 3 rekomendacje."},{id:"w5",title:"Komunikacja z trudnym klientem",cat:"Komunikacja",body:"Zasada LEAP: Listen, Empathize, Acknowledge, Problem-solve. Nigdy nie obiecuj wyników. Zawsze dane."}];
function AdminWiki() {
  const [sel,setSel]=useState(null); const [s,setS]=useState("");
  const filtered=WIKI.filter(a=>!s||a.title.toLowerCase().includes(s.toLowerCase()));
  const cats=[...new Set(WIKI.map(a=>a.cat))];
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Hardgain Wiki" sub="Wewnętrzna baza wiedzy" btn="+ Nowy artykuł" onBtn={()=>showToast("📝 Tworzenie artykułu — wkrótce")}/>
      <div style={{display:"flex",gap:20}}>
        <div style={{flex:1}}>
          <input value={s} onChange={e=>setS(e.target.value)} placeholder="Szukaj w wiki..." style={{width:"100%",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"9px 14px",color:"var(--text-sec)",fontSize:13,outline:"none",marginBottom:16}}/>
          {cats.map(cat=>{const arts=filtered.filter(a=>a.cat===cat);if(!arts.length)return null;return (
            <div key={cat} style={{marginBottom:18}}>
              <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{cat}</div>
              {arts.map(a=><div key={a.id} className="hr" onClick={()=>setSel(a)} style={{background:sel?.id===a.id?"#111120":"linear-gradient(135deg,#0d0d18,#0a0a12)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:"pointer",transition:"background .1s"}}><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{a.title}</div></div>)}
            </div>
          );})}
        </div>
        {sel&&<div style={{width:360,background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:22,height:"fit-content"}}>
          <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{sel.cat}</div>
          <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:16,marginBottom:14}}>{sel.title}</div>
          <div style={{color:"var(--text-muted)",fontSize:13,lineHeight:1.8}}>{sel.body}</div>
        </div>}
      </div>
    </div>
  );
}

/* ─── INVOICES ───────────────────────────────────────────────────── */
function AdminInvoices({clients}) {
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Faktury" sub="Dane do fakturowania per klient · auto-generowanie" btn="+ Generuj fakturę" onBtn={()=>showToast("🧾 Generowanie faktury — wkrótce")}/>
      {clients.map(c=>(
        <div key={c.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:38,height:38,background:c.color+"15",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c.color,fontSize:15,flexShrink:0}}>{c.avatar}</div>
            <div style={{flex:1}}><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:15}}>{c.name}</div><div style={{color:"var(--text-muted)",fontSize:11}}>Plan {c.plan} · {fmt(c.planPrice)} zł/mies</div></div>
            <button onClick={()=>showToast("🧾 Generowanie faktury — wkrótce dostępne")} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:9,padding:"7px 14px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Generuj FV →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,borderTop:"1px solid var(--border)",paddingTop:14}}>
            {[["NIP",c.nip],["Email",c.email],["Adres",c.address]].map(([l,v])=>(
              <div key={l}><div style={{color:"#555577",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{color:"var(--text-muted)",fontSize:11,wordBreak:"break-all"}}>{v}</div></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SETTINGS ───────────────────────────────────────────────────── */
function AdminSettings() {
  const [tab,setTab]=useState("brand");
  const [brand,setBrand]=useState({name:TENANT.name,primary:"var(--accent)",accent:"var(--success)",logo:"H"});
  const [team]=useState([{id:1,name:"Jan",email:"jan@hardgain.pl",role:"Admin",avatar:"J"},{id:2,name:"Anna",email:"anna@hardgain.pl",role:"Manager",avatar:"A"}]);
  const [intg]=useState([{name:"Make.com",desc:"Webhook → leady z Meta Ads",status:"active",icon:"⚡"},{name:"Stripe",desc:"Płatności i subskrypcje",status:"inactive",icon:"💳"},{name:"Google Calendar",desc:"Sync kalendarza spotkań",status:"inactive",icon:"📅"},{name:"Resend",desc:"Powiadomienia email",status:"inactive",icon:"✉️"},{name:"PostHog",desc:"Analityka zachowań",status:"inactive",icon:"📊"},{name:"SMS API",desc:"Powiadomienia o leadach",status:"inactive",icon:"💬"}]);
  return (
    <div style={{padding:28}} className="fu">
      <SH title="Ustawienia" sub="Konfiguracja platformy · integracje · team"/>
      <Tabs tabs={[["brand","Branding","🎨"],["team","Zespół","👥"],["integrations","Integracje","⚡"],["plans","Plany","💵"],["api","API","⌨"]]} active={tab} onSelect={setTab}/>
      {tab==="brand"&&(
        <div style={{maxWidth:520}}>
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14,marginBottom:18}}>Branding aplikacji</div>
            {[["Nazwa firmy","text","name"],["Kolor główny","color","primary"],["Kolor akcentu","color","accent"]].map(([l,t,k])=>(
              <div key={k} style={{marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <label style={{color:"var(--text-muted)",fontSize:12,fontWeight:600,minWidth:130}}>{l}</label>
                <input type={t} value={brand[k]} onChange={e=>setBrand(p=>({...p,[k]:e.target.value}))} style={{flex:1,background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:9,padding:"9px 12px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
            <div style={{fontWeight:700,color:"var(--text-muted)",fontSize:12,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>Podgląd logo</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,background:`linear-gradient(135deg,${brand.primary},${brand.accent})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"var(--text-primary)"}}>{brand.logo}</div>
              <div><div style={{fontSize:14,fontWeight:800,color:"var(--text-primary)"}}>{brand.name} Panel</div><div style={{fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Agency Portal</div></div>
            </div>
          </div>
          <button onClick={()=>showToast("✅ Zmiany zapisane")} style={{marginTop:16,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"11px 22px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Zapisz zmiany →</button>

          {/* Powiadomienia */}
          <div style={{marginTop:28,paddingTop:22,borderTop:"1px solid var(--border)"}}>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13,marginBottom:16}}>🔔 Powiadomienia</div>
            {[["Nowy lead — SMS","Otrzymaj SMS gdy wpada nowy lead","sms",true],["Nowy lead — email","Kopia każdego leada na email","email",true],["Gorący lead alert","Gdy lead nie był kontaktowany >30 min","hot",false],["Raport tygodniowy","Podsumowanie w każdy poniedziałek","weekly",true]].map(([name,desc,key,def])=>{
              const [on,setOn]=useState(def);
              return(
                <div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--text-sec)"}}>{name}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{desc}</div>
                  </div>
                  <div onClick={()=>{setOn(v=>!v);showToast(on?"🔕 Wyłączono":"🔔 Włączono");}} style={{width:40,height:22,background:on?TENANT.primary:"#1a1a2a",borderRadius:11,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,background:"#fff",borderRadius:"50%",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp / SMS numer agenta */}
          <div style={{marginTop:22,paddingTop:22,borderTop:"1px solid var(--border)"}}>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13,marginBottom:12}}>📱 Kontakt agenta (do szybkich odpowiedzi)</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <input defaultValue="+48 600 000 000" style={{flex:1,minWidth:180,background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"var(--text-sec)",fontSize:13,outline:"none"}} placeholder="Telefon agenta"/>
              <a href="https://wa.me/48600000000" target="_blank" rel="noreferrer" style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",color:"#25D366",borderRadius:10,padding:"10px 18px",fontSize:12,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>💬 Test WhatsApp</a>
            </div>
          </div>
        </div>
      )}
      {tab==="team"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:540}}>
            {team.map(m=>(
              <div key={m.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,background:"var(--accent-glow)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"var(--accent)",fontSize:13,flexShrink:0}}>{m.avatar}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{m.name}</div><div style={{color:"var(--text-muted)",fontSize:11}}>{m.email}</div></div>
                <span style={{background:"var(--accent-glow)",color:"var(--accent)",border:"1px solid var(--accent-b)",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{m.role}</span>
                <button onClick={()=>showToast("✏️ Edycja — wkrótce")} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:7,padding:"4px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Edytuj</button>
              </div>
            ))}
            <button onClick={()=>showToast("👥 Dodawanie członka zespołu — wkrótce")} style={{background:"var(--bg-surface)",border:"2px dashed var(--border-hi)",color:"var(--text-muted)",borderRadius:14,padding:"13px 0",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Dodaj członka zespołu</button>
          </div>
        </div>
      )}
      {tab==="integrations"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {intg.map(i=>(
            <div key={i.name} style={{background:"var(--bg-surface)",border:`1px solid ${i.status==="active"?"var(--success-b)":"#151520"}`,borderRadius:16,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:28}}>{i.icon}</span>
                <span style={{background:i.status==="active"?"#4ECDC418":"#1a1a2a",color:i.status==="active"?"var(--success)":"var(--text-muted)",border:`1px solid ${i.status==="active"?"var(--success-b)":"var(--border)"}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{i.status==="active"?"● Aktywna":"Nieaktywna"}</span>
              </div>
              <div style={{fontWeight:800,color:"var(--text-sec)",fontSize:14,marginBottom:4}}>{i.name}</div>
              <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:14}}>{i.desc}</div>
              <button style={{width:"100%",background:i.status==="active"?"#1a1a2a":"var(--accent-glow)",border:`1px solid ${i.status==="active"?"var(--border)":"var(--accent-b)"}`,color:i.status==="active"?"#444":"var(--accent)",borderRadius:9,padding:"7px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{i.status==="active"?"Konfiguruj →":"Aktywuj →"}</button>
            </div>
          ))}
        </div>
      )}
      {tab==="plans"&&(
        <div className="settings-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:740}}>
          {[{name:"Starter",price:199,clients:10,features:["Panel klienta","Leady CRM","Raporty podstawowe","Chat"]},{name:"Agency",price:499,clients:50,features:["Wszystko z Starter","White-label","Własna domena","Mapa Polski","Kalendarz","Export CSV"],highlight:true},{name:"Scale",price:999,clients:"∞",features:["Wszystko z Agency","API access","Multi-user team","AI Asystent","SMS powiadomienia","Priorytetowy support"]}].map(p=>(
            <div key={p.name} style={{background:"var(--bg-surface)",border:`2px solid ${p.highlight?"var(--accent-b)":"#151520"}`,borderRadius:18,padding:22,position:"relative"}}>
              {p.highlight&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(90deg,${TENANT.primary},#e05020)`,color:"var(--text-primary)",borderRadius:"0 0 8px 8px",padding:"2px 12px",fontSize:10,fontWeight:900,whiteSpace:"nowrap"}}>NAJPOPULARNIEJSZY</div>}
              <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:17,marginBottom:4}}>{p.name}</div>
              <div style={{fontFamily:"'DM Mono',monospace",color:p.highlight?"var(--accent)":"#ddd",fontSize:28,fontWeight:900,marginBottom:4}}>{p.price} zł<span style={{fontSize:12,color:"var(--text-muted)",fontWeight:400}}>/mies</span></div>
              <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:16}}>Do {p.clients} klientów</div>
              <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
                {p.features.map(f=><div key={f} style={{color:"var(--text-muted)",fontSize:12,padding:"4px 0",display:"flex",gap:8}}><span style={{color:"var(--success)"}}>✓</span>{f}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="api"&&(
        <div style={{maxWidth:560}}>
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:22}}>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14,marginBottom:16}}>API Keys</div>
            <div style={{marginBottom:14}}>
              <div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Live API Key</div>
              <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'DM Mono',monospace",color:"var(--text-muted)",fontSize:11}}>hg_live_•••••••••••••••••••••••••••</span>
                <button onClick={()=>showToast("📋 Klucz API skopiowany")} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Kopiuj</button>
              </div>
            </div>
            <div style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",borderRadius:10,padding:"12px 14px",marginTop:16}}>
              <div style={{color:"var(--accent)",fontSize:12,fontWeight:700,marginBottom:6}}>📖 Dokumentacja API</div>
              <div style={{color:"var(--text-muted)",fontSize:11,lineHeight:1.6}}>REST API dostępne w planach Scale i Enterprise. Endpointy: /clients, /leads, /campaigns, /reports. Rate limit: 1000 req/h.</div>
              <div style={{marginTop:10,color:"var(--text-muted)",fontSize:11,fontFamily:"'DM Mono',monospace",background:"#0a0a0f",borderRadius:8,padding:"8px 12px"}}>GET https://api.hardgain.pl/v1/clients<br/>Authorization: Bearer {"{"}"api_key{"}"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CLIENT FOCUS (detail view) ───────────────────────────────── */
function AdminClientFocus({client,clients,setClients,events,setEvents,onBack}) {
  const [tab,setTab]=useState("overview");
  const live=clients.find(c=>c.id===client.id)||client;
  const clientEvents=events.filter(e=>e.clientId===client.id);
  const evColor={call:"var(--accent)",meeting:"var(--success)",onboarding:"#A78BFA",report:"#F7C59F"};
  const evIcon={call:"📞",meeting:"🤝",onboarding:"🚀",report:"📊"};

  return (
    <div style={{padding:28}} className="fu">
      <button onClick={onBack} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontFamily:"inherit",fontSize:12,marginBottom:18,padding:0}}>← Wróć do klientów</button>
      <div className="client-header" style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <div style={{width:52,height:52,background:live.color+"15",border:`1px solid ${live.color}25`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:live.color,fontSize:22,flexShrink:0}}>{live.avatar}</div>
        <div style={{flex:"1 1 200px",minWidth:0}}>
          <h1 style={{fontSize:22,fontWeight:900,color:"var(--text-primary)",letterSpacing:"-0.03em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{live.name}</h1>
          <div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>{live.city} · {live.plan} · {fmt(live.planPrice)} zł/mies</div>
        </div>
        <div className="client-header-actions" style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <span style={{background:live.plan_key==="pro"?"var(--accent-glow)":"var(--bg-overlay)",color:live.plan_key==="pro"?"var(--accent)":"var(--text-muted)",border:`1px solid ${live.plan_key==="pro"?"var(--accent-b)":"var(--border)"}`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:800}}>{live.plan_key==="pro"?"✓ PRO":"FREE"}</span>
          <button onClick={()=>showToast("✏️ Edycja klienta — wkrótce dostępna")} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Edytuj klienta</button>
        </div>
      </div>

      <Tabs tabs={[["overview","Wyniki","◈"],["campaigns","Kampanie","▶"],["leads","Leady","◎"],["funnel","Lejek","◉"],["creatives","Kreacje","◌"],["messages","Chat","◷"],["schedule","Spotkania","📅"],["tickets","Zgłoszenia","△"]]} active={tab} onSelect={setTab}/>

      {tab==="overview"&&(
        <div>
          <div className="kpi-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
            <KPI label="Leady" value={live.stats.leads} accent="var(--accent)" icon="👤"/>
            <KPI label="CPL" value={live.stats.cpl+" zł"} accent="var(--success)" icon="⚡"/>
            <KPI label="Spend" value={fmt(live.stats.spend)+" zł"} accent="#F7C59F" icon="💰"/>
            <KPI label="Konwersja" value={live.stats.conversion+"%"} accent="#A78BFA" icon="📈"/>
            <KPI label="Przychód" value={fmt(live.stats.revenue)+" zł"} accent="#34D399" icon="💵"/>
          </div>
          <div className="chart-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
              <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:14}}>Leady · 7 dni</div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,leads:live.weekLeads[i]||0,cpl:live.weekCpl[i]||0}))}>
                  <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={live.color} stopOpacity={0.25}/><stop offset="95%" stopColor={live.color} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)"/>
                  <XAxis dataKey="day" tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text-primary)",fontSize:11}}/>
                  <Area type="monotone" dataKey="leads" stroke={live.color} strokeWidth={2} fill="url(#lg2)" dot={{fill:live.color,r:3}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
              <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:14}}>CPL trend</div>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,cpl:live.weekCpl[i]||0}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)"/>
                  <XAxis dataKey="day" tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text-primary)",fontSize:11}}/>
                  <Line type="monotone" dataKey="cpl" stroke="var(--success)" strokeWidth={2} dot={{fill:"var(--success)",r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab==="campaigns"&&(
        <div>{live.campaigns.map(cp=>(
          <div key={cp.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <div><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:15}}>{cp.name}</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>Od {cp.start} · {cp.creative}</div></div>
              <span style={{background:cp.status==="active"?"var(--success-dim)":"var(--bg-subtle)",color:cp.status==="active"?"var(--success)":"var(--text-muted)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700}}>{cp.status==="active"?"● Aktywna":"⏸ Wstrzymana"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["Leady",cp.leads,"var(--accent)"],["CPL",cp.cpl+" zł","var(--success)"],["Spend",fmt(cp.spend)+" zł","#F7C59F"],["Budżet/dz",cp.budget+" zł","#888"]].map(([l,v,c])=>(
                <div key={l} style={{background:"var(--bg-base)",borderRadius:10,padding:"10px 12px"}}><div style={{fontWeight:800,color:c,fontFamily:"'DM Mono',monospace",fontSize:16}}>{v}</div><div style={{color:"var(--text-muted)",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:3}}>{l}</div></div>
              ))}
            </div>
          </div>
        ))}</div>
      )}

      {tab==="leads"&&(
        <div>{live.leads.map(l=>(
          <div key={l.id} style={{background:"var(--bg-surface)",border:`1px solid ${l.hot<=60?"var(--accent-glow)":"#151520"}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{width:32,height:32,background:"var(--accent-glow)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",fontWeight:900,fontSize:12,flexShrink:0}}>{l.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{l.name}</div><div style={{color:"var(--text-muted)",fontSize:11,marginTop:1}}>{l.phone} · {l.campaign}</div></div>
            <HotTimer m={l.hot}/>
            <LBadge s={l.status}/>
            <a href={`tel:${l.phone}`} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>📞</a>
          </div>
        ))}</div>
      )}

      {tab==="funnel"&&(
        <div style={{maxWidth:500}}>
          <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
            <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:15,marginBottom:20}}>Lejek konwersji</div>
            {[["Kliknięcia","clicks","#A78BFA"],["Leady","leads","var(--accent)"],["Rozmowy","calls","#F7C59F"],["Klienci","clients","var(--success)"]].map(([l,k,c],i,arr)=>{
              const v=live.funnel[k];
              const prev=i>0?live.funnel[arr[i-1][1]]:v;
              const pct=prev>0?(v/prev*100).toFixed(0):100;
              const barW=(v/live.funnel.clicks)*100;
              return (
                <div key={k} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{color:"var(--text-sec)",fontSize:12,fontWeight:600}}>{l}</span>
                    <div style={{display:"flex",gap:10}}>
                      {i>0&&<span style={{color:c,fontSize:11,fontWeight:700}}>{pct}% konwersji</span>}
                      <span style={{fontFamily:"'DM Mono',monospace",color:"var(--text-primary)",fontSize:13,fontWeight:700}}>{v}</span>
                    </div>
                  </div>
                  <div style={{height:10,background:"var(--bg-surface)",borderRadius:5,overflow:"hidden"}}>
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
          {live.creatives.length===0?<div style={{color:"var(--text-muted)",fontSize:13}}>Brak kreacji.</div>:
          live.creatives.map(cr=>(
            <div key={cr.id} style={{background:"var(--bg-surface)",border:`1px solid ${cr.status==="pending_approval"?"#F7C59F30":"#151520"}`,borderRadius:14,padding:16}}>
              <div style={{width:"100%",height:80,background:"var(--bg-base)",borderRadius:10,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{cr.thumb}</div>
              <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,marginBottom:3}}>{cr.name}</div>
              <div style={{color:"var(--text-muted)",fontSize:10,marginBottom:10}}>{cr.campaign}</div>
              {cr.status==="pending_approval"&&<span style={{background:"var(--warning-dim)",color:"var(--warning)",border:"1px solid rgba(245,158,11,.2)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>⏳ Oczekuje</span>}
              {cr.status==="approved"&&<span style={{background:"#4ECDC418",color:"var(--success)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>✓ Zatwierdzona</span>}
            </div>
          ))}
        </div>
      )}

      {tab==="messages"&&(
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden",minHeight:300,maxHeight:"60vh",display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflow:"auto",padding:"14px 16px 8px"}}>
            {live.messages.length===0?<div style={{color:"var(--text-muted)",textAlign:"center",marginTop:40}}>Brak wiadomości</div>:
            live.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="admin"?"flex-end":"flex-start",marginBottom:9}}>
                <div style={{maxWidth:"68%",background:m.from==="admin"?`linear-gradient(135deg,${TENANT.primary},#c43a00)`:"var(--bg-raised)",borderRadius:m.from==="admin"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px"}}>
                  <div style={{color:"var(--text-primary)",fontSize:13}}>{m.text}</div>
                  <div style={{color:m.from==="admin"?"rgba(255,255,255,.3)":"var(--text-muted)",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"9px 12px",borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
            <button onClick={()=>showToast("💬 Pełny czat dostępny w zakładce Chat w menu")} style={{color:"var(--accent)",fontSize:12,padding:"8px 0",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Otwórz czat →</button>
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
          {clientEvents.length===0?<div style={{textAlign:"center",color:"var(--text-muted)",padding:"40px 0"}}>Brak spotkań. <button onClick={()=>{}} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Zaplanuj →</button></div>:
          clientEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>(
            <div key={ev.id} style={{background:"var(--bg-surface)",border:`1px solid ${evColor[ev.type]}25`,borderRadius:14,padding:"14px 18px",display:"flex",gap:14,alignItems:"center",marginBottom:8}}>
              <div style={{width:38,height:38,background:evColor[ev.type]+"15",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{evIcon[ev.type]}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14}}>{ev.title}</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>{ev.date} o {ev.time} · {ev.duration} min</div></div>
              <span style={{background:evColor[ev.type]+"15",color:evColor[ev.type],border:`1px solid ${evColor[ev.type]}30`,borderRadius:7,padding:"3px 10px",fontSize:10,fontWeight:800,textTransform:"uppercase"}}>{ev.type}</span>
            </div>
          ))}
        </div>
      )}

      {tab==="tickets"&&(
        <div>{live.tickets.length===0?<div style={{textAlign:"center",color:"var(--text-muted)",padding:"40px 0"}}>Brak zgłoszeń 🎉</div>:
        live.tickets.map(t=>(
          <div key={t.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:12,padding:"13px 18px",display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
            <div style={{flex:1}}><div style={{fontWeight:700,color:"var(--text-sec)"}}>{t.title}</div><div style={{color:"var(--text-muted)",fontSize:11,marginTop:2}}>{t.date}</div></div>
            <span style={{background:{high:"var(--accent)",medium:"#F7C59F",low:"#444"}[t.priority]+"18",color:{high:"var(--accent)",medium:"#F7C59F",low:"#666"}[t.priority],borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{t.priority}</span>
            <span style={{background:t.status==="open"?"var(--accent-glow)":"#4ECDC418",color:t.status==="open"?"var(--accent)":"var(--success)",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{t.status==="open"?"Otwarte":"Rozwiązane"}</span>
          </div>
        ))}</div>
      )}
    </div>
  );
}

/* ─── ROI CALCULATOR ─────────────────────────────────────────────── */
function ClientROI({c,isPro,onUpgrade}) {
  const [budget,setBudget]=useState(c.stats.spend||1500);
  const [closeRate,setCloseRate]=useState(c.stats.conversion||12);
  const [avgVal,setAvgVal]=useState(499);
  const leads=Math.round(budget/(c.stats.cpl||20));
  const clients2=Math.round(leads*closeRate/100);
  const revenue=clients2*avgVal;
  const roi=budget>0?Math.round((revenue-budget)/budget*100):0;
  const ranges={
    budget:{min:500,max:10000,step:100},
    closeRate:{min:1,max:50,step:1},
    avgVal:{min:99,max:2999,step:50},
  };
  return (
    <div>
      <SH title="Kalkulator ROI" sub="Sprawdź ile zarobisz na kampaniach Meta Ads"/>
      {!isPro&&<div style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{flex:1,color:"var(--text-sec)",fontSize:12}}>⚡ Kalkulator aktywny w planie Pro — odblokuj pełne dane i prognozowanie</span>
        <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:8,padding:"7px 14px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap"}}>Odblokuj Pro →</button>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="chart-grid-2">
        {/* Inputs */}
        <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,padding:22}}>
          <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:14,marginBottom:20}}>📊 Parametry kampanii</div>
          {[
            ["💰 Budżet miesięczny (zł)",budget,setBudget,ranges.budget,"var(--accent)"],
            ["📞 Wskaźnik zamknięcia (%)",closeRate,setCloseRate,ranges.closeRate,"var(--success)"],
            ["💎 Średnia wartość klienta (zł)",avgVal,setAvgVal,ranges.avgVal,"#A78BFA"],
          ].map(([label,val,setter,r,color])=>(
            <div key={label} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:11,color:"var(--text-muted)"}}>{label}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:900,color}}>{val.toLocaleString("pl-PL")}</span>
              </div>
              <div style={{position:"relative",height:6,background:"var(--bg-raised)",borderRadius:3}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(val-r.min)/(r.max-r.min)*100}%`,background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:3,transition:"width .1s"}}/>
                <input type="range" min={r.min} max={r.max} step={r.step} value={val} onChange={e=>setter(+e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:6,padding:"10px 14px",background:"var(--bg-base)",borderRadius:10,border:"1px solid var(--border)"}}>
            <div style={{fontSize:10,color:"var(--text-muted)",marginBottom:4}}>Szacowany CPL na podstawie Twoich kampanii</div>
            <div style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontWeight:900,fontSize:18}}>{c.stats.cpl} zł <span style={{fontSize:11,color:"var(--text-muted)",fontWeight:400}}>/ lead</span></div>
          </div>
        </div>
        {/* Results */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            ["Leadów miesięcznie",leads,"var(--accent)","👥"],
            ["Nowych klientów",clients2,"var(--success)","🤝"],
            ["Przychód miesięczny",revenue.toLocaleString("pl-PL")+" zł","#34D399","💰"],
            ["ROI kampanii",roi+"%",roi>0?"#34D399":"var(--accent)","📈"],
          ].map(([label,val,color,icon])=>(
            <div key={label} style={{flex:1,background:"var(--bg-surface)",border:`2px solid ${color}22`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>{icon}</span>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:900,color,lineHeight:1}}>{val}</div>
                <div style={{fontSize:11,color:"var(--text-muted)",marginTop:3}}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Summary bar */}
      <div style={{marginTop:14,background:"var(--bg-raised)",border:"1px solid var(--success-b)",borderRadius:14,padding:"16px 20px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{fontSize:28}}>🎯</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:14}}>Przy budżecie {budget.toLocaleString("pl-PL")} zł/mies — zarabiasz {revenue.toLocaleString("pl-PL")} zł</div>
          <div style={{color:"var(--text-muted)",fontSize:12,marginTop:3}}>To {clients2} nowych klientów · ROI {roi}% · zwrot w {budget>0?Math.ceil(budget/Math.max(avgVal,1)):"-"} klientach</div>
        </div>
        {isPro&&<button onClick={()=>showToast("📄 Eksport kalkulacji PDF — wkrótce")} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"10px 18px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap"}}>Pobierz PDF 📄</button>}
      </div>
    </div>
  );
}


/* ─── CLIENT APP ─────────────────────────────────────────────────── */
const CLIENT_NAV = [
  ["overview","◈","Moje wyniki"],["roi","◆","Kalkulator ROI"],["campaigns","▶","Kampanie"],["leads","◎","Leady"],
  ["reports","▤","Raporty"],["creatives","◌","Kreacje"],["order","⊕","Zamów kampanię"],
  ["onboarding","✓","Onboarding"],["training","◧","Szkolenia"],["kb","◉","Baza wiedzy"],
  ["chat","△","Chat z agencją"],["ticket","□","Zgłoś problem"],
];
function ClientApp({user,onLogout}) {
  const [view,setView]=useState("overview");
  const [clients,setClients]=useState(CLIENTS);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const client=clients.find(c=>c.id===user.id)||clients[0];
  const isPro=client.plan_key==="pro";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg-base)"}}>
      <G/>
      <Sidebar nav={CLIENT_NAV} view={view} setView={setView} onLogout={onLogout} u={{name:client.name,avatar:client.avatar,role:"client"}} />
      <main style={{marginLeft:"var(--sidebar-ml,220px)",flex:1,overflow:"auto",padding:28}}>
        {!isPro&&view!=="onboarding"&&view!=="training"&&view!=="kb"&&view!=="ticket"&&view!=="order"&&(
          <div style={{background:"linear-gradient(135deg,#FF6B3510,#A78BFA10)",border:"1px solid var(--accent-b)",borderRadius:14,padding:"16px 20px",marginBottom:22,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <span style={{fontSize:24}}>⚡</span>
            <div style={{flex:1}}><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13}}>Jesteś na planie Free</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>Odblokuj pełne dane, wykresy, chat i raporty za 99 zł/mies</div></div>
            <button onClick={()=>setShowUpgrade(true)} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"9px 18px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap",boxShadow:`0 4px 16px ${TENANT.primary}30`}}>Odblokuj Pro →</button>
          </div>
        )}
        {view==="overview"&&<div className="fu"><SH title="Moje wyniki"/><ClientOverview c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="roi"&&<div className="fu"><ClientROI c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="campaigns"&&<div className="fu"><SH title="Kampanie"/><ClientCampaigns c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="leads"&&<div className="fu"><SH title="Leady" sub={`${client.leads.length} leadów`}/><ClientLeads c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="reports"&&<div className="fu"><SH title="Raporty"/><ClientReports c={client} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="creatives"&&<div className="fu"><SH title="Kreacje reklamowe" sub="Zatwierdź lub zgłoś uwagi"/><ClientCreatives c={client} clients={clients} setClients={setClients} isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="order"&&<div className="fu"><CampaignOrder/></div>}
        {view==="onboarding"&&<div className="fu"><ClientOnboarding/></div>}
        {view==="training"&&<div className="fu"><ClientTraining isPro={isPro} onUpgrade={()=>setShowUpgrade(true)}/></div>}
        {view==="kb"&&<div className="fu"><SH title="Baza Wiedzy"/><ClientKB/></div>}
        {view==="chat"&&<div className="fu"><SH title="Chat z agencją"/>{isPro?<ChatPane messages={client.messages} clientId={client.id} clients={clients} setClients={setClients}/>:<ProLock label="Chat dostępny w Pro" onUpgrade={()=>setShowUpgrade(true)}/>}</div>}
        {view==="ticket"&&<div className="fu"><TicketForm/></div>}
      </main>
      {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)}/>}
    </div>
  );
}

function ProLock({label,onUpgrade}) {
  return (
    <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:60,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>🔒</div>
      <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:16,marginBottom:6}}>{label||"Funkcja Pro"}</div>
      <div style={{color:"var(--text-muted)",fontSize:13,marginBottom:20}}>Odblokuj w planie Pro za 99 zł/mies</div>
      <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"10px 24px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Odblokuj Pro →</button>
    </div>
  );
}

function ClientOverview({c,isPro,onUpgrade}) {
  return (
    <div>
      <div className="kpi-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <KPI label="Leady" value={c.stats.leads} accent="var(--accent)" icon="👤"/>
        <KPI label="CPL" value={c.stats.cpl+" zł"} accent="var(--success)" icon="⚡" locked={!isPro} onUpgrade={onUpgrade}/>
        <KPI label="Wydano" value={`${c.stats.spend} zł`} accent="#F7C59F" icon="💰" locked={!isPro} onUpgrade={onUpgrade}/>
        <KPI label="Konwersja" value={c.stats.conversion+"%"} accent="#A78BFA" icon="📈" locked={!isPro} onUpgrade={onUpgrade}/>
      </div>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,position:"relative",overflow:"hidden"}}>
        {!isPro&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"rgba(5,5,10,.75)",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16}}><button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:12,padding:"12px 24px",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>🔒 Odblokuj wykresy →</button></div>}
        <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,marginBottom:14}}>Leady · 7 dni</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={["Pon","Wt","Śr","Czw","Pt","Sob","Nd"].map((d,i)=>({day:d,leads:c.weekLeads[i]||0}))}>
            <defs><linearGradient id="clg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c.color} stopOpacity={0.3}/><stop offset="95%" stopColor={c.color} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)"/>
            <XAxis dataKey="day" tick={{fill:"var(--text-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text-primary)",fontSize:11}}/>
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
      {!isPro&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"rgba(5,5,10,.75)",zIndex:5,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center"}}><button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:12,padding:"12px 24px",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>🔒 Odblokuj kampanie →</button></div>}
      {c.campaigns.map(cp=>(
        <div key={cp.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontWeight:800,color:"var(--text-primary)",fontSize:15}}>{cp.name}</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>Od {cp.start}</div></div><span style={{background:cp.status==="active"?"var(--success-dim)":"var(--bg-subtle)",color:cp.status==="active"?"var(--success)":"var(--text-muted)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700}}>{cp.status==="active"?"● Aktywna":"⏸"}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["Leady",cp.leads,"var(--accent)"],["CPL",cp.cpl+" zł","var(--success)"],["Spend",`${cp.spend} zł`,"#F7C59F"],["Budżet",cp.budget+" zł/dz","#888"]].map(([l,v,col])=>(
              <div key={l} style={{background:"var(--bg-base)",borderRadius:9,padding:"9px 11px"}}><div style={{fontWeight:800,color:col,fontFamily:"'DM Mono',monospace",fontSize:15}}>{v}</div><div style={{color:"var(--text-muted)",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{l}</div></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientLeads({c,isPro,onUpgrade}) {
  const [expanded,setExpanded]=useState(null);
  return (
    <div>
      {!isPro&&<div style={{background:"var(--bg-surface)",border:"1px solid var(--accent-b)",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:28}}>👥</span>
        <div style={{flex:1,minWidth:120}}><div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13}}>{c.leads.length} leadów w tym miesiącu</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:2}}>Odblokuj Pro aby zobaczyć dane kontaktowe, kampanię i odpowiedzi</div></div>
        <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:9,padding:"8px 15px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap"}}>Odblokuj →</button>
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {c.leads.map((l,i)=>{
        const locked=!isPro&&i>0;
        return(
          <div key={l.id} style={{background:"var(--bg-surface)",border:`1px solid ${l.hot<=60&&!locked?"var(--accent-b)":"var(--border)"}`,borderRadius:14,overflow:"hidden",position:"relative"}}>
            {locked&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(4px)",background:"rgba(5,5,10,.8)",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:14}}><span style={{color:"var(--text-muted)",fontSize:12}}>🔒 Pro</span></div>}
            <div onClick={()=>!locked&&setExpanded(expanded===l.id?null:l.id)} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:locked?"default":"pointer"}}>
              <div style={{width:34,height:34,background:l.hot<=60?"var(--accent-glow)":"var(--bg-subtle)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:l.hot<=60?"var(--accent)":"var(--text-muted)",fontWeight:900,fontSize:13,flexShrink:0}}>{locked?"?":l.name.charAt(0)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color:"var(--text-sec)",fontSize:13}}>{locked?"● ● ● ● ●":l.name}</div>
                <div style={{color:"var(--text-muted)",fontSize:11,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {locked?"●●●-●●●-●●●":l.phone}
                  {!locked&&l.campaign&&<span style={{color:"var(--text-muted)",marginLeft:6}}>· {l.campaign}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <HotTimer m={l.hot}/>
                <LBadge s={l.status}/>
                {isPro&&<a href={`tel:${l.phone.replace(/\s/g,"")}`} onClick={e=>e.stopPropagation()} style={{background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:7,padding:"5px 8px",fontSize:11,fontWeight:700,textDecoration:"none"}}>📞</a>}
                {!locked&&<span style={{color:"var(--text-muted)",fontSize:10}}>{expanded===l.id?"▲":"▼"}</span>}
              </div>
            </div>
            {expanded===l.id&&!locked&&l.answers&&(
              <div style={{padding:"10px 14px 14px",borderTop:"1px solid var(--border)",background:"#07070e"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Odpowiedzi z formularza</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}} className="lead-detail-grid">
                  {[["🎯 Cel",l.answers.cel],["⏰ Start",l.answers.start],["💰 Budżet",l.answers.budzet]].map(([label,val])=>val&&(
                    <div key={label} style={{background:"var(--bg-surface)",borderRadius:8,padding:"8px 10px",border:"1px solid var(--border)"}}>
                      <div style={{fontSize:10,color:"var(--text-muted)",marginBottom:3}}>{label}</div>
                      <div style={{fontSize:12,color:"var(--text-sec)",fontWeight:600}}>{val}</div>
                    </div>
                  ))}
                </div>
                {l.adSet&&<div style={{marginTop:8,fontSize:11,color:"var(--text-muted)"}}>📍 Zestaw reklam: <span style={{color:"var(--text-sec)"}}>{l.adSet}</span></div>}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function ClientReports({c,isPro,onUpgrade}) {
  if(!isPro) return <ProLock label="Raporty miesięczne dostępne w Pro" onUpgrade={onUpgrade}/>;
  return <div style={{textAlign:"center",color:"var(--text-muted)",padding:"40px 0",fontSize:14}}>Raporty zostaną wygenerowane automatycznie do 3. dnia miesiąca.</div>;
}

function ClientCreatives({c,clients,setClients,isPro,onUpgrade}) {
  if(!isPro) return <ProLock label="Kreacje dostępne w Pro" onUpgrade={onUpgrade}/>;
  const live=clients.find(cl=>cl.id===c.id)||c;
  const approve=(crId,action)=>setClients(prev=>prev.map(cl=>cl.id===c.id?{...cl,creatives:cl.creatives.map(cr=>cr.id===crId?{...cr,status:action==="approve"?"approved":"rejected"}:cr)}:cl));
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
      {live.creatives.map(cr=>(
        <div key={cr.id} style={{background:"var(--bg-surface)",border:`1px solid ${cr.status==="pending_approval"?"#F7C59F30":"#151520"}`,borderRadius:14,padding:16}}>
          <div style={{width:"100%",height:80,background:"var(--bg-base)",borderRadius:10,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{cr.thumb}</div>
          <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:12,marginBottom:2}}>{cr.name}</div>
          <div style={{color:"var(--text-muted)",fontSize:10,marginBottom:10}}>{cr.campaign}</div>
          {cr.status==="pending_approval"&&<div style={{display:"flex",gap:5}}>
            <button onClick={()=>approve(cr.id,"approve")} style={{flex:1,background:"#4ECDC418",border:"1px solid var(--success-b)",color:"var(--success)",borderRadius:7,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓ OK</button>
            <button onClick={()=>approve(cr.id,"reject")} style={{flex:1,background:"var(--accent-glow)",border:"1px solid var(--accent-b)",color:"var(--accent)",borderRadius:7,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
          </div>}
          {cr.status==="approved"&&<span style={{background:"#4ECDC418",color:"var(--success)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>✓ Zatwierdzona</span>}
          {cr.status==="rejected"&&<span style={{background:"var(--accent-glow)",color:"var(--accent)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>✕ Do poprawy</span>}
        </div>
      ))}
    </div>
  );
}

function ChatPane({messages,clientId,clients,setClients}) {
  const [msg,setMsg]=useState(""); const br=useRef(null);
  const live=clients.find(c=>c.id===clientId)?.messages||messages;
  useEffect(()=>{br.current?.scrollIntoView({behavior:"smooth"});},[live]);
  const send=()=>{
    if(!msg.trim()||!setClients)return;
    const m={from:"client",text:msg,time:new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})};
    setClients(prev=>prev.map(c=>c.id===clientId?{...c,messages:[...c.messages,m]}:c));
    setMsg("");
  };
  return (
    <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:16,display:"flex",flexDirection:"column",height:"min(400px,60vh)"}}>
      <div style={{flex:1,overflow:"auto",padding:"14px 16px 8px"}}>
        {live.map((m,i)=>{const mine=m.from==="client";return(
          <div key={i} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",marginBottom:9}}>
            <div style={{maxWidth:"70%",background:mine?`linear-gradient(135deg,${TENANT.primary},#e05020)`:"#111120",borderRadius:mine?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 14px"}}>
              <div style={{color:"var(--text-primary)",fontSize:13}}>{m.text}</div>
              <div style={{color:mine?"rgba(255,255,255,.3)":"var(--text-muted)",fontSize:9,marginTop:3,textAlign:"right"}}>{m.time}</div>
            </div>
          </div>
        );})}
        <div ref={br}/>
      </div>
      <div style={{padding:"9px 12px",borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Napisz..." style={{flex:1,background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/>
        <button onClick={send} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:9,padding:"8px 15px",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>↑</button>
      </div>
    </div>
  );
}

const ONBOARDING_STEPS=[{id:1,title:"Podpisz umowę współpracy",desc:"Sprawdź email i podpisz elektronicznie.",done:true},{id:2,title:"Dodaj kartę do Meta Ads",desc:"Potrzebujemy dostępu do rozliczeń.",done:true},{id:3,title:"Wgraj dostęp do Business Managera",desc:"Dodaj nas jako partnera.",done:false},{id:4,title:"Zaakceptuj kreacje reklamowe",desc:"Sprawdź bibliotekę kreacji.",done:false},{id:5,title:"Obejrzyj szkolenie: jak obsługiwać leady",desc:"10 min — kluczowe dla konwersji.",done:false}];
function ClientOnboarding() {
  const [steps,setSteps]=useState(ONBOARDING_STEPS);
  const done=steps.filter(s=>s.done).length;
  return (
    <div>
      <SH title="Onboarding" sub="Wykonaj poniższe kroki aby zacząć generować leady"/>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:14,padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1,background:"var(--bg-base)",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${done/steps.length*100}%`,height:"100%",background:`linear-gradient(90deg,${TENANT.primary},${TENANT.accent})`,borderRadius:8,transition:"width .4s ease"}}/>
        </div>
        <span style={{color:TENANT.primary,fontWeight:900,fontSize:14,fontFamily:"'DM Mono',monospace"}}>{done}/{steps.length}</span>
        {done===steps.length&&<span style={{color:"var(--success)",fontSize:13,fontWeight:700}}>🎉 Gotowe!</span>}
      </div>
      {steps.map((s,i)=>(
        <div key={s.id} style={{background:"var(--bg-surface)",border:`1px solid ${s.done?"var(--success-b)":"var(--border)"}`,borderRadius:14,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start",marginBottom:8,opacity:s.done?.6:1,transition:"opacity .2s"}}>
          <div onClick={()=>setSteps(p=>p.map(st=>st.id===s.id?{...st,done:!st.done}:st))} style={{width:28,height:28,borderRadius:8,border:`2px solid ${s.done?"var(--success)":"var(--border)"}`,background:s.done?"var(--success-b)":"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            {s.done&&<span style={{color:"var(--success)",fontSize:11}}>✓</span>}
          </div>
          <div><div style={{fontWeight:700,color:s.done?"var(--text-muted)":"var(--text-sec)",fontSize:14,textDecoration:s.done?"line-through":"none"}}>Krok {i+1}: {s.title}</div><div style={{color:"var(--text-muted)",fontSize:12,marginTop:3}}>{s.desc}</div></div>
        </div>
      ))}
    </div>
  );
}

const TRAINING=[{id:"t1",title:"Jak obsługiwać leady — pierwsze 24h",cat:"Sprzedaż",dur:"12 min",type:"video",free:true},{id:"t2",title:"Jak czytać raport miesięczny",cat:"Raporty",dur:"8 min",type:"article",free:true},{id:"t3",title:"Facebook Ads Manager — podstawy",cat:"Techniczne",dur:"15 min",type:"video",free:false},{id:"t4",title:"Zaawansowana optymalizacja kampanii",cat:"Kampanie",dur:"22 min",type:"video",free:false},{id:"t5",title:"Psychologia sprzedaży — konwersja",cat:"Sprzedaż",dur:"18 min",type:"video",free:false}];
function ClientTraining({isPro,onUpgrade}) {
  const cats=[...new Set(TRAINING.map(m=>m.cat))];
  return (
    <div>
      <SH title="Platforma Szkoleniowa" sub="Materiały które pomogą Ci maksymalizować wyniki"/>
      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:20}}>
          <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>{cat}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
            {TRAINING.filter(m=>m.cat===cat).map(m=>(
              <div key={m.id} onClick={!m.free&&!isPro?onUpgrade:undefined} style={{background:"var(--bg-surface)",border:`1px solid ${!m.free&&!isPro?"var(--border)":"var(--border)"}`,borderRadius:12,padding:14,cursor:!m.free&&!isPro?"pointer":"default",opacity:!m.free&&!isPro?.5:1}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:20}}>{m.type==="video"?"🎬":"📄"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"var(--text-sec)",fontSize:13,marginBottom:3}}>{m.title}</div>
                    <div style={{color:"var(--text-muted)",fontSize:11,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      {m.dur}
                      {!m.free&&!isPro?<span style={{background:"var(--accent-glow)",color:"var(--accent)",border:"1px solid var(--accent-b)",borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:700}}>PRO</span>:<span style={{background:"var(--success-dim)",color:"var(--success)",border:"1px solid #4ECDC425",borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:700}}>FREE</span>}
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

const KB_ITEMS=[{t:"Jak dodać kartę do Meta Ads",cat:"Płatności"},{t:"Jak pobrać fakturę z Facebook Ads",cat:"Płatności"},{t:"Jak podłączyć SMS do odbioru leadów",cat:"Techniczne"},{t:"Jak czytać wyniki kampanii",cat:"Kampanie"},{t:"Jak zakwalifikować lead w 60 sekund",cat:"Sprzedaż"}];
function ClientKB() {
  const cats=[...new Set(KB_ITEMS.map(i=>i.cat))];
  return (
    <div>{cats.map(cat=>(
      <div key={cat} style={{marginBottom:16}}>
        <div style={{color:TENANT.primary,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{cat}</div>
        {KB_ITEMS.filter(a=>a.cat===cat).map((a,i)=>(
          <div key={i} className="hr" style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px",marginBottom:5,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background .1s"}}>
            <span style={{fontWeight:700,color:"var(--text-sec)",fontSize:13}}>{a.t}</span>
            <span style={{color:"var(--text-muted)"}}>›</span>
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
      <div style={{fontSize:48,marginBottom:14}}>🚀</div>
      <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:22,marginBottom:8}}>Zamówienie wysłane!</div>
      <div style={{color:"var(--text-muted)",fontSize:13,marginBottom:20}}>Odezwiemy się w ciągu 24h z planem kampanii.</div>
      <button onClick={()=>setStep(1)} style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"10px 22px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Nowe zamówienie</button>
    </div>
  );
  return (
    <div>
      <SH title="Zamów nową kampanię" sub="Wypełnij brief — dostaniesz wycenę w 24h"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:3,background:step>=s?TENANT.primary:"var(--bg-overlay)",transition:"background .3s"}}/>)}
      </div>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,padding:26,maxWidth:520}}>
        {step===1&&<>
          <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:16,marginBottom:18}}>Krok 1 — Cel i budżet</div>
          {[["Cel kampanii","goal","text","np. Zbieranie leadów na pakiet treningowy"],["Miesięczny budżet (zł)","budget","number","np. 1500"]].map(([l,k,t,ph])=>(
            <div key={k} style={{marginBottom:16}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{l}</div><input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/></div>
          ))}
          <button onClick={()=>setStep(2)} style={{width:"100%",background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Dalej →</button>
        </>}
        {step===2&&<>
          <div style={{fontWeight:900,color:"var(--text-primary)",fontSize:16,marginBottom:18}}>Krok 2 — Szczegóły</div>
          {[["Docelowa grupa","audience","Mężczyźni 30-50 lat, Kraków"],["Oferta","offer","np. Pakiet 3 miesiące 699 zł"]].map(([l,k,ph])=>(
            <div key={k} style={{marginBottom:16}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{l}</div><input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/></div>
          ))}
          <div style={{marginBottom:20}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Uwagi</div><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text-sec)",fontSize:13,outline:"none",resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8}}><button onClick={()=>setStep(1)} style={{flex:1,background:"var(--bg-raised)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:10,padding:"12px 0",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>← Wróć</button><button onClick={async()=>{
    try{
      await fetch("https://hook.eu1.make.com/9q9jgavlv8c7cpkvr7v17o8e6fqgn9um",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"campaign_order",...form,submittedAt:new Date().toISOString()})});
    }catch(e){}
    setStep(3);
  }} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Wyślij 🚀</button></div>
        </>}
      </div>
    </div>
  );
}

function TicketForm() {
  const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [prio,setPrio]=useState("medium"); const [sent,setSent]=useState(false);
  if(sent) return <div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:48,marginBottom:14}}>✅</div><div style={{fontWeight:900,color:"var(--text-primary)",fontSize:20,marginBottom:8}}>Zgłoszenie wysłane!</div><div style={{color:"var(--text-muted)",fontSize:13}}>Odpiszemy w 24h roboczych.</div><button onClick={()=>{setSent(false);setTitle("");setDesc("");}} style={{marginTop:20,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"10px 20px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Nowe zgłoszenie</button></div>;
  return (
    <div>
      <SH title="Zgłoś problem"/>
      {/* Szybki kontakt gdy pilne */}
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--accent-b)",borderRadius:14,padding:"14px 18px",marginBottom:20}}>
        <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:13,marginBottom:4}}>⚡ Pilne? Zadzwoń lub napisz od razu</div>
        <div style={{color:"var(--text-muted)",fontSize:12,marginBottom:12}}>Nie czekaj na odpowiedź — nasz agent odpowiada błyskawicznie</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <a href="tel:+48600000000" style={{background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,color:"var(--text-primary)",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>📞 Zadzwoń</a>
          <a href="https://wa.me/48600000000" target="_blank" rel="noreferrer" style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",color:"#25D366",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>💬 WhatsApp</a>
          <a href="sms:+48600000000" style={{background:"var(--success-dim)",border:"1px solid var(--success-b)",color:"var(--success)",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>✉️ SMS</a>
        </div>
      </div>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:18,padding:24,maxWidth:520}}>
        <div style={{marginBottom:16}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Temat</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="np. Nie widzę nowych leadów" style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text-sec)",fontSize:13,outline:"none"}}/></div>
        <div style={{marginBottom:16}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Priorytet</div><div style={{display:"flex",gap:6}}>{[["high","Pilne","var(--accent)"],["medium","Normalne","#F7C59F"],["low","Niskie","#444"]].map(([v,l,c])=><button key={v} onClick={()=>setPrio(v)} style={{flex:1,background:prio===v?c+"15":"var(--bg-base)",border:`1px solid ${prio===v?c+"40":"var(--border)"}`,color:prio===v?c:"var(--text-muted)",borderRadius:8,padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div></div>
        <div style={{marginBottom:20}}><div style={{color:"var(--text-muted)",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Opis</div><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text-sec)",fontSize:13,outline:"none",resize:"vertical"}}/></div>
        <button onClick={async()=>{
    if(!title.trim())return;
    try{
      await fetch("https://hook.eu1.make.com/9q9jgavlv8c7cpkvr7v17o8e6fqgn9um",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"ticket",title,desc,priority:prio,submittedAt:new Date().toISOString()})});
    }catch(e){}
    setSent(true);
  }} style={{width:"100%",background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:10,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Wyślij zgłoszenie →</button>
      </div>
    </div>
  );
}

function UpgradeModal({onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)",overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:22,width:"100%",maxWidth:480,padding:32,boxShadow:`0 24px 80px #000`,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:26}}><div style={{fontSize:42,marginBottom:12}}>⚡</div><div style={{fontSize:24,fontWeight:900,color:"var(--text-primary)",letterSpacing:"-0.02em"}}>Odblokuj Hardgain Pro</div><div style={{color:"var(--text-muted)",fontSize:13,marginTop:5}}>Pełny dostęp do wszystkich funkcji</div></div>
        <div style={{marginBottom:24}}>
          {["✓ Pełne dane leadów — imię, telefon, status","✓ Wykresy CPL i trendów w czasie","✓ Raporty miesięczne z historią","✓ Zatwierdzanie kreacji reklamowych","✓ Chat z agencją bez limitu","✓ Eksport leadów do CSV","✓ Zamówienia nowych kampanii","✓ Powiadomienia push przy nowym leadzie"].map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid var(--border)",color:"var(--text-muted)",fontSize:13}}>{f}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"var(--bg-raised)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:12,padding:"12px 0",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zostań Free</button>
          <button onClick={()=>{window.open("https://hardgain.pl/#kontakt","_blank");onClose();}} style={{flex:2,background:`linear-gradient(135deg,${TENANT.primary},#e05020)`,border:"none",color:"var(--text-primary)",borderRadius:12,padding:"12px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14,boxShadow:`0 4px 20px ${TENANT.primary}50`}}>Odblokuj za 99 zł/mies →</button>
        </div>
        <div style={{textAlign:"center",color:"var(--text-muted)",fontSize:11,marginTop:12}}>Możesz zrezygnować w każdej chwili</div>
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────── */
export default function App() {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(SUPABASE_READY);

  useEffect(()=>{
    if (!SUPABASE_READY) return;
    // Przywróć sesję po odświeżeniu strony
    getSession().then(async session => {
      if (session) {
        try {
          const profile = await getUserProfile(session.user.id);
          setUser({ ...profile, id: session.user.id });
        } catch(e) { /* sesja wygasła */ }
      }
      setLoading(false);
    });
    // Nasłuchuj zmian auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') setUser(null);
      if (event === 'SIGNED_IN' && session) {
        try {
          const profile = await getUserProfile(session.user.id);
          setUser({ ...profile, id: session.user.id });
        } catch(e) {}
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (SUPABASE_READY) await signOut();
    setUser(null);
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"var(--bg-base)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <G/>
      <div style={{textAlign:"center"}}>
        <div style={{width:44,height:44,border:`3px solid #FF6B3530`,borderTop:`3px solid #FF6B35`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
        <div style={{color:"var(--text-muted)",fontSize:12}}>Ładowanie...</div>
      </div>
    </div>
  );

  return <>
    <Toast/>
    {!user?<Login onLogin={setUser}/>:user.role==="admin"?<AdminApp user={user} onLogout={handleLogout}/>:<ClientApp user={user} onLogout={handleLogout}/>}
  </>;
}
