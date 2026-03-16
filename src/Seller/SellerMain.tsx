import { useState, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import NavSeller from "./NavSeller";
import Sidebar, { menuItems } from "./Sidebar";
import Dashboard from "./Dashboard";
import StoresPage from "./StoresPage";
import PlanPickerModal from "./PlanPickerModal";
import CreateStoreModal from "./CreateStoreModal";
import StoreEditor from "./StoreEditor";
import { API_URL, authFetch, type Store, type Order, type Product, type DashboardStats } from "./sellerTypes";

// ── Inline tab pages (Orders / Products / Customers / Analytics / Settings) ──

const OrdersPage = ({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) => {
  const [updating, setUpdating]     = useState<number|null>(null);
  const [expandedOrder, setExpanded] = useState<number|null>(null);
  const [activeTab, setActiveTab]    = useState<"board"|"map">("board");
  const [hoveredWilaya, setHoveredWilaya] = useState<string|null>(null);

  const AC = "#E87722";
  const STATUS_CFG = {
    pending:    { label:"Pending",    color:"#f59e0b", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.28)", icon:"⏳" },
    processing: { label:"Processing", color:"#3b82f6", bg:"rgba(59,130,246,0.12)",  border:"rgba(59,130,246,0.28)",  icon:"⚡" },
    delivered:  { label:"Delivered",  color:"#22c55e", bg:"rgba(34,197,94,0.12)",   border:"rgba(34,197,94,0.28)",   icon:"✓"  },
    cancelled:  { label:"Cancelled",  color:"#ef4444", bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.28)",   icon:"✕"  },
  } as const;
  type StatusKey = keyof typeof STATUS_CFG;
  const cols: StatusKey[] = ["pending","processing","delivered","cancelled"];
  const grouped = cols.reduce((a,s)=>({...a,[s]:orders.filter(o=>o.status===s)}),{} as Record<StatusKey,typeof orders>);

  // Wilaya order counts
  const wilayaCounts = orders.reduce((acc,o)=>{ if(o.customer_wilaya){acc[o.customer_wilaya]=(acc[o.customer_wilaya]||0)+1;} return acc;},{} as Record<string,number>);
  const maxCount = Math.max(1,...Object.values(wilayaCounts));

  const updateStatus = async(id:number,status:string)=>{ setUpdating(id); await authFetch(`${API_URL}/orders/${id}/update_status/`,{method:"PATCH",body:JSON.stringify({status})}); setUpdating(null); onRefresh(); };
  const revenue = grouped.delivered.reduce((s,o)=>s+Number(o.total),0);
  const convRate = orders.length>0?Math.round((grouped.delivered.length/orders.length)*100):0;

  // Algeria wilaya SVG paths — scaled to 460×590 viewport (geographic approximation)
  const WILAYAS_SVG: {name:string;d:string;cx:number;cy:number}[] = [
    {name:"Adrar",        cx:185,cy:388,d:"M120,340 L260,340 L265,440 L115,440 Z"},
    {name:"Chlef",        cx:100,cy:92, d:"M80,82 L122,80 L126,108 L76,110 Z"},
    {name:"Laghouat",     cx:188,cy:205,d:"M155,182 L222,180 L228,232 L150,234 Z"},
    {name:"Oum El Bouaghi",cx:298,cy:105,d:"M272,90 L328,88 L332,124 L268,126 Z"},
    {name:"Batna",        cx:308,cy:128,d:"M280,112 L338,110 L342,150 L276,152 Z"},
    {name:"Béjaïa",       cx:264,cy:65, d:"M242,52 L288,50 L294,84 L238,86 Z"},
    {name:"Biskra",       cx:294,cy:182,d:"M264,162 L328,160 L332,208 L260,210 Z"},
    {name:"Béchar",       cx:88, cy:278,d:"M44,242 L136,240 L142,318 L38,320 Z"},
    {name:"Blida",        cx:175,cy:85, d:"M156,74 L196,72 L200,100 L152,102 Z"},
    {name:"Bouira",       cx:232,cy:88, d:"M212,76 L254,74 L258,106 L208,108 Z"},
    {name:"Tamanrasset",  cx:268,cy:494,d:"M200,448 L340,446 L346,548 L194,550 Z"},
    {name:"Tébessa",      cx:358,cy:128,d:"M330,110 L388,108 L392,150 L326,152 Z"},
    {name:"Tlemcen",      cx:42, cy:96, d:"M18,82 L68,80 L72,116 L14,118 Z"},
    {name:"Tiaret",       cx:130,cy:128,d:"M104,112 L158,110 L162,150 L100,152 Z"},
    {name:"Tizi Ouzou",   cx:240,cy:70, d:"M218,56 L264,54 L268,88 L214,90 Z"},
    {name:"Alger",        cx:208,cy:66, d:"M190,52 L228,50 L232,84 L186,86 Z"},
    {name:"Djelfa",       cx:198,cy:165,d:"M164,148 L234,146 L238,188 L160,190 Z"},
    {name:"Jijel",        cx:290,cy:60, d:"M268,46 L314,44 L318,78 L264,80 Z"},
    {name:"Sétif",        cx:278,cy:98, d:"M252,82 L306,80 L310,118 L248,120 Z"},
    {name:"Saïda",        cx:84, cy:140,d:"M60,126 L110,124 L114,158 L56,160 Z"},
    {name:"Skikda",       cx:324,cy:65, d:"M302,50 L348,48 L352,84 L298,86 Z"},
    {name:"Sidi Bel Abbès",cx:62,cy:120,d:"M38,106 L88,104 L92,138 L34,140 Z"},
    {name:"Annaba",       cx:358,cy:66, d:"M336,50 L382,48 L386,86 L332,88 Z"},
    {name:"Guelma",       cx:340,cy:92, d:"M318,78 L364,76 L368,112 L314,114 Z"},
    {name:"Constantine",  cx:318,cy:88, d:"M296,72 L342,70 L346,108 L292,110 Z"},
    {name:"Médéa",        cx:185,cy:120,d:"M160,106 L212,104 L216,138 L156,140 Z"},
    {name:"Mostaganem",   cx:76, cy:85, d:"M54,72 L100,70 L104,104 L50,106 Z"},
    {name:"M'Sila",       cx:248,cy:148,d:"M220,132 L278,130 L282,170 L216,172 Z"},
    {name:"Mascara",      cx:96, cy:118,d:"M72,104 L122,102 L126,136 L68,138 Z"},
    {name:"Ouargla",      cx:308,cy:255,d:"M272,228 L348,226 L354,286 L266,288 Z"},
    {name:"Oran",         cx:54, cy:72, d:"M30,58 L80,56 L84,92 L26,94 Z"},
    {name:"El Bayadh",    cx:118,cy:192,d:"M88,170 L152,168 L156,218 L84,220 Z"},
    {name:"Illizi",       cx:386,cy:358,d:"M344,318 L432,316 L438,402 L338,404 Z"},
    {name:"Bordj Bou Arréridj",cx:258,cy:118,d:"M236,104 L282,102 L286,136 L232,138 Z"},
    {name:"Boumerdès",    cx:220,cy:70, d:"M200,56 L242,54 L246,88 L196,90 Z"},
    {name:"El Tarf",      cx:378,cy:86, d:"M356,72 L402,70 L406,106 L352,108 Z"},
    {name:"Tindouf",      cx:56, cy:360,d:"M14,320 L102,318 L108,404 L8,406 Z"},
    {name:"Tissemsilt",   cx:114,cy:110,d:"M92,96 L138,94 L142,128 L88,130 Z"},
    {name:"El Oued",      cx:338,cy:214,d:"M308,192 L372,190 L378,240 L302,242 Z"},
    {name:"Khenchela",    cx:338,cy:152,d:"M312,136 L366,134 L370,172 L308,174 Z"},
    {name:"Souk Ahras",   cx:360,cy:108,d:"M336,94 L386,92 L390,126 L332,128 Z"},
    {name:"Tipaza",       cx:148,cy:76, d:"M126,62 L172,60 L176,96 L122,98 Z"},
    {name:"Mila",         cx:306,cy:102,d:"M282,88 L332,86 L336,120 L278,122 Z"},
    {name:"Aïn Defla",    cx:142,cy:102,d:"M118,88 L168,86 L172,120 L114,122 Z"},
    {name:"Naâma",        cx:64, cy:172,d:"M38,156 L92,154 L96,194 L34,196 Z"},
    {name:"Aïn Témouchent",cx:44,cy:76, d:"M20,62 L70,60 L74,96 L16,98 Z"},
    {name:"Ghardaïa",     cx:234,cy:248,d:"M204,226 L266,224 L272,274 L198,276 Z"},
    {name:"Relizane",     cx:108,cy:102,d:"M84,88 L134,86 L138,120 L80,122 Z"},
    {name:"Timimoun",     cx:154,cy:312,d:"M122,284 L188,282 L194,344 L116,346 Z"},
    {name:"Bordj Badji Mokhtar",cx:194,cy:462,d:"M154,434 L236,432 L242,494 L148,496 Z"},
    {name:"Ouled Djellal", cx:268,cy:202,d:"M244,184 L296,182 L300,224 L240,226 Z"},
    {name:"Beni Abbès",   cx:88, cy:316,d:"M58,288 L120,286 L126,348 L52,350 Z"},
    {name:"In Salah",     cx:236,cy:398,d:"M202,368 L272,366 L278,432 L196,434 Z"},
    {name:"In Guezzam",   cx:254,cy:540,d:"M218,510 L292,508 L298,574 L212,576 Z"},
    {name:"Touggourt",    cx:320,cy:230,d:"M292,208 L352,206 L358,256 L286,258 Z"},
    {name:"Djanet",       cx:398,cy:432,d:"M364,400 L436,398 L442,468 L358,470 Z"},
    {name:"El M'Ghair",   cx:346,cy:193,d:"M320,176 L374,174 L378,214 L316,216 Z"},
    {name:"El Meniaa",    cx:218,cy:306,d:"M188,278 L250,276 L256,338 L182,340 Z"},
  ];

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes drawerSlide{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
        @keyframes scrimIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
        .ord-card{transition:all .25s cubic-bezier(.34,1.1,.64,1)}
        .ord-card:hover{transform:translateY(-3px)}
        .ord-drawer-anim{animation:drawerSlide .38s cubic-bezier(.34,1.1,.64,1) both}
        .ord-scrim-anim{animation:scrimIn .22s ease both}
        .wilaya-path{transition:all .2s ease;cursor:pointer}
        .wilaya-path:hover{filter:brightness(1.3)}
        .stat-pop{animation:popIn .45s cubic-bezier(.34,1.1,.64,1) both}
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>Order Management</h2>
          <p className="text-gray-400 text-sm mt-0.5">{orders.length} orders · {convRate}% delivery rate · {revenue.toLocaleString()} DA earned</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-100 border border-gray-200">
          {([["board","📋 Board"],["map","🗺️ Map"]] as const).map(([v,l])=>(
            <button key={v} onClick={()=>setActiveTab(v)}
              className="px-4 py-2 rounded-xl text-sm font-black cursor-pointer transition-all"
              style={{background:activeTab===v?"white":"transparent",color:activeTab===v?"#E87722":"#888",boxShadow:activeTab===v?"0 2px 8px rgba(0,0,0,0.08)":"none"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cols.map((s,i)=>{
          const cfg=STATUS_CFG[s]; const cnt=grouped[s].length;
          const rev=grouped[s].reduce((sum,o)=>sum+Number(o.total),0);
          return(
            <div key={s} className="stat-pop rounded-2xl p-4" style={{animationDelay:`${i*70}ms`,background:cfg.bg,border:`1px solid ${cfg.border}`}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{cfg.icon}</span>
                <span className="text-[9px] font-black tracking-[.18em] uppercase" style={{color:cfg.color}}>{cfg.label}</span>
              </div>
              <p className="text-3xl font-black" style={{color:cfg.color,fontFamily:"'Syne',sans-serif"}}>{cnt}</p>
              <p className="text-[10px] mt-0.5" style={{color:cfg.color,opacity:.65}}>{rev.toLocaleString()} DA</p>
            </div>
          );
        })}
      </div>

      {orders.length===0?(
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border-2 border-dashed border-gray-100 gap-4">
          <span className="text-6xl opacity-20">🧾</span>
          <p className="text-gray-400 font-black text-lg">No orders yet</p>
          <p className="text-gray-300 text-sm">Orders from all your stores will appear here</p>
        </div>
      ) : activeTab==="board" ? (

        /* ════ KANBAN BOARD ════ */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {cols.map(status=>{
            const cfg=STATUS_CFG[status];
            const colOrders=grouped[status];
            return(
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full" style={{background:cfg.color,boxShadow:`0 0 6px ${cfg.color}`}}/>
                  <span className="text-xs font-black tracking-[.15em] uppercase" style={{color:cfg.color}}>{cfg.label}</span>
                  <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{colOrders.length}</span>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {colOrders.length===0?(
                    <div className="py-8 flex flex-col items-center gap-2 rounded-2xl" style={{background:"rgba(0,0,0,0.02)",border:`1.5px dashed ${cfg.border}`}}>
                      <span style={{fontSize:22,opacity:.3}}>{cfg.icon}</span>
                      <span className="text-[10px] text-gray-400">No {cfg.label.toLowerCase()}</span>
                    </div>
                  ):colOrders.map((order,i)=>(
                    <div key={order.id} className="ord-card bg-white rounded-2xl overflow-hidden cursor-pointer border"
                      style={{borderColor:"#f0f0f0",animation:`slideUp .4s cubic-bezier(.34,1.1,.64,1) ${i*55}ms both`,boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}
                      onClick={()=>setExpanded(expandedOrder===order.id?null:order.id)}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=cfg.color+"55";el.style.boxShadow=`0 10px 32px -6px ${cfg.color}22`;}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="#f0f0f0";el.style.boxShadow="0 2px 12px rgba(0,0,0,0.05)";}}>
                      <div className="h-[3px]" style={{background:`linear-gradient(to right,${cfg.color},${cfg.color}50)`}}/>
                      <div className="p-4 flex flex-col gap-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] font-black tracking-[.15em] uppercase" style={{color:cfg.color}}>#{order.id}</span>
                            <p className="font-black text-sm text-gray-900 leading-tight mt-0.5" style={{fontFamily:"'Syne',sans-serif"}}>
                              {order.customer_name} {order.customer_family_name||""}
                            </p>
                          </div>
                          <span className="font-black text-sm shrink-0" style={{color:AC}}>{Number(order.total).toLocaleString()} <span className="text-[9px] text-gray-400 font-normal">DA</span></span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {order.customer_phone&&<span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.91 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            {order.customer_phone}
                          </span>}
                          {order.customer_wilaya&&<span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {order.customer_wilaya}{order.customer_city?`, ${order.customer_city}`:""}
                          </span>}
                        </div>
                        {order.items&&order.items.length>0&&(
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {order.items.slice(0,2).map(item=>(
                              <span key={item.id} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 truncate max-w-[120px]">
                                {item.product_name} <span style={{color:AC}}>×{item.quantity}</span>
                              </span>
                            ))}
                            {order.items.length>2&&<span className="text-[10px] text-gray-400">+{order.items.length-2}</span>}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-[10px] text-gray-300">{order.created_at?new Date(order.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span>
                          <span className="text-[10px] font-bold" style={{color:cfg.color}}>Details →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ════ ALGERIA MAP ════ */
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden" style={{boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
            {/* Map header */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="font-black text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>Algeria — Orders by Wilaya</p>
                <p className="text-xs text-gray-400 mt-0.5">{Object.keys(wilayaCounts).length} wilayas with orders · click a wilaya for details</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-8 rounded-full" style={{background:`linear-gradient(to right,${AC}25,${AC})`}}/>
                  <span>Low → High</span>
                </div>
              </div>
            </div>

            {/* SVG Map */}
            <div className="p-4" style={{background:"#f8f8f4"}}>
              <svg viewBox="0 0 460 590" style={{width:"100%",maxHeight:520}} xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect x="0" y="0" width="460" height="590" fill="#eee8de" rx="12"/>
                {/* Border outline hint */}
                <text x="230" y="575" textAnchor="middle" fontSize="8" fill="#ccc" fontFamily="sans-serif">Algeria · 58 Wilayas</text>

                {WILAYAS_SVG.map(w=>{
                  const cnt = wilayaCounts[w.name]||0;
                  const intensity = cnt>0 ? 0.25 + (cnt/maxCount)*0.75 : 0;
                  const fill = cnt>0
                    ? `rgba(232,119,34,${intensity})`
                    : "#e0d8cc";
                  const isHov = hoveredWilaya===w.name;
                  return(
                    <g key={w.name}
                      onMouseEnter={()=>setHoveredWilaya(w.name)}
                      onMouseLeave={()=>setHoveredWilaya(null)}>
                      <path d={w.d} className="wilaya-path"
                        fill={isHov?AC:fill}
                        stroke="white"
                        strokeWidth={isHov?"1.5":"0.8"}
                        style={{filter:isHov?`drop-shadow(0 2px 6px ${AC}60)`:cnt>0?"drop-shadow(0 1px 3px rgba(232,119,34,0.2))":undefined}}
                      />
                      {cnt>0&&(
                        <text x={w.cx} y={w.cy+1} textAnchor="middle" fontSize="7" fill={intensity>0.55?"white":"#c05010"} fontWeight="bold" fontFamily="sans-serif" style={{pointerEvents:"none"}}>{cnt}</text>
                      )}
                    </g>
                  );
                })}

                {/* Tooltip on hover */}
                {hoveredWilaya&&(()=>{
                  const w=WILAYAS_SVG.find(x=>x.name===hoveredWilaya);
                  if(!w)return null;
                  const cnt=wilayaCounts[w.name]||0;
                  const wx=w.cx+20; const wy=Math.max(20,w.cy-10);
                  return(
                    <g>
                      <rect x={wx} y={wy-16} width={cnt>0?100:90} height={cnt>0?32:24} rx="5" fill="white"
                        style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.15))"}}/>
                      <rect x={wx} y={wy-16} width="3" height={cnt>0?32:24} rx="2" fill={cnt>0?AC:"#ccc"}/>
                      <text x={wx+8} y={wy-2} fontSize="7.5" fontWeight="bold" fill="#333" fontFamily="sans-serif">{w.name}</text>
                      {cnt>0&&<text x={wx+8} y={wy+11} fontSize="7" fill={AC} fontFamily="sans-serif" fontWeight="bold">{cnt} order{cnt!==1?"s":""}</text>}
                      {cnt===0&&<text x={wx+8} y={wy+10} fontSize="6.5" fill="#aaa" fontFamily="sans-serif">No orders</text>}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Wilaya leaderboard */}
          {Object.keys(wilayaCounts).length>0&&(
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden" style={{boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
              <div className="px-6 py-4 border-b border-gray-50">
                <p className="font-black text-gray-900" style={{fontFamily:"'Syne',sans-serif"}}>Top Wilayas by Orders</p>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(wilayaCounts).sort((a,b)=>b[1]-a[1]).map(([name,cnt],i)=>{
                  const pct=Math.round((cnt/maxCount)*100);
                  return(
                    <div key={name} className="flex items-center gap-3 p-3 rounded-2xl transition-all cursor-default"
                      style={{background:i<3?"rgba(232,119,34,0.06)":"rgba(0,0,0,0.02)",border:i<3?"1px solid rgba(232,119,34,0.2)":"1px solid transparent"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(232,119,34,0.08)")}
                      onMouseLeave={e=>(e.currentTarget.style.background=i<3?"rgba(232,119,34,0.06)":"rgba(0,0,0,0.02)")}>
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{background:i<3?"linear-gradient(135deg,#E87722,#F4C21F)":"#f0f0f0",color:i<3?"white":"#888"}}>
                        {i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-gray-900 truncate">{name}</span>
                          <span className="text-xs font-black ml-2 flex-shrink-0" style={{color:AC}}>{cnt}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:`linear-gradient(to right,#E87722,#F4C21F)`}}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ ORDER DETAIL DRAWER ════ */}
      {expandedOrder!==null&&(()=>{
        const order=orders.find(o=>o.id===expandedOrder);
        if(!order)return null;
        const cfg=STATUS_CFG[(order.status as StatusKey)]||STATUS_CFG.pending;
        return(
          <>
            <div className="ord-scrim-anim fixed inset-0 z-[300]" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}} onClick={()=>setExpanded(null)}/>
            <div className="ord-drawer-anim fixed top-0 right-0 bottom-0 z-[301] w-full max-w-md bg-white overflow-y-auto"
              style={{borderLeft:"1px solid #f0f0f0",boxShadow:"-20px 0 60px rgba(0,0,0,0.12)"}}>
              <div className="h-[3px]" style={{background:`linear-gradient(to right,${cfg.color},${cfg.color}40,transparent)`}}/>
              <div className="p-6 flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black tracking-[.15em] uppercase" style={{color:cfg.color}}>Order #{order.id}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{background:cfg.bg,border:`1px solid ${cfg.border}`,color:cfg.color}}>{cfg.icon} {cfg.label}</span>
                    </div>
                    <h2 className="font-black text-2xl text-gray-900 leading-tight" style={{fontFamily:"'Syne',sans-serif"}}>
                      {order.customer_name} {order.customer_family_name||""}
                    </h2>
                    {order.created_at&&<p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>}
                  </div>
                  <button onClick={()=>setExpanded(null)} className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-700 transition-colors font-black flex-shrink-0">✕</button>
                </div>

                {/* Client info */}
                <div className="rounded-2xl p-4 flex flex-col gap-3" style={{background:"#fafafa",border:"1px solid #f0f0f0"}}>
                  <p className="text-[9px] font-black tracking-[.22em] uppercase mb-1" style={{color:cfg.color}}>Customer Info</p>
                  {[
                    {icon:"👤",label:"Full Name",   val:`${order.customer_name} ${order.customer_family_name||""}`},
                    {icon:"📞",label:"Phone",       val:order.customer_phone},
                    {icon:"✉️",label:"Email",       val:order.customer_email},
                    {icon:"🗺️",label:"Wilaya",      val:order.customer_wilaya},
                    {icon:"🏙️",label:"City",        val:order.customer_city},
                    {icon:"🏠",label:"Address",     val:order.customer_address},
                  ].filter(r=>r.val).map(row=>(
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{background:cfg.bg}}>{row.icon}</div>
                      <div>
                        <p className="text-[9px] font-black tracking-[.15em] uppercase text-gray-300">{row.label}</p>
                        <p className="text-sm font-bold text-gray-800">{row.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {order.items&&order.items.length>0&&(
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black tracking-[.22em] uppercase" style={{color:cfg.color}}>Order Items</p>
                    {order.items.map(item=>(
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:"#fafafa",border:"1px solid #f0f0f0"}}>
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{background:"#fff5ec",border:"1px solid #fde0c7"}}>📦</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{item.product_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {item.selected_size&&<span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{background:"#fff5ec",color:AC}}>Size: {item.selected_size}</span>}
                            {item.selected_color&&<span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-gray-100 text-gray-600">Color: {item.selected_color}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black" style={{color:AC}}>×{item.quantity}</p>
                          <p className="text-[10px] text-gray-400">{(Number(item.unit_price||0)*item.quantity).toLocaleString()} DA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{background:cfg.bg,border:`1px solid ${cfg.border}`}}>
                  <span className="font-black text-gray-900">Order Total</span>
                  <div>
                    <span className="font-black text-3xl" style={{color:cfg.color,fontFamily:"'Syne',sans-serif"}}>{Number(order.total).toLocaleString()}</span>
                    <span className="text-sm ml-1 text-gray-400 font-bold">DA</span>
                  </div>
                </div>

                {/* Notes */}
                {order.notes&&(
                  <div className="p-4 rounded-2xl" style={{background:"#fafafa",border:"1px solid #f0f0f0"}}>
                    <p className="text-[9px] font-black tracking-[.22em] uppercase mb-2" style={{color:cfg.color}}>Customer Note</p>
                    <p className="text-sm leading-relaxed italic text-gray-500">"{order.notes}"</p>
                  </div>
                )}

                {/* Status updater */}
                <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                  <p className="text-[9px] font-black tracking-[.22em] uppercase text-gray-300">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(cols).map(s=>{
                      const c=STATUS_CFG[s]; const isCur=order.status===s;
                      return(
                        <button key={s} disabled={updating===order.id}
                          onClick={()=>{ updateStatus(order.id,s); setExpanded(null); }}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                          style={{background:isCur?c.bg:"#fafafa",border:`1.5px solid ${isCur?c.color:"#f0f0f0"}`,color:isCur?c.color:"#888",boxShadow:isCur?`0 4px 12px ${c.color}22`:undefined}}>
                          <span>{c.icon}</span><span>{c.label}</span>{isCur&&<span className="ml-auto">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};


const ProductsPage = ({ stores }: { stores: Store[] }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selectedStore, setSelectedStore] = useState<number | "all">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = selectedStore === "all" ? `${API_URL}/products/` : `${API_URL}/products/?store=${selectedStore}`;
        const res = await authFetch(url);
        if (res.ok) { const d = await res.json(); setProducts(d.results ?? d); }
      } finally { setLoading(false); }
    })();
  }, [selectedStore]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Products</h2>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} products</p>
        </div>
        <select
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E87722] cursor-pointer bg-white"
        >
          <option value="all">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <div className="h-6 w-6 border-2 border-t-[#E87722] border-gray-200 rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 gap-4">
          <span className="text-5xl opacity-20">📦</span>
          <p className="text-gray-400 font-black">No products found</p>
          <p className="text-gray-300 text-sm">Go to a store to add products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-44 overflow-hidden bg-gray-50">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-black ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.is_active ? "● Live" : "○ Off"}
                </div>
                {p.stock <= 5 && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-700">⚠ {p.stock} left</div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-black text-gray-900 text-sm">{p.name}</h4>
                  <span className="font-black text-[#E87722] text-sm shrink-0">{Number(p.price).toLocaleString()} DA</span>
                </div>
                {p.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{p.description}</p>}
                <p className="text-gray-400 text-xs mt-2 font-semibold">{p.stock} in stock</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomersPage = ({ orders }: { orders: Order[] }) => {
  // derive customers from orders
  const customerMap: Record<string, { name:string; email:string; phone:string; orders:number; spent:number; last:string }> = {};
  orders.forEach(o => {
    if (!customerMap[o.customer_email]) {
      customerMap[o.customer_email] = { name: o.customer_name, email: o.customer_email, phone: o.customer_phone || "—", orders: 0, spent: 0, last: o.created_at };
    }
    customerMap[o.customer_email].orders++;
    customerMap[o.customer_email].spent += Number(o.total);
    if (o.created_at > customerMap[o.customer_email].last) customerMap[o.customer_email].last = o.created_at;
  });
  const customers = Object.values(customerMap).sort((a,b) => b.spent - a.spent);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Customers</h2>
        <p className="text-gray-400 text-sm mt-0.5">{customers.length} unique customers</p>
      </div>
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 gap-4">
          <span className="text-5xl opacity-20">👥</span>
          <p className="text-gray-400 font-black">No customers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns:"1fr 1fr 80px 100px 100px" }}>
            {["Customer","Contact","Orders","Spent","Last Order"].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</span>
            ))}
          </div>
          {customers.map((c, i) => (
            <div key={c.email} className="grid gap-4 px-6 py-4 items-center hover:bg-orange-50/30 transition-colors" style={{ gridTemplateColumns:"1fr 1fr 80px 100px 100px", borderBottom: i < customers.length-1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0" style={{ background:"linear-gradient(135deg,#E87722,#F4C21F)" }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-gray-800 text-sm truncate">{c.name}</span>
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs truncate">{c.email}</p>
                <p className="text-gray-400 text-xs">{c.phone}</p>
              </div>
              <span className="font-black text-gray-800 text-sm">{c.orders}</span>
              <span className="font-black text-[#E87722] text-sm">{c.spent.toLocaleString()} DA</span>
              <span className="text-gray-400 text-xs">{new Date(c.last).toLocaleDateString("fr-DZ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnalyticsPage = ({ orders, stores }: { orders: Order[]; stores: Store[] }) => {
  const revenue   = orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+Number(o.total),0);
  const byStatus  = ["pending","processing","delivered","cancelled"].map(s=>({ label:s, count: orders.filter(o=>o.status===s).length }));
  const byMonth: Record<string,number> = {};
  orders.forEach(o => {
    const m = new Date(o.created_at).toLocaleDateString("en",{month:"short",year:"2-digit"});
    byMonth[m] = (byMonth[m]||0) + Number(o.total);
  });
  const months = Object.entries(byMonth).slice(-6);
  const maxVal  = Math.max(...months.map(([,v])=>v), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Analytics</h2>
        <p className="text-gray-400 text-sm mt-0.5">Performance overview across all stores</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Revenue",   value:`${revenue.toLocaleString()} DA`, icon:"💰", color:"#E87722" },
          { label:"Total Orders",    value:String(orders.length),            icon:"🧾", color:"#2EA7F2" },
          { label:"Delivered",       value:String(orders.filter(o=>o.status==="delivered").length), icon:"✅", color:"#22c55e" },
          { label:"Pending",         value:String(orders.filter(o=>o.status==="pending").length),   icon:"⏳", color:"#f59e0b" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-black text-2xl text-gray-900" style={{ color: s.color }}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {months.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-black text-gray-800 mb-6">Revenue by Month</h3>
          <div className="flex items-end gap-3 h-40">
            {months.map(([month, val]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400">{(val/1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-xl transition-all duration-700" style={{ height:`${(val/maxVal)*100}%`, background:"linear-gradient(to top,#E87722,#F4C21F)", minHeight:4 }} />
                <span className="text-[10px] text-gray-400">{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {byStatus.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0" style={{ background:"#E8772210" }}>
              {s.label==="delivered"?"✅":s.label==="pending"?"⏳":s.label==="processing"?"⚙️":"❌"}
            </div>
            <div>
              <p className="font-black text-gray-900 text-xl">{s.count}</p>
              <p className="text-gray-400 text-xs capitalize">{s.label} orders</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm]     = useState({ username: user.username||"", email: user.email||"" });
  const [pwForm, setPwForm] = useState({ old_password:"", new_password:"", confirm:"" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const saveProfile = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await authFetch(`${API_URL}/auth/me/`, { method:"PATCH", body: JSON.stringify(form) });
      if (res.ok) { const d = await res.json(); localStorage.setItem("user", JSON.stringify(d)); setMsg("Profile updated!"); }
      else setMsg("Failed to update profile.");
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm) { setMsg("Passwords don't match."); return; }
    setSaving(true); setMsg("");
    try {
      const res = await authFetch(`${API_URL}/auth/change_password/`, { method:"POST", body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password }) });
      if (res.ok) { setMsg("Password changed!"); setPwForm({ old_password:"", new_password:"", confirm:"" }); }
      else setMsg("Failed to change password.");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#E87722] transition-all";

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Settings</h2>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account</p>
      </div>
      {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${msg.includes("!") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{msg}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        <h3 className="font-black text-gray-800">Profile</h3>
        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Username</label>
          <input className={inputCls} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} />
        </div>
        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">Email</label>
          <input className={inputCls} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
        </div>
        <button onClick={saveProfile} disabled={saving} className="px-6 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all disabled:opacity-50 shadow-lg w-fit" style={{ background:"linear-gradient(135deg,#E87722,#F4C21F)" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        <h3 className="font-black text-gray-800">Change Password</h3>
        {["old_password","new_password","confirm"].map(k => (
          <div key={k}>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1.5">{k.replace(/_/g," ")}</label>
            <input type="password" className={inputCls} value={(pwForm as any)[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))} placeholder="••••••••" />
          </div>
        ))}
        <button onClick={changePassword} disabled={saving} className="px-6 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all disabled:opacity-50 shadow-lg w-fit" style={{ background:"linear-gradient(135deg,#E87722,#F4C21F)" }}>
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────
const SellerMain = () => {
  const [activeMenu,      setActiveMenu]      = useState("dashboard");
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [stores,          setStores]          = useState<Store[]>([]);
  const [orders,          setOrders]          = useState<Order[]>([]);
  const [dashStats,       setDashStats]       = useState<DashboardStats | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [showPlanPicker,  setShowPlanPicker]  = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [selectedPlan,    setSelectedPlan]    = useState("");
  const [isDark,          setIsDark]          = useState(true);

  const fetchData = async () => {
    try {
      const [storesRes, ordersRes] = await Promise.all([
        authFetch(`${API_URL}/stores/`),
        authFetch(`${API_URL}/orders/`),
      ]);
      const storesData: Store[] = await storesRes.json().then((d: any) => d.results ?? d);
      const ordersData: Order[] = await ordersRes.json().then((d: any) => d.results ?? d);
      setStores(storesData);
      setOrders(ordersData);
      setDashStats({
        total_revenue:   ordersData.filter(o=>o.status==="delivered").reduce((s,o)=>s+Number(o.total),0),
        total_orders:    ordersData.length,
        total_customers: new Set(ordersData.map((o:any)=>o.customer_email)).size,
        pending:         ordersData.filter(o=>o.status==="pending").length,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleNewStore   = () => setShowPlanPicker(true);
  const handlePlanSelect = (plan: string) => { setSelectedPlan(plan); setShowPlanPicker(false); setShowCreateStore(true); };

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="h-6 w-6 border-2 border-t-[#E87722] border-gray-200 rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading your data...</span>
      </div>
    );
    switch (activeMenu) {
      case "dashboard":  return <Dashboard stats={dashStats} orders={orders} storeName={stores[0]?.name ?? ""} />;
      case "stores":     return <StoresPage stores={stores} onRefresh={fetchData} onNewStore={handleNewStore} isDark={isDark} />;
      case "orders":     return <OrdersPage orders={orders} onRefresh={fetchData} />;
      case "products":   return <ProductsPage stores={stores} />;
      case "customers":  return <CustomersPage orders={orders} />;
      case "analytics":  return <AnalyticsPage orders={orders} stores={stores} />;
      case "settings":   return <SettingsPage />;
      default:           return <Dashboard stats={dashStats} orders={orders} storeName={stores[0]?.name ?? ""} />;
    }
  };

  const tc  = isDark ? "rgba(255,255,255,0.6)"  : "rgba(0,0,0,0.5)";
  const tc2 = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? "#080808" : "#f5f5f3", transition: "background 0.4s ease" }}>
      <NavSeller isDark={isDark} onToggleDark={() => setIsDark(d => !d)} />
      {showPlanPicker  && <PlanPickerModal  onSelect={handlePlanSelect}  onClose={()=>setShowPlanPicker(false)} />}
      {showCreateStore && <CreateStoreModal plan={selectedPlan} onCreated={fetchData} onClose={()=>setShowCreateStore(false)} />}

      <div className="flex flex-1 pt-[72px]">
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={()=>setSidebarOpen(false)} />}
        <Sidebar activeMenu={activeMenu} sidebarOpen={sidebarOpen} stores={stores} dashStats={dashStats} onMenuClick={id=>{setActiveMenu(id);setSidebarOpen(false);}} onNewStore={handleNewStore} isDark={isDark} />
        <main className="flex-1 lg:ml-64 p-6 md:p-8 min-h-screen">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <button onClick={()=>setSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-sm font-semibold transition-all"
              style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",border:`1px solid ${tc2}`,color:tc}}>
              <HiMenu className="h-5 w-5" /> Menu
            </button>
          </div>
          <div className="fixed inset-0 opacity-[0.018] pointer-events-none z-0"
            style={{ backgroundImage:`radial-gradient(circle, ${isDark?"white":"#333"} 1px, transparent 1px)`, backgroundSize:"28px 28px" }} />
          <div className="relative z-10">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default SellerMain;