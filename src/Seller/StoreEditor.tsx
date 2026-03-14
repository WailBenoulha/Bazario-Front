import { useState, useEffect } from "react";
import { type Store, type Product, type Order, API_URL, authFetch } from "./sellerTypes";

type Theme = "light" | "dark";

const TK = {
  dark: {
    bg:"#0c0c0c", panel:"#141414", panelHov:"#191919",
    border:"rgba(255,255,255,0.07)", borderHov:"rgba(255,255,255,0.18)",
    text:"#f8f8f8", textSub:"rgba(255,255,255,0.6)", textMuted:"rgba(255,255,255,0.3)",
    inputBg:"rgba(255,255,255,0.06)", inputBorder:"rgba(255,255,255,0.11)",
    divider:"rgba(255,255,255,0.06)",
    chip:"rgba(255,255,255,0.07)", chipBorder:"rgba(255,255,255,0.1)",
    statBg:"rgba(255,255,255,0.04)", statBorder:"rgba(255,255,255,0.08)",
    tabBg:"rgba(255,255,255,0.04)",
    shadow:"rgba(0,0,0,0.8)",
    heroBottom: "#141414",
  },
  light: {
    bg:"#ede9e3", panel:"#ffffff", panelHov:"#fafaf8",
    border:"rgba(0,0,0,0.07)", borderHov:"rgba(0,0,0,0.2)",
    text:"#111111", textSub:"#3d3d3d", textMuted:"#999999",
    inputBg:"rgba(0,0,0,0.035)", inputBorder:"rgba(0,0,0,0.1)",
    divider:"rgba(0,0,0,0.07)",
    chip:"rgba(0,0,0,0.04)", chipBorder:"rgba(0,0,0,0.09)",
    statBg:"rgba(0,0,0,0.025)", statBorder:"rgba(0,0,0,0.07)",
    tabBg:"rgba(0,0,0,0.03)",
    shadow:"rgba(0,0,0,0.1)",
    heroBottom: "#ffffff",
  },
};

const STATUS_COLORS: Record<string,{bg:string;text:string;border:string}> = {
  pending:    {bg:"rgba(245,158,11,0.13)",  text:"#f59e0b", border:"rgba(245,158,11,0.35)"},
  processing: {bg:"rgba(59,130,246,0.13)",  text:"#3b82f6", border:"rgba(59,130,246,0.35)"},
  delivered:  {bg:"rgba(34,197,94,0.13)",   text:"#22c55e", border:"rgba(34,197,94,0.35)"},
  cancelled:  {bg:"rgba(239,68,68,0.13)",   text:"#ef4444", border:"rgba(239,68,68,0.35)"},
};

const nicheEmoji: Record<string,string> = {fashion:"👗",electronics:"⚡",cosmetics:"💄",food:"🍽️",accessories:"💍",sports:"🏆",education:"📚",other:"✨"};

function useCountUp(target:number) {
  const [v,setV]=useState(0);
  useEffect(()=>{
    if(!target){setV(0);return;}
    let c=0; const s=Math.max(1,target/45);
    const t=setInterval(()=>{c=Math.min(c+s,target);setV(Math.round(c));if(c>=target)clearInterval(t);},14);
    return()=>clearInterval(t);
  },[target]);
  return v;
}

/* ══════════════════════════════
   PRODUCT MODAL
══════════════════════════════ */
const ProductModal = ({
  product, storeId, theme, ac, onClose, onSaved
}: {
  product:Product|null; storeId:number; theme:Theme; ac:string; onClose:()=>void; onSaved:()=>void;
}) => {
  const tk=TK[theme];
  const isDark=theme==="dark";
  const [form,setForm]=useState({name:"",description:"",price:"",stock:"",is_active:true,image:null as File|null});
  const [preview,setPreview]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [focused,setFocused]=useState("");

  useEffect(()=>{
    if(product){setForm({name:product.name,description:product.description||"",price:String(product.price),stock:String(product.stock),is_active:product.is_active,image:null});setPreview(product.image_url||null);}
  },[product]);

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setForm(v=>({...v,image:f}));
    const r=new FileReader();r.onload=ev=>setPreview(ev.target?.result as string);r.readAsDataURL(f);
  };

  const handleSave=async()=>{
    if(!form.name||!form.price){setErrors({general:"Name and price are required"});return;}
    setLoading(true);setErrors({});
    try{
      const fd=new FormData();
      fd.append("name",form.name);fd.append("description",form.description);
      fd.append("price",form.price);fd.append("stock",form.stock||"0");
      fd.append("is_active",String(form.is_active));fd.append("store",String(storeId));
      if(form.image)fd.append("image",form.image);
      const url=product?`${API_URL}/products/${product.id}/`:`${API_URL}/products/`;
      const res=await authFetch(url,{method:product?"PATCH":"POST",body:fd});
      if(!res.ok){const d=await res.json();setErrors(d);return;}
      onSaved();onClose();
    }catch{setErrors({general:"Network error"});}
    finally{setLoading(false);}
  };

  const iStyle=(f:string):React.CSSProperties=>({
    background:focused===f?`${ac}0f`:tk.inputBg,
    border:`1px solid ${errors[f]?"#ef4444":focused===f?ac:tk.inputBorder}`,
    borderRadius:14,color:tk.text,width:"100%",padding:"13px 16px",fontSize:14,
    boxShadow:focused===f?`0 0 0 3px ${ac}18`:"none",transition:"all 0.2s",outline:"none",
  });

  return(
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4"
      style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(20px)"}} onClick={onClose}>
      <style>{`@keyframes modalPop{from{opacity:0;transform:scale(0.93) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}.modal-pop{animation:modalPop 0.4s cubic-bezier(0.34,1.1,0.64,1) both}`}</style>
      <div className="modal-pop relative w-full max-w-lg overflow-hidden"
        style={{background:isDark?"linear-gradient(160deg,#161616,#101010)":tk.panel,border:`1px solid ${ac}45`,borderRadius:28,boxShadow:`0 40px 80px -20px ${ac}45, 0 0 0 1px ${ac}15`,maxHeight:"92vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}}/>
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>{product?"Edit Product":"New Product"}</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-sm" style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.textMuted}}>✕</button>
          </div>
          {errors.general&&<div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{background:"#ef444415",border:"1px solid #ef444330",color:"#f87171"}}>{errors.general}</div>}

          {/* Image upload */}
          <div className="mb-5">
            <label className="block text-[10px] font-black tracking-widest uppercase mb-2" style={{color:tk.textMuted}}>Product Image</label>
            <div className="relative overflow-hidden rounded-2xl cursor-pointer group"
              style={{height:170,background:preview?undefined:tk.inputBg,border:`1.5px dashed ${tk.inputBorder}`}}>
              {preview
                ?<img src={preview} alt="" className="w-full h-full object-cover"/>
                :<div className="h-full flex flex-col items-center justify-center gap-2" style={{color:tk.textMuted}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-xs font-bold">Click to upload image</span>
                </div>
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-black px-4 py-2 rounded-full" style={{background:`${ac}cc`}}>Change Image</span>
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {k:"name",label:"Product Name *",ph:"e.g. Premium T-Shirt"},
              {k:"description",label:"Description",ph:"Short product description..."},
              {k:"price",label:"Price (DA) *",ph:"e.g. 2500"},
              {k:"stock",label:"Stock Quantity",ph:"e.g. 50"},
            ].map(f=>(
              <div key={f.k}>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>{f.label}</label>
                {f.k==="description"
                  ?<textarea value={(form as any)[f.k]} onChange={e=>setForm(v=>({...v,[f.k]:e.target.value}))} onFocus={()=>setFocused(f.k)} onBlur={()=>setFocused("")} placeholder={f.ph} rows={2} style={{...iStyle(f.k),resize:"none"}}/>
                  :<input type={f.k==="price"||f.k==="stock"?"number":"text"} value={(form as any)[f.k]} onChange={e=>setForm(v=>({...v,[f.k]:e.target.value}))} onFocus={()=>setFocused(f.k)} onBlur={()=>setFocused("")} placeholder={f.ph} style={iStyle(f.k)}/>
                }
              </div>
            ))}

            <div className="flex items-center justify-between py-3.5 px-4 rounded-xl" style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`}}>
              <span className="text-sm font-bold" style={{color:tk.textSub}}>Visible to customers</span>
              <button onClick={()=>setForm(v=>({...v,is_active:!v.is_active}))} className="relative h-6 w-11 rounded-full cursor-pointer transition-all duration-300" style={{background:form.is_active?ac:tk.inputBorder}}>
                <span className="absolute top-0.5 transition-all duration-300 h-5 w-5 rounded-full bg-white shadow-sm" style={{left:form.is_active?"calc(100% - 22px)":"2px"}}/>
              </button>
            </div>

            <button onClick={handleSave} disabled={loading}
              className="w-full py-4 font-black text-white rounded-2xl cursor-pointer active:scale-95 transition-all disabled:opacity-50 mt-2"
              style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 8px 28px ${ac}50`,fontSize:14}}>
              {loading?"Saving...":product?"Save Changes ✓":"Create Product ✦"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   MAIN StoreEditor
══════════════════════════════ */
const StoreEditor = ({
  store, onBack, onRefresh, theme="dark"
}: {
  store:Store; onBack:()=>void; onRefresh:()=>void; theme?:Theme;
}) => {
  const tk     = TK[theme];
  const ac     = store.accent_color || "#E87722";
  const isDark = theme === "dark";

  const [tab,setTab]                 = useState<"products"|"orders">("products");
  const [products,setProducts]       = useState<Product[]>([]);
  const [orders,setOrders]           = useState<Order[]>([]);
  const [loadP,setLoadP]             = useState(true);
  const [loadO,setLoadO]             = useState(true);
  const [editProduct,setEditProduct] = useState<Product|null|"new">(null);

  const rev  = useCountUp(store.total_revenue   || 0);
  const ords = useCountUp(store.total_orders    || 0);
  const custs= useCountUp(store.total_customers || 0);

  const fetchProducts = async () => {
    setLoadP(true);
    try{const r=await authFetch(`${API_URL}/products/?store=${store.id}`);if(r.ok){const d=await r.json();setProducts(d.results??d);}}
    finally{setLoadP(false);}
  };
  const fetchOrders = async () => {
    setLoadO(true);
    try{const r=await authFetch(`${API_URL}/orders/?store=${store.id}`);if(r.ok){const d=await r.json();setOrders(d.results??d);}}
    finally{setLoadO(false);}
  };
  useEffect(()=>{fetchProducts();fetchOrders();},[store.id]);

  const deleteProduct = async (id:number) => {
    if(!window.confirm("Delete this product?"))return;
    await authFetch(`${API_URL}/products/${id}/`,{method:"DELETE"});
    fetchProducts();
  };
  const updateOrderStatus = async (orderId:number, status:string) => {
    await authFetch(`${API_URL}/orders/${orderId}/update_status/`,{method:"PATCH",body:JSON.stringify({status})});
    fetchOrders();
  };
  const toggleProductActive = async (p:Product) => {
    const fd=new FormData();fd.append("is_active",String(!p.is_active));
    await authFetch(`${API_URL}/products/${p.id}/`,{method:"PATCH",body:fd});
    fetchProducts();
  };

  return(
    <div style={{minHeight:"100%",background:tk.bg,transition:"background 0.4s ease"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .se-anim{animation:fadeUp 0.5s cubic-bezier(0.34,1.1,0.64,1) both}
        @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .card-in{animation:cardIn 0.4s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>

      {/* ════════════════════════
          HERO HEADER — BIG & CINEMATIC
      ════════════════════════ */}
      <div className="relative overflow-hidden rounded-[28px] mb-8 se-anim"
        style={{
          background: isDark
            ? `linear-gradient(145deg,${ac}24 0%,#141414 55%,${ac}0c 100%)`
            : `linear-gradient(145deg,${ac}18 0%,#ffffff 55%,${ac}07 100%)`,
          border:`1.5px solid ${ac}30`,
          padding:"44px 44px 40px",
          boxShadow: isDark ? `0 0 0 1px ${ac}10, 0 40px 80px -20px rgba(0,0,0,0.8)` : `0 0 0 1px ${ac}15, 0 20px 60px -10px rgba(0,0,0,0.12)`,
        }}>
        {/* subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.045]" style={{backgroundImage:`radial-gradient(circle,${isDark?"white":"#222"} 1.5px,transparent 1.5px)`,backgroundSize:"22px 22px"}}/>
        {/* glow orbs */}
        <div className="absolute pointer-events-none" style={{top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:ac,filter:"blur(110px)",opacity:isDark?0.22:0.14}}/>
        <div className="absolute pointer-events-none" style={{bottom:-60,left:-60,width:280,height:280,borderRadius:"50%",background:ac,filter:"blur(90px)",opacity:isDark?0.1:0.07}}/>
        {/* diagonal accent lines */}
        {[72,108,148,188].map((r,i)=>(
          <div key={i} className="absolute pointer-events-none" style={{top:-80,right:r,width:[2,1.5,1,0.5][i],height:500,background:`linear-gradient(to bottom,transparent,${ac}${["78","48","26","12"][i]},transparent)`,transform:"rotate(18deg)"}}/>
        ))}

        <div className="relative z-10">
          {/* Back */}
          <button onClick={onBack} className="inline-flex items-center gap-2 mb-7 cursor-pointer group/back transition-all"
            style={{color:tk.textMuted,fontSize:13,fontWeight:700}}>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center transition-all group-hover/back:scale-110"
              style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)",border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.09)"}`}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/back:-translate-x-0.5"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            <span className="transition-colors group-hover/back:text-white" onMouseEnter={e=>(e.currentTarget.style.color=ac)} onMouseLeave={e=>(e.currentTarget.style.color=tk.textMuted)}>All Stores</span>
          </button>

          {/* Store identity */}
          <div className="flex items-start gap-6 mb-8">
            {/* Logo — big */}
            <div className="shrink-0 rounded-3xl overflow-hidden flex items-center justify-center text-4xl"
              style={{width:96,height:96,background:`linear-gradient(140deg,${ac},${ac}88)`,boxShadow:`0 16px 48px ${ac}60, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15)`}}>
              {store.logo_url?<img src={store.logo_url} alt="" className="h-full w-full object-cover"/>:(nicheEmoji[store.niche]||"✨")}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="font-black text-3xl leading-none" style={{color:tk.text,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.025em"}}>{store.name}</h2>
                {store.is_live&&(
                  <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest"
                    style={{background:"rgba(34,197,94,0.14)",border:"1px solid rgba(34,197,94,0.45)",color:"#4ade80"}}>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"/>LIVE
                  </span>
                )}
                {store.plan&&(
                  <span className="text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest"
                    style={{background:`${ac}1a`,border:`1px solid ${ac}45`,color:ac}}>
                    {store.plan.toUpperCase()}
                  </span>
                )}
              </div>
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors mb-3"
                style={{color:tk.textMuted}}
                onMouseEnter={e=>(e.currentTarget.style.color=ac)} onMouseLeave={e=>(e.currentTarget.style.color=tk.textMuted)}>
                bazario.com/store/{store.slug}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              {store.description&&<p className="text-sm leading-relaxed" style={{color:tk.textSub}}>{store.description}</p>}
            </div>
          </div>

          {/* BIG Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {label:"Revenue",   value:`${rev.toLocaleString()} DA`, subLabel:"Total earnings",  icon:"💰", color:ac},
              {label:"Orders",    value:ords.toLocaleString(),         subLabel:"All time orders", icon:"🧾", color:"#2EA7F2"},
              {label:"Customers", value:custs.toLocaleString(),        subLabel:"Unique buyers",   icon:"👥", color:"#F4C21F"},
              {label:"Products",  value:String(products.length),       subLabel:"In catalog",      icon:"📦", color:"#a78bfa"},
            ].map(s=>(
              <div key={s.label} className="relative overflow-hidden flex flex-col gap-1.5 p-5 rounded-2xl"
                style={{
                  background: isDark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.75)",
                  border:`1px solid ${isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.07)"}`,
                  backdropFilter:"blur(10px)",
                  boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
                }}>
                <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl" style={{background:`linear-gradient(to right,${s.color}80,${s.color}20)`}}/>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{color:tk.textMuted}}>{s.label}</span>
                  <span className="text-base">{s.icon}</span>
                </div>
                <span className="font-black text-2xl tabular-nums leading-none" style={{color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.value}</span>
                <span className="text-[10px]" style={{color:tk.textMuted}}>{s.subLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════
          TAB BAR
      ════════════════════════ */}
      <div className="flex items-center gap-2 mb-8 se-anim" style={{animationDelay:"0.08s"}}>
        <div className="flex items-center gap-1 p-1.5 rounded-2xl" style={{background:tk.tabBg,border:`1px solid ${tk.border}`,width:"fit-content"}}>
          {(["products","orders"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className="relative px-7 py-3 rounded-xl font-black text-sm cursor-pointer transition-all capitalize"
              style={{
                background: tab===t ? `linear-gradient(135deg,${ac},${ac}cc)` : "transparent",
                color: tab===t ? "white" : tk.textMuted,
                boxShadow: tab===t ? `0 4px 16px ${ac}45` : "none",
              }}>
              <span className="flex items-center gap-2.5">
                {t==="products" ? "📦" : "🧾"} {t.charAt(0).toUpperCase()+t.slice(1)}
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                  style={{background:tab===t?"rgba(255,255,255,0.2)":(isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)"),color:tab===t?"white":tk.textMuted}}>
                  {t==="products"?products.length:orders.length}
                </span>
              </span>
            </button>
          ))}
        </div>
        {/* add product button always visible */}
        {tab==="products"&&(
          <button onClick={()=>setEditProduct("new")}
            className="ml-auto flex items-center gap-2 px-5 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
            style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        )}
      </div>

      {/* ════════════════════════
          PRODUCTS TAB
      ════════════════════════ */}
      {tab==="products"&&(
        <div className="se-anim" style={{animationDelay:"0.12s"}}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-xl" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>Product Catalog</h3>
              <p className="text-xs mt-0.5" style={{color:tk.textMuted}}>{products.length} item{products.length!==1?"s":""} in your store</p>
            </div>
          </div>
          {loadP?(
            <div className="py-20 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{borderColor:`${ac}40`,borderTopColor:ac}}/>
            </div>
          ):products.length===0?(
            <div className="py-24 flex flex-col items-center gap-5 text-center rounded-2xl"
              style={{background:isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.8)",border:`1.5px dashed ${tk.border}`}}>
              <span className="text-6xl opacity-20">📦</span>
              <div>
                <p className="font-black text-xl mb-1.5" style={{color:tk.textMuted,fontFamily:"'Syne',sans-serif"}}>No products yet</p>
                <p className="text-sm" style={{color:tk.textMuted}}>Start by adding your first product to the catalog</p>
              </div>
              <button onClick={()=>setEditProduct("new")} className="px-7 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all" style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
                Add First Product
              </button>
            </div>
          ):(
            /* BIG product grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p,i)=>(
                <div key={p.id} className="card-in group relative flex flex-col overflow-hidden rounded-2xl cursor-default"
                  style={{background:tk.panel,border:`1px solid ${tk.border}`,transition:"all 0.3s ease",animationDelay:`${i*60}ms`}}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow=`0 20px 52px -10px ${ac}30`;el.style.borderColor=ac+"45";el.style.transform="translateY(-5px)";}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow="none";el.style.borderColor=tk.border;el.style.transform="translateY(0)";}}>
                  {/* Image — TALLER */}
                  <div className="relative overflow-hidden" style={{height:240,background:isDark?`${ac}10`:`${ac}08`}}>
                    {p.image_url
                      ?<img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                      :<div className="h-full flex items-center justify-center text-7xl opacity-15">📦</div>
                    }
                    {/* hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}>
                      <button onClick={()=>setEditProduct(p)}
                        className="h-11 w-11 rounded-2xl flex items-center justify-center font-black text-white cursor-pointer transition-all active:scale-90 hover:scale-110"
                        style={{background:`${ac}ee`,boxShadow:`0 4px 16px ${ac}60`}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={()=>deleteProduct(p.id)}
                        className="h-11 w-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:scale-110"
                        style={{background:"rgba(239,68,68,0.9)",boxShadow:"0 4px 16px rgba(239,68,68,0.5)",color:"white"}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                    {/* price badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl" style={{background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)"}}>
                      <span className="font-black text-sm text-white">{Number(p.price).toLocaleString()} <span className="text-white/55 text-xs">DA</span></span>
                    </div>
                    {/* stock badges */}
                    {p.stock<=5&&p.stock>0&&(
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest" style={{background:"#f59e0b22",border:"1px solid #f59e0b50",color:"#fbbf24"}}>LOW STOCK</div>
                    )}
                    {p.stock===0&&(
                      <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
                        <span className="text-white/60 font-black text-xs tracking-[0.2em] uppercase">Sold Out</span>
                      </div>
                    )}
                  </div>
                  {/* Info row */}
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate mb-0.5" style={{color:tk.text}}>{p.name}</p>
                      <p className="text-[11px]" style={{color:tk.textMuted}}>Stock: {p.stock} units</p>
                    </div>
                    <button onClick={()=>toggleProductActive(p)}
                      className="relative h-5 w-9 rounded-full cursor-pointer transition-all duration-300 shrink-0"
                      style={{background:p.is_active?ac:tk.chipBorder}}>
                      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300" style={{left:p.is_active?"calc(100%-18px)":"2px"}}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════
          ORDERS TAB
      ════════════════════════ */}
      {tab==="orders"&&(
        <div className="se-anim flex flex-col gap-4" style={{animationDelay:"0.12s"}}>
          <div className="mb-2">
            <h3 className="font-black text-xl" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>Order Management</h3>
            <p className="text-xs mt-0.5" style={{color:tk.textMuted}}>{orders.length} order{orders.length!==1?"s":""} received</p>
          </div>
          {loadO?(
            <div className="py-20 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{borderColor:`${ac}40`,borderTopColor:ac}}/>
            </div>
          ):orders.length===0?(
            <div className="py-24 flex flex-col items-center gap-5 text-center rounded-2xl"
              style={{background:isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.8)",border:`1.5px dashed ${tk.border}`}}>
              <span className="text-6xl opacity-20">🧾</span>
              <div>
                <p className="font-black text-xl mb-1.5" style={{color:tk.textMuted,fontFamily:"'Syne',sans-serif"}}>No orders yet</p>
                <p className="text-sm" style={{color:tk.textMuted}}>Orders will appear here once customers start buying</p>
              </div>
            </div>
          ):orders.map((order,i)=>{
            const sc=STATUS_COLORS[order.status]||STATUS_COLORS.pending;
            return(
              <div key={order.id} className="card-in overflow-hidden rounded-2xl transition-all"
                style={{background:tk.panel,border:`1px solid ${tk.border}`,animationDelay:`${i*50}ms`}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=ac+"40";el.style.boxShadow=`0 8px 32px -8px ${ac}22`;}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=tk.border;el.style.boxShadow="none";}}>
                {/* top accent line per status */}
                <div className="h-[2px] w-full" style={{background:sc.text+"55"}}/>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-black text-base" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>#{order.id}</span>
                      <span className="font-bold text-sm" style={{color:tk.textSub}}>{order.customer_name}</span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest"
                        style={{background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text}}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-3 flex-wrap text-xs" style={{color:tk.textMuted}}>
                      <span>{order.customer_email}</span>
                      <span>{order.customer_phone}</span>
                      {order.created_at&&<span>{new Date(order.created_at).toLocaleDateString()}</span>}
                    </div>
                    {order.items&&order.items.length>0&&(
                      <div className="flex flex-wrap gap-2 mt-1">
                        {order.items.map(item=>(
                          <span key={item.id} className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",border:`1px solid ${isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.08)"}`,color:tk.textSub}}>
                            {item.product_name} <span style={{color:ac}}>×{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-black text-2xl block" style={{color:ac,fontFamily:"'Syne',sans-serif"}}>{Number(order.total).toLocaleString()}</span>
                      <span className="text-[10px]" style={{color:tk.textMuted}}>DA total</span>
                    </div>
                    <select value={order.status} onChange={e=>updateOrderStatus(order.id,e.target.value)}
                      className="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
                      style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)",border:`1px solid ${tk.chipBorder}`,color:tk.textSub,outline:"none"}}>
                      {["pending","processing","delivered","cancelled"].map(s=>(
                        <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      {editProduct&&(
        <ProductModal
          product={editProduct==="new"?null:editProduct}
          storeId={store.id} theme={theme} ac={ac}
          onClose={()=>setEditProduct(null)}
          onSaved={()=>{fetchProducts();setEditProduct(null);}}
        />
      )}
    </div>
  );
};

export default StoreEditor;