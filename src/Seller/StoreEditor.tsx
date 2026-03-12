import { useState, useEffect, useRef } from "react";
import { type Store, type Order, API_URL, authFetch, nicheEmoji } from "./sellerTypes";

interface Props { store: Store; onBack: () => void; onRefresh: () => void; }
interface Product { id:number; name:string; description:string; price:number; stock:number; is_active:boolean; image?:string; }

const STATUS_OPTIONS = ["pending","processing","delivered","cancelled"];
const SC: Record<string,{bg:string;color:string}> = {
  pending:    {bg:"#f59e0b15",color:"#d97706"},
  processing: {bg:"#3b82f615",color:"#2563eb"},
  delivered:  {bg:"#22c55e15",color:"#16a34a"},
  cancelled:  {bg:"#ef444415",color:"#dc2626"},
};

/* ── Product Modal ── */
const ProductModal = ({ storeId, product, ac, onClose, onSaved }:
  { storeId:number; product:Product|null; ac:string; onClose:()=>void; onSaved:()=>void }) => {
  const [form, setForm]   = useState({ name:product?.name||"", description:product?.description||"", price:product?.price?String(product.price):"", stock:product?.stock?String(product.stock):"", is_active:product?.is_active??true });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [focused, setFocused] = useState<string|null>(null);
  const [imgPreview, setImgPreview] = useState<string|null>(product?.image||null);
  const [imgFile, setImgFile]       = useState<File|null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  const iStyle = (f:string):React.CSSProperties => ({
    background: focused===f ? `${ac}10` : "rgba(255,255,255,0.05)",
    border:`1px solid ${errors[f]?"#ef4444":focused===f?ac:"rgba(255,255,255,0.1)"}`,
    borderRadius:12, color:"white", width:"100%", padding:"12px 14px", fontSize:13,
    boxShadow:focused===f?`0 0 0 3px ${ac}18`:"none", transition:"all 0.2s", outline:"none",
  });

  const handleSave = async () => {
    setLoading(true); setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)));
      fd.append("store", String(storeId));
      if (imgFile) fd.append("image", imgFile);
      const url = product ? `${API_URL}/products/${product.id}/` : `${API_URL}/products/`;
      const res = await authFetch(url, { method: product?"PATCH":"POST", body:fd, headers:{} });
      const data = await res.json();
      if (!res.ok) { setErrors(data); return; }
      onSaved();
    } catch { setErrors({general:"Network error."});}
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4" style={{background:"rgba(0,0,0,0.88)",backdropFilter:"blur(20px)"}} onClick={onClose}>
      <style>{`@keyframes pmIn{from{opacity:0;transform:scale(0.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}.pm{animation:pmIn 0.4s cubic-bezier(0.34,1.1,0.64,1) both}`}</style>
      <div className="pm relative w-full max-w-lg overflow-hidden" style={{background:"linear-gradient(145deg,#0d0d0d,#161616)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}} />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-white/30 hover:text-white transition-all" style={{background:"rgba(255,255,255,0.08)"}}>✕</button>
        <div className="p-7">
          <h3 className="text-white font-black text-xl mb-6" style={{fontFamily:"Syne,sans-serif"}}>{product?"Edit Product":"Add New Product"}</h3>
          {errors.general && <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-xs" style={{background:"#ef444415",border:"1px solid #ef444430"}}>{errors.general}</div>}

          {/* Image upload */}
          <div className="mb-5">
            <label className="block text-[10px] font-black tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.3)"}}>Product Photo</label>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(!f)return;setImgFile(f);const r=new FileReader();r.onload=ev=>setImgPreview(ev.target?.result as string);r.readAsDataURL(f);}} />
            <button onClick={()=>imgRef.current?.click()} className="relative w-full overflow-hidden cursor-pointer transition-all duration-300 group" style={{height:imgPreview?200:110,background:"rgba(255,255,255,0.03)",border:`2px dashed ${imgPreview?ac:"rgba(255,255,255,0.1)"}`,borderRadius:16}}>
              {imgPreview ? (
                <><img src={imgPreview} className="w-full h-full object-cover" /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)"}}><p className="text-white font-black text-sm">📷 Change Photo</p></div></>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2"><span className="text-3xl opacity-20">📷</span><p className="text-white/25 text-xs font-semibold">Click to upload photo</p></div>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Name *</label>
                <input value={form.name} onChange={e=>set("name",e.target.value)} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} placeholder="Product name" style={iStyle("name") as any} />
                {errors.name&&<p className="text-red-400 text-[10px] mt-1">⚠ {errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Price (DA) *</label>
                <input type="number" value={form.price} onChange={e=>set("price",e.target.value)} onFocus={()=>setFocused("price")} onBlur={()=>setFocused(null)} placeholder="4500" style={iStyle("price") as any} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Stock Qty *</label>
              <input type="number" value={form.stock} onChange={e=>set("stock",e.target.value)} onFocus={()=>setFocused("stock")} onBlur={()=>setFocused(null)} placeholder="20" style={iStyle("stock") as any} />
            </div>
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase mb-1" style={{color:"rgba(255,255,255,0.3)"}}>Description</label>
              <textarea value={form.description} onChange={e=>set("description",e.target.value)} onFocus={()=>setFocused("desc")} onBlur={()=>setFocused(null)} placeholder="Describe your product..." rows={3} style={{...iStyle("desc") as any,resize:"none"}} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div><p className="text-white font-bold text-sm">Visible to buyers</p><p className="text-white/25 text-xs mt-0.5">Show in store</p></div>
              <button onClick={()=>set("is_active",!form.is_active)} className="relative cursor-pointer" style={{width:50,height:26}}>
                <div className="absolute inset-0 rounded-full transition-all" style={{background:form.is_active?ac:"rgba(255,255,255,0.1)"}} />
                <div className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg transition-all" style={{left:form.is_active?26:4}} />
              </button>
            </div>
            <button onClick={handleSave} disabled={loading||!form.name||!form.price} className="w-full py-4 font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all rounded-2xl disabled:opacity-40 mt-1" style={{background:`linear-gradient(135deg,${ac},${ac}aa)`,boxShadow:`0 8px 28px ${ac}40`}}>
              {loading?<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving...</span>:`${product?"Update":"Add"} Product ✦`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── StoreEditor ── */
const StoreEditor = ({ store, onBack }: Props) => {
  const [tab, setTab]             = useState<"products"|"orders">("products");
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editProd, setEditProd]   = useState<Product|null>(null);
  const [delId, setDelId]         = useState<number|null>(null);
  const [hovId, setHovId]         = useState<number|null>(null);
  const [updating, setUpdating]   = useState<number|null>(null);

  const ac = store.accent_color || "#E87722";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes,oRes] = await Promise.all([
        authFetch(`${API_URL}/products/?store=${store.id}`),
        authFetch(`${API_URL}/orders/?store=${store.id}`),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setProducts(d.results??d); }
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.results??d); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); },[store.id]);

  const delProduct = async (id:number,e:React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this product?")) return;
    setDelId(id);
    await authFetch(`${API_URL}/products/${id}/`,{method:"DELETE"});
    setDelId(null); fetchAll();
  };

  const toggleActive = async (id:number,active:boolean,e:React.MouseEvent) => {
    e.stopPropagation();
    await authFetch(`${API_URL}/products/${id}/`,{method:"PATCH",body:JSON.stringify({is_active:!active})});
    fetchAll();
  };

  const updateStatus = async (id:number,status:string) => {
    setUpdating(id);
    await authFetch(`${API_URL}/orders/${id}/update_status/`,{method:"PATCH",body:JSON.stringify({status})});
    setUpdating(null); fetchAll();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes feIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fe-card{animation:feIn 0.45s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6" style={{background:`linear-gradient(135deg,${ac}20,${ac}06)`,border:`1px solid ${ac}25`}}>
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`radial-gradient(circle,white 1px,transparent 1px)`,backgroundSize:"20px 20px"}} />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-20" style={{backgroundColor:ac}} />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0 font-bold" style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",color:"white",border:`1px solid ${ac}40`}}>←</button>
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl overflow-hidden shadow-xl shrink-0" style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 8px 24px ${ac}50`}}>
                {store.logo_url ? <img src={store.logo_url} className="h-full w-full object-cover" /> : nicheEmoji[store.niche]||"🏪"}
              </div>
              <div>
                <h2 className="font-black text-white text-2xl leading-tight" style={{fontFamily:"Syne,sans-serif",textShadow:`0 2px 12px ${ac}60`}}>{store.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${store.is_live?"bg-green-400 animate-pulse":"bg-white/30"}`} />
                  <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white font-mono transition-colors">bazario.dz/{store.slug} ↗</a>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all" style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",color:"white",border:"1px solid rgba(255,255,255,0.2)"}}>
                👁 View Store
              </a>
              <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white cursor-pointer active:scale-95 transition-all shadow-xl" style={{background:`linear-gradient(135deg,${ac},${ac}cc)`,boxShadow:`0 4px 16px ${ac}50`}}>
                + Add Product
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              {label:"Products",value:products.length,icon:"📦"},
              {label:"Orders",  value:orders.length,  icon:"🧾"},
              {label:"Revenue", value:`${orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+Number(o.total),0).toLocaleString()} DA`,icon:"💰"},
            ].map(s=>(
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-2xl" style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)"}}>
                <span className="text-xl">{s.icon}</span>
                <div><p className="text-white font-black text-lg leading-none">{s.value}</p><p className="text-white/50 text-[10px] mt-0.5 uppercase tracking-wide">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{background:"rgba(0,0,0,0.04)"}}>
          {[{id:"products",label:"📦 Products",count:products.length},{id:"orders",label:"🧾 Orders",count:orders.length}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300"
              style={{background:tab===t.id?"white":"transparent",color:tab===t.id?ac:"#9ca3af",boxShadow:tab===t.id?"0 2px 10px rgba(0,0,0,0.08)":"none"}}>
              {t.label}
              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-black" style={{background:tab===t.id?`${ac}15`:"rgba(0,0,0,0.06)",color:tab===t.id?ac:"#9ca3af"}}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:`${ac} transparent transparent transparent`}} />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : (
          <>
            {/* Products */}
            {tab==="products" && (
              products.length===0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-3xl" style={{background:"rgba(0,0,0,0.02)",border:"2px dashed rgba(0,0,0,0.07)"}}>
                  <div className="text-5xl opacity-20">📦</div>
                  <div className="text-center"><p className="font-black text-gray-700">No products yet</p><p className="text-gray-400 text-sm mt-1">Add your first product to start selling</p></div>
                  <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white text-sm cursor-pointer active:scale-95 shadow-xl" style={{background:`linear-gradient(135deg,${ac},${ac}cc)`}}>+ Add First Product</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((p,idx)=>{
                    const isH = hovId===p.id;
                    return (
                      <div key={p.id} className="fe-card relative rounded-2xl overflow-hidden cursor-pointer bg-white" style={{animationDelay:`${idx*55}ms`,border:"1px solid rgba(0,0,0,0.07)",transition:"all 0.4s cubic-bezier(0.34,1.2,0.64,1)",boxShadow:isH?`0 20px 50px -12px ${ac}25,0 4px 16px rgba(0,0,0,0.08)`:"0 2px 8px rgba(0,0,0,0.05)",transform:isH?"translateY(-6px)":"translateY(0)"}}
                        onMouseEnter={()=>setHovId(p.id)} onMouseLeave={()=>setHovId(null)}>
                        <div className="relative overflow-hidden" style={{height:180,background:`${ac}08`}}>
                          {p.image?<img src={p.image} alt={p.name} className="w-full h-full object-cover" style={{transition:"transform 0.5s",transform:isH?"scale(1.08)":"scale(1)"}}/>:<div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 transition-all" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",opacity:isH?1:0}}>
                            <button onClick={()=>setEditProd(p)} className="h-10 w-10 rounded-xl bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg text-base">✏️</button>
                            <button onClick={e=>delProduct(p.id,e)} disabled={delId===p.id} className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg text-base disabled:opacity-40">🗑</button>
                          </div>
                          {p.stock<=5&&p.stock>0&&<div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-lg" style={{background:"#f59e0b15",border:"1px solid #f59e0b40",color:"#d97706"}}>⚠ {p.stock} left</div>}
                          {p.stock===0&&<div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-lg" style={{background:"#ef444415",border:"1px solid #ef444440",color:"#ef4444"}}>Sold Out</div>}
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer" style={{background:p.is_active?"#22c55e15":"rgba(0,0,0,0.35)",border:`1px solid ${p.is_active?"#22c55e30":"rgba(255,255,255,0.1)"}`}} onClick={e=>toggleActive(p.id,p.is_active,e)}>
                            <div className={`h-1.5 w-1.5 rounded-full ${p.is_active?"bg-green-500 animate-pulse":"bg-gray-400"}`}/>
                            <span className="text-[9px] font-black" style={{color:p.is_active?"#22c55e":"rgba(255,255,255,0.4)"}}>{p.is_active?"Live":"Off"}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-gray-900 text-sm leading-tight">{p.name}</h4>
                            <span className="font-black text-sm shrink-0" style={{color:ac}}>{Number(p.price).toLocaleString()} DA</span>
                          </div>
                          {p.description&&<p className="text-gray-400 text-xs mt-1 line-clamp-2">{p.description}</p>}
                          <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop:"1px solid rgba(0,0,0,0.05)"}}>
                            <span className="text-xs text-gray-400">{p.stock} in stock</span>
                            <button onClick={()=>setEditProd(p)} className="text-xs font-bold cursor-pointer hover:underline" style={{color:ac}}>Edit →</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Orders */}
            {tab==="orders" && (
              orders.length===0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 gap-4">
                  <span className="text-5xl opacity-20">🧾</span>
                  <p className="text-gray-400 font-black">No orders for this store yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order,i)=>{
                    const sc = SC[order.status]||SC.pending;
                    return (
                      <div key={order.id} className="fe-card bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300" style={{animationDelay:`${i*50}ms`}}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl flex items-center justify-center font-black shrink-0 text-sm" style={{background:`${ac}15`,color:ac}}>#{String(order.id).padStart(2,"0")}</div>
                            <div>
                              <p className="font-black text-gray-900">{order.customer_name}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                <span className="text-gray-400 text-xs">{order.customer_email}</span>
                                {order.customer_phone&&<span className="text-gray-400 text-xs">📞 {order.customer_phone}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-black text-gray-900">{Number(order.total).toLocaleString()} <span className="text-gray-400 font-normal text-xs">DA</span></span>
                            <span className="px-3 py-1 rounded-full text-xs font-black capitalize" style={{background:sc.bg,color:sc.color}}>{order.status}</span>
                            <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString("fr-DZ")}</span>
                            <select value={order.status} onChange={e=>updateStatus(order.id,e.target.value)} disabled={updating===order.id}
                              className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer bg-white transition-all disabled:opacity-50" style={{"--tw-border-opacity":"1"} as any}>
                              {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        {order.items&&order.items.length>0&&(
                          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items.map(item=>(
                              <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                                <span className="font-semibold">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                                <span className="font-black text-gray-700">{Number(item.unit_price*item.quantity).toLocaleString()} DA</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>

      {(showAdd||editProd)&&(
        <ProductModal storeId={store.id} product={editProd} ac={ac}
          onClose={()=>{setShowAdd(false);setEditProd(null);}}
          onSaved={()=>{setShowAdd(false);setEditProd(null);fetchAll();}} />
      )}
    </>
  );
};

export default StoreEditor;