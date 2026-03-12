import { useState, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import NavSeller from "./NavSeller";
import Sidebar, { menuItems } from "./Sidebar";
import Dashboard from "./Dashboard";
import StoresPage from "./StoresPage";
import PlanPickerModal from "./PlanPickerModal";
import CreateStoreModal from "./CreateStoreModal";
import StoreEditor from "./Storeeditor";
import { API_URL, authFetch, type Store, type Order, type Product, type DashboardStats } from "./sellerTypes";

// ── Inline tab pages (Orders / Products / Customers / Analytics / Settings) ──

const OrdersPage = ({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) => {
  const [updating, setUpdating] = useState<number | null>(null);
  const STATUS = ["pending","processing","delivered","cancelled"];
  const SC: Record<string,{bg:string;text:string}> = {
    pending:{bg:"#f59e0b15",text:"#d97706"}, processing:{bg:"#3b82f615",text:"#2563eb"},
    delivered:{bg:"#22c55e15",text:"#16a34a"}, cancelled:{bg:"#ef444415",text:"#dc2626"},
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    await authFetch(`${API_URL}/orders/${id}/update_status/`, { method:"PATCH", body: JSON.stringify({ status }) });
    setUpdating(null);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Orders</h2>
        <p className="text-gray-400 text-sm mt-0.5">{orders.length} total orders across all stores</p>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 gap-4">
          <span className="text-5xl opacity-20">🧾</span>
          <p className="text-gray-400 font-black">No orders yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const sc = SC[order.status] || SC.pending;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0" style={{ background:"#E8772215", color:"#E87722" }}>
                      #{String(order.id).padStart(2,"0")}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{order.customer_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-gray-400 text-xs">{order.customer_email}</span>
                        {order.customer_phone && <span className="text-gray-400 text-xs">· 📞 {order.customer_phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-gray-900">{Number(order.total).toLocaleString()} <span className="text-gray-400 font-normal text-xs">DA</span></span>
                    <span className="px-3 py-1 rounded-full text-xs font-black capitalize" style={{ background: sc.bg, color: sc.text }}>{order.status}</span>
                    <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString("fr-DZ")}</span>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E87722] cursor-pointer bg-white transition-all disabled:opacity-50"
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="font-semibold">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-black text-gray-700">{Number(item.unit_price * item.quantity).toLocaleString()} DA</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
      case "stores":     return <StoresPage stores={stores} onRefresh={fetchData} onNewStore={handleNewStore} />;
      case "orders":     return <OrdersPage orders={orders} onRefresh={fetchData} />;
      case "products":   return <ProductsPage stores={stores} />;
      case "customers":  return <CustomersPage orders={orders} />;
      case "analytics":  return <AnalyticsPage orders={orders} stores={stores} />;
      case "settings":   return <SettingsPage />;
      default:           return <Dashboard stats={dashStats} orders={orders} storeName={stores[0]?.name ?? ""} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] flex flex-col">
      <NavSeller />
      {showPlanPicker  && <PlanPickerModal  onSelect={handlePlanSelect}  onClose={()=>setShowPlanPicker(false)} />}
      {showCreateStore && <CreateStoreModal plan={selectedPlan} onCreated={fetchData} onClose={()=>setShowCreateStore(false)} />}

      <div className="flex flex-1 pt-[72px]">
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={()=>setSidebarOpen(false)} />}
        <Sidebar activeMenu={activeMenu} sidebarOpen={sidebarOpen} stores={stores} dashStats={dashStats} onMenuClick={id=>{setActiveMenu(id);setSidebarOpen(false);}} onNewStore={handleNewStore} />
        <main className="flex-1 lg:ml-64 p-6 md:p-8 min-h-screen">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 transition-all cursor-pointer text-sm font-semibold shadow-sm">
            <HiMenu className="h-5 w-5" /> Menu
          </button>
          <div className="fixed inset-0 opacity-[0.3] pointer-events-none z-0" style={{ backgroundImage:`radial-gradient(circle, #d1d5db 1px, transparent 1px)`, backgroundSize:"28px 28px" }} />
          <div className="relative z-10">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default SellerMain;