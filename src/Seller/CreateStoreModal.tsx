import { useState, useRef } from "react";
import { API_URL, authFetch } from "./sellerTypes";

interface Props { plan: string; onClose: () => void; onCreated: () => void; }

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

const COLORS = [
  { c:"#E87722", name:"Bazario Orange" }, { c:"#2EA7F2", name:"Sky Blue" },
  { c:"#10b981", name:"Emerald" },        { c:"#a855f7", name:"Violet" },
  { c:"#ef4444", name:"Ruby" },           { c:"#F4C21F", name:"Gold" },
  { c:"#ec4899", name:"Rose" },           { c:"#0ea5e9", name:"Cyan" },
  { c:"#f97316", name:"Sunset" },         { c:"#14b8a6", name:"Teal" },
  { c:"#8b5cf6", name:"Indigo" },         { c:"#e11d48", name:"Crimson" },
  { c:"#ffffff", name:"Pure White" },     { c:"#1e293b", name:"Slate" },
];

const BUTTON_STYLES = [
  { id:"soft",     label:"Soft",     preview:"rounded-xl",    desc:"Friendly & modern" },
  { id:"rounded",  label:"Round",    preview:"rounded-full",  desc:"Smooth & gentle" },
  { id:"sharp",    label:"Sharp",    preview:"rounded-none",  desc:"Bold & structured" },
  { id:"pill",     label:"Pill",     preview:"rounded-full px-8", desc:"Elegant & wide" },
  { id:"ghost",    label:"Ghost",    preview:"rounded-xl border-2 bg-transparent", desc:"Minimal & clean" },
  { id:"elevated", label:"Elevated", preview:"rounded-xl shadow-2xl", desc:"High-impact" },
];

const PANEL_STYLES = [
  { id:"dark",    label:"Dark",    desc:"Luxury dark theme",     bg:"#0a0a0a",   border:"#222" },
  { id:"light",   label:"Light",   desc:"Clean white theme",     bg:"#f8f8f8",   border:"#e5e5e5" },
  { id:"glass",   label:"Glass",   desc:"Frosted glass cards",   bg:"rgba(255,255,255,0.08)", border:"rgba(255,255,255,0.15)" },
  { id:"minimal", label:"Minimal", desc:"Ultra clean & sparse",  bg:"#fafafa",   border:"transparent" },
];

const STEPS = [
  { title:"Basics",    icon:"✦" },
  { title:"Style",     icon:"◈" },
  { title:"Branding",  icon:"◉" },
  { title:"Launch",    icon:"✺" },
];

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
    accent_color: "#E87722", button_style: "soft", panel_style: "dark",
    logo: null as File | null,
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const ac = form.accent_color;
  const selectedNiche = NICHES.find(n => n.id === form.niche);
  const canNext = [
    form.name.trim() && form.slug.trim(),
    form.niche !== "",
    true,
    true,
  ][step];

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
      fd.append("plan_name", plan); fd.append("accent_color", form.accent_color);
      fd.append("button_style", form.button_style); fd.append("panel_style", form.panel_style);
      if (form.logo) fd.append("logo", form.logo);

      const res = await authFetch(`${API_URL}/stores/`, { method: "POST", body: fd, headers: {} });
      const data = await res.json();
      if (!res.ok) { setErrors(data); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 2400);
    } catch { setErrors({ general: "Network error." }); setLoading(false); }
  };

  const inputStyle = (f: string) => ({
    background: focused === f ? `${ac}12` : "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[f] ? "#ef4444" : focused === f ? ac : "rgba(255,255,255,0.12)"}`,
    borderRadius: 14, color: "white",
    boxShadow: focused === f ? `0 0 0 3px ${ac}18` : "none",
    transition: "all 0.25s ease", outline: "none",
    width: "100%", padding: "14px 16px", fontSize: 14,
  });

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes stepIn  { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        .modal-body { animation: modalIn 0.45s cubic-bezier(0.34,1.1,0.64,1) both; }
        .step-body  { animation: stepIn 0.35s cubic-bezier(0.34,1.1,0.64,1) both; }
      `}</style>

      <div
        className="modal-body relative w-full max-w-2xl overflow-hidden"
        style={{ background: "linear-gradient(145deg,#0e0e0e,#141414)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, maxHeight: "92vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${ac}, transparent)` }} />

        {success ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center p-16 gap-6 text-center">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-3xl animate-pulse" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}66)` }} />
              {logoPreview
                ? <img src={logoPreview} className="absolute inset-0 h-full w-full rounded-3xl object-cover" />
                : <div className="absolute inset-0 rounded-3xl flex items-center justify-center text-5xl">{selectedNiche?.emoji || "🏪"}</div>
              }
            </div>
            <div>
              <h3 className="text-white font-black text-3xl" style={{ fontFamily: "Syne, sans-serif" }}>{form.name}</h3>
              <p className="text-white/40 mt-2">Your store is going live...</p>
            </div>
            <div className="w-full max-w-xs h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-[2400ms]" style={{ width: "100%", background: `linear-gradient(to right, ${ac}, ${ac}88)` }} />
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-0">
              <button onClick={onClose} className="absolute top-5 right-5 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer text-white/30 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.08)" }}>✕</button>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}88)`, boxShadow: `0 8px 24px ${ac}40` }}>
                  <span className="text-white text-xl">🏪</span>
                </div>
                <div>
                  <h2 className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>Create Your Store</h2>
                  <p className="text-white/30 text-xs capitalize">Plan: <span className="font-bold" style={{ color: ac }}>{plan}</span></p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-0 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500"
                        style={{
                          background: i < step ? `linear-gradient(135deg, ${ac}, ${ac}aa)` : i === step ? `${ac}20` : "rgba(255,255,255,0.06)",
                          border: `1px solid ${i <= step ? ac : "rgba(255,255,255,0.08)"}`,
                          color: i < step ? "white" : i === step ? ac : "rgba(255,255,255,0.3)",
                          boxShadow: i === step ? `0 0 0 3px ${ac}20` : "none",
                        }}
                      >
                        {i < step ? "✓" : s.icon}
                      </div>
                      <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: i === step ? ac : "rgba(255,255,255,0.2)" }}>{s.title}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px mx-3 mb-4 transition-all duration-500" style={{ background: i < step ? ac : "rgba(255,255,255,0.08)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Step Content ── */}
            <div className="px-8 pb-8">
              {errors.general && (
                <div className="mb-5 px-4 py-3 rounded-xl text-red-400 text-xs font-semibold" style={{ background: "#ef444415", border: "1px solid #ef444430" }}>{errors.general}</div>
              )}

              {/* STEP 0 — Basics */}
              {step === 0 && (
                <div className="step-body flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Store Name *</label>
                    <input
                      value={form.name}
                      onChange={e => { set("name", e.target.value); set("slug", e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      placeholder="e.g. Amira's Fashion Boutique"
                      style={inputStyle("name") as any}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">⚠ {errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Store URL *</label>
                    <div className="flex items-center overflow-hidden" style={{ background: focused === "slug" ? `${ac}12` : "rgba(255,255,255,0.05)", border: `1px solid ${focused === "slug" ? ac : "rgba(255,255,255,0.12)"}`, borderRadius: 14, transition: "all 0.25s ease" }}>
                      <span className="px-4 py-3.5 text-xs font-mono shrink-0" style={{ color: "rgba(255,255,255,0.3)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>bazario.dz/</span>
                      <input
                        value={form.slug}
                        onChange={e => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                        onFocus={() => setFocused("slug")} onBlur={() => setFocused(null)}
                        placeholder="my-store"
                        className="flex-1 px-3 py-3.5 text-sm font-mono bg-transparent focus:outline-none"
                        style={{ color: "white" }}
                      />
                    </div>
                    {errors.slug && <p className="text-red-400 text-xs mt-1">⚠ {errors.slug}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Description <span style={{ color: "rgba(255,255,255,0.15)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <textarea
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      onFocus={() => setFocused("desc")} onBlur={() => setFocused(null)}
                      placeholder="Tell buyers what makes your store special..."
                      rows={3}
                      style={{ ...(inputStyle("desc") as any), resize: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 1 — Style (niche + colors + buttons + panels) */}
              {step === 1 && (
                <div className="step-body flex flex-col gap-7">

                  {/* Niche */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Store Niche</label>
                    <div className="grid grid-cols-4 gap-2">
                      {NICHES.map(n => (
                        <button
                          key={n.id} onClick={() => set("niche", n.id)}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all duration-300"
                          style={{
                            background: form.niche === n.id ? `${ac}18` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.niche === n.id ? ac : "rgba(255,255,255,0.08)"}`,
                            transform: form.niche === n.id ? "scale(1.05)" : "scale(1)",
                            boxShadow: form.niche === n.id ? `0 8px 24px ${ac}30` : "none",
                          }}
                        >
                          <span className="text-2xl">{n.emoji}</span>
                          <span className="text-[11px] font-black text-center" style={{ color: form.niche === n.id ? ac : "rgba(255,255,255,0.5)" }}>{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Brand Color</label>
                    <div className="flex flex-wrap gap-2.5">
                      {COLORS.map(p => (
                        <button
                          key={p.c} onClick={() => set("accent_color", p.c)}
                          title={p.name}
                          className="h-10 w-10 rounded-xl cursor-pointer transition-all duration-300 relative"
                          style={{
                            backgroundColor: p.c,
                            border: `2px solid ${form.accent_color === p.c ? "white" : "transparent"}`,
                            transform: form.accent_color === p.c ? "scale(1.25)" : "scale(1)",
                            boxShadow: form.accent_color === p.c ? `0 4px 18px ${p.c}80` : "none",
                          }}
                        >
                          {form.accent_color === p.c && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button styles */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Button Style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {BUTTON_STYLES.map(bs => (
                        <button
                          key={bs.id} onClick={() => set("button_style", bs.id)}
                          className="flex flex-col items-center gap-3 p-4 cursor-pointer transition-all duration-300"
                          style={{
                            background: form.button_style === bs.id ? `${ac}15` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.button_style === bs.id ? ac : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 16,
                            boxShadow: form.button_style === bs.id ? `0 6px 20px ${ac}25` : "none",
                          }}
                        >
                          <div
                            className={`px-4 py-2 text-xs font-black text-white ${bs.preview}`}
                            style={{
                              background: bs.id === "ghost" ? "transparent" : ac,
                              border: bs.id === "ghost" ? `2px solid ${ac}` : "none",
                              color: bs.id === "ghost" ? ac : "white",
                              fontSize: 10,
                            }}
                          >
                            Buy Now
                          </div>
                          <div className="text-center">
                            <p className="font-black text-xs" style={{ color: form.button_style === bs.id ? ac : "rgba(255,255,255,0.6)" }}>{bs.label}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{bs.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Panel styles */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Store Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PANEL_STYLES.map(ps => (
                        <button
                          key={ps.id} onClick={() => set("panel_style", ps.id)}
                          className="flex items-center gap-3 p-4 cursor-pointer transition-all duration-300"
                          style={{
                            background: form.panel_style === ps.id ? `${ac}15` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.panel_style === ps.id ? ac : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 16,
                          }}
                        >
                          <div className="h-10 w-16 rounded-xl shrink-0" style={{ background: ps.bg, border: `1px solid ${ps.border}` }} />
                          <div className="text-left">
                            <p className="font-black text-xs" style={{ color: form.panel_style === ps.id ? ac : "rgba(255,255,255,0.7)" }}>{ps.label}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{ps.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Branding (logo upload + preview) */}
              {step === 2 && (
                <div className="step-body flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Store Logo</label>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-4 py-10 cursor-pointer transition-all duration-300 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: `2px dashed ${logoPreview ? ac : "rgba(255,255,255,0.12)"}` }}
                    >
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} className="h-24 w-24 rounded-3xl object-cover shadow-2xl" style={{ boxShadow: `0 16px 48px ${ac}50` }} />
                          <p className="text-xs font-black" style={{ color: ac }}>Click to change</p>
                        </>
                      ) : (
                        <>
                          <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl" style={{ background: `${ac}15`, border: `1px solid ${ac}30` }}>📷</div>
                          <div className="text-center">
                            <p className="font-black text-white/60 text-sm">Upload Logo</p>
                            <p className="text-white/25 text-xs mt-1">PNG, JPG · Max 5MB · Square recommended</p>
                          </div>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live preview card */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Store Preview</label>
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      {/* Browser chrome */}
                      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                        <span className="ml-2 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>bazario.dz/{form.slug || "your-store"}</span>
                      </div>
                      {/* Preview content */}
                      <div className="p-5" style={{ background: form.panel_style === "light" || form.panel_style === "minimal" ? "#f8f8f8" : "#0a0a0a" }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center text-lg" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}88)` }}>
                              {logoPreview ? <img src={logoPreview} className="h-full w-full object-cover" /> : selectedNiche?.emoji || "🏪"}
                            </div>
                            <div>
                              <p className="font-black text-sm" style={{ color: form.panel_style === "light" || form.panel_style === "minimal" ? "#111" : "white" }}>{form.name || "Your Store"}</p>
                              <p className="text-[10px] capitalize" style={{ color: form.panel_style === "light" || form.panel_style === "minimal" ? "#999" : "rgba(255,255,255,0.3)" }}>{form.niche || "niche"}</p>
                            </div>
                          </div>
                          <div className={`px-4 py-2 text-xs font-black text-white ${BUTTON_STYLES.find(b => b.id === form.button_style)?.preview || ""}`} style={{ background: ac }}>Shop</div>
                        </div>
                        {/* Fake product cards */}
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="rounded-xl overflow-hidden" style={{ background: form.panel_style === "glass" ? "rgba(255,255,255,0.08)" : form.panel_style === "dark" ? "rgba(255,255,255,0.05)" : "white", border: `1px solid ${form.panel_style === "light" || form.panel_style === "minimal" ? "#e5e5e5" : "rgba(255,255,255,0.08)"}` }}>
                              <div className="h-12" style={{ background: `${ac}20` }} />
                              <div className="p-2">
                                <div className="h-2 rounded" style={{ background: form.panel_style === "light" || form.panel_style === "minimal" ? "#e5e5e5" : "rgba(255,255,255,0.1)", marginBottom: 4 }} />
                                <div className="h-1.5 w-2/3 rounded" style={{ background: form.panel_style === "light" || form.panel_style === "minimal" ? "#f0f0f0" : "rgba(255,255,255,0.06)" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 — Launch summary */}
              {step === 3 && (
                <div className="step-body flex flex-col gap-5">
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    {/* Banner */}
                    <div className="relative h-28 flex items-center px-6" style={{ background: `linear-gradient(135deg, ${ac}25, ${ac}08)` }}>
                      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl mr-4 overflow-hidden" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}88)`, boxShadow: `0 8px 24px ${ac}50` }}>
                        {logoPreview ? <img src={logoPreview} className="h-full w-full object-cover" /> : selectedNiche?.emoji || "🏪"}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>{form.name}</h3>
                        <p className="text-white/40 text-xs font-mono mt-1">bazario.dz/{form.slug}</p>
                      </div>
                    </div>

                    {/* Summary grid */}
                    <div className="grid grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
                      {[
                        { label:"Niche",        val:`${selectedNiche?.emoji} ${selectedNiche?.label || "—"}` },
                        { label:"Plan",         val:plan.charAt(0).toUpperCase()+plan.slice(1) },
                        { label:"Brand Color",  val:form.accent_color, isColor: true },
                        { label:"Button Style", val:BUTTON_STYLES.find(b=>b.id===form.button_style)?.label || "—" },
                        { label:"Theme",        val:PANEL_STYLES.find(p=>p.id===form.panel_style)?.label || "—" },
                        { label:"Logo",         val:logoPreview ? "Uploaded ✓" : "Default emoji" },
                      ].map(item => (
                        <div key={item.label} className="flex flex-col gap-1 p-4" style={{ background: "rgba(0,0,0,0.3)" }}>
                          <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>{item.label}</span>
                          <div className="flex items-center gap-2">
                            {(item as any).isColor && <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: form.accent_color }} />}
                            <span className="text-white text-sm font-bold">{item.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                    You can add products and edit settings after creation.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-5 py-3.5 font-bold text-sm cursor-pointer transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "rgba(255,255,255,0.5)" }}
                  >
                    ← Back
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => canNext && setStep(s => s + 1)}
                    disabled={!canNext}
                    className="flex-1 py-3.5 font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: canNext ? `linear-gradient(135deg, ${ac}, ${ac}aa)` : "rgba(255,255,255,0.08)", borderRadius: 14, boxShadow: canNext ? `0 8px 28px ${ac}40` : "none" }}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-4 font-black text-white text-base tracking-wide cursor-pointer active:scale-95 transition-all duration-300 disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, borderRadius: 16, boxShadow: `0 12px 40px ${ac}50` }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Launching...
                      </span>
                    ) : "Launch My Store ✦"}
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