import { useState, useEffect, useRef } from "react";
import { type Store, type Product, type Order, type ProductImage, type ProductColor, type ProductSize, type Category, API_URL, authFetch, NICHE_SIZES } from "./sellerTypes";
import {
  FiSmartphone, FiMonitor, FiTablet, FiHeadphones, FiCamera, FiTv, FiCpu, FiPrinter,
  FiShoppingBag, FiWatch, FiSunrise, FiStar,
  FiPackage, FiArchive, FiBox, FiGift, FiShoppingCart,
  FiHome, FiTool, FiZap, FiMusic, FiBook, FiBookOpen,
  FiHeart, FiActivity, FiAward, FiTrendingUp,
  FiCoffee, FiDroplet, FiFeather, FiLayers,
  FiGrid, FiTag, FiSliders, FiServer
} from "react-icons/fi";
import {
  MdSportsSoccer, MdSportsBasketball, MdOutlineFaceRetouchingNatural,
  MdOutlineLocalGroceryStore, MdOutlineChildCare, MdOutlinePets,
  MdOutlineDirectionsCar, MdOutlineHealthAndSafety, MdOutlineDesktopWindows
} from "react-icons/md";
import { GiRunningShoe, GiDress, GiJewelCrown, GiLipstick, GiSofa, GiPlantRoots } from "react-icons/gi";



type Theme = "light" | "dark";

/* ── Icon registry — key stored in DB, component rendered in UI ── */
const ICON_MAP: Record<string, React.ComponentType<{size?:number;color?:string}>> = {
  // Electronics
  FiSmartphone, FiMonitor, FiTablet, FiHeadphones, FiCamera, FiTv, FiCpu, FiPrinter,
  MdOutlineDesktopWindows,
  // Fashion & Accessories
  FiShoppingBag, FiWatch, GiRunningShoe, GiDress, GiJewelCrown,
  // Beauty & Health
  GiLipstick, MdOutlineFaceRetouchingNatural, MdOutlineHealthAndSafety, FiDroplet, FiFeather,
  // Sports
  MdSportsSoccer, MdSportsBasketball, FiActivity, FiAward,
  // Food & Grocery
  FiCoffee, MdOutlineLocalGroceryStore,
  // Home & Furniture
  FiHome, GiSofa, FiTool,
  // Kids & Pets
  MdOutlineChildCare, MdOutlinePets,
  // Auto
  MdOutlineDirectionsCar,
  // Education & Books
  FiBook, FiBookOpen, FiMusic,
  // General
  FiPackage, FiArchive, FiBox, FiGift, FiShoppingCart, FiStar, FiSunrise,
  FiHeart, FiTrendingUp, FiZap, FiGrid, FiTag, FiSliders, FiServer, FiLayers,
  GiPlantRoots,
};

const ICON_GROUPS = [
  { label: "Electronics",   keys: ["FiSmartphone","FiTablet","FiMonitor","MdOutlineDesktopWindows","FiHeadphones","FiCamera","FiTv","FiCpu","FiPrinter"] },
  { label: "Fashion",       keys: ["FiShoppingBag","GiRunningShoe","GiDress","FiWatch","GiJewelCrown"] },
  { label: "Beauty",        keys: ["GiLipstick","MdOutlineFaceRetouchingNatural","FiDroplet","FiFeather","MdOutlineHealthAndSafety"] },
  { label: "Sports",        keys: ["MdSportsSoccer","MdSportsBasketball","FiActivity","FiAward"] },
  { label: "Food",          keys: ["FiCoffee","MdOutlineLocalGroceryStore"] },
  { label: "Home",          keys: ["FiHome","GiSofa","FiTool","GiPlantRoots"] },
  { label: "Kids & Pets",   keys: ["MdOutlineChildCare","MdOutlinePets"] },
  { label: "Auto",          keys: ["MdOutlineDirectionsCar"] },
  { label: "Education",     keys: ["FiBook","FiBookOpen","FiMusic"] },
  { label: "General",       keys: ["FiPackage","FiBox","FiGift","FiShoppingCart","FiStar","FiHeart","FiTrendingUp","FiZap","FiTag","FiGrid","FiLayers"] },
];

/* Helper to render an icon by its string key */
const CatIcon = ({ iconKey, size=18, color }: { iconKey?:string; size?:number; color?:string }) => {
  const Comp = iconKey ? ICON_MAP[iconKey] : FiPackage;
  return Comp ? <Comp size={size} color={color}/> : <FiPackage size={size} color={color}/>;
};

const TK = {
  dark: {
    bg:"#0c0c0c", panel:"#141414", border:"rgba(255,255,255,0.07)", borderHov:"rgba(255,255,255,0.18)",
    text:"#f8f8f8", textSub:"rgba(255,255,255,0.6)", textMuted:"rgba(255,255,255,0.3)",
    inputBg:"rgba(255,255,255,0.06)", inputBorder:"rgba(255,255,255,0.11)",
    divider:"rgba(255,255,255,0.06)", chip:"rgba(255,255,255,0.07)", chipBorder:"rgba(255,255,255,0.1)",
    tabBg:"rgba(255,255,255,0.04)", sectionBg:"rgba(255,255,255,0.03)",
  },
  light: {
    bg:"#ede9e3", panel:"#ffffff", border:"rgba(0,0,0,0.07)", borderHov:"rgba(0,0,0,0.2)",
    text:"#111111", textSub:"#3d3d3d", textMuted:"#999999",
    inputBg:"rgba(0,0,0,0.035)", inputBorder:"rgba(0,0,0,0.1)",
    divider:"rgba(0,0,0,0.07)", chip:"rgba(0,0,0,0.04)", chipBorder:"rgba(0,0,0,0.09)",
    tabBg:"rgba(0,0,0,0.03)", sectionBg:"rgba(0,0,0,0.02)",
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
   MULTI-IMAGE UPLOADER
══════════════════════════════ */
interface ImgSlot { file?: File; url?: string; id?: number; isPrimary?: boolean; }

const ImageUploader = ({
  slots, onChange, ac, theme
}: {
  slots: ImgSlot[]; onChange: (s: ImgSlot[]) => void; ac: string; theme: Theme;
}) => {
  const tk = TK[theme];
  const isDark = theme === "dark";
  const MAX = 12;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, MAX - slots.length);
    const newSlots: ImgSlot[] = arr.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    onChange([...slots, ...newSlots]);
  };

  const setPrimary = (i: number) => {
    onChange(slots.map((s, idx) => ({ ...s, isPrimary: idx === i })));
  };

  const remove = (i: number) => {
    const updated = slots.filter((_, idx) => idx !== i);
    if (slots[i].isPrimary && updated.length > 0) updated[0].isPrimary = true;
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black tracking-widest uppercase" style={{color:tk.textMuted}}>
          Product Photos ({slots.length}/{MAX})
        </label>
        {slots.length > 0 && (
          <span className="text-[10px]" style={{color:tk.textMuted}}>Click photo to set as main</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((s, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
            style={{border:`2px solid ${s.isPrimary ? ac : tk.border}`,boxShadow:s.isPrimary?`0 0 0 1px ${ac}30`:undefined}}
            onClick={() => setPrimary(i)}>
            <img src={s.url} alt="" className="w-full h-full object-cover"/>
            {s.isPrimary && (
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black" style={{background:ac,color:"white"}}>MAIN</div>
            )}
            <button
              onClick={e => { e.stopPropagation(); remove(i); }}
              className="absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{background:"rgba(239,68,68,0.9)",color:"white"}}>✕</button>
          </div>
        ))}
        {slots.length < MAX && (
          <label className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer gap-1.5 transition-all"
            style={{border:`1.5px dashed ${tk.inputBorder}`,background:tk.inputBg}}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=ac)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=tk.inputBorder)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:tk.textMuted}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="text-[9px] font-bold" style={{color:tk.textMuted}}>Add</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)}/>
          </label>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════
   SIZES MANAGER
══════════════════════════════ */
const SizesManager = ({
  sizes, onChange, ac, theme, storeNiche
}: {
  sizes: {label:string;stock:number}[]; onChange: (s:{label:string;stock:number}[]) => void;
  ac: string; theme: Theme; storeNiche: string;
}) => {
  const tk = TK[theme];
  const [newLabel, setNewLabel] = useState("");
  const defaults = NICHE_SIZES[storeNiche] || [];

  const addSize = (label: string) => {
    if (!label.trim() || sizes.find(s => s.label === label)) return;
    onChange([...sizes, { label: label.trim(), stock: 0 }]);
    setNewLabel("");
  };

  const removeSize = (i: number) => onChange(sizes.filter((_, idx) => idx !== i));
  const updateStock = (i: number, stock: number) => onChange(sizes.map((s, idx) => idx === i ? {...s, stock} : s));

  return (
    <div className="p-4 rounded-2xl" style={{background:tk.sectionBg,border:`1px solid ${tk.border}`}}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black tracking-widest uppercase" style={{color:tk.textMuted}}>Sizes & Stock per Size</span>
      </div>

      {/* Quick-add default sizes */}
      {defaults.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {defaults.map(d => {
            const exists = sizes.find(s => s.label === d);
            return (
              <button key={d} onClick={() => addSize(d)} disabled={!!exists}
                className="px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all"
                style={{background:exists?`${ac}20`:"transparent",border:`1px solid ${exists?ac:tk.border}`,color:exists?ac:tk.textMuted,opacity:exists?0.7:1}}>
                {d} {exists ? "✓" : "+"}
              </button>
            );
          })}
        </div>
      )}

      {/* Current sizes */}
      {sizes.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-black w-10 text-center px-2 py-1.5 rounded-lg" style={{background:`${ac}15`,color:ac,border:`1px solid ${ac}30`}}>
                {s.label}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <input type="number" min="0" value={s.stock}
                  onChange={e => updateStock(i, Math.max(0, Number(e.target.value)))}
                  className="w-full text-sm text-center py-1.5 rounded-lg"
                  style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}
                  placeholder="Stock"/>
                <span className="text-[10px]" style={{color:tk.textMuted}}>units</span>
              </div>
              <button onClick={() => removeSize(i)} className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] cursor-pointer"
                style={{background:"rgba(239,68,68,0.12)",color:"#ef4444"}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Custom size input */}
      <div className="flex gap-2">
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addSize(newLabel)}
          placeholder="Custom size..." className="flex-1 text-xs py-2 px-3 rounded-lg"
          style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}/>
        <button onClick={() => addSize(newLabel)}
          className="px-3 py-2 rounded-lg text-xs font-black cursor-pointer"
          style={{background:`${ac}20`,border:`1px solid ${ac}40`,color:ac}}>
          + Add
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   COLORS MANAGER
══════════════════════════════ */
const ColorsManager = ({
  colors, onChange, ac, theme
}: {
  colors: {name:string;hex:string}[]; onChange: (c:{name:string;hex:string}[]) => void;
  ac: string; theme: Theme;
}) => {
  const tk = TK[theme];
  const [newName, setNewName] = useState("");
  const [newHex,  setNewHex]  = useState("#000000");

  const addColor = () => {
    if (!newName.trim()) return;
    onChange([...colors, { name: newName.trim(), hex: newHex }]);
    setNewName(""); setNewHex("#000000");
  };
  const removeColor = (i: number) => onChange(colors.filter((_, idx) => idx !== i));

  const PRESETS = ["#000000","#ffffff","#ff0000","#0066cc","#22c55e","#f59e0b","#ec4899","#8b5cf6","#6b7280","#f5f5f0"];

  return (
    <div className="p-4 rounded-2xl" style={{background:tk.sectionBg,border:`1px solid ${tk.border}`}}>
      <span className="block text-[10px] font-black tracking-widest uppercase mb-3" style={{color:tk.textMuted}}>Available Colors</span>

      {/* Current colors */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl group"
              style={{background:tk.chip,border:`1px solid ${tk.chipBorder}`}}>
              <div className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" style={{background:c.hex}}/>
              <span className="text-[11px] font-bold" style={{color:tk.textSub}}>{c.name}</span>
              <button onClick={() => removeColor(i)} className="text-[9px] opacity-0 group-hover:opacity-100 ml-0.5 transition-opacity" style={{color:"#ef4444"}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map(hex => (
          <button key={hex} onClick={() => setNewHex(hex)} title={hex}
            className="h-6 w-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
            style={{background:hex,borderColor:newHex===hex?ac:"transparent",boxShadow:newHex===hex?`0 0 0 2px ${ac}40`:"none"}}/>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addColor()}
            placeholder="Color name (e.g. Ocean Blue)"
            className="w-full text-xs py-2 px-3 rounded-lg"
            style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}/>
        </div>
        <div className="relative shrink-0">
          <input type="color" value={newHex} onChange={e => setNewHex(e.target.value)}
            className="h-9 w-9 rounded-xl cursor-pointer border-0 p-0.5"
            style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`}}/>
        </div>
        <button onClick={addColor}
          className="px-3 py-2 rounded-lg text-xs font-black cursor-pointer shrink-0"
          style={{background:`${ac}20`,border:`1px solid ${ac}40`,color:ac}}>
          + Add
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   PRODUCT MODAL
══════════════════════════════ */
const ProductModal = ({
  product, storeId, storeNiche, theme, ac, categories, onClose, onSaved
}: {
  product: Product|null; storeId: number; storeNiche: string; theme: Theme; ac: string;
  categories: Category[];
  onClose: () => void; onSaved: () => void;
}) => {
  const tk = TK[theme];
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name:"", description:"", price:"", stock:"", is_active:true,
    material:"", weight:"", brand:"",
  });
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [imgSlots, setImgSlots]   = useState<ImgSlot[]>([]);
  const [sizes,    setSizes]      = useState<{label:string;stock:number}[]>([]);
  const [colors,   setColors]     = useState<{name:string;hex:string}[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [errors,   setErrors]     = useState<Record<string,string>>({});
  const [focused,  setFocused]    = useState("");
  const [section,  setSection]    = useState<"basic"|"images"|"variants"|"details">("basic");

  useEffect(() => {
    if (product) {
      setForm({name:product.name,description:product.description||"",price:String(product.price),stock:String(product.stock),is_active:product.is_active,material:product.material||"",weight:product.weight||"",brand:product.brand||""});
      setSelectedCatIds(product.categories || []);
      // Build image slots from existing images
      const existing: ImgSlot[] = [];
      if (product.images && product.images.length > 0) {
        product.images.sort((a,b)=>a.order-b.order).forEach((img,i) => {
          existing.push({ id: img.id, url: img.image_url, isPrimary: img.is_primary || i===0 });
        });
      } else if (product.image_url) {
        existing.push({ url: product.image_url, isPrimary: true });
      }
      setImgSlots(existing);
      setSizes(product.sizes?.map(s=>({label:s.label,stock:s.stock})) || []);
      setColors(product.colors?.map(c=>({name:c.name,hex:c.hex})) || []);
    }
  }, [product]);

  const handleSave = async () => {
    if (!form.name || !form.price) { setErrors({general:"Name and price are required"}); return; }
    setLoading(true); setErrors({});
    try {
      /* ── Step 1: Save / update the product ── */
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");
      fd.append("is_active", String(form.is_active));
      fd.append("store", String(storeId));
      if (form.material) fd.append("material", form.material);
      if (form.weight)   fd.append("weight",   form.weight);
      if (form.brand)    fd.append("brand",     form.brand);
      fd.append("categories_data", JSON.stringify(selectedCatIds));
      fd.append("sizes_data",  JSON.stringify(sizes));
      fd.append("colors_data", JSON.stringify(colors));

      // Primary image — the one marked as main
      const primarySlot = imgSlots.find(s => s.isPrimary) || imgSlots[0];
      if (primarySlot?.file) fd.append("image", primarySlot.file);

      const productUrl = product ? `${API_URL}/products/${product.id}/` : `${API_URL}/products/`;
      const res = await authFetch(productUrl, { method: product ? "PATCH" : "POST", body: fd });
      if (!res.ok) { const d = await res.json(); setErrors(d); return; }
      const saved = await res.json();
      const productId = saved.id;

      /* ── Step 2: Upload each extra image one by one ──
         We upload ALL new file slots (including primary again if needed),
         but skip slots that already have an `id` (already saved on server). */
      const newSlots = imgSlots.filter(s => s.file); // only new uploads (File object present)

      for (let i = 0; i < newSlots.length; i++) {
        const slot = newSlots[i];
        const isPrimary = slot === primarySlot;

        // Primary was already saved as product.image — still create a ProductImage
        // record for it so the gallery picks it up. Skip if it has no file.
        const ef = new FormData();
        ef.append("product", String(productId));
        ef.append("image",   slot.file!);
        ef.append("is_primary", String(isPrimary));
        ef.append("order", String(i));

        // Try to POST to product-images endpoint; ignore errors silently
        // (if endpoint doesn't exist yet, main image still saved above)
        try {
          await authFetch(`${API_URL}/product-images/`, { method: "POST", body: ef });
        } catch {
          // endpoint not wired yet — continue
        }
      }

      /* ── Step 3: Delete removed images ──
         Slots that have an id but were removed from imgSlots */
      if (product?.images) {
        const keptIds = new Set(imgSlots.filter(s => s.id).map(s => s.id));
        const removedImages = product.images.filter(img => !keptIds.has(img.id));
        for (const img of removedImages) {
          try {
            await authFetch(`${API_URL}/product-images/${img.id}/`, { method: "DELETE" });
          } catch { /* ignore */ }
        }
      }

      onSaved(); onClose();
    } catch (e) {
      setErrors({ general: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  };

  const iStyle = (f: string): React.CSSProperties => ({
    background: focused===f ? `${ac}0e` : tk.inputBg,
    border: `1px solid ${errors[f]?"#ef4444":focused===f?ac:tk.inputBorder}`,
    borderRadius: 12, color: tk.text, width: "100%", padding: "11px 14px", fontSize: 13,
    boxShadow: focused===f ? `0 0 0 3px ${ac}16` : "none", transition: "all 0.2s", outline: "none",
  });

  const SECTIONS = [
    { k:"basic",    label:"Details", icon:"📝" },
    { k:"images",   label:"Photos",  icon:"🖼️" },
    { k:"variants", label:"Variants",icon:"🎨" },
    { k:"details",  label:"Info",    icon:"📋" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4"
      style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(20px)"}} onClick={onClose}>
      <style>{`
        @keyframes modalPop{from{opacity:0;transform:scale(0.93) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .modal-pop{animation:modalPop 0.4s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>
      <div className="modal-pop relative w-full max-w-xl overflow-hidden"
        style={{background:isDark?"linear-gradient(160deg,#181818,#121212)":tk.panel,border:`1px solid ${ac}45`,borderRadius:28,boxShadow:`0 40px 80px -20px ${ac}40,0 0 0 1px ${ac}15`,maxHeight:"90vh",overflowY:"auto"}}
        onClick={e=>e.stopPropagation()}>
        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}}/>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-xl" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>
              {product ? "Edit Product" : "New Product"}
            </h3>
            <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-sm"
              style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.textMuted}}>✕</button>
          </div>

          {/* Section tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{background:tk.tabBg,border:`1px solid ${tk.border}`}}>
            {SECTIONS.map(s => (
              <button key={s.k} onClick={() => setSection(s.k)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[11px] cursor-pointer transition-all"
                style={{
                  background: section===s.k ? `linear-gradient(135deg,${ac},${ac}cc)` : "transparent",
                  color: section===s.k ? "white" : tk.textMuted,
                  boxShadow: section===s.k ? `0 3px 12px ${ac}40` : "none",
                }}>
                <span>{s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>

          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{background:"#ef444415",border:"1px solid #ef444330",color:"#f87171"}}>{errors.general}</div>
          )}

          {/* ── SECTION: BASIC ── */}
          {section === "basic" && (
            <div className="flex flex-col gap-3">
              {[
                {k:"name",label:"Product Name *",ph:"e.g. Premium Cotton T-Shirt",type:"text"},
                {k:"price",label:"Price (DA) *",ph:"e.g. 2500",type:"number"},
                {k:"stock",label:"Total Stock",ph:"e.g. 50",type:"number"},
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.k]} onChange={e=>setForm(v=>({...v,[f.k]:e.target.value}))} onFocus={()=>setFocused(f.k)} onBlur={()=>setFocused("")} placeholder={f.ph} style={iStyle(f.k)}/>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>Description</label>
                <textarea value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} onFocus={()=>setFocused("description")} onBlur={()=>setFocused("")} placeholder="Describe the product in detail..." rows={3} style={{...iStyle("description"),resize:"none"}}/>
              </div>
              {/* Categories — multi-select */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase mb-2" style={{color:tk.textMuted}}>
                    Categories <span style={{color:ac,fontWeight:400}}>({selectedCatIds.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => {
                      const selected = selectedCatIds.includes(c.id);
                      return (
                        <button key={c.id} type="button"
                          onClick={() => setSelectedCatIds(ids => selected ? ids.filter(i=>i!==c.id) : [...ids, c.id])}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: selected ? `${ac}20` : tk.inputBg,
                            border: `1.5px solid ${selected ? ac : tk.inputBorder}`,
                            color: selected ? ac : tk.textMuted,
                            boxShadow: selected ? `0 0 0 1px ${ac}20` : undefined,
                          }}>
                          <CatIcon iconKey={c.icon} size={13} color={selected ? ac : tk.textMuted}/>
                          <span className="text-xs font-bold">{c.name}</span>
                          {selected && <span style={{fontSize:10,fontWeight:900}}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-3.5 px-4 rounded-xl" style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`}}>
                <span className="text-sm font-bold" style={{color:tk.textSub}}>Visible to customers</span>
                <button onClick={()=>setForm(v=>({...v,is_active:!v.is_active}))} className="relative h-6 w-11 rounded-full cursor-pointer transition-all duration-300" style={{background:form.is_active?ac:tk.inputBorder}}>
                  <span className="absolute top-0.5 transition-all duration-300 h-5 w-5 rounded-full bg-white shadow-sm" style={{left:form.is_active?"calc(100% - 22px)":"2px"}}/>
                </button>
              </div>
            </div>
          )}

          {/* ── SECTION: IMAGES ── */}
          {section === "images" && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl text-xs" style={{background:`${ac}10`,border:`1px solid ${ac}25`,color:ac}}>
                💡 Add up to 12 photos. Click any photo to set it as the <strong>main</strong> display image.
              </div>
              <ImageUploader slots={imgSlots} onChange={setImgSlots} ac={ac} theme={theme}/>
            </div>
          )}

          {/* ── SECTION: VARIANTS ── */}
          {section === "variants" && (
            <div className="flex flex-col gap-4">
              <SizesManager sizes={sizes} onChange={setSizes} ac={ac} theme={theme} storeNiche={storeNiche}/>
              <ColorsManager colors={colors} onChange={setColors} ac={ac} theme={theme}/>
            </div>
          )}

          {/* ── SECTION: DETAILS ── */}
          {section === "details" && (
            <div className="flex flex-col gap-3">
              {[
                {k:"brand",   label:"Brand",     ph:"e.g. Nike, Zara, Local..."},
                {k:"material",label:"Material",  ph:"e.g. 100% Cotton, Polyester..."},
                {k:"weight",  label:"Weight",    ph:"e.g. 250g, 1.2kg..."},
              ].map(f=>(
                <div key={f.k}>
                  <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>{f.label}</label>
                  <input value={(form as any)[f.k]} onChange={e=>setForm(v=>({...v,[f.k]:e.target.value}))} onFocus={()=>setFocused(f.k)} onBlur={()=>setFocused("")} placeholder={f.ph} style={iStyle(f.k)}/>
                </div>
              ))}
            </div>
          )}

          {/* Save button always visible */}
          <button onClick={handleSave} disabled={loading}
            className="w-full py-4 font-black text-white rounded-2xl cursor-pointer active:scale-95 transition-all disabled:opacity-50 mt-5"
            style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 8px 28px ${ac}45`,fontSize:14}}>
            {loading ? "Saving..." : product ? "Save Changes ✓" : "Create Product ✦"}
          </button>
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
  store: Store; onBack: () => void; onRefresh: () => void; theme?: Theme;
}) => {
  const tk     = TK[theme];
  const ac     = store.accent_color || "#E87722";
  const isDark = theme === "dark";

  const [tab,        setTab]        = useState<"products"|"orders"|"categories">("products");
  const [products,   setProducts]   = useState<Product[]>([]);
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadP,      setLoadP]      = useState(true);
  const [loadO,      setLoadO]      = useState(true);
  const [editProduct,setEditProduct]= useState<Product|null|"new">(null);
  const [expandedOrder, setExpandedOrder] = useState<number|null>(null);
  // Category editing state
  const [catForm,    setCatForm]    = useState({id:0,name:"",icon:"FiPackage",description:""});
  const [editingCat, setEditingCat] = useState(false);
  const [savingCat,  setSavingCat]  = useState(false);

  const rev   = useCountUp(store.total_revenue   || 0);
  const ords  = useCountUp(store.total_orders    || 0);
  const custs = useCountUp(store.total_customers || 0);

  const fetchCategories = async () => {
    try {
      const r = await authFetch(`${API_URL}/categories/?store=${store.id}`);
      if (r.ok) { const d = await r.json(); setCategories(d.results ?? d); }
    } catch { /* ignore */ }
  };

  const fetchProducts = async () => {
    setLoadP(true);
    try {
      const r = await authFetch(`${API_URL}/products/?store=${store.id}`);
      if (r.ok) {
        const d = await r.json();
        const prods: Product[] = d.results ?? d;
        // Enrich any product missing its images[] array
        const enriched = await Promise.all(prods.map(async (p) => {
          if (p.images && p.images.length > 0) return p;
          try {
            const ir = await authFetch(`${API_URL}/product-images/?product=${p.id}`);
            if (ir.ok) {
              const id = await ir.json();
              const imgs: ProductImage[] = id.results ?? id;
              if (imgs.length > 0) return { ...p, images: imgs };
            }
          } catch { /* fall back to image_url */ }
          return p;
        }));
        setProducts(enriched);
      }
    } finally { setLoadP(false); }
  };
  const fetchOrders = async () => {
    setLoadO(true);
    try{const r=await authFetch(`${API_URL}/orders/?store=${store.id}`);if(r.ok){const d=await r.json();setOrders(d.results??d);}}
    finally{setLoadO(false);}
  };
  useEffect(()=>{fetchProducts();fetchOrders();fetchCategories();},[store.id]);

  const saveCategory = async () => {
    if (!catForm.name.trim()) return;
    setSavingCat(true);
    try {
      const body = JSON.stringify({ store: store.id, name: catForm.name.trim(), icon: catForm.icon, description: catForm.description, order: catForm.id ? undefined : categories.length });
      const url = catForm.id ? `${API_URL}/categories/${catForm.id}/` : `${API_URL}/categories/`;
      const res = await authFetch(url, { method: catForm.id ? "PATCH" : "POST", body });
      if (res.ok) { await fetchCategories(); setEditingCat(false); setCatForm({id:0,name:"",icon:"FiPackage",description:""}); }
    } finally { setSavingCat(false); }
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm("Delete this category? Products will lose this category tag.")) return;
    await authFetch(`${API_URL}/categories/${id}/`, { method: "DELETE" });
    fetchCategories();
  };

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
    const fd=new FormData(); fd.append("is_active",String(!p.is_active));
    await authFetch(`${API_URL}/products/${p.id}/`,{method:"PATCH",body:fd});
    fetchProducts();
  };

  // Get primary image from product
  const getPrimaryImage = (p: Product) => {
    if (p.images && p.images.length > 0) {
      const primary = p.images.find(img => img.is_primary) || p.images[0];
      return primary.image_url;
    }
    return p.image_url || null;
  };

  return (
    <div style={{minHeight:"100%",background:tk.bg,transition:"background 0.4s ease"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .se-anim{animation:fadeUp 0.5s cubic-bezier(0.34,1.1,0.64,1) both}
        @keyframes cardIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .card-in{animation:cardIn 0.4s cubic-bezier(0.34,1.1,0.64,1) both}
      `}</style>

      {/* ════ HERO HEADER ════ */}
      <div className="relative overflow-hidden rounded-[28px] mb-8 se-anim"
        style={{
          background: isDark ? `linear-gradient(145deg,${ac}24 0%,#141414 55%,${ac}0c 100%)` : `linear-gradient(145deg,${ac}18 0%,#ffffff 55%,${ac}07 100%)`,
          border:`1.5px solid ${ac}30`, padding:"44px 44px 40px",
          boxShadow: isDark ? `0 0 0 1px ${ac}10,0 40px 80px -20px rgba(0,0,0,0.8)` : `0 0 0 1px ${ac}15,0 20px 60px -10px rgba(0,0,0,0.12)`,
        }}>
        <div className="absolute inset-0 opacity-[0.045]" style={{backgroundImage:`radial-gradient(circle,${isDark?"white":"#222"} 1.5px,transparent 1.5px)`,backgroundSize:"22px 22px"}}/>
        <div className="absolute pointer-events-none" style={{top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:ac,filter:"blur(110px)",opacity:isDark?0.22:0.14}}/>
        <div className="absolute pointer-events-none" style={{bottom:-60,left:-60,width:280,height:280,borderRadius:"50%",background:ac,filter:"blur(90px)",opacity:isDark?0.1:0.07}}/>
        {[72,108,148,188].map((r,i)=>(
          <div key={i} className="absolute pointer-events-none" style={{top:-80,right:r,width:[2,1.5,1,0.5][i],height:500,background:`linear-gradient(to bottom,transparent,${ac}${["78","48","26","12"][i]},transparent)`,transform:"rotate(18deg)"}}/>
        ))}

        <div className="relative z-10">
          {/* Back button */}
          <button onClick={onBack} className="inline-flex items-center gap-2 mb-7 cursor-pointer group/back" style={{color:tk.textMuted,fontSize:13,fontWeight:700}}>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center transition-all group-hover/back:scale-110"
              style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)",border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.09)"}`}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/back:-translate-x-0.5"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            <span className="transition-colors group-hover/back:text-white" onMouseEnter={e=>(e.currentTarget.style.color=ac)} onMouseLeave={e=>(e.currentTarget.style.color=tk.textMuted)}>All Stores</span>
          </button>

          {/* Identity */}
          <div className="flex items-start gap-6 mb-8">
            <div className="shrink-0 rounded-3xl overflow-hidden flex items-center justify-center text-4xl"
              style={{width:96,height:96,background:`linear-gradient(140deg,${ac},${ac}88)`,boxShadow:`0 16px 48px ${ac}60,inset 0 1px 0 rgba(255,255,255,0.3)`}}>
              {store.logo_url?<img src={store.logo_url} alt="" className="h-full w-full object-cover"/>:(nicheEmoji[store.niche]||"✨")}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="font-black text-3xl leading-none" style={{color:tk.text,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.025em"}}>{store.name}</h2>
                {store.is_live&&<span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest" style={{background:"rgba(34,197,94,0.14)",border:"1px solid rgba(34,197,94,0.45)",color:"#4ade80"}}><span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"/>LIVE</span>}
                {store.plan&&<span className="text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest" style={{background:`${ac}1a`,border:`1px solid ${ac}45`,color:ac}}>{store.plan.toUpperCase()}</span>}
              </div>
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors mb-3" style={{color:tk.textMuted}}
                onMouseEnter={e=>(e.currentTarget.style.color=ac)} onMouseLeave={e=>(e.currentTarget.style.color=tk.textMuted)}>
                bazario.com/store/{store.slug}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              {store.description&&<p className="text-sm leading-relaxed" style={{color:tk.textSub}}>{store.description}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {label:"Revenue",   value:`${rev.toLocaleString()} DA`, sub:"Total earnings",  icon:"💰", color:ac},
              {label:"Orders",    value:ords.toLocaleString(),         sub:"All time",        icon:"🧾", color:"#2EA7F2"},
              {label:"Customers", value:custs.toLocaleString(),        sub:"Unique buyers",   icon:"👥", color:"#F4C21F"},
              {label:"Products",  value:String(products.length),       sub:"In catalog",      icon:"📦", color:"#a78bfa"},
            ].map(s=>(
              <div key={s.label} className="relative overflow-hidden flex flex-col gap-1.5 p-5 rounded-2xl"
                style={{background:isDark?"rgba(255,255,255,0.055)":"rgba(255,255,255,0.75)",border:`1px solid ${isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.07)"}`,backdropFilter:"blur(10px)"}}>
                <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl" style={{background:`linear-gradient(to right,${s.color}80,${s.color}20)`}}/>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{color:tk.textMuted}}>{s.label}</span>
                  <span className="text-base">{s.icon}</span>
                </div>
                <span className="font-black text-2xl tabular-nums leading-none" style={{color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.value}</span>
                <span className="text-[10px]" style={{color:tk.textMuted}}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ TAB BAR ════ */}
      <div className="flex items-center gap-2 mb-8 se-anim" style={{animationDelay:"0.08s"}}>
        <div className="flex items-center gap-1 p-1.5 rounded-2xl" style={{background:tk.tabBg,border:`1px solid ${tk.border}`,width:"fit-content"}}>
          {(["products","orders","categories"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className="relative px-6 py-3 rounded-xl font-black text-sm cursor-pointer transition-all capitalize"
              style={{background:tab===t?`linear-gradient(135deg,${ac},${ac}cc)`:"transparent",color:tab===t?"white":tk.textMuted,boxShadow:tab===t?`0 4px 16px ${ac}45`:"none"}}>
              <span className="flex items-center gap-2">
                <span>{t==="products"?<FiPackage size={13}/>:t==="orders"?<FiTag size={13}/>:<FiGrid size={13}/>}</span><span>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                {t!=="categories"&&(
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                    style={{background:tab===t?"rgba(255,255,255,0.2)":(isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)"),color:tab===t?"white":tk.textMuted}}>
                    {t==="products"?products.length:orders.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        {tab==="products"&&(
          <button onClick={()=>setEditProduct("new")}
            className="ml-auto flex items-center gap-2 px-5 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
            style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        )}
        {tab==="categories"&&(
          <button onClick={()=>{setCatForm({id:0,name:"",icon:"FiPackage",description:""});setEditingCat(true);}}
            className="ml-auto flex items-center gap-2 px-5 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
            style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Category
          </button>
        )}
      </div>

      {/* ════ PRODUCTS TAB ════ */}
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
                <p className="text-sm" style={{color:tk.textMuted}}>Start by adding your first product</p>
              </div>
              <button onClick={()=>setEditProduct("new")} className="px-7 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
                style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
                Add First Product
              </button>
            </div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p,i)=>{
                const imgSrc = getPrimaryImage(p);
                const photoCount = p.images?.length || (p.image_url ? 1 : 0);
                return (
                  <div key={p.id} className="card-in group relative flex flex-col overflow-hidden rounded-2xl"
                    style={{background:tk.panel,border:`1px solid ${tk.border}`,transition:"all 0.3s ease",animationDelay:`${i*60}ms`}}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow=`0 20px 52px -10px ${ac}30`;el.style.borderColor=ac+"45";el.style.transform="translateY(-5px)";}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow="none";el.style.borderColor=tk.border;el.style.transform="translateY(0)";}}>
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{height:240,background:isDark?`${ac}10`:`${ac}08`}}>
                      {imgSrc
                        ?<img src={imgSrc} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                        :<div className="h-full flex items-center justify-center text-7xl opacity-15">📦</div>
                      }
                      {/* Hover overlay */}
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
                      {/* Price badge */}
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl" style={{background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)"}}>
                        <span className="font-black text-sm text-white">{Number(p.price).toLocaleString()} <span className="text-white/55 text-xs">DA</span></span>
                      </div>
                      {/* Photo count badge */}
                      {photoCount > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1"
                          style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",color:"white"}}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          {photoCount}
                        </div>
                      )}
                      {/* Variants badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {p.sizes && p.sizes.length > 0 && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md" style={{background:`${ac}cc`,color:"white"}}>SIZES</span>
                        )}
                        {p.colors && p.colors.length > 0 && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)",color:"white"}}>
                            {p.colors.slice(0,3).map((c,ci)=>(
                              <span key={ci} className="h-2 w-2 rounded-full" style={{background:c.hex}}/>
                            ))}
                          </span>
                        )}
                      </div>
                      {p.stock<=5&&p.stock>0&&<div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black" style={{background:"#f59e0b22",border:"1px solid #f59e0b50",color:"#fbbf24"}}>LOW</div>}
                      {p.stock===0&&<div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}><span className="text-white/60 font-black text-xs tracking-[0.2em] uppercase">Sold Out</span></div>}
                    </div>
                    {/* Info */}
                    <div className="p-4 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate mb-0.5" style={{color:tk.text}}>{p.name}</p>
                        <p className="text-[11px]" style={{color:tk.textMuted}}>
                          {p.sizes && p.sizes.length > 0 ? `${p.sizes.length} sizes · ` : ""}
                          Stock: {p.stock}
                        </p>
                      </div>
                      <button onClick={()=>toggleProductActive(p)}
                        className="relative h-5 w-9 rounded-full cursor-pointer transition-all duration-300 shrink-0"
                        style={{background:p.is_active?ac:tk.chipBorder}}>
                        <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300" style={{left:p.is_active?"calc(100%-18px)":"2px"}}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════ ORDERS TAB ════ */}
      {tab==="orders"&&(
        <div className="se-anim flex flex-col gap-3" style={{animationDelay:"0.12s"}}>
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
              <p className="font-black text-xl" style={{color:tk.textMuted,fontFamily:"'Syne',sans-serif"}}>No orders yet</p>
            </div>
          ):orders.map((order,i)=>{
            const sc=STATUS_COLORS[order.status]||STATUS_COLORS.pending;
            const isExpanded=expandedOrder===order.id;
            return(
              <div key={order.id} className="card-in overflow-hidden rounded-2xl transition-all"
                style={{background:tk.panel,border:`1px solid ${tk.border}`,animationDelay:`${i*50}ms`}}>
                <div className="h-[2px] w-full" style={{background:sc.text+"55"}}/>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Customer identity row */}
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="font-black text-base" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>
                          #{order.id} · {order.customer_name} {order.customer_family_name||""}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest"
                          style={{background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text}}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      {/* Contact & location */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2" style={{color:tk.textMuted}}>
                        {order.customer_email&&<span>✉️ {order.customer_email}</span>}
                        {order.customer_phone&&<span>📞 {order.customer_phone}</span>}
                        {order.customer_wilaya&&<span>📍 {order.customer_wilaya}{order.customer_city?`, ${order.customer_city}`:""}</span>}
                      </div>
                      {order.customer_address&&(
                        <p className="text-xs mb-2" style={{color:tk.textMuted}}>🏠 {order.customer_address}</p>
                      )}
                      {/* Items */}
                      {order.items&&order.items.length>0&&(
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map(item=>(
                            <span key={item.id} className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                              style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",border:`1px solid ${tk.chipBorder}`,color:tk.textSub}}>
                              {item.product_name} <span style={{color:ac}}>×{item.quantity}</span>
                              {item.selected_size&&<span style={{color:tk.textMuted}}> · {item.selected_size}</span>}
                              {item.selected_color&&<span style={{color:tk.textMuted}}> · {item.selected_color}</span>}
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
                      <div className="flex flex-col gap-2">
                        <select value={order.status} onChange={e=>updateOrderStatus(order.id,e.target.value)}
                          className="text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
                          style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)",border:`1px solid ${tk.chipBorder}`,color:tk.textSub,outline:"none"}}>
                          {["pending","processing","delivered","cancelled"].map(s=>(
                            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                          ))}
                        </select>
                        {order.notes&&(
                          <button onClick={()=>setExpandedOrder(isExpanded?null:order.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer text-center"
                            style={{background:tk.chip,border:`1px solid ${tk.chipBorder}`,color:tk.textMuted}}>
                            {isExpanded?"Hide":"Notes"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded&&order.notes&&(
                    <div className="mt-4 pt-4 border-t text-xs leading-relaxed" style={{borderColor:tk.divider,color:tk.textMuted}}>
                      📋 <span className="font-bold">Note:</span> {order.notes}
                    </div>
                  )}
                  {order.created_at&&(
                    <p className="text-[10px] mt-3 pt-3 border-t" style={{borderColor:tk.divider,color:tk.textMuted}}>
                      Placed on {new Date(order.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════ CATEGORIES TAB ════ */}
      {tab==="categories"&&(
        <div className="se-anim flex flex-col gap-4" style={{animationDelay:"0.12s"}}>
          <div className="mb-2">
            <h3 className="font-black text-xl" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>Store Categories</h3>
            <p className="text-xs mt-0.5" style={{color:tk.textMuted}}>Organise your products into categories for easier browsing</p>
          </div>

          {/* Category form (inline) */}
          {editingCat&&(
            <div className="p-5 rounded-2xl mb-2 se-anim" style={{background:isDark?`${ac}0e`:`${ac}08`,border:`1.5px solid ${ac}40`}}>
              <h4 className="font-black text-sm mb-4" style={{color:tk.text}}>{catForm.id?"Edit Category":"New Category"}</h4>
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>Category Name *</label>
                  <input value={catForm.name} onChange={e=>setCatForm(v=>({...v,name:e.target.value}))}
                    placeholder="e.g. Smartphones, T-Shirts, Skincare..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{color:tk.textMuted}}>Description (optional)</label>
                  <input value={catForm.description} onChange={e=>setCatForm(v=>({...v,description:e.target.value}))}
                    placeholder="Short description shown to buyers..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{background:tk.inputBg,border:`1px solid ${tk.inputBorder}`,color:tk.text,outline:"none"}}/>
                </div>
                {/* React-Icons picker */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{background:`${ac}20`,border:`1.5px solid ${ac}40`}}>
                      <CatIcon iconKey={catForm.icon} size={20} color={ac}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black tracking-widest uppercase" style={{color:tk.textMuted}}>Icon</label>
                      <p className="text-xs mt-0.5" style={{color:tk.textMuted}}>Click to select</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1" style={{scrollbarWidth:"thin"}}>
                    {ICON_GROUPS.map(group => (
                      <div key={group.label}>
                        <p className="text-[9px] font-black tracking-[.18em] uppercase mb-1.5" style={{color:tk.textMuted}}>{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.keys.map(key => {
                            const isSel = catForm.icon === key;
                            return (
                              <button key={key} type="button"
                                onClick={() => setCatForm(v=>({...v,icon:key}))}
                                title={key.replace(/^(Fi|Md|Gi|MdOutline)/,"").replace(/([A-Z])/g," $1").trim()}
                                className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                                style={{background:isSel?`${ac}25`:tk.sectionBg,border:`1.5px solid ${isSel?ac:tk.border}`,boxShadow:isSel?`0 0 0 1px ${ac}30`:undefined}}>
                                <CatIcon iconKey={key} size={16} color={isSel?ac:tk.textMuted}/>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCategory} disabled={savingCat||!catForm.name.trim()}
                    className="flex-1 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 16px ${ac}40`}}>
                    {savingCat?"Saving...":catForm.id?"Save Changes ✓":"Create Category ✦"}
                  </button>
                  <button onClick={()=>{setEditingCat(false);setCatForm({id:0,name:"",icon:"FiPackage",description:""});}}
                    className="px-5 py-3 rounded-xl font-black text-sm cursor-pointer active:scale-95 transition-all"
                    style={{background:tk.chip,border:`1px solid ${tk.chipBorder}`,color:tk.textMuted}}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category list */}
          {categories.length===0&&!editingCat?(
            <div className="py-20 flex flex-col items-center gap-4 text-center rounded-2xl"
              style={{background:isDark?"rgba(255,255,255,.02)":"rgba(255,255,255,.8)",border:`1.5px dashed ${tk.border}`}}>
              <span className="text-5xl opacity-20">🗂️</span>
              <div>
                <p className="font-black text-xl mb-1.5" style={{color:tk.textMuted,fontFamily:"'Syne',sans-serif"}}>No categories yet</p>
                <p className="text-sm" style={{color:tk.textMuted}}>Create categories to help buyers navigate your store</p>
              </div>
              <button onClick={()=>{setCatForm({id:0,name:"",icon:"FiPackage",description:""});setEditingCat(true);}}
                className="px-7 py-3 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all"
                style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 4px 18px ${ac}45`}}>
                Create First Category
              </button>
            </div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat,i)=>{
                const catProducts = products.filter(p=>p.category===cat.id);
                return(
                  <div key={cat.id} className="card-in flex items-center gap-4 p-5 rounded-2xl group"
                    style={{background:tk.panel,border:`1px solid ${tk.border}`,transition:"all .3s",animationDelay:`${i*60}ms`}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=ac+"40";(e.currentTarget as HTMLElement).style.boxShadow=`0 8px 28px ${ac}18`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=tk.border;(e.currentTarget as HTMLElement).style.boxShadow="none";}}>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{background:`${ac}18`,border:`1px solid ${ac}30`}}>
                      <CatIcon iconKey={cat.icon||"FiPackage"} size={22} color={ac}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base truncate" style={{color:tk.text,fontFamily:"'Syne',sans-serif"}}>{cat.name}</p>
                      {cat.description&&<p className="text-xs truncate mt-0.5" style={{color:tk.textMuted}}>{cat.description}</p>}
                      <p className="text-[11px] mt-1 font-bold" style={{color:ac}}>{catProducts.length} product{catProducts.length!==1?"s":""}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={()=>{setCatForm({id:cat.id,name:cat.name,icon:cat.icon||"FiPackage",description:cat.description||""});setEditingCat(true);}}
                        className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                        style={{background:`${ac}18`,border:`1px solid ${ac}30`,color:ac}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={()=>deleteCategory(cat.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                        style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444"}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {editProduct&&(
        <ProductModal
          product={editProduct==="new"?null:editProduct}
          storeId={store.id}
          storeNiche={store.niche}
          theme={theme} ac={ac}
          categories={categories}
          onClose={()=>setEditProduct(null)}
          onSaved={()=>{fetchProducts();setEditProduct(null);}}
        />
      )}
    </div>
  );
};

export default StoreEditor;