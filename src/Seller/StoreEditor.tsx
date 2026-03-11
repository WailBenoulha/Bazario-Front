import { useState, useEffect, useRef } from "react";
import { type Store, API_URL, authFetch, statusColors } from "./sellerTypes";

interface Props { store: Store; onBack: () => void; onRefresh: () => void; }
interface Product { id:number; name:string; description:string; price:number; stock:number; is_active:boolean; image?:string; }
interface Order { id:number; customer_name:string; customer_email:string; status:string; total:number; created_at:string; }

const STATUS_OPTIONS = ["pending","processing","delivered","cancelled"];
const STATUS_COLORS: Record<string,{bg:string;text:string}> = {
  pending:    { bg:"#f59e0b18", text:"#fbbf24" },
  processing: { bg:"#3b82f618", text:"#60a5fa" },
  delivered:  { bg:"#22c55e18", text:"#4ade80" },
  cancelled:  { bg:"#ef444418", text:"#f87171" },
};

/* ─── Product Modal ─── */
const ProductModal = ({ storeId, product, ac, onClose, onSaved }:
  { storeId:number; product:Product|null; ac:string; onClose:()=>void; onSaved:()=>void }) => {
  const [form, setForm] = useState({ name:product?.name||"", description:product?.description||"", price:product?.price?String(product.price):"", stock:product?.stock?String(product.stock):"", is_active:product?.is_active??true });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [focused, setFocused] = useState<string|null>(null);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(product?.image||null);
  const imgRef = useRef<HTMLInputElement>(null);

  const set = (k:string, v:any) => setForm(f=>({...f,[k]:v}));

  const handleImageChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const inputStyle = (f:string):React.CSSProperties => ({
    background: focused===f ? `${ac}10` : "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[f] ? "#ef4444" : focused===f ? ac : "rgba(255,255,255,0.1)"}`,
    borderRadius: 12, color:"white", width:"100%", padding:"12px 14px", fontSize:13,
    boxShadow: focused===f ? `0 0 0 3px ${ac}18` : "none",
    transition:"all 0.2s ease", outline:"none",
  });

  const handleSave = async () => {
    setLoading(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("description", form.description);
      fd.append("price", form.price); fd.append("stock", form.stock);
      fd.append("is_active", String(form.is_active)); fd.append("store", String(storeId));
      if (imageFile) fd.append("image", imageFile);

      const url    = product ? `${API_URL}/products/${product.id}/` : `${API_URL}/products/`;
      const method = product ? "PATCH" : "POST";
      const res    = await authFetch(url, { method, body: fd, headers: {} });
      const data   = await res.json();
      if (!res.ok) { setErrors(data); return; }
      onSaved();
    } catch { setErrors({ general:"Network error." }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(16px)" }} onClick={onClose}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}.prod-modal{animation:modalIn 0.4s cubic-bezier(0.34,1.1,0.64,1) both}`}</style>
      <div
        className="prod-modal relative w-full max-w-lg overflow-hidden"
        style={{ background:"linear-gradient(145deg,#0e0e0e,#141414)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, maxHeight:"90vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background:`linear-gradient(to right, transparent, ${ac}, transparent)` }} />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-white/30 hover:text-white" style={{ background:"rgba(255,255,255,0.08)" }}>✕</button>

        <div className="p-7">
          <h3 className="text-white font-black text-xl mb-6" style={{ fontFamily:"Syne, sans-serif" }}>{product ? "Edit Product" : "Add New Product"}</h3>

          {errors.general && <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-xs" style={{ background:"#ef444415", border:"1px solid #ef444430" }}>{errors.general}</div>}

          {/* Image upload */}
          <div className="mb-5">
            <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color:"rgba(255,255,255,0.35)" }}>Product Photo</label>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <button
              onClick={() => imgRef.current?.click()}
              className="relative w-full overflow-hidden cursor-pointer transition-all duration-300 group"
              style={{ height: imagePreview ? 200 : 120, background:"rgba(255,255,255,0.04)", border:`2px dashed ${imagePreview ? ac : "rgba(255,255,255,0.12)"}`, borderRadius:16 }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
                    <p className="text-white font-black text-sm">📷 Change Photo</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-3xl opacity-30">📷</span>
                  <p className="text-white/30 text-xs font-semibold">Click to upload product photo</p>
                  <p className="text-white/15 text-[10px]">PNG, JPG, WEBP · Max 10MB</p>
                </div>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Name & price row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color:"rgba(255,255,255,0.35)" }}>Product Name *</label>
                <input value={form.name} onChange={e=>set("name",e.target.value)} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} placeholder="Air Max Pro" style={inputStyle("name") as any} />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">⚠ {errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color:"rgba(255,255,255,0.35)" }}>Price (DA) *</label>
                <input type="number" value={form.price} onChange={e=>set("price",e.target.value)} onFocus={()=>setFocused("price")} onBlur={()=>setFocused(null)} placeholder="4500" style={inputStyle("price") as any} />
                {errors.price && <p className="text-red-400 text-[10px] mt-1">⚠ {errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color:"rgba(255,255,255,0.35)" }}>Stock Qty *</label>
              <input type="number" value={form.stock} onChange={e=>set("stock",e.target.value)} onFocus={()=>setFocused("stock")} onBlur={()=>setFocused(null)} placeholder="20" style={inputStyle("stock") as any} />
            </div>

            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color:"rgba(255,255,255,0.35)" }}>Description</label>
              <textarea value={form.description} onChange={e=>set("description",e.target.value)} onFocus={()=>setFocused("desc")} onBlur={()=>setFocused(null)} placeholder="Describe your product..." rows={3} style={{ ...inputStyle("desc") as any, resize:"none" }} />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-white font-bold text-sm">Visible to buyers</p>
                <p className="text-white/30 text-xs mt-0.5">Show this product in your store</p>
              </div>
              <button onClick={()=>set("is_active",!form.is_active)} className="relative cursor-pointer transition-all duration-300" style={{ width:52, height:28 }}>
                <div className="absolute inset-0 rounded-full transition-all duration-300" style={{ background: form.is_active ? ac : "rgba(255,255,255,0.1)" }} />
                <div className="absolute top-1 transition-all duration-300 h-5 w-5 rounded-full bg-white shadow-lg" style={{ left: form.is_active ? 26 : 4 }} />
              </button>
            </div>

            <button
              onClick={handleSave} disabled={loading||!form.name||!form.price}
              className="w-full py-4 font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-40 rounded-2xl mt-1"
              style={{ background:`linear-gradient(135deg, ${ac}, ${ac}aa)`, boxShadow:`0 8px 32px ${ac}45` }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</span>
                : `${product ? "Update" : "Add"} Product ✦`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── StoreEditor ─── */
const StoreEditor = ({ store, onBack }: Props) => {
  const [tab, setTab]             = useState<"products"|"orders">("products");
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAddProd, setShowAddProd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product|null>(null);
  const [deletingId, setDeletingId]   = useState<number|null>(null);
  const [hoveredId, setHoveredId]     = useState<number|null>(null);

  const ac = (store as any).accent_color || "#E87722";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        authFetch(`${API_URL}/products/?store=${store.id}`),
        authFetch(`${API_URL}/orders/?store=${store.id}`),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setProducts(d.results??d); }
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.results??d); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [store.id]);

  const deleteProduct = async (id:number, e:React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    await authFetch(`${API_URL}/products/${id}/`, { method:"DELETE" });
    setDeletingId(null); fetchAll();
  };

  const toggleProduct = async (id:number, active:boolean, e:React.MouseEvent) => {
    e.stopPropagation();
    await authFetch(`${API_URL}/products/${id}/`, { method:"PATCH", body:JSON.stringify({ is_active:!active }) });
    fetchAll();
  };

  const updateOrderStatus = async (id:number, status:string) => {
    await authFetch(`${API_URL}/orders/${id}/update_status/`, { method:"PATCH", body:JSON.stringify({ status }) });
    fetchAll();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)} }
        .prod-card { animation: fadeUp 0.45s cubic-bezier(0.34,1.1,0.64,1) both; }
      `}</style>

      <div className="flex flex-col gap-6 min-h-full">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
              style={{ background:"rgba(0,0,0,0.06)", color:"#374151" }}
            >
              ←
            </button>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl overflow-hidden shadow-lg shrink-0"
              style={{ background:`linear-gradient(135deg, ${ac}, ${ac}bb)`, boxShadow:`0 4px 16px ${ac}40` }}>
              {(store as any).logo_url ? <img src={(store as any).logo_url} className="h-full w-full object-cover" /> : "🏪"}
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-2xl leading-tight" style={{ fontFamily:"Syne, sans-serif" }}>{store.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`h-1.5 w-1.5 rounded-full ${store.is_live?"bg-green-500 animate-pulse":"bg-gray-400"}`} />
                <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-blue-500 transition-colors font-mono">
                  bazario.dz/{store.slug} ↗
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200"
              style={{ background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.08)", color:"#374151" }}>
              👁 Preview
            </a>
            <button
              onClick={() => setShowAddProd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white cursor-pointer active:scale-95 transition-all duration-200 shadow-lg"
              style={{ background:`linear-gradient(135deg, ${ac}, ${ac}cc)`, boxShadow:`0 4px 16px ${ac}40` }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ background:"rgba(0,0,0,0.04)" }}>
          {[
            { id:"products", label:"Products", count:products.length, icon:"📦" },
            { id:"orders",   label:"Orders",   count:orders.length,   icon:"🧾" },
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300"
              style={{
                background: tab===t.id ? "white" : "transparent",
                color: tab===t.id ? ac : "#9ca3af",
                boxShadow: tab===t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span>{t.icon}</span> {t.label}
              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-black" style={{ background:tab===t.id?`${ac}15`:"rgba(0,0,0,0.06)", color:tab===t.id?ac:"#9ca3af" }}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor:`${ac} transparent transparent transparent` }} />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : (
          <>
            {/* ── Products ── */}
            {tab==="products" && (
              products.length===0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-3xl" style={{ background:"rgba(0,0,0,0.02)", border:"2px dashed rgba(0,0,0,0.06)" }}>
                  <div className="text-5xl opacity-20">📦</div>
                  <div className="text-center">
                    <p className="font-black text-gray-700">No products yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your first product to start selling</p>
                  </div>
                  <button onClick={()=>setShowAddProd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white text-sm cursor-pointer active:scale-95 shadow-xl"
                    style={{ background:`linear-gradient(135deg, ${ac}, ${ac}cc)` }}>
                    + Add First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product, idx) => {
                    const isHov = hoveredId===product.id;
                    return (
                      <div
                        key={product.id}
                        className="prod-card group relative rounded-2xl overflow-hidden cursor-pointer"
                        style={{
                          animationDelay:`${idx*60}ms`,
                          background:"white",
                          border:"1px solid rgba(0,0,0,0.07)",
                          transition:"all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
                          boxShadow: isHov ? `0 20px 50px -12px ${ac}25, 0 4px 16px rgba(0,0,0,0.08)` : "0 2px 8px rgba(0,0,0,0.05)",
                          transform: isHov ? "translateY(-6px)" : "translateY(0)",
                        }}
                        onMouseEnter={()=>setHoveredId(product.id)}
                        onMouseLeave={()=>setHoveredId(null)}
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden" style={{ height:180, background:`${ac}08` }}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500" style={{ transform:isHov?"scale(1.08)":"scale(1)" }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl" style={{ opacity:0.3 }}>📦</div>
                          )}
                          {/* Overlay actions on hover */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300" style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", opacity:isHov?1:0 }}>
                            <button onClick={()=>setEditProduct(product)} className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-700 cursor-pointer hover:scale-110 transition-transform shadow-lg">✏️</button>
                            <button onClick={e=>deleteProduct(product.id,e)} disabled={deletingId===product.id} className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg disabled:opacity-40">🗑</button>
                          </div>

                          {product.stock<=5 && product.stock>0 && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-lg" style={{ background:"#f59e0b18", border:"1px solid #f59e0b40", color:"#d97706" }}>⚠ {product.stock} left</div>
                          )}
                          {product.stock===0 && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-lg" style={{ background:"#ef444418", border:"1px solid #ef444440", color:"#ef4444" }}>Out of Stock</div>
                          )}

                          {/* Active dot */}
                          <div
                            className="absolute top-2 right-2 h-6 px-2 rounded-lg flex items-center gap-1 cursor-pointer"
                            style={{ background:product.is_active?"#22c55e18":"rgba(0,0,0,0.3)", border:`1px solid ${product.is_active?"#22c55e30":"rgba(255,255,255,0.1)"}` }}
                            onClick={e=>toggleProduct(product.id,product.is_active,e)}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${product.is_active?"bg-green-500 animate-pulse":"bg-gray-400"}`} />
                            <span className="text-[9px] font-black" style={{ color:product.is_active?"#22c55e":"rgba(255,255,255,0.4)" }}>{product.is_active?"Live":"Off"}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-gray-900 text-sm leading-tight">{product.name}</h4>
                            <span className="font-black text-sm shrink-0" style={{ color:ac }}>{Number(product.price).toLocaleString()} DA</span>
                          </div>
                          {product.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>}
                          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop:"1px solid rgba(0,0,0,0.05)" }}>
                            <span className="text-xs text-gray-400">{product.stock} in stock</span>
                            <button onClick={()=>setEditProduct(product)} className="text-xs font-bold cursor-pointer transition-all hover:underline" style={{ color:ac }}>Edit →</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── Orders ── */}
            {tab==="orders" && (
              <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(0,0,0,0.07)", background:"white" }}>
                <div className="grid gap-3 px-6 py-4" style={{ gridTemplateColumns:"60px 1fr 100px 110px 80px 120px", background:"rgba(0,0,0,0.02)", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
                  {["#","Customer","Amount","Status","Date","Action"].map(h=>(
                    <span key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</span>
                  ))}
                </div>

                {orders.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="text-4xl opacity-20">🧾</span>
                    <p className="text-gray-400 text-sm">No orders yet</p>
                  </div>
                ) : orders.map((order,i)=>{
                  const sc = STATUS_COLORS[order.status]||STATUS_COLORS.pending;
                  return (
                    <div key={order.id}
                      className="grid gap-3 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors duration-200"
                      style={{ gridTemplateColumns:"60px 1fr 100px 110px 80px 120px", borderBottom:i<orders.length-1?"1px solid rgba(0,0,0,0.04)":"none", animation:`slideIn 0.3s ${i*50}ms both` }}
                    >
                      <span className="font-black text-sm" style={{ color:ac }}>#{String(order.id).padStart(3,"0")}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-xs truncate">{order.customer_name}</p>
                        <p className="text-gray-400 text-[10px] truncate">{order.customer_email}</p>
                      </div>
                      <span className="font-black text-sm text-gray-900 tabular-nums">{Number(order.total).toLocaleString()}<span className="text-gray-400 text-xs font-normal"> DA</span></span>
                      <div className="px-2.5 py-1 rounded-full text-[10px] font-black capitalize w-fit" style={{ background:sc.bg, color:sc.text }}>{order.status}</div>
                      <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</span>
                      <select
                        value={order.status}
                        onChange={e=>updateOrderStatus(order.id,e.target.value)}
                        className="text-xs border rounded-xl px-2 py-2 cursor-pointer focus:outline-none transition-all bg-white"
                        style={{ borderColor:"rgba(0,0,0,0.1)", color:"#374151" }}
                      >
                        {STATUS_OPTIONS.map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {(showAddProd||editProduct) && (
        <ProductModal
          storeId={store.id} product={editProduct} ac={ac}
          onClose={()=>{ setShowAddProd(false); setEditProduct(null); }}
          onSaved={()=>{ setShowAddProd(false); setEditProduct(null); fetchAll(); }}
        />
      )}
    </>
  );
};

export default StoreEditor;