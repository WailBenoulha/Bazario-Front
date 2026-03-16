import { useState, useRef } from "react";
import { API_URL, authFetch } from "./sellerTypes";

interface Props { plan: string; onClose: () => void; onCreated: () => void; }

/* ── Niches ── */
const NICHES = [
  { id:"fashion",     emoji:"👗", label:"Fashion",     desc:"Clothes & apparel" },
  { id:"electronics", emoji:"⚡", label:"Electronics", desc:"Gadgets & tech" },
  { id:"cosmetics",   emoji:"💄", label:"Cosmetics",   desc:"Beauty & care" },
  { id:"food",        emoji:"🍽️", label:"Food",        desc:"Gourmet & local" },
  { id:"accessories", emoji:"💍", label:"Accessories", desc:"Jewelry & bags" },
  { id:"sports",      emoji:"🏆", label:"Sports",      desc:"Fitness & gear" },
  { id:"education",   emoji:"📚", label:"Education",   desc:"Books & courses" },
  { id:"other",       emoji:"✨", label:"Other",       desc:"Something unique" },
];

/* ── 50+ classified colors ── */
const COLOR_GROUPS = [
  {
    label: "🔥 Warm",
    colors: [
      { c:"#E87722", name:"Bazario Orange" }, { c:"#F97316", name:"Sunset" },
      { c:"#FB923C", name:"Tangerine" },      { c:"#F59E0B", name:"Amber" },
      { c:"#F4C21F", name:"Gold" },           { c:"#EAB308", name:"Yellow" },
      { c:"#DC2626", name:"Ruby Red" },       { c:"#EF4444", name:"Coral Red" },
      { c:"#F43F5E", name:"Flamingo" },       { c:"#E11D48", name:"Crimson" },
    ],
  },
  {
    label: "❄️ Cool",
    colors: [
      { c:"#2EA7F2", name:"Sky Blue" },       { c:"#0EA5E9", name:"Ocean" },
      { c:"#06B6D4", name:"Cyan" },           { c:"#14B8A6", name:"Teal" },
      { c:"#10B981", name:"Emerald" },        { c:"#22C55E", name:"Lime Green" },
      { c:"#3B82F6", name:"Cobalt" },         { c:"#6366F1", name:"Indigo" },
      { c:"#2563EB", name:"Royal Blue" },     { c:"#0369A1", name:"Deep Ocean" },
    ],
  },
  {
    label: "🌸 Soft",
    colors: [
      { c:"#EC4899", name:"Rose" },           { c:"#F472B6", name:"Pink" },
      { c:"#D946EF", name:"Fuchsia" },        { c:"#C084FC", name:"Lavender" },
      { c:"#A78BFA", name:"Soft Violet" },    { c:"#8B5CF6", name:"Violet" },
      { c:"#7C3AED", name:"Purple" },         { c:"#9D174D", name:"Burgundy" },
      { c:"#BE185D", name:"Magenta" },        { c:"#F9A8D4", name:"Blush" },
    ],
  },
  {
    label: "🌿 Nature",
    colors: [
      { c:"#16A34A", name:"Forest" },         { c:"#15803D", name:"Deep Green" },
      { c:"#65A30D", name:"Olive" },          { c:"#84CC16", name:"Spring" },
      { c:"#A3E635", name:"Citrus" },         { c:"#4ADE80", name:"Mint" },
      { c:"#34D399", name:"Seafoam" },        { c:"#059669", name:"Jade" },
      { c:"#0D9488", name:"Teal Green" },     { c:"#047857", name:"Bottle Green" },
    ],
  },
  {
    label: "🪨 Neutral",
    colors: [
      { c:"#ffffff", name:"Pure White" },     { c:"#F8FAFC", name:"Snow" },
      { c:"#E2E8F0", name:"Cloud" },          { c:"#94A3B8", name:"Silver" },
      { c:"#64748B", name:"Steel" },          { c:"#475569", name:"Slate" },
      { c:"#334155", name:"Dark Slate" },     { c:"#1E293B", name:"Navy Slate" },
      { c:"#0F172A", name:"Midnight" },       { c:"#020617", name:"Abyss" },
    ],
  },
  {
    label: "✨ Metallic",
    colors: [
      { c:"#B8860B", name:"Dark Gold" },      { c:"#DAA520", name:"Goldenrod" },
      { c:"#C0C0C0", name:"Silver" },         { c:"#A8A9AD", name:"Chrome" },
      { c:"#B87333", name:"Copper" },         { c:"#CD7F32", name:"Bronze" },
      { c:"#E5C07B", name:"Champagne" },      { c:"#F0E68C", name:"Khaki Gold" },
      { c:"#D4AF37", name:"Royal Gold" },     { c:"#CFB53B", name:"Old Gold" },
    ],
  },
];

/* ── Button styles ── */
const BUTTON_STYLES = [
  { id:"soft",        label:"Soft",        br:"12px",  desc:"Modern & friendly" },
  { id:"rounded",     label:"Rounded",     br:"999px", desc:"Smooth & gentle" },
  { id:"sharp",       label:"Sharp",       br:"2px",   desc:"Bold & structured" },
  { id:"pill",        label:"Pill",        br:"999px", desc:"Elegant & wide" },
  { id:"ghost",       label:"Ghost",       br:"12px",  desc:"Minimal & clean" },
  { id:"elevated",    label:"Elevated",    br:"12px",  desc:"High-impact shadow" },
  { id:"underlined",  label:"Underlined",  br:"0px",   desc:"Editorial style" },
  { id:"brutalist",   label:"Brutalist",   br:"0px",   desc:"Raw & bold" },
  { id:"neon",        label:"Neon",        br:"8px",   desc:"Glowing effect" },
  { id:"flat",        label:"Flat",        br:"6px",   desc:"Clean & simple" },
  { id:"inset",       label:"Inset",       br:"12px",  desc:"Pressed depth" },
  { id:"wide",        label:"Wide",        br:"10px",  desc:"Full-width impact" },
];

/* ── Panel themes ── */
const PANEL_STYLES = [
  { id:"dark",    label:"Dark",    desc:"Luxury dark",     bg:"#0a0a0a",   border:"#222",                      text:"white" },
  { id:"light",   label:"Light",   desc:"Clean white",     bg:"#f8f8f8",   border:"#e5e5e5",                   text:"#111" },
  { id:"glass",   label:"Glass",   desc:"Frosted glass",   bg:"rgba(255,255,255,0.08)", border:"rgba(255,255,255,0.15)", text:"white" },
  { id:"minimal", label:"Minimal", desc:"Ultra sparse",    bg:"#fafafa",   border:"transparent",               text:"#111" },
];

/* ── Fonts — display, body, accent ── */
const FONT_GROUPS = {
  display: [
    { key:"Cormorant Garamond", label:"Cormorant", preview:"Aa", style:"serif",      desc:"Luxury editorial" },
    { key:"Syne",               label:"Syne",      preview:"Aa", style:"sans-serif", desc:"Bold geometric" },
    { key:"Playfair Display",   label:"Playfair",  preview:"Aa", style:"serif",      desc:"Elegant serif" },
    { key:"DM Serif Display",   label:"DM Serif",  preview:"Aa", style:"serif",      desc:"Refined modern" },
    { key:"Space Grotesk",      label:"Grotesk",   preview:"Aa", style:"sans-serif", desc:"Technical clean" },
    { key:"Bebas Neue",         label:"Bebas",     preview:"AA", style:"sans-serif", desc:"Strong & tall" },
    { key:"Josefin Sans",       label:"Josefin",   preview:"Aa", style:"sans-serif", desc:"Art deco vibe" },
    { key:"Italiana",           label:"Italiana",  preview:"Aa", style:"serif",      desc:"Italian luxury" },
    { key:"Cinzel",             label:"Cinzel",    preview:"Aa", style:"serif",      desc:"Roman classic" },
    { key:"Monoton",            label:"Monoton",   preview:"Aa", style:"display",    desc:"Retro futurism" },
  ],
  body: [
    { key:"DM Sans",        label:"DM Sans",      preview:"Aa", style:"sans-serif", desc:"Clean & modern" },
    { key:"Inter",          label:"Inter",        preview:"Aa", style:"sans-serif", desc:"Neutral & clear" },
    { key:"Lato",           label:"Lato",         preview:"Aa", style:"sans-serif", desc:"Warm friendly" },
    { key:"Nunito",         label:"Nunito",       preview:"Aa", style:"sans-serif", desc:"Rounded & soft" },
    { key:"Source Sans 3",  label:"Source Sans",  preview:"Aa", style:"sans-serif", desc:"Readable pro" },
    { key:"Outfit",         label:"Outfit",       preview:"Aa", style:"sans-serif", desc:"Contemporary" },
    { key:"Karla",          label:"Karla",        preview:"Aa", style:"sans-serif", desc:"Quirky neutral" },
    { key:"Merriweather",   label:"Merriweather", preview:"Aa", style:"serif",      desc:"Reading comfort" },
    { key:"Libre Baskerville", label:"Baskerville",preview:"Aa",style:"serif",      desc:"Traditional" },
    { key:"IBM Plex Sans",  label:"IBM Plex",     preview:"Aa", style:"sans-serif", desc:"Technical mono" },
  ],
  accent: [
    { key:"Syne",              label:"Syne",          preview:"Aa", style:"sans-serif", desc:"Price & labels" },
    { key:"Space Grotesk",     label:"Grotesk",       preview:"Aa", style:"sans-serif", desc:"Data display" },
    { key:"Oswald",            label:"Oswald",        preview:"Aa", style:"sans-serif", desc:"Bold headers" },
    { key:"Raleway",           label:"Raleway",       preview:"Aa", style:"sans-serif", desc:"Elegant accent" },
    { key:"Montserrat",        label:"Montserrat",    preview:"Aa", style:"sans-serif", desc:"Brand labels" },
    { key:"Barlow Condensed",  label:"Barlow Cond",   preview:"Aa", style:"sans-serif", desc:"Tight & punchy" },
    { key:"Exo 2",             label:"Exo 2",         preview:"Aa", style:"sans-serif", desc:"Futuristic" },
    { key:"Titillium Web",     label:"Titillium",     preview:"Aa", style:"sans-serif", desc:"Mechanical" },
    { key:"Work Sans",         label:"Work Sans",     preview:"Aa", style:"sans-serif", desc:"Professional" },
    { key:"Permanent Marker",  label:"Marker",        preview:"Aa", style:"handwriting",desc:"Handmade feel" },
  ],
};

const STEPS = [
  { title:"Basics",  icon:"①" },
  { title:"Style",   icon:"②" },
  { title:"Fonts",   icon:"③" },
  { title:"Brand",   icon:"④" },
  { title:"Launch",  icon:"⑤" },
];

/* ── Button preview renderer ── */
const ButtonPreview = ({ styleId, ac }: { styleId: string; ac: string }) => {
  const styles: Record<string, React.CSSProperties> = {
    soft:       { borderRadius:12, background:`linear-gradient(135deg,${ac},${ac}cc)`, color:"#fff", border:"none", padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default" },
    rounded:    { borderRadius:999, background:`linear-gradient(135deg,${ac},${ac}cc)`, color:"#fff", border:"none", padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default" },
    sharp:      { borderRadius:2, background:ac, color:"#fff", border:"none", padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default" },
    pill:       { borderRadius:999, background:`linear-gradient(135deg,${ac},${ac}cc)`, color:"#fff", border:"none", padding:"7px 22px", fontSize:11, fontWeight:800, cursor:"default" },
    ghost:      { borderRadius:12, background:"transparent", color:ac, border:`2px solid ${ac}`, padding:"6px 13px", fontSize:11, fontWeight:800, cursor:"default" },
    elevated:   { borderRadius:12, background:`linear-gradient(135deg,${ac},${ac}cc)`, color:"#fff", border:"none", padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default", boxShadow:`0 8px 24px ${ac}60` },
    underlined: { borderRadius:0, background:"transparent", color:ac, border:"none", borderBottom:`2px solid ${ac}`, padding:"7px 4px", fontSize:11, fontWeight:800, cursor:"default" },
    brutalist:  { borderRadius:0, background:ac, color:"#fff", border:`3px solid #fff`, outline:`3px solid ${ac}`, padding:"6px 12px", fontSize:11, fontWeight:800, cursor:"default" },
    neon:       { borderRadius:8, background:"transparent", color:ac, border:`1.5px solid ${ac}`, padding:"6px 13px", fontSize:11, fontWeight:800, cursor:"default", boxShadow:`0 0 12px ${ac}60,0 0 24px ${ac}30,inset 0 0 12px ${ac}10`, textShadow:`0 0 8px ${ac}` },
    flat:       { borderRadius:6, background:`${ac}18`, color:ac, border:`1px solid ${ac}35`, padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default" },
    inset:      { borderRadius:12, background:ac, color:"#fff", border:"none", padding:"7px 14px", fontSize:11, fontWeight:800, cursor:"default", boxShadow:`inset 0 3px 6px rgba(0,0,0,0.25)` },
    wide:       { borderRadius:10, background:`linear-gradient(135deg,${ac},${ac}cc)`, color:"#fff", border:"none", padding:"7px 0", fontSize:11, fontWeight:800, cursor:"default", width:"100%", textAlign:"center" },
  };
  return <span style={styles[styleId]||styles.soft}>Buy Now</span>;
};

export default function CreateStoreModal({ plan, onClose, onCreated }: Props) {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", niche: "",
    accent_color: "#E87722",
    button_style: "soft",
    panel_style: "dark",
    font_display: "Cormorant Garamond",
    font_body: "DM Sans",
    font_accent: "Syne",
    logo: null as File | null,
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const ac = form.accent_color;
  const isDarkTheme = form.panel_style === "dark" || form.panel_style === "glass";
  const previewBg = isDarkTheme ? "#0a0a0a" : "#f8f8f8";
  const previewText = isDarkTheme ? "white" : "#111";
  const previewSub = isDarkTheme ? "rgba(255,255,255,0.35)" : "#888";
  const selectedNiche = NICHES.find(n => n.id === form.niche);

  const canNext = [
    !!(form.name.trim() && form.slug.trim()),
    form.niche !== "",
    true, // style
    true, // fonts
    true, // branding
  ][step] ?? true;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("logo", file);
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("slug", form.slug);
      fd.append("description", form.description); fd.append("niche", form.niche);
      fd.append("plan_name", plan);
      fd.append("accent_color", form.accent_color);
      fd.append("button_style", form.button_style);
      fd.append("panel_style", form.panel_style);
      fd.append("font_display", form.font_display);
      fd.append("font_body", form.font_body);
      fd.append("font_accent", form.font_accent);
      if (form.logo) fd.append("logo", form.logo);
      const res = await authFetch(`${API_URL}/stores/`, { method:"POST", body:fd, headers:{} });
      const data = await res.json();
      if (!res.ok) { setErrors(data); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 2400);
    } catch { setErrors({ general:"Network error." }); setLoading(false); }
  };

  const inputStyle = (f: string) => ({
    background: focused === f ? `${ac}12` : "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[f] ? "#ef4444" : focused === f ? ac : "rgba(255,255,255,0.12)"}`,
    borderRadius: 14, color: "white",
    boxShadow: focused === f ? `0 0 0 3px ${ac}18` : "none",
    transition: "all 0.25s ease", outline: "none",
    width: "100%", padding: "14px 16px", fontSize: 14,
  });

  // Google fonts URL for all selected fonts
  const allFonts = [form.font_display, form.font_body, form.font_accent]
    .filter((v,i,a)=>a.indexOf(v)===i)
    .map(f=>f.replace(/ /g,"+"))
    .join("&family=");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background:"rgba(0,0,0,0.88)", backdropFilter:"blur(24px)" }}
      onClick={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${allFonts}&family=Syne:wght@700;800&display=swap');
        @keyframes modalIn { from{opacity:0;transform:scale(0.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes stepIn  { from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)} }
        .modal-in { animation:modalIn .45s cubic-bezier(0.34,1.1,0.64,1) both }
        .step-in  { animation:stepIn .35s cubic-bezier(0.34,1.1,0.64,1) both }
        .csm-scroll::-webkit-scrollbar{width:3px}
        .csm-scroll::-webkit-scrollbar-thumb{background:${ac}50;border-radius:4px}
      `}</style>

      <div className="modal-in relative w-full max-w-2xl overflow-hidden"
        style={{ background:"linear-gradient(145deg,#0d0d0d,#131313)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:28, maxHeight:"92vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>

        {/* Accent top bar */}
        <div className="absolute top-0 inset-x-0 h-[3px]" style={{background:`linear-gradient(to right,transparent,${ac},transparent)`}}/>

        {success ? (
          <div className="flex flex-col items-center justify-center p-16 gap-6 text-center">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-3xl animate-pulse" style={{background:`linear-gradient(135deg,${ac},${ac}66)`}}/>
              {logoPreview
                ?<img src={logoPreview} className="absolute inset-0 h-full w-full rounded-3xl object-cover"/>
                :<div className="absolute inset-0 rounded-3xl flex items-center justify-center text-5xl">{selectedNiche?.emoji||"🏪"}</div>
              }
            </div>
            <div>
              <h3 className="text-white font-black text-3xl" style={{fontFamily:`'${form.font_display}',serif`}}>{form.name}</h3>
              <p className="text-white/40 mt-2">Your store is launching...</p>
            </div>
            <div className="w-full max-w-xs h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
              <div className="h-full rounded-full transition-all duration-[2400ms]" style={{width:"100%",background:`linear-gradient(to right,${ac},${ac}88)`}}/>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-7 pb-0">
              <button onClick={onClose}
                className="absolute top-5 right-5 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer text-white/30 hover:text-white transition-all"
                style={{background:"rgba(255,255,255,0.07)"}}>✕</button>

              <div className="flex items-center gap-3 mb-7">
                <div className="p-3 rounded-2xl" style={{background:`linear-gradient(135deg,${ac},${ac}88)`,boxShadow:`0 8px 24px ${ac}40`}}>
                  <span className="text-white text-xl">🏪</span>
                </div>
                <div>
                  <h2 className="text-white font-black text-xl" style={{fontFamily:"'Syne',sans-serif"}}>Create Your Store</h2>
                  <p className="text-white/30 text-xs">Plan: <span className="font-bold capitalize" style={{color:ac}}>{plan}</span></p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center mb-7">
                {STEPS.map((s,i)=>(
                  <div key={s.title} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-500"
                        style={{
                          background: i < step ? `linear-gradient(135deg,${ac},${ac}aa)` : i===step ? `${ac}20` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${i<=step?ac:"rgba(255,255,255,0.08)"}`,
                          color: i < step ? "white" : i===step ? ac : "rgba(255,255,255,0.25)",
                          boxShadow: i===step ? `0 0 0 3px ${ac}20` : "none",
                        }}>
                        {i<step?"✓":s.icon}
                      </div>
                      <span className="text-[9px] font-black tracking-wider uppercase"
                        style={{color:i===step?ac:"rgba(255,255,255,0.2)"}}>{s.title}</span>
                    </div>
                    {i<STEPS.length-1&&(
                      <div className="flex-1 h-px mx-2 mb-4 transition-all duration-500"
                        style={{background:i<step?ac:"rgba(255,255,255,0.07)"}}/>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="px-8 pb-8">
              {errors.general&&(
                <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-xs font-semibold"
                  style={{background:"#ef444415",border:"1px solid #ef444430"}}>{errors.general}</div>
              )}

              {/* ══ STEP 0 — Basics ══ */}
              {step===0&&(
                <div className="step-in flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.4)"}}>Store Name *</label>
                    <input value={form.name}
                      onChange={e=>{set("name",e.target.value);set("slug",e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""));}}
                      onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)}
                      placeholder="e.g. Amira's Fashion Boutique"
                      style={inputStyle("name") as any}/>
                    {errors.name&&<p className="text-red-400 text-xs mt-1">⚠ {errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.4)"}}>Store URL *</label>
                    <div className="flex items-center overflow-hidden"
                      style={{background:focused==="slug"?`${ac}12`:"rgba(255,255,255,0.05)",border:`1px solid ${focused==="slug"?ac:"rgba(255,255,255,0.12)"}`,borderRadius:14,transition:"all .25s"}}>
                      <span className="px-4 py-3.5 text-xs font-mono shrink-0" style={{color:"rgba(255,255,255,0.3)",borderRight:"1px solid rgba(255,255,255,0.08)"}}>bazario.dz/</span>
                      <input value={form.slug}
                        onChange={e=>set("slug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                        onFocus={()=>setFocused("slug")} onBlur={()=>setFocused(null)}
                        placeholder="my-store"
                        className="flex-1 px-3 py-3.5 text-sm font-mono bg-transparent focus:outline-none"
                        style={{color:"white"}}/>
                    </div>
                    {errors.slug&&<p className="text-red-400 text-xs mt-1">⚠ {errors.slug}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{color:"rgba(255,255,255,0.4)"}}>
                      Description <span style={{color:"rgba(255,255,255,0.15)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span>
                    </label>
                    <textarea value={form.description}
                      onChange={e=>set("description",e.target.value)}
                      onFocus={()=>setFocused("desc")} onBlur={()=>setFocused(null)}
                      placeholder="Tell buyers what makes your store special..."
                      rows={3}
                      style={{...(inputStyle("desc") as any),resize:"none",fontFamily:"inherit"}}/>
                  </div>
                </div>
              )}

              {/* ══ STEP 1 — Niche + Theme ══ */}
              {step===1&&(
                <div className="step-in flex flex-col gap-7">
                  {/* Niche */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{color:"rgba(255,255,255,0.4)"}}>Store Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {NICHES.map(n=>(
                        <button key={n.id} onClick={()=>set("niche",n.id)}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all duration-300"
                          style={{background:form.niche===n.id?`${ac}18`:"rgba(255,255,255,0.04)",border:`1px solid ${form.niche===n.id?ac:"rgba(255,255,255,0.07)"}`,transform:form.niche===n.id?"scale(1.05)":"scale(1)",boxShadow:form.niche===n.id?`0 8px 24px ${ac}30`:"none"}}>
                          <span className="text-2xl">{n.emoji}</span>
                          <span className="text-[11px] font-black text-center" style={{color:form.niche===n.id?ac:"rgba(255,255,255,0.45)"}}>{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Panel theme */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{color:"rgba(255,255,255,0.4)"}}>Store Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PANEL_STYLES.map(ps=>(
                        <button key={ps.id} onClick={()=>set("panel_style",ps.id)}
                          className="flex items-center gap-3 p-4 cursor-pointer transition-all duration-300"
                          style={{background:form.panel_style===ps.id?`${ac}15`:"rgba(255,255,255,0.04)",border:`1px solid ${form.panel_style===ps.id?ac:"rgba(255,255,255,0.07)"}`,borderRadius:16}}>
                          <div className="h-11 w-16 rounded-xl shrink-0 flex items-center justify-center"
                            style={{background:ps.bg,border:`1px solid ${ps.border}`}}>
                            <span className="text-[9px] font-black" style={{color:ps.text,opacity:.6}}>Aa</span>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-xs" style={{color:form.panel_style===ps.id?ac:"rgba(255,255,255,0.7)"}}>{ps.label}</p>
                            <p className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.2)"}}>{ps.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2 — Style: Colors + Buttons ══ */}
              {step===2&&(
                <div className="step-in flex flex-col gap-7">

                  {/* Colors — classified */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-black tracking-widest uppercase" style={{color:"rgba(255,255,255,0.4)"}}>Brand Color</label>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-lg" style={{background:form.accent_color}}/>
                        <span className="text-xs font-mono" style={{color:"rgba(255,255,255,0.35)"}}>{form.accent_color}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 max-h-64 overflow-y-auto csm-scroll pr-1">
                      {COLOR_GROUPS.map(group=>(
                        <div key={group.label}>
                          <p className="text-[9px] font-black tracking-[.18em] uppercase mb-2" style={{color:"rgba(255,255,255,0.25)"}}>{group.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {group.colors.map(p=>{
                              const isSel=form.accent_color===p.c;
                              return(
                                <button key={p.c} onClick={()=>set("accent_color",p.c)} title={p.name}
                                  className="relative cursor-pointer transition-all duration-200"
                                  style={{width:32,height:32,borderRadius:8,background:p.c,border:`2px solid ${isSel?"white":"transparent"}`,transform:isSel?"scale(1.22)":"scale(1)",boxShadow:isSel?`0 4px 16px ${p.c}80`:"none"}}>
                                  {isSel&&<span className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{color:p.c==="#ffffff"?"#333":"white",textShadow:"0 1px 4px rgba(0,0,0,0.6)"}}>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Custom hex input */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.07]">
                      <input type="color" value={form.accent_color} onChange={e=>set("accent_color",e.target.value)}
                        className="h-9 w-9 rounded-xl cursor-pointer border-0 p-0.5"
                        style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)"}}/>
                      <div className="flex-1">
                        <input value={form.accent_color} onChange={e=>set("accent_color",e.target.value)}
                          onFocus={()=>setFocused("hex")} onBlur={()=>setFocused(null)}
                          placeholder="#E87722"
                          className="font-mono text-sm"
                          style={{...(inputStyle("hex") as any),padding:"9px 14px"}}/>
                      </div>
                      <span className="text-xs" style={{color:"rgba(255,255,255,0.25)"}}>Custom</span>
                    </div>
                  </div>

                  {/* Button styles */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{color:"rgba(255,255,255,0.4)"}}>Button Style</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {BUTTON_STYLES.map(bs=>(
                        <button key={bs.id} onClick={()=>set("button_style",bs.id)}
                          className="flex flex-col items-center gap-3 p-4 cursor-pointer transition-all duration-300"
                          style={{background:form.button_style===bs.id?`${ac}15`:"rgba(255,255,255,0.04)",border:`1px solid ${form.button_style===bs.id?ac:"rgba(255,255,255,0.07)"}`,borderRadius:14,boxShadow:form.button_style===bs.id?`0 6px 20px ${ac}25`:"none"}}>
                          <div className="flex items-center justify-center" style={{minHeight:32,width:"100%"}}>
                            <ButtonPreview styleId={bs.id} ac={ac}/>
                          </div>
                          <div className="text-center">
                            <p className="font-black text-[11px]" style={{color:form.button_style===bs.id?ac:"rgba(255,255,255,0.55)"}}>{bs.label}</p>
                            <p className="text-[9px] mt-0.5" style={{color:"rgba(255,255,255,0.2)"}}>{bs.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 — Fonts ══ */}
              {step===3&&(
                <div className="step-in flex flex-col gap-6">
                  <p className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Choose three fonts that define your brand's voice — display for headings, body for text, accent for prices & labels.</p>

                  {([
                    { key:"font_display", label:"Display Font", sub:"Store name & product titles", role:"display" },
                    { key:"font_body",    label:"Body Font",    sub:"Descriptions & content",      role:"body" },
                    { key:"font_accent",  label:"Accent Font",  sub:"Prices, badges & labels",     role:"accent" },
                  ] as const).map(({key,label,sub,role})=>{
                    const fontList = FONT_GROUPS[role];
                    const selected = (form as any)[key];
                    return(
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <label className="text-xs font-black tracking-widest uppercase" style={{color:"rgba(255,255,255,0.4)"}}>{label}</label>
                            <p className="text-[10px] mt-0.5" style={{color:"rgba(255,255,255,0.2)"}}>{sub}</p>
                          </div>
                          <span className="text-xs font-bold" style={{color:ac}}>{selected}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {fontList.map(f=>{
                            const isSel=selected===f.key;
                            return(
                              <button key={f.key} onClick={()=>set(key,f.key)}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-pointer transition-all duration-250"
                                style={{background:isSel?`${ac}18`:"rgba(255,255,255,0.04)",border:`1px solid ${isSel?ac:"rgba(255,255,255,0.07)"}`,boxShadow:isSel?`0 4px 16px ${ac}30`:"none"}}>
                                <span className="text-xl leading-none" style={{fontFamily:`'${f.key}',${f.style}`,color:isSel?ac:"rgba(255,255,255,0.7)"}}>{f.preview}</span>
                                <span className="text-[9px] font-black text-center leading-tight" style={{color:isSel?ac:"rgba(255,255,255,0.35)"}}>{f.label}</span>
                                <span className="text-[8px] text-center" style={{color:"rgba(255,255,255,0.18)"}}>{f.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Font preview */}
                  <div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p className="text-[9px] font-black tracking-[.2em] uppercase mb-3" style={{color:"rgba(255,255,255,0.25)"}}>Font Preview</p>
                    <p className="leading-none mb-2" style={{fontFamily:`'${form.font_display}',serif`,fontSize:26,fontWeight:700,color:"white"}}>{form.name||"Your Store"}</p>
                    <p style={{fontFamily:`'${form.font_body}',sans-serif`,fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6,marginBottom:10}}>Premium quality products, carefully curated for you. Discover the best of our collection.</p>
                    <span style={{fontFamily:`'${form.font_accent}',sans-serif`,fontSize:18,fontWeight:800,color:ac}}>{(3200).toLocaleString()} DA</span>
                  </div>
                </div>
              )}

              {/* ══ STEP 4 — Branding (logo + preview) ══ */}
              {step===4&&(
                <div className="step-in flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{color:"rgba(255,255,255,0.4)"}}>Store Logo</label>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
                    <button onClick={()=>logoInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-4 py-8 cursor-pointer transition-all duration-300 rounded-2xl"
                      style={{background:"rgba(255,255,255,0.03)",border:`2px dashed ${logoPreview?ac:"rgba(255,255,255,0.1)"}`}}>
                      {logoPreview
                        ?<><img src={logoPreview} className="h-20 w-20 rounded-3xl object-cover" style={{boxShadow:`0 12px 40px ${ac}50`}}/><p className="text-xs font-black" style={{color:ac}}>Click to change</p></>
                        :<><div className="h-16 w-16 rounded-3xl flex items-center justify-center text-3xl" style={{background:`${ac}15`,border:`1px solid ${ac}30`}}>📷</div>
                          <div className="text-center"><p className="font-black text-white/50 text-sm">Upload Logo</p><p className="text-white/20 text-xs mt-1">PNG · JPG · Square recommended</p></div></>
                      }
                    </button>
                  </div>

                  {/* Live preview */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{color:"rgba(255,255,255,0.4)"}}>Live Preview</label>
                    <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
                      {/* Browser chrome */}
                      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{background:"rgba(255,255,255,0.05)"}}>
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"/>
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50"/>
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/50"/>
                        <span className="ml-2 text-[9px] font-mono" style={{color:"rgba(255,255,255,0.2)"}}>bazario.dz/{form.slug||"your-store"}</span>
                      </div>
                      {/* Store preview */}
                      <div className="p-5" style={{background:previewBg}}>
                        {/* Nav */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center text-base" style={{background:`linear-gradient(135deg,${ac},${ac}88)`}}>
                              {logoPreview?<img src={logoPreview} className="h-full w-full object-cover"/>:selectedNiche?.emoji||"🏪"}
                            </div>
                            <div>
                              <p className="font-black text-sm leading-none" style={{fontFamily:`'${form.font_display}',serif`,color:previewText}}>{form.name||"Your Store"}</p>
                              <p className="text-[9px] mt-0.5" style={{color:previewSub,fontFamily:`'${form.font_body}',sans-serif`}}>{selectedNiche?.label||"Store"}</p>
                            </div>
                          </div>
                          <div style={{padding:"6px 14px"}}>
                            <ButtonPreview styleId={form.button_style} ac={ac}/>
                          </div>
                        </div>
                        {/* Products grid */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {["Elegant Watch","Silk Dress","Gold Ring"].map((name,i)=>(
                            <div key={i} className="rounded-xl overflow-hidden" style={{background:form.panel_style==="glass"?"rgba(255,255,255,0.08)":form.panel_style==="dark"?"rgba(255,255,255,0.05)":"white",border:`1px solid ${form.panel_style==="light"||form.panel_style==="minimal"?"#e5e5e5":"rgba(255,255,255,0.08)"}`}}>
                              <div className="h-14 flex items-end justify-start p-2" style={{background:`linear-gradient(145deg,${ac}20,${ac}08)`}}>
                                <span style={{fontFamily:`'${form.font_accent}',sans-serif`,fontWeight:800,fontSize:11,color:ac}}>{(2800+i*500).toLocaleString()} DA</span>
                              </div>
                              <div className="p-2">
                                <p className="font-bold text-[10px] truncate" style={{fontFamily:`'${form.font_body}',sans-serif`,color:previewText}}>{name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Font indicator */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {[form.font_display,form.font_body,form.font_accent].filter((v,i,a)=>a.indexOf(v)===i).map(f=>(
                            <span key={f} className="text-[8px] px-2 py-0.5 rounded-full" style={{background:`${ac}15`,color:ac,border:`1px solid ${ac}30`}}>{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 5 — Launch Summary ══ */}
              {step===5&&(
                <div className="step-in flex flex-col gap-5">
                  <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.09)"}}>
                    {/* Banner */}
                    <div className="relative h-28 flex items-center px-6" style={{background:`linear-gradient(135deg,${ac}25,${ac}08)`}}>
                      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`radial-gradient(circle,white 1px,transparent 1px)`,backgroundSize:"20px 20px"}}/>
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl mr-4 overflow-hidden" style={{background:`linear-gradient(135deg,${ac},${ac}88)`,boxShadow:`0 8px 24px ${ac}50`}}>
                        {logoPreview?<img src={logoPreview} className="h-full w-full object-cover"/>:selectedNiche?.emoji||"🏪"}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-xl" style={{fontFamily:`'${form.font_display}',serif`}}>{form.name}</h3>
                        <p className="text-white/40 text-xs font-mono mt-1">bazario.dz/{form.slug}</p>
                      </div>
                    </div>
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-px" style={{background:"rgba(255,255,255,0.05)"}}>
                      {[
                        {label:"Niche",         val:`${selectedNiche?.emoji} ${selectedNiche?.label||"—"}`},
                        {label:"Plan",          val:plan.charAt(0).toUpperCase()+plan.slice(1)},
                        {label:"Brand Color",   val:form.accent_color, isColor:true},
                        {label:"Theme",         val:PANEL_STYLES.find(p=>p.id===form.panel_style)?.label||"—"},
                        {label:"Button Style",  val:BUTTON_STYLES.find(b=>b.id===form.button_style)?.label||"—"},
                        {label:"Display Font",  val:form.font_display},
                        {label:"Body Font",     val:form.font_body},
                        {label:"Accent Font",   val:form.font_accent},
                        {label:"Logo",          val:logoPreview?"Uploaded ✓":"Default emoji"},
                      ].map(item=>(
                        <div key={item.label} className="flex flex-col gap-1 p-3.5" style={{background:"rgba(0,0,0,0.3)"}}>
                          <span className="text-[9px] font-black tracking-widest uppercase" style={{color:"rgba(255,255,255,0.22)"}}>{item.label}</span>
                          <div className="flex items-center gap-2">
                            {(item as any).isColor&&<div className="h-3 w-3 rounded-full flex-shrink-0" style={{background:form.accent_color}}/>}
                            <span className="text-white text-xs font-bold truncate">{item.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-xs" style={{color:"rgba(255,255,255,0.18)"}}>You can edit all settings anytime from the store editor.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-7">
                {step>0&&(
                  <button onClick={()=>setStep(s=>s-1)}
                    className="flex items-center gap-2 px-5 py-3.5 font-bold text-sm cursor-pointer transition-all duration-200"
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,color:"rgba(255,255,255,0.4)"}}>
                    ← Back
                  </button>
                )}
                {step<STEPS.length-1?(
                  <button onClick={()=>canNext&&setStep(s=>s+1)} disabled={!canNext}
                    className="flex-1 py-3.5 font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{background:canNext?`linear-gradient(135deg,${ac},${ac}aa)`:"rgba(255,255,255,0.07)",borderRadius:14,boxShadow:canNext?`0 8px 28px ${ac}40`:"none"}}>
                    Continue →
                  </button>
                ):(
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-4 font-black text-white text-base tracking-wide cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-50"
                    style={{background:`linear-gradient(135deg,${ac},${ac}aa)`,borderRadius:16,boxShadow:`0 12px 40px ${ac}50`}}>
                    {loading?(
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Launching...
                      </span>
                    ):"Launch My Store ✦"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}