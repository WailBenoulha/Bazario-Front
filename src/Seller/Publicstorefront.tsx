import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

interface StoreData {
  id: number; name: string; slug: string; niche: string; description: string;
  accent_color: string; button_style: string; panel_style: string;
  logo?: string; logo_url?: string; is_live: boolean;
}
interface Product { id: number; name: string; description: string; price: number; stock: number; image?: string; }
interface CartItem extends Product { qty: number; }

const nicheEmoji: Record<string, string> = {
  fashion:"👗", electronics:"⚡", cosmetics:"💄", food:"🍽️",
  accessories:"💍", sports:"🏆", education:"📚", other:"✨",
};

/* ── Themes ── */
const THEMES: Record<string, {bg:string;card:string;cardBorder:string;text:string;textMuted:string;navBg:string;inputBg:string}> = {
  dark:    {bg:"#070707",  card:"rgba(255,255,255,0.04)", cardBorder:"rgba(255,255,255,0.08)", text:"#ffffff",  textMuted:"rgba(255,255,255,0.4)",  navBg:"rgba(7,7,7,0.96)",       inputBg:"rgba(255,255,255,0.07)"},
  light:   {bg:"#f5f5f3",  card:"#ffffff",               cardBorder:"rgba(0,0,0,0.08)",       text:"#111111",  textMuted:"#888888",                navBg:"rgba(245,245,243,0.97)", inputBg:"rgba(0,0,0,0.05)"},
  glass:   {bg:"#0c1018",  card:"rgba(255,255,255,0.07)",cardBorder:"rgba(255,255,255,0.13)", text:"#ffffff",  textMuted:"rgba(255,255,255,0.38)", navBg:"rgba(12,16,24,0.88)",    inputBg:"rgba(255,255,255,0.07)"},
  minimal: {bg:"#fafaf8",  card:"#ffffff",               cardBorder:"transparent",            text:"#111111",  textMuted:"#aaaaaa",                navBg:"rgba(250,250,248,0.98)", inputBg:"rgba(0,0,0,0.04)"},
};
const getTheme = (ps: string) => THEMES[ps] ?? THEMES.dark;

/* ── Button styles ── */
const getBtnRadius = (s: string) => ({soft:"12px",rounded:"999px",sharp:"0px",pill:"999px",ghost:"12px",elevated:"12px"})[s] ?? "12px";
const getBtnStyle  = (s: string, ac: string, enabled = true): React.CSSProperties => {
  if (!enabled) return {borderRadius:getBtnRadius(s),opacity:0.4,cursor:"not-allowed"};
  if (s==="ghost")    return {borderRadius:getBtnRadius(s),background:"transparent",border:`2px solid ${ac}`,color:ac};
  if (s==="elevated") return {borderRadius:getBtnRadius(s),background:`linear-gradient(135deg,${ac},${ac}cc)`,color:"#fff",boxShadow:`0 8px 28px ${ac}55,0 2px 6px rgba(0,0,0,0.25)`};
  return {borderRadius:getBtnRadius(s),background:`linear-gradient(135deg,${ac},${ac}bb)`,color:"#fff",boxShadow:`0 4px 18px ${ac}40`};
};

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:0.08});
    obs.observe(el); return()=>obs.disconnect();
  },[]);
  return {ref,vis};
}

/* ══════════════════════════════════════
   Product Detail Modal
══════════════════════════════════════ */
const ProductDetailModal = ({product,ac,btnStyle,theme,onClose,onAdd,addedId}:{
  product:Product; ac:string; btnStyle:string;
  theme:ReturnType<typeof getTheme>; onClose:()=>void;
  onAdd:(p:Product)=>void; addedId:number|null;
}) => {
  const added  = addedId===product.id;
  const oos    = product.stock===0;
  const isDark = theme.text==="#ffffff";

  useEffect(()=>{ document.body.style.overflow="hidden"; return()=>{document.body.style.overflow=""}; },[]);

  return (
    <div className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center sm:px-4"
      style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(20px)"}} onClick={onClose}>
      <style>{`
        @keyframes modalUp{from{opacity:0;transform:translateY(60px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        .modal-up{animation:modalUp 0.42s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>

      <div className="modal-up relative w-full sm:max-w-2xl overflow-hidden"
        style={{background:isDark?"linear-gradient(160deg,#111,#0d0d0d)":theme.bg,border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"}`,borderRadius:24,maxHeight:"92vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>

        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}} />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)",color:theme.textMuted}}>✕</button>

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-64 shrink-0 overflow-hidden" style={{minHeight:260,background:`${ac}12`}}>
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" style={{minHeight:260}} />
              : <div className="w-full h-full flex items-center justify-center text-7xl" style={{minHeight:260,opacity:0.18}}>{nicheEmoji["other"]}</div>
            }
            <div className="absolute inset-0 sm:hidden" style={{background:"linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%)"}} />
            {product.stock<=5&&product.stock>0&&(
              <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black rounded-full" style={{background:"#f59e0b22",border:"1px solid #f59e0b50",color:"#fbbf24"}}>Only {product.stock} left</div>
            )}
            {oos&&(
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(5px)"}}>
                <span className="text-white/55 font-black text-sm tracking-widest uppercase">Sold Out</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 p-6 sm:p-8 gap-5">
            <div>
              <h2 className="font-black text-2xl leading-tight mb-3" style={{color:theme.text,fontFamily:"Syne,sans-serif"}}>{product.name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-4xl" style={{color:ac,fontFamily:"Syne,sans-serif"}}>{Number(product.price).toLocaleString()}</span>
                <span className="text-base font-bold" style={{color:theme.textMuted}}>DA</span>
              </div>
            </div>

            {product.description&&(
              <div className="p-4 rounded-2xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`}}>
                <p className="text-sm leading-relaxed" style={{color:theme.textMuted}}>{product.description}</p>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${oos?"bg-red-500":product.stock<=5?"bg-amber-400 animate-pulse":"bg-green-500 animate-pulse"}`} />
              <span className="text-sm font-bold" style={{color:theme.textMuted}}>
                {oos?"Out of stock":product.stock<=5?`Only ${product.stock} remaining`:`${product.stock} in stock`}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <button
                onClick={()=>{if(!oos){onAdd(product);onClose();}}}
                disabled={oos}
                className="w-full py-4 font-black text-sm tracking-wide cursor-pointer active:scale-95 transition-all duration-200"
                style={{...getBtnStyle(btnStyle,ac,!oos),fontSize:15}}
              >
                {oos?"Out of Stock":added?"✓ Added to Cart!":"+ Add to Cart"}
              </button>
              <button onClick={onClose} className="w-full py-3 font-bold text-sm cursor-pointer transition-all rounded-xl"
                style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",color:theme.textMuted}}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Product Card
══════════════════════════════════════ */
const ProductCard = ({product,ac,btnStyle,theme,onAdd,addedId,onView}:{
  product:Product; ac:string; btnStyle:string; theme:ReturnType<typeof getTheme>;
  onAdd:(p:Product)=>void; addedId:number|null; onView:(p:Product)=>void;
}) => {
  const {ref,vis} = useReveal();
  const [hov,setHov] = useState(false);
  const added = addedId===product.id;
  const oos   = product.stock===0;

  return (
    <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="relative flex flex-col overflow-hidden"
      style={{
        background:theme.card, borderRadius:20, backdropFilter:"blur(12px)",
        border:`1px solid ${hov?ac+"55":theme.cardBorder}`,
        transition:"all 0.45s cubic-bezier(0.34,1.2,0.64,1)",
        opacity:vis?1:0,
        transform:vis?(hov?"translateY(-7px) scale(1.015)":"translateY(0) scale(1)"):"translateY(32px) scale(0.95)",
        boxShadow:hov?`0 24px 56px -12px ${ac}35,0 0 0 1px ${ac}18`:"0 2px 12px rgba(0,0,0,0.1)",
      }}>

      {/* Image — click = view detail */}
      <div className="relative overflow-hidden cursor-pointer" style={{height:220,background:`${ac}10`}} onClick={()=>onView(product)}>
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"
              style={{transition:"transform 0.6s cubic-bezier(0.34,1,0.64,1)",transform:hov?"scale(1.09)":"scale(1)"}} />
          : <div className="w-full h-full flex items-center justify-center text-6xl" style={{opacity:0.18}}>{nicheEmoji["other"]}</div>
        }
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)"}} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(3px)",opacity:hov?1:0}}>
          <span className="px-4 py-2 font-black text-white text-xs tracking-widest uppercase rounded-full"
            style={{background:`${ac}dd`,border:`1px solid ${ac}`}}>View Details</span>
        </div>

        {product.stock<=5&&product.stock>0&&(
          <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black rounded-full"
            style={{background:"#f59e0b22",border:"1px solid #f59e0b50",color:"#fbbf24"}}>Only {product.stock} left</div>
        )}
        {oos&&(
          <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(5px)"}}>
            <span className="text-white/55 font-black text-sm tracking-widest uppercase">Sold Out</span>
          </div>
        )}
        <div className="absolute bottom-3 left-4">
          <span className="font-black text-white text-lg">{Number(product.price).toLocaleString()} <span className="text-white/50 text-sm font-bold">DA</span></span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="cursor-pointer" onClick={()=>onView(product)}>
          <h3 className="font-black text-sm leading-tight" style={{color:theme.text}}>{product.name}</h3>
          {product.description&&<p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{color:theme.textMuted}}>{product.description}</p>}
        </div>

        <div className="flex gap-2 mt-auto">
          <button onClick={()=>onView(product)} className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl cursor-pointer transition-all"
            style={{background:`${ac}15`,color:ac,border:`1px solid ${ac}25`,fontSize:15}}>ℹ</button>
          <button
            onClick={()=>!oos&&onAdd(product)} disabled={oos}
            className="flex-1 py-2.5 font-black text-sm tracking-wide cursor-pointer active:scale-95 transition-all duration-200"
            style={{...getBtnStyle(btnStyle,ac,!oos),opacity:oos?0.4:1,cursor:oos?"not-allowed":"pointer"}}
          >
            {added?"✓ Added":oos?"Sold Out":"+ Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Checkout Modal
══════════════════════════════════════ */
const CheckoutModal = ({cart,store,theme,onClose,onSuccess}:{
  cart:CartItem[]; store:StoreData; theme:ReturnType<typeof getTheme>;
  onClose:()=>void; onSuccess:()=>void;
}) => {
  const [form,setForm]       = useState({name:"",email:"",phone:""});
  const [loading,setLoading] = useState(false);
  const [errors,setErrors]   = useState<Record<string,string>>({});
  const [focused,setFocused] = useState<string|null>(null);
  const ac    = store.accent_color||"#E87722";
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const isDark = theme.text==="#ffffff";

  useEffect(()=>{ document.body.style.overflow="hidden"; return()=>{document.body.style.overflow=""}; },[]);

  const handleOrder = async () => {
    if (!form.name||!form.email||!form.phone){setErrors({general:"Please fill all required fields."});return;}
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({store:store.id,customer_name:form.name,customer_email:form.email,customer_phone:form.phone,items:cart.map(i=>({product:i.id,quantity:i.qty}))}),
      });
      if(!res.ok){const d=await res.json();setErrors(d);return;}
      onSuccess();
    } catch{setErrors({general:"Network error."});}
    finally{setLoading(false);}
  };

  const iStyle=(f:string):React.CSSProperties=>({
    background:focused===f?`${ac}12`:theme.inputBg,
    border:`1px solid ${errors[f]?"#ef4444":focused===f?ac:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,
    color:theme.text,borderRadius:12,width:"100%",padding:"13px 14px 13px 44px",
    fontSize:13,boxShadow:focused===f?`0 0 0 3px ${ac}18`:"none",transition:"all 0.2s",outline:"none",
  });

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center sm:px-4"
      style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(20px)"}} onClick={onClose}>
      <div className="relative w-full sm:max-w-md overflow-hidden"
        style={{background:isDark?"linear-gradient(160deg,#111,#0d0d0d)":theme.bg,border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,maxHeight:"92vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}} />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)",color:theme.textMuted}}>✕</button>
        <div className="p-7">
          <h3 className="font-black text-xl mb-1" style={{color:theme.text,fontFamily:"Syne,sans-serif"}}>Checkout</h3>
          <p className="text-sm mb-5" style={{color:theme.textMuted}}>
            {cart.reduce((s,i)=>s+i.qty,0)} items · <span className="font-black" style={{color:ac}}>{total.toLocaleString()} DA</span>
          </p>
          <div className="mb-5 p-4 rounded-2xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`}}>
            {cart.map(item=>(
              <div key={item.id} className="flex justify-between py-2 text-sm" style={{borderBottom:"1px solid rgba(128,128,128,0.1)"}}>
                <span style={{color:theme.textMuted}}>{item.name} <span style={{opacity:0.5}}>×{item.qty}</span></span>
                <span className="font-bold" style={{color:theme.text}}>{(item.price*item.qty).toLocaleString()} DA</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-1">
              <span className="font-black" style={{color:theme.text}}>Total</span>
              <span className="font-black text-xl" style={{color:ac}}>{total.toLocaleString()} DA</span>
            </div>
          </div>
          {errors.general&&<div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-xs" style={{background:"#ef444415",border:"1px solid #ef444430"}}>{errors.general}</div>}
          <div className="flex flex-col gap-3">
            {[{k:"name",label:"Full Name *",ph:"Ahmed Benali",icon:"👤"},{k:"email",label:"Email *",ph:"ahmed@mail.com",icon:"✉️"},{k:"phone",label:"Phone *",ph:"0555 123 456",icon:"📞"}].map(f=>(
              <div key={f.k}>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:theme.textMuted}}>{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">{f.icon}</span>
                  <input type="text" value={(form as any)[f.k]} onChange={e=>setForm(fm=>({...fm,[f.k]:e.target.value}))}
                    onFocus={()=>setFocused(f.k)} onBlur={()=>setFocused(null)} placeholder={f.ph} style={iStyle(f.k)} />
                </div>
                {(errors as any)[f.k]&&<p className="text-red-400 text-xs mt-1">⚠ {(errors as any)[f.k]}</p>}
              </div>
            ))}
            <button onClick={handleOrder} disabled={loading} className="w-full py-4 font-black text-white cursor-pointer active:scale-95 transition-all disabled:opacity-50 mt-2"
              style={{...getBtnStyle("soft",ac),borderRadius:16,fontSize:15}}>
              {loading?<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Placing Order...</span>:"Place Order ✦"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Main Storefront
══════════════════════════════════════ */
const PublicStorefront = () => {
  const {slug} = useParams<{slug:string}>();
  const [store,       setStore]       = useState<StoreData|null>(null);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [checkout,    setCheckout]    = useState(false);
  const [orderDone,   setOrderDone]   = useState(false);
  const [addedId,     setAddedId]     = useState<number|null>(null);
  const [viewProduct, setViewProduct] = useState<Product|null>(null);
  const [search,      setSearch]      = useState("");
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h);
  },[]);

  useEffect(()=>{
    (async()=>{
      try{
        // Plain fetch — no auth token. Django must return live stores with all fields publicly.
        const res = await fetch(`${API_URL}/stores/?slug=${slug}`);
        if(!res.ok){setNotFound(true);return;}
        const data = await res.json();
        const s:StoreData = (data.results??data)[0];
        if(!s||!s.is_live){setNotFound(true);return;}
        setStore(s);
        const pRes = await fetch(`${API_URL}/products/?store=${s.id}&is_active=true`);
        if(pRes.ok){const pd=await pRes.json();setProducts(pd.results??pd);}
      }catch{setNotFound(true);}
      finally{setLoading(false);}
    })();
  },[slug]);

  const addToCart=(p:Product)=>{
    setCart(c=>c.find(i=>i.id===p.id)?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]);
    setAddedId(p.id); setTimeout(()=>setAddedId(null),1600);
  };

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const filtered  = products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  // Read ALL customization from the store object returned by API
  const ac      = store?.accent_color || "#E87722";
  const bStyle  = store?.button_style || "soft";
  const pStyle  = store?.panel_style  || "dark";
  const theme   = getTheme(pStyle);
  const isDark  = theme.text==="#ffffff";
  const logoSrc = store?.logo_url || store?.logo || null;

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#070707"}}>
      <div className="flex flex-col items-center gap-5">
        <div className="h-14 w-14 rounded-2xl animate-pulse" style={{background:`linear-gradient(135deg,#E87722,#E87722aa)`}} />
        <p className="text-white/25 text-xs tracking-[0.25em] uppercase font-black">Loading Store</p>
      </div>
    </div>
  );

  if(notFound||!store) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#070707"}}>
      <div className="text-center">
        <p className="text-7xl mb-5">🏚️</p>
        <h1 className="text-white font-black text-3xl" style={{fontFamily:"Syne,sans-serif"}}>Store Not Found</h1>
        <p className="text-white/30 mt-2 text-sm">This store doesn't exist or is currently offline.</p>
      </div>
    </div>
  );

  if(orderDone) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:theme.bg}}>
      <div className="text-center flex flex-col items-center gap-6 max-w-sm px-4">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-3xl animate-pulse" style={{background:`linear-gradient(135deg,${ac},${ac}66)`}} />
          <div className="absolute inset-0 rounded-3xl flex items-center justify-center text-4xl">🎉</div>
        </div>
        <div>
          <h2 className="font-black text-3xl" style={{color:theme.text,fontFamily:"Syne,sans-serif"}}>Order Confirmed!</h2>
          <p className="mt-2 leading-relaxed" style={{color:theme.textMuted}}>
            Thank you for shopping at <span className="font-black" style={{color:ac}}>{store.name}</span>. We'll contact you soon.
          </p>
        </div>
        <button onClick={()=>{setOrderDone(false);setCart([]);}}
          className="px-8 py-3.5 font-black text-white cursor-pointer active:scale-95 transition-all"
          style={getBtnStyle(bStyle,ac)}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,button,input{font-family:'DM Sans',sans-serif;}
        h1,h2,h3,h4{font-family:'Syne',sans-serif;}
        @keyframes heroIn{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cartBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
        @keyframes slideRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        .hl1{animation:heroIn 0.9s cubic-bezier(0.34,1.1,0.64,1) both}
        .hl2{animation:heroIn 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.14s both}
        .hl3{animation:heroIn 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.28s both}
        .hl4{animation:heroIn 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.42s both}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${ac}55;border-radius:99px}
      `}</style>

      <div style={{background:theme.bg,minHeight:"100vh"}}>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500"
          style={{height:scrolled?62:78,padding:"0 24px",background:scrolled?theme.navBg:"transparent",backdropFilter:scrolled?"blur(24px)":"none",borderBottom:scrolled?`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`:"none"}}>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center text-xl shrink-0"
              style={{background:`linear-gradient(135deg,${ac},${ac}99)`,boxShadow:`0 4px 16px ${ac}50`}}>
              {logoSrc?<img src={logoSrc} alt="" className="h-full w-full object-cover" />:nicheEmoji[store.niche]||"🏪"}
            </div>
            <div>
              <p className="font-black text-base leading-none" style={{color:theme.text}}>{store.name}</p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize" style={{background:`${ac}18`,color:ac}}>{store.niche}</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xs mx-10">
            <div className="relative w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{color:theme.textMuted}}>⌕</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
                className="w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                style={{background:theme.inputBg,border:`1px solid ${search?ac:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"}`,borderRadius:12,color:theme.text,boxShadow:search?`0 0 0 2px ${ac}22`:"none"}} />
            </div>
          </div>

          <button onClick={()=>setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2.5 font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
            style={{...getBtnStyle(bStyle,ac),padding:"10px 18px",fontSize:13}}>
            <span style={{display:"inline-block",animation:addedId?"cartBounce 0.4s ease":"none"}}>🛒</span>
            <span className="hidden sm:block">Cart</span>
            {cartCount>0&&<span className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{background:"#ef4444",border:`2px solid ${theme.bg}`}}>{cartCount}</span>}
          </button>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden" style={{minHeight:"70vh",display:"flex",alignItems:"center"}}>
          <div className="absolute inset-0" style={{background:`radial-gradient(ellipse 75% 60% at 50% 0%,${ac}22 0%,transparent 70%)`}} />
          <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage:`radial-gradient(circle,${isDark?"white":"#333"} 1px,transparent 1px)`,backgroundSize:"28px 28px"}} />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full pointer-events-none" style={{background:ac,opacity:0.11,filter:"blur(80px)"}} />
          <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full pointer-events-none" style={{background:ac,opacity:0.07,filter:"blur(60px)"}} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-16 w-full">
            <div className="max-w-2xl">
              {logoSrc&&<div className="mb-8 hl1"><img src={logoSrc} alt="logo" className="h-20 w-20 rounded-3xl object-cover" style={{boxShadow:`0 16px 48px ${ac}55`}} /></div>}
              <div className="flex items-center gap-3 mb-4 hl1">
                <div className="h-px w-8" style={{background:ac}} />
                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{color:ac}}>{store.niche} Store</span>
              </div>
              <h1 className="font-black leading-none mb-5 hl2" style={{fontSize:"clamp(3rem,8vw,6rem)",color:theme.text,letterSpacing:"-0.03em"}}>{store.name}</h1>
              {store.description&&<p className="text-lg leading-relaxed max-w-xl mb-8 hl3" style={{color:theme.textMuted,fontWeight:300}}>{store.description}</p>}
              <div className="flex items-center gap-5 hl4">
                <button onClick={()=>document.getElementById("products-grid")?.scrollIntoView({behavior:"smooth"})}
                  className="px-8 py-4 font-black text-white cursor-pointer active:scale-95 transition-all"
                  style={{...getBtnStyle(bStyle,ac),fontSize:15}}>
                  Shop Now ↓
                </button>
                <div className="flex items-center gap-2 text-xs" style={{color:theme.textMuted}}>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {products.length} Products
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-5 py-3" style={{borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.06)"}`}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={{background:theme.inputBg,border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)"}`,borderRadius:12,color:theme.text}} />
        </div>

        {/* Products */}
        <div id="products-grid" className="max-w-6xl mx-auto px-6 md:px-12 py-14">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{color:ac}}>Collection</p>
              <h2 className="font-black" style={{fontSize:"clamp(1.8rem,4vw,3rem)",color:theme.text,letterSpacing:"-0.02em"}}>All Products</h2>
            </div>
            <p className="text-sm hidden md:block" style={{color:theme.textMuted}}>{filtered.length} items</p>
          </div>

          {filtered.length===0?(
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="text-5xl" style={{opacity:0.15}}>📦</span>
              <p className="font-black text-xl" style={{color:theme.textMuted}}>{search?"No products match":"No products yet"}</p>
            </div>
          ):(
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map(p=>(
                <ProductCard key={p.id} product={p} ac={ac} btnStyle={bStyle} theme={theme}
                  onAdd={addToCart} addedId={addedId} onView={setViewProduct} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-10 text-center" style={{borderTop:`1px solid ${isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.06)"}`}}>
          <p className="text-xs tracking-widest uppercase" style={{color:theme.textMuted}}>
            {store.name} · Powered by <span style={{color:ac}} className="font-black">Bazario</span>
          </p>
        </div>
      </div>

      {/* Product Detail Modal */}
      {viewProduct&&(
        <ProductDetailModal product={viewProduct} ac={ac} btnStyle={bStyle} theme={theme}
          onClose={()=>setViewProduct(null)} onAdd={addToCart} addedId={addedId} />
      )}

      {/* Cart Drawer */}
      {cartOpen&&(
        <div className="fixed inset-0 z-[200] flex justify-end" onClick={()=>setCartOpen(false)}>
          <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}} />
          <div className="relative h-full w-full max-w-sm flex flex-col" style={{background:isDark?"linear-gradient(180deg,#111,#0a0a0a)":theme.bg,borderLeft:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)"}`,animation:"slideRight 0.38s cubic-bezier(0.34,1.1,0.64,1)"}} onClick={e=>e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}} />
            <div className="flex items-center justify-between px-6 py-5" style={{borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`}}>
              <div>
                <p className="font-black text-xl" style={{color:theme.text}}>Your Cart</p>
                {cartCount>0&&<p className="text-xs mt-0.5" style={{color:theme.textMuted}}>{cartCount} item{cartCount>1?"s":""}</p>}
              </div>
              <button onClick={()=>setCartOpen(false)} className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",color:theme.textMuted}}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length===0?(
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <span className="text-5xl" style={{opacity:0.15}}>🛒</span>
                  <p className="font-black" style={{color:theme.textMuted}}>Cart is empty</p>
                </div>
              ):(
                <div className="flex flex-col gap-3">
                  {cart.map(item=>(
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`}}>
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl" style={{background:`${ac}15`}}>
                        {item.image?<img src={item.image} alt="" className="h-full w-full object-cover"/>:nicheEmoji[store.niche]||"📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{color:theme.text}}>{item.name}</p>
                        <p className="text-sm font-black" style={{color:ac}}>{(item.price*item.qty).toLocaleString()} DA</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={()=>setCart(c=>c.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}
                          className="h-7 w-7 rounded-lg flex items-center justify-center font-black cursor-pointer"
                          style={{background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)",color:theme.text}}>−</button>
                        <span className="w-5 text-center font-black text-sm" style={{color:theme.text}}>{item.qty}</span>
                        <button onClick={()=>addToCart(item)} className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-white cursor-pointer" style={{background:ac}}>+</button>
                        <button onClick={()=>setCart(c=>c.filter(i=>i.id!==item.id))} className="ml-1 text-sm cursor-pointer" style={{color:theme.textMuted}}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length>0&&(
              <div className="p-5" style={{borderTop:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`}}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black" style={{color:theme.textMuted}}>Total</span>
                  <span className="font-black text-2xl" style={{color:ac,fontFamily:"Syne,sans-serif"}}>{cartTotal.toLocaleString()} DA</span>
                </div>
                <button onClick={()=>{setCartOpen(false);setCheckout(true);}}
                  className="w-full py-4 font-black text-white cursor-pointer active:scale-95 transition-all"
                  style={{...getBtnStyle(bStyle,ac),fontSize:15}}>
                  Checkout ✦
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {checkout&&(
        <CheckoutModal cart={cart} store={store} theme={theme}
          onClose={()=>setCheckout(false)} onSuccess={()=>{setCheckout(false);setOrderDone(true);}} />
      )}
    </>
  );
};

export default PublicStorefront;