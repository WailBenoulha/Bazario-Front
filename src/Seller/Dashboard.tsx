import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  BsArrowUpRight, BsArrowDownRight, BsChevronRight, BsCreditCard,
  BsBoxSeam, BsPeopleFill, BsGraphUp, BsLightningChargeFill,
  BsStarFill, BsClockFill,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { type DashboardStats, type Order, statusColors, API_URL, authFetch } from "./sellerTypes";

interface Props {
  stats: DashboardStats | null;
  orders: Order[];
  storeName: string;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a0f05] border border-[#E87722]/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/50">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-black text-sm" style={{ color: p.color || "#E87722" }}>
          {p.value?.toLocaleString()} DA
        </p>
      ))}
    </div>
  );
};

// ── Animated Counter ───────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!value || animated) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setAnimated(true);
      const duration = 1200;
      const steps = 60;
      const step = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= value) { setDisplay(value); clearInterval(timer); }
        else setDisplay(Math.floor(current));
      }, duration / steps);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
};

// ── Mini sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data.map((v, i) => ({ v, i }))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string; numericValue: number;
  change: string; up: boolean; color: string;
  icon: React.ReactNode; sparkData: number[];
}
const StatCard = ({ label, numericValue, change, up, color, icon, sparkData }: StatCardProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col gap-3 p-5 bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-default"
      style={{
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: hovered ? `0 20px 50px -10px ${color}30, 0 4px 15px -4px ${color}15` : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
      }}
    >
      {/* Top glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.3s ease",
        }}
      />
      {/* BG orb */}
      <div
        className="absolute -top-8 -right-8 h-32 w-32 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: color, opacity: hovered ? 0.14 : 0.07, transition: "opacity 0.4s" }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${color}18`, color, transition: "transform 0.3s", transform: hovered ? "scale(1.1)" : "scale(1)" }}
        >
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
          {up ? <BsArrowUpRight className="h-3 w-3" /> : <BsArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>

      <div className="relative">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-900 tabular-nums">
          <AnimatedNumber value={numericValue} />
        </p>
      </div>

      <div className="relative -mx-1 -mb-1">
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = ({ stats, orders, storeName }: Props) => {
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [analytics,    setAnalytics]    = useState<any>(null);
  const [products,     setProducts]     = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          authFetch(`${API_URL}/orders/analytics/`),
          authFetch(`${API_URL}/products/?page_size=5`),
        ]);
        if (aRes.ok) setAnalytics(await aRes.json());
        if (pRes.ok) { const d = await pRes.json(); setProducts(d.results ?? d); }
      } catch { /* silent */ } finally { setLoadingExtra(false); }
    })();
  }, []);

  // Fallback / live data for charts
  const monthlyRevenue = analytics?.monthly_revenue ?? [
    { month: "Sep", revenue: 42000 }, { month: "Oct", revenue: 58000 },
    { month: "Nov", revenue: 51000 }, { month: "Dec", revenue: 94000 },
    { month: "Jan", revenue: 71000 }, { month: "Feb", revenue: 89000 },
    { month: "Mar", revenue: stats?.total_revenue ?? 124500 },
  ];
  const weeklyOrders = analytics?.weekly_orders ?? [
    { day: "Mon", orders: 12 }, { day: "Tue", orders: 19 }, { day: "Wed", orders: 8 },
    { day: "Thu", orders: 24 }, { day: "Fri", orders: 31 }, { day: "Sat", orders: 27 },
    { day: "Sun", orders: 15 },
  ];
  const ordersByStatus = [
    { name: "Delivered",  value: orders.filter(o => o.status === "delivered").length  || 62, color: "#22c55e" },
    { name: "Pending",    value: orders.filter(o => o.status === "pending").length    || 18, color: "#f59e0b" },
    { name: "Processing", value: orders.filter(o => o.status === "processing").length || 13, color: "#2EA7F2" },
    { name: "Cancelled",  value: orders.filter(o => o.status === "cancelled").length  || 7,  color: "#ef4444" },
  ].filter(s => s.value > 0);

  const statCards: StatCardProps[] = [
    {
      label: "Total Revenue",  numericValue: stats?.total_revenue ?? 0,
      value:  `${(stats?.total_revenue ?? 0).toLocaleString()} DA`,
      change: "+12.5%", up: true,  color: "#E87722",
      icon: <BsGraphUp className="h-4 w-4" />,
      sparkData: monthlyRevenue.map((d: any) => d.revenue),
    },
    {
      label: "Total Orders",   numericValue: stats?.total_orders ?? 0,
      value:  String(stats?.total_orders ?? 0),
      change: "+8.2%",  up: true,  color: "#2EA7F2",
      icon: <BsCreditCard className="h-4 w-4" />,
      sparkData: weeklyOrders.map((d: any) => d.orders),
    },
    {
      label: "Customers",      numericValue: stats?.total_customers ?? 0,
      value:  String(stats?.total_customers ?? 0),
      change: "+3.1%",  up: true,  color: "#F4C21F",
      icon: <BsPeopleFill className="h-4 w-4" />,
      sparkData: [120, 145, 138, 162, 175, 168, stats?.total_customers ?? 204],
    },
    {
      label: "Pending Orders", numericValue: stats?.pending ?? 0,
      value:  String(stats?.pending ?? 0),
      change: stats?.pending ? "Needs action" : "All clear",
      up: false, color: "#a855f7",
      icon: <BsClockFill className="h-4 w-4" />,
      sparkData: [3, 7, 5, 9, 4, 8, stats?.pending ?? 6],
    },
  ];

  const demoProducts = [
    { id: 1, name: "UrbanThread Jacket", price: 4500, stock: 12 },
    { id: 2, name: "GlowUp Serum Kit",   price: 2800, stock: 5  },
    { id: 3, name: "TechNest Earbuds",   price: 6200, stock: 28 },
    { id: 4, name: "ProZone Sneakers",   price: 8900, stock: 7  },
    { id: 5, name: "Savoria Honey Box",  price: 1500, stock: 41 },
  ];
  const displayProducts = products.length > 0 ? products.slice(0, 5) : demoProducts;
  const maxPrice = Math.max(...displayProducts.map(p => p.price), 1);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Welcome ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
        <div
          className="absolute -left-12 -top-12 h-52 w-52 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #E87722, #F4C21F)", animation: "pulse 4s ease-in-out infinite" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <HiSparkles className="h-4 w-4 text-[#F4C21F]" />
            <p className="text-gray-400 text-sm font-medium">{greeting} 👋</p>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Welcome back,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #E87722 0%, #F4C21F 50%, #E87722 100%)",
                backgroundSize: "200% auto",
                animation: "shimmer 3s linear infinite",
              }}
            >
              {user.username || "Seller"}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            Here's what's happening with{" "}
            <span className="text-gray-700 font-semibold">{storeName || "your store"}</span> today.
          </p>
        </div>

        <div className="relative flex items-center gap-3 flex-wrap">
          {storeName && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-sm font-bold">Store is Live</span>
            </div>
          )}
          <button className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 overflow-hidden shadow-lg shadow-[#E87722]/25 transition-all duration-300">
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <BsBoxSeam className="h-4 w-4 relative z-10" />
            <span className="relative z-10">+ Add Product</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Charts row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue area chart — 2 cols */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 font-black text-lg">Revenue Trend</h3>
              <p className="text-gray-400 text-xs mt-0.5">Last 7 months · Algerian Dinar</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl">
              <BsArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 text-xs font-black">+18.4% MoM</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#E87722" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E87722" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#E87722" />
                  <stop offset="100%" stopColor="#F4C21F" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="revenue"
                stroke="url(#revLine)" strokeWidth={3}
                fill="url(#revGrad)" dot={false}
                activeDot={{ r: 6, fill: "#E87722", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status donut */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 flex flex-col">
          <div className="mb-4">
            <h3 className="text-gray-900 font-black text-lg">Order Status</h3>
            <p className="text-gray-400 text-xs mt-0.5">All-time breakdown</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={ordersByStatus} cx="50%" cy="50%"
                    innerRadius={54} outerRadius={80}
                    paddingAngle={3} dataKey="value" strokeWidth={0}
                  >
                    {ordersByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: any, n: any) => [`${v} orders`, n]}
                    contentStyle={{
                      background: "#1a0f05", border: "1px solid rgba(232,119,34,0.3)",
                      borderRadius: "12px", color: "#fff", fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900">{orders.length || 100}</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 w-full">
              {ordersByStatus.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-500 text-xs">{s.name}</span>
                  <span className="text-gray-900 text-xs font-black ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Weekly orders bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 font-black text-lg">This Week</h3>
              <p className="text-gray-400 text-xs mt-0.5">Daily orders volume</p>
            </div>
            <div className="p-2 bg-[#2EA7F2]/10 rounded-xl">
              <BsLightningChargeFill className="h-4 w-4 text-[#2EA7F2]" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={weeklyOrders} margin={{ top: 0, right: 0, left: -26, bottom: 0 }} barCategoryGap="30%">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2EA7F2" stopOpacity={1}   />
                  <stop offset="100%" stopColor="#2EA7F2" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: any) => [`${v} orders`]}
                contentStyle={{ background: "#1a0f05", border: "1px solid rgba(46,167,242,0.3)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                cursor={{ fill: "rgba(46,167,242,0.05)" }}
              />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders table — 2 cols */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h3 className="text-gray-900 font-black text-lg">Recent Orders</h3>
              <p className="text-gray-400 text-xs mt-0.5">Latest 5 transactions</p>
            </div>
            <button className="text-[#E87722] text-sm font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all">
              View all <BsChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3 px-6 py-3 bg-gray-50/70 border-b border-gray-100">
            {["Order", "Customer", "Amount", "Status", "Date"].map((h) => (
              <span key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <BsCreditCard className="h-8 w-8 text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-bold text-sm">No orders yet</p>
                <p className="text-gray-400 text-xs mt-0.5">Orders will appear here once received</p>
              </div>
            </div>
          ) : (
            orders.slice(0, 5).map((order, i) => (
              <div
                key={order.id}
                className={`grid grid-cols-5 gap-3 px-6 py-3.5 items-center hover:bg-gradient-to-r hover:from-orange-50/60 hover:to-transparent transition-all duration-200 cursor-pointer
                  ${i < Math.min(orders.length, 5) - 1 ? "border-b border-gray-50" : ""}`}
              >
                <span className="text-[#E87722] text-sm font-black">#{String(order.id).padStart(3, "0")}</span>
                <span className="text-gray-800 text-sm font-semibold truncate">{order.customer_name}</span>
                <span className="text-gray-900 text-sm font-black tabular-nums">
                  {Number(order.total).toLocaleString()}{" "}
                  <span className="text-gray-400 font-normal text-xs">DA</span>
                </span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border w-fit capitalize ${statusColors[order.status] || statusColors["pending"]}`}>
                  {order.status}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Top Products ─────────────────────────────────────────── */}
      {!loadingExtra && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h3 className="text-gray-900 font-black text-lg">Top Products</h3>
              <p className="text-gray-400 text-xs mt-0.5">By price · live from your catalog</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-xl">
              <BsStarFill className="h-4 w-4 text-[#F4C21F]" />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {displayProducts.map((product: any, i: number) => {
              const barWidth    = Math.round((product.price / maxPrice) * 100);
              const isLowStock  = (product.stock ?? 99) <= 5;
              const rankColors  = [
                "linear-gradient(135deg,#E87722,#F4C21F)",
                "linear-gradient(135deg,#9ca3af,#d1d5db)",
                "linear-gradient(135deg,#d97706,#fbbf24)",
              ];
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/40 transition-colors duration-200 cursor-pointer"
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: rankColors[i] ?? "#f3f4f6", color: i < 3 ? "white" : "#6b7280" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-gray-800 text-sm font-bold truncate">{product.name}</span>
                      <span className="text-gray-900 text-sm font-black tabular-nums ml-4 shrink-0">
                        {Number(product.price).toLocaleString()} DA
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          background: i === 0 ? "linear-gradient(to right,#E87722,#F4C21F)" : "linear-gradient(to right,#d1d5db,#9ca3af)",
                          transition: "width 1.2s cubic-bezier(0.34,1.1,0.64,1)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0
                      ${isLowStock ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-500"}`}
                  >
                    <BsBoxSeam className="h-3 w-3" />
                    {product.stock ?? "—"}
                    {isLowStock && <span className="text-[10px]">⚠</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
