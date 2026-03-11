import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

interface StoreData {
  id: number; name: string; slug: string; niche: string; description: string;
  accent_color: string; logo_url?: string; is_live: boolean;
  button_style?: string; panel_style?: string;
}
interface Product {
  id: number; name: string; description: string;
  price: number; stock: number; image?: string;
}
interface CartItem extends Product { qty: number; }

const nicheEmoji: Record<string, string> = {
  fashion:"👗", electronics:"⚡", cosmetics:"💄", food:"🍽️",
  accessories:"💍", sports:"🏆", education:"📚", other:"✨",
};

/* ─── tiny hook: IntersectionObserver reveal ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Product Card ─── */
const ProductCard = ({ product, accent, buttonStyle, onAdd, addedId }:
  { product: Product; accent: string; buttonStyle: string; onAdd: (p: Product) => void; addedId: number | null }) => {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const added = addedId === product.id;
  const outOfStock = product.stock === 0;

  const btnClasses: Record<string, string> = {
    rounded:  "rounded-full",
    sharp:    "rounded-none",
    soft:     "rounded-xl",
    pill:     "rounded-full px-8",
    ghost:    "rounded-xl border-2 bg-transparent",
    elevated: "rounded-xl shadow-2xl",
  };
  const btnClass = btnClasses[buttonStyle] || btnClasses.soft;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        backdropFilter: "blur(12px)",
        transition: "all 0.5s cubic-bezier(0.34,1.2,0.64,1)",
        transform: visible ? (hovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(40px) scale(0.96)",
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? `0 32px 80px -16px ${accent}50, 0 0 0 1px ${accent}30` : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 260, background: `linear-gradient(135deg, ${accent}15, rgba(0,0,0,0.4))` }}>
        {product.image && !imgError ? (
          <img
            src={product.image} alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            style={{ transition: "transform 0.7s cubic-bezier(0.34,1,0.64,1)", transform: hovered ? "scale(1.12)" : "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>
            {nicheEmoji[product.name] || "📦"}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />

        {/* Stock badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 text-xs font-black rounded-full" style={{ background: "#f59e0b22", border: "1px solid #f59e0b60", color: "#fbbf24" }}>
            Only {product.stock} left
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <span className="text-white/60 font-black text-lg tracking-widest uppercase">Sold Out</span>
          </div>
        )}

        {/* Price over image */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-white font-black text-xl leading-none">{Number(product.price).toLocaleString()} <span className="text-white/60 text-sm font-bold">DA</span></p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-black text-base leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-white/40 text-xs mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>

        <button
          onClick={() => !outOfStock && onAdd(product)}
          disabled={outOfStock}
          className={`relative mt-auto w-full py-3 text-sm font-black tracking-wide overflow-hidden cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ${btnClass}`}
          style={{
            background: added
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : buttonStyle === "ghost"
              ? "transparent"
              : `linear-gradient(135deg, ${accent}, ${accent}bb)`,
            color: "white",
            borderColor: buttonStyle === "ghost" ? accent : "transparent",
            boxShadow: added ? "0 4px 20px #22c55e50" : `0 4px 20px ${accent}40`,
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {added ? (
              <><span>✓</span> Added to Cart</>
            ) : (
              <><span>+</span> Add to Cart</>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

/* ─── Checkout Modal ─── */
const CheckoutModal = ({ cart, store, onClose, onSuccess }:
  { cart: CartItem[]; store: StoreData; onClose: () => void; onSuccess: () => void }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const ac = store.accent_color || "#E87722";
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = async () => {
    if (!form.name || !form.email || !form.phone) { setErrors({ general: "Please fill all required fields." }); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store: store.id, customer_name: form.name, customer_email: form.email, customer_phone: form.phone, address: form.address, items: cart.map(i => ({ product: i.id, quantity: i.qty })) }),
      });
      if (!res.ok) { const d = await res.json(); setErrors(d); return; }
      onSuccess();
    } catch { setErrors({ general: "Network error. Please try again." }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-lg overflow-hidden"
        style={{ background: "linear-gradient(145deg,#0f0f0f,#1a1a1a)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${ac}, transparent)` }} />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>✕</button>

        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-white font-black text-2xl">Checkout</h3>
            <p className="text-white/40 text-sm mt-1">{cart.reduce((s,i)=>s+i.qty,0)} items · <span className="font-black" style={{color:ac}}>{total.toLocaleString()} DA</span></p>
          </div>

          {/* Order summary */}
          <div className="mb-6 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-white/70 text-sm">{item.name} <span className="text-white/30">×{item.qty}</span></span>
                <span className="text-white font-bold text-sm">{(item.price * item.qty).toLocaleString()} DA</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-1">
              <span className="text-white font-black">Total</span>
              <span className="font-black text-xl" style={{ color: ac }}>{total.toLocaleString()} DA</span>
            </div>
          </div>

          {errors.general && <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-xs font-semibold" style={{ background: "#ef444415", border: "1px solid #ef444430" }}>{errors.general}</div>}

          <div className="flex flex-col gap-4">
            {[
              { k: "name",    label: "Full Name *",         ph: "Ahmed Benali",           icon: "👤" },
              { k: "email",   label: "Email Address *",     ph: "ahmed@example.com",      icon: "✉️" },
              { k: "phone",   label: "Phone Number *",      ph: "0555 123 456",           icon: "📞" },
              { k: "address", label: "Delivery Address",    ph: "Rue Didouche, Alger",    icon: "📍" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs font-black tracking-widest uppercase mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">{f.icon}</span>
                  <input
                    type="text" value={(form as any)[f.k]}
                    onChange={e => setForm(fm => ({ ...fm, [f.k]: e.target.value }))}
                    onFocus={() => setFocused(f.k)} onBlur={() => setFocused(null)}
                    placeholder={f.ph}
                    className="w-full pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none"
                    style={{
                      background: focused === f.k ? `${ac}10` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${focused === f.k ? ac : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 14, transition: "all 0.25s ease",
                      boxShadow: focused === f.k ? `0 0 0 3px ${ac}18` : "none",
                    }}
                  />
                </div>
                {(errors as any)[f.k] && <p className="text-red-400 text-xs mt-1">⚠ {(errors as any)[f.k]}</p>}
              </div>
            ))}

            <button
              onClick={handleOrder} disabled={loading}
              className="w-full py-4 font-black text-white text-base tracking-wide cursor-pointer active:scale-95 transition-all duration-300 mt-2 rounded-2xl disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, boxShadow: `0 12px 40px ${ac}50` }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Placing Order...
                </span>
              ) : "Place Order ✦"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Storefront ─── */
const PublicStorefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore]       = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [addedId, setAddedId]   = useState<number | null>(null);
  const [search, setSearch]     = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/stores/?slug=${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        const s = (data.results ?? data)[0];
        if (!s || !s.is_live) { setNotFound(true); return; }
        setStore(s);
        const pRes = await fetch(`${API_URL}/products/?store=${s.id}&is_active=true`);
        if (pRes.ok) { const pd = await pRes.json(); setProducts(pd.results ?? pd); }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const addToCart = (p: Product) => {
    setCart(c => c.find(i => i.id === p.id) ? c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, qty: 1 }]);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const filtered  = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const ac        = store?.accent_color || "#E87722";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}66)` }} />
          <div className="absolute inset-0 rounded-2xl animate-ping opacity-30" style={{ background: ac }} />
        </div>
        <p className="text-white/30 text-sm tracking-widest uppercase font-bold">Loading Store</p>
      </div>
    </div>
  );

  if (notFound || !store) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
      <div className="text-center">
        <p className="text-8xl mb-6">🏚️</p>
        <h1 className="text-white font-black text-3xl">Store Not Found</h1>
        <p className="text-white/30 mt-3 text-sm">This store doesn't exist or is currently offline.</p>
      </div>
    </div>
  );

  if (orderDone) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
      <div className="text-center flex flex-col items-center gap-6 max-w-sm px-4">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-3xl" style={{ background: `linear-gradient(135deg, ${ac}, ${ac}66)`, animation: "pulse 2s infinite" }} />
          <div className="absolute inset-0 rounded-3xl flex items-center justify-center text-5xl">🎉</div>
        </div>
        <div>
          <h2 className="text-white font-black text-3xl">Order Confirmed!</h2>
          <p className="text-white/40 mt-2 leading-relaxed">Thank you for shopping at <span className="font-black" style={{ color: ac }}>{store.name}</span>. We'll be in touch soon.</p>
        </div>
        <button
          onClick={() => { setOrderDone(false); setCart([]); }}
          className="px-8 py-3.5 rounded-full font-black text-white tracking-wide cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, boxShadow: `0 8px 32px ${ac}50` }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
        @keyframes heroReveal { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cartPop    { 0%,100% { transform:scale(1); } 50% { transform:scale(1.3); } }
        @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .hero-text { animation: heroReveal 0.9s cubic-bezier(0.34,1.1,0.64,1) both; }
        .hero-sub  { animation: heroReveal 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.15s both; }
        .hero-btn  { animation: heroReveal 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.3s both; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#111; } ::-webkit-scrollbar-thumb { background:${ac}66; border-radius:99px; }
      `}</style>

      <div style={{ background: "#070707", minHeight: "100vh", color: "white" }}>

        {/* ── Navbar ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-500"
          style={{
            height: scrolled ? 64 : 80,
            background: scrolled ? "rgba(7,7,7,0.95)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden text-xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ac}, ${ac}88)`, boxShadow: `0 4px 20px ${ac}50` }}
            >
              {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : nicheEmoji[store.niche] || "🏪"}
            </div>
            <div>
              <p className="text-white font-black text-base leading-none" style={{ fontFamily: "Syne, sans-serif" }}>{store.name}</p>
              <p className="text-white/30 text-xs capitalize">{store.niche}</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-10">
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">⌕</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  boxShadow: search ? `0 0 0 2px ${ac}30` : "none",
                  borderColor: search ? ac : "rgba(255,255,255,0.1)",
                }}
              />
            </div>
          </div>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2.5 px-5 py-2.5 font-black text-white text-sm cursor-pointer active:scale-95 transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, borderRadius: 14, boxShadow: `0 4px 20px ${ac}40` }}
          >
            <span style={{ animation: addedId ? "cartPop 0.4s ease" : "none" }}>🛒</span>
            <span className="hidden sm:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: "#ef4444", border: "2px solid #070707" }}>
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
          {/* BG mesh */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${ac}22 0%, transparent 70%)` }} />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />

          {/* Floating orbs */}
          <div className="absolute top-20 right-20 h-80 w-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: ac, animation: "pulse 4s infinite" }} />
          <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: ac, animation: "pulse 6s 1s infinite" }} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-20 w-full">
            <div className="max-w-2xl">
              {store.logo_url && (
                <div className="mb-8 hero-btn">
                  <img src={store.logo_url} alt="logo" className="h-20 w-20 rounded-3xl object-cover shadow-2xl" style={{ boxShadow: `0 16px 48px ${ac}50` }} />
                </div>
              )}
              <div className="flex items-center gap-3 mb-5 hero-btn">
                <div className="h-px w-8" style={{ background: ac }} />
                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: ac }}>{store.niche} Store</span>
              </div>
              <h1 className="font-black leading-none mb-4 hero-text" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}>
                {store.name}
              </h1>
              {store.description && (
                <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-8 hero-sub" style={{ fontWeight: 300 }}>{store.description}</p>
              )}
              <div className="flex items-center gap-4 hero-btn">
                <button
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, borderRadius: 16, boxShadow: `0 12px 40px ${ac}50`, fontSize: 15 }}
                >
                  Shop Now ↓
                </button>
                <div className="flex items-center gap-2 text-white/30 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  {products.length} Products
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <div className="md:hidden px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
          />
        </div>

        {/* ── Products section ── */}
        <div id="products" className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: ac }}>Our Collection</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}>
                All Products
              </h2>
            </div>
            <p className="text-white/30 text-sm hidden md:block">{filtered.length} items</p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <span className="text-6xl opacity-20">📦</span>
              <p className="text-white/20 font-black text-xl">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} accent={ac} buttonStyle={store.button_style || "soft"} onAdd={addToCart} addedId={addedId} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="py-12 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-white/20 text-xs tracking-widest uppercase">
            {store.name} · Powered by <span style={{ color: ac }} className="font-black">Bazario</span>
          </p>
        </div>
      </div>

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
          <div
            className="relative h-full w-full max-w-md flex flex-col"
            style={{ background: "linear-gradient(180deg,#111,#0a0a0a)", borderLeft: "1px solid rgba(255,255,255,0.08)", animation: "slideInRight 0.4s cubic-bezier(0.34,1.1,0.64,1)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${ac}, transparent)` }} />

            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>Your Cart</p>
                {cartCount > 0 && <p className="text-white/30 text-xs mt-0.5">{cartCount} item{cartCount > 1 ? "s" : ""}</p>}
              </div>
              <button onClick={() => setCartOpen(false)} className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all text-white/40 hover:text-white" style={{ background: "rgba(255,255,255,0.08)" }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <span className="text-5xl opacity-20">🛒</span>
                  <p className="text-white/20 font-black">Your cart is empty</p>
                  <p className="text-white/10 text-sm">Add some products to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl" style={{ background: `${ac}20` }}>
                        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : nicheEmoji[store.niche] || "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.name}</p>
                        <p className="text-sm font-black mt-0.5" style={{ color: ac }}>{(item.price * item.qty).toLocaleString()} DA</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white cursor-pointer font-black" style={{ background: "rgba(255,255,255,0.1)" }}>−</button>
                        <span className="text-white font-black text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-white cursor-pointer font-black" style={{ background: ac }}>+</button>
                        <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                          className="ml-1 text-white/20 hover:text-red-400 cursor-pointer transition-colors text-sm">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-white/60 font-bold">Total</span>
                  <span className="font-black text-2xl" style={{ color: ac, fontFamily: "Syne, sans-serif" }}>{cartTotal.toLocaleString()} DA</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckout(true); }}
                  className="w-full py-4 rounded-2xl font-black text-white tracking-wide cursor-pointer active:scale-95 transition-all text-base"
                  style={{ background: `linear-gradient(135deg, ${ac}, ${ac}aa)`, boxShadow: `0 12px 40px ${ac}50` }}
                >
                  Checkout ✦
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {checkout && (
        <CheckoutModal cart={cart} store={store} onClose={() => setCheckout(false)} onSuccess={() => { setCheckout(false); setOrderDone(true); }} />
      )}
    </>
  );
};

export default PublicStorefront;