import { useState } from "react";
import { BsShopWindow, BsPlus, BsBoxSeam, BsPeopleFill,
         BsGraphUp, BsTrash, BsPencil, BsEye } from "react-icons/bs";
import { HiExternalLink, HiSparkles } from "react-icons/hi";
import { type Store, API_URL, authFetch, nicheColors } from "./sellerTypes";
import StoreEditor from "./Storeeditor";

interface Props {
  stores: Store[];
  onRefresh: () => void;
  onNewStore: () => void;
}

const nicheEmoji: Record<string, string> = {
  fashion: "👗", electronics: "⚡", cosmetics: "💄", food: "🍽️",
  accessories: "💍", sports: "🏆", education: "📚", other: "✨",
};
const planGradients: Record<string, string> = {
  free:    "linear-gradient(135deg,#6b7280,#9ca3af)",
  basic:   "linear-gradient(135deg,#E87722,#F4C21F)",
  premium: "linear-gradient(135deg,#F4C21F,#fbbf24)",
};

const StoresPage = ({ stores, onRefresh, onNewStore }: Props) => {
  const [managingStore, setManagingStore] = useState<Store | null>(null);
  const [deletingId,    setDeletingId]    = useState<number | null>(null);
  const [hoveredId,     setHoveredId]     = useState<number | null>(null);

  const toggleLive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await authFetch(`${API_URL}/stores/${id}/toggle_live/`, { method: "POST" });
    onRefresh();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this store? This cannot be undone.")) return;
    setDeletingId(id);
    await authFetch(`${API_URL}/stores/${id}/`, { method: "DELETE" });
    setDeletingId(null);
    onRefresh();
  };

  if (managingStore) {
    return <StoreEditor store={managingStore} onBack={() => { setManagingStore(null); onRefresh(); }} onRefresh={onRefresh} />;
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatPulse  { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-8px) scale(1.03); } }
        @keyframes shimmerMove { 0% { background-position:200% center; } 100% { background-position:-200% center; } }
        .store-card { animation: fadeSlideUp 0.55s cubic-bezier(0.34,1.1,0.64,1) both; }
      `}</style>

      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles className="h-4 w-4 text-[#F4C21F]" />
              <span className="text-xs font-black tracking-[0.2em] text-[#E87722] uppercase">Store Manager</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Stores</h2>
            <p className="text-gray-400 text-sm mt-1">
              {stores.length === 0
                ? "No stores yet — launch your first one"
                : `${stores.length} store${stores.length !== 1 ? "s" : ""} · ${stores.filter(s => s.is_live).length} live`}
            </p>
          </div>
          <button
            onClick={onNewStore}
            className="group relative flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-white text-sm cursor-pointer active:scale-95 overflow-hidden shadow-xl shadow-[#E87722]/25 transition-all duration-300 self-start md:self-auto"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <BsPlus className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">New Store</span>
          </button>
        </div>

        {/* Empty */}
        {stores.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-32 gap-8 bg-white rounded-3xl border border-dashed border-gray-200 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: `radial-gradient(circle, #E87722 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-[#E87722] opacity-[0.06] rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 text-center z-10">
              <div className="relative p-7 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl shadow-xl shadow-orange-100"
                style={{ animation: "floatPulse 3.5s ease-in-out infinite" }}>
                <BsShopWindow className="h-14 w-14 text-[#E87722]" />
                <div className="absolute -top-2 -right-2 h-7 w-7 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-full flex items-center justify-center shadow-md">
                  <BsPlus className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Launch your first store</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-sm leading-relaxed">
                  Pick a niche, style your store, and start selling to Algerian customers — all in under 3 minutes.
                </p>
              </div>
              <button
                onClick={onNewStore}
                className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white cursor-pointer active:scale-95 overflow-hidden shadow-2xl shadow-[#E87722]/30 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <BsShopWindow className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Create My First Store ✦</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {stores.map((store, idx) => {
              const niche       = nicheColors[store.niche] || nicheColors.other;
              const emoji       = nicheEmoji[store.niche]  || "✨";
              const isHovered   = hoveredId === store.id;
              const accentColor = (store as any).accent_color || "#E87722";
              const planGrad    = planGradients[(store.plan || "free").toLowerCase()] || planGradients.free;

              return (
                <div
                  key={store.id}
                  className="store-card relative bg-white border border-gray-100 rounded-3xl overflow-hidden cursor-pointer"
                  style={{
                    animationDelay: `${idx * 75}ms`,
                    transition: "all 0.45s cubic-bezier(0.34,1.2,0.64,1)",
                    boxShadow: isHovered
                      ? `0 28px 70px -12px ${accentColor}30, 0 8px 28px -8px rgba(0,0,0,0.08)`
                      : "0 1px 4px rgba(0,0,0,0.06)",
                    transform: isHovered ? "translateY(-7px)" : "translateY(0)",
                  }}
                  onMouseEnter={() => setHoveredId(store.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setManagingStore(store)}
                >
                  {/* Banner */}
                  <div
                    className="relative h-28 flex items-center justify-between px-5 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)` }}
                  >
                    <div className="absolute inset-0 opacity-[0.05]"
                      style={{ backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
                    <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20"
                      style={{ backgroundColor: accentColor }} />

                    {/* Logo bubble */}
                    <div
                      className="relative h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                        transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
                        transform: isHovered ? "scale(1.1) rotate(-4deg)" : "scale(1) rotate(0deg)",
                        boxShadow: `0 8px 24px ${accentColor}50`,
                      }}
                    >
                      {(store as any).logo_url
                        ? <img src={(store as any).logo_url} alt="" className="h-full w-full object-cover" />
                        : emoji}
                    </div>

                    {/* Live toggle */}
                    <button
                      onClick={(e) => toggleLive(store.id, e)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all duration-300 border backdrop-blur-sm
                        ${store.is_live
                          ? "bg-green-50/90 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-white/80 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${store.is_live ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                      {store.is_live ? "Live" : "Offline"}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {/* Name + plan */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-gray-900 font-black text-lg truncate leading-tight">{store.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${niche.bg} ${niche.text} ${niche.border}`}>
                          {emoji} {store.niche}
                        </span>
                      </div>
                      <div className="shrink-0 px-2.5 py-0.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest"
                        style={{ background: planGrad }}>
                        {store.plan || "Free"}
                      </div>
                    </div>

                    {/* URL row */}
                    <a
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#E87722] transition-colors duration-200 mt-2 mb-4 group/link"
                    >
                      <HiExternalLink className="h-3.5 w-3.5 shrink-0 group-hover/link:scale-110 transition-transform" />
                      <span className="truncate font-mono">bazario.dz/{store.slug}</span>
                    </a>

                    {/* Stat pills */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: <BsGraphUp className="h-3 w-3" />,    label: "Revenue",   value: `${((store.total_revenue||0)/1000).toFixed(1)}k`, color: accentColor },
                        { icon: <BsBoxSeam className="h-3 w-3" />,    label: "Orders",    value: String(store.total_orders||0),    color: "#2EA7F2" },
                        { icon: <BsPeopleFill className="h-3 w-3" />, label: "Customers", value: String(store.total_customers||0), color: "#F4C21F" },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center py-2 bg-gray-50 rounded-xl gap-0.5">
                          <span style={{ color: s.color }}>{s.icon}</span>
                          <span className="text-gray-900 text-sm font-black tabular-nums">{s.value}</span>
                          <span className="text-gray-400 text-[9px] uppercase tracking-wider">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setManagingStore(store); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white cursor-pointer active:scale-95 transition-all duration-200 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                          boxShadow: `0 4px 14px ${accentColor}40`,
                        }}
                      >
                        <BsBoxSeam className="h-3.5 w-3.5" /> Manage Store
                      </button>
                      <a
                        href={`/store/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 rounded-xl bg-blue-50 text-[#2EA7F2] hover:bg-blue-100 cursor-pointer transition-all duration-200"
                        title="View public storefront"
                      >
                        <BsEye className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={(e) => handleDelete(store.id, e)}
                        disabled={deletingId === store.id}
                        className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all duration-200 disabled:opacity-40"
                        title="Delete store"
                      >
                        <BsTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add-another card */}
            <button
              onClick={onNewStore}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-200 hover:border-[#E87722]/40 bg-white hover:bg-orange-50/20 transition-all duration-400 cursor-pointer min-h-[300px]"
            >
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 shadow-sm">
                <BsPlus className="h-8 w-8 text-[#E87722]" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-black text-sm group-hover:text-[#E87722] transition-colors">New Store</p>
                <p className="text-gray-400 text-xs mt-0.5">Expand your business</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StoresPage;