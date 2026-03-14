import { useState, useEffect, useRef } from "react";
import { type Store, API_URL, authFetch } from "./sellerTypes";
import StoreEditor from "./StoreEditor";

interface Props { stores: Store[]; onRefresh: () => void; onNewStore: () => void; }

type Theme = "light" | "dark";

const TK = {
  dark: {
    page: "#0c0c0c",
    header: "rgba(255,255,255,0.03)",
    card: "#141414", cardHov: "#1a1a1a",
    border: "rgba(255,255,255,0.07)", borderHov: "rgba(255,255,255,0.18)",
    text: "#f8f8f8", textSub: "rgba(255,255,255,0.62)", textMuted: "rgba(255,255,255,0.3)",
    stat: "rgba(255,255,255,0.05)", statBorder: "rgba(255,255,255,0.09)",
    divider: "rgba(255,255,255,0.06)",
    btnBg: "rgba(255,255,255,0.07)", btnBorder: "rgba(255,255,255,0.11)", btnColor: "rgba(255,255,255,0.55)",
    inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.11)",
    empty: "rgba(255,255,255,0.02)",
    shadow: "rgba(0,0,0,0.7)",
    tagBg: "rgba(255,255,255,0.07)",
    pillOff: "rgba(255,255,255,0.07)",
    pillOffBorder: "rgba(255,255,255,0.15)",
    pillOffText: "rgba(255,255,255,0.45)",
  },
  light: {
    page: "#ede9e3",
    header: "rgba(255,255,255,0.92)",
    card: "#ffffff", cardHov: "#fefcfa",
    border: "rgba(0,0,0,0.07)", borderHov: "rgba(0,0,0,0.18)",
    text: "#111111", textSub: "#3d3d3d", textMuted: "#999999",
    stat: "rgba(0,0,0,0.025)", statBorder: "rgba(0,0,0,0.07)",
    divider: "rgba(0,0,0,0.07)",
    btnBg: "rgba(0,0,0,0.05)", btnBorder: "rgba(0,0,0,0.1)", btnColor: "#666",
    inputBg: "rgba(0,0,0,0.035)", inputBorder: "rgba(0,0,0,0.1)",
    empty: "rgba(255,255,255,0.6)",
    shadow: "rgba(0,0,0,0.1)",
    tagBg: "rgba(0,0,0,0.05)",
    pillOff: "rgba(255,255,255,0.8)",
    pillOffBorder: "rgba(0,0,0,0.12)",
    pillOffText: "#888",
  },
};

const nicheEmoji: Record<string,string> = {
  fashion:"👗", electronics:"⚡", cosmetics:"💄", food:"🍽️",
  accessories:"💍", sports:"🏆", education:"📚", other:"✨",
};
const nicheLabel: Record<string,string> = {
  fashion:"Fashion", electronics:"Electronics", cosmetics:"Cosmetics", food:"Food & Drink",
  accessories:"Accessories", sports:"Sports", education:"Education", other:"General",
};

function useCountUp(target: number, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) { setV(0); return; }
    const t0 = setTimeout(() => {
      let cur = 0; const step = Math.max(1, target / 45);
      const t = setInterval(() => { cur = Math.min(cur + step, target); setV(Math.round(cur)); if (cur >= target) clearInterval(t); }, 14);
      return () => clearInterval(t);
    }, delay);
    return () => clearTimeout(t0);
  }, [target, delay]);
  return v;
}

/* ══════════ SUMMARY BAR ══════════ */
const SummaryBar = ({ stores, theme }: { stores: Store[]; theme: Theme }) => {
  const tk = TK[theme];
  const isDark = theme === "dark";
  const totalRev  = stores.reduce((s,x) => s + (x.total_revenue   || 0), 0);
  const totalOrds = stores.reduce((s,x) => s + (x.total_orders    || 0), 0);
  const totalCus  = stores.reduce((s,x) => s + (x.total_customers || 0), 0);
  const liveCount = stores.filter(s => s.is_live).length;
  const rev  = useCountUp(totalRev);
  const ords = useCountUp(totalOrds);
  const cus  = useCountUp(totalCus);
  const live = useCountUp(liveCount);
  const stats = [
    { label:"Total Revenue", value:`${rev.toLocaleString()} DA`, icon:"💰", color:"#E87722" },
    { label:"Total Orders",  value:ords.toLocaleString(),        icon:"🧾", color:"#2EA7F2" },
    { label:"Customers",     value:cus.toLocaleString(),         icon:"👥", color:"#F4C21F" },
    { label:"Live Stores",   value:live.toLocaleString(),        icon:"🟢", color:"#4ade80" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((s,i) => (
        <div key={s.label} className="relative overflow-hidden flex flex-col gap-2 p-5 rounded-2xl sp-anim"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.88)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
            boxShadow: isDark ? "none" : "0 1px 12px rgba(0,0,0,0.05)",
            animationDelay:`${i*80+80}ms`,
          }}>
          <div className="absolute top-3 right-3 text-base opacity-70">{s.icon}</div>
          <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl" style={{background:s.color}}/>
          <span className="font-black text-xl tabular-nums pl-3" style={{color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.value}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] pl-3" style={{color:tk.textMuted}}>{s.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ══════════ STORE CARD ══════════ */
const StoreCard = ({store, idx, theme, onManage, onRefresh}: {
  store:Store; idx:number; theme:Theme; onManage:(s:Store)=>void; onRefresh:()=>void;
}) => {
  const tk = TK[theme];
  const ac = store.accent_color || "#E87722";
  const isDark = theme === "dark";
  const [vis,  setVis]  = useState(false);
  const [hov,  setHov]  = useState(false);
  const [togg, setTogg] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rev  = useCountUp(store.total_revenue   || 0, idx*80);
  const ords = useCountUp(store.total_orders    || 0, idx*80+30);
  const cus  = useCountUp(store.total_customers || 0, idx*80+60);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), idx*110+50);
    return () => clearTimeout(t);
  }, [idx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || !cardRef.current) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    const rx = (y - 0.5) * 7;
    const ry = (x - 0.5) * -7;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.015)`;
  };
  const handleMouseLeave = () => {
    setHov(false);
    if (cardRef.current) cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
  };

  const toggleLive = async (e: React.MouseEvent) => {
    e.stopPropagation(); setTogg(true);
    await authFetch(`${API_URL}/stores/${store.id}/toggle_live/`, {method:"POST"});
    setTogg(false); onRefresh();
  };
  const handleDel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${store.name}"?`)) return;
    await authFetch(`${API_URL}/stores/${store.id}/`, {method:"DELETE"});
    onRefresh();
  };

  return (
    <div ref={cardRef}
      className="relative overflow-hidden flex flex-col cursor-pointer group"
      style={{
        borderRadius:24,
        background:tk.card,
        border:`1px solid ${hov ? ac+"55" : tk.border}`,
        transition:"border-color 0.4s, box-shadow 0.4s, opacity 0.5s",
        opacity: vis ? 1 : 0,
        boxShadow: hov
          ? `0 40px 80px -15px ${ac}35, 0 0 0 1px ${ac}22, inset 0 1px 0 ${ac}18`
          : isDark ? `0 2px 24px rgba(0,0,0,0.7)` : `0 2px 20px rgba(0,0,0,0.09)`,
        willChange:"transform",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => onManage(store)}
    >
      {/* shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{background:`linear-gradient(105deg,transparent 25%,${ac}0c 50%,transparent 75%)`}}/>

      {/* ── BANNER ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{height:220}}>
        <div className="absolute inset-0" style={{
          background: isDark
            ? `linear-gradient(150deg,${ac}30 0%,${ac}12 40%,#0c0c0c 100%)`
            : `linear-gradient(150deg,${ac}22 0%,${ac}0c 40%,#f0ede8 100%)`
        }}/>
        <div className="absolute inset-0 opacity-[0.055]" style={{backgroundImage:`radial-gradient(circle,${isDark?"white":"#333"} 1.5px,transparent 1.5px)`,backgroundSize:"20px 20px"}}/>
        {[55,90,125,160].map((r,i) => (
          <div key={i} className="absolute pointer-events-none" style={{top:-80,right:r,width:[2,1.5,1,0.5][i],height:500,background:`linear-gradient(to bottom,transparent,${ac}${["80","50","28","14"][i]},transparent)`,transform:"rotate(18deg)"}}/>
        ))}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span style={{fontSize:145,opacity:isDark?0.04:0.06,lineHeight:1,userSelect:"none",filter:"blur(1px)",transform:hov?"scale(1.08)":"scale(1)",transition:"transform 0.7s cubic-bezier(0.34,1.1,0.64,1)"}}>
            {nicheEmoji[store.niche]||"✨"}
          </span>
        </div>
        {/* controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={toggleLive} disabled={togg}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black text-[10px] cursor-pointer active:scale-90 transition-all"
            style={{background:store.is_live?"rgba(34,197,94,0.16)":tk.pillOff,border:`1px solid ${store.is_live?"rgba(34,197,94,0.5)":tk.pillOffBorder}`,color:store.is_live?"#4ade80":tk.pillOffText,backdropFilter:"blur(12px)",letterSpacing:"0.1em"}}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${store.is_live?"bg-green-400 animate-pulse":""}`} style={!store.is_live?{background:"currentColor",opacity:0.45}:{}}/>
            {store.is_live?"LIVE":"OFFLINE"}
          </button>
          <button onClick={handleDel}
            className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            style={{background:"rgba(239,68,68,0.18)",border:"1px solid rgba(239,68,68,0.4)",color:"#f87171",backdropFilter:"blur(8px)"}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
        {/* logo */}
        <div className="absolute bottom-0 left-6 translate-y-1/2 z-20">
          <div className="h-[62px] w-[62px] rounded-2xl overflow-hidden flex items-center justify-center text-2xl"
            style={{background:`linear-gradient(140deg,${ac},${ac}99)`,boxShadow:`0 8px 28px ${ac}55,inset 0 1px 0 rgba(255,255,255,0.3)`,border:`2.5px solid ${isDark?"#141414":"#ffffff"}`,transition:"transform 0.5s cubic-bezier(0.34,1.2,0.64,1)",transform:hov?"scale(1.1) rotate(-4deg)":"scale(1) rotate(0deg)"}}>
            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover"/> : nicheEmoji[store.niche]||"✨"}
          </div>
        </div>
        {/* niche tag */}
        <div className="absolute bottom-4 right-4 z-10">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider"
            style={{background:tk.tagBg,backdropFilter:"blur(10px)",color:tk.textSub,border:`1px solid ${tk.border}`,letterSpacing:"0.08em"}}>
            {nicheLabel[store.niche]||"General"}
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col flex-1 px-6 pt-10 pb-6 gap-4">
        <div>
          <h3 className="font-black text-xl leading-tight mb-1.5" style={{color:tk.text,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.02em",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
            {store.name}
          </h3>
          <p className="text-[11px] font-mono" style={{color:tk.textMuted}}>/store/{store.slug}</p>
        </div>
        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {label:"Revenue", value:`${rev.toLocaleString()} DA`},
            {label:"Orders",  value:ords.toLocaleString()},
            {label:"Clients", value:cus.toLocaleString()},
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-3 rounded-xl gap-1"
              style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`}}>
              <span className="font-black text-sm tabular-nums" style={{color:hov?ac:tk.text,transition:"color 0.3s",fontFamily:"'Syne',sans-serif"}}>{s.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{color:tk.textMuted}}>{s.label}</span>
            </div>
          ))}
        </div>
        {/* footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{borderColor:tk.divider}}>
          <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
            onClick={e=>e.stopPropagation()}
            className="text-xs font-bold transition-colors flex items-center gap-1.5" style={{color:tk.textMuted}}
            onMouseEnter={e=>(e.currentTarget.style.color=ac)} onMouseLeave={e=>(e.currentTarget.style.color=tk.textMuted)}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Preview
          </a>
          <div className="flex items-center gap-1.5 text-xs font-black" style={{color:hov?ac:tk.textMuted,transition:"color 0.3s"}}>
            Manage
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{transform:hov?"translateX(4px)":"translateX(0)",transition:"transform 0.3s"}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
      {/* bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-b-3xl transition-opacity duration-500"
        style={{background:`linear-gradient(to right,transparent,${ac},transparent)`,opacity:hov?1:0}}/>
    </div>
  );
};

/* ══════════ ADD STORE CARD ══════════ */
const AddStoreCard = ({theme,onClick}:{theme:Theme;onClick:()=>void}) => {
  const tk = TK[theme];
  const isDark = theme==="dark";
  const [hov,setHov]=useState(false);
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),60);return()=>clearTimeout(t);},[]);
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      style={{borderRadius:24,minHeight:340,border:`2px dashed ${hov?"#E87722":tk.border}`,background:hov?(isDark?"rgba(232,119,34,0.05)":"rgba(232,119,34,0.04)"):tk.empty,transition:"all 0.45s cubic-bezier(0.34,1.1,0.64,1)",opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.94)"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}>
      <div className="absolute pointer-events-none" style={{width:280,height:280,borderRadius:"50%",background:"#E87722",filter:"blur(80px)",opacity:hov?0.14:0,transition:"opacity 0.6s"}}/>
      <div className="relative flex flex-col items-center gap-5 text-center px-8">
        <div className="rounded-2xl flex items-center justify-center transition-all duration-500"
          style={{width:72,height:72,background:hov?"linear-gradient(135deg,#E87722,#F4C21F99)":(isDark?"rgba(232,119,34,0.1)":"rgba(232,119,34,0.12)"),boxShadow:hov?"0 14px 40px #E8772245":"none",transform:hov?"scale(1.12) rotate(10deg)":"scale(1) rotate(0deg)"}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={hov?"white":"#E87722"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div>
          <p className="font-black text-base mb-1.5" style={{color:hov?"#E87722":tk.textSub,fontFamily:"'Syne',sans-serif",transition:"color 0.3s"}}>Create New Store</p>
          <p className="text-xs leading-relaxed max-w-[180px]" style={{color:tk.textMuted}}>Launch your next storefront in minutes</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════ MAIN ══════════ */
export default function StoresPage({stores, onRefresh, onNewStore}: Props) {
  const [editStore, setEditStore] = useState<Store|null>(null);
  const [theme, setTheme]         = useState<Theme>("dark");
  const [search, setSearch]       = useState("");
  const tk = TK[theme];
  const isDark = theme==="dark";
  const filtered = stores.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.niche.toLowerCase().includes(search.toLowerCase()));

  if (editStore) return <StoreEditor store={editStore} onBack={()=>setEditStore(null)} onRefresh={onRefresh} theme={theme}/>;

  return (
    <div style={{minHeight:"100%",background:tk.page,transition:"background 0.4s ease"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .sp-anim{animation:fadeUp 0.55s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>

      {/* HEADER */}
      <div className="sp-anim flex flex-col gap-5 mb-8 p-7 rounded-[24px]"
        style={{background:isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.92)",border:`1px solid ${tk.border}`,backdropFilter:"blur(14px)",boxShadow:isDark?"none":"0 2px 20px rgba(0,0,0,0.07)"}}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-black text-3xl leading-none mb-2" style={{color:tk.text,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.03em"}}>My Stores</h1>
            <p className="text-sm" style={{color:tk.textMuted}}>{stores.length} store{stores.length!==1?"s":""} · {stores.filter(s=>s.is_live).length} live right now</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}
              className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90"
              style={{background:tk.btnBg,border:`1px solid ${tk.btnBorder}`,color:tk.btnColor}} title="Toggle theme">
              {isDark
                ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <button onClick={onNewStore}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
              style={{background:"linear-gradient(135deg,#E87722,#F4C21F99)",boxShadow:"0 4px 20px #E8772240"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Store
            </button>
          </div>
        </div>
        {stores.length > 2 && (
          <div className="relative max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:tk.textMuted}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stores..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}/>
          </div>
        )}
      </div>

      {stores.length > 0 && <SummaryBar stores={stores} theme={theme}/>}

      {stores.length === 0 ? (
        <div className="sp-anim flex flex-col items-center justify-center py-28 text-center rounded-[24px]"
          style={{background:isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.75)",border:`2px dashed ${tk.border}`}}>
          <div className="text-7xl mb-6" style={{opacity:0.3}}>🏪</div>
          <h3 className="font-black text-2xl mb-2" style={{color:tk.textMuted,fontFamily:"'Syne',sans-serif"}}>No stores yet</h3>
          <p className="text-sm mb-8" style={{color:tk.textMuted}}>Launch your first store and start selling today</p>
          <button onClick={onNewStore} className="px-8 py-3.5 rounded-xl font-black text-white cursor-pointer active:scale-95 transition-all"
            style={{background:"linear-gradient(135deg,#E87722,#F4C21F99)",boxShadow:"0 6px 24px #E8772240"}}>
            Create First Store ✦
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((store,idx) => (
            <StoreCard key={store.id} store={store} idx={idx} theme={theme} onManage={setEditStore} onRefresh={onRefresh}/>
          ))}
          <AddStoreCard theme={theme} onClick={onNewStore}/>
        </div>
      )}
    </div>
  );
}